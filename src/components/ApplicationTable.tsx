import { useState } from 'react';
import { Badge, Button, Checkbox, Group, Menu, Select, Table, TextInput, UnstyledButton } from '@mantine/core';
import { Search, ChevronDown, Check, Plus, CalendarDays } from 'lucide-react';
import { displayLabel, portfolioDimension } from '../lib';
import type { PortfolioItem, Stage } from '../types';
import type { ChartFilter } from './PortfolioChart';
import { useProgress } from '../ProgressContext';
import { dateKey, jobFields, stages } from '../tracker-model';
import { useWorkspaceActions } from './WorkspaceEditors';
import { RecordActions } from './RecordActions';

export const statusColor = (stage: string) => ({ Applied: 'yellow', OA: 'blue', Interviewing: 'blue', 'Final round': 'violet', Offer: 'forest', Rejected: 'red', Withdrawn: 'gray', Waitlist: 'orange' }[stage] || 'gray');

export function StatusControl({ item }: { item: PortfolioItem }) {
  const progress = useProgress();
  if (item.id === 'signed-offer-baseline') return <Badge variant="light" color="forest">Offer · 比较基准</Badge>;
  const statusLabel = (stage: Stage) => stage === 'Researching' ? '未申请' : displayLabel(stage);
  const change = (stage: Stage) => {
    const job = progress.opportunities.find(job => job.id === item.id);
    if (job && stage !== job.stage) void progress.saveEntry(item.id, 'job', { ...jobFields(job), stage }, progress.entries.find(entry => entry.id === item.id)?.revision ?? 0);
  };
  return <Menu width={170} position="bottom-start" middlewares={{ flip: true, shift: true }}>
    <Menu.Target>
      <Button className="status-pill" data-status={item.stage} size="compact-sm" variant="light" color={statusColor(item.stage)} rightSection={<ChevronDown size={12}/>} aria-label={'申请状态：' + statusLabel(item.stage) + '，' + item.company + ' ' + item.role} disabled={!progress.ready || !!progress.busyId} loading={progress.busyId === item.id}>
        {statusLabel(item.stage)}
      </Button>
    </Menu.Target>
    <Menu.Dropdown style={{ maxHeight: 'calc(100dvh - 24px)', overflowY: 'auto' }}>
      <Menu.Label>更新追踪状态</Menu.Label>
      {stages.map(stage => <Menu.Item key={stage} role="menuitemradio" aria-checked={stage === item.stage} onClick={() => change(stage)} rightSection={stage === item.stage ? <Check size={14}/> : null}>{statusLabel(stage)}</Menu.Item>)}
    </Menu.Dropdown>
  </Menu>;
}

