import { useState } from "react";
import { ActionIcon, Button, Group, Menu, Select } from '@mantine/core';
import { ChevronLeft, ChevronRight, Plus, CalendarDays, MessagesSquare } from 'lucide-react';
import { useProgress } from "../ProgressContext";
import { dateKey, type ScheduleEntry } from "../tracker-model";
import { useWorkspaceActions } from "./WorkspaceEditors";

export function SearchCalendar(){
  const progress=useProgress(),{openSchedule,openJob}=useWorkspaceActions();
  const [month,setMonth]=useState(()=>new Date(new Date().getFullYear(),new Date().getMonth(),1));
  const [selected,setSelected]=useState(dateKey()),[kind,setKind]=useState("all");
  const entries=progress.entries.filter(item=>item.kind!=="job"&&!item.archived) as ScheduleEntry[];
  const dates=[...entries.map(entry=>({id:entry.id,kind:entry.kind,title:entry.payload.title,date:entry.payload.date,time:entry.payload.time,detail:entry.payload.timeZone,entry,jobId:entry.payload.jobId})),...progress.opportunities.flatMap(job=>[
    ...(job.work?.deadline?[{id:"deadline-"+job.id,kind:"deadline",title:job.company+" · 申请截止",date:job.work.deadline,time:"",detail:job.role,entry:undefined,jobId:job.id}]:[]),
    ...(job.followUp?[{id:"follow-"+job.id,kind:"follow",title:job.company+" · 跟进",date:job.followUp,time:"",detail:job.nextStep,entry:undefined,jobId:job.id}]:[])
  ])].filter(item=>kind==="all"||item.kind===kind).sort((a,b)=>a.time.localeCompare(b.time));
  const start=new Date(month.getFullYear(),month.getMonth(),1-(month.getDay()+6)%7);
  const days=Array.from({length:42},(_,index)=>{const date=new Date(start);date.setDate(start.getDate()+index);return {date,key:dateKey(date)};});
  const open=(item:typeof dates[number])=>item.entry?openSchedule(item.entry.kind as "interview"|"event",undefined,undefined,item.entry):openJob(item.jobId);
  const shift=(amount:number)=>{const next=new Date(month.getFullYear(),month.getMonth()+amount,1);setMonth(next);setSelected(dateKey(next));};
  return <section className="interactive-calendar ui-calendar"><div className="ui-section-heading"><div><h2>求职日历</h2><p>面试、活动、截止日期与跟进事项。</p></div><Select aria-label="日历显示内容" value={kind} onChange={v=>setKind(v||'all')} data={[{value:'all',label:'全部日程'},{value:'interview',label:'面试'},{value:'event',label:'活动'},{value:'deadline',label:'申请截止'},{value:'follow',label:'跟进'}]}/></div>
    <div className="calendar-controls"><h3 aria-live="polite">{month.getFullYear()} 年 {month.getMonth()+1} 月</h3><Group gap="xs"><ActionIcon variant="default" aria-label="上个月" onClick={()=>shift(-1)}><ChevronLeft size={17}/></ActionIcon><Button variant="default" onClick={()=>{setMonth(new Date(new Date().getFullYear(),new Date().getMonth(),1));setSelected(dateKey());}}>今天</Button><ActionIcon variant="default" aria-label="下个月" onClick={()=>shift(1)}><ChevronRight size={17}/></ActionIcon></Group></div>
    <div className="interactive-calendar-grid">{["一","二","三","四","五","六","日"].map(day=><div className="day-of-week" key={day}>{day}</div>)}{days.map(day=>{const events=dates.filter(item=>item.date===day.key);return <div className={"interactive-day"+(day.date.getMonth()!==month.getMonth()?" outside":"")+(selected===day.key?" selected":"")+(day.key===dateKey()?" today":"")} key={day.key}><button className="day-number" aria-label={day.key+"，"+events.length+" 条日程"} aria-pressed={selected===day.key} onClick={()=>setSelected(day.key)}>{day.date.getDate()}<span className="mobile-day-count">{events.length>0?" · "+events.length:""}</span></button><div className="day-events">{events.slice(0,3).map(item=><button key={item.id} className={"calendar-chip "+item.kind} onClick={()=>{setSelected(day.key);open(item);}}>{item.time&&item.time+" "}{item.title}</button>)}{events.length>3&&<button className="text-button" onClick={()=>setSelected(day.key)}>另有 {events.length-3} 条</button>}</div></div>;})}</div>
    <div className="day-agenda"><div className="section-title"><h3>{selected} 的日程</h3><Menu width={170}><Menu.Target><Button variant="light" leftSection={<Plus size={16}/>}>添加日程</Button></Menu.Target><Menu.Dropdown><Menu.Item leftSection={<MessagesSquare size={15}/>} onClick={()=>openSchedule("interview",undefined,selected)}>安排面试</Menu.Item><Menu.Item leftSection={<CalendarDays size={15}/>} onClick={()=>openSchedule("event",undefined,selected)}>新增活动</Menu.Item></Menu.Dropdown></Menu></div>{dates.filter(item=>item.date===selected).map(item=><button key={item.id} className="day-agenda-row" onClick={()=>open(item)}><span className={"tag "+item.kind}>{({interview:"面试",event:"活动",deadline:"截止",follow:"跟进"} as Record<string,string>)[item.kind]||item.kind}</span><strong>{item.time||"未设时间"} · {item.title}</strong><span>{item.detail}</span></button>)}{!dates.some(item=>item.date===selected)&&<p className="muted">当天暂无日程。</p>}<p className="ui-cell-meta">时间按每条记录的时区显示。</p></div>
  </section>;
}
