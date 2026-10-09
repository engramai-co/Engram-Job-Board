import { useState } from 'react';
import { ActionIcon, Badge, Button, Group, Select, TextInput, UnstyledButton } from '@mantine/core';
import { Search, Plus, CalendarDays, Pencil, MapPin, ExternalLink } from 'lucide-react';
import { useProgress } from '../ProgressContext';
import { safeExternalUrl } from '../lib';
import { dateKey, type ScheduleEntry } from '../tracker-model';
import { useWorkspaceActions } from './WorkspaceEditors';

export function InterviewProcess({ kind = 'interview' }: { kind?: 'interview' | 'event' }) {
  const progress = useProgress(), { openSchedule, openJob } = useWorkspaceActions();
  const [query, setQuery] = useState(''), [scope, setScope] = useState('all');
  const label = kind === 'interview' ? '面试' : '活动';
  const entries = (progress.entries.filter(item => item.kind === kind && !item.archived) as ScheduleEntry[]).filter(item => scope === 'all' || (scope === 'upcoming' ? item.payload.date >= dateKey() && item.payload.result !== '已取消' : item.payload.date < dateKey()));
  const visible = entries.filter(item => [item.payload.title, item.payload.company, progress.allOpportunities.find(job => job.id === item.payload.jobId)?.company, item.payload.notes].join(' ').toLowerCase().includes(query.toLowerCase())).sort((a,b) => (a.payload.date + a.payload.time).localeCompare(b.payload.date + b.payload.time));
  return <section className="ui-agenda">
    <div className="ui-section-heading"><div><h2>{label === '面试' ? '面试安排' : '职业活动'}</h2><p>{kind === 'interview' ? '轮次、准备事项与每一轮的结果。' : 'Coffee chat、招聘会、电影节与交流。'}</p></div><Button leftSection={<Plus size={16}/>} onClick={() => openSchedule(kind)}>{kind === 'interview' ? '安排面试' : '新增活动'}</Button></div>
    <div className="ui-filterbar"><TextInput className="ui-search" aria-label={'搜索' + label} placeholder="搜索公司、名称或备注…" leftSection={<Search size={16}/>} value={query} onChange={e => setQuery(e.currentTarget.value)}/><Select aria-label="日程时间范围" value={scope} onChange={v => setScope(v || 'all')} data={[{ value: 'all', label: '全部日程' }, { value: 'upcoming', label: '即将到来' }, { value: 'past', label: '历史记录' }]}/></div>
    <div className="ui-agenda-list">{visible.map(entry => { const p = entry.payload, job = progress.allOpportunities.find(item => item.id === p.jobId); return <article className="ui-agenda-item" key={entry.id}>
      <div className="ui-agenda-date"><strong>{p.date.slice(8)}</strong><span>{p.date.slice(0,7)}</span></div>
      <div className="ui-agenda-main"><Group justify="space-between" gap="xs"><UnstyledButton className="ui-agenda-title" onClick={() => openSchedule(kind, undefined, undefined, entry)}>{p.title}</UnstyledButton><Badge variant="light" color={p.result === '通过' || p.result === '已参加' ? 'forest' : p.result === '未通过' ? 'red' : 'gray'}>{p.result}</Badge></Group>
        {job ? <UnstyledButton className="ui-agenda-job" onClick={() => openJob(job.id)}>{job.company} · {job.role}{job.archived ? '（已归档）' : ''}</UnstyledButton> : <p>{p.company}</p>}
        <div className="ui-agenda-details"><span><CalendarDays size={14}/>{p.time || '时间待定'} · {p.timeZone} · {p.duration} 分钟</span><span><MapPin size={14}/>{p.location || '地点待定'}</span></div>
        {p.notes && <p className="ui-agenda-notes">{p.notes}</p>}
        <Group gap="sm" mt="xs">{safeExternalUrl(p.url) && <Button component="a" href={safeExternalUrl(p.url)} target="_blank" rel="noreferrer" size="compact-xs" variant="subtle" leftSection={<ExternalLink size={13}/>}>{kind === 'interview' ? '会议链接' : '活动链接'}</Button>}{kind === 'event' && p.location && <Button component="a" href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.location)} target="_blank" rel="noreferrer" size="compact-xs" variant="subtle">查看地点</Button>}</Group>
      </div><ActionIcon aria-label={'编辑' + label + '：' + p.title} onClick={() => openSchedule(kind, undefined, undefined, entry)}><Pencil size={16}/></ActionIcon>
    </article>; })}</div>
    {!visible.length && <div className="ui-empty"><CalendarDays size={28}/><h3>{query || scope !== 'all' ? '没有符合条件的日程' : kind === 'interview' ? '还没有面试安排' : '还没有职业活动'}</h3><p>{query || scope !== 'all' ? '换个关键词或查看全部日程。' : kind === 'interview' ? '收到邀请后，记录岗位、轮次与时间。' : '记下时间、地点，保存后会同步出现在日历。'}</p>{(query || scope !== 'all') && <Button variant="default" onClick={() => { setQuery(''); setScope('all'); }}>清除筛选</Button>}</div>}
  </section>;
}
