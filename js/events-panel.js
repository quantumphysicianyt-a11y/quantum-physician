/* =============================================
   QUANTUM ACADEMY — EVENTS PANEL v3
   
   Features:
   - Slide-out upcoming events panel
   - Clickable cards with detail expansion
   - Full month calendar modal (openFullCalendar())
   - Zoom/Meet auto-detect with Join button
   - Event category color-coding
   - Add to Calendar link
   - Map links for locations
   
   Usage:
   <script src="/js/events-panel.js"></script>
   <button onclick="openEventsPanel()">Upcoming Events</button>
   <button onclick="openFullCalendar()">Full Calendar</button>
   ============================================= */
(function(){
  var GCAL_KEY = 'AIzaSyAXEk-v7dDukS3S6_I1QLnt7uLDx9ZPHPE';
  var GCAL_ID = 'tracey@quantumphysician.com';
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DAYS_S = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  /* === CATEGORY DETECTION === */
  function detectCategory(title, desc){
    var t = (title+' '+desc).toLowerCase();
    if(t.match(/workshop|intensive/)) return {label:'Workshop', color:'#5ba8b2', bg:'rgba(91,168,178,.12)'};
    if(t.match(/live|session|fusion/)) return {label:'Live Session', color:'#4acfd9', bg:'rgba(74,207,217,.12)'};
    if(t.match(/office.?hour|q\s*&\s*a|q&a/)) return {label:'Office Hours', color:'#ad9b84', bg:'rgba(173,155,132,.12)'};
    if(t.match(/meditat|mindful|breath/)) return {label:'Meditation', color:'#a78bfa', bg:'rgba(167,139,250,.12)'};
    if(t.match(/course|class|lesson|learn/)) return {label:'Course', color:'#f59e0b', bg:'rgba(245,158,11,.12)'};
    return {label:'Event', color:'#5ba8b2', bg:'rgba(91,168,178,.08)'};
  }

  /* === ZOOM/MEET DETECTION === */
  function detectMeetingLink(ev){
    var text = (ev.description||'')+' '+(ev.location||'');
    var zoom = text.match(/https?:\/\/[^\s]*zoom\.us\/[^\s<")']*/i);
    if(zoom) return {url:zoom[0], type:'Zoom'};
    var meet = text.match(/https?:\/\/meet\.google\.com\/[^\s<")']*/i);
    if(meet) return {url:meet[0], type:'Google Meet'};
    var teams = text.match(/https?:\/\/teams\.microsoft\.com\/[^\s<")']*/i);
    if(teams) return {url:teams[0], type:'Teams'};
    var webex = text.match(/https?:\/\/[^\s]*webex\.com\/[^\s<")']*/i);
    if(webex) return {url:webex[0], type:'Webex'};
    return null;
  }

  /* === ADD TO CALENDAR === */
  function buildAddToCal(ev){
    var fmt = function(d){return d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');};
    var s = fmt(ev.start), e = fmt(ev.end);
    var title = encodeURIComponent(ev.title);
    var details = encodeURIComponent(ev.description.substring(0,200));
    var loc = encodeURIComponent(ev.location);
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+title+'&dates='+s+'/'+e+'&details='+details+'&location='+loc;
  }

  /* === SVG ICONS === */
  var icons = {
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    video: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
  };

  /* === STYLES === */
  var css = document.createElement('style');
  css.textContent = [
    /* Overlay */
    '.ep-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9998;opacity:0;transition:opacity .3s;pointer-events:none}',
    '.ep-overlay.open{opacity:1;pointer-events:auto}',
    /* Side panel */
    '.ep-panel{position:fixed;top:0;right:-420px;bottom:0;width:400px;max-width:90vw;z-index:9999;background:#071825;border-left:1px solid rgba(91,168,178,.15);display:flex;flex-direction:column;transition:right .35s cubic-bezier(.22,1,.36,1);box-shadow:-8px 0 30px rgba(0,0,0,.3)}',
    '.ep-panel.open{right:0}',
    '.ep-head{display:flex;align-items:center;justify-content:space-between;padding:20px 20px 16px;border-bottom:1px solid rgba(91,168,178,.15)}',
    '.ep-head h2{font-family:"Playfair Display",serif;font-size:20px;color:rgba(255,255,255,.88)}',
    '.ep-head-btns{display:flex;gap:6px}',
    '.ep-hbtn{width:32px;height:32px;border-radius:8px;background:none;border:1px solid rgba(91,168,178,.15);color:rgba(255,255,255,.5);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;font-size:14px}',
    '.ep-hbtn:hover{border-color:rgba(91,168,178,.35);color:rgba(255,255,255,.88)}',
    '.ep-hbtn svg{width:14px;height:14px;stroke:currentColor}',
    '.ep-body{flex:1;overflow-y:auto;padding:16px 20px}',
    /* Event cards */
    '.ep-month-label{font-size:11px;font-weight:700;color:#5ba8b2;text-transform:uppercase;letter-spacing:.08em;margin:16px 0 8px;padding-bottom:6px;border-bottom:1px solid rgba(91,168,178,.15)}',
    '.ep-month-label:first-child{margin-top:0}',
    '.ep-card{background:#112a42;border:1px solid rgba(91,168,178,.15);border-radius:10px;padding:14px 14px 10px 18px;margin-bottom:10px;position:relative;overflow:hidden;transition:border-color .15s;cursor:pointer}',
    '.ep-card::before{content:"";position:absolute;top:0;left:0;bottom:0;width:3px}',
    '.ep-card:hover{border-color:rgba(91,168,178,.35)}',
    '.ep-card.past{opacity:.45}',
    '.ep-card.today-ev{border-color:rgba(91,168,178,.3)}',
    '.ep-cat{display:inline-block;font-size:9px;padding:2px 7px;border-radius:3px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px}',
    '.ep-date{font-size:11px;font-weight:700;color:#5ba8b2;margin-bottom:3px}',
    '.ep-title{font-size:14px;font-weight:600;color:rgba(255,255,255,.88);margin-bottom:3px}',
    '.ep-time{font-size:12px;color:rgba(255,255,255,.5);display:flex;align-items:center;gap:4px}',
    '.ep-time svg{width:12px;height:12px;stroke:currentColor;flex-shrink:0}',
    '.ep-loc{font-size:11px;color:#ad9b84;margin-top:4px;display:flex;align-items:center;gap:4px}',
    '.ep-loc svg{width:11px;height:11px;stroke:currentColor;flex-shrink:0}',
    '.ep-join{display:inline-flex;align-items:center;gap:5px;margin-top:6px;padding:6px 14px;background:linear-gradient(135deg,#5ba8b2,#4acfd9);color:#fff;border-radius:6px;font-size:11px;font-weight:700;text-decoration:none;transition:box-shadow .15s}',
    '.ep-join:hover{box-shadow:0 4px 12px rgba(91,168,178,.4)}',
    '.ep-join svg{width:13px;height:13px;stroke:#fff}',
    '.ep-desc{font-size:12px;color:rgba(255,255,255,.5);margin-top:6px;line-height:1.5}',
    '.ep-detail{margin-top:8px;padding-top:8px;border-top:1px solid rgba(91,168,178,.15)}',
    '.ep-dbtn{font-size:11px;text-decoration:none;display:inline-flex;align-items:center;gap:3px;padding:4px 10px;border-radius:5px;transition:opacity .15s;margin-right:6px;margin-top:6px}',
    '.ep-dbtn:hover{opacity:.8}',
    '.ep-dbtn svg{width:11px;height:11px}',
    '.ep-hint{text-align:center;margin-top:4px;font-size:9px;color:rgba(255,255,255,.2)}',
    '.ep-empty{text-align:center;padding:40px 20px;color:rgba(255,255,255,.5);font-size:13px}',
    '.ep-spin{width:24px;height:24px;border:2px solid rgba(91,168,178,.15);border-top-color:#5ba8b2;border-radius:50%;animation:epspin .7s linear infinite;margin:40px auto;display:block}',
    '@keyframes epspin{to{transform:rotate(360deg)}}',
    '.ep-today-badge{display:inline-block;font-size:9px;padding:2px 6px;background:rgba(91,168,178,.15);color:#5ba8b2;border-radius:3px;font-weight:700;margin-left:6px;vertical-align:middle}',
    /* Full Calendar Modal */
    '.fc-modal{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.6)}',
    '.fc-modal.open{display:flex}',
    '.fc-box{background:#0a1e33;border:1px solid rgba(91,168,178,.15);border-radius:14px;width:900px;max-width:94vw;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.5)}',
    '.fc-top{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid rgba(91,168,178,.15)}',
    '.fc-top h2{font-family:"Playfair Display",serif;font-size:22px;color:rgba(255,255,255,.88)}',
    '.fc-nav{display:flex;align-items:center;gap:8px}',
    '.fc-nbtn{width:30px;height:30px;border-radius:6px;background:none;border:1px solid rgba(91,168,178,.15);color:rgba(255,255,255,.5);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}',
    '.fc-nbtn:hover{border-color:rgba(91,168,178,.35);color:#fff}',
    '.fc-nbtn svg{width:14px;height:14px;stroke:currentColor}',
    '.fc-today{padding:5px 12px;background:rgba(91,168,178,.08);border:1px solid rgba(91,168,178,.3);color:#5ba8b2;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer}',
    '.fc-close{font-size:14px}',
    '.fc-grid{padding:16px 22px;overflow-y:auto;flex:1}',
    '.fc-dow{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;font-size:10px;font-weight:700;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px}',
    '.fc-days{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}',
    '.fc-day{min-height:80px;padding:6px;border-radius:6px;border:1px solid transparent;transition:all .15s;cursor:default}',
    '.fc-day:hover{border-color:rgba(91,168,178,.15)}',
    '.fc-day .fc-num{font-size:12px;color:rgba(255,255,255,.4);margin-bottom:3px}',
    '.fc-day.cur .fc-num{color:rgba(255,255,255,.88)}',
    '.fc-day.today-cell{background:rgba(91,168,178,.06)}',
    '.fc-day.today-cell .fc-num{color:#5ba8b2;font-weight:700}',
    '.fc-day.has-ev{cursor:pointer}',
    '.fc-ev{font-size:10px;padding:2px 5px;border-radius:3px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}',
    '.fc-ev:hover{opacity:.8}',
    '.fc-day-more{font-size:9px;color:rgba(255,255,255,.4);margin-top:2px}',
    /* Day detail panel in modal */
    '.fc-detail{padding:16px 22px;border-top:1px solid rgba(91,168,178,.15);max-height:250px;overflow-y:auto}',
    '.fc-detail h3{font-family:"Playfair Display",serif;font-size:16px;margin-bottom:10px;color:rgba(255,255,255,.88)}',
    /* Light theme */
    '[data-theme="light"] .ep-panel{background:#f5f3ef;box-shadow:-8px 0 30px rgba(0,0,0,.1)}',
    '[data-theme="light"] .ep-head h2,[data-theme="light"] .ep-title{color:#1a1a2e}',
    '[data-theme="light"] .ep-card{background:#fff;border-color:rgba(173,155,132,.2)}',
    '[data-theme="light"] .ep-time,[data-theme="light"] .ep-desc,[data-theme="light"] .ep-hint{color:rgba(26,26,46,.5)}',
    '[data-theme="light"] .ep-detail,[data-theme="light"] .ep-month-label{border-color:rgba(173,155,132,.2)}',
    '[data-theme="light"] .fc-box{background:#f5f3ef;border-color:rgba(173,155,132,.2)}',
    '[data-theme="light"] .fc-top,[data-theme="light"] .fc-detail{border-color:rgba(173,155,132,.2)}',
    '[data-theme="light"] .fc-top h2,[data-theme="light"] .fc-detail h3{color:#1a1a2e}',
    '[data-theme="light"] .fc-day .fc-num{color:rgba(26,26,46,.35)}',
    '[data-theme="light"] .fc-day.cur .fc-num{color:#1a1a2e}',
    '[data-theme="light"] .fc-day.today-cell{background:rgba(91,168,178,.06)}'
  ].join('\n');
  document.head.appendChild(css);

  /* === DOM SETUP === */
  var overlay = document.createElement('div');
  overlay.className = 'ep-overlay';
  overlay.onclick = function(){ window.closeEventsPanel(); };
  document.body.appendChild(overlay);

  var panel = document.createElement('div');
  panel.className = 'ep-panel';
  panel.innerHTML = '<div class="ep-head"><h2>Upcoming Events</h2><div class="ep-head-btns"><button class="ep-hbtn" onclick="openFullCalendar()" title="Full Calendar">'+icons.grid+'</button><button class="ep-hbtn" onclick="closeEventsPanel()" title="Close">\u2715</button></div></div><div class="ep-body" id="epBody"><div class="ep-spin"></div></div>';
  document.body.appendChild(panel);

  // Full calendar modal
  var fcModal = document.createElement('div');
  fcModal.className = 'fc-modal';
  fcModal.innerHTML = '<div class="fc-box"><div class="fc-top"><h2 id="fcTitle"></h2><div class="fc-nav"><button class="fc-today" onclick="fcGoToday()">Today</button><button class="fc-nbtn" onclick="fcNav(-1)">'+icons.left+'</button><button class="fc-nbtn" onclick="fcNav(1)">'+icons.right+'</button><button class="fc-nbtn fc-close" onclick="closeFullCalendar()">\u2715</button></div></div><div class="fc-grid"><div class="fc-dow"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div><div class="fc-days" id="fcDays"></div></div><div class="fc-detail" id="fcDetail" style="display:none"></div></div>';
  fcModal.onclick = function(e){if(e.target===fcModal) window.closeFullCalendar();};
  document.body.appendChild(fcModal);

  var loaded = false;
  var allEvents = [];
  var fcMonth = new Date();

  /* === HELPERS === */
  function fmtTime(d){var h=d.getHours(),m=d.getMinutes(),ap=h>=12?'PM':'AM';h=h%12||12;return h+':'+(m<10?'0':'')+m+' '+ap;}
  function sameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
  function isToday(d){return sameDay(d,new Date());}
  function isTomorrow(d){var t=new Date();t.setDate(t.getDate()+1);return sameDay(d,t);}
  function fmtDateLabel(d){
    if(isToday(d)) return 'Today';
    if(isTomorrow(d)) return 'Tomorrow';
    return DAYS_S[d.getDay()]+', '+MONTHS[d.getMonth()]+' '+d.getDate();
  }

  /* === FETCH === */
  function fetchEvents(start, end, cb){
    var url = 'https://www.googleapis.com/calendar/v3/calendars/'+encodeURIComponent(GCAL_ID)+'/events?key='+GCAL_KEY+'&timeMin='+start.toISOString()+'&timeMax='+end.toISOString()+'&singleEvents=true&orderBy=startTime&maxResults=50';
    fetch(url).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();}).then(function(data){
      cb((data.items||[]).map(function(ev){
        return {id:ev.id, title:ev.summary||'Event', description:ev.description||'', location:ev.location||'', start:ev.start.dateTime?new Date(ev.start.dateTime):new Date(ev.start.date), end:ev.end.dateTime?new Date(ev.end.dateTime):new Date(ev.end.date), allDay:!ev.start.dateTime, htmlLink:ev.htmlLink||''};
      }));
    }).catch(function(e){console.error('Calendar error:',e);cb([]);});
  }

  function loadPanel(){
    var now=new Date();
    var s=new Date(now.getFullYear(),now.getMonth(),now.getDate()-7);
    var e=new Date(now.getFullYear(),now.getMonth()+3,0);
    fetchEvents(s,e,function(events){
      allEvents=events;
      renderPanel(events);
    });
  }

  /* === PANEL RENDER === */
  function renderPanel(events){
    var body=document.getElementById('epBody');
    if(!events.length){body.innerHTML='<div class="ep-empty">No events scheduled.<br><span style="font-size:11px;margin-top:6px;display:inline-block">Check back soon!</span></div>';return;}
    var now=new Date();
    var upcoming=events.filter(function(e){return e.end>=now;});
    var recent=events.filter(function(e){return e.end<now;}).reverse().slice(0,5);
    var html='';
    if(upcoming.length){
      var cm='';
      upcoming.forEach(function(ev){
        var ml=MONTHS[ev.start.getMonth()]+' '+ev.start.getFullYear();
        if(ml!==cm){cm=ml;html+='<div class="ep-month-label">'+ml+'</div>';}
        html+=renderCard(ev,false);
      });
    } else {
      html+='<div class="ep-empty" style="padding:20px">No upcoming events.<br>Check back soon!</div>';
    }
    if(recent.length){
      html+='<div class="ep-month-label" style="color:rgba(255,255,255,.4)">Recent</div>';
      recent.forEach(function(ev){html+=renderCard(ev,true);});
    }
    body.innerHTML=html;
  }

  function renderCard(ev, isPast){
    var cat=detectCategory(ev.title, ev.description);
    var todayEv=isToday(ev.start);
    var timeStr=ev.allDay?'All Day':fmtTime(ev.start)+' \u2013 '+fmtTime(ev.end);
    var hasLoc=ev.location.length>0;
    var locUrl=hasLoc?'https://www.google.com/maps/search/'+encodeURIComponent(ev.location):'';
    var meeting=detectMeetingLink(ev);
    var addCal=buildAddToCal(ev);
    var id='ep-'+ev.id.replace(/[^a-zA-Z0-9]/g,'').substring(0,16);
    var h='';
    h+='<div class="ep-card '+(isPast?'past ':' ')+(todayEv?'today-ev':'')+'" style="border-left-color:'+cat.color+'" onclick="var d=document.getElementById(\''+id+'\');if(d)d.style.display=d.style.display===\'none\'?\'block\':\'none\'">';
    h+='<div style="--cat-before:'+cat.color+'" class="ep-card-inner">';
    h+='<span class="ep-cat" style="color:'+cat.color+';background:'+cat.bg+'">'+cat.label+'</span>';
    h+='<div class="ep-date">'+fmtDateLabel(ev.start)+(todayEv?'<span class="ep-today-badge">TODAY</span>':'')+'</div>';
    h+='<div class="ep-title">'+ev.title+'</div>';
    h+='<div class="ep-time">'+icons.clock+' '+timeStr+'</div>';
    if(hasLoc) h+='<div class="ep-loc">'+icons.pin+' '+ev.location+'</div>';
    if(meeting&&!isPast) h+='<a href="'+meeting.url+'" target="_blank" onclick="event.stopPropagation()" class="ep-join">'+icons.video+' Join '+meeting.type+'</a>';
    h+='<div class="ep-detail" id="'+id+'" style="display:none">';
    if(ev.description) h+='<div class="ep-desc">'+ev.description.replace(/\n/g,'<br>')+'</div>';
    h+='<div style="margin-top:8px">';
    if(hasLoc) h+='<a href="'+locUrl+'" target="_blank" onclick="event.stopPropagation()" class="ep-dbtn" style="color:#5ba8b2;border:1px solid rgba(91,168,178,.3)">'+icons.pin+' Map</a>';
    h+='<a href="'+addCal+'" target="_blank" onclick="event.stopPropagation()" class="ep-dbtn" style="color:#4acfd9;border:1px solid rgba(74,207,217,.3)">'+icons.plus+' Add to Calendar</a>';
    if(ev.htmlLink) h+='<a href="'+ev.htmlLink+'" target="_blank" onclick="event.stopPropagation()" class="ep-dbtn" style="color:#ad9b84;border:1px solid rgba(173,155,132,.3)">'+icons.cal+' Google Cal</a>';
    h+='</div></div>';
    h+='<div class="ep-hint">tap for details</div>';
    h+='</div></div>';
    return h;
  }

  /* === FULL CALENDAR === */
  function renderFullCal(){
    var y=fcMonth.getFullYear(), m=fcMonth.getMonth();
    document.getElementById('fcTitle').textContent=MONTHS[m]+' '+y;
    var first=new Date(y,m,1);
    var last=new Date(y,m+1,0);
    var startDay=first.getDay();
    var daysInMonth=last.getDate();
    var today=new Date();
    var prevLast=new Date(y,m,0).getDate();
    var html='';
    // Prev month
    for(var i=startDay-1;i>=0;i--){html+='<div class="fc-day"><div class="fc-num">'+(prevLast-i)+'</div></div>';}
    // Current month
    for(var d=1;d<=daysInMonth;d++){
      var date=new Date(y,m,d);
      var isT=sameDay(date,today);
      var dayEv=allEvents.filter(function(e){return sameDay(e.start,date);});
      var hasE=dayEv.length>0;
      html+='<div class="fc-day cur '+(isT?'today-cell ':' ')+(hasE?'has-ev':'')+'" '+(hasE?'onclick="fcShowDay('+y+','+m+','+d+')"':'')+'>';
      html+='<div class="fc-num">'+d+'</div>';
      dayEv.slice(0,3).forEach(function(ev){
        var cat=detectCategory(ev.title,ev.description);
        html+='<div class="fc-ev" style="background:'+cat.bg+';color:'+cat.color+'">'+ev.title+'</div>';
      });
      if(dayEv.length>3) html+='<div class="fc-day-more">+'+(dayEv.length-3)+' more</div>';
      html+='</div>';
    }
    // Next month
    var total=startDay+daysInMonth;
    var rem=total%7===0?0:7-total%7;
    for(var j=1;j<=rem;j++){html+='<div class="fc-day"><div class="fc-num">'+j+'</div></div>';}
    document.getElementById('fcDays').innerHTML=html;
    document.getElementById('fcDetail').style.display='none';
  }

  window.fcShowDay = function(y,m,d){
    var date=new Date(y,m,d);
    var dayEv=allEvents.filter(function(e){return sameDay(e.start,date);});
    var detail=document.getElementById('fcDetail');
    if(!dayEv.length){detail.style.display='none';return;}
    var html='<h3>'+DAYS_S[date.getDay()]+', '+MONTHS[m]+' '+d+'</h3>';
    dayEv.forEach(function(ev){html+=renderCard(ev,false);});
    detail.innerHTML=html;
    detail.style.display='block';
  };

  function loadFullCal(){
    var y=fcMonth.getFullYear(), m=fcMonth.getMonth();
    var s=new Date(y,m,1);
    var e=new Date(y,m+1,0,23,59,59);
    fetchEvents(s,e,function(events){
      allEvents=allEvents.concat(events);
      // Deduplicate
      var seen={};
      allEvents=allEvents.filter(function(ev){if(seen[ev.id])return false;seen[ev.id]=true;return true;});
      renderFullCal();
    });
  }

  window.fcNav = function(dir){
    fcMonth=new Date(fcMonth.getFullYear(),fcMonth.getMonth()+dir,1);
    loadFullCal();
  };
  window.fcGoToday = function(){
    fcMonth=new Date();
    loadFullCal();
  };

  /* === PUBLIC API === */
  window.toggleEventsPanel = function(){
    if(panel.classList.contains('open')) window.closeEventsPanel();
    else window.openEventsPanel();
  };
  window.openEventsPanel = function(){
    panel.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow='hidden';
    if(!loaded){loaded=true;loadPanel();}
  };
  window.closeEventsPanel = function(){
    panel.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow='';
  };
  window.openFullCalendar = function(){
    window.closeEventsPanel();
    fcModal.classList.add('open');
    document.body.style.overflow='hidden';
    fcMonth=new Date();
    loadFullCal();
  };
  window.closeFullCalendar = function(){
    fcModal.classList.remove('open');
    document.body.style.overflow='';
  };
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){window.closeEventsPanel();window.closeFullCalendar();}
  });
})();
