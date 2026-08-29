(function(){
  const originalShowPair=window.showPair;
  if(typeof originalShowPair!=='function')return;
  const num=(v,d=2)=>v===null||v===undefined||Number.isNaN(Number(v))?'—':Number(v).toFixed(d);
  const esc=v=>String(v??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const scoreClass=v=>Number(v)>=0?'score-pos':'score-neg';
  const categories=e=>Object.entries(e?.category_scores||{}).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).map(([k,v])=>`<div>${esc(k)}</div><div class="${scoreClass(v)}">${num(v)}</div>`).join('');
  const signals=(items,limit=6)=>(items||[]).slice(0,limit).map(x=>`<div class="event"><strong>${esc(x.family)}</strong> <span class="muted">${esc(x.category)}</span><br><span class="${scoreClass(x.score)}">${num(x.score)}</span></div>`).join('')||'<div class="muted">No active directional family.</div>';
  const divergenceSignals=(items,limit=6)=>(items||[]).slice(0,limit).map(x=>`<div class="event"><strong>${esc(x.family)}</strong> <span class="muted">${esc(x.category)}</span><br><span class="${scoreClass(x.family_score)}">${esc(x.type)} ${esc(x.direction)} · ${esc(x.trend_relationship)} · ${esc(x.status)}</span><br><span>Quality ${num(x.quality,1)} · ${esc(x.instances_active??'—')}/${esc(x.instances_eligible??'—')} instances</span></div>`).join('')||'<div class="muted">No active divergence family.</div>';
  const divergenceCounts=d=>{
    const c=d?.counts||{};
    const rows=[['Classic bullish',c.classic_bullish],['Classic bearish',c.classic_bearish],['Hidden bullish',c.hidden_bullish],['Hidden bearish',c.hidden_bearish],['With trend',c.with_trend],['Against trend',c.against_trend],['Confirmed',c.confirmed],['Developing',c.developing]];
    return rows.map(([k,v])=>`<div>${k}</div><div>${esc(v??0)}</div>`).join('');
  };
  const correlations=(items,limit=5)=>(items||[]).slice(0,limit).map(x=>`<div class="event"><strong>${esc(x.instrument)}</strong><br><span>Corr ${num(x.correlation,3)}</span> · <span>Stability ${num(Number(x.stability)*100,1)}%</span></div>`).join('')||'<div class="muted">No usable correlation relationship.</div>';
  const redundancy=e=>{
    const cats=e?.indicator_correlation_adjustment?.categories||{};
    return Object.entries(cats).filter(([k])=>k!=='candles').sort((a,b)=>Number(b[1]?.mean_abs_correlation||0)-Number(a[1]?.mean_abs_correlation||0)).slice(0,6).map(([k,v])=>`<div>${esc(k)}</div><div>${num(Number(v.mean_abs_correlation||0)*100,1)}% corr · ${num(v.effective_families,1)} eff.</div>`).join('')||'<div class="muted">No redundancy statistics.</div>';
  };
  const timeframeCard=(name,x)=>{
    const e=x?.ensemble_v2||{};
    const d=x?.divergence||{};
    const m=x?.market_structure||{};
    const s=m.currency_strength||{};
    const c=m.correlation||{};
    const ex=m.exposure||{};
    return `<div class="tf"><h4>${name} · structure ${num(x?.score)}</h4><div class="kv"><div>Raw indicator score</div><div class="${scoreClass(x?.indicator_v2_score)}">${num(x?.indicator_v2_score)}</div><div>Divergence score</div><div class="${scoreClass(d.score)}">${num(d.score)}</div><div>Divergence confidence</div><div>${num(d.confidence)}%</div><div>Divergence instances</div><div>${esc(d.active_instances??'—')} active / ${esc(d.eligible_instances??'—')} eligible</div><div>Divergence families</div><div>${esc(d.active_families??'—')} active / ${esc(d.eligible_families??'—')} eligible</div><div>Currency strength</div><div>${esc(s.base||'—')} ${num(s.base_score)} vs ${esc(s.quote||'—')} ${num(s.quote_score)}</div><div>Strength differential</div><div class="${scoreClass(s.differential_score)}">${num(s.differential_score)}</div><div>Correlation confirmation</div><div class="${scoreClass(c.confirmation_score)}">${num(c.confirmation_score)}</div><div>Correlation stability</div><div>${c.average_stability==null?'—':num(Number(c.average_stability)*100,1)+'%'}</div><div>Structure confidence</div><div>${num(m.structure_confidence)}%</div><div>Exposure crowding</div><div>${num(ex.crowding)}%</div><div>Indicator confidence</div><div>${num(e.confidence)}%</div><div>Legacy Phase 1</div><div>${num(x?.legacy_phase1_score)}</div></div><h4 style="margin-top:12px">Divergence mix</h4><div class="kv">${divergenceCounts(d)}</div><h4 style="margin-top:12px">Strongest bullish divergence</h4><div class="events">${divergenceSignals(d.top_bullish)}</div><h4 style="margin-top:12px">Strongest bearish divergence</h4><div class="events">${divergenceSignals(d.top_bearish)}</div><h4 style="margin-top:12px">Top pair correlations</h4><div class="events">${correlations(c.top_relationships)}</div><h4 style="margin-top:12px">Indicator redundancy</h4><div class="kv">${redundancy(e)}</div><h4 style="margin-top:12px">Indicator category scores</h4><div class="kv">${categories(e)}</div><h4 style="margin-top:12px">Strongest bullish indicators</h4><div class="events">${signals(e.top_bullish)}</div><h4 style="margin-top:12px">Strongest bearish indicators</h4><div class="events">${signals(e.top_bearish)}</div></div>`;
  };
  window.showPair=function(k){
    originalShowPair(k);
    try{
      const p=DATA?.pairs?.[k]||{};
      const t=p.technical_analysis||{};
      const v=t.technical_v2||{};
      if(!v.schema_version)return;
      const legacy=t.legacy_phase1||{};
      const tf=t.timeframes||{};
      const html=`<div class="section wide"><h3>Technical Engine v2.2 — indicators + divergence + market structure</h3><div class="muted" style="margin-bottom:12px">Each H1/H4/D/W timeframe independently combines correlation-adjusted indicators (60%), classic/hidden divergence (10%), 8-currency relative strength (20%), and cross-pair correlation confirmation (10%). Divergence is evaluated on up to five parameter instances per eligible indicator, then collapsed to one family vote. Only after that are timeframe weights H1 15% / H4 30% / Daily 35% / Weekly 20% applied. Phase 1 remains preserved for audit.</div><div class="tf-grid"><div class="tf"><h4>Ensemble summary</h4><div class="kv"><div>Final technical score</div><div class="${scoreClass(t.technical_score)}">${num(t.technical_score)}</div><div>Final confidence</div><div>${num(t.technical_confidence)}%</div><div>Pre-exposure confidence</div><div>${num(t.technical_confidence_pre_exposure)}%</div><div>Weighted indicator quality</div><div>${num(v.weighted_indicator_confidence)}%</div><div>Weighted divergence quality</div><div>${num(v.weighted_divergence_confidence)}%</div><div>Weighted structure quality</div><div>${num(v.weighted_structure_confidence)}%</div><div>Weighted exposure crowding</div><div>${num(v.weighted_exposure_crowding)}%</div><div>Indicator instances</div><div>${esc(v.instances_succeeded??'—')} / ${esc(v.instances_attempted??'—')}</div><div>Divergence instances</div><div>${esc(v.divergence_active_instances??'—')} active / ${esc(v.divergence_eligible_instances??'—')} eligible</div></div></div><div class="tf"><h4>Legacy Phase 1 comparison</h4><div class="kv"><div>Legacy score</div><div class="${scoreClass(legacy.technical_score)}">${num(legacy.technical_score)}</div><div>Legacy confidence</div><div>${num(legacy.technical_confidence)}%</div><div>Legacy alignment</div><div>${num(legacy.alignment_score)}%</div><div>Preserved</div><div>${t.phase1_preserved?'Yes':'—'}</div></div></div></div><div class="tf-grid" style="margin-top:12px">${['H1','H4','D','W'].map(name=>timeframeCard(name,tf[name]||{})).join('')}</div></div>`;
      document.getElementById('detailPanel')?.insertAdjacentHTML('beforeend',html);
    }catch(_e){}
  };
})();