export function ApplicationTable({ items, filter, onClear, onShowResearch, board = false, initialDue = false }: { items: PortfolioItem[]; filter: ChartFilter | null; onClear: () => void; onShowResearch: (id: string) => void; board?: boolean; initialDue?: boolean }) {
  const { openJob } = useWorkspaceActions();
  const [query, setQuery] = useState(''), [stage, setStage] = useState('all'), [sort, setSort] = useState('company');
  const [dueOnly, setDueOnly] = useState(initialDue);
  const progress = useProgress();
  const visible = items.filter(item => (!filter || portfolioDimension(item, filter.view) === filter.label) && (stage === 'all' || item.stage === stage) && (!dueOnly || item.followUp && item.followUp <= dateKey() && !['Offer', 'Rejected', 'Withdrawn'].includes(item.stage)) && [item.company, item.role, item.location, item.personalNotes, item.nextStep].join(' ').toLowerCase().includes(query.toLowerCase())).sort((a,b) => sort === 'date' ? (b.appliedDate || '').localeCompare(a.appliedDate || '') : sort === 'follow' ? (a.followUp || '9999').localeCompare(b.followUp || '9999') : a.company.localeCompare(b.company));
  const interviewCount = (id: string) => progress.entries.filter(entry => entry.kind === 'interview' && !entry.archived && 'jobId' in entry.payload && entry.payload.jobId === id).length;
  const reset = () => { setQuery(''); setStage('all'); setDueOnly(false); onClear(); };
  return <section className="workspace-ledger" aria-label={board ? '申请状态看板' : '申请记录'}>
    <div className="ui-filterbar">
      <TextInput className="ui-search" aria-label="搜索申请记录" placeholder="搜索公司、职位或备注…" leftSection={<Search size={16}/>} value={query} onChange={e => setQuery(e.currentTarget.value)}/>
      <Select aria-label="筛选申请状态" value={stage} onChange={v => setStage(v || 'all')} data={[{ value: 'all', label: '全部状态' }, ...stages.filter(s => s !== 'Researching').map(s => ({ value: s, label: displayLabel(s) }))]}/>
      <Select aria-label="申请排序" value={sort} onChange={v => setSort(v || 'company')} data={[{ value: 'company', label: '公司 A–Z' }, { value: 'date', label: '最近申请' }, { value: 'follow', label: '最近需跟进' }]}/>
    </div>
    <div className="ui-list-meta"><Group gap="md"><Checkbox size="xs" label="只看待跟进" checked={dueOnly} onChange={e => setDueOnly(e.currentTarget.checked)}/>{filter && <Button size="compact-xs" variant="light" onClick={onClear}>{filter.label} · 清除</Button>}{(query || stage !== 'all' || dueOnly) && <Button variant="subtle" color="gray" size="compact-xs" onClick={reset}>清除筛选</Button>}</Group><span>{visible.length} / {items.length} 条</span></div>
    {board ? <div className="ui-board">{stages.filter(s => s !== 'Researching' && (stage === 'all' || stage === s)).map(s => <section className="ui-board-column" key={s}><h3>{displayLabel(s)} <Badge color="gray" variant="light" size="sm">{visible.filter(item => item.stage === s).length}</Badge></h3>{visible.filter(item => item.stage === s).map(item => <article className="ui-board-card" key={item.id}><div className="ui-board-card-top"><UnstyledButton className="ui-job-title" disabled={item.id === 'signed-offer-baseline'} onClick={() => openJob(item.id)}><strong>{item.company}</strong><span>{item.role}</span></UnstyledButton><RecordActions id={item.id} company={item.company} url={item.jd?.url} onResearch={() => onShowResearch(item.id)}/></div><p>{item.nextStep || '还没有下一步'}</p><StatusControl item={item}/></article>)}{!visible.some(item => item.stage === s) && <div className="ui-board-empty">暂无记录</div>}</section>)}</div> : <div className="ui-table-wrap"><Table className="ui-jobs-table" verticalSpacing="md" horizontalSpacing="md" highlightOnHover><Table.Thead><Table.Tr><Table.Th>公司 / 职位</Table.Th><Table.Th>申请状态</Table.Th><Table.Th>地点 / 日期</Table.Th><Table.Th>下一步</Table.Th><Table.Th><span className="sr-only">操作</span></Table.Th></Table.Tr></Table.Thead><Table.Tbody>{visible.map(item => <Table.Tr key={item.id}>
      <Table.Td className="ui-job-cell"><UnstyledButton className="ui-job-title" disabled={item.id === 'signed-offer-baseline'} onClick={() => openJob(item.id)}><strong>{item.company}</strong><span>{item.role}</span></UnstyledButton><div className="ui-cell-meta">{displayLabel(item.work?.contract || 'Not recorded')} · {displayLabel(item.category)}</div></Table.Td>
      <Table.Td className="ui-status-cell"><StatusControl item={item}/>{interviewCount(item.id) > 0 && <Button variant="subtle" size="compact-xs" leftSection={<CalendarDays size={12}/>} disabled={item.id === 'signed-offer-baseline'} onClick={() => openJob(item.id)}>{interviewCount(item.id)} 场面试</Button>}</Table.Td>
      <Table.Td className="ui-date-cell"><span>{displayLabel(item.location)}</span><div className="ui-cell-meta">{item.appliedDate || '申请日期待补'}</div>{item.followUp && <div className="ui-followup">跟进 {item.followUp}</div>}</Table.Td>
      <Table.Td className="ui-notes-cell"><UnstyledButton className="ui-note-preview" disabled={item.id === 'signed-offer-baseline'} onClick={() => openJob(item.id)}>{item.nextStep || '添加下一步…'}</UnstyledButton>{item.personalNotes && <div className="ui-cell-meta ui-clamp">{item.personalNotes}</div>}</Table.Td>
      <Table.Td className="ui-actions-cell"><RecordActions id={item.id} company={item.company} url={item.jd?.url} onResearch={() => onShowResearch(item.id)}/></Table.Td>
    </Table.Tr>)}</Table.Tbody></Table></div>}
    {!visible.length && <div className="ui-empty"><Search size={26}/><h3>{items.length ? '没有符合条件的申请' : '开始记录你的申请'}</h3><p>{items.length ? '试试其他关键词，或清除筛选。' : '投递完成后，在岗位研究中标记为已申请，也可以直接添加。'}</p><Group justify="center">{items.length > 0 && <Button variant="default" onClick={reset}>清除筛选</Button>}<Button leftSection={<Plus size={16}/>} onClick={() => openJob(undefined, 'Applied')}>新增申请</Button></Group></div>}
  </section>;
}
