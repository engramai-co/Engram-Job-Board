import { useState } from "react";
import { Button, FileButton, Group, Modal, Text } from "@mantine/core";
import { Download, Upload } from "lucide-react";
import { useProgress, workspaceKey } from "../ProgressContext";
import { parseWorkspace } from "../workspace-store";

export function WorkspaceBackup() {
  const progress = useProgress();
  const [pending, setPending] = useState<{raw: string; count: number} | null>(null), [error, setError] = useState("");
  const exportFile = () => {
    try {
      const url = URL.createObjectURL(new Blob([progress.exportBackup()], {type: "application/json"}));
      const link = document.createElement("a");
      link.href = url; link.download = "engram-job-board-edits.json"; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000); setError("");
    } catch { setError("导出失败，请检查浏览器存储权限。"); }
  };
  const readFile = async (file: File | null) => {
    if (!file) return;
    try {
      if (file.size > 5_000_000) throw new Error("备份太大，请选择本看板导出的 JSON 文件。");
      const raw = await file.text(), parsed = parseWorkspace(raw, workspaceKey);
      setPending({raw, count: parsed.entries.length}); setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "备份无法读取。"); }
  };
  return <div>
    <Group gap="xs"><Button variant="subtle" size="compact-sm" leftSection={<Download size={14}/>} onClick={exportFile} disabled={!progress.ready}>导出本机记录</Button>
      <FileButton accept="application/json,.json" onChange={file => void readFile(file)}>{props => <Button {...props} variant="subtle" size="compact-sm" leftSection={<Upload size={14}/>} disabled={!progress.ready || !!progress.busyId}>恢复备份</Button>}</FileButton></Group>
    {error && <Text c="red" size="sm" role="alert">{error}</Text>}
    <Modal opened={!!pending} onClose={() => !progress.busyId && setPending(null)} title="增量恢复本机记录" centered closeButtonProps={{"aria-label":"关闭恢复备份"}}>
      <Text size="sm">文件包含 {pending?.count} 条编辑、面试或活动记录。只添加尚未存在的记录；相同 ID 的现有记录不会覆盖。源数据与评分仍来自你自己的本地数据文件。</Text>
      <Group justify="flex-end" mt="lg"><Button variant="default" disabled={!!progress.busyId} onClick={() => setPending(null)}>取消</Button><Button loading={progress.busyId === "backup"} onClick={async () => {if (pending && await progress.importBackup(pending.raw)) setPending(null);}}>确认恢复</Button></Group>
    </Modal>
  </div>;
}
