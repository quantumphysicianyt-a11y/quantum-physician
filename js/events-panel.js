/* =============================================
   QUANTUM ACADEMY — EVENTS PANEL
   Drop this script on any page for a slide-out 
   upcoming events drawer from Google Calendar.
   
   Usage: 
   <script src="/js/events-panel.js"></script>
   
   Then add a button anywhere:
   <button onclick="toggleEventsPanel()">View Upcoming Events</button>
   
   Or it auto-creates a floating button if none exists.
   ============================================= */

(function(){
  const GCAL_KEY = 'AIzaSyAXEk-v7dDukS3S6_I1QLnt7uLDx9ZPHPE';
  const GCAL_ID = 'tracey@quantumphysician.com';
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const DAYS_S = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // Inject styles
  const css = document.createElement('style');
  css.textContent = `
    .ep-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9998;opacity:0;transition:opacity .3s;pointer-events:none}
    .ep-overlay.open{opacity:1;pointer-events:auto}
    .ep-panel{position:fixed;top:0;right:-420px;bottom:0;width:400px;max-width:90vw;z-index:9999;background:var(--ep-bg,#071825);border-left:1px solid var(--ep-bdr,rgba(91,168,178,.15));display:flex;flex-direction:column;transition:right .35s cubic-bezier(.22,1,.36,1);box-shadow:-8px 0 30px rgba(0,0,0,.3)}
    .ep-panel.open{right:0}
    .ep-head{display:flex;align-items:center;justify-content:space-between;padding:20px 20px 16px;border-bottom:1px solid var(--ep-bdr,rgba(91,168,178,.15))}
    .ep-head h2{font-family:"Playfair Display",serif;font-size:20px;color:var(--ep-text,rgba(255,255,255,.88))}
    .ep-close{width:32px;height:32px;border-radius:8px;background:none;border:1px solid var(--ep-bdr,rgba(91,168,178,.15));color:var(--ep-muted,rgba(255,255,255,.5));cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;font-size:16px}
    .ep-close:hover{border-color:rgba(91,168,178,.35);color:var(--ep-text,rgba(255,255,255,.88))}
    .ep-body{flex:1;overflow-y:auto;padding:16px 20px}
    .ep-month-label{font-size:11px;font-weight:700;color:#5ba8b2;text-transform:uppercase;letter-spacing:.08em;margin:16px 0 8px;padding-bottom:6px;border-bottom:1px solid var(--ep-bdr,rgba(91,168,178,.15))}
    .ep-month-label:first-child{margin-top:0}
    .ep-card{background:var(--ep-card,#112a42);border:1px solid var(--ep-bdr,rgba(91,168,178,.15));border-radius:10px;padding:14px 14px 14px 18px;margin-bottom:10px;position:relative;overflow:hidden;transition:border-color .15s}
    .ep-card::before{content:'';position:absolute;top:0;left:0;bottom:0;width:3px;background:#5ba8b2}
    .ep-card:hover{border-color:rgba(91,168,178,.35)}
    .ep-card.past{opacity:.45}
    .ep-card.past::before{background:var(--ep-muted,rgba(255,255,255,.5))}
    .ep-card.today-ev::before{background:linear-gradient(180deg,#5ba8b2,#4acfd9)}
    .ep-date{font-size:11px;font-weight:700;color:#5ba8b2;margin-bottom:3px}
    .ep-title{font-size:14px;font-weight:600;color:var(--ep-text,rgba(255,255,255,.88));margin-bottom:3px}
    .ep-time{font-size:12px;color:var(--ep-muted,rgba(255,255,255,.5));display:flex;align-items:center;gap:4px}
    .ep-time svg{width:12px;height:12px;stroke:currentColor;flex-shrink:0}
    .ep-loc{font-size:11px;color:#ad9b84;margin-top:4px;display:flex;align-items:center;gap:4px}
    .ep-loc svg{width:11px;height:11px;stroke:currentColor;flex-shrink:0}
    .ep-desc{font-size:12px;color:var(--ep-muted,rgba(255,255,255,.5));margin-top:6px;line-height:1.5}
    .ep-empty{text-align:center;padding:40px 20px;color:var(--ep-muted,rgba(255,255,255,.5));font-size:13px}
    .ep-spin{width:24px;height:24px;border:2px solid var(--ep-bdr,rgba(91,168,178,.15));border-top-color:#5ba8b2;border-radius:50%;animation:epspin .7s linear infinite;margin:40px auto;display:block}
    @keyframes epspin{to{transform:rotate(360deg)}}
    .ep-today-badge{display:inline-block;font-size:9px;padding:2px 6px;background:rgba(91,168,178,.15);color:#5ba8b2;border-radius:3px;font-weight:700;margin-left:6px;vertical-align:middle}

    /* Light theme support */
    [data-theme="light"] .ep-panel{--ep-bg:#f5f3ef;--ep-card:#ffffff;--ep-bdr:rgba(173,155,132,.2);--ep-text:#1a1a2e;--ep-muted:rgba(26,26,46,.5);box-shadow:-8px 0 30px rgba(0,0,0,.1)}
  `;
  document.head.appendChild(css);

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'ep-overlay';
  overlay.onclick = function(){ closeEventsPanel(); };
  document.body.appendChild(overlay);

  // Create panel
  const panel = document.createElement('div');
  panel.className = 'ep-panel';
  panel.innerHTML = `
    <div class="ep-head">
      <h2>Upcoming Events</h2>
      <button class="ep-close" onclick="closeEventsPanel()">✕</button>
    </div>
    <div class="ep-body" id="epBody"><div class="ep-spin"></div></div>
  `;
  document.body.appendChild(panel);

  // SVGs
  const clockSvg = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
  const pinSvg = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';

  let loaded = false;

  function fmtTime(d){
    let h=d.getHours(),m=d.getMinutes(),ap=h>=12?'PM':'AM';
    h=h%12||12;
    return h+':'+(m<10?'0':'')+m+' '+ap;
  }
  function sameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()}
  function isToday(d){return sameDay(d,new Date())}
  function isTomorrow(d){const t=new Date();t.setDate(t.getDate()+1);return sameDay(d,t)}

  function fmtDateLabel(d){
    if(isToday(d)) return 'Today';
    if(isTomorrow(d)) return 'Tomorrow';
    return DAYS_S[d.getDay()]+', '+MONTHS[d.getMonth()]+' '+d.getDate();
  }

  async function loadEvents(){
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth()+3, 0);
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GCAL_ID)}/events?key=${GCAL_KEY}&timeMin=${start.toISOString()}&timeMax=${end.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=30`;

    try{
      const res = await fetch(url);
      if(!res.ok) throw new Error(res.status);
      const data = await res.json();
      const events = (data.items||[]).map(ev=>({
        title: ev.summary||'Event',
        description: ev.description||'',
        location: ev.location||'',
        start: ev.start.dateTime ? new Date(ev.start.dateTime) : new Date(ev.start.date),
        end: ev.end.dateTime ? new Date(ev.end.dateTime) : new Date(ev.end.date),
        allDay: !ev.start.dateTime
      }));
      renderEvents(events);
    }catch(e){
      console.error('Events panel error:', e);
      document.getElementById('epBody').innerHTML = '<div class="ep-empty">Unable to load events. Please try again later.</div>';
    }
  }

  function renderEvents(events){
    const body = document.getElementById('epBody');
    if(!events.length){
      body.innerHTML = '<div class="ep-empty">No upcoming events scheduled.<br><span style="font-size:11px;margin-top:6px;display:inline-block">Check back soon!</span></div>';
      return;
    }

    // Group by month
    let html = '';
    let currentMonthLabel = '';

    events.forEach(ev=>{
      const monthLabel = MONTHS[ev.start.getMonth()] + ' ' + ev.start.getFullYear();
      if(monthLabel !== currentMonthLabel){
        currentMonthLabel = monthLabel;
        html += `<div class="ep-month-label">${monthLabel}</div>`;
      }

      const todayEv = isToday(ev.start);
      const timeStr = ev.allDay ? 'All Day' : `${fmtTime(ev.start)} – ${fmtTime(ev.end)}`;

      html += `<div class="ep-card ${todayEv?'today-ev':''}">
        <div class="ep-date">${fmtDateLabel(ev.start)}${todayEv?'<span class="ep-today-badge">TODAY</span>':''}</div>
        <div class="ep-title">${ev.title}</div>
        <div class="ep-time">${clockSvg} ${timeStr}</div>
        ${ev.location?`<div class="ep-loc">${pinSvg} ${ev.location}</div>`:''}
        ${ev.description?`<div class="ep-desc">${ev.description.substring(0,150).replace(/\n/g,'<br>')}${ev.description.length>150?'...':''}</div>`:''}
      </div>`;
    });

    body.innerHTML = html;
  }

  // Public API
  window.toggleEventsPanel = function(){
    const isOpen = panel.classList.contains('open');
    if(isOpen){
      closeEventsPanel();
    } else {
      panel.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      if(!loaded){ loaded=true; loadEvents(); }
    }
  };

  window.openEventsPanel = function(){
    panel.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    if(!loaded){ loaded=true; loadEvents(); }
  };

  window.closeEventsPanel = function(){
    panel.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  // ESC key closes
  document.addEventListener('keydown', function(e){
    if(e.key==='Escape') closeEventsPanel();
  });

})();
