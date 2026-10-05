"""Verifica o ciclo do Compose sem acessar Docker real."""
import json
import os
from pathlib import Path
import shutil
import signal
import subprocess
import tempfile
import time
import unittest

REPOSITORY = Path(__file__).resolve().parents[1]
DOCKER = r'''#!/usr/bin/env python3
import json
import os
from pathlib import Path
import signal
import sys
import time
root = Path(os.environ['TEST_PROJECT'])
args = sys.argv[1:]
with (root / 'calls').open('a') as stream:
    stream.write(json.dumps(args) + '\n')
if args == ['info']:
    sys.exit(1 if os.environ.get('TEST_DAEMON_FAIL') else 0)
if 'up' in args:
    if os.environ.get('TEST_UP_FAIL'):
        sys.exit(1)
    (root / 'ready').touch()
if 'logs' in args:
    signal.signal(signal.SIGINT, lambda *_: sys.exit(130))
    signal.signal(signal.SIGTERM, lambda *_: sys.exit(143))
    (root / 'following').touch()
    while True:
        time.sleep(0.1)
'''


class DemoLauncherTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='portal compose ')
        self.root = Path(self.temp.name)
        (self.root / 'bin').mkdir()
        (self.root / 'scripts').mkdir()
        shutil.copy2(REPOSITORY / 'iniciar.sh', self.root / 'iniciar.sh')
        (self.root / 'compose.yaml').write_text('services: {}\n')
        (self.root / 'scripts' / 'iniciar-local.sh').write_text('printf "local %s\\n" "$*"\n')
        mock = self.root / 'bin' / 'docker'
        mock.write_text(DOCKER)
        mock.chmod(0o755)
        self.env = os.environ | {'TEST_PROJECT': str(self.root),
                                 'PATH': str(self.root / 'bin') + ':' + os.environ['PATH']}
        self.processes = []

    def tearDown(self):
        for process in self.processes:
            if process.poll() is None:
                os.killpg(process.pid, signal.SIGTERM)
            process.wait(timeout=10)
            for stream in [process.stdout, process.stderr]:
                if stream:
                    stream.close()
        self.temp.cleanup()

    def calls(self):
        p = self.root / 'calls'
        return [json.loads(line) for line in p.read_text().splitlines()] if p.exists() else []

    def run_launcher(self, *args, **extra):
        return subprocess.run(['bash', str(self.root / 'iniciar.sh'), *args],
                              cwd='/tmp', env=self.env | extra, capture_output=True,
                              text=True, timeout=10)

    def test_check_validates_compose_and_daemon_without_starting(self):
        result = self.run_launcher('--check')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(len(self.calls()), 2)
        self.assertIn('config', self.calls()[0])
        self.assertEqual(self.calls()[0][1:5], ['--project-directory', str(self.root), '-f', str(self.root / 'compose.yaml')])
        self.assertFalse((self.root / 'ready').exists())

    def test_unavailable_daemon_does_not_start_or_stop_services(self):
        result = self.run_launcher('--no-browser', TEST_DAEMON_FAIL='1')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Docker não está acessível', result.stderr)
        self.assertFalse(any('up' in call or 'stop' in call for call in self.calls()))

    def test_start_failure_stops_partial_stack(self):
        result = self.run_launcher('--no-browser', TEST_UP_FAIL='1')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('stop', self.calls()[-1])

    def test_ctrl_c_stops_stack_without_deleting_volume(self):
        process = subprocess.Popen(['bash', str(self.root / 'iniciar.sh'), '--no-browser'],
                                   cwd='/tmp', env=self.env, stdout=subprocess.PIPE,
                                   stderr=subprocess.PIPE, text=True, start_new_session=True)
        self.processes.append(process)
        deadline = time.monotonic() + 5
        while not (self.root / 'following').exists() and time.monotonic() < deadline:
            time.sleep(0.05)
        self.assertTrue((self.root / 'following').exists())
        os.killpg(process.pid, signal.SIGINT)
        self.assertEqual(process.wait(timeout=10), 130)
        self.assertIn('stop', self.calls()[-1])
        self.assertFalse(any('down' in call or '--volumes' in call for call in self.calls()))

    def test_reinstall_builds_without_cache(self):
        result = self.run_launcher('--reinstall', '--no-browser', TEST_UP_FAIL='1')
        self.assertNotEqual(result.returncode, 0)
        self.assertTrue(any(call[-2:] == ['build', '--no-cache'] for call in self.calls()))

    def test_local_option_delegates_without_docker(self):
        result = self.run_launcher('--local', '--check')
        self.assertEqual(result.returncode, 0)
        self.assertIn('local --check', result.stdout)
        self.assertEqual(self.calls(), [])


if __name__ == '__main__':
    unittest.main()
