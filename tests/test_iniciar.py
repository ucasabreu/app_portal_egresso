"""Testa o inicializador com serviços simulados, sem rede ou banco real."""
import os
from pathlib import Path
import shutil
import signal
import subprocess
import tempfile
import threading
import time
import unittest


REPOSITORY = Path(__file__).resolve().parents[1]
FAKE_TOOL = r'''#!/usr/bin/env python3
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import time

root = Path(os.environ['TEST_PROJECT'])
tool = Path(sys.argv[0]).name
args = sys.argv[1:]

def event(name):
    with (root / 'events').open('a') as stream:
        stream.write(name + '\n')

def service(name):
    event(name)
    child = subprocess.Popen(['sleep', '600'])
    with (root / 'pids').open('a') as stream:
        stream.write(f'{os.getpid()}\n{child.pid}\n')
    def stop(*_):
        child.terminate()
        child.wait()
        sys.exit(0)
    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)
    (root / (name + '.ready')).touch()
    print(name + ' iniciado', flush=True)
    while True:
        time.sleep(0.1)

if tool == 'java':
    print('java version "21"')
elif tool == 'javac':
    print('javac 21.0.6')
elif tool == 'node':
    if '-p' in args:
        print('linux')
    elif '-e' in args:
        sys.exit(0 if (root / 'installed').exists() else 1)
    else:
        sys.stdin.read()
        sys.exit(1 if os.environ.get('TEST_PORT_BUSY') else 0)
elif tool == 'npm':
    if args[0] == 'ci':
        event('install')
        if os.environ.get('TEST_INSTALL_FAIL'):
            sys.exit(1)
        (root / 'installed').touch()
    else:
        service('frontend')
elif tool == 'curl':
    name = 'backend' if '8080' in args[-1] else 'frontend'
    if not (root / (name + '.ready')).exists() or os.environ.get('TEST_TIMEOUT'):
        print('000', end='')
        sys.exit(7)
    print(os.environ.get('TEST_BACKEND_HTTP', '200') if name == 'backend' else '200', end='')
elif tool == 'fake-backend':
    if os.environ.get('TEST_BACKEND_FAIL'):
        sys.exit(1)
    event('env=' + os.environ.get('SPRING_DATASOURCE_USERNAME', ''))
    service('backend')
'''


class LauncherTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='portal launcher ')
        self.root = Path(self.temp.name)
        for directory in ['frontend', 'backend', 'bin', 'scripts']:
            (self.root / directory).mkdir()
        for name in ['scripts/iniciar-local.sh', '.env.example']:
            shutil.copy2(REPOSITORY / name, self.root / name)
        template = self.root / '.env.example'
        template.write_text(template.read_text().replace('TEMPO_INICIALIZACAO=180', 'TEMPO_INICIALIZACAO=2'))
        for name in ['package.json', 'package-lock.json']:
            (self.root / 'frontend' / name).write_text('{}')
        (self.root / 'backend' / 'mvnw').write_text('#!/bin/bash\nexec fake-backend\n')
        tool = self.root / 'bin' / 'fake-tool'
        tool.write_text(FAKE_TOOL)
        tool.chmod(0o755)
        for name in ['java', 'javac', 'node', 'npm', 'curl', 'fake-backend']:
            (self.root / 'bin' / name).symlink_to(tool)
        self.env = os.environ.copy()
        for name in ['JAVA_HOME', 'TEMPO_INICIALIZACAO', 'ABRIR_NAVEGADOR']:
            self.env.pop(name, None)
        self.env.update(PATH=str(self.root / 'bin') + ':' + self.env['PATH'],
                        TEST_PROJECT=str(self.root), TEMPO_INICIALIZACAO='2')
        self.processes = []

    def tearDown(self):
        for proc in self.processes:
            if proc.poll() is None:
                proc.terminate()
            try:
                proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                proc.kill()
                proc.wait()
            if proc.stdout:
                proc.stdout.close()
            if proc.stderr:
                proc.stderr.close()
        self.temp.cleanup()

    def run_launcher(self, *args, **extra):
        env = self.env | extra
        command = ['bash', str(self.root / 'scripts' / 'iniciar-local.sh'), *args]
        proc = subprocess.Popen(command, cwd='/tmp', env=env, stdout=subprocess.PIPE,
                                stderr=subprocess.PIPE, text=True)
        self.processes.append(proc)
        output, error = proc.communicate(timeout=15)
        return subprocess.CompletedProcess(command, proc.returncode, output, error)

    def start_launcher(self, **extra):
        proc = subprocess.Popen(['bash', str(self.root / 'scripts' / 'iniciar-local.sh'), '--no-browser'],
                                cwd='/tmp', env=self.env | extra,
                                stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                text=True)
        self.processes.append(proc)
        output = []
        def read_output():
            for line in proc.stdout:
                output.append(line)
        threading.Thread(target=read_output, daemon=True).start()
        deadline = time.monotonic() + 12
        while time.monotonic() < deadline:
            if 'Projeto disponível' in ''.join(output):
                return proc, output
            if proc.poll() is not None:
                self.fail('Inicialização falhou: ' + ''.join(output))
            time.sleep(0.05)
        self.fail('Inicialização não terminou: ' + ''.join(output))

    def assert_services_stopped(self):
        if not (self.root / 'pids').exists():
            return
        for pid in (self.root / 'pids').read_text().splitlines():
            with self.assertRaises(ProcessLookupError, msg='Processo órfão: ' + pid):
                os.kill(int(pid), 0)

    def test_check_does_not_create_configuration_or_start_services(self):
        (self.root / 'installed').touch()
        result = self.run_launcher('--check')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertFalse((self.root / '.env.local').exists())
        self.assertFalse((self.root / '.local-run').exists())
        self.assertFalse((self.root / 'events').exists())

    def test_busy_port_does_not_start_services(self):
        result = self.run_launcher('--check', TEST_PORT_BUSY='1')
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse((self.root / 'events').exists())

    def test_existing_crlf_configuration_empty_database_and_ctrl_c(self):
        configuration = b"SPRING_DATASOURCE_USERNAME='usuario_local'\r\nABRIR_NAVEGADOR=0\r\nTEMPO_INICIALIZACAO=5\r\n"
        (self.root / '.env.local').write_bytes(configuration)
        proc, _ = self.start_launcher(TEST_BACKEND_HTTP='400')
        events = (self.root / 'events').read_text().splitlines()
        self.assertEqual(events, ['install', 'env=usuario_local', 'backend', 'frontend'])
        self.assertEqual((self.root / '.env.local').read_bytes(), configuration)
        os.kill(proc.pid, signal.SIGINT)
        self.assertEqual(proc.wait(timeout=10), 130)
        self.assert_services_stopped()

    def test_second_start_reuses_dependencies_and_lock_prevents_duplicate(self):
        for index in range(2):
            proc, _ = self.start_launcher()
            duplicate = self.run_launcher('--no-browser')
            self.assertNotEqual(duplicate.returncode, 0)
            self.assertIn('Outro inicializador', duplicate.stderr)
            proc.terminate()
            self.assertEqual(proc.wait(timeout=10), 143)
            self.assert_services_stopped()
        self.assertEqual((self.root / 'events').read_text().splitlines().count('install'), 1)

    def test_install_failure_does_not_start_backend(self):
        result = self.run_launcher('--no-browser', TEST_INSTALL_FAIL='1')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('install.log', result.stderr)
        self.assertEqual((self.root / 'events').read_text().splitlines(), ['install'])

    def test_backend_exit_does_not_start_frontend(self):
        result = self.run_launcher('--no-browser', TEST_BACKEND_FAIL='1')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('backend.log', result.stderr)
        self.assertFalse((self.root / 'frontend.ready').exists())

    def test_database_error_and_timeout_stop_backend(self):
        for extra in [{'TEST_BACKEND_HTTP': '500'}, {'TEST_TIMEOUT': '1'}]:
            with self.subTest(extra=extra):
                result = self.run_launcher('--no-browser', **extra)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn('backend.log', result.stderr)
                self.assertFalse((self.root / 'frontend.ready').exists())
                self.assert_services_stopped()

    def test_frontend_exit_stops_backend(self):
        proc, _ = self.start_launcher()
        pids = (self.root / 'pids').read_text().splitlines()
        os.kill(int(pids[2]), signal.SIGTERM)
        self.assertEqual(proc.wait(timeout=10), 1)
        self.assert_services_stopped()


if __name__ == '__main__':
    unittest.main()
