'use strict';
(() => {
  const book=window.KOMPOS_BOOK;
  if(!book||book.pages?.length!==5||book.pages[2].materials?.length!==10||!book.ui)throw Error('Data buku KOMPOS tidak lengkap.');
  const ui=book.ui,$=id=>document.getElementById(id),sheet=$('page-sheet'),reader=$('reader'),progress=$('reading-progress');
  const safeText=value=>String(value??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  const format=(key,values={})=>String(ui[key]).replace(/\{(\w+)\}/g,(_,name)=>String(values[name]??''));
  const t=(key,values)=>safeText(format(key,values));
  const imageUrl=(folder,file)=>{if(!/^[a-z0-9-]+\.webp$/.test(file))throw Error('Nama aset tidak sah.');return 'assets/'+folder+'/'+file;};
  const illustration=file=>imageUrl('illustrations',file),materialUrl=slug=>imageUrl('materials',slug+'.webp');
  const storageKey='smartlibverse_kompos_read_v1',reflectionKey='smartlibverse_kompos_reflection_v1';
  let page=1,visited=new Set(),quiz={selected:0,explored:new Set(),message:ui.choose,tone:''};
  document.querySelectorAll('[data-ui]').forEach(el=>el.textContent=ui[el.dataset.ui]);
  document.querySelectorAll('[data-ui-aria]').forEach(el=>el.setAttribute('aria-label',ui[el.dataset.uiAria]));
  document.querySelectorAll('[data-ui-title]').forEach(el=>el.title=ui[el.dataset.uiTitle]);
  $('author-credit').textContent=format('writtenBy',book);$('publisher-credit').textContent=format('publishedBy',book);
  try{const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(saved))visited=new Set(saved.filter(x=>Number.isInteger(x)&&x>=1&&x<=5));}catch{}
  function saveProgress(){try{localStorage.setItem(storageKey,JSON.stringify([...visited].sort()));}catch{$('reader-status').textContent=ui.storageWarning;}}
  function setProgress(){
    visited.add(page);saveProgress();const count=visited.size,total=book.pageCount;
    $('page-counter').textContent=format('pageCounter',{page,total});
    $('read-count').textContent=format('visitedCounter',{count,total});$('nav-position').textContent=page+' / '+total;
    progress.setAttribute('aria-valuenow',String(count));$('progress-fill').style.width=(count/total*100)+'%';
    $('prev').disabled=page===1;$('next').disabled=page===total;
  }
  const header=()=>'<div class="sheet-header">'+t('bookHeader')+'</div>';
  const pageTitle=value=>'<h1 class="page-title">'+safeText(value)+'</h1>';
  const bubble=(who,value,extra='')=>'<div class="bubble '+extra+'"><strong>'+safeText(who)+'</strong>'+safeText(value)+'</div>';
  const figure=(file,alt,className='')=>'<img class="'+className+'" src="'+illustration(file)+'" alt="'+safeText(alt)+'" loading="lazy" decoding="async">';
  const credit=()=>'<span>'+t('writtenBy',book)+'</span><span>'+t('publishedBy',book)+'</span>';
  function renderCover(){const d=book.pages[0];return `<div class="page-content cover">${header()}<div class="eyebrow">${safeText(d.eyebrow)}</div><h1 class="cover-title">${safeText(d.mainTitle)}</h1><p class="cover-subtitle">${safeText(d.subtitle)}</p><p class="cover-theme">${safeText(book.theme)}</p>${figure('kulit-cerita.webp',ui.coverAlt,'cover-hero')}<p class="cover-tagline">${safeText(d.tagline)}</p><button class="start-button" id="start-reading" type="button">${t('start')} →</button><div class="cover-credits">${credit()}</div></div>`;}
  function renderIntro(){const d=book.pages[1];return `<div class="page-content">${header()}${pageTitle(d.title)}${d.panels.map((p,i)=>`<section class="panel"><h2 class="panel-heading">${i+1}. ${safeText(p.title)}</h2>${figure(p.image,p.alt)}<div class="dialogue-row">${bubble(ui.amir,p.amir)}${bubble(ui.aina,p.aina,'girl')}</div></section>`).join('')}<h2 class="section-label">${t('facts')}</h2><div class="facts">${d.facts.map((v,i)=>`<div class="fact"><span class="num">${i+1}</span><span>${safeText(v)}</span></div>`).join('')}</div></div>`;}
  function renderActivity(){const d=book.pages[2];return `<div class="page-content">${header()}${pageTitle(d.title)}<p class="page-subtitle">${safeText(d.subtitle)}</p><div class="comic-intro">${figure('proses-1-bahan.webp',ui.activityAlt)}<div class="dialogues"><p><strong>${t('amir')}:</strong> ${safeText(d.amir)}</p><p><strong>${t('aina')}:</strong> ${safeText(d.aina)}</p></div></div><p class="activity-instruction">${safeText(d.instruction)}</p><div class="materials" id="material-list" role="group" aria-label="${t('materialList')}"></div><section class="activity-question" aria-label="${t('activityLabel')}"><h2>${safeText(d.question)}</h2><div class="selected-material" id="selected-material"></div><div class="answer-buttons"><button type="button" id="answer-yes">✓ ${safeText(d.yes)}</button><button type="button" class="no" id="answer-no">✕ ${safeText(d.no)}</button></div><div class="feedback" id="quiz-feedback" role="status" aria-live="polite"></div><div class="activity-actions"><button type="button" id="retry">↺ ${t('retry')}</button><button type="button" id="show-answer">${t('showAnswer')}</button><button type="button" id="next-material">${t('nextMaterial')}</button><button type="button" id="reset-activity">${t('resetActivity')}</button><button type="button" class="skip" id="skip-activity">${t('skip')} →</button></div><p class="explored" id="explored-text" aria-live="polite"></p></section><aside class="knowledge"><strong>💡 ${t('knowledge')}</strong> ${safeText(d.knowledge)}</aside><p class="micro-note">${t('ungraded')}</p></div>`;}
  function renderSteps(){const d=book.pages[3];return `<div class="page-content">${header()}${pageTitle(d.title)}<p class="page-subtitle">${safeText(d.subtitle)}</p><div class="step-grid">${d.steps.map((s,i)=>`<section class="step-card">${figure(s.image,format('stepAlt',{step:i+1,title:s.title}))}<div class="text"><h2>${i+1}. ${safeText(s.title)}</h2><p>${safeText(s.description)}</p>${bubble(ui.amir,s.amir)}${bubble(ui.aina,s.aina,'girl')}</div></section>`).join('')}</div><div class="cutaway">${figure('keratan-kompos.webp',ui.cutawayAlt)}<div><h2 class="section-label">${t('changeTitle')}</h2><p>${t('changeText')}</p></div></div><div class="micro-note"><strong>${t('reminder')}</strong> ${safeText(d.tip)}</div><div class="micro-note"><strong>${t('safety')}</strong> ${safeText(d.safety)}</div></div>`;}
  function renderConclusion(){const d=book.pages[4],done=visited.size===book.pageCount;return `<div class="page-content">${header()}${pageTitle(d.title)}${figure('rumusan-taman.webp',ui.recapAlt,'recap-hero')}<h2 class="section-label">${t('summary')}</h2><div class="recap-grid">${d.summary.map((v,i)=>`<div class="recap-card"><span aria-hidden="true">${['🌿','🔬','♻️','🌱'][i]}</span>${safeText(v)}</div>`).join('')}</div><h2 class="section-label">${t('morals')}</h2><ul class="moral-list">${d.morals.map(v=>`<li>✓ ${safeText(v)}</li>`).join('')}</ul><div class="reflection"><label for="reflection-input">${t('reflection')} ${safeText(d.reflection)}</label><textarea id="reflection-input" maxlength="2000" placeholder="${t('reflectionPlaceholder')}" aria-label="${t('reflectionLabel')}"></textarea><small>${t('reflectionPrivacy')}</small></div>${figure('penutup-watak.webp',ui.finishAlt,'finish-art')}<div class="dialogue-row">${bubble(ui.amir,d.amir)}${bubble(ui.aina,d.aina,'girl')}</div><div class="end-badge">${safeText(d.end)}</div><p class="finish-line" role="status">${t(done?'finished':'unfinished')}</p><div class="cover-credits">${credit()}</div></div>`;}
  const renderers=[renderCover,renderIntro,renderActivity,renderSteps,renderConclusion];
  function getHashPage(){const m=location.hash.match(/^#page=(\d+)$/);return m?Math.max(1,Math.min(5,Number(m[1]))):1;}
  function goTo(target,{hash=true,focus=true}={}){
    page=Math.max(1,Math.min(5,Math.trunc(Number(target))||1));setProgress();
    sheet.className='page-sheet'+(page===1?' cover':'');sheet.dataset.page=String(page);
    sheet.innerHTML=renderers[page-1]();sheet.scrollTop=0;
    if(page===1)$('start-reading').addEventListener('click',()=>goTo(2));
    if(page===3)bindQuiz();
    if(page===5){const field=$('reflection-input');try{field.value=(sessionStorage.getItem(reflectionKey)||'').slice(0,2000);}catch{}field.addEventListener('input',()=>{try{sessionStorage.setItem(reflectionKey,field.value);}catch{}});}
    if(hash&&location.hash!=='#page='+page)location.hash='page='+page;
    document.title=format('documentTitle',{title:book.pages[page-1].title});
    sheet.setAttribute('aria-label',format('pageLabel',{page,total:5,title:book.pages[page-1].title}));
    if(focus){sheet.focus({preventScroll:true});sheet.scrollIntoView({block:'start',behavior:'instant'});}
  }
  function bindQuiz(){
    const d=book.pages[2],list=$('material-list'),current=$('selected-material'),feedback=$('quiz-feedback'),explored=$('explored-text');
    // Keep the actual buttons alive during feedback so keyboard focus is not lost.
    list.innerHTML=d.materials.map((m,i)=>`<button type="button" class="material" data-material="${i}" aria-pressed="false" aria-controls="selected-material"><img src="${materialUrl(m.slug)}" alt="" loading="lazy" decoding="async"><span class="label">${safeText(m.name)}</span><span class="tick" aria-hidden="true" hidden>✓</span></button>`).join('');
    function paint(){
      list.querySelectorAll('[data-material]').forEach((button,i)=>{button.setAttribute('aria-pressed',String(i===quiz.selected));button.setAttribute('aria-label',d.materials[i].name+(quiz.explored.has(i)?', '+ui.exploredSuffix:''));button.querySelector('.tick').hidden=!quiz.explored.has(i);});
      const m=d.materials[quiz.selected];current.innerHTML=`<img src="${materialUrl(m.slug)}" alt="${t('materialAlt',{name:m.name})}"><strong>${safeText(m.name)}</strong>`;
      feedback.textContent=quiz.message;feedback.className='feedback'+(quiz.tone?' '+quiz.tone:'');
      explored.textContent=format('explored',{count:quiz.explored.size,total:d.materials.length})+(quiz.explored.size===d.materials.length?' · '+ui.exploredAll:'');
    }
    list.addEventListener('click',event=>{const button=event.target.closest('[data-material]');if(!button||!list.contains(button))return;quiz.selected=Number(button.dataset.material);quiz.message=ui.chooseCategory;quiz.tone='';paint();});
    const answer=choice=>{const m=d.materials[quiz.selected];if(choice===m.suitable){quiz.explored.add(quiz.selected);quiz.message=format('correct',{fact:m.fact});quiz.tone='good';}else{quiz.message=ui.tryAgain;quiz.tone='try';}paint();};
    $('answer-yes').addEventListener('click',()=>answer(true));$('answer-no').addEventListener('click',()=>answer(false));
    $('show-answer').addEventListener('click',()=>{const m=d.materials[quiz.selected];quiz.explored.add(quiz.selected);quiz.message=format('answer',{category:m.suitable?d.yes:d.no,fact:m.fact});quiz.tone='good';paint();});
    $('retry').addEventListener('click',()=>{quiz.message=ui.retryHint;quiz.tone='';paint();});
    $('next-material').addEventListener('click',()=>{quiz.selected=(quiz.selected+1)%d.materials.length;quiz.message=ui.chooseCategory;quiz.tone='';paint();list.querySelector('[data-material="'+quiz.selected+'"]').focus();});
    $('reset-activity').addEventListener('click',()=>{quiz.selected=0;quiz.explored.clear();quiz.message=ui.resetHint;quiz.tone='';paint();});
    $('skip-activity').addEventListener('click',()=>goTo(4));paint();
  }
  $('prev').addEventListener('click',()=>goTo(page-1));$('next').addEventListener('click',()=>goTo(page+1));
  $('reset-reading').addEventListener('click',()=>{visited.clear();goTo(1);});
  const fullBtn=$('fullscreen-btn');
  function syncFullscreen(){const active=!!document.fullscreenElement||reader.classList.contains('reader-fullscreen');fullBtn.setAttribute('aria-label',active?ui.exitFullscreen:ui.enterFullscreen);fullBtn.setAttribute('aria-pressed',String(active));}
  fullBtn.addEventListener('click',async()=>{
    if(document.fullscreenElement){try{await document.exitFullscreen();}catch{}syncFullscreen();return;}
    if(reader.classList.contains('reader-fullscreen')){reader.classList.remove('reader-fullscreen');syncFullscreen();return;}
    if(reader.requestFullscreen){try{await reader.requestFullscreen();syncFullscreen();return;}catch{}}
    reader.classList.add('reader-fullscreen');syncFullscreen();
  });
  document.addEventListener('fullscreenchange',syncFullscreen);
  window.addEventListener('hashchange',()=>{const target=getHashPage();if(target!==page)goTo(target,{hash:false});});
  window.addEventListener('keydown',event=>{
    if(event.key==='Escape'){reader.classList.remove('reader-fullscreen');syncFullscreen();return;}
    if(event.target.closest('button,textarea,input,a,[contenteditable="true"]'))return;
    if(['ArrowLeft','PageUp'].includes(event.key)&&page>1){event.preventDefault();goTo(page-1);}
    if(['ArrowRight','PageDown'].includes(event.key)&&page<5){event.preventDefault();goTo(page+1);}
  });
  let touch=null;
  sheet.addEventListener('touchstart',event=>{touch=null;if(event.touches.length!==1||event.target.closest('button,textarea,input,a'))return;const first=event.touches[0];touch={x:first.clientX,y:first.clientY};},{passive:true});
  sheet.addEventListener('touchcancel',()=>{touch=null;},{passive:true});
  sheet.addEventListener('touchend',event=>{if(!touch||!event.changedTouches.length)return;const end=event.changedTouches[0],dx=end.clientX-touch.x,dy=end.clientY-touch.y;touch=null;if(Math.abs(dx)>100&&Math.abs(dx)>Math.abs(dy)*1.7){if(dx<0&&page<5)goTo(page+1);if(dx>0&&page>1)goTo(page-1);}},{passive:true});
  goTo(getHashPage(),{hash:false,focus:false});
})();
