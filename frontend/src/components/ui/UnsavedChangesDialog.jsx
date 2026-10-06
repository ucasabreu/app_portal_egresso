import ConfirmDialog from "./ConfirmDialog";

export default function UnsavedChangesDialog({ blocker, pending = false }) {
  return <ConfirmDialog open={blocker.state === "blocked"} pending={pending} pendingLabel="Concluindo gravação…" title="Sair sem salvar?" description="As alterações deste formulário ainda não foram salvas. Continue editando ou descarte os dados para sair." confirmLabel="Descartar e sair" onConfirm={() => blocker.proceed?.()} onCancel={() => blocker.reset?.()} />;
}
