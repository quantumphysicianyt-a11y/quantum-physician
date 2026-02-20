/* =============================================
   QUANTUM ACADEMY — EVENTS PANEL v5
   ============================================= */
(function(){
  var GCAL_KEY = 'AIzaSyAXEk-v7dDukS3S6_I1QLnt7uLDx9ZPHPE';
  var GCAL_ID = 'tracey@quantumphysician.com';
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DAYS_S = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  function detectCategory(title, desc){
    var t = (title+' '+desc).toLowerCase();
    if(t.match(/workshop|intensive/)) return {label:'Workshop', color:'#5ba8b2', bg:'rgba(91,168,178,.12)', bgL:'rgba(91,168,178,.1)'};
    if(t.match(/live|session|fusion/)) return {label:'Live Session', color:'#4acfd9', bg:'rgba(74,207,217,.12)', bgL:'rgba(74,207,217,.1)'};
    if(t.match(/office.?hour|q\s*&\s*a|q&a/)) return {label:'Office Hours', color:'#ad9b84', bg:'rgba(173,155,132,.12)', bgL:'rgba(173,155,132,.1)'};
    if(t.match(/meditat|mindful|breath/)) return {label:'Meditation', color:'#a78bfa', bg:'rgba(167,139,250,.12)', bgL:'rgba(167,139,250,.1)'};
    if(t.match(/course|class|lesson|learn/)) return {label:'Course', color:'#f59e0b', bg:'rgba(245,158,11,.12)', bgL:'rgba(245,158,11,.1)'};
    if(t.match(/fundamental/)) return {label:'Fundamentals', color:'#34d399', bg:'rgba(52,211,153,.12)', bgL:'rgba(52,211,153,.1)'};
    return {label:'Event', color:'#5ba8b2', bg:'rgba(91,168,178,.08)', bgL:'rgba(91,168,178,.06)'};
  }

  function detectMeetingLink(ev){
    var text = (ev.description||'')+' '+(ev.location||'');
    var zoom = text.match(/https?:\/\/[^\s]*zoom\.us\/[^\s<")']*/i);
    if(zoom) return {url:zoom[0], type:'Zoom'};
    var meet = text.match(/https?:\/\/meet\.google\.com\/[^\s<")']*/i);
    if(meet) return {url:meet[0], type:'Google Meet'};
    var teams = text.match(/https?:\/\/teams\.microsoft\.com\/[^\s<")']*/i);
    if(teams) return {url:teams[0], type:'Teams'};
    return null;
  }

  function buildAddToCal(ev){
    var fmt = function(d){return d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');};
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(ev.title)+'&dates='+fmt(ev.start)+'/'+fmt(ev.end)+'&details='+encodeURIComponent((ev.description||'').substring(0,200))+'&location='+encodeURIComponent(ev.location);
  }

  var icons = {
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    video: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>'
  };

  var css = document.createElement('style');
  css.textContent = [
    /* Overlay */
    '.ep-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9998;opacity:0;transition:opacity .3s;pointer-events:none;backdrop-filter:blur(3px)}',
    '.ep-overlay.open{opacity:1;pointer-events:auto}',
    /* Side panel */
    '.ep-panel{position:fixed;top:0;right:-420px;bottom:0;width:400px;max-width:90vw;z-index:9999;background:linear-gradient(180deg,#081d30 0%,#071825 100%);border-left:1px solid rgba(91,168,178,.2);display:flex;flex-direction:column;transition:right .35s cubic-bezier(.22,1,.36,1);box-shadow:-8px 0 40px rgba(0,0,0,.4)}',
    '.ep-panel.open{right:0}',
    '.ep-head{display:flex;align-items:center;justify-content:space-between;padding:20px 20px 16px;border-bottom:1px solid rgba(91,168,178,.15);background:linear-gradient(135deg,rgba(91,168,178,.04),rgba(74,207,217,.02))}',
    '.ep-head h2{font-family:"Playfair Display",serif;font-size:20px;color:rgba(255,255,255,.88)}',
    '.ep-head-btns{display:flex;gap:6px}',
    '.ep-fullcal-btn{display:flex;align-items:center;gap:6px;padding:7px 14px;background:linear-gradient(135deg,rgba(91,168,178,.15),rgba(74,207,217,.1));border:1px solid rgba(91,168,178,.35);color:#4acfd9;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;transition:all .2s;letter-spacing:.02em}',
    '.ep-fullcal-btn:hover{background:linear-gradient(135deg,rgba(91,168,178,.25),rgba(74,207,217,.15));box-shadow:0 2px 12px rgba(74,207,217,.2);border-color:rgba(74,207,217,.5)}',
    '.ep-fullcal-btn svg{width:14px;height:14px;stroke:currentColor}',
    '.ep-hbtn{width:32px;height:32px;border-radius:8px;background:none;border:1px solid rgba(91,168,178,.15);color:rgba(255,255,255,.5);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;font-size:14px}',
    '.ep-hbtn:hover{border-color:rgba(91,168,178,.35);color:rgba(255,255,255,.88)}',
    '.ep-body{flex:1;overflow-y:auto;padding:16px 20px}',
    /* Cards */
    '.ep-month-label{font-size:11px;font-weight:700;color:#5ba8b2;text-transform:uppercase;letter-spacing:.08em;margin:16px 0 8px;padding-bottom:6px;border-bottom:1px solid rgba(91,168,178,.1)}',
    '.ep-month-label:first-child{margin-top:0}',
    '.ep-card{background:linear-gradient(135deg,rgba(17,42,66,.8),rgba(15,41,66,.6));border:1px solid rgba(91,168,178,.12);border-radius:10px;padding:14px 14px 10px 18px;margin-bottom:10px;position:relative;overflow:hidden;transition:all .2s;cursor:pointer}',
    '.ep-card::before{content:"";position:absolute;top:0;left:0;bottom:0;width:3px}',
    '.ep-card:hover{border-color:rgba(91,168,178,.3);transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,.2)}',
    '.ep-card.past{opacity:.4}',
    '.ep-card.today-ev{border-color:rgba(91,168,178,.3);box-shadow:0 0 20px rgba(91,168,178,.08)}',
    '.ep-cat{display:inline-block;font-size:9px;padding:2px 7px;border-radius:3px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px}',
    '.ep-date{font-size:11px;font-weight:700;color:#5ba8b2;margin-bottom:3px}',
    '.ep-title{font-size:14px;font-weight:600;color:rgba(255,255,255,.88);margin-bottom:3px}',
    '.ep-time{font-size:12px;color:rgba(255,255,255,.5);display:flex;align-items:center;gap:4px}',
    '.ep-time svg{width:12px;height:12px;stroke:currentColor;flex-shrink:0}',
    '.ep-loc{font-size:11px;color:#ad9b84;margin-top:4px;display:flex;align-items:center;gap:4px}',
    '.ep-loc svg{width:11px;height:11px;stroke:currentColor;flex-shrink:0}',
    '.ep-join{display:inline-flex;align-items:center;gap:5px;margin-top:8px;padding:7px 16px;background:linear-gradient(135deg,#5ba8b2,#4acfd9);color:#fff;border-radius:8px;font-size:11px;font-weight:700;text-decoration:none;transition:all .2s;box-shadow:0 2px 8px rgba(91,168,178,.3)}',
    '.ep-join:hover{box-shadow:0 4px 16px rgba(91,168,178,.5);transform:translateY(-1px)}',
    '.ep-join svg{width:13px;height:13px;stroke:#fff}',
    '.ep-desc{font-size:12px;color:rgba(255,255,255,.5);margin-top:6px;line-height:1.5}',
    '.ep-detail{margin-top:8px;padding-top:8px;border-top:1px solid rgba(91,168,178,.1)}',
    '.ep-dbtn{font-size:11px;text-decoration:none;display:inline-flex;align-items:center;gap:3px;padding:5px 12px;border-radius:6px;transition:all .15s;margin-right:6px;margin-top:6px}',
    '.ep-dbtn:hover{opacity:.8;transform:translateY(-1px)}',
    '.ep-dbtn svg{width:11px;height:11px}',
    '.ep-hint{text-align:center;margin-top:5px;font-size:9px;color:rgba(255,255,255,.18)}',
    '.ep-empty{text-align:center;padding:40px 20px;color:rgba(255,255,255,.5);font-size:13px}',
    '.ep-spin{width:24px;height:24px;border:2px solid rgba(91,168,178,.15);border-top-color:#5ba8b2;border-radius:50%;animation:epspin .7s linear infinite;margin:40px auto;display:block}',
    '@keyframes epspin{to{transform:rotate(360deg)}}',
    '.ep-today-badge{display:inline-block;font-size:9px;padding:2px 6px;background:rgba(91,168,178,.15);color:#5ba8b2;border-radius:3px;font-weight:700;margin-left:6px;vertical-align:middle}',

    /* ===== FULL CALENDAR MODAL ===== */
    '.fc-modal{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.7);backdrop-filter:blur(6px)}',
    '.fc-modal.open{display:flex}',
    /* Animate in */
    '.fc-box{background:linear-gradient(170deg,#0d2740 0%,#081d30 40%,#071825 100%);border:1px solid rgba(91,168,178,.25);border-radius:18px;width:960px;max-width:94vw;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 28px 90px rgba(0,0,0,.7),0 0 60px rgba(91,168,178,.06),0 0 0 1px rgba(91,168,178,.05);animation:fcSlideIn .4s cubic-bezier(.22,1,.36,1)}',
    '@keyframes fcSlideIn{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}',
    /* Header */
    '.fc-top{display:flex;align-items:center;justify-content:space-between;padding:20px 28px;border-bottom:1px solid rgba(91,168,178,.12);background:linear-gradient(135deg,rgba(91,168,178,.06),rgba(74,207,217,.02),transparent);position:relative;overflow:hidden}',
    /* Subtle shimmer line */
    '.fc-top::after{content:"";position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(91,168,178,.2),rgba(74,207,217,.15),transparent)}',
    '.fc-brand{display:flex;align-items:center;gap:16px}',
    '.fc-brand img{height:48px;width:auto;opacity:.85;filter:drop-shadow(0 2px 8px rgba(91,168,178,.15))}',
    '.fc-brand-text h2{font-family:"Playfair Display",serif;font-size:24px;color:rgba(255,255,255,.92);line-height:1.2}',
    '.fc-brand-text .fc-sub{font-size:10px;color:rgba(91,168,178,.6);text-transform:uppercase;letter-spacing:.12em;margin-top:2px;font-weight:600}',
    '.fc-nav{display:flex;align-items:center;gap:8px}',
    '.fc-nbtn{width:34px;height:34px;border-radius:8px;background:rgba(255,255,255,.03);border:1px solid rgba(91,168,178,.15);color:rgba(255,255,255,.5);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}',
    '.fc-nbtn:hover{border-color:rgba(91,168,178,.4);color:#5ba8b2;background:rgba(91,168,178,.06);box-shadow:0 2px 8px rgba(91,168,178,.1)}',
    '.fc-nbtn svg{width:14px;height:14px;stroke:currentColor}',
    '.fc-today{padding:7px 16px;background:linear-gradient(135deg,rgba(91,168,178,.15),rgba(74,207,217,.08));border:1px solid rgba(91,168,178,.35);color:#4acfd9;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;transition:all .2s}',
    '.fc-today:hover{background:linear-gradient(135deg,rgba(91,168,178,.25),rgba(74,207,217,.15));box-shadow:0 2px 12px rgba(74,207,217,.2)}',
    /* Grid */
    '.fc-grid{padding:18px 28px;overflow-y:auto;flex:1}',
    '.fc-dow{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;font-size:10px;font-weight:700;color:rgba(91,168,178,.45);text-transform:uppercase;letter-spacing:.12em;margin-bottom:8px}',
    '.fc-days{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}',
    '.fc-day{min-height:88px;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,.02);transition:all .2s;cursor:default;background:rgba(255,255,255,.015)}',
    '.fc-day:hover{border-color:rgba(91,168,178,.1);background:rgba(91,168,178,.02)}',
    '.fc-day .fc-num{font-size:13px;color:rgba(255,255,255,.2);margin-bottom:4px;font-weight:500}',
    '.fc-day.cur .fc-num{color:rgba(255,255,255,.65);font-weight:600}',
    /* Today cell - glowing */
    '.fc-day.today-cell{background:linear-gradient(135deg,rgba(91,168,178,.08),rgba(74,207,217,.04));border-color:rgba(91,168,178,.25);box-shadow:inset 0 0 24px rgba(91,168,178,.05),0 0 16px rgba(91,168,178,.04)}',
    '.fc-day.today-cell .fc-num{color:#4acfd9;font-weight:700;font-size:15px;text-shadow:0 0 12px rgba(74,207,217,.3)}',
    '.fc-day.has-ev{cursor:pointer}',
    '.fc-day.has-ev:hover{border-color:rgba(91,168,178,.3);background:rgba(91,168,178,.05);transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.2),0 0 12px rgba(91,168,178,.04)}',
    '.fc-ev{font-size:10px;padding:3px 6px;border-radius:4px;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;font-weight:600;transition:all .15s;border-left:2px solid}',
    '.fc-ev:hover{transform:translateX(2px)}',
    '.fc-day-more{font-size:9px;color:rgba(91,168,178,.4);margin-top:2px;font-weight:600}',
    /* Detail panel */
    '.fc-detail{padding:18px 28px;border-top:1px solid rgba(91,168,178,.12);max-height:280px;overflow-y:auto;background:linear-gradient(180deg,rgba(91,168,178,.04),transparent);animation:fcDetailIn .3s ease}',
    '@keyframes fcDetailIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}',
    '.fc-detail h3{font-family:"Playfair Display",serif;font-size:17px;margin-bottom:12px;color:rgba(255,255,255,.88)}',
    /* Legend */
    '.fc-legend{display:flex;gap:14px;padding:12px 28px;border-top:1px solid rgba(91,168,178,.06);flex-wrap:wrap;background:rgba(0,0,0,.1)}',
    '.fc-leg{display:flex;align-items:center;gap:5px;font-size:9px;color:rgba(255,255,255,.3);font-weight:600;text-transform:uppercase;letter-spacing:.05em}',
    '.fc-leg-dot{width:8px;height:8px;border-radius:2px}',

    /* ===== LIGHT THEME - FULL OVERRIDES ===== */
    '[data-theme="light"] .ep-panel{background:linear-gradient(180deg,#faf8f5,#f0ede6);box-shadow:-8px 0 30px rgba(0,0,0,.1)}',
    '[data-theme="light"] .ep-head{background:linear-gradient(135deg,rgba(173,155,132,.06),transparent);border-color:rgba(173,155,132,.15)}',
    '[data-theme="light"] .ep-head h2{color:#1a1a2e}',
    '[data-theme="light"] .ep-card{background:linear-gradient(135deg,#fff,#fdfcfa);border-color:rgba(173,155,132,.2)}',
    '[data-theme="light"] .ep-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.07);border-color:rgba(173,155,132,.35)}',
    '[data-theme="light"] .ep-title{color:#1a1a2e}',
    '[data-theme="light"] .ep-time{color:#5a5a6e}',
    '[data-theme="light"] .ep-desc{color:#5a5a6e}',
    '[data-theme="light"] .ep-hint{color:rgba(26,26,46,.2)}',
    '[data-theme="light"] .ep-detail{border-color:rgba(173,155,132,.15)}',
    '[data-theme="light"] .ep-month-label{border-color:rgba(173,155,132,.15);color:#5ba8b2}',
    '[data-theme="light"] .ep-loc{color:#8a7a68}',
    '[data-theme="light"] .ep-date{color:#5ba8b2}',
    /* Light - Full Calendar */
    '[data-theme="light"] .fc-box{background:linear-gradient(170deg,#faf8f5,#f4f1ec);border-color:rgba(173,155,132,.25);box-shadow:0 28px 90px rgba(0,0,0,.15),0 0 0 1px rgba(173,155,132,.1)}',
    '[data-theme="light"] .fc-top{border-color:rgba(173,155,132,.15);background:linear-gradient(135deg,rgba(91,168,178,.04),transparent)}',
    '[data-theme="light"] .fc-top::after{background:linear-gradient(90deg,transparent,rgba(173,155,132,.2),rgba(91,168,178,.15),transparent)}',
    '[data-theme="light"] .fc-brand-text h2{color:#1a1a2e}',
    '[data-theme="light"] .fc-brand-text .fc-sub{color:rgba(91,168,178,.7)}',
    '[data-theme="light"] .fc-dow{color:rgba(91,168,178,.5)}',
    '[data-theme="light"] .fc-day{background:rgba(0,0,0,.015);border-color:rgba(173,155,132,.06)}',
    '[data-theme="light"] .fc-day:hover{background:rgba(173,155,132,.04);border-color:rgba(173,155,132,.15)}',
    '[data-theme="light"] .fc-day .fc-num{color:rgba(26,26,46,.25)}',
    '[data-theme="light"] .fc-day.cur .fc-num{color:#2a2a3e;font-weight:600}',
    '[data-theme="light"] .fc-day.today-cell{background:linear-gradient(135deg,rgba(91,168,178,.06),rgba(74,207,217,.03));border-color:rgba(91,168,178,.2)}',
    '[data-theme="light"] .fc-day.today-cell .fc-num{color:#3a8a94;text-shadow:none}',
    '[data-theme="light"] .fc-day.has-ev:hover{background:rgba(91,168,178,.04);box-shadow:0 4px 12px rgba(0,0,0,.06)}',
    '[data-theme="light"] .fc-ev{font-weight:700}',
    '[data-theme="light"] .fc-detail{background:linear-gradient(180deg,rgba(173,155,132,.03),transparent);border-color:rgba(173,155,132,.12)}',
    '[data-theme="light"] .fc-detail h3{color:#1a1a2e}',
    '[data-theme="light"] .fc-legend{background:rgba(173,155,132,.03);border-color:rgba(173,155,132,.08)}',
    '[data-theme="light"] .fc-leg{color:rgba(26,26,46,.4)}',
    '[data-theme="light"] .fc-nbtn{background:rgba(0,0,0,.02);border-color:rgba(173,155,132,.2);color:#5a5a6e}',
    '[data-theme="light"] .fc-nbtn:hover{border-color:rgba(91,168,178,.3);color:#3a8a94;background:rgba(91,168,178,.04)}',
    '[data-theme="light"] .fc-today{background:linear-gradient(135deg,rgba(91,168,178,.1),rgba(74,207,217,.06));border-color:rgba(91,168,178,.3);color:#3a8a94}',
    /* Light - Side panel detail cards in calendar */
    '[data-theme="light"] .fc-detail .ep-card{background:linear-gradient(135deg,#fff,#fdfcfa);border-color:rgba(173,155,132,.2)}',
    '[data-theme="light"] .fc-detail .ep-title{color:#1a1a2e}',
    '[data-theme="light"] .fc-detail .ep-time{color:#5a5a6e}',
    '[data-theme="light"] .fc-detail .ep-desc{color:#5a5a6e}',
    '[data-theme="light"] .fc-detail .ep-date{color:#5ba8b2}'
  ].join('\n');
  document.head.appendChild(css);

  /* === DOM === */
  var overlay = document.createElement('div');
  overlay.className = 'ep-overlay';
  overlay.onclick = function(){ window.closeEventsPanel(); };
  document.body.appendChild(overlay);

  var panel = document.createElement('div');
  panel.className = 'ep-panel';
  panel.innerHTML = '<div class="ep-head"><h2>Upcoming Events</h2><div class="ep-head-btns"><button class="ep-fullcal-btn" onclick="openFullCalendar()">'+icons.cal+' Full Calendar</button><button class="ep-hbtn" onclick="closeEventsPanel()">\u2715</button></div></div><div class="ep-body" id="epBody"><div class="ep-spin"></div></div>';
  document.body.appendChild(panel);

  var fcModal = document.createElement('div');
  fcModal.className = 'fc-modal';
  fcModal.innerHTML = '<div class="fc-box">'
    +'<div class="fc-top"><div class="fc-brand"><img src="/assets/images/QuantumPhysAcad_STACKED-RGB.png" alt="Quantum Academy" onerror="this.style.display=\'none\'"><div class="fc-brand-text"><h2 id="fcTitle"></h2><div class="fc-sub">Quantum Academy Schedule</div></div></div>'
    +'<div class="fc-nav"><button class="fc-today" onclick="fcGoToday()">Today</button><button class="fc-nbtn" onclick="fcNav(-1)">'+icons.left+'</button><button class="fc-nbtn" onclick="fcNav(1)">'+icons.right+'</button><button class="fc-nbtn" onclick="closeFullCalendar()" style="margin-left:10px">\u2715</button></div></div>'
    +'<div class="fc-grid"><div class="fc-dow"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div><div class="fc-days" id="fcDays"></div></div>'
    +'<div class="fc-detail" id="fcDetail" style="display:none"></div>'
    +'<div class="fc-legend" id="fcLegend"></div></div>';
  fcModal.onclick = function(e){if(e.target===fcModal) window.closeFullCalendar();};
  document.body.appendChild(fcModal);

  var loaded=false, allEvents=[], fcMonth=new Date();

  function fmtTime(d){var h=d.getHours(),m=d.getMinutes(),ap=h>=12?'PM':'AM';h=h%12||12;return h+':'+(m<10?'0':'')+m+' '+ap;}
  function sameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
  function isToday(d){return sameDay(d,new Date());}
  function isTomorrow(d){var t=new Date();t.setDate(t.getDate()+1);return sameDay(d,t);}
  function fmtDateLabel(d){if(isToday(d))return'Today';if(isTomorrow(d))return'Tomorrow';return DAYS_S[d.getDay()]+', '+MONTHS[d.getMonth()]+' '+d.getDate();}

  function fetchEvents(start,end,cb){
    var url='https://www.googleapis.com/calendar/v3/calendars/'+encodeURIComponent(GCAL_ID)+'/events?key='+GCAL_KEY+'&timeMin='+start.toISOString()+'&timeMax='+end.toISOString()+'&singleEvents=true&orderBy=startTime&maxResults=50';
    fetch(url).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();}).then(function(data){
      cb((data.items||[]).map(function(ev){return{id:ev.id,title:ev.summary||'Event',description:ev.description||'',location:ev.location||'',start:ev.start.dateTime?new Date(ev.start.dateTime):new Date(ev.start.date),end:ev.end.dateTime?new Date(ev.end.dateTime):new Date(ev.end.date),allDay:!ev.start.dateTime,htmlLink:ev.htmlLink||''};}));
    }).catch(function(e){console.error('Calendar error:',e);cb([]);});
  }

  function loadPanel(){
    var now=new Date();
    fetchEvents(new Date(now.getFullYear(),now.getMonth(),now.getDate()-7),new Date(now.getFullYear(),now.getMonth()+3,0),function(events){allEvents=events;renderPanel(events);});
  }

  function renderPanel(events){
    var body=document.getElementById('epBody');
    if(!events.length){body.innerHTML='<div class="ep-empty">No events scheduled.<br><span style="font-size:11px;margin-top:6px;display:inline-block">Check back soon!</span></div>';return;}
    var now=new Date();
    var upcoming=events.filter(function(e){return e.end>=now;});
    var recent=events.filter(function(e){return e.end<now;}).reverse().slice(0,5);
    var html='';
    if(upcoming.length){var cm='';upcoming.forEach(function(ev){var ml=MONTHS[ev.start.getMonth()]+' '+ev.start.getFullYear();if(ml!==cm){cm=ml;html+='<div class="ep-month-label">'+ml+'</div>';}html+=renderCard(ev,false);});}
    else html+='<div class="ep-empty" style="padding:20px">No upcoming events.<br>Check back soon!</div>';
    if(recent.length){html+='<div class="ep-month-label" style="color:rgba(255,255,255,.35)">Recent</div>';recent.forEach(function(ev){html+=renderCard(ev,true);});}
    body.innerHTML=html;
  }

  function renderCard(ev,isPast){
    var cat=detectCategory(ev.title,ev.description),todayEv=isToday(ev.start);
    var timeStr=ev.allDay?'All Day':fmtTime(ev.start)+' \u2013 '+fmtTime(ev.end);
    var hasLoc=ev.location.length>0,meeting=detectMeetingLink(ev);
    var id='ep-'+ev.id.replace(/[^a-zA-Z0-9]/g,'').substring(0,16);
    var h='<div class="ep-card '+(isPast?'past ':' ')+(todayEv?'today-ev':'')+'" onclick="var d=document.getElementById(\''+id+'\');if(d)d.style.display=d.style.display===\'none\'?\'block\':\'none\'">';
    h+='<span class="ep-cat" style="color:'+cat.color+';background:'+cat.bg+'">'+cat.label+'</span>';
    h+='<div class="ep-date">'+fmtDateLabel(ev.start)+(todayEv?'<span class="ep-today-badge">TODAY</span>':'')+'</div>';
    h+='<div class="ep-title">'+ev.title+'</div>';
    h+='<div class="ep-time">'+icons.clock+' '+timeStr+'</div>';
    if(hasLoc)h+='<div class="ep-loc">'+icons.pin+' '+ev.location+'</div>';
    if(meeting&&!isPast)h+='<a href="'+meeting.url+'" target="_blank" onclick="event.stopPropagation()" class="ep-join">'+icons.video+' Join '+meeting.type+'</a>';
    h+='<div class="ep-detail" id="'+id+'" style="display:none">';
    if(ev.description)h+='<div class="ep-desc">'+ev.description.replace(/\n/g,'<br>')+'</div>';
    h+='<div style="margin-top:8px">';
    if(hasLoc)h+='<a href="https://www.google.com/maps/search/'+encodeURIComponent(ev.location)+'" target="_blank" onclick="event.stopPropagation()" class="ep-dbtn" style="color:#5ba8b2;border:1px solid rgba(91,168,178,.3)">'+icons.pin+' Map</a>';
    h+='<a href="'+buildAddToCal(ev)+'" target="_blank" onclick="event.stopPropagation()" class="ep-dbtn" style="color:#4acfd9;border:1px solid rgba(74,207,217,.3)">'+icons.plus+' Add to Calendar</a>';
    if(ev.htmlLink)h+='<a href="'+ev.htmlLink+'" target="_blank" onclick="event.stopPropagation()" class="ep-dbtn" style="color:#ad9b84;border:1px solid rgba(173,155,132,.3)">'+icons.cal+' Google Cal</a>';
    h+='</div></div><div class="ep-hint">tap for details</div></div>';
    return h;
  }

  function renderFullCal(){
    var y=fcMonth.getFullYear(),m=fcMonth.getMonth();
    document.getElementById('fcTitle').textContent=MONTHS[m]+' '+y;
    var first=new Date(y,m,1),last=new Date(y,m+1,0);
    var startDay=first.getDay(),daysInMonth=last.getDate();
    var today=new Date(),prevLast=new Date(y,m,0).getDate();
    var html='',catsSeen={};
    for(var i=startDay-1;i>=0;i--)html+='<div class="fc-day"><div class="fc-num">'+(prevLast-i)+'</div></div>';
    for(var d=1;d<=daysInMonth;d++){
      var date=new Date(y,m,d),isT=sameDay(date,today);
      var dayEv=allEvents.filter(function(e){return sameDay(e.start,date);});
      var hasE=dayEv.length>0;
      html+='<div class="fc-day cur '+(isT?'today-cell ':' ')+(hasE?'has-ev':'')+'" '+(hasE?'onclick="fcShowDay('+y+','+m+','+d+')"':'')+'>';
      html+='<div class="fc-num">'+d+'</div>';
      dayEv.slice(0,3).forEach(function(ev){
        var cat=detectCategory(ev.title,ev.description);catsSeen[cat.label]={color:cat.color,bg:cat.bg};
        html+='<div class="fc-ev" style="background:'+cat.bg+';color:'+cat.color+';border-left-color:'+cat.color+'">'+ev.title+'</div>';
      });
      if(dayEv.length>3)html+='<div class="fc-day-more">+'+(dayEv.length-3)+' more</div>';
      html+='</div>';
    }
    var total=startDay+daysInMonth,rem=total%7===0?0:7-total%7;
    for(var j=1;j<=rem;j++)html+='<div class="fc-day"><div class="fc-num">'+j+'</div></div>';
    document.getElementById('fcDays').innerHTML=html;
    document.getElementById('fcDetail').style.display='none';
    var leg='';Object.keys(catsSeen).forEach(function(k){leg+='<div class="fc-leg"><div class="fc-leg-dot" style="background:'+catsSeen[k].color+'"></div>'+k+'</div>';});
    document.getElementById('fcLegend').innerHTML=leg;
  }

  window.fcShowDay=function(y,m,d){
    var date=new Date(y,m,d);
    var dayEv=allEvents.filter(function(e){return sameDay(e.start,date);});
    var detail=document.getElementById('fcDetail');
    if(!dayEv.length){detail.style.display='none';return;}
    var html='<h3>'+DAYS_S[date.getDay()]+', '+MONTHS[m]+' '+d+'</h3>';
    dayEv.forEach(function(ev){html+=renderCard(ev,false);});
    detail.innerHTML=html;detail.style.display='block';
  };

  function loadFullCal(){
    var y=fcMonth.getFullYear(),m=fcMonth.getMonth();
    fetchEvents(new Date(y,m,1),new Date(y,m+1,0,23,59,59),function(events){
      allEvents=allEvents.concat(events);
      var seen={};allEvents=allEvents.filter(function(ev){if(seen[ev.id])return false;seen[ev.id]=true;return true;});
      renderFullCal();
    });
  }

  window.fcNav=function(dir){fcMonth=new Date(fcMonth.getFullYear(),fcMonth.getMonth()+dir,1);loadFullCal();};
  window.fcGoToday=function(){fcMonth=new Date();loadFullCal();};

  window.toggleEventsPanel=function(){if(panel.classList.contains('open'))window.closeEventsPanel();else window.openEventsPanel();};
  window.openEventsPanel=function(){panel.classList.add('open');overlay.classList.add('open');document.body.style.overflow='hidden';if(!loaded){loaded=true;loadPanel();}};
  window.closeEventsPanel=function(){panel.classList.remove('open');overlay.classList.remove('open');document.body.style.overflow='';};
  window.openFullCalendar=function(){window.closeEventsPanel();fcModal.classList.add('open');document.body.style.overflow='hidden';fcMonth=new Date();loadFullCal();};
  window.closeFullCalendar=function(){fcModal.classList.remove('open');document.body.style.overflow='';};
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){window.closeEventsPanel();window.closeFullCalendar();}});
})();
