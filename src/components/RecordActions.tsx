import { ActionIcon, Button, Menu } from '@mantine/core';
import { MoreHorizontal, Plus, Pencil, CalendarPlus, ExternalLink, BookOpen, BriefcaseBusiness, CalendarDays, ChevronDown } from 'lucide-react';
import { safeExternalUrl } from '../lib';
import { useWorkspaceActions } from './WorkspaceEditors';
import { useProgress } from '../ProgressContext';
export function CreateMenu({ date }: { date?: string }) {
  const { openJob, openSchedule } = useWorkspaceActions();
  const { ready } = useProgress();
  return <Menu width={210}><Menu.Target><Button disabled={!ready} leftSection={<Plus size={16}/>} rightSection={<ChevronDown size={14}/>}>新增</Button></Menu.Target><Menu.Dropdown>
    <Menu.Item leftSection={<BriefcaseBusiness size={16}/>} onClick={() => openJob()}>岗位 / 申请</Menu.Item>
    <Menu.Item leftSection={<CalendarPlus size={16}/>} onClick={() => openSchedule('interview', undefined, date)}>面试安排</Menu.Item>
    <Menu.Item leftSection={<CalendarDays size={16}/>} onClick={() => openSchedule('event', undefined, date)}>职业活动</Menu.Item>
  </Menu.Dropdown></Menu>;
}
export function RecordActions({ id, company, url, onResearch }: { id: string; company: string; url?: string; onResearch?: () => void }) {
  const { openJob, openSchedule } = useWorkspaceActions();
  const { ready } = useProgress();
  const href = safeExternalUrl(url);
  if (id === 'signed-offer-baseline') return <span className="ui-cell-meta">基准条款在数据概览查看；通过本地数据文件维护。</span>;
  return <Menu width={190}><Menu.Target><ActionIcon disabled={!ready} aria-label={company + ' 的更多操作'}><MoreHorizontal size={19}/></ActionIcon></Menu.Target><Menu.Dropdown>
    <Menu.Item leftSection={<Pencil size={16}/>} onClick={() => openJob(id)}>编辑岗位与备注</Menu.Item>
    <Menu.Item leftSection={<CalendarPlus size={16}/>} onClick={() => openSchedule('interview', id)}>安排面试</Menu.Item>
    {href && <Menu.Item component="a" href={href} target="_blank" rel="noreferrer" leftSection={<ExternalLink size={16}/>}>打开 JD</Menu.Item>}
    {onResearch && <><Menu.Divider/><Menu.Item leftSection={<BookOpen size={16}/>} onClick={onResearch}>查看研究依据</Menu.Item></>}
  </Menu.Dropdown></Menu>;
}
