import { createContext, useContext, useEffect, useState, type Context, type ReactNode } from 'react';
import { Alert, Anchor, Autocomplete, Badge, Button, Checkbox, Divider, Drawer, Group, Modal, NumberInput, Select, SimpleGrid, Stack, Tabs, Text, Textarea, TextInput } from '@mantine/core';
import { DateInput, TimeInput } from '@mantine/dates';
import { Archive, BookOpen, BriefcaseBusiness, Check, HardDrive, ExternalLink, MessageSquare, CalendarDays } from 'lucide-react';
import { useProgress } from '../ProgressContext';
import { data, displayLabel, safeExternalUrl } from '../lib';
import { contracts, jobFields, results, eventResults, scheduleFields, stages, validDate, type EntryKind, type JobFields, type ScheduleEntry, type ScheduleFields } from '../tracker-model';
import type { Stage } from '../types';
import { JDReferences } from './JDReferences';

interface Editor { id: string; kind: EntryKind; revision: number; archived: boolean; payload: JobFields | ScheduleFields; fresh: boolean }
interface Actions { openJob: (id?: string, stage?: Stage) => void; openSchedule: (kind: 'interview' | 'event', jobId?: string, date?: string, entry?: ScheduleEntry) => void }
const ActionsContext: Context<Actions | null> = import.meta.hot?.data.actionsContext ?? createContext<Actions | null>(null);
if (import.meta.hot) import.meta.hot.data.actionsContext = ActionsContext;
export function useWorkspaceActions() { const value = useContext(ActionsContext); if (!value) throw new Error('Missing workspace editors'); return value; }

export function WorkspaceEditors({ children }: { children: ReactNode }) {
  const progress = useProgress();
  const [editor, setEditor] = useState<Editor | null>(null);
  const openJob: Actions['openJob'] = (id, stage) => {
    progress.dismissNotice();
    const job = progress.allOpportunities.find(item => item.id === id), entry = progress.entries.find(item => item.id === id);
    if (id && !job) return;
    setEditor({ id: id || 'manual-' + crypto.randomUUID(), kind: 'job', revision: entry?.revision || 0, archived: entry?.archived || false, payload: { ...jobFields(job), ...(stage ? { stage } : {}) }, fresh: !id });
  };
  const openSchedule: Actions['openSchedule'] = (kind, jobId, date, entry) => {
    progress.dismissNotice();
    setEditor({ id: entry?.id || kind + '-' + crypto.randomUUID(), kind, revision: entry?.revision || 0, archived: entry?.archived || false, payload: { ...(entry?.payload || scheduleFields(jobId, date)) }, fresh: !entry });
  };
  return <ActionsContext.Provider value={{ openJob, openSchedule }}>{children}{editor && <RecordEditor key={editor.id} initial={editor} close={() => setEditor(null)}/>}</ActionsContext.Provider>;
}

