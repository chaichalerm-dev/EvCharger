"use client";
import { Database,GitCompareArrows,HelpCircle } from "lucide-react";
import { ResponsiveContainer,RadarChart,PolarGrid,PolarAngleAxis,PolarRadiusAxis,Radar,Legend,Tooltip } from "recharts";
import { catalogService } from "@/src/services/catalog.service";
import type { Site } from "@/src/domain/models";
import { calculateSiteScore } from "@/src/services/scoring-engine";
import { recommendSite } from "@/src/services/recommendation-engine";
import { useApp } from "@/src/store/app-context";

const colors=["#087a5b","#d89416","#4b86d8","#9b62c4"];
const MOCK_SITES=catalogService.getSites();
const comparisonRows:Array<{label:string;value:(site:Site)=>string|number}>=[
  {label:"Overall score",value:s=>calculateSiteScore(s.factors).overall},
  {label:"Demand",value:s=>s.factors.demand},{label:"Competition",value:s=>s.factors.competition},
  {label:"Accessibility",value:s=>s.factors.accessibility},{label:"POI",value:s=>s.factors.poi},
  {label:"Infrastructure",value:s=>s.factors.infrastructure},{label:"Flood risk",value:s=>s.floodRisk},
  {label:"Site area",value:s=>s.areaSqm?s.areaSqm.toLocaleString()+" m² ("+(s.areaVerified?"Verified":"Estimated")+")":"Unknown"},
  {label:"Business model",value:s=>s.businessModel.replaceAll("_"," ")},{label:"Data confidence",value:s=>s.provenance.confidence},
];

export function ComparisonView(){
  const{compareIds,toggleCompare}=useApp();
  const selectedIds=compareIds.length?compareIds:MOCK_SITES.slice(0,3).map(s=>s.id);
  const selected=selectedIds.map(id=>MOCK_SITES.find(s=>s.id===id)).filter((s):s is Site=>Boolean(s)).slice(0,4);
  const data=Object.keys(MOCK_SITES[0].factors).map(key=>({factor:key.replaceAll(/([A-Z])/g," $1"),...Object.fromEntries(selected.map(s=>[s.id,s.factors[key as keyof typeof s.factors]]))}));
  return <main className="page"><div className="page-head"><div><div className="eyebrow">Decision workspace</div><h1>Compare Sites</h1><p className="page-subtitle">Compare up to four opportunities using the same scoring configuration</p></div><div className="head-actions"><span className="btn"><GitCompareArrows/>{selected.length} sites selected</span></div></div><div className="demo-banner"><Database/>Demo Data · Comparative scores share configuration version demo-v1.0.</div><div className="compare-picker">{MOCK_SITES.map(s=><button className={"compare-choice "+(selectedIds.includes(s.id)?"selected":"")} key={s.id} onClick={()=>toggleCompare(s.id)}><strong>{s.name}</strong><span>{s.province} · Score {calculateSiteScore(s.factors).overall}</span></button>)}</div><div className="comparison-summary">{selected.map((s,i)=>{const score=calculateSiteScore(s.factors);const rec=recommendSite(s,score);return <article className="card comparison-card" key={s.id} style={{borderTop:"3px solid "+colors[i]}}><strong>{s.name}</strong><p>{s.district}, {s.province}</p><span className="score-big">{score.overall}</span><span className="badge green">{rec.label.replaceAll("_"," ")}</span><footer><span>{rec.stationType.replaceAll("_"," ")}</span><span>{s.provenance.confidence} confidence</span></footer></article>})}</div>{selected.length?<><section className="card comparison-chart" aria-label="Site factor comparison radar chart"><ResponsiveContainer width="100%" height="100%"><RadarChart data={data} outerRadius="72%"><PolarGrid stroke="var(--line)"/><PolarAngleAxis dataKey="factor" tick={{fontSize:9,fill:"var(--muted)"}}/><PolarRadiusAxis domain={[0,100]} tick={{fontSize:8}}/><Tooltip contentStyle={{background:"var(--panel)",border:"1px solid var(--line)",borderRadius:8,fontSize:10}}/><Legend wrapperStyle={{fontSize:9}}/>{selected.map((s,i)=><Radar key={s.id} name={s.name.split(" ").slice(0,3).join(" ")} dataKey={s.id} stroke={colors[i]} fill={colors[i]} fillOpacity={.08}/>)}</RadarChart></ResponsiveContainer></section><section className="card" style={{marginTop:13}}><div className="table-wrap"><table className="data-table"><thead><tr><th>Decision factor</th>{selected.map(s=><th key={s.id}>{s.name}</th>)}</tr></thead><tbody>{comparisonRows.map(row=><tr key={row.label}><td><strong>{row.label}</strong></td>{selected.map(s=><td key={s.id}>{row.value(s)}</td>)}</tr>)}</tbody></table></div></section></>:<div className="card status-card"><HelpCircle/><strong>Select at least one site</strong><p>Choose sites above or add them from the map and opportunity list.</p></div>}</main>
}
