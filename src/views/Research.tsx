import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Group, SegmentedControl, Select, Tabs, TextInput } from '@mantine/core';
import { Search, ChartNoAxesCombined, SlidersHorizontal } from 'lucide-react';
import { ResearchCharts, researchStatusOrder, type ResearchFilterState } from '../components/ResearchCharts';
import { ResearchRegisters } from '../components/ResearchRegisters';
import { ResearchTable } from '../components/ResearchTable';
import { CareerDirections } from '../components/CareerBrief';
import { CreateMenu } from '../components/RecordActions';
import { data, displayLabel, filterCareerItems, getResearchItems, portfolioStages, researchDecisionLabel } from '../lib';
import { useProgress } from '../ProgressContext';
import { dimensionsForProfile, researchPool, researchPools, scoreProfiles, type ResearchPool } from '../ranking';
import type { ContractType, TrackFilter } from '../types';

export function Research({ track = 'all', focusedJob, onShowApplications }: { track?: TrackFilter; focusedJob: string | null; onShowApplications: () => void }) {
  const { opportunities, ready } = useProgress();
  const focusedItem = opportunities.find(item => item.id === focusedJob);
  const [pool, setPool] = useState<ResearchPool>(() => focusedItem ? researchPool(focusedItem) : 'project');
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<'pending' | 'applied'>(() => opportunities.some(item => item.id === focusedJob && portfolioStages.has(item.stage)) ? 'applied' : 'pending');
  const [family, setFamily] = useState('all'), [contract, setContract] = useState<ContractType | 'all'>('all');
  const [chartsOpen, setChartsOpen] = useState(false), [filter, setFilter] = useState<ResearchFilterState>({});
  useEffect(() => {
    if (!focusedItem || !ready) return;
    setPool(researchPool(focusedItem));
    setScope(portfolioStages.has(focusedItem.stage) ? 'applied' : 'pending');
    setQuery(''); setFamily('all'); setContract('all'); setFilter({});
  }, [focusedItem?.id, focusedItem?.work?.contract, focusedItem?.stage, ready]);
  const poolItems = opportunities.filter(item => researchPool(item) === pool);
  const pendingItems = filterCareerItems(getResearchItems(poolItems), track);
  const appliedItems = filterCareerItems(poolItems.filter(item => portfolioStages.has(item.stage)), track);
  const scopeItems = filterCareerItems(scope === 'pending' ? getResearchItems(opportunities) : opportunities.filter(item => portfolioStages.has(item.stage)), track);
  const allItems = scope === 'pending' ? pendingItems : appliedItems;
  const researchItems = filterCareerItems(allItems, track, family, contract);
  const setResearchFilter = useCallback((next: ResearchFilterState) => setFilter(next), []);
  const visibleItems = researchItems.filter(item => (!filter.status || item.researchStatus === filter.status) && (!filter.industry || item.industry === filter.industry) && [item.company, item.role, item.personalNotes, item.location].join(' ').toLowerCase().includes(query.toLowerCase()));
  const hasFilter = query || family !== 'all' || contract !== 'all' || filter.status || filter.industry;
  const currentPool = researchPools.find(item => item.id === pool)!;
  const scoreProfile = pool === 'unconfirmed' ? undefined : pool;
  const dimensions = dimensionsForProfile(scoreProfile);
  const scoreTitle = scoreProfile ? scoreProfiles[scoreProfile].label : '原参考分';
  const weightSummary = dimensions.map(d => `${d.short} ${d.weight}%`).join(' · ');
  const availableContracts = pool === 'project' ? ['Internship', 'Part-time', 'Freelance', 'Volunteer'] : [];
  const resetFilters = () => { setQuery(''); setFamily('all'); setContract('all'); setFilter({}); };
  return <section className="queue-section research-ranking ui-research" aria-label="岗位研究列表">
    <Tabs value={pool} onChange={value => { if (value) { setPool(value as ResearchPool); resetFilters(); } }} className="ui-research-pools">
    <Tabs.List aria-label="按工作性质分组">
      {researchPools.map(item => <Tabs.Tab key={item.id} value={item.id} rightSection={<span className="ui-pool-count">{ready ? scopeItems.filter(job => researchPool(job) === item.id).length : '—'}</span>}>{item.label}</Tabs.Tab>)}
    </Tabs.List>
    <Tabs.Panel value={pool}>
    <div className="ui-pool-context"><p>{currentPool.description}</p><span>{scoreTitle} · {weightSummary}</span></div>
    <div className="ui-research-top"><SegmentedControl aria-label="研究档案范围" value={scope} onChange={v => { setScope(v as 'pending' | 'applied'); setFilter({}); }} data={[{value:'pending',label:'待申请 · ' + (ready ? pendingItems.length : '—')},{value:'applied',label:'已申请 · ' + (ready ? appliedItems.length : '—')}]}/><CreateMenu/></div>
    <div className="ui-filterbar"><TextInput className="ui-search" aria-label="搜索研究岗位" placeholder="搜索公司、职位或备注…" leftSection={<Search size={16}/>} value={query} onChange={e => setQuery(e.currentTarget.value)}/>
      {data.searchPlan && <Select aria-label="职位方向" searchable value={family} onChange={v => { setFamily(v || 'all'); setFilter({}); }} data={[{value:'all',label:'全部方向'},...data.searchPlan.families.map(f => ({value:f.label,label:displayLabel(f.label) + (f.searchStatus === 'Search paused' ? '（暂停搜索）' : '')}))]}/>}
      {availableContracts.length > 0 && <Select aria-label="工作性质" value={contract} onChange={v => { setContract((v || 'all') as ContractType | 'all'); setFilter({}); }} data={[{value:'all',label:'本组全部类型'},...availableContracts.map(v=>({value:v,label:displayLabel(v)}))]}/>}
    </div>
    <div className="ui-research-filters"><Select leftSection={<SlidersHorizontal size={14}/>} aria-label="推进状态" value={filter.status || 'all'} onChange={v => setFilter(v && v !== 'all' ? {status:v as NonNullable<ResearchFilterState['status']>} : {})} data={[{value:'all',label:'全部推进状态'},...researchStatusOrder.filter(s=>researchItems.some(i=>i.researchStatus===s)).map(s=>({value:s,label:researchDecisionLabel(s)}))]}/><Group gap="xs">
      {filter.industry && <Badge color="gray" variant="light">{displayLabel(filter.industry)}</Badge>}
      {hasFilter && <Button variant="subtle" color="gray" size="compact-xs" onClick={resetFilters}>清除筛选</Button>}
      <Button variant={chartsOpen ? 'light' : 'subtle'} color={chartsOpen ? 'forest' : 'gray'} leftSection={<ChartNoAxesCombined size={15}/>} aria-expanded={chartsOpen} aria-controls="research-charts" onClick={()=>setChartsOpen(!chartsOpen)}>{chartsOpen ? '收起图表' : '研究分布'}</Button>
    </Group></div>
    <div id="research-charts" hidden={!chartsOpen}>{chartsOpen && <ResearchCharts items={researchItems} filter={filter} onFilterChange={setResearchFilter}/>}</div>
    <div className="ui-list-meta"><span>按{scoreTitle}排序 · 仅在本组比较</span><span>{visibleItems.length} / {allItems.length} 条 · 保留组内总排名</span></div>
    <ResearchTable opportunities={visibleItems} allOpportunities={poolItems} focusedJob={focusedJob} onShowApplications={onShowApplications} scoreProfile={scoreProfile} rankingLabel={currentPool.label}/>
    <details className="ranking-method ui-method"><summary><span>评分口径与时效提醒</span><span>{weightSummary}</span></summary><div className="ranking-method-body"><p>两组分别排名，共用四个大维度、11 个细项及其证据，各按 0–100 分判断。维度分 = Σ（细项分 × 维度内权重）；总分 = Σ（维度分 × 本组权重）。不同组的总分不直接比较，也不代表录用概率。</p>
      <p>实习／兼职／项目：内容 30% · 能力 45% · 成长 15% · 平台 10%，侧重现有能力能否用于实际交付。Full-time：内容 30% · 能力 25% · 成长 25% · 平台 20%，提高长期路径与平台价值的比重。这些权重表达当前求职偏好，可以调整。</p>
      <p>分组按已记录的工作性质判断：全职工时的实习仍属实习；志愿项目放入实践组；性质未知的岗位单独保留原参考分。分组不代表能立即入职，也不决定何时投递。</p>
      <p>0 表示明确偏离或缺少相应能力；50 表示部分覆盖、有明显差异；75 表示多数核心要求有材料支持；100 需要完整直接证据。细项可在锚点间判断，不强制五档。未观看的作品、未核验的结果不会自动满分。</p>
      <dl>{dimensions.map(({ key, label, weight, description, criteria }) => <div key={key}><dt>{label} · {weight}%</dt><dd>{key === 'platform' ? '按公司规模、领域相关性和履历价值判断；品牌不等同团队文化。' : description}<ul>{criteria.map(c=><li key={c.key}>{c.label} · 维度内 {c.weight}%：{c.description}</li>)}</ul></dd></div>)}</dl>
      <p>待补细项不默认 50 或 100，也不认定为能力不足。区间下界来自已评分部分，上界包含未知项可能贡献；这是评分范围，不是统计置信区间。按下界保守排序，未评分岗位仍保留。细小分差不代表显著差异。</p>
      <p>学历、工作许可、入职时间只记备注，由你判断，不设置自动资格过滤；未公布薪资不评分。申请或拒绝结果不会倒推匹配分。</p>
      <h3>时效只提醒，不扣分</h3><p>距上次有效 JD 核验 ≤14 天不提示；15–30 天显示“建议复查”；超过 30 天显示“信息可能过期”；没有有效日期显示“尚未核验”。不扣分、不改变排序、不自动隐藏。编辑备注、重新评分或打开链接都不刷新日期。已申请记录不因等待回复显示过期提醒。</p>
    </div></details>
    </Tabs.Panel></Tabs>
    <p className="ranking-source">数据快照 {data.research.asOf}，非实时招聘状态。{data.research.sourceRule}</p>
    <details className="research-reference"><summary>求职方向、经历与待确认条件</summary><CareerDirections/></details><ResearchRegisters/>
  </section>;
}
