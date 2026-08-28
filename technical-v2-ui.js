(function(){
  const originalShowPair=window.showPair;
  if(typeof originalShowPair!=='function')return;
  const num=(v,d=2)=>v===null||v===undefined||Number.isNaN(Number(v))?'—':Number(v).toFixed(d);
  const esc=v=>String(v??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const categories=e=>Object.entries(e?.category_scores||{}).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).map(([k,v])=>`<div>${esc(k)}</div><div class="${Number(v)>=0?'score-pos':'score-neg'}">${num(v)}</div>`).join('');
  const signals=(items,limit=6)=>(items||[]).slice(0,limit).map(x=>`<div class="event"><strong>${esc(x.family)}</strong> <span class="muted">${esc(x.category)}</span><br><span class="${Number(x.score)>=0?'score-pos':'score-neg'}">${num(x.score)}</span></div>`).join('')||'<div class="muted">No active directional family.</div>';
  const timeframeCard=(name,x)=>{const e=x?.ensemble_v2||{};return `<div class="tf"><h4>${name} · v2 ${num(x?.score)}</h4><div class="kv"><div>Indicator confidence</div><div>${num(e.confidence)}%</div><div>Legacy Phase 1</div><div>${num(x?.legacy_phase1_score)}</div><div>Families succeeded</div><div>${esc(e.families_succeeded??'—')} / ${esc(e.families_attempted??'—')}</div><div>Instances succeeded</div><div>${esc(e.instances_succeeded??'—')} / ${esc(e.instances_attempted??'—')}</div><div>5-parameter families</div><div>${esc(e.parameterized_families??'—')}</div><div>Candle patterns</div><div>${esc(e.candlestick_patterns??'—')}</div><div>Coverage</div><div>${e.coverage==null?'—':num(Number(e.coverage)*100,1)+'%'}</div></div><h4 style="margin-top:12px">Category scores</h4><div class="kv">${categories(e)}</div><h4 style="margin-top:12px">Strongest bullish</h4><div class="events">${signals(e.top_bullish)}</div><h4 style="margin-top:12px">Strongest bearish</h4><div class="events">${signals(e.top_bearish)}</div></div>`};
  window.showPair=function(k){
    originalShowPair(k);
    try{
      const p=DATA?.pairs?.[k]||{};
      const t=p.technical_analysis||{};
      const v=t.technical_v2||{};
      if(!v.schema_version)return;
      const legacy=t.legacy_phase1||{};
      const tf=t.timeframes||{};
      const html=`<div class="section wide"><h3>Technical Engine v2 — broad indicator ensemble</h3><div class="muted" style="margin-bottom:12px">pandas-ta-classic · five parameter scales where meaningful · Phase 1 preserved for audit · timeframe weights H1 15% / H4 30% / Daily 35% / Weekly 20%</div><div class="tf-grid"><div class="tf"><h4>Ensemble summary</h4><div class="kv"><div>V2 technical score</div><div class="${Number(t.technical_score)>=0?'score-pos':'score-neg'}">${num(t.technical_score)}</div><div>V2 confidence</div><div>${num(t.technical_confidence)}%</div><div>Weighted indicator quality</div><div>${num(v.weighted_indicator_confidence)}%</div><div>Total instances</div><div>${esc(v.instances_succeeded??'—')} / ${esc(v.instances_attempted??'—')}</div></div></div><div class="tf"><h4>Legacy Phase 1 comparison</h4><div class="kv"><div>Legacy score</div><div class="${Number(legacy.technical_score)>=0?'score-pos':'score-neg'}">${num(legacy.technical_score)}</div><div>Legacy confidence</div><div>${num(legacy.technical_confidence)}%</div><div>Legacy alignment</div><div>${num(legacy.alignment_score)}%</div><div>Preserved</div><div>${t.phase1_preserved?'Yes':'—'}</div></div></div></div><div class="tf-grid" style="margin-top:12px">${['H1','H4','D','W'].map(name=>timeframeCard(name,tf[name]||{})).join('')}</div></div>`;
      document.getElementById('detailPanel')?.insertAdjacentHTML('beforeend',html);
    }catch(_e){}
  };
})();