function RecordEditor({ initial, close }: { initial: Editor; close: () => void }) {
  const progress = useProgress();
  const [payload, setPayload] = useState(initial.payload), [archived, setArchived] = useState(initial.archived);
  const [confirmClose, setConfirmClose] = useState(false), [attempted, setAttempted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<string | null>(initial.fresh ? 'job' : 'progress');
  const dirty = JSON.stringify(payload) !== JSON.stringify(initial.payload) || archived !== initial.archived;
  const saving = progress.busyId === initial.id;
  useEffect(() => {
    const prevent = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', prevent); return () => window.removeEventListener('beforeunload', prevent);
  }, [dirty]);
  const tryClose = () => { if (saving) return; if (dirty) setConfirmClose(true); else close(); };
  const update = (key: string, value: string | number) => { setPayload(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: '' })); };
  const job = payload as JobFields, schedule = payload as ScheduleFields;
  const original = data.opportunities.find(item => item.id === initial.id);
  const linked = progress.allOpportunities.find(item => item.id === schedule.jobId);
  const interviews = progress.entries.filter(entry => entry.kind === 'interview' && !entry.archived && 'jobId' in entry.payload && entry.payload.jobId === initial.id) as ScheduleEntry[];
  const title = initial.kind === 'job' ? (initial.fresh ? '新增岗位' : job.company) : initial.kind === 'interview' ? (initial.fresh ? '安排面试' : '编辑面试') : (initial.fresh ? '新增活动' : '编辑活动');
  const field = (label: string, key: string, value: string, required = false, maxLength = 500) => <TextInput label={label} name={key} withAsterisk={required} maxLength={maxLength} value={value} error={errors[key]} onChange={e => update(key, e.currentTarget.value)}/>;
  const date = (label: string, key: string, value: string, required = false) => <DateInput label={label} withAsterisk={required} value={value || null} valueFormat="YYYY-MM-DD" placeholder="选择日期" clearable={!required} onChange={v => update(key, v || '')} error={errors[key]} minDate="2000-01-01" maxDate="2100-12-31" popoverProps={{ withinPortal: true, zIndex: 410 }} leftSection={<CalendarDays size={15}/>}/>;
  const save = async () => {
    const next: Record<string, string> = {};
    if (initial.kind === 'job') {
      if (!job.company.trim()) next.company = '请填写公司名称';
      if (!job.role.trim()) next.role = '请填写职位名称';
      for (const key of ['appliedDate', 'followUp', 'deadline'] as const) if (job[key] && !validDate(job[key])) next[key] = '请输入有效日期';
      if (next.company || next.role) setTab('job');
    } else {
      if (!schedule.title.trim()) next.title = '请填写名称';
      if (!validDate(schedule.date)) next.date = '请选择日期';
      if (initial.kind === 'interview' && !schedule.jobId) next.jobId = '请选择对应岗位';
    }
    if (payload.url && !safeExternalUrl(payload.url)) { next.url = '请输入完整的 https:// 或 http:// 链接'; if (initial.kind === 'job') setTab('job'); }
    setErrors(next); setAttempted(true);
    if (Object.keys(next).length) return;
    if (await progress.saveEntry(initial.id, initial.kind, payload, initial.revision, archived)) close();
  };
  return <>
    <Drawer opened onClose={tryClose} title={title} classNames={{ content: 'ui-editor', body: 'ui-editor-body' }} closeOnClickOutside={!dirty && !saving} closeOnEscape={!saving}>
      <form className="ui-editor-form" onSubmit={e => { e.preventDefault(); void save(); }} noValidate>
        <fieldset disabled={saving} className="ui-editor-fields">
          {initial.kind === 'job' ? <>
            {!initial.fresh && <div className="ui-editor-identity"><Text size="sm" fw={500}>{job.role}</Text><Group gap="xs" mt={8}><Badge variant="light" color="gray">{displayLabel(job.contract || 'Not recorded')}</Badge><Text size="xs" c="dimmed">{displayLabel(job.location)}</Text>{safeExternalUrl(job.url) && <Anchor size="xs" href={safeExternalUrl(job.url)} target="_blank" rel="noreferrer">打开 JD <ExternalLink size={12}/></Anchor>}</Group></div>}
            <Tabs value={tab} onChange={setTab} keepMounted={false}>
              <Tabs.List><Tabs.Tab value="progress" leftSection={<MessageSquare size={15}/>}>申请进度</Tabs.Tab><Tabs.Tab value="job" leftSection={<BriefcaseBusiness size={15}/>}>岗位信息</Tabs.Tab>{original && <Tabs.Tab value="source" leftSection={<BookOpen size={15}/>}>研究依据</Tabs.Tab>}</Tabs.List>
              <Tabs.Panel value="progress" pt="lg"><Stack gap="lg">
                <SimpleGrid cols={{ base: 1, xs: 2 }}><Select label="申请状态" value={job.stage} data={stages.map(s => ({ value: s, label: displayLabel(s) }))} onChange={v => v && update('stage', v)}/>{date('实际申请日期', 'appliedDate', job.appliedDate)}</SimpleGrid>
                <Textarea label="下一步" placeholder="例如：等 HR 回复，周五跟进" autosize minRows={2} maxRows={5} maxLength={3000} value={job.nextStep} onChange={e => update('nextStep', e.currentTarget.value)}/>
                <SimpleGrid cols={{ base: 1, xs: 2 }}>{date('提醒我跟进', 'followUp', job.followUp)}{field('联系人 / 招聘团队', 'contact', job.contact)}</SimpleGrid>
                <Textarea label="我的备注" description="沟通记录、CV / Portfolio 版本、想问的问题" autosize minRows={4} maxRows={10} maxLength={10000} value={job.notes} onChange={e => update('notes', e.currentTarget.value)}/>
                {interviews.length > 0 && <div className="ui-interview-history"><Text size="sm" fw={600} mb="sm">关联面试 · {interviews.length} 轮</Text>{interviews.map(entry => <div key={entry.id}><Text size="sm">{entry.payload.title}</Text><Text size="xs" c="dimmed">{entry.payload.date} {entry.payload.time} · {entry.payload.result}</Text></div>)}</div>}
              </Stack></Tabs.Panel>
              <Tabs.Panel value="job" pt="lg"><Stack gap="lg">
                {field('公司', 'company', job.company, true, 200)}{field('职位名称', 'role', job.role, true, 300)}{field('JD 链接', 'url', job.url, false, 2000)}
                <SimpleGrid cols={{ base: 1, xs: 2 }}>{field('地点', 'location', job.location)}<Select label="工作性质" placeholder="待确认" clearable value={job.contract || null} data={contracts.map(v => ({ value: v, label: displayLabel(v) }))} onChange={v => update('contract', v || '')}/></SimpleGrid>
                <SimpleGrid cols={{ base: 1, xs: 2 }}><Autocomplete label="职位方向" value={job.category} data={data.searchPlan?.families.map(f=>f.label) || []} onChange={v => update('category', v)} maxLength={200}/>{field('行业', 'industry', job.industry, false, 200)}</SimpleGrid>
                {date('申请截止日期', 'deadline', job.deadline)}
                {initial.fresh && <Select label="初始状态" value={job.stage} data={stages.map(s => ({ value: s, label: displayLabel(s) }))} onChange={v => v && update('stage', v)}/>}
              </Stack></Tabs.Panel>
              {original && <Tabs.Panel value="source" pt="lg"><Stack gap="lg" className="ui-source-copy">
                <section><h3>原始申请记录</h3><p>{original.application?.evidence || '尚未记录申请凭据。'}</p><p>{original.application?.roleMapping}</p></section>
                <section><h3>JD 与来源</h3>{safeExternalUrl(original.jd.url) && <Anchor href={safeExternalUrl(original.jd.url)} target="_blank" rel="noreferrer">查看原始 JD</Anchor>}<JDReferences jd={original.jd}/><p>{original.jd.note}</p></section>
                <section><h3>匹配与资格</h3><p>{original.fitReason}</p><p>{original.eligibility}</p><p>{original.hardGap}</p></section>
                <section><h3>薪资依据</h3><p>{original.compensation.display}</p><p>{original.compensation.source}</p></section>
                <Text size="xs" c="dimmed">原始研究资料保留，不会被手动编辑覆盖。</Text>
              </Stack></Tabs.Panel>}
            </Tabs>
          </> : <Stack gap="lg">
            <Select label="关联岗位" withAsterisk={initial.kind === 'interview'} placeholder="输入公司或职位搜索" searchable clearable={initial.kind === 'event'} maxDropdownHeight={260} value={schedule.jobId || null} onChange={v => update('jobId', v || '')} error={errors.jobId} data={progress.allOpportunities.map(item => ({ value: item.id, label: item.company + ' · ' + item.role + (item.archived ? '（已归档）' : '') }))}/>
            {field(initial.kind === 'interview' ? '面试轮次 / 名称' : '活动名称', 'title', schedule.title, true, 300)}
            {initial.kind === 'event' && field('公司 / 主办方', 'company', schedule.company, false, 200)}
            <SimpleGrid cols={2}>{date('日期', 'date', schedule.date, true)}<TimeInput label="时间（可留空）" value={schedule.time} onInput={e => update('time', e.currentTarget.value)} onChange={e => update('time', e.currentTarget.value)}/></SimpleGrid>
            <SimpleGrid cols={{ base: 1, xs: 2 }}><Select label="时区" searchable value={schedule.timeZone} onChange={v => v && update('timeZone', v)} data={['Europe/London', 'Europe/Paris', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Singapore', 'America/New_York', 'America/Los_Angeles', 'UTC']}/><NumberInput label="预计时长（分钟）" value={schedule.duration} min={5} max={1440} step={15} onChange={v => update('duration', Number(v))}/></SimpleGrid>
            {field('地点 / 线上方式', 'location', schedule.location)}{field('会议 / 活动链接', 'url', schedule.url, false, 2000)}
            <Select label={initial.kind === 'interview' ? '本轮结果' : '活动状态'} value={schedule.result} data={initial.kind === 'interview' ? results : eventResults} onChange={v => v && update('result', v)}/>
            <Textarea label={initial.kind === 'interview' ? '准备事项 / 面试反馈' : '活动备注'} autosize minRows={3} maxRows={8} value={schedule.notes} maxLength={10000} onChange={e => update('notes', e.currentTarget.value)}/>
            {initial.kind === 'interview' && linked && <Text size="xs" c="dimmed">当前申请为「{displayLabel(linked.stage)}」。记录本轮结果不会自动改变申请状态。</Text>}
          </Stack>}
          {!initial.fresh && <><Divider my="xl"/><Checkbox color="gray" label={<Group gap={6}><Archive size={14}/><span>归档这条记录</span></Group>} description="不删除资料，可在归档中恢复" checked={archived} onChange={e => setArchived(e.currentTarget.checked)}/></>}
        </fieldset>
        {attempted && (Object.values(errors).some(Boolean) || progress.error) && <Alert color="red" title="暂未保存" my="md">{Object.values(errors).find(Boolean) || progress.error}{progress.error && <Button size="compact-xs" variant="subtle" onClick={() => void progress.refresh()}>同步最新数据</Button>}</Alert>}
        <footer className="ui-editor-footer"><Text size="xs" c="dimmed"><HardDrive size={14}/> {dirty ? '有未保存的修改' : '保存在此浏览器'}</Text><Group gap="xs"><Button variant="default" onClick={tryClose} disabled={saving}>取消</Button><Button type="submit" leftSection={<Check size={16}/>} loading={saving} disabled={!progress.ready || !!progress.busyId}>{initial.fresh ? '添加记录' : '保存更改'}</Button></Group></footer>
      </form>
    </Drawer>
    <Modal opened={confirmClose} onClose={() => setConfirmClose(false)} centered title="放弃未保存的修改？" closeButtonProps={{'aria-label':'关闭放弃修改提示'}} zIndex={500} size="sm"><Text size="sm" c="dimmed">已保存的记录不会受影响，当前草稿将丢弃。</Text><Group justify="flex-end" mt="xl"><Button variant="default" onClick={() => setConfirmClose(false)}>继续编辑</Button><Button color="red" onClick={close}>放弃修改</Button></Group></Modal>
  </>;
}
