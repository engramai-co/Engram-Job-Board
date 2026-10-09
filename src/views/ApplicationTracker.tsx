import { useCallback, useState } from 'react';
import { ActionIcon, Badge, Button, Group, Skeleton, Tabs, Tooltip, UnstyledButton } from '@mantine/core';
import { List, Columns3, PieChart, CalendarDays, MessagesSquare, CalendarHeart, Archive, RefreshCw, HardDrive } from 'lucide-react';
import { ApplicationTable } from '../components/ApplicationTable';
import { InterviewProcess } from '../components/InterviewProcess';
import { OfferBaseline } from '../components/OfferBaseline';
import { PortfolioChart, type ChartFilter } from '../components/PortfolioChart';
import { SearchCalendar } from '../components/SearchCalendar';
import { filterCareerItems, getPortfolioItems } from '../lib';
import type { MixView, TrackFilter } from '../types';
import { useProgress } from '../ProgressContext';
import { useWorkspaceActions } from '../components/WorkspaceEditors';
import { CreateMenu } from '../components/RecordActions';
import { dateKey, type ScheduleEntry } from '../tracker-model';

export function ApplicationTracker({ track = 'all', onShowResearch }: { track?: TrackFilter; onShowResearch: (id: string) => void }) {
  const progress = useProgress(), { openJob, openSchedule } = useWorkspaceActions();
  const [panel, setPanel] = useState<string | null>('list');
  const items = filterCareerItems(getPortfolioItems(progress.opportunities), track);
  const [mixView, setMixView] = useState<MixView>('status'), [filter, setFilter] = useState<ChartFilter | null>(null);
  const handleSliceSelect = useCallback((next: ChartFilter | null) => setFilter(next), []);
  const stats = [
    { key: 'list', label: '全部申请', value: items.length },
    { key: 'board', label: '进行中', value: items.filter(i => !['Rejected', 'Withdrawn', 'Offer'].includes(i.stage)).length },
    { key: 'interviews', label: '待进行面试', value: progress.entries.filter(e => e.kind === 'interview' && !e.archived && 'date' in e.payload && e.payload.date >= dateKey() && e.payload.result === '待进行').length },
    { key: 'followups', label: '待跟进', value: items.filter(i => i.followUp && i.followUp <= dateKey() && !['Rejected', 'Withdrawn', 'Offer'].includes(i.stage)).length },
  ];
  if (!progress.ready) return <div className="ui-loading" role="status"><p>{progress.loading ? '正在同步申请记录…' : '暂未读取到本机记录，请重试同步。'}</p>{[1,2,3].map(i => <Skeleton key={i} height={80} mb="sm"/>)}</div>;
  return <>
    <div className="ui-workspace-top"><div className="ui-summary">{stats.map(s => <UnstyledButton key={s.key} onClick={() => { if (s.key === 'followups') setFilter(null); setPanel(s.key); }} className={panel === s.key ? 'is-current' : ''}><span>{s.label}</span><strong>{s.value}</strong></UnstyledButton>)}</div><Group gap="xs"><Tooltip label="重新同步本机记录"><ActionIcon aria-label="刷新本机记录" disabled={progress.loading || !!progress.busyId} onClick={() => void progress.refresh()}><RefreshCw size={16} className={progress.loading ? 'ui-spinning' : ''}/></ActionIcon></Tooltip><CreateMenu/></Group></div>
    <Tabs value={panel === 'followups' ? 'list' : panel} onChange={setPanel} className="ui-view-tabs">
      <Tabs.List>
        <Tabs.Tab value="list" leftSection={<List size={15}/>}>申请列表</Tabs.Tab><Tabs.Tab value="board" leftSection={<Columns3 size={15}/>}>看板</Tabs.Tab>
        <Tabs.Tab value="mix" leftSection={<PieChart size={15}/>}>数据概览</Tabs.Tab><Tabs.Tab value="interviews" leftSection={<MessagesSquare size={15}/>}>面试</Tabs.Tab>
        <Tabs.Tab value="events" leftSection={<CalendarHeart size={15}/>}>活动</Tabs.Tab><Tabs.Tab value="calendar" leftSection={<CalendarDays size={15}/>}>日历</Tabs.Tab><Tabs.Tab value="archive" leftSection={<Archive size={15}/>}>归档</Tabs.Tab>
      </Tabs.List>
    </Tabs>
    {(panel === 'list' || panel === 'board' || panel === 'followups') && <ApplicationTable key={panel === 'followups' ? 'due' : 'all'} items={items} board={panel === 'board'} initialDue={panel === 'followups'} filter={filter} onClear={() => setFilter(null)} onShowResearch={onShowResearch}/>}
    {panel === 'mix' && <><PortfolioChart items={items} view={mixView} selected={filter} onViewChange={v => { setMixView(v); setFilter(null); }} onSliceSelect={handleSliceSelect}/><ApplicationTable items={items} filter={filter} onClear={() => setFilter(null)} onShowResearch={onShowResearch}/><OfferBaseline/></>}
    {panel === 'interviews' && <InterviewProcess/>}{panel === 'events' && <InterviewProcess key="events" kind="event"/>}{panel === 'calendar' && <SearchCalendar/>}
    {panel === 'archive' && <section className="ui-archive"><h2>已归档</h2>{progress.entries.filter(e => e.archived).map(e => <div className="ui-archive-row" key={e.id}><div><strong>{'role' in e.payload ? e.payload.company + ' · ' + e.payload.role : e.payload.title}</strong><Badge color="gray" variant="light" size="sm">{e.kind === 'job' ? '岗位' : e.kind === 'interview' ? '面试' : '活动'}</Badge></div><Group gap="xs"><Button variant="subtle" onClick={() => e.kind === 'job' ? openJob(e.id) : openSchedule(e.kind, undefined, undefined, e as ScheduleEntry)}>查看</Button><Button variant="default" disabled={!!progress.busyId} onClick={() => void progress.saveEntry(e.id, e.kind, e.payload, e.revision, false)}>恢复</Button></Group></div>)}{!progress.entries.some(e => e.archived) && <div className="ui-empty"><Archive size={26}/><h3>暂无归档记录</h3><p>归档的岗位和日程会保留在这里，随时可以恢复。</p></div>}</section>}
    <div className="ui-sync-note"><HardDrive size={13}/>{progress.loading ? '正在同步…' : '记录保存在当前浏览器'}</div>
  </>;
}
