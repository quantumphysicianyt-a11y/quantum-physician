/* =============================================
   QUANTUM ACADEMY — EVENTS PANEL v2
   Usage: <script src="/js/events-panel.js"></script>
   Then: <button onclick="openEventsPanel()">View Upcoming Events</button>
   ============================================= */
(function(){
  var GCAL_KEY = 'AIzaSyAXEk-v7dDukS3S6_I1QLnt7uLDx9ZPHPE';
  var GCAL_ID = 'tracey@quantumphysician.com';
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DAYS_S = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  var css = document.createElement('style');
  css.textContent = [
    '.ep-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9998;opacity:0;transition:opacity .3s;pointer-events:none}',
    '.ep-overlay.open{opacity:1;pointer-events:auto}',
    '.ep-panel{position:fixed;top:0;right:-420px;bottom:0;width:400px;max-width:90vw;z-index:9999;background:#071825;border-left:1px solid rgba(91,168,178,.15);display:flex;flex-direction:column;transition:right .35s cubic-bezier(.22,1,.36,1);box-shadow:-8px 0 30px rgba(0,0,0,.3)}',
    '.ep-panel.open{right:0}',
    '.ep-head{display:flex;align-items:center;justify-content:space-between;padding:20px 20px 16px;border-bottom:1px solid rgba(91,168,178,.15)}',
    '.ep-head h2{font-family:"Playfair Display",serif;font-size:20px;color:rgba(255,255,255,.88)}',
    '.ep-close{width:32px;height:32px;border-radius:8px;background:none;border:1px solid rgba(91,168,178,.15);color:rgba(255,255,255,.5);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;font-size:16px}',
    '.ep-close:hover{border-color:rgba(91,168,178,.35);color:rgba(255,255,255,.88)}',
    '.ep-body{flex:1;overflow-y:auto;padding:16px 20px}',
    '.ep-month-label{font-size:11px;font-weight:700;color:#5ba8b2;text-transform:uppercase;letter-spacing:.08em;margin:16px 0 8px;padding-bottom:6px;border-bottom:1px solid rgba(91,168,178,.15)}',
    '.ep-month-label:first-child{margin-top:0}',
    '.ep-card{background:#112a42;border:1px solid rgba(91,168,178,.15);border-radius:10px;padding:14px 14px 10px 18px;margin-bottom:10px;position:relative;overflow:hidden;transition:border-color .15s;cursor:pointer}',
    '.ep-card::before{content:"";position:absolute;top:0;left:0;bottom:0;width:3px;background:#5ba8b2}',
    '.ep-card:hover{border-color:rgba(91,168,178,.35)}',
    '.ep-card.past{opacity:.45}',
    '.ep-card.past::before{background:rgba(255,255,255,.3)}',
    '.ep-card.today-ev::before{background:linear-gradient(180deg,#5ba8b2,#4acfd9)}',
    '.ep-date{font-size:11px;font-weight:700;color:#5ba8b2;margin-bottom:3px}',
    '.ep-title{font-size:14px;font-weight:600;color:rgba(255,255,255,.88);margin-bottom:3px}',
    '.ep-time{font-size:12px;color:rgba(255,255,255,.5);display:flex;align-items:center;gap:4px}',
    '.ep-time svg{width:12px;height:12px;stroke:currentColor;flex-shrink:0}',
    '.ep-loc{font-size:11px;color:#ad9b84;margin-top:4px;display:flex;align-items:center;gap:4px}',
    '.ep-loc svg{width:11px;height:11px;stroke:currentColor;flex-shrink:0}',
    '.ep-desc{font-size:12px;color:rgba(255,255,255,.5);margin-top:6px;line-height:1.5}',
    '.ep-detail{margin-top:8px;padding-top:8px;border-top:1px solid rgba(91,168,178,.15)}',
    '.ep-detail-btns{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}',
    '.ep-detail-btns a{font-size:11px;text-decoration:none;display:flex;align-items:center;gap:3px;padding:4px 10px;border-radius:5px;transition:opacity .15s}',
    '.ep-detail-btns a:hover{opacity:.8}',
    '.ep-detail-btns a svg{width:11px;height:11px}',
    '.ep-expand-hint{text-align:center;margin-top:4px;font-size:9px;color:rgba(255,255,255,.25)}',
    '.ep-empty{text-align:center;padding:40px 20px;color:rgba(255,255,255,.5);font-size:13px}',
    '.ep-spin{width:24px;height:24px;border:2px solid rgba(91,168,178,.15);border-top-color:#5ba8b2;border-radius:50%;animation:epspin .7s linear infinite;margin:40px auto;display:block}',
    '@keyframes epspin{to{transform:rotate(360deg)}}',
    '.ep-today-badge{display:inline-block;font-size:9px;padding:2px 6px;background:rgba(91,168,178,.15);color:#5ba8b2;border-radius:3px;font-weight:700;margin-left:6px;vertical-align:middle}',
    '[data-theme="light"] .ep-panel{background:#f5f3ef;box-shadow:-8px 0 30px rgba(0,0,0,.1)}',
    '[data-theme="light"] .ep-head h2{color:#1a1a2e}',
    '[data-theme="light"] .ep-card{background:#ffffff;border-color:rgba(173,155,132,.2)}',
    '[data-theme="light"] .ep-title{color:#1a1a2e}',
    '[data-theme="light"] .ep-time,[data-theme="light"] .ep-desc,[data-theme="light"] .ep-expand-hint{color:rgba(26,26,46,.5)}',
    '[data-theme="light"] .ep-detail{border-color:rgba(173,155,132,.2)}',
    '[data-theme="light"] .ep-month-label{border-color:rgba(173,155,132,.2)}'
  ].join('\n');
  document.head.appendChild(css);

  var clockSvg = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
  var pinSvg = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';

  var overlay = document.createElement('div');
  overlay.className = 'ep-overlay';
  overlay.onclick = function(){ window.closeEventsPanel(); };
  document.body.appendChild(overlay);

  var panel = document.createElement('div');
  panel.className = 'ep-panel';
  panel.innerHTML = '<div class="ep-head"><h2>Upcoming Events</h2><button class="ep-close" onclick="closeEventsPanel()">\u2715</button></div><div class="ep-body" id="epBody"><div class="ep-spin"></div></div>';
  document.body.appendChild(panel);

  var loaded = false;

  function fmtTime(d){
    var h=d.getHours(),m=d.getMinutes(),ap=h>=12?'PM':'AM';
    h=h%12||12;
    return h+':'+(m<10?'0':'')+m+' '+ap;
  }
  function sameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
  function isToday(d){return sameDay(d,new Date());}
  function isTomorrow(d){var t=new Date();t.setDate(t.getDate()+1);return sameDay(d,t);}
  function fmtDateLabel(d){
    if(isToday(d)) return 'Today';
    if(isTomorrow(d)) return 'Tomorrow';
    return DAYS_S[d.getDay()]+', '+MONTHS[d.getMonth()]+' '+d.getDate();
  }

  function loadEvents(){
    var now = new Date();
    var start = new Date(now.getFullYear(), now.getMonth(), now.getDate()-7);
    var end = new Date(now.getFullYear(), now.getMonth()+3, 0);
    var url = 'https://www.googleapis.com/calendar/v3/calendars/'+encodeURIComponent(GCAL_ID)+'/events?key='+GCAL_KEY+'&timeMin='+start.toISOString()+'&timeMax='+end.toISOString()+'&singleEvents=true&orderBy=startTime&maxResults=30';

    fetch(url).then(function(res){
      if(!res.ok) throw new Error(res.status);
      return res.json();
    }).then(function(data){
      var events = (data.items||[]).map(function(ev){
        return {
          id: ev.id,
          title: ev.summary||'Event',
          description: ev.description||'',
          location: ev.location||'',
          start: ev.start.dateTime ? new Date(ev.start.dateTime) : new Date(ev.start.date),
          end: ev.end.dateTime ? new Date(ev.end.dateTime) : new Date(ev.end.date),
          allDay: !ev.start.dateTime,
          htmlLink: ev.htmlLink||''
        };
      });
      renderEvents(events);
    }).catch(function(e){
      console.error('Events panel error:', e);
      document.getElementById('epBody').innerHTML = '<div class="ep-empty">Unable to load events. Please try again later.</div>';
    });
  }

  function renderEvents(events){
    var body = document.getElementById('epBody');
    if(!events.length){
      body.innerHTML = '<div class="ep-empty">No events scheduled.<br><span style="font-size:11px;margin-top:6px;display:inline-block">Check back soon!</span></div>';
      return;
    }

    var now = new Date();
    var upcoming = events.filter(function(e){return e.end>=now;});
    var recent = events.filter(function(e){return e.end<now;}).reverse().slice(0,5);
    var html = '';

    if(upcoming.length){
      var curMonth = '';
      upcoming.forEach(function(ev){
        var ml = MONTHS[ev.start.getMonth()]+' '+ev.start.getFullYear();
        if(ml!==curMonth){curMonth=ml;html+='<div class="ep-month-label">'+ml+'</div>';}
        html += renderCard(ev,false);
      });
    } else {
      html += '<div class="ep-empty" style="padding:20px">No upcoming events.<br>Check back soon!</div>';
    }

    if(recent.length){
      html += '<div class="ep-month-label" style="color:rgba(255,255,255,.4)">Recent</div>';
      recent.forEach(function(ev){html += renderCard(ev,true);});
    }

    body.innerHTML = html;
  }

  function renderCard(ev, isPast){
    var todayEv = isToday(ev.start);
    var timeStr = ev.allDay ? 'All Day' : fmtTime(ev.start)+' \u2013 '+fmtTime(ev.end);
    var hasLoc = ev.location.length>0;
    var locUrl = hasLoc ? 'https://www.google.com/maps/search/'+encodeURIComponent(ev.location) : '';
    var hasDesc = ev.description.length>0;
    var id = 'ep-'+ev.id.replace(/[^a-zA-Z0-9]/g,'').substring(0,16);

    var h = '';
    h += '<div class="ep-card '+(isPast?'past ':' ')+(todayEv?'today-ev':'')+'" onclick="var d=document.getElementById(\''+id+'\');if(d)d.style.display=d.style.display===\'none\'?\'block\':\'none\'">';
    h += '<div class="ep-date">'+fmtDateLabel(ev.start)+(todayEv?'<span class="ep-today-badge">TODAY</span>':'')+'</div>';
    h += '<div class="ep-title">'+ev.title+'</div>';
    h += '<div class="ep-time">'+clockSvg+' '+timeStr+'</div>';
    if(hasLoc) h += '<div class="ep-loc">'+pinSvg+' '+ev.location+'</div>';
    h += '<div class="ep-detail" id="'+id+'" style="display:none">';
    if(hasDesc) h += '<div class="ep-desc">'+ev.description.replace(/\n/g,'<br>')+'</div>';
    h += '<div class="ep-detail-btns">';
    if(hasLoc) h += '<a href="'+locUrl+'" target="_blank" onclick="event.stopPropagation()" style="color:#5ba8b2;border:1px solid rgba(91,168,178,.3)">'+pinSvg+' Map</a>';
    if(ev.htmlLink) h += '<a href="'+ev.htmlLink+'" target="_blank" onclick="event.stopPropagation()" style="color:#ad9b84;border:1px solid rgba(173,155,132,.3)">'+clockSvg+' Google Cal</a>';
    h += '</div></div>';
    h += '<div class="ep-expand-hint">tap for details</div>';
    h += '</div>';
    return h;
  }

  window.toggleEventsPanel = function(){
    if(panel.classList.contains('open')) window.closeEventsPanel();
    else window.openEventsPanel();
  };

  window.openEventsPanel = function(){
    panel.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    if(!loaded){loaded=true;loadEvents();}
  };

  window.closeEventsPanel = function(){
    panel.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.addEventListener('keydown', function(e){
    if(e.key==='Escape') window.closeEventsPanel();
  });
})();
