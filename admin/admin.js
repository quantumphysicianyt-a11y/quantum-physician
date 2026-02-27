let currentAdmin=null;const SUPABASE_URL='https://rihlrfiqokqrlmzjjyxj.supabase.co';
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpaGxyZmlxb2txcmxtempqeXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MTU2NDYsImV4cCI6MjA4NDA5MTY0Nn0.G2TQKSmQpPYb8Cyzo7R833G7xkr0855faLRjrJ9ov-4';
// SERVICE_KEY removed — all admin ops go through admin-proxy Netlify function
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
// sbAdmin removed — using proxyFrom() instead
function getAdminToken(){return sessionStorage.getItem('qp_admin_token')||''}
async function adminProxy(payload){var res=await fetch('/.netlify/functions/admin-proxy',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+getAdminToken()},body:JSON.stringify(payload)});var json=await res.json();if(!res.ok)throw new Error(json.error||'Proxy request failed');return json}
function proxyFrom(table){return{_table:table,_select:'*',_filters:[],_order:null,_limit:null,_single:false,select:function(s,opts){this._select=s;if(opts&&opts.count)this._count=opts.count;return this},range:function(from,to){this._range={from:from,to:to};return this},eq:function(c,v){this._filters.push({column:c,op:'eq',value:v});return this},neq:function(c,v){this._filters.push({column:c,op:'neq',value:v});return this},gt:function(c,v){this._filters.push({column:c,op:'gt',value:v});return this},gte:function(c,v){this._filters.push({column:c,op:'gte',value:v});return this},lt:function(c,v){this._filters.push({column:c,op:'lt',value:v});return this},lte:function(c,v){this._filters.push({column:c,op:'lte',value:v});return this},like:function(c,v){this._filters.push({column:c,op:'like',value:v});return this},ilike:function(c,v){this._filters.push({column:c,op:'ilike',value:v});return this},is:function(c,v){this._filters.push({column:c,op:'is',value:v});return this},in:function(c,v){this._filters.push({column:c,op:'in',value:v});return this},not:function(c,fo,v){this._filters.push({column:c,op:'not',filterOp:fo,value:v});return this},or:function(v){this._filters.push({op:'or',value:v});return this},order:function(c,opts){this._order={column:c,ascending:opts?opts.ascending!==false:true};return this},limit:function(n){this._limit=n;return this},single:function(){this._single=true;return this},maybeSingle:function(){this._filters.push({op:'maybeSingle'});return this},then:function(resolve,reject){return adminProxy({type:'query',table:this._table,select:this._select,filters:this._filters,order:this._order,limit:this._limit,single:this._single,range:this._range,count:this._count}).then(function(r){return{data:r.data,count:r.count!==undefined?r.count:null,error:null}}).then(resolve,function(e){return resolve?resolve({data:null,error:{message:e.message}}):reject?reject(e):null})},insert:function(rows){var t=this._table;var sel=this._select;return{select:function(s){sel=s;return this},then:function(resolve,reject){return adminProxy({type:'insert',table:t,data:rows,select:sel!=='*'?sel:undefined}).then(function(r){return{data:r.data,error:null}}).then(resolve,function(e){return resolve?resolve({data:null,error:{message:e.message,code:e.message&&e.message.indexOf('duplicate')!==-1?'23505':''}}):reject?reject(e):null})}}},update:function(d){var t=this._table;var f=this._filters;return{eq:function(c,v){f.push({column:c,op:'eq',value:v});return this},then:function(resolve,reject){return adminProxy({type:'update',table:t,data:d,filters:f}).then(function(r){return{data:r.data,error:null}}).then(resolve,function(e){return resolve?resolve({data:null,error:{message:e.message}}):reject?reject(e):null})}}},delete:function(){var t=this._table;var f=this._filters;return{eq:function(c,v){f.push({column:c,op:'eq',value:v});return this},then:function(resolve,reject){return adminProxy({type:'delete',table:t,filters:f}).then(function(r){return{data:r.data,error:null}}).then(resolve,function(e){return resolve?resolve({data:null,error:{message:e.message}}):reject?reject(e):null})}}},upsert:function(d,opts){var t=this._table;return{then:function(resolve,reject){return adminProxy({type:'insert',table:t,data:d}).then(function(r){return{data:r.data,error:null}}).then(resolve,function(e){return resolve?resolve({data:null,error:{message:e.message}}):reject?reject(e):null})}}}}}
async function authAdminAPI(action,params){return adminProxy({type:'auth_admin',action:action,params:params})}

function toggleTheme(){var c=document.documentElement.getAttribute('data-theme')||'dark',n=c==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',n);localStorage.setItem('qa-theme',n);var l=document.getElementById('themeLabel');if(l)l.textContent=n==='dark'?'Light':'Dark';applyChartTheme();if(typeof renderAnalyticsCharts==='function'&&currentPage==='analytics')renderAnalyticsCharts()}
(function(){var s=localStorage.getItem('qa-theme');if(s){document.documentElement.setAttribute('data-theme',s);var l=document.getElementById('themeLabel');if(l)l.textContent=s==='dark'?'Light':'Dark'}})();
const FUSION_NAMES={'bundle-all':'Complete Bundle','session-01':'S1: Intolerance & Sensitivity','session-02':'S2: Anxiety & Overwhelm','session-03':'S3: Pain & Tension','session-04':'S4: Sleep & Reset','session-05':'S5: Digestion & Integration','session-06':'S6: Immune Balance','session-07':'S7: Hormonal Harmony','session-08':'S8: Phobias & Fear','session-09':'S9: Fatigue & Vitality','session-10':'S10: Weight & Self-Perception','session-11':'S11: Relationships & Boundaries','session-12':'S12: Purpose & Alignment'};
const ACADEMY_NAMES={'quantum-vision-boards':'Quantum Vision Boards','becoming-present':'Becoming Present','breaking-up-with-your-beliefs':'Breaking Up with Your Beliefs','creative-mind-mapping':'Creative Mind Mapping','power-of-the-question':'The Power of The Question','transformational-mastery':'Transformational Mastery'};
const ACADEMY_SLUGS=['breaking-up-with-your-beliefs','power-of-the-question','creative-mind-mapping','quantum-vision-boards','becoming-present'];
const FUSION_IMAGES={'bundle-all':'https://fusionsessions.netlify.app/13.png','session-01':'https://static.wixstatic.com/media/11062b_ba3825500c114d35830c1d21a475bf6c~mv2.jpeg/v1/crop/x_913,y_0,w_2160,h_2160/fill/w_350,h_250,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Dog%20and%20Woman%20Interaction.jpeg','session-02':'https://static.wixstatic.com/media/599d5afdcec7458e9a131b2189cfd232.jpg/v1/fill/w_350,h_250,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Stressed%20Office%20Woman.jpg','session-03':'https://static.wixstatic.com/media/a14ce9_f33fd5ad910f4a99a15806fcf88a0c37~mv2.png/v1/fill/w_350,h_250,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Pain.png','session-04':'https://static.wixstatic.com/media/11062b_657f8863f1e84a50b1f861b25c5994c8~mv2_d_4032_3024_s_4_2.jpg/v1/crop/x_0,y_0,w_3024,h_3024/fill/w_350,h_250,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Mother%20And%20Baby%20Sleeping.jpg','session-05':'https://static.wixstatic.com/media/11062b_0da56823899b498ca4a4e0232b376d02~mv2.jpg/v1/fill/w_350,h_250,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Hands%20on%20Stomach.jpg','session-06':'https://static.wixstatic.com/media/a14ce9_f92d3422950448a59f8b86d32a8cffea~mv2.png/v1/fill/w_350,h_250,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Pain%20(1).png','session-07':'https://static.wixstatic.com/media/a14ce9_dc31bff5630b40e8be5ac61034f7745d~mv2.png/v1/fill/w_350,h_250,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Pain%20(2).png','session-08':'https://static.wixstatic.com/media/11062b_ceec3ad4b11a4c729588bba99f4542b1~mv2.jpg/v1/fill/w_350,h_250,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Creepy%20Hands%20Grasping.jpg','session-09':'https://static.wixstatic.com/media/06e12c8d86854b9985febcf2635ba0c4.jpg/v1/fill/w_350,h_250,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Couple%20At%20Beach.jpg','session-10':'https://static.wixstatic.com/media/a14ce9_b5308f884fd84a39a32771d36eb9309b~mv2.png/v1/fill/w_350,h_250,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Pain%20(3).png','session-11':'https://static.wixstatic.com/media/c58e0be6086a4f0e87c23d7a36cd03fc.jpg/v1/fill/w_350,h_250,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Shadow%20Silhouettes%20Holding.jpg','session-12':'https://static.wixstatic.com/media/nsplsh_6b5f4479315a6d59335f6b~mv2_d_4000_2667_s_4_2.jpg/v1/fill/w_350,h_250,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Image%20by%20Arijit%20M.jpg'};
const FUSION_SHORT={'session-01':'Intolerance & Sensitivity','session-02':'Anxiety & Overwhelm','session-03':'Pain & Tension','session-04':'Sleep & Reset','session-05':'Digestion & Integration','session-06':'Immune Balance','session-07':'Hormonal Harmony','session-08':'Phobias & Fear Patterns','session-09':'Fatigue & Vitality','session-10':'Weight & Self-Perception','session-11':'Relationships & Boundaries','session-12':'Purpose & Alignment'};
function isFusion(p){return p&&(p.startsWith('session-')||p==='bundle-all')}
function isAcademy(p){return p&&ACADEMY_NAMES[p]}
function productName(p){if(p&&p.startsWith('revoked__'))return productName(p.replace('revoked__',''))+' (REVOKED)';return FUSION_NAMES[p]||ACADEMY_NAMES[p]||p}
function isRevoked(p){return p&&p.startsWith('revoked__')}
function productBadge(p){if(p==='bundle-all')return'<span class="badge taupe">Bundle</span>';if(p==='transformational-mastery')return'<span class="badge taupe">Academy Bundle</span>';if(isFusion(p))return'<span class="badge purple">Fusion</span>';if(isAcademy(p))return'<span class="badge teal">Academy</span>';return'<span class="badge muted">Unknown</span>'}
function fmtMoney(v){return'$'+Number(v||0).toFixed(2).replace(/\.00$/,'')}
function fmt$(c){if(!c)return'$0';return'$'+(c/100||c).toFixed(2).replace(/\.00$/,'')}
function timeAgo(d){if(!d)return'\u2014';const s=Math.floor((Date.now()-new Date(d))/1000);if(s<60)return'just now';if(s<3600)return Math.floor(s/60)+'m ago';if(s<86400)return Math.floor(s/3600)+'h ago';if(s<604800)return Math.floor(s/86400)+'d ago';return new Date(d).toLocaleDateString()}
function esc(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}
function showToast(msg,type){type=type||'info';var t=document.createElement('div');t.className='toast '+type;t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(function(){t.remove()},300)},3000)}
function showModal(opts){return new Promise(function(resolve){var o=document.createElement('div');o.className='modal-overlay';var html='<div class="modal-box">';if(opts.title)html+='<div class="modal-title">'+esc(opts.title)+'</div>';html+='<div class="modal-msg">'+esc(opts.message)+'</div>';if(opts.input){html+='<form onsubmit="event.preventDefault();document.getElementById(\\u0027modal-ok\\u0027).click()" autocomplete="on"><input type="email" class="input modal-input" id="modal-input-field" name="email" autocomplete="email" placeholder="'+(opts.placeholder||'')+'"></form>';}html+='<div class="modal-actions">';if(opts.type==='confirm'||opts.type==='prompt'){html+='<button class="btn btn-ghost btn-sm" id="modal-cancel">Cancel</button>'}if(opts.danger){html+='<button class="btn btn-danger btn-sm" id="modal-ok">'+(opts.okText||'OK')+'</button>'}else{html+='<button class="btn btn-primary btn-sm" id="modal-ok">'+(opts.okText||'OK')+'</button>'}html+='</div></div>';o.innerHTML=html;document.body.appendChild(o);var inp=document.getElementById('modal-input-field');if(inp)inp.focus();document.getElementById('modal-ok').onclick=function(){var val=inp?inp.value:true;o.remove();resolve(val)};var cancel=document.getElementById('modal-cancel');if(cancel)cancel.onclick=function(){o.remove();resolve(false)};o.onclick=function(e){if(e.target===o){o.remove();resolve(false)}}})}
function qpAlert(msg,type){showToast(msg,type||'info')}
function qpConfirm(title,msg,opts){return showModal(Object.assign({title:title,message:msg,type:'confirm'},opts||{}))}
function qpPrompt(title,msg,placeholder){return showModal({title:title,message:msg,type:'prompt',input:true,placeholder:placeholder})}
function showMsg(el,t,txt){el.className='msg '+t;el.textContent=txt;el.style.display='block';setTimeout(()=>{el.style.display='none'},5000)}
async function doAuth(){var emailEl=document.getElementById('auth-email'),passEl=document.getElementById('auth-pass'),errEl=document.getElementById('auth-error'),statusEl=document.getElementById('auth-status'),btn=document.getElementById('auth-btn');var email=emailEl?emailEl.value.trim():'',pass=passEl?passEl.value:'';if(!email||!pass){errEl.textContent='Enter email and password';errEl.style.display='block';return}errEl.style.display='none';btn.disabled=true;if(statusEl)statusEl.style.display='block';try{var res=await fetch('/.netlify/functions/admin-auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'login',email:email.toLowerCase(),password:pass})});var data=await res.json();if(!res.ok)throw new Error(data.error||'Login failed');if(!data.success)throw new Error(data.error||'Login failed');currentAdmin=data.admin;sessionStorage.setItem('qp_admin_auth',JSON.stringify(currentAdmin));if(data.token)sessionStorage.setItem('qp_admin_token',data.token);applyPermissions();document.getElementById('auth-screen').style.display='none';document.getElementById('admin-layout').style.display='block';initAdmin()}catch(e){if(e.message&&e.message.indexOf('Failed to fetch')!==-1){try{var authRes=await sb.auth.signInWithPassword({email:email.toLowerCase(),password:pass});if(authRes.error)throw new Error(authRes.error.message);var admRes=await proxyFrom('admin_users').select('*').eq('email',email.toLowerCase()).eq('is_active',true).single();if(admRes.error||!admRes.data)throw new Error('No admin access. Contact the super admin.');await proxyFrom('admin_users').update({last_login:new Date().toISOString()}).eq('id',admRes.data.id);currentAdmin={id:admRes.data.id,email:admRes.data.email,name:admRes.data.name,role:admRes.data.role,permissions:{customers:admRes.data.can_customers,email:admRes.data.can_email,promotions:admRes.data.can_promotions,orders:admRes.data.can_orders,community:admRes.data.can_community,analytics:admRes.data.can_analytics,suggestions:admRes.data.can_suggestions,automation:admRes.data.can_automation,audit:admRes.data.can_audit,system:admRes.data.can_system,refund:admRes.data.can_refund,delete:admRes.data.can_delete}};sessionStorage.setItem('qp_admin_auth',JSON.stringify(currentAdmin));if(authRes.data&&authRes.data.session)sessionStorage.setItem('qp_admin_token',authRes.data.session.access_token);applyPermissions();document.getElementById('auth-screen').style.display='none';document.getElementById('admin-layout').style.display='block';initAdmin()}catch(e2){errEl.textContent=e2.message||'Login failed';errEl.style.display='block'}}else{errEl.textContent=e.message||'Login failed';errEl.style.display='block'}}finally{btn.disabled=false;if(statusEl)statusEl.style.display='none'}}
function doLogout(){sessionStorage.removeItem('qp_admin_auth');currentAdmin=null;location.reload()}
try{var savedAdmin=sessionStorage.getItem('qp_admin_auth');if(savedAdmin){currentAdmin=JSON.parse(savedAdmin);applyPermissions();document.getElementById('auth-screen').style.display='none';document.getElementById('admin-layout').style.display='block';setTimeout(initAdmin,50)}}catch(e){sessionStorage.removeItem('qp_admin_auth')}
let currentPage='dashboard';
const TITLES={dashboard:'Dashboard',customers:'Customers',academy:'Academy',fusion:'Fusion Sessions',sessions:'1-on-1 Sessions',memberships:'Memberships',community:'Community',referrals:'Referrals & Credits',email:'Email Campaigns',automation:'Email Automation',promotions:'Promotions',orders:'Orders',analytics:'Analytics',audit:'Audit Log','admin-users':'Admin Users'};
function go(page,btn){currentPage=page;document.querySelectorAll('.sb-link').forEach(l=>l.classList.remove('active'));if(btn)btn.classList.add('active');document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));var el=document.getElementById('page-'+page);if(el)el.classList.add('active');document.getElementById('topbar-title').textContent=TITLES[page]||page;loadPageData(page);document.getElementById('sidebar').classList.remove('open');document.getElementById('sb-overlay').classList.remove('open')}
function toggleSidebar(){document.getElementById('sidebar').classList.toggle('open');document.getElementById('sb-overlay').classList.toggle('open')}
function refreshCurrentPage(){loadAllData().then(function(){loadPageData(currentPage)})}
let allCustomers=[],purchasesData=[],referralData=[],profilesData=[],creditHistory=[],academyEnrollments=[],academyCourses=[],lessonProgress=[],adminNotesData=[],authUsersMap=new Map(),allFusionPosts=[],allAcadPosts=[],emailCampaignsData=[],emailTrackingData=[],dataLoaded=false;
var scheduledEmailsData=[],emailLogData=[],sessionScheduleData=[];
var currentPromoFilter='active',ordersPage=1,ordersPS=25,ordersFiltered=[],promotionsData=[];
async function loadAllData(){try{var r=await Promise.all([sb.from('purchases').select('*').order('purchased_at',{ascending:false}),sb.from('referral_codes').select('*'),sb.from('profiles').select('*'),sb.from('credit_history').select('*').order('created_at',{ascending:false}).limit(200),sb.from('qa_enrollments').select('*, qa_courses(id,title,slug)'),sb.from('qa_courses').select('*').order('sort_order'),sb.from('qa_lesson_progress').select('*'),proxyFrom('admin_notes').select('*').order('created_at',{ascending:false}),sb.from('discussion_posts').select('id,user_email'),sb.from('qa_discussions').select('id,user_email'),sb.from('email_campaigns').select('*').order('sent_at',{ascending:false}).limit(50),sb.from('email_tracking').select('id,campaign_id,recipient_email,tracking_id,status,opened_at,clicked_at,sent_at,email_type').order('sent_at',{ascending:false}).limit(500),sb.from('promotions').select('*').order('created_at',{ascending:false}),sb.from('scheduled_emails').select('*').order('scheduled_for',{ascending:true}).limit(100),sb.from('email_log').select('*').order('sent_at',{ascending:false}).limit(200),sb.from('session_schedule').select('*').order('session_number',{ascending:true})]);purchasesData=r[0].data||[];referralData=r[1].data||[];profilesData=r[2].data||[];creditHistory=r[3].data||[];academyEnrollments=r[4].data||[];academyCourses=r[5].data||[];lessonProgress=r[6].data||[];adminNotesData=r[7].data||[];allFusionPosts=r[8].data||[];allAcadPosts=r[9].data||[];emailCampaignsData=r[10].data||[];emailTrackingData=r[11].data||[];promotionsData=r[12].data||[];scheduledEmailsData=r[13].data||[];emailLogData=r[14].data||[];sessionScheduleData=r[15].data||[];await loadAuthUsers();buildCustomerList();dataLoaded=true}catch(e){console.error('Load error:',e)}}
async function loadAuthUsers(){try{var page=1,allUsers=[];while(true){var r=await authAdminAPI('list_users',{page:page,per_page:500});var data=r.data;var users=data.users||data||[];if(!Array.isArray(users)||!users.length)break;allUsers=allUsers.concat(users);if(users.length<500)break;page++}authUsersMap=new Map();allUsers.forEach(function(u){if(u.email)authUsersMap.set(u.email.toLowerCase(),u)})}catch(e){console.error('Auth users load error:',e)}}
function buildCustomerList(){var map=new Map();profilesData.forEach(function(p){if(!p.email)return;var k=p.email.toLowerCase();map.set(k,{email:p.email,name:p.full_name||'',userId:p.id,hasAccount:true,isBlocked:p.is_blocked||false,createdAt:p.created_at,purchases:[],academyPurchases:[],fusionPurchases:[],hasBundle:false,hasAcademyBundle:false,creditBalance:0,referralCount:0,referralCode:'',totalEarned:0,totalSpent:0})});purchasesData.forEach(function(p){if(!p.email)return;var k=p.email.toLowerCase();if(!map.has(k))map.set(k,{email:p.email,name:'',userId:null,hasAccount:false,isBlocked:false,createdAt:p.purchased_at,purchases:[],academyPurchases:[],fusionPurchases:[],hasBundle:false,hasAcademyBundle:false,creditBalance:0,referralCount:0,referralCode:'',totalEarned:0,totalSpent:0});var c=map.get(k);if(!c.purchases.includes(p.product_id)){c.purchases.push(p.product_id);if(isFusion(p.product_id))c.fusionPurchases.push(p.product_id);if(isAcademy(p.product_id))c.academyPurchases.push(p.product_id)}if(p.product_id==='bundle-all')c.hasBundle=true;if(p.product_id==='transformational-mastery')c.hasAcademyBundle=true;c.totalSpent+=(Number(p.amount_paid)||0)});referralData.forEach(function(r){if(!r.email)return;var k=r.email.toLowerCase();if(!map.has(k))map.set(k,{email:r.email,name:'',userId:null,hasAccount:false,isBlocked:false,createdAt:null,purchases:[],academyPurchases:[],fusionPurchases:[],hasBundle:false,hasAcademyBundle:false,creditBalance:0,referralCount:0,referralCode:'',totalEarned:0,totalSpent:0});var c=map.get(k);c.creditBalance=Number(r.credit_balance)||0;c.referralCount=r.successful_referrals||0;c.referralCode=r.code||'';c.totalEarned=Number(r.total_earned)||0});allCustomers=Array.from(map.values())}
async function initAdmin(){document.addEventListener('keydown',function(e){if(e.ctrlKey&&e.shiftKey&&e.key==='R'){e.preventDefault();webhookRecovery()}});await loadAllData();loadPageData('dashboard')}
function loadPageData(page){if(!dataLoaded&&page!=='dashboard')return;switch(page){case'dashboard':loadDashboard();break;case'customers':loadCustomerBrowser();break;case'academy':loadAcademyData();break;case'fusion':loadFusionData();break;case'referrals':loadReferralData();break;case'community':loadCommunityData();break;case'email':loadEmailPage();break;case'automation':loadAutomationPage();break;case'promotions':loadPromotionsPage();break;case'orders':loadOrdersPage();break;case'audit':loadAuditLog();break;case'analytics':loadAnalyticsPage();break;case'admin-users':loadAdminUsers();break}}
function getAdminNotes(email){return adminNotesData.filter(function(n){return n.target_email&&n.target_email.toLowerCase()===email.toLowerCase()})}
async function saveAdminNote(email,text){try{await proxyFrom('admin_notes').insert({target_email:email.toLowerCase(),note_text:text});await logAudit('add_note',email,'Added note: '+text.substring(0,80));var r=await proxyFrom('admin_notes').select('*').order('created_at',{ascending:false});adminNotesData=r.data||[]}catch(e){showToast('Error saving note: '+e.message,'error')}}
async function deleteAdminNote(email,id){try{await proxyFrom('admin_notes').delete().eq('id',id);await logAudit('delete_note',email,'Deleted a note');var r=await proxyFrom('admin_notes').select('*').order('created_at',{ascending:false});adminNotesData=r.data||[]}catch(e){showToast('Error deleting note: '+e.message,'error')}}
async function logAudit(action,targetEmail,details,metadata){try{var m=metadata||{};var adminName='System';if(currentAdmin){m.admin_email=currentAdmin.email;adminName=currentAdmin.name||currentAdmin.email.split('@')[0]}var res=await proxyFrom('admin_audit_log').insert({action:action,target_email:targetEmail?targetEmail.toLowerCase():null,details:details||'',metadata:m,admin_user:adminName});if(res.error)console.error('Audit insert error:',res.error)}catch(e){console.error('Audit log error:',e)}}

function loadDashboard(){if(!dataLoaded)return;var tr=purchasesData.reduce(function(s,p){return s+(Number(p.amount_paid)||0)},0);var ar=purchasesData.filter(function(p){return isAcademy(p.product_id)}).reduce(function(s,p){return s+(Number(p.amount_paid)||0)},0);var fr=purchasesData.filter(function(p){return isFusion(p.product_id)}).reduce(function(s,p){return s+(Number(p.amount_paid)||0)},0);var ae=academyEnrollments.filter(function(e){return e.status==='active'}).length;var rr=referralData.filter(function(r){return r.successful_referrals>0}).length;
document.getElementById('dash-stats').innerHTML='<div class="stat-card"><div class="stat-ico green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div><div><div class="stat-val">'+fmtMoney(tr)+'</div><div class="stat-lbl">Total Revenue</div></div></div><div class="stat-card"><div class="stat-ico teal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg></div><div><div class="stat-val">'+fmtMoney(ar)+'</div><div class="stat-lbl">Academy Sales</div></div></div><div class="stat-card"><div class="stat-ico purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg></div><div><div class="stat-val">'+fmtMoney(fr)+'</div><div class="stat-lbl">Fusion Sales</div></div></div><div class="stat-card"><div class="stat-ico warm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div><div class="stat-val">'+allCustomers.length+'</div><div class="stat-lbl">Total Customers</div></div></div><div class="stat-card"><div class="stat-ico teal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/></svg></div><div><div class="stat-val">'+ae+'</div><div class="stat-lbl">Enrollments</div></div></div><div class="stat-card"><div class="stat-ico warm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/></svg></div><div><div class="stat-val">'+rr+'</div><div class="stat-lbl">Active Referrers</div></div></div>';
var rp=purchasesData.slice(0,10);document.getElementById('dash-purchases').innerHTML=rp.length?rp.map(function(p){return'<div class="feed-item"><div class="feed-dot" style="background:'+(isFusion(p.product_id)?'var(--purple)':'var(--teal)')+'"></div><div class="feed-content"><div class="feed-text"><strong>'+esc(p.email)+'</strong> purchased '+productName(p.product_id)+'</div><div class="feed-time">'+fmtMoney(p.amount_paid)+' \u00b7 '+timeAgo(p.purchased_at)+'</div></div>'+productBadge(p.product_id)+'</div>'}).join(''):'<div class="empty"><p>No purchases</p></div>';
var rc=creditHistory.slice(0,10);document.getElementById('dash-activity').innerHTML=rc.length?rc.map(function(c){return'<div class="feed-item"><div class="feed-dot" style="background:'+(c.amount>0?'var(--success)':'var(--warning)')+'"></div><div class="feed-content"><div class="feed-text"><strong>'+esc(c.email)+'</strong> '+(c.amount>0?'+':'')+fmtMoney(c.amount)+'</div><div class="feed-time">'+esc(c.description||c.type)+' \u00b7 '+timeAgo(c.created_at)+'</div></div></div>'}).join(''):'<div class="empty"><p>No activity</p></div>';renderSuggestions();loadWeeklyGoals()}

var cbFiltered=[],cbPage=1,cbPS=20;
/* ===== SMART SUGGESTIONS - EMAIL MODAL ===== */
var sgDismissed=JSON.parse(localStorage.getItem('qp_sg_dismissed')||'[]');
var sgActiveFilter='all';

var _origSgSetupEmail=null;
function sgSetupEmail(opts){
_sgSetupEmailInner(opts);
}
function _sgSetupEmailInner(opts){
var old=document.getElementById('sg-email-modal');if(old)old.remove();
var recipients=[];
if(opts.customEmails){
opts.customEmails.split('\n').filter(function(e){return e.trim()}).forEach(function(email){
var e=email.trim().toLowerCase();
var prof=profilesData.find(function(p){return p.email&&p.email.toLowerCase()===e});
var ref=referralData.find(function(r){return r.email&&r.email.toLowerCase()===e});
recipients.push({email:e,name:prof?(prof.full_name||''):'',referral_code:ref?(ref.code||''):''})});
}
window._sgRecipients=recipients;window._sgOpts=opts;
var ov=document.createElement('div');ov.id='sg-email-modal';
ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
ov.onclick=function(e){if(e.target===ov)ov.remove()};
var box=document.createElement('div');
box.style.cssText='background:var(--navy-card,#112a42);border:1px solid rgba(91,168,178,.25);border-radius:16px;padding:28px;width:95%;max-width:720px;max-height:90vh;overflow-y:auto;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.5)';
var promoOpts='';
promotionsData.filter(function(p){return p.status==='active'}).forEach(function(p){
var sel=(opts.promoCode&&p.coupon_id===opts.promoCode)?' selected':'';
var disc=p.discount_type==='percent'?(p.discount_percent||0)+'% off':(p.discount_type==='fixed'?'$'+(p.discount_fixed||0)+' off':'$'+(p.discount_set_price||0));
promoOpts+='<option value="'+esc(p.coupon_id)+'"'+sel+'>'+esc(p.coupon_id)+' \u2014 '+esc(p.name)+' ('+disc+')</option>'});
var recipList=recipients.map(function(r){return '<div style="display:inline-flex;align-items:center;gap:4px;background:rgba(91,168,178,.1);border:1px solid rgba(91,168,178,.2);border-radius:20px;padding:3px 10px;margin:2px;font-size:11px;color:var(--teal)">'+esc(r.email)+'<button style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:13px;padding:0 2px" onclick="sgRemoveRecipient(this,\u0027'+esc(r.email)+'\u0027)">\u00d7</button></div>'}).join('');
var h='';
h+='<button class="sg-modal-close" onclick="document.getElementById(\u0027sg-email-modal\u0027).remove()">&times;</button>';
h+='<h3 style="margin:0 0 6px;font-size:17px;color:var(--text)">Compose Email</h3>';
h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:12px;color:var(--text-muted)">Sending to <span id="sg-recip-count" style="color:var(--teal);font-weight:600;cursor:pointer" onclick="var el=document.getElementById(\u0027sg-recipient-list\u0027);el.style.display=el.style.display===\u0027block\u0027?\u0027none\u0027:\u0027block\u0027">'+recipients.length+'</span> recipient'+(recipients.length!==1?'s':'')+' ';
h+='<button class="btn btn-ghost btn-sm" style="font-size:11px;padding:3px 10px" onclick="var el=document.getElementById(\u0027sg-recipient-list\u0027);el.style.display=el.style.display===\u0027block\u0027?\u0027none\u0027:\u0027block\u0027">View/Edit List</button></div>';
h+='<div id="sg-recipient-list" style="display:none;background:rgba(0,0,0,.2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:14px"><div style="display:flex;gap:6px;margin-bottom:8px"><input type="email" id="sg-add-email" class="input" placeholder="Add email..." style="flex:1;font-size:12px" onkeydown="if(event.key===\u0027Enter\u0027)sgAddRecipient()"><button class="btn btn-ghost btn-sm" style="font-size:11px" onclick="sgAddRecipient()">+ Add</button></div><div id="sg-recip-chips" style="display:flex;flex-wrap:wrap;gap:2px;max-height:100px;overflow-y:auto">'+recipList+'</div></div>';
h+='<div style="margin-bottom:14px"><label style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:4px;display:block">Subject</label>';
h+='<input type="text" id="sg-subject" class="input" value="'+esc(opts.subject||'').replace(/"/g,'&quot;')+'" style="width:100%"></div>';
h+='<div style="margin-bottom:6px"><label style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:4px;display:block">Body</label>';
h+='<div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap;align-items:center">';
h+='<button class="btn btn-ghost btn-sm" style="font-size:11px;padding:3px 8px" onclick="sgInsertVar(\u0027{{name}}\u0027)">Name</button>';
h+='<button class="btn btn-ghost btn-sm" style="font-size:11px;padding:3px 8px" onclick="sgInsertVar(\u0027{{email}}\u0027)">Email</button>';
h+='<button class="btn btn-ghost btn-sm" style="font-size:11px;padding:3px 8px" onclick="sgInsertVar(\u0027{{referral_code}}\u0027)">Referral Code</button>';
h+='<span style="flex:1"></span>';
h+='</div>';
h+='<textarea id="sg-body" class="input" rows="10" style="width:100%;font-size:13px;line-height:1.6" oninput="sgAutoPreview()">'+esc(opts.body||'')+'</textarea>';
h+='<div id="sg-section-controls" style="display:none;margin-top:8px;margin-bottom:8px"><div style="font-size:11px;color:var(--text-dim);margin-bottom:4px">Cards <span style="opacity:.5">(drag to reorder)</span></div><div id="sg-card-pills" style="display:flex;flex-wrap:wrap;gap:6px"></div></div>';
h+='</div>';
h+='<div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap">';
h+='<div style="flex:1;min-width:140px"><label style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:4px;display:block">Brand</label><select id="sg-brand" class="input" style="width:100%;font-size:12px" onchange="sgAutoPreview()"><option value="fusion"'+(opts.brand==='fusion'?' selected':'')+'>Fusion (Neon)</option><option value="academy"'+(opts.brand==='academy'?' selected':'')+'>Academy (Teal)</option></select></div>';
h+='<div style="flex:1;min-width:140px"><label style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:4px;display:block">From</label><select id="sg-from" class="input" style="width:100%;font-size:12px"><option value="tracey@quantumphysician.com"'+(opts.from==='tracey@quantumphysician.com'?' selected':'')+'>Dr. Tracey (Personal)</option><option value="hello@quantumphysician.com"'+(opts.from==='hello@quantumphysician.com'?' selected':'')+'>Hello (Marketing)</option></select></div>';
h+='</div>';
h+='<div style="background:rgba(91,168,178,.04);border:1px solid rgba(91,168,178,.2);border-radius:10px;padding:14px;margin-bottom:16px">';
h+='<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:600;color:var(--teal)"><input type="checkbox" id="sg-discount-toggle" '+(opts.discount?'checked':'')+' onchange="document.getElementById(\u0027sg-discount-opts\u0027).style.display=this.checked?\u0027flex\u0027:\u0027none\u0027;if(!this.checked)sgRemoveDiscountPitch()" style="accent-color:var(--teal,#5ba8b2)"> Include Discount Offer</label>';
h+='<div id="sg-discount-opts" style="display:'+(opts.discount?'flex':'none')+';flex-direction:column;gap:10px;margin-top:10px">';
h+='<select id="sg-promo-select" class="input" style="width:100%;font-size:12px"><option value="">Select promotion...</option>'+promoOpts+'</select>';
h+='<button class="btn btn-sm" style="background:linear-gradient(135deg,var(--teal),var(--teal-glow,#4acfd9));color:#fff;font-weight:600;letter-spacing:.5px;align-self:flex-start;border:none" onclick="sgInsertDiscountPitch()">ADD DISCOUNT PITCH &amp; LINK TO EMAIL</button>';
h+='<div style="font-size:11px;color:var(--text-dim)">Appends a discount section with checkout link to your email body.</div>';
h+='</div></div>';
h+='<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)"><button class="btn btn-sm" style="background:linear-gradient(135deg,var(--purple),#8338ec);color:#fff;font-weight:600;letter-spacing:.5px;border:none" onclick="openCardLibrary()">CARD LIBRARY</button><span style="font-size:11px;color:var(--text-dim);margin-left:8px">Pre-built card blocks to add to your email</span></div>';
h+='<div id="sg-preview-area" style="margin-bottom:16px"></div>';
h+='<div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;padding-top:8px;border-top:1px solid var(--border)">';
h+='<button class="btn btn-ghost btn-sm" onclick="document.getElementById(\u0027sg-email-modal\u0027).remove()">Cancel</button>';
h+='<button class="btn btn-primary btn-sm" onclick="sgPreview()">Preview</button>';
h+='<button class="btn btn-primary btn-sm" style="background:var(--purple);border-color:var(--purple)" onclick="sgTestEmail()">Send Test</button>';
h+='<button class="btn btn-success btn-sm" onclick="sgSendAll()">Send to All</button>';
h+='</div>';
box.innerHTML=h;
ov.appendChild(box);document.body.appendChild(ov);
/* Auto-show preview on open */
setTimeout(function(){sgPreview();sgUpdateSectionControls()},100);
}

function sgRemoveRecipient(btn,email){
window._sgRecipients=window._sgRecipients.filter(function(r){return r.email!==email});
btn.parentElement.remove();
var countEl=document.getElementById('sg-recip-count');
if(countEl)countEl.textContent=window._sgRecipients.length;
}

function sgAddRecipient(){
var inp=document.getElementById('sg-add-email');
if(!inp||!inp.value.trim())return;
var e=inp.value.trim().toLowerCase();
if(window._sgRecipients.find(function(r){return r.email===e})){showToast('Already in list','error');return}
var prof=profilesData.find(function(p){return p.email&&p.email.toLowerCase()===e});
var ref=referralData.find(function(r){return r.email&&r.email.toLowerCase()===e});
window._sgRecipients.push({email:e,name:prof?(prof.full_name||''):'',referral_code:ref?(ref.code||''):''});
var chips=document.getElementById('sg-recip-chips');
if(chips)chips.innerHTML+='<div style="display:inline-flex;align-items:center;gap:4px;background:rgba(91,168,178,.1);border:1px solid rgba(91,168,178,.2);border-radius:20px;padding:3px 10px;margin:2px;font-size:11px;color:var(--teal)">'+esc(e)+'<button style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:13px;padding:0 2px" onclick="sgRemoveRecipient(this,\u0027'+esc(e)+'\u0027)">\u00d7</button></div>';
var countEl=document.getElementById('sg-recip-count');
if(countEl)countEl.textContent=window._sgRecipients.length;
inp.value='';
}

function sgInsertDiscountPitch(){
var code=document.getElementById('sg-promo-select').value;
if(!code){showToast('Select a promotion first','error');return}
var promo=promotionsData.find(function(p){return p.coupon_id===code});
if(!promo){showToast('Promo not found for: '+code,'error');return}
var discLabel='';
if(promo.discount_type==='percent')discLabel=(promo.discount_percent||0)+'% off';
else if(promo.discount_type==='fixed')discLabel='$'+(promo.discount_fixed||0)+' off';
else if(promo.discount_type==='set_price')discLabel='Only $'+(promo.discount_set_price||0);
var textarea=document.getElementById('sg-body');
var body=textarea.value;
/* Remove existing discount section if present */
body=sgStripDiscount(body);
/* Build discount section - always its own --- block at the very end */
var discSection='\n---\n**Limited Time: '+discLabel+'**\n\nYour code: **'+code+'**\nYour discount applies automatically at checkout';
textarea.value=body.trimEnd()+discSection;
textarea.scrollTop=textarea.scrollHeight;
showToast('Discount card added: '+code,'success');
sgAutoPreview();
}

function sgStripDiscount(body){
/* Remove ONLY the discount section - identified by "Limited Time:" which we always add */
var parts=body.split('\n---\n');
if(parts.length<2)return body;
/* Find and remove the section that contains our discount marker */
var kept=[parts[0]];
var removed=false;
for(var i=1;i<parts.length;i++){
if(!removed&&parts[i].match(/Limited Time:/i)){
removed=true; /* skip this section */
}else{
kept.push(parts[i]);
}
}
return kept.join('\n---\n');
}

function sgRemoveDiscountPitch(){
var textarea=document.getElementById('sg-body');
if(!textarea)return;
textarea.value=sgStripDiscount(textarea.value);
sgAutoPreview();
}


function sgDeleteCard(idx){
var textarea=document.getElementById('sg-body');
if(!textarea)return;
var parts=textarea.value.split('\n---\n');
if(idx<1||idx>=parts.length)return;
parts.splice(idx,1);
textarea.value=parts.join('\n---\n');
sgAutoPreview();
sgUpdateSectionControls();
showToast('Card removed','success');
}
function sgCardLabel(text){
var first=text.trim().split('\n')[0]||'';
first=first.replace(/\*\*/g,'').replace(/^#+\s*/,'').trim();
if(first.length>28)first=first.substring(0,25)+'...';
return first||'Card';
}
var sgDragFrom=null;
function sgStartDrag(e){
sgDragFrom=parseInt(e.target.getAttribute('data-idx'));
e.target.style.opacity='0.5';
e.dataTransfer.effectAllowed='move';
}
function sgOverDrag(e){e.preventDefault();e.dataTransfer.dropEffect='move';e.currentTarget.style.borderColor='var(--teal)'}
function sgLeaveDrag(e){e.currentTarget.style.borderColor='var(--border)'}
function sgDropCard(e){
e.preventDefault();
e.currentTarget.style.borderColor='var(--border)';
var to=parseInt(e.currentTarget.getAttribute('data-idx'));
if(sgDragFrom===null||sgDragFrom===to)return;
var textarea=document.getElementById('sg-body');
if(!textarea)return;
var parts=textarea.value.split('\n---\n');
var cards=parts.slice(1);
var moved=cards.splice(sgDragFrom-1,1)[0];
cards.splice(to-1,0,moved);
textarea.value=parts[0]+'\n---\n'+cards.join('\n---\n');
sgDragFrom=null;
sgAutoPreview();
sgUpdateSectionControls();
showToast('Cards reordered','success');
}

function wrComposeEmail(){var input=document.getElementById('wr-input').value.trim();if(!input){showToast('No customers loaded','error');return}var lines=input.split('\n').filter(function(l){return l.trim()});var emails=lines.map(function(l){return l.trim().split('|')[0].trim().toLowerCase()});var products=lines.map(function(l){var p=l.trim().split('|');return wrNormalizeProduct(p[2]?p[2].trim():(parseFloat(p[1])>=500?'bundle-all':'session-01'))});var allBundle=products.every(function(p){return p==='bundle-all'});var allSame=products.every(function(p){return p===products[0]});var pName=allBundle?'the Complete Fusion Bundle':(allSame?productName(products[0]):'your Fusion Sessions purchase');var imgToken='';if(allSame&&FUSION_IMAGES[products[0]])imgToken='\n{{session_image:'+products[0]+'}}';var body='Hi {{name}},\n\nThank you for your purchase! We apologize for the delay in getting your confirmation \u2014 we experienced a brief technical issue that has now been resolved.\n\n**Your access is now fully active.**\n\n**What you purchased:** '+pName+imgToken+'\n---\n**How to access your content:**\n\n**1.** Visit **fusionsessions.com** and click \"Log In\"\n**2.** Create an account using **{{email}}** (the email you purchased with)\n**3.** Go to your **Dashboard** \u2014 your purchased content will be waiting\n'+(allBundle?'**4.** You have access to **all 12 healing sessions** \u2014 start with Session 1: Opening & Orientation':'**4.** Click on your session to begin your healing journey')+'\n---\n**Need help?** Simply reply to this email and we\u2019ll walk you through it.\n\nWe\u2019re so glad you\u2019re here \u2014 your healing journey is about to begin!';var subj=allBundle?'Your Fusion Sessions Bundle Is Ready!':'Your Fusion Session Is Ready \u2014 '+pName;var modal=document.getElementById('webhook-recovery-modal');if(modal)modal.remove();sgSetupEmail({customEmails:emails.join('\n'),brand:'fusion',type:'transactional',from:'tracey@quantumphysician.com',subject:subj,body:body})}
function wrClear(){document.getElementById('wr-input').value='';document.getElementById('wr-results').innerHTML='';showToast('Cleared','info')}
function wrParseName(email){var local=email.split('@')[0];var clean=local.replace(/[^a-zA-Z. _-]/g,'');if(!clean||clean.length<2)clean=local;clean=clean.replace(/[._-]/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase()}).replace(/ +/g,' ').trim();var parts=clean.split(' ');return parts[0]||'Friend'}
function wrNormalizeProduct(pid){if(!pid)return'session-01';if(pid==='bundle-all')return pid;var m=pid.match(/session-(\d+)/);if(m){var n=parseInt(m[1]);return'session-'+(n<10?'0'+n:n)}return pid}
async function webhookRecovery(){var old=document.getElementById('webhook-recovery-modal');if(old)old.remove();var modal=document.createElement('div');modal.id='webhook-recovery-modal';modal.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.8);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';modal.onclick=function(e){if(e.target===modal)modal.remove()};var box=document.createElement('div');box.style.cssText='background:var(--navy-deep);border:1px solid rgba(91,168,178,.25);border-radius:16px;padding:28px;width:95%;max-width:900px;max-height:90vh;overflow-y:auto;position:relative';box.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><h2 style="margin:0;color:var(--teal);font-family:Playfair Display,serif">Webhook Recovery Tool</h2><button onclick="this.closest(\'#webhook-recovery-modal\').remove()" style="background:rgba(91,168,178,.1);border:1px solid rgba(91,168,178,.25);color:var(--teal);font-size:18px;cursor:pointer;width:34px;height:34px;border-radius:50;display:flex;align-items:center;justify-content:center;padding:0">\u00d7</button></div><p style="color:var(--text-dim);font-size:13px;margin-bottom:16px">Paste Stripe customer emails (one per line) with optional amount. Format: <code style="color:var(--teal)">email|amount|product</code> or just <code style="color:var(--teal)">email</code></p><textarea id="wr-input" class="input" style="width:100%;height:150px;font-family:monospace;font-size:12px" placeholder="sandrawenrich1@gmail.com|500|bundle-all\nsullivan12@gmail.com|50|session-1"></textarea><div style="display:flex;gap:8px;margin-top:12px"><button class="btn" style="background:var(--teal);color:#fff" onclick="wrAnalyze()">Analyze</button><button class="btn" style="background:rgba(91,168,178,.1);color:var(--teal);border:1px solid rgba(91,168,178,.25)" onclick="wrLoadStripeData()">Load Known Missing</button><button class="btn" style="background:rgba(91,168,178,.1);color:var(--teal);border:1px solid rgba(91,168,178,.25)" onclick=\"wrClear()\">Clear</button></div><div id="wr-results" style="margin-top:20px"></div>';modal.appendChild(box);document.body.appendChild(modal)}

function wrLoadStripeData(){var data='sandrawenrich1@gmail.com|500|bundle-all\nmariejowett@btinternet.com|500|bundle-all\njscottacctsvs@gmail.com|500|bundle-all\nknovak.can@gmail.com|500|bundle-all\nhighlander4tunes@yahoo.ca|500|bundle-all\nrdwells34@hotmail.com|500|bundle-all\ncharla.lower@gmail.com|500|bundle-all\nsookhan.lee@gmail.com|500|bundle-all\njeannemaken@gmail.com|500|bundle-all\nquantumwhisperer@icloud.com|500|bundle-all\njokearney@hotmail.com|500|bundle-all\ngayle622@montana.com|500|bundle-all\ncmpare@hotmail.ca|500|bundle-all\nd_pszeniczny@hotmail.com|500|bundle-all\ntriplejequine@outlook.com|500|bundle-all\nbttammy5@gmail.com|500|bundle-all\nsullivan12@gmail.com|50|session-01\nbrucekruger@sasktel.net|50|session-01\nhaya.ht.farah@gmail.com|50|session-01\nmichellewinandy@gmail.com|50|session-01\nteresa.ohlson@yahoo.com|50|session-01\nheartbeatofmotherearth1@hotmail.com|50|session-01\necfpryor@gmail.com|50|session-01\nchristel.erni@mac.com|50|session-01\nksp587p50@gmail.com|50|session-01\ncherylcoetzee241@gmail.com|50|session-01\ntrishamcphillips08@hotmail.co.uk|45|session-01\nnfhughes@yahoo.co.uk|45|session-01\ngnusllc@gmail.com|50|session-01\nhwhitelaw4@gmail.com|50|session-01\nlivsimonsen@outlook.dk|50|session-01\nmdlpayrollacc@gmail.com|50|session-01\nkat@katsaunders.co.uk|45|session-01\nlaurika.bodytalk@gmail.com|50|session-01';document.getElementById('wr-input').value=data;showToast('Loaded '+data.split('\n').length+' customers from Stripe data','info')}

async function wrAnalyze(){var input=document.getElementById('wr-input').value.trim();if(!input){showToast('Paste email data first','error');return}var lines=input.split('\n').filter(function(l){return l.trim()});var results=[];for(var i=0;i<lines.length;i++){var parts=lines[i].trim().split('|');var email=parts[0].trim().toLowerCase();var amount=parts[1]?parseFloat(parts[1]):0;var product=wrNormalizeProduct(parts[2]?parts[2].trim():(amount>=500?'bundle-all':'session-01'));var cust=allCustomers.find(function(c){return c.email.toLowerCase()===email});var hasPurchase=purchasesData.some(function(p){return p.email&&p.email.toLowerCase()===email});var hasAuth=authUsersMap.has(email);var hasProfile=profilesData.some(function(p){return p.email&&p.email.toLowerCase()===email});var hasRecoveryPurchase=purchasesData.some(function(p){return p.email&&p.email.toLowerCase()===email&&p.stripe_event_id&&p.stripe_event_id.indexOf('webhook-recovery')===0});results.push({email:email,amount:amount,product:product,hasCustomer:!!cust,hasPurchase:hasPurchase,hasRecovery:hasRecoveryPurchase,hasAuth:hasAuth,hasProfile:hasProfile,needsFix:!hasPurchase})}var missing=results.filter(function(r){return r.needsFix});var ok=results.filter(function(r){return!r.needsFix});var html='<div style="margin-bottom:16px"><span style="color:var(--success);font-weight:600">'+ok.length+' OK</span> &nbsp; <span style="color:var(--danger);font-weight:600">'+missing.length+' Missing Purchases</span></div>';if(missing.length){html+='<div style="margin-bottom:12px"><label style="display:flex;align-items:center;gap:8px;color:var(--text-dim);font-size:13px;cursor:pointer"><input type="checkbox" id="wr-send-email" checked onchange="wrUpdateGrantBtn()"> Open email compose after granting</label><div style="font-size:11px;color:var(--text-dim);margin-top:4px;margin-left:26px">No emails sent automatically — compose window opens so you can preview, test, and edit first.</div></div>';html+='<table class="tbl"><thead><tr><th><input type="checkbox" id="wr-select-all" checked onchange="wrToggleAll(this.checked)"></th><th>Email</th><th>Amount</th><th>Product</th><th>Auth</th><th>Profile</th><th>Status</th></tr></thead><tbody>';missing.forEach(function(r,idx){html+='<tr><td><input type="checkbox" class="wr-check" data-idx="'+idx+'" checked></td><td style="font-size:12px">'+r.email+'</td><td>$'+r.amount+'</td><td style="font-size:11px">'+productName(r.product)+'</td><td>'+(r.hasAuth?'\u2705':'\u274c')+'</td><td>'+(r.hasProfile?'\u2705':'\u274c')+'</td><td><span class="badge" style="background:rgba(255,107,107,.15);color:var(--danger)">'+(r.hasRecovery?'Already Recovered':'No Purchase Record')+'</span></td></tr>'});html+='</tbody></table>';html+='<div style="display:flex;gap:8px;margin-top:16px"><button class="btn btn-success" onclick="wrGrantAll()" id="wr-grant-btn">Grant Access to Selected ('+missing.length+')</button></div>'}html+='<div style="margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,.06)"><button class="btn" style="background:rgba(131,56,236,.15);color:var(--purple);border:1px solid rgba(131,56,236,.3)" onclick="wrComposeEmail()">\u2709 Compose Email for All ('+results.length+')</button><span style="font-size:11px;color:var(--text-dim);margin-left:8px">Send recovery instructions to everyone listed</span></div>';if(ok.length){html+='<details style="margin-top:16px"><summary style="color:var(--text-dim);cursor:pointer;font-size:13px">'+ok.length+' customers already have purchase records</summary><div style="margin-top:8px;max-height:200px;overflow-y:auto">';ok.forEach(function(r){html+='<div style="padding:4px 0;font-size:12px;color:var(--text-dim);border-bottom:1px solid rgba(255,255,255,.04)">\u2705 '+r.email+'</div>'});html+='</div></details>'}document.getElementById('wr-results').innerHTML=html;window._wrMissing=missing;setTimeout(wrUpdateGrantBtn,50)}

function wrToggleAll(checked){document.querySelectorAll('.wr-check').forEach(function(cb){cb.checked=checked})}
function wrUpdateGrantBtn(){var cb=document.getElementById('wr-send-email');var btn=document.getElementById('wr-grant-btn');if(!btn)return;var count=document.querySelectorAll('.wr-check:checked').length;btn.textContent=cb&&cb.checked?'Grant Access & Compose Email ('+count+')':'Grant Access to Selected ('+count+')'}

async function wrGrantAll(){var missing=window._wrMissing;if(!missing)return;var selected=[];document.querySelectorAll('.wr-check:checked').forEach(function(cb){selected.push(missing[parseInt(cb.dataset.idx)])});if(!selected.length){showToast('No customers selected','error');return}var sendEmail=document.getElementById('wr-send-email').checked;var dupes=selected.filter(function(r){return r.hasRecovery});if(dupes.length){if(!await qpConfirm('Duplicate Warning',dupes.length+' customer(s) already have recovery purchase records. Grant again anyway?',{okText:'Grant Anyway',danger:true}))return}if(!await qpConfirm('Webhook Recovery','Grant access to '+selected.length+' customer(s)?'+(sendEmail?' The email compose window will open after so you can preview and send.':''),{okText:'Grant All'}))return;var log=document.getElementById('wr-results');var statusDiv=document.createElement('div');statusDiv.style.cssText='margin-top:16px;padding:16px;background:rgba(0,0,0,.2);border-radius:8px;max-height:400px;overflow-y:auto';log.appendChild(statusDiv);var success=0,failed=0;var grantedEmails=[];for(var i=0;i<selected.length;i++){var r=selected[i];statusDiv.innerHTML+='<div style="padding:3px 0;font-size:12px;color:var(--text-dim)">⏳ Granting access: '+r.email+' (' +(i+1)+'/'+selected.length+')...</div>';statusDiv.scrollTop=statusDiv.scrollHeight;try{var pid=r.product;await proxyFrom('purchases').insert({email:r.email,product_id:pid,stripe_event_id:'webhook-recovery-'+Date.now()+'-'+i,amount_paid:r.amount,purchased_at:new Date().toISOString()});await logAudit('grant_access',r.email,'Webhook recovery: granted '+productName(pid)+' ($'+r.amount+')',{product_id:pid,recovery:true});statusDiv.innerHTML+='<div style="padding:3px 0;font-size:12px;color:var(--success)">✅ '+r.email+' — '+productName(r.product)+(r.product==='bundle-all'?' (Full Bundle)':'')+' $'+r.amount+'</div>';grantedEmails.push(r);success++}catch(e){statusDiv.innerHTML+='<div style="padding:3px 0;font-size:12px;color:var(--danger)">❌ '+r.email+' — '+e.message+'</div>';failed++}statusDiv.scrollTop=statusDiv.scrollHeight}statusDiv.innerHTML+='<div style="padding:8px 0;margin-top:8px;border-top:1px solid rgba(255,255,255,.1);font-size:14px;font-weight:600;color:var(--teal)">✅ Done: '+success+' granted, '+failed+' failed</div>';await loadAllData();showToast('Recovery complete: '+success+' granted','success');if(sendEmail&&grantedEmails.length){var emailList=grantedEmails.map(function(r){return r.email}).join('\n');var products=grantedEmails.map(function(r){return r.product});var allBundle=products.every(function(p){return p==='bundle-all'});var allSame=products.every(function(p){return p===products[0]});var pName=allBundle?'the Complete Fusion Bundle':(allSame?productName(products[0]):'your Fusion Sessions purchase');var imgToken='';if(allSame&&FUSION_IMAGES[products[0]])imgToken='\n{{session_image:'+products[0]+'}}';var recoveryBody='Hi {{name}},\n\nThank you for your purchase! We apologize for the delay in getting your confirmation \u2014 we experienced a brief technical issue that has now been resolved.\n\n**Your access is now fully active.**\n\n**What you purchased:** '+pName+imgToken+'\n---\n**How to access your content:**\n\n**1.** Visit **fusionsessions.com** and click "Log In"\n**2.** Create an account using **{{email}}** (the email you purchased with)\n**3.** Go to your **Dashboard** \u2014 your purchased content will be waiting\n'+(allBundle?'**4.** You have access to **all 12 healing sessions** \u2014 start with Session 1: Opening & Orientation':'**4.** Click on your session to begin your healing journey')+'\n---\n**Quick tips to get started:**\n\n\u2022 Make sure you sign up with the **exact email** shown above\n\u2022 Check your spam folder for the account verification email\n\u2022 Once logged in, your sessions appear on your **Dashboard**\n\u2022 Sessions are available to watch anytime, on any device\n\nHave questions? Reply to this email anytime.';var modal=document.getElementById('webhook-recovery-modal');if(modal)modal.remove();var subj=allBundle?'Your Fusion Sessions Bundle Is Ready!':'Your Fusion Session Is Ready \u2014 '+pName;sgSetupEmail({customEmails:emailList,brand:'fusion',type:'transactional',from:'tracey@quantumphysician.com',subject:subj,body:recoveryBody});}}

function sgUpdateSectionControls(){
var textarea=document.getElementById('sg-body');
var ctrl=document.getElementById('sg-section-controls');
if(!textarea||!ctrl)return;
var parts=textarea.value.split('\n---\n');
if(parts.length<2){ctrl.style.display='none';return}
ctrl.style.display='block';
var pills=document.getElementById('sg-card-pills');
if(!pills)return;
var h='';
for(var i=1;i<parts.length;i++){
var label=sgCardLabel(parts[i]);
h+='<div draggable="true" data-idx="'+i+'" ondragstart="sgStartDrag(event)" ondragover="sgOverDrag(event)" ondragleave="sgLeaveDrag(event)" ondrop="sgDropCard(event)" style="display:inline-flex;align-items:center;gap:4px;background:var(--navy-card);border:1px solid var(--border);border-radius:8px;padding:4px 8px 4px 10px;font-size:11px;color:var(--text);cursor:grab;user-select:none;transition:border-color .2s"><span style="opacity:.4;font-size:10px;margin-right:2px">\u2630</span>'+label+'<button onclick="sgDeleteCard('+i+')" style="background:none;border:none;color:var(--text-dim);cursor:pointer;padding:0 0 0 4px;font-size:14px;line-height:1;opacity:.5" onmouseover="this.style.opacity=1;this.style.color=\'#ff4d6a\'" onmouseout="this.style.opacity=.5;this.style.color=\'var(--text-dim)\'" title="Remove card">&times;</button></div>';
}
pills.innerHTML=h;
}
function sgInsertVar(v){var ta=document.getElementById('sg-body');if(!ta)return;var s=ta.selectionStart,e=ta.selectionEnd,t=ta.value;ta.value=t.substring(0,s)+v+t.substring(e);ta.focus();ta.selectionStart=ta.selectionEnd=s+v.length}

function sgGetDiscountConfig(){
var tog=document.getElementById('sg-discount-toggle');
if(!tog||!tog.checked)return null;
var code=document.getElementById('sg-promo-select').value;
if(!code)return null;
var promo=promotionsData.find(function(p){return p.coupon_id===code});
if(!promo)return null;
return{couponId:code,percent:promo.discount_percent||0,product:promo.applies_to||'any'};
}

function sgBuildHtml(bodyText){
var brand=document.getElementById('sg-brand').value;
var discCfg=sgGetDiscountConfig();
/* Also check for [DISCOUNT:CODE] marker to build discCfg if toggle is off */
if(!discCfg){
var dm=bodyText.match(/\[PROMO:([^\]]+)\]/);
if(dm){var mp=promotionsData.find(function(p){return p.coupon_id===dm[1]});
if(mp)discCfg={couponId:dm[1],percent:mp.discount_percent||0,product:mp.applies_to||'any'}}}
var cleanBody=bodyText;
var siteUrl=brand==='academy'?'https://academy.quantumphysician.com':'https://fusionsessions.com';
return brand==='academy'?buildAcademyEmail(cleanBody,null,siteUrl,discCfg):buildRichEmail(cleanBody,null,siteUrl,discCfg);
}

var _sgPreviewTimer=null;
function sgAutoPreview(){sgUpdateSectionControls();
clearTimeout(_sgPreviewTimer);
_sgPreviewTimer=setTimeout(function(){
var area=document.getElementById('sg-preview-area');
if(area)sgPreview();
sgUpdateSectionControls();
},800);
}

function sgPreview(){
var subject=document.getElementById('sg-subject').value;
var body=document.getElementById('sg-body').value;
var from=document.getElementById('sg-from').value;
if(!body)return;
var s=window._sgRecipients&&window._sgRecipients[0]?window._sgRecipients[0]:{email:'preview@example.com',name:'Friend',referral_code:'XXXXXX'};
var pb=body.replace(/\{\{name\}\}/g,s.name||'Friend').replace(/\{\{email\}\}/g,s.email).replace(/\{\{referral_code\}\}/g,s.referral_code||'XXXXXX');
var richHtml=sgBuildHtml(pb);
if(s.referral_code)richHtml=richHtml.replace(/REFCODE/g,s.referral_code);
var area=document.getElementById('sg-preview-area');
area.innerHTML='<div style="border-top:2px solid rgba(91,168,178,.3);padding-top:14px"><div style="font-size:12px;color:var(--text-muted);margin-bottom:8px"><strong>From:</strong> '+esc(from)+' &nbsp; <strong>Subject:</strong> <span style="color:var(--teal)">'+esc(subject||'(no subject)')+'</span></div><iframe id="sg-preview-iframe" style="width:100%;min-height:500px;border:none;border-radius:8px;background:#1a1a2e"></iframe></div>';
var fr=document.getElementById('sg-preview-iframe');
var iDoc=fr.contentDocument||fr.contentWindow.document;
iDoc.open();iDoc.write(richHtml);iDoc.close();
setTimeout(function(){try{fr.style.height=Math.max(500,iDoc.body.scrollHeight+20)+'px'}catch(e){}},400);
}

async function sgTestEmail(){
var subject=document.getElementById('sg-subject').value;
var body=document.getElementById('sg-body').value;
var from=document.getElementById('sg-from').value;
if(!subject||!body){showToast('Fill in subject and body first','error');return}
var testAddr=await qpPrompt('Send Test Email','Enter the email address to send a test to:','your@email.com');
if(!testAddr)return;
showToast('Sending test...','info');
var testName='Friend',testRef='TESTCODE';
try{
var prof=profilesData.find(function(p){return p.email&&p.email.toLowerCase()===testAddr.toLowerCase()});
if(prof&&prof.full_name)testName=prof.full_name.split(' ')[0];
var ref=referralData.find(function(r){return r.email&&r.email.toLowerCase()===testAddr.toLowerCase()});
if(ref&&ref.code)testRef=ref.code;
}catch(e){}
var pb=body.replace(/\{\{name\}\}/g,testName).replace(/\{\{email\}\}/g,testAddr).replace(/\{\{referral_code\}\}/g,testRef);
var richHtml=sgBuildHtml(pb);
richHtml=richHtml.replace(/REFCODE/g,testRef);
try{
await fetch(APPS_SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},
body:JSON.stringify({to:testAddr,from:from,subject:'[TEST] '+subject.replace(/\{\{name\}\}/g,testName),body:richHtml,isHtml:true})});
showToast('Test email sent to '+testAddr+'!','success');
logAudit('suggestion_test_email','Test to '+testAddr+': '+subject);
}catch(e){showToast('Error: '+e.message,'error')}
}

async function sgSendAll(){
var subject=document.getElementById('sg-subject').value;
var body=document.getElementById('sg-body').value;
var from=document.getElementById('sg-from').value;
var brand=document.getElementById('sg-brand').value;
var discCfg=sgGetDiscountConfig();
var recipients=window._sgRecipients||[];
if(!subject||!body){showToast('Fill in subject and body first','error');return}
if(!recipients.length){showToast('No recipients','error');return}
var ok=await qpConfirm('Send Campaign','Send this email to '+recipients.length+' recipient'+(recipients.length>1?'s':'')+'?\n\nSubject: '+subject+'\nFrom: '+from);
if(!ok)return;
document.getElementById('sg-email-modal').remove();
showToast('Sending to '+recipients.length+' recipients...','info');
var sent=0,failed=0;
try{
var campRes=await proxyFrom('email_campaigns').insert([{campaign_type:'suggestion',campaign_name:subject,subject:subject,from_email:from,recipient_count:recipients.length,status:'sending'}]).select().single();
var campaignId=campRes.data?campRes.data.id:null;
for(var i=0;i<recipients.length;i++){
var r=recipients[i];
var pb=body.replace(/\{\{name\}\}/g,r.name||'Friend').replace(/\{\{email\}\}/g,r.email).replace(/\{\{referral_code\}\}/g,r.referral_code||'');
var siteUrl=brand==='academy'?'https://academy.quantumphysician.com':'https://fusionsessions.com';
var richHtml=brand==='academy'?buildAcademyEmail(pb,null,siteUrl,discCfg):buildRichEmail(pb,null,siteUrl,discCfg);
if(r.referral_code)richHtml=richHtml.replace(/REFCODE/g,r.referral_code);
try{
await fetch(APPS_SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},
body:JSON.stringify({to:r.email,from:from,subject:subject.replace(/\{\{name\}\}/g,r.name||'Friend'),body:richHtml,isHtml:true})});
sent++;
if(campaignId)await proxyFrom('email_tracking').insert([{campaign_id:campaignId,recipient_email:r.email,sent_at:new Date().toISOString()}]);
}catch(e){failed++}}
if(campaignId)await proxyFrom('email_campaigns').update({status:'sent',sent_count:sent,failed_count:failed}).eq('id',campaignId);
logAudit('suggestion_send','Sent "'+subject+'" to '+sent+'/'+recipients.length);
showToast('Sent '+sent+'/'+recipients.length+(failed?' ('+failed+' failed)':''),'success');
await loadAllData();
}catch(e){showToast('Error: '+e.message,'error')}
}

function generateSuggestions(){
if(!dataLoaded)return[];
var sg=[];
var now=new Date();
var d7=new Date(now-7*864e5);


var d14=new Date(now-14*864e5);
var d30=new Date(now-30*864e5);

/* Referral card block to append after --- */
var refBlock='\n---\n**Share & Earn**\nYour friend gets **10% off**\nYou earn **$10**/session or **$25**/bundle\n\nYour code: **REFCODE**\nYour link: fusionsessions.com/?ref=REFCODE\n{{qr_code}}\nShare your code and start earning';

var unusedCodes=referralData.filter(function(r){return r.successful_referrals===0&&r.credit_balance===0});
if(unusedCodes.length>=3){
var unusedRefEmails=unusedCodes.map(function(r){return r.email}).join('\n');
sg.push({id:'unused-refs',cat:'revenue',priority:'med',title:unusedCodes.length+' referral codes never shared',detail:'These users have referral codes but zero referrals. A nudge could activate word-of-mouth.',metrics:[unusedCodes.length+' dormant codes'],actions:[{label:'\u2709 Compose Email',action:function(){sgSetupEmail({customEmails:unusedRefEmails,brand:'fusion',type:'promotional',from:'tracey@quantumphysician.com',subject:'Did you know you have a referral code? Share it and earn!',body:'Hi {{name}},\n\nYou signed up for our referral program but have not shared yet. That means there is free money waiting.\n\n**Think of one person:** a friend who cannot sleep, a coworker who is always stressed, or a family member dealing with pain.\n\nYour code gives them 10% off. You earn **$10-$25** per referral. **Just text your link to one person today.**'+refBlock})}}]})}

var indivBuyers=allCustomers.filter(function(c){return!c.hasBundle&&c.fusionPurchases.length>=2&&c.fusionPurchases.length<12});
if(indivBuyers.length>=1){
var avgOwned=Math.round(indivBuyers.reduce(function(s,c){return s+c.fusionPurchases.length},0)/indivBuyers.length);
var bundleEmails2=indivBuyers.map(function(c){return c.email}).join('\n');
var activePromo=promotionsData.find(function(p){return p.status==='active'});
sg.push({id:'bundle-upsell',cat:'revenue',priority:'high',title:indivBuyers.length+' customer'+(indivBuyers.length>1?'s':'')+' ready for bundle upsell',detail:'These users own <strong>'+avgOwned+' sessions avg</strong> but not the bundle.',metrics:[indivBuyers.length+' prospects','~'+avgOwned+' sessions avg'],actions:[{label:'\u2709 Compose Upsell',action:function(){sgSetupEmail({customEmails:bundleEmails2,brand:'fusion',type:'promotional',from:'tracey@quantumphysician.com',discount:!!activePromo,promoCode:activePromo?activePromo.coupon_id:'',subject:'Complete Your Fusion Journey \u2014 Upgrade to the Full Bundle',body:'Hi {{name}},\n\nYou have already experienced **'+avgOwned+' Fusion Sessions** and I love seeing your commitment to healing!\n\nThe **Complete Fusion Bundle** gives you access to all 12 sessions at a significant savings compared to buying individually.\n\nSince you already own several sessions, this is the perfect time to **complete your journey**.'+(activePromo?'\n\nUse code **'+activePromo.coupon_id+'** for an extra discount!':'')+'\n\nWith love and healing,\nDr. Tracey Clark'})}}]})}

var highCredit=referralData.filter(function(r){return r.credit_balance>=1000});
if(highCredit.length>=1){
var totalUnused=highCredit.reduce(function(s,r){return s+r.credit_balance},0);
var creditEmails=highCredit.map(function(r){return r.email}).join('\n');
sg.push({id:'unused-credits',cat:'revenue',priority:'low',title:fmtMoney(totalUnused)+' in credits sitting unused',detail:'<strong>'+highCredit.length+'</strong> user'+(highCredit.length>1?'s have':' has')+' $10+ in credits.',metrics:[fmtMoney(totalUnused)+' total',highCredit.length+' users'],actions:[{label:'\u2709 Send Reminder',action:function(){sgSetupEmail({customEmails:creditEmails,brand:'fusion',type:'promotional',from:'tracey@quantumphysician.com',subject:'You have credits waiting to be used!',body:'Hi {{name}},\n\nYou have **credits** in your account \u2014 real money you earned by sharing the healing.\n\nThey apply automatically at checkout. Just pick a session and your balance does the rest.'+refBlock})}}]})}

var expiringPromos=promotionsData.filter(function(p){if(p.status!=='active'||!p.expires_at)return false;var exp=new Date(p.expires_at);return exp>now&&exp<new Date(now.getTime()+7*864e5)});
if(expiringPromos.length>0){
var firstPromo=expiringPromos[0];
sg.push({id:'expiring-promos',cat:'revenue',priority:'high',title:expiringPromos.length+' promo'+(expiringPromos.length>1?'s':'')+' expiring this week',detail:'Active promotions expiring within 7 days: <strong>'+expiringPromos.map(function(p){return p.coupon_id}).join(', ')+'</strong>',metrics:expiringPromos.map(function(p){return p.coupon_id}),actions:[{label:'\u2709 Last-Chance Email',action:function(){sgSetupEmail({audience:'all-opted-in',brand:'fusion',type:'promotional',from:'tracey@quantumphysician.com',discount:true,promoCode:firstPromo.coupon_id,subject:'Last Chance \u2014 '+firstPromo.coupon_id+' expires soon!',body:'Hi {{name}},\n\nOur special offer with code **'+firstPromo.coupon_id+'** is expiring very soon!\n\nIf you have been thinking about taking the next step in your healing journey, **now is the time**. This discount will not be available again.\n\n**Do not miss out!**\n\nWith love,\nDr. Tracey Clark'})}},{label:'View Promos',action:function(){go('promotions',document.querySelector('[onclick*="promotions"]'))}}]})}

var enrolledUsers={};academyEnrollments.filter(function(e){return e.status==='active'}).forEach(function(e){enrolledUsers[e.user_id]=true});
var inactiveStudents=allCustomers.filter(function(c){if(!c.userId||!enrolledUsers[c.userId])return false;var lastAct=null;lessonProgress.filter(function(lp){return lp.user_id===c.userId}).forEach(function(lp){var d=lp.completed_at||lp.updated_at;if(d&&(!lastAct||d>lastAct))lastAct=d});return lastAct&&new Date(lastAct)<d14});
if(inactiveStudents.length>=1){
var inactiveEmails=inactiveStudents.map(function(c){return c.email}).join('\n');
sg.push({id:'inactive-students',cat:'engagement',priority:'high',title:inactiveStudents.length+' student'+(inactiveStudents.length>1?'s':'')+' inactive for 14+ days',detail:'Enrolled students who stopped making progress.',metrics:[inactiveStudents.length+' inactive','14+ days'],actions:[{label:'\u2709 Re-engage',action:function(){sgSetupEmail({customEmails:inactiveEmails,brand:'academy',type:'promotional',from:'tracey@quantumphysician.com',subject:'We miss you! Your courses are waiting',body:'Hi {{name}},\n\nI noticed you have not logged into the Academy recently.\n\nYour courses are still there, **right where you left off**. Even 10 minutes a day makes a real difference in your growth.\n\nIs there anything I can help with? Sometimes a **fresh perspective** is all it takes to get back on track.\n\nRooting for you,\nDr. Tracey Clark'})}}]})}

var newNoPurchase=allCustomers.filter(function(c){if(!c.hasAccount||c.purchases.length>0)return false;var auth=authUsersMap.get(c.email.toLowerCase());if(!auth)return false;return new Date(auth.created_at)>d7});
if(newNoPurchase.length>=1){
var noPurchEmails=newNoPurchase.map(function(c){return c.email}).join('\n');
var welcomePromo=promotionsData.find(function(p){return p.status==='active'});
sg.push({id:'new-no-purchase',cat:'engagement',priority:'high',title:newNoPurchase.length+' new signup'+(newNoPurchase.length>1?'s':'')+' with no purchase',detail:'Warm leads who created accounts in the last 7 days but have not bought anything.',metrics:[newNoPurchase.length+' signups'],actions:[{label:'\u2709 Welcome Offer',action:function(){sgSetupEmail({customEmails:noPurchEmails,brand:'fusion',type:'promotional',from:'tracey@quantumphysician.com',discount:!!welcomePromo,promoCode:welcomePromo?welcomePromo.coupon_id:'',subject:'Welcome to Quantum Physician \u2014 A gift to get you started',body:'Hi {{name}},\n\nYou signed up \u2014 that means something. **You are ready.**\n\n**Fusion Sessions** are 60-minute online group healing experiences led by Dr. Tracey Clark. Each one works on a specific area of your health: anxiety, pain, sleep, energy, and more.\n\nPeople tell us they feel different after just one session.\n\n**Ready to find out for yourself?**'+(welcomePromo?'\n\nUse code **'+welcomePromo.coupon_id+'** for a special discount!':'')+'\n\nI am here for you,\nDr. Tracey Clark'})}}]})}

var boughtNoReturn=allCustomers.filter(function(c){if(!c.hasAccount||c.purchases.length===0)return false;var auth=authUsersMap.get(c.email.toLowerCase());if(!auth||!auth.last_sign_in_at)return false;return new Date(auth.last_sign_in_at)<d30});
if(boughtNoReturn.length>=1){
var absentEmails=boughtNoReturn.map(function(c){return c.email}).join('\n');
sg.push({id:'bought-no-return',cat:'retention',priority:'high',title:boughtNoReturn.length+' buyer'+(boughtNoReturn.length>1?'s':'')+' absent 30+ days',detail:'Paid customers who have not logged in for over a month.',metrics:[boughtNoReturn.length+' customers'],actions:[{label:'\u2709 Check-in',action:function(){sgSetupEmail({customEmails:absentEmails,brand:'fusion',type:'promotional',from:'tracey@quantumphysician.com',subject:'Your healing content is waiting for you',body:'Hi {{name}},\n\nI noticed you have not visited in a while, and I wanted to **personally reach out**.\n\nYour sessions and courses are still there for you, ready whenever you are. Life gets busy \u2014 I understand. But your healing journey **does not have an expiration date**.\n\nIf you need help accessing your content, just **reply to this email** and I will help.\n\nWith care,\nDr. Tracey Clark'})}}]})}

var optedOut=0;authUsersMap.forEach(function(u){if(((u.user_metadata||u.raw_user_meta_data||{}).marketing_opt_in===false))optedOut++});
if(optedOut>=5){sg.push({id:'opted-out',cat:'retention',priority:'low',title:optedOut+' users opted out of marketing emails',detail:'Consider improving email value or reducing frequency.',metrics:[optedOut+' opted out'],actions:[{label:'View Customers',action:function(){go('customers',document.querySelector('[onclick*="customers"]'))}}]})}

var topRefs=referralData.filter(function(r){return r.successful_referrals>=2}).sort(function(a,b){return b.successful_referrals-a.successful_referrals}).slice(0,5);
if(topRefs.length>=1){
var topRefEmails=topRefs.map(function(r){return r.email}).join('\n');
sg.push({id:'top-referrers',cat:'growth',priority:'med',title:'Top '+topRefs.length+' referrer'+(topRefs.length>1?'s':'')+' could be ambassadors',detail:'<strong>'+topRefs[0].email+'</strong> has '+topRefs[0].successful_referrals+' referrals.',metrics:topRefs.slice(0,3).map(function(r){return r.successful_referrals+' refs'}),actions:[{label:'\u2709 Thank Them',action:function(){sgSetupEmail({customEmails:topRefEmails,brand:'fusion',type:'promotional',from:'tracey@quantumphysician.com',subject:'Thank you for being an amazing ambassador!',body:'Hi {{name}},\n\nI wanted to take a moment to **personally thank you**. You have referred friends and family to Quantum Physician, and that means the world to me.\n\nYour word-of-mouth support helps more people discover the power of quantum healing. As a small token of my gratitude, I have **added a bonus to your referral credits**.\n\nKeep spreading the word \u2014 together we are building something special.'+refBlock})}}]})}

var lastCampaign=emailCampaignsData.length?new Date(emailCampaignsData[0].sent_at||emailCampaignsData[0].created_at):null;
if(!lastCampaign||lastCampaign<d14){var daysSince=lastCampaign?Math.round((now-lastCampaign)/864e5):-1;sg.push({id:'no-recent-campaigns',cat:'growth',priority:'med',title:daysSince>0?'No campaigns in '+daysSince+' days':'No campaigns sent yet',detail:'Consistent outreach keeps your audience engaged.',metrics:daysSince>0?[daysSince+' days']:[],actions:[{label:'\u2709 Create Campaign',action:function(){go('email',document.querySelector('[onclick*="email"]'))}}]})}

if(allFusionPosts&&allFusionPosts.length){var recentPosts=allFusionPosts.filter(function(p){return new Date(p.created_at)>d7&&!p.is_hidden});var unanswered=recentPosts.filter(function(p){return!p.reply_count||p.reply_count===0});if(unanswered.length>=1){sg.push({id:'unanswered-posts',cat:'community',priority:'high',title:unanswered.length+' community post'+(unanswered.length>1?'s':'')+' with no replies',detail:'Posts without responses make the community feel empty.',metrics:[unanswered.length+' unanswered'],actions:[{label:'Go to Community',action:function(){go('community',document.querySelector('[onclick*="community"]'))}}]})}}

sg=sg.filter(function(s){return sgDismissed.indexOf(s.id)<0});
var pOrder={high:0,med:1,low:2};
sg.sort(function(a,b){return(pOrder[a.priority]||1)-(pOrder[b.priority]||1)});
return sg;
}

function renderSuggestions(){
var sg=generateSuggestions();
var panel=document.getElementById('dash-suggestions');
if(!sg.length){panel.style.display='none';return}
panel.style.display='block';
var filtered=sgActiveFilter==='all'?sg:sg.filter(function(s){return s.cat===sgActiveFilter});
var cats={};sg.forEach(function(s){cats[s.cat]=(cats[s.cat]||0)+1});
var html='<div class="suggestions-header"><h3><div class="sg-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>Smart Suggestions <span class="sg-count">'+sg.length+' insight'+(sg.length>1?'s':'')+'</span></h3><div class="sg-filters"><button class="sg-filter-btn'+(sgActiveFilter==='all'?' active':'')+'" onclick="sgActiveFilter=\u0027all\u0027;renderSuggestions()">All ('+sg.length+')</button>';
['revenue','engagement','retention','growth','community'].forEach(function(c){if(cats[c])html+='<button class="sg-filter-btn'+(sgActiveFilter===c?' active':'')+'" onclick="sgActiveFilter=\u0027'+c+'\u0027;renderSuggestions()">'+c.charAt(0).toUpperCase()+c.slice(1)+' ('+cats[c]+')</button>'});
html+='</div></div>';
if(!filtered.length){html+='<div class="sg-empty">No suggestions in this category</div>'}else{
html+='<div class="sg-grid">';
filtered.forEach(function(s){
var pLabel=s.priority==='high'?'High':s.priority==='med'?'Medium':'Low';
html+='<div class="sg-card sg-'+s.cat+'" data-sg-id="'+s.id+'"><button class="sg-dismiss" onclick="event.stopPropagation();dismissSuggestion(\u0027'+s.id+'\u0027)" title="Dismiss">&times;</button><div class="sg-card-top"><span class="sg-badge '+s.cat+'">'+s.cat+'</span><span class="sg-priority"><span class="dot '+s.priority+'"></span>'+pLabel+'</span></div><div class="sg-title">'+s.title+'</div><div class="sg-detail">'+s.detail+'</div>';
if(s.metrics&&s.metrics.length){html+='<div style="margin-bottom:10px">';s.metrics.forEach(function(m){html+='<span class="sg-metric">'+m+'</span>'});html+='</div>'}
if(s.actions&&s.actions.length){html+='<div class="sg-actions">';s.actions.forEach(function(a,j){html+='<button class="btn '+(j===0?'btn-primary':'btn-ghost')+' btn-sm" onclick="sgAction(\u0027'+s.id+'\u0027,'+j+')">'+a.label+'</button>'});html+='</div>'}
html+='</div>'});
html+='</div>'}
panel.innerHTML=html;
}

function sgAction(id,idx){var sg=generateSuggestions();var s=sg.find(function(x){return x.id===id});if(s&&s.actions&&s.actions[idx]&&s.actions[idx].action){logAudit('suggestion_action','Acted on: '+s.title);s.actions[idx].action()}}

function dismissSuggestion(id){sgDismissed.push(id);localStorage.setItem('qp_sg_dismissed',JSON.stringify(sgDismissed));var card=document.querySelector('[data-sg-id="'+id+'"]');if(card){card.style.opacity='0';card.style.transform='scale(0.95)';card.style.transition='all 0.3s';setTimeout(function(){renderSuggestions()},300)}else renderSuggestions()}

// ============================================================
// SESSION 11: WEEKLY MARKETING GOALS
// ============================================================

/* Auto-generate a promo code for a goal if none exists */
async function autoCreatePromo(prefix,discount,appliesTo){
var code=(prefix+Math.floor(Math.random()*900+100)).toUpperCase();
var existing=await proxyFrom('promotions').select('id').eq('coupon_id',code).maybeSingle();
if(existing.data)code=(prefix+Math.floor(Math.random()*9000+1000)).toUpperCase();
var expires=new Date();expires.setDate(expires.getDate()+7);
try{
var res=await proxyFrom('promotions').insert({
name:prefix+' Auto (Weekly Goal)',coupon_id:code,
discount_type:'percent',discount_percent:discount,discount_fixed:0,discount_set_price:0,
applies_to:appliesTo||'any',distribution_method:'both',
max_uses:0,min_purchase:0,restrictions:'',stackable_with_credits:true,one_per_user:true,
notes:'Auto-generated by Weekly Goals',expires_at:expires.toISOString(),status:'active'
}).select();
if(res.error){showToast('Promo creation failed: '+res.error.message,'error');console.error('Auto-promo DB error:',res.error);return null}
if(!res.data||!res.data.length){showToast('Promo created but no data returned','error');return{coupon_id:code,discount_percent:discount,status:'active'}}
await logAudit('create_promo',null,'Auto-created promo: '+code+' ('+discount+'% off, Weekly Goal)',{coupon_id:code});
promotionsData.unshift(res.data[0]);
showToast('Created promo code: '+code+' ('+discount+'% off, expires in 7 days)','success');
return res.data[0];
}catch(e){showToast('Promo error: '+e.message,'error');console.error('Auto-promo error:',e);return null}
}

/* Get a session image tag for rich emails (used in card blocks) */
function getSessionImageBlock(sessionId){
var img=FUSION_IMAGES[sessionId];
if(!img)return'';
return'<img src="'+img+'" width="350" height="250" alt="'+(FUSION_SHORT[sessionId]||'')+'" style="display:block;margin:0 auto 15px;border-radius:12px;border:2px solid #8338ec;max-width:100%;">';
}

/* Find the next upcoming session's product ID from schedule */
function getNextSessionProductId(){
var now=new Date().toISOString();
var next=sessionScheduleData.filter(function(s){return s.air_date>=now}).sort(function(a,b){return a.air_date>b.air_date?1:-1})[0];
if(!next||!next.session_number)return null;
var num=String(next.session_number).padStart(2,'0');
return'session-'+num;
}
var WEEKLY_GOALS=[
{id:'no_purchase',label:'Welcome Email',campaignType:'no_purchase',sgId:'new-no-purchase',autoPromo:{prefix:'WELCOME',discount:15,appliesTo:'any'},
buildAudience:function(){
var purchaserEmails={};purchasesData.forEach(function(p){purchaserEmails[p.email.toLowerCase()]=true});
return allCustomers.filter(function(c){return c.hasAccount&&!purchaserEmails[c.email.toLowerCase()]}).map(function(c){return c.email})},
buildTemplate:function(goalPromo){
var promo=goalPromo||promotionsData.find(function(p){return p.status==='active'});
var next=sessionScheduleData.filter(function(s){return s.air_date>=new Date().toISOString()}).sort(function(a,b){return a.air_date>b.air_date?1:-1})[0];
var pid2=getNextSessionProductId();
var sessionCard=next?'\n\n---\n'+(pid2?'{{session_image:'+pid2+'}}\n':'')+'**Next Live Session**\n**'+next.title+'**\n'+new Date(next.air_date).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})+'\n\nJoin Dr. Tracey Clark for this transformative 60-minute quantum healing experience.'+(promo?'\n\nUse code **'+promo.coupon_id+'** for **'+(promo.discount_percent||15)+'% off** your first session!':''):'';
var promoOnlyCard=(!next&&promo)?'\n\n---\n**Special Welcome Offer**\nUse code **'+promo.coupon_id+'** for **'+(promo.discount_percent||15)+'% off** your first session!\n\nYour discount applies automatically at checkout.':'';
return{brand:'fusion',discount:!!promo,promoCode:promo?promo.coupon_id:'',
subject:'Welcome to Quantum Physician \u2014 A gift to get you started',
body:'Hi {{name}},\n\nYou signed up \u2014 that means something. **You are ready.**\n\n**Fusion Sessions** are 60-minute online group healing experiences led by Dr. Tracey Clark. Each one works on a specific area of your health: anxiety, pain, sleep, energy, and more.\n\nPeople tell us they feel different after just one session.\n\n**Ready to find out for yourself?**'+sessionCard+promoOnlyCard}}},

{id:'upsell_bundle',label:'Upgrade Offer',campaignType:'upsell_bundle',sgId:'bundle-upsell',autoPromo:{prefix:'BUNDLE',discount:20,appliesTo:'bundle-all'},
buildAudience:function(){
return allCustomers.filter(function(c){return!c.hasBundle&&c.fusionPurchases.length>=1&&c.fusionPurchases.length<12}).map(function(c){return c.email})},
buildTemplate:function(goalPromo){
var promo=goalPromo||promotionsData.find(function(p){return p.status==='active'});
var avgOwned=0;var buyers=allCustomers.filter(function(c){return!c.hasBundle&&c.fusionPurchases.length>=1&&c.fusionPurchases.length<12});
if(buyers.length)avgOwned=Math.round(buyers.reduce(function(s,c){return s+c.fusionPurchases.length},0)/buyers.length);
var bundleCard='\n\n---\n{{session_image:bundle-all}}\n**The Complete Fusion Bundle**\nAll 12 sessions \u2014 one powerful journey\n\n~~$500+ individually~~ **Save big** with the bundle\n\n\u2022 Anxiety & Overwhelm\n\u2022 Pain & Tension\n\u2022 Sleep & Reset\n\u2022 Digestion & Integration\n\u2022 Immune Balance\n\u2022 Hormonal Harmony\n\u2022 And 6 more transformative sessions'+(promo?'\n\nUse code **'+promo.coupon_id+'** for **'+(promo.discount_percent||20)+'% off**!':'');
return{brand:'fusion',discount:!!promo,promoCode:promo?promo.coupon_id:'',
subject:'Complete Your Fusion Journey \u2014 Upgrade to the Full Bundle',
body:'Hi {{name}},\n\nYou have already experienced **'+avgOwned+' Fusion Sessions** and I love seeing your commitment to healing!\n\nThe **Complete Fusion Bundle** gives you access to all 12 sessions at a significant savings compared to buying individually.\n\nSince you already own several sessions, this is the perfect time to **complete your journey**.'+bundleCard}}},

{id:'credit_reminder',label:'Credit Reminder',campaignType:'credit_reminder',sgId:'unused-credits',
buildAudience:function(){
return referralData.filter(function(r){return r.credit_balance>0}).map(function(r){return r.email})},
buildTemplate:function(goalPromo){
var totalUnused=referralData.filter(function(r){return r.credit_balance>0}).reduce(function(s,r){return s+r.credit_balance},0);
var creditCard='\n\n---\n**Your Referral Credits**\nYou have earned credits from sharing the healing!\n\nCredits work like cash \u2014 they apply automatically at checkout.\n\nPick any session and your balance does the rest.';
var refCard='\n\n---\n**Share & Earn More**\nYour friend gets **10% off**\nYou earn **$10**/session or **$25**/bundle\n\nYour code: **REFCODE**\nYour link: fusionsessions.com/?ref=REFCODE\n{{qr_code}}';
return{brand:'fusion',
subject:'You have credits waiting to be used!',
body:'Hi {{name}},\n\nYou have **credits** in your account \u2014 real money you earned by sharing the healing.\n\nThey are sitting there, ready to be used on any Fusion Session. **Do not let them go to waste!**'+creditCard+refCard}}},

{id:'referral_nudge',label:'Referral Nudge',campaignType:'referral_nudge',sgId:'unused-refs',
buildAudience:function(){
return referralData.filter(function(r){return r.successful_referrals===0}).map(function(r){return r.email})},
buildTemplate:function(goalPromo){
return{brand:'fusion',
subject:'Did you know you have a referral code? Share it and earn!',
body:'Hi {{name}},\n\nYou signed up for our referral program but have not shared yet. That means there is free money waiting.\n\n**Think of one person:** a friend who cannot sleep, a coworker who is always stressed, or a family member dealing with pain.\n\nYour code gives them 10% off. You earn **$10-$25** per referral. **Just text your link to one person today.**\n\n---\n**Share & Earn**\nYour friend gets **10% off**\nYou earn **$10**/session or **$25**/bundle\n\nYour code: **REFCODE**\nYour link: fusionsessions.com/?ref=REFCODE\n{{qr_code}}\nShare your code and start earning'}}},

{id:'promote_session',label:'Session Promo',campaignType:'promote_session',sgId:'expiring-promos',autoPromo:{prefix:'SESSION',discount:10,appliesTo:'sessions-only'},
buildAudience:function(){
var emails=[];authUsersMap.forEach(function(u){
var oi=true;if(((u.user_metadata||u.raw_user_meta_data||{}).marketing_opt_in===false))oi=false;
if(oi)emails.push(u.email)});return emails},
buildTemplate:function(goalPromo){
var promo=goalPromo||promotionsData.find(function(p){return p.status==='active'});
var next=sessionScheduleData.filter(function(s){return s.air_date>=new Date().toISOString()}).sort(function(a,b){return a.air_date>b.air_date?1:-1})[0];
var sessionCard='';
if(next){var pid=getNextSessionProductId();sessionCard='\n\n---\n'+(pid?'{{session_image:'+pid+'}}\n':'')+'**'+next.title+'**\n'+new Date(next.air_date).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})+(next.time?' at '+next.time:'')+'\n\nA 60-minute live quantum healing experience with Dr. Tracey Clark.\n\n**Seats are limited \u2014 reserve yours now.**'+(promo?'\n\nUse code **'+promo.coupon_id+'** for a discount!':'');}
else{sessionCard=promo?'\n\n---\n**Limited Time Offer**\nUse code **'+promo.coupon_id+'** and save on any session!\n\nYour discount applies automatically at checkout.':'';}
var refBlock='\n\n---\n**Share & Earn**\nYour friend gets **10% off**\nYou earn **$10**/session or **$25**/bundle\n\nYour code: **REFCODE**\nYour link: fusionsessions.com/?ref=REFCODE\n{{qr_code}}';
return{brand:'fusion',discount:!!promo,promoCode:promo?promo.coupon_id:'',
subject:next?next.title+' \u2014 Your Next Fusion Session Is Here!':"This Month's Fusion Session Is Here!",
body:'Hi {{name}},\n\n'+(next?'**'+next.title+'** is coming up and I do not want you to miss it!':'A new Fusion Session is available and I do not want you to miss it.')+'\n\nEach session is a **unique 60-minute quantum healing experience** that works on a specific area of your health and wellbeing.\n\n**Space fills up \u2014 book your spot today.**'+sessionCard+refBlock}}},

{id:'promo_create',label:'New Promotion',manual:true,nav:function(){go('promotions')}},
{id:'review_analytics',label:'Review Analytics',manual:true,nav:function(){go('analytics')}}
];

function getWeekStart(){var d=new Date();var day=d.getDay();var diff=d.getDate()-day+(day===0?-6:1);return new Date(d.getFullYear(),d.getMonth(),diff,0,0,0,0)}
function getWeekKey(){return getWeekStart().toISOString().split('T')[0]}

/* Filter emails: remove opted-out users and those at weekly promo limit */
async function filterGoalRecipients(rawEmails){
/* 1. Remove opted-out — check user_metadata first (source of truth), raw_user_meta_data as fallback */
var optedOut={};
authUsersMap.forEach(function(u){
var oi=(u.user_metadata&&u.user_metadata.marketing_opt_in!==undefined)?u.user_metadata.marketing_opt_in:((u.raw_user_meta_data||{}).marketing_opt_in);
if(oi===false)optedOut[u.email.toLowerCase()]=true;
});
var emails=[];var optOutRemoved=0;
rawEmails.forEach(function(e){
var el=e.trim().toLowerCase();if(!el)return;
if(optedOut[el]){optOutRemoved++;return}
emails.push(el);
});
/* 2. Deduplicate */
emails=Array.from(new Set(emails));
if(!emails.length)return emails;
/* 3. Check weekly promo limit */
var weeklyLimit=getWeeklyEmailLimit();
var sevenDaysAgo=new Date(Date.now()-7*24*60*60*1000).toISOString();
var limitRemoved=0;
try{
var rt=await sb.from('email_tracking').select('recipient_email').in('recipient_email',emails).eq('email_type','promotional').gte('sent_at',sevenDaysAgo);
var counts={};(rt.data||[]).forEach(function(t){var e=t.recipient_email.toLowerCase();counts[e]=(counts[e]||0)+1});
var before=emails.length;
emails=emails.filter(function(e){return(counts[e]||0)<weeklyLimit});
limitRemoved=before-emails.length;
}catch(e){}
var totalSkipped=optOutRemoved+limitRemoved;
if(totalSkipped>0){
var parts=[];
if(optOutRemoved>0)parts.push(optOutRemoved+' opted out');
if(limitRemoved>0)parts.push(limitRemoved+' at weekly limit');
showToast(totalSkipped+' skipped ('+parts.join(', ')+')','info')}
return emails;
}

async function loadWeeklyGoals(){
var panel=document.getElementById('weekly-goals-panel');
if(!panel)return;
var weekStart=getWeekStart();
var weekEnd=new Date(weekStart);weekEnd.setDate(weekEnd.getDate()+7);
var sentTypes=new Set();
try{
var res=await sb.from('email_campaigns').select('campaign_type,sent_at').gte('sent_at',weekStart.toISOString()).lt('sent_at',weekEnd.toISOString());
if(res.data)res.data.forEach(function(c){sentTypes.add(c.campaign_type)});
}catch(e){}
var weekKey=getWeekKey();
var manual=JSON.parse(localStorage.getItem('qp_weekly_goals_'+weekKey)||'{}');
manual['review_analytics']=true;
localStorage.setItem('qp_weekly_goals_'+weekKey,JSON.stringify(manual));
var completedCount=WEEKLY_GOALS.filter(function(g){return g.manual?manual[g.id]:sentTypes.has(g.campaignType)}).length;
var progressPct=Math.round((completedCount/WEEKLY_GOALS.length)*100);
document.getElementById('weekly-progress-fill').style.width=progressPct+'%';
var countEl=document.getElementById('weekly-count');
countEl.textContent=completedCount+'/'+WEEKLY_GOALS.length;
countEl.style.color=progressPct===100?'var(--success)':'var(--text-muted)';
document.getElementById('weekly-date-range').textContent='Week of '+weekStart.toLocaleDateString('en-US',{month:'short',day:'numeric'})+' \u2014 resets Mon';
var chipsEl=document.getElementById('weekly-goal-chips');
chipsEl.innerHTML=WEEKLY_GOALS.map(function(g,i){
var done=g.manual?manual[g.id]:sentTypes.has(g.campaignType);
var clickFn=done?'':'weeklyGoalAction('+i+')';
var clickAttr=clickFn?' onclick="'+clickFn+'" style="cursor:pointer"':'';
return'<span class="goal-chip'+(done?' done':'')+(g.manual?' manual':'')+'"'+clickAttr+' title="'+(done?'Completed!':(g.manual?'Click to complete':'Click to compose'))+'"><span class="goal-check">'+(done?'\u2713':'')+'</span>'+g.label+'</span>'
}).join('');
panel.style.display='block';
}

async function weeklyGoalAction(idx){
var g=WEEKLY_GOALS[idx];
if(g.manual){completeManualGoal(g.id);if(g.nav)g.nav();return}
/* Build audience with filters and open compose with auto-promo */
if(!g.buildAudience){return}
var rawEmails=g.buildAudience();
if(!rawEmails.length){showToast('No eligible recipients for '+g.label,'info');return}
var filtered=await filterGoalRecipients(rawEmails);
if(!filtered.length){showToast('All recipients at weekly promo limit','info');return}
/* Auto-create a unique promo for this goal */
var goalPromo=null;
if(g.autoPromo){
goalPromo=await autoCreatePromo(g.autoPromo.prefix,g.autoPromo.discount,g.autoPromo.appliesTo);
}
var tpl=g.buildTemplate(goalPromo);
sgSetupEmail({customEmails:filtered.join('\n'),brand:tpl.brand,type:'promotional',from:'tracey@quantumphysician.com',discount:!!tpl.discount,promoCode:tpl.promoCode||'',subject:tpl.subject,body:tpl.body});
}

function completeManualGoal(goalId){
var weekKey=getWeekKey();
var saved=JSON.parse(localStorage.getItem('qp_weekly_goals_'+weekKey)||'{}');
saved[goalId]=true;
localStorage.setItem('qp_weekly_goals_'+weekKey,JSON.stringify(saved));
loadWeeklyGoals();
}

function loadCustomerBrowser(){cbPage=1;applyCBFilter();updateBrowserStats()}
function updateBrowserStats(){var ac=allCustomers.filter(function(c){return c.academyPurchases.length>0}).length;var fc=allCustomers.filter(function(c){return c.fusionPurchases.length>0}).length;var cr=allCustomers.filter(function(c){return c.creditBalance>0}).length;var np=allCustomers.filter(function(c){return c.purchases.length===0}).length;document.getElementById('cust-browser-stats').innerHTML='<div class="bs"><div class="bs-val" style="color:var(--text)">'+allCustomers.length+'</div><div class="bs-label">Total</div></div><div class="bs"><div class="bs-val" style="color:var(--teal)">'+ac+'</div><div class="bs-label">Academy</div></div><div class="bs"><div class="bs-val" style="color:var(--purple)">'+fc+'</div><div class="bs-label">Fusion</div></div><div class="bs"><div class="bs-val" style="color:var(--success)">'+cr+'</div><div class="bs-label">Credits</div></div><div class="bs"><div class="bs-val" style="color:var(--text-dim)">'+np+'</div><div class="bs-label">No Purchase</div></div>'}
function applyCBFilter(){var f=document.getElementById('cb-filter').value,s=document.getElementById('cb-sort').value,q=(document.getElementById('cb-search').value||'').toLowerCase().trim();cbFiltered=allCustomers.filter(function(c){if(q&&c.email.toLowerCase().indexOf(q)<0&&c.name.toLowerCase().indexOf(q)<0&&c.referralCode.toLowerCase().indexOf(q)<0)return false;switch(f){case'academy':return c.academyPurchases.length>0;case'fusion':return c.fusionPurchases.length>0;case'bundle':return c.hasBundle||c.hasAcademyBundle;case'no-purchase':return c.purchases.length===0;case'has-credits':return c.creditBalance>0;case'has-referrals':return c.referralCount>0;case'no-referral-code':return!c.referralCode;case'blocked':return c.isBlocked;case'no-account':return!c.hasAccount;default:return true}});cbFiltered.sort(function(a,b){switch(s){case'email-asc':return a.email.localeCompare(b.email);case'recent':return(b.createdAt||'').localeCompare(a.createdAt||'');case'credits':return b.creditBalance-a.creditBalance;case'referrals':return b.referralCount-a.referralCount;case'spent':return b.totalSpent-a.totalSpent;default:return 0}});cbPage=1;renderCBTable()}
function renderCBTable(){var tbody=document.getElementById('cb-tbody'),tp=Math.ceil(cbFiltered.length/cbPS)||1,start=(cbPage-1)*cbPS,pd=cbFiltered.slice(start,start+cbPS);if(!pd.length){tbody.innerHTML='<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-dim)">No customers match filters</td></tr>'}else{tbody.innerHTML=pd.map(function(c){var tags=[];if(c.hasBundle)tags.push('<span class="badge taupe">Bundle</span>');if(c.hasAcademyBundle)tags.push('<span class="badge teal">Academy All</span>');if(!c.hasBundle&&c.fusionPurchases.length>0)tags.push('<span class="badge purple">'+c.fusionPurchases.length+' Fusion</span>');if(!c.hasAcademyBundle&&c.academyPurchases.length>0)tags.push('<span class="badge teal">'+c.academyPurchases.length+' Academy</span>');if(c.isBlocked)tags.unshift('<span class="badge danger">BLOCKED</span>');if(!tags.length)tags.push(c.hasAccount?'<span class="badge muted">Registered</span>':'<span class="badge muted">Guest</span>');var e2=esc(c.email.replace(/'/g,"\\'"));return'<tr style="cursor:pointer;'+(c.isBlocked?'opacity:.55;background:rgba(239,83,80,.03)':'')+'" onclick="showCustomerDetail(\''+e2+'\')"><td class="email">'+esc(c.email)+(c.referralCode?'<br><span class="mono">'+c.referralCode+'</span>':'')+'</td><td class="name">'+(c.name?esc(c.name):'<span style="color:var(--text-dim)">\u2014</span>')+'</td><td>'+tags.join(' ')+'</td><td>'+(c.totalSpent>0?'<span style="color:var(--success)">'+fmtMoney(c.totalSpent)+'</span>':'\u2014')+'</td><td>'+(c.creditBalance>0?'<span style="color:var(--success);font-weight:600">'+fmtMoney(c.creditBalance)+'</span>':'\u2014')+'</td><td>'+(c.referralCount>0?'<span style="color:var(--teal);font-weight:600">'+c.referralCount+'</span>':'\u2014')+'</td><td><button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();showCustomerDetail(\''+e2+'\')">View</button></td></tr>'}).join('')}document.getElementById('cb-pagination').innerHTML='<span>'+cbFiltered.length+' customers \u00b7 Page '+cbPage+'/'+tp+'</span><div class="page-btns"><button class="btn btn-ghost btn-sm" onclick="cbPage=Math.max(1,cbPage-1);renderCBTable()" '+(cbPage<=1?'disabled':'')+'>Prev</button><button class="btn btn-ghost btn-sm" onclick="cbPage=Math.min('+tp+',cbPage+1);renderCBTable()" '+(cbPage>=tp?'disabled':'')+'>Next</button></div>'}
function exportCustomers(){var csv=['Email,Name,Products,Spent,Credits,Code,Referrals'];cbFiltered.forEach(function(c){csv.push([c.email,'"'+(c.name||'')+'"','"'+c.purchases.map(productName).join('; ')+'"',c.totalSpent,c.creditBalance,c.referralCode,c.referralCount].join(','))});var b=new Blob([csv.join('\n')],{type:'text/csv'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='qp-customers.csv';a.click()}

function showCustomerDetail(email){var c=allCustomers.find(function(x){return x.email.toLowerCase()===email.toLowerCase()});if(!c)return;var cp=purchasesData.filter(function(p){return p.email&&p.email.toLowerCase()===email.toLowerCase()});var cc=creditHistory.filter(function(h){return h.email&&h.email.toLowerCase()===email.toLowerCase()});var ce=academyEnrollments.filter(function(e){return e.user_id===c.userId&&e.status==='active'});var notes=getAdminNotes(email);var e2=esc(email.replace(/'/g,"\\'"));
var html='<div class="detail-panel"><button class="btn btn-ghost btn-sm" style="position:absolute;top:16px;right:16px;z-index:10" onclick="this.closest(\'.detail-panel\').remove()">\u2715 Close</button>';
html+='<div class="detail-header"><div style="flex:1"><div class="detail-email">'+esc(c.email)+'</div><div class="detail-name">'+(c.name?esc(c.name):'No name on file')+'</div>'+(c.userId?'<div class="detail-id">ID: '+c.userId+'</div>':'')+'</div><div style="display:flex;flex-wrap:wrap;gap:6px;align-items:flex-start;padding-top:4px">'+(c.isBlocked?'<span class="badge danger">Blocked</span>':c.hasAccount?'<span class="badge green">Active Account</span>':'<span class="badge muted">No Account</span>');
var authUser=authUsersMap.get(c.email.toLowerCase());if(authUser){if(authUser.email_confirmed_at)html+='<span class="badge green" title="Confirmed '+new Date(authUser.email_confirmed_at).toLocaleDateString()+'">Email Verified</span>';else html+='<span class="badge yellow">Unverified</span>';if(authUser.last_sign_in_at)html+='<span class="badge muted" title="'+new Date(authUser.last_sign_in_at).toLocaleString()+'">Last login: '+timeAgo(authUser.last_sign_in_at)+'</span>';var optIn=true;if(((authUser.user_metadata||authUser.raw_user_meta_data||{}).marketing_opt_in===false))optIn=false;html+=optIn?'<span class="badge teal">Opted In</span>':'<span class="badge muted">Opted Out</span>'}
var postCount=(function(){var fp=0,ap=0;try{purchasesData.forEach(function(){});fp=document.querySelectorAll?0:0}catch(e){}return{fusion:0,academy:0}})();
try{var fposts=allFusionPosts?allFusionPosts.filter(function(p){return p.user_email&&p.user_email.toLowerCase()===c.email.toLowerCase()}).length:0;var aposts=allAcadPosts?allAcadPosts.filter(function(p){return(p.user_email&&p.user_email.toLowerCase()===c.email.toLowerCase())}).length:0;if(fposts||aposts)html+='<span class="badge purple">'+(fposts+aposts)+' posts</span>'}catch(e){}
html+='</div></div>';
html+='<div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap">';
if(c.userId){html+='<div style="position:relative;display:inline-block" class="login-as-wrap"><button class="btn btn-ghost btn-sm" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display===\'block\'?\'none\':\'block\'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Login As \u25BE</button><div style="display:none;position:absolute;top:100%;left:0;margin-top:4px;background:var(--navy-card);border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden;z-index:100;min-width:160px;box-shadow:0 8px 24px rgba(0,0,0,.3)"><button class="btn btn-ghost btn-sm" style="width:100%;border-radius:0;justify-content:flex-start;border-bottom:1px solid var(--border)" onclick="loginAsUser(\''+e2+'\',\'fusion\');this.parentElement.style.display=\'none\'"><span class="badge purple" style="margin-right:6px">Fusion</span> Sessions Site</button><button class="btn btn-ghost btn-sm" style="width:100%;border-radius:0;justify-content:flex-start" onclick="loginAsUser(\''+e2+'\',\'academy\');this.parentElement.style.display=\'none\'"><span class="badge teal" style="margin-right:6px">Academy</span> Learning Site</button></div></div>';html+='<button class="btn btn-ghost btn-sm" onclick="resetUserPW(\''+e2+'\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg> Reset PW</button>'}
html+='<button class="btn btn-ghost btn-sm" onclick="emailCustomer(\''+e2+'\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> Email</button>';
html+='<button class="btn btn-ghost btn-sm" onclick="navigator.clipboard.writeText(\''+esc(c.userId||c.email)+'\');this.innerHTML=\'Copied!\'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy ID</button>';
if(c.userId){var isBlocked=c.isBlocked||false;html+='<button class="btn '+(isBlocked?'btn-success':'btn-danger')+' btn-sm" onclick="toggleBlockUser(\''+c.userId+'\','+(!isBlocked)+',\''+e2+'\')">'+(isBlocked?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><polyline points="20 6 9 17 4 12"/></svg> Unblock':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> Block')+'</button>'}
html+='</div>';
var fpurch=cp.filter(function(p){return isFusion(p.product_id)});var apurch=cp.filter(function(p){return isAcademy(p.product_id)});
var userProg={};lessonProgress.filter(function(lp){return lp.user_id===c.userId}).forEach(function(lp){var cid=lp.course_id;if(!userProg[cid])userProg[cid]={total:0,completed:0};userProg[cid].total++;if(lp.completed)userProg[cid].completed++});

var notesHtml='<div class="detail-section" style="margin-bottom:16px"><h4><span class="dot" style="background:var(--taupe)"></span> Admin Notes</h4><div style="display:flex;gap:8px;margin-bottom:10px"><input type="text" class="input" id="note-input" placeholder="Add a note..." style="flex:1" onkeypress="if(event.key===\'Enter\')addNote(\''+e2+'\')"><button class="btn btn-primary btn-sm" onclick="addNote(\''+e2+'\')">Add</button></div><div id="notes-list">';
if(notes.length){notes.forEach(function(n){notesHtml+='<div class="note-item"><div class="note-text">'+esc(n.note_text)+'</div><div class="note-meta"><span>'+timeAgo(n.created_at)+'</span><button class="note-delete" onclick="deleteNote(\''+e2+'\',\''+n.id+'\')">Delete</button></div></div>'})}else{notesHtml+='<p style="color:var(--text-dim);font-size:12px">No notes yet</p>'}
notesHtml+='</div></div>';

var creditsHtml='<div class="detail-section" style="margin-bottom:16px"><h4><span class="dot" style="background:var(--teal)"></span> Referral & Credits</h4>';
if(c.referralCode){creditsHtml+='<div style="margin-bottom:10px">Code: <span class="ref-code">'+c.referralCode+'</span></div>'}else{creditsHtml+='<div style="margin-bottom:10px;display:flex;align-items:center;gap:10px"><span style="color:var(--text-dim);font-size:13px">No referral code</span><button class="btn btn-ghost btn-sm" onclick="createReferralCode(\''+e2+'\')">+ Create Code</button></div>'}
creditsHtml+='<div class="ref-stat-row"><div class="ref-stat"><div class="ref-stat-val" style="color:var(--success)">'+fmtMoney(c.creditBalance)+'</div><div class="ref-stat-label">Balance</div></div><div class="ref-stat"><div class="ref-stat-val" style="color:var(--teal)">'+c.referralCount+'</div><div class="ref-stat-label">Referrals</div></div><div class="ref-stat"><div class="ref-stat-val" style="color:var(--taupe)">'+fmtMoney(c.totalEarned)+'</div><div class="ref-stat-label">Earned</div></div></div>';
creditsHtml+='<div class="credit-actions"><input type="number" class="input" id="credit-amount" placeholder="$" min="0" step="1" style="width:80px"><button class="btn btn-success btn-sm" onclick="adjustCredit(\''+e2+'\',1)">+ Add</button><button class="btn btn-danger btn-sm" onclick="adjustCredit(\''+e2+'\',-1)">\u2212 Deduct</button><button class="btn btn-ghost btn-sm" onclick="setCredit(\''+e2+'\')">Set</button></div></div>';

html+='<div class="tab-nav" style="margin-bottom:0"><button class="tab-btn active" onclick="switchDetailTab(\'all\',this)">All</button><button class="tab-btn" onclick="switchDetailTab(\'academy\',this)">Academy</button><button class="tab-btn" onclick="switchDetailTab(\'fusion\',this)">Fusion</button></div>';

html+='<div class="detail-tab" data-dtab="all" style="margin-top:16px">';
html+='<div class="detail-grid"><div class="detail-section"><h4><span class="dot" style="background:var(--success)"></span> Purchases ('+cp.length+')</h4>';
if(cp.length){html+='<div style="max-height:200px;overflow-y:auto">';cp.forEach(function(p){var revoked=isRevoked(p.product_id);html+='<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04);'+(revoked?'opacity:.5':'')+'"><div><span style="color:'+(revoked?'var(--danger)':'var(--text)')+';font-size:13px;'+(revoked?'text-decoration:line-through':'')+'">'+productName(p.product_id)+'</span> '+productBadge(p.product_id)+'<div style="font-size:10px;color:var(--text-dim);margin-top:2px">'+timeAgo(p.purchased_at)+(p.stripe_event_id&&p.stripe_event_id.indexOf('admin-grant')===0?' <span class="badge muted">Granted</span>':'')+'</div></div><div style="font-weight:600;color:'+(revoked?'var(--danger)':'var(--success)')+'">'+fmtMoney(p.amount_paid)+'</div></div>'});html+='</div><div style="margin-top:8px;font-size:12px;color:var(--text-muted)">Total: <strong style="color:var(--success)">'+fmtMoney(c.totalSpent)+'</strong></div>'}else{html+='<p style="color:var(--text-dim);font-size:13px">No purchases</p>'}
html+='</div>'+creditsHtml+'</div>';
html+=notesHtml;
if(cc.length){html+='<div class="detail-section"><h4><span class="dot" style="background:var(--warning)"></span> Credit History</h4><div style="max-height:150px;overflow-y:auto">';cc.slice(0,10).forEach(function(h){html+='<div class="feed-item" style="padding:6px 0"><div class="feed-dot" style="background:'+(h.amount>0?'var(--success)':'var(--warning)')+'"></div><div class="feed-content"><div class="feed-text" style="font-size:12px">'+(h.amount>0?'+':'')+fmtMoney(h.amount)+' \u2014 '+esc(h.description||h.type)+'</div><div class="feed-time">'+timeAgo(h.created_at)+'</div></div></div>'});html+='</div></div>'}
/* Email History in detail panel */
var custEmailTracking=emailTrackingData.filter(function(t){return t.recipient_email&&t.recipient_email.toLowerCase()===email.toLowerCase()});if(custEmailTracking.length){var campMap={};emailCampaignsData.forEach(function(c2){campMap[c2.id]=c2});html+='<div class="detail-section"><h4><span class="dot" style="background:var(--purple)"></span> Email History ('+custEmailTracking.length+')</h4><div style="max-height:160px;overflow-y:auto">';custEmailTracking.slice(0,20).forEach(function(t){var camp=campMap[t.campaign_id]||{};var subj=camp.subject||camp.campaign_name||'Email';var statusDot=t.clicked_at?'clicked':(t.opened_at?'opened':'sent');var statusLabel=t.clicked_at?'Clicked':(t.opened_at?'Opened':'Sent');var date=t.sent_at?new Date(t.sent_at).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'-';html+='<div class="email-detail-row"><span class="email-status-dot '+statusDot+'" title="'+statusLabel+'"></span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(subj)+'</span><span style="color:var(--text-dim);flex-shrink:0;font-size:11px">'+date+'</span></div>'});html+='</div></div>'}
html+='</div>';

html+='<div class="detail-tab" data-dtab="academy" style="display:none;margin-top:16px">';
html+='<div class="detail-section" style="margin-bottom:16px"><h4><span class="dot" style="background:var(--teal)"></span> Enrollments & Progress</h4>';
if(ce.length){html+='<table class="tbl"><thead><tr><th>Course</th><th>Progress</th><th>Enrolled</th><th></th></tr></thead><tbody>';ce.forEach(function(e){var cid=e.qa_courses&&e.qa_courses.id||e.course_id;var prog=userProg[cid]||{total:0,completed:0};var pct=prog.total?Math.round(prog.completed/prog.total*100):0;html+='<tr><td class="name">'+(e.qa_courses&&e.qa_courses.title||'Course')+'</td><td><div style="display:flex;align-items:center;gap:6px;min-width:100px"><div style="flex:1;height:5px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,var(--teal),var(--teal-light));border-radius:3px"></div></div><span style="font-size:10px;font-weight:600;color:var(--teal)">'+prog.completed+'/'+prog.total+'</span></div></td><td>'+timeAgo(e.enrolled_at)+'</td><td style="white-space:nowrap"><button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();resetStudentProgress(\''+c.userId+'\',\''+cid+'\',\''+(e.qa_courses&&e.qa_courses.title?esc(e.qa_courses.title.replace(/'/g,"\\'")):'')+'\',\''+e2+'\')" title="Reset progress">Reset</button> <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();unenrollStudent(\''+e.id+'\',\''+e2+'\')">Unenroll</button></td></tr>'});html+='</tbody></table>'}else{html+='<p style="color:var(--text-dim);font-size:13px;margin-bottom:8px">No enrollments</p>'}
var enrolledSlugs=ce.map(function(e){return e.qa_courses&&e.qa_courses.slug||''});var avail=academyCourses.filter(function(c){return enrolledSlugs.indexOf(c.slug)<0});if(avail.length){html+='<div style="display:flex;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.04);align-items:center"><select class="input" style="width:auto;flex:1" id="detail-enroll-course">';avail.forEach(function(c){html+='<option value="'+c.slug+'">'+esc(c.title)+'</option>'});html+='</select><button class="btn btn-success btn-sm" onclick="enrollFromDetail(\''+e2+'\')">+ Enroll</button></div>'}
html+='</div>';
if(apurch.length){html+='<div class="detail-section" style="margin-bottom:16px"><h4><span class="dot" style="background:var(--teal)"></span> Academy Purchases</h4><div style="max-height:150px;overflow-y:auto">';apurch.forEach(function(p){html+='<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04)"><div><span style="font-size:13px">'+productName(p.product_id)+'</span><span style="font-size:10px;color:var(--text-dim);margin-left:8px">'+timeAgo(p.purchased_at)+'</span>'+(p.stripe_event_id&&p.stripe_event_id.indexOf('admin-grant')===0?' <span class="badge muted">Granted</span>':'')+'</div><div style="font-weight:600;color:var(--success)">'+fmtMoney(p.amount_paid)+'</div></div>'});html+='</div></div>'}
html+=creditsHtml;
html+=notesHtml;
html+='</div>';

html+='<div class="detail-tab" data-dtab="fusion" style="display:none;margin-top:16px">';
html+='<div class="detail-section" style="margin-bottom:16px"><h4><span class="dot" style="background:var(--purple)"></span> Session Access ('+fpurch.length+')</h4>';
if(fpurch.length){html+='<table class="tbl"><thead><tr><th>Session</th><th>Date</th><th>Paid</th><th></th></tr></thead><tbody>';fpurch.forEach(function(p){var isGranted=p.stripe_event_id&&p.stripe_event_id.indexOf('admin-grant')===0;html+='<tr><td class="name">'+productName(p.product_id)+'</td><td>'+timeAgo(p.purchased_at)+'</td><td>'+(Number(p.amount_paid)>0?'<span style="color:var(--success)">'+fmtMoney(p.amount_paid)+'</span>':(isGranted?'<span class="badge muted">Granted</span>':'$0'))+'</td><td><button class="btn btn-danger btn-sm" onclick="revokeFusion(\''+p.product_id+'\',\''+e2+'\')">Revoke</button></td></tr>'});html+='</tbody></table>'}else{html+='<p style="color:var(--text-dim);font-size:13px;margin-bottom:8px">No Fusion sessions</p>'}
var ownedFusion=fpurch.map(function(p){return p.product_id});var hasBundleAll=ownedFusion.indexOf('bundle-all')>=0;var availFusion=Object.keys(FUSION_NAMES).filter(function(k){return!hasBundleAll&&ownedFusion.indexOf(k)<0});if(availFusion.length){html+='<div style="display:flex;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.04);align-items:center"><select class="input" style="width:auto;flex:1" id="detail-grant-fusion">';availFusion.forEach(function(k){html+='<option value="'+k+'">'+FUSION_NAMES[k]+'</option>'});html+='</select><button class="btn btn-success btn-sm" onclick="grantFusionFromDetail(\''+e2+'\')">+ Grant</button></div>'}else if(hasBundleAll){html+='<div style="margin-top:8px;font-size:12px;color:var(--text-muted)"><span class="badge taupe">Complete Bundle</span> \u2014 all sessions</div>'}
html+='</div>';
html+=creditsHtml;
html+=notesHtml;
html+='</div>';

html+='<div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(239,83,80,.15)">';
html+='<div style="display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap">';
html+='<button class="btn btn-danger btn-sm" onclick="revokeAllAccess(\''+e2+'\')">Revoke All Access</button>';
if(c.userId){html+='<button class="btn btn-danger btn-sm" onclick="archiveAccount(\''+e2+'\',\''+c.userId+'\')">Archive Account</button>'}
html+='</div></div>';

document.getElementById('cust-result').innerHTML=html;setTimeout(function(){var el=document.getElementById('cust-result');if(el){var top=el.getBoundingClientRect().top+window.scrollY-80;window.scrollTo({top:top,behavior:'smooth'})}},50)}
async function addNote(email){var inp=document.getElementById('note-input');var t=inp.value.trim();if(!t)return;await saveAdminNote(email,t);showCustomerDetail(email)}
function switchDetailTab(tab,btn){var panel=btn.closest('.detail-panel');if(!panel)return;panel.querySelectorAll('.detail-tab').forEach(function(t){t.style.display='none'});panel.querySelectorAll('.detail-tab[data-dtab="'+tab+'"]').forEach(function(t){t.style.display='block'});btn.closest('.tab-nav').querySelectorAll('.tab-btn').forEach(function(b){b.classList.remove('active')});btn.classList.add('active')}
async function deleteNote(email,id){await deleteAdminNote(email,id);showCustomerDetail(email)}
async function adjustCredit(email,dir){var amt=Number(document.getElementById('credit-amount').value);if(!amt||amt<=0)return showToast('Enter a valid amount','error');try{var res=await sb.from('referral_codes').select('credit_balance').eq('email',email.toLowerCase()).single();if(!res.data)return showToast('No referral code found','error');var nb=Math.max(0,Number(res.data.credit_balance)+amt*dir);await sb.from('referral_codes').update({credit_balance:nb}).eq('email',email.toLowerCase());await sb.from('credit_history').insert({email:email.toLowerCase(),amount:amt*dir,type:'admin_adjustment',description:'Admin credit adjustment',created_at:new Date().toISOString()});await logAudit('adjust_credit',email,(dir>0?'Added':'Deducted')+' $'+amt+' credits (new balance: $'+nb+')',{amount:amt*dir,new_balance:nb});document.getElementById('credit-amount').value='';await loadAllData();showCustomerDetail(email)}catch(e){showToast('Error: '+e.message,'error')}}
async function setCredit(email){var amt=Number(document.getElementById('credit-amount').value);if(isNaN(amt)||amt<0)return showToast('Enter a valid amount','error');try{var res=await sb.from('referral_codes').select('credit_balance').eq('email',email.toLowerCase()).single();if(!res.data)return showToast('No referral code found','error');var old=Number(res.data.credit_balance)||0;await sb.from('referral_codes').update({credit_balance:amt}).eq('email',email.toLowerCase());await sb.from('credit_history').insert({email:email.toLowerCase(),amount:amt-old,type:'admin_set',description:'Admin set credit to $'+amt+' (was $'+old+')',created_at:new Date().toISOString()});await logAudit('set_credit',email,'Set credit balance to $'+amt+' (was $'+old+')',{old_balance:old,new_balance:amt});document.getElementById('credit-amount').value='';await loadAllData();showCustomerDetail(email)}catch(e){showToast('Error: '+e.message,'error')}}
async function unenrollStudent(enrollmentId,email){if(!await qpConfirm('Confirm','Remove this enrollment?'))return;try{await sb.from('qa_enrollments').update({status:'revoked'}).eq('id',enrollmentId);await logAudit('unenroll_student',email,'Unenrolled from detail panel',{enrollment_id:enrollmentId});await loadAllData();showCustomerDetail(email)}catch(e){showToast('Error: '+e.message,'error')}}
async function enrollFromDetail(email){var sel=document.getElementById('detail-enroll-course');if(!sel)return;var slug=sel.value;try{var prof=await sb.from('qa_profiles').select('id').eq('email',email.toLowerCase());if(!prof.data||!prof.data.length){showToast('No Academy account found for '+email,'error');return}var uid=prof.data[0].id;var course=await sb.from('qa_courses').select('id').eq('slug',slug).single();if(!course.data){showToast('Course not found','error');return}await sb.from('qa_enrollments').upsert({user_id:uid,course_id:course.data.id,status:'active',enrolled_at:new Date().toISOString()},{onConflict:'user_id,course_id'});await logAudit('enroll_student',email,'Enrolled in '+productName(slug)+' from detail panel',{course_slug:slug});await loadAllData();showCustomerDetail(email)}catch(e){showToast('Error: '+e.message,'error')}}
async function grantFusionFromDetail(email){var sel=document.getElementById('detail-grant-fusion');if(!sel)return;var pid=sel.value;try{await sb.from('purchases').upsert({email:email.toLowerCase(),product_id:pid,stripe_event_id:'admin-grant-'+Date.now(),amount_paid:0,purchased_at:new Date().toISOString()},{onConflict:'stripe_event_id'});await logAudit('grant_access',email,'Granted Fusion access: '+productName(pid),{product_id:pid});await loadAllData();showCustomerDetail(email);setTimeout(function(){var btn=document.querySelector('.detail-panel .tab-btn:nth-child(3)');if(btn)switchDetailTab('fusion',btn)},50)}catch(e){showToast('Error: '+e.message,'error')}}
async function revokeFusion(productId,email){if(!await qpConfirm('Revoke Access','Revoke access to '+productName(productId)+' for '+email+'?',{danger:true,okText:'Revoke'}))return;try{await sb.from('purchases').delete().eq('email',email.toLowerCase()).eq('product_id',productId);await logAudit('revoke_access',email,'Revoked Fusion access: '+productName(productId),{product_id:productId});await loadAllData();showCustomerDetail(email);setTimeout(function(){var btn=document.querySelector('.detail-panel .tab-btn:nth-child(3)');if(btn)switchDetailTab('fusion',btn)},50)}catch(e){showToast('Error: '+e.message,'error')}}
async function loginAsUser(email,dest){var destName=dest==='academy'?'Academy':'Fusion Sessions';if(!await qpConfirm('Login As User','Generate a magic login link for '+email+' on '+destName+'?',{okText:'Generate Link'}))return;try{var redirectUrl=dest==='academy'?'https://academy.quantumphysician.com':'https://fusionsessions.quantumphysician.com';var fetchRes=await authAdminAPI('generate_link',{type:'magiclink',email:email,options:{redirect_to:redirectUrl}});var res={ok:true};var data=fetchRes.data;var link=data.properties&&data.properties.action_link||data.action_link;await logAudit('login_as',email,'Login As on '+destName,{destination:dest});if(link){window.open(link,'_blank')}else{showToast('Could not generate link','error')}}catch(e){showToast('Error: '+e.message,'error')}}
async function resetUserPW(email){if(!await qpConfirm('Reset Password','Send a password reset link for '+email+'?',{okText:'Reset'}))return;try{var fetchRes=await authAdminAPI('generate_link',{type:'recovery',email:email});var res={ok:true};var data=fetchRes.data;await logAudit('reset_password',email,'Generated password reset link');if(data.properties&&data.properties.action_link){if(await qpConfirm('Reset Link Ready','Link generated. Open now, or cancel to copy.',{okText:'Open Link'})){window.open(data.properties.action_link,'_blank')}else{navigator.clipboard.writeText(data.properties.action_link);showToast('Link copied to clipboard','success')}}else if(data.action_link){navigator.clipboard.writeText(data.action_link);showToast('Reset link copied to clipboard','success')}else{showToast('Could not generate reset link','error')}}catch(e){showToast('Error: '+e.message,'error')}}
async function toggleBlockUser(userId,block,email){var action=block?'block':'unblock';if(!await qpConfirm(action.charAt(0).toUpperCase()+action.slice(1)+' User',action.charAt(0).toUpperCase()+action.slice(1)+' '+email+'?',{danger:block,okText:action.charAt(0).toUpperCase()+action.slice(1)}))return;try{var bRes=await authAdminAPI('update_user',{userId:userId,userData:{ban_duration:block?'876600h':'none'}});var res={ok:true};if(!res.ok){var errData=await res.json().catch(function(){return{}});console.error('Auth ban/unban error:',res.status,errData);showToast('Auth update failed ('+res.status+') - updating profile only','error')}await proxyFrom('profiles').update({is_blocked:block}).eq('id',userId);await logAudit('block_user',email,(block?'Blocked':'Unblocked')+' user',{user_id:userId});await loadAllData();showCustomerDetail(email);showToast((block?'Blocked':'Unblocked')+' '+email,'success')}catch(e){showToast('Error: '+e.message,'error')}}
var custACF=[],custACI=-1;
function handleCustSearch(){var q=document.getElementById('cust-search').value.trim().toLowerCase(),dd=document.getElementById('cust-ac');if(q.length<2){dd.classList.remove('open');return}custACF=allCustomers.filter(function(c){return c.email.toLowerCase().indexOf(q)>=0||c.name.toLowerCase().indexOf(q)>=0||(c.referralCode&&c.referralCode.toLowerCase().indexOf(q)>=0)}).slice(0,8);if(!custACF.length){dd.classList.remove('open');return}custACI=0;renderCustAC(q);dd.classList.add('open')}
function renderCustAC(q){var dd=document.getElementById('cust-ac');var re=new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');dd.innerHTML=custACF.map(function(c,i){return'<div class="ac-item '+(i===custACI?'sel':'')+'" onclick="selCustAC('+i+')"><span class="ac-email">'+c.email.replace(re,'<span class="ac-hl">$1</span>')+'</span>'+(c.referralCode?'<span class="ac-code">'+c.referralCode+'</span>':'')+(c.name?'<span class="ac-name">'+esc(c.name)+'</span>':'')+'</div>'}).join('')}
function handleCustKeydown(e){var dd=document.getElementById('cust-ac');if(!dd.classList.contains('open')){if(e.key==='Enter')searchCustomer();return}if(e.key==='ArrowDown'){e.preventDefault();custACI=Math.min(custACI+1,custACF.length-1);renderCustAC(document.getElementById('cust-search').value.trim().toLowerCase())}if(e.key==='ArrowUp'){e.preventDefault();custACI=Math.max(custACI-1,0);renderCustAC(document.getElementById('cust-search').value.trim().toLowerCase())}if(e.key==='Enter'){e.preventDefault();selCustAC(custACI)}if(e.key==='Escape')dd.classList.remove('open')}
function selCustAC(i){var c=custACF[i];if(c){document.getElementById('cust-search').value=c.email;document.getElementById('cust-ac').classList.remove('open');showCustomerDetail(c.email)}}
function searchCustomer(){var e=document.getElementById('cust-search').value.trim();if(!e)return;document.getElementById('cust-ac').classList.remove('open');showCustomerDetail(e)}
function handleGlobalSearch(){var q=document.getElementById('global-search').value.trim().toLowerCase(),dd=document.getElementById('global-ac');if(q.length<2){dd.classList.remove('open');return}var f=allCustomers.filter(function(c){return c.email.toLowerCase().indexOf(q)>=0||c.name.toLowerCase().indexOf(q)>=0}).slice(0,6);if(!f.length){dd.classList.remove('open');return}dd.innerHTML=f.map(function(c,i){return'<div class="ac-item'+(i===0?' sel':'')+'" onclick="go(\'customers\');setTimeout(function(){showCustomerDetail(\''+esc(c.email)+'\')},100)"><span class="ac-email">'+esc(c.email)+'</span>'+(c.name?'<span class="ac-name">'+esc(c.name)+'</span>':'')+'</div>'}).join('');dd.classList.add('open')}
function handleGlobalKeydown(e){if(e.key==='Escape')document.getElementById('global-ac').classList.remove('open')}
document.addEventListener('click',function(e){if(!e.target.closest('#global-search-wrap'))document.getElementById('global-ac').classList.remove('open');if(!e.target.closest('.ac-wrap')){var dd=document.getElementById('cust-ac');if(dd)dd.classList.remove('open')}});
async function grantAccess(){var email=document.getElementById('grant-email').value.trim(),pid=document.getElementById('grant-product').value,msg=document.getElementById('grant-msg');if(!email){showMsg(msg,'error','Enter an email');return}try{await sb.from('purchases').upsert({email:email.toLowerCase(),product_id:pid,stripe_event_id:'admin-grant-'+Date.now(),amount_paid:0,purchased_at:new Date().toISOString()},{onConflict:'stripe_event_id'});if(isAcademy(pid)){var slugs=pid==='transformational-mastery'?ACADEMY_SLUGS:[pid];var prof=await sb.from('qa_profiles').select('id').eq('email',email.toLowerCase());if(prof.data&&prof.data.length){var uid=prof.data[0].id;var courses=await sb.from('qa_courses').select('id,slug').in('slug',slugs);if(courses.data)for(var i=0;i<courses.data.length;i++)await sb.from('qa_enrollments').upsert({user_id:uid,course_id:courses.data[i].id,status:'active',enrolled_at:new Date().toISOString()},{onConflict:'user_id,course_id'})}}showMsg(msg,'success','Access granted: '+productName(pid)+' \u2192 '+email);document.getElementById('grant-email').value='';await logAudit('grant_access',email,'Granted access to '+productName(pid),{product_id:pid});await loadAllData()}catch(e){showMsg(msg,'error','Error: '+e.message)}}

function switchAcadTab(tab,btn){document.querySelectorAll('#page-academy .tab-content').forEach(function(t){t.classList.remove('active')});document.getElementById('acad-tab-'+tab).classList.add('active');btn.closest('.tab-nav').querySelectorAll('.tab-btn').forEach(function(b){b.classList.remove('active')});btn.classList.add('active');if(tab==='students')loadAcadStudents()}
function loadAcademyData(){if(!dataLoaded)return;var ae=academyEnrollments.filter(function(e){return e.status==='active'});var us=new Set(ae.map(function(e){return e.user_id})).size;var ap=purchasesData.filter(function(p){return isAcademy(p.product_id)});var ar=ap.reduce(function(s,p){return s+(Number(p.amount_paid)||0)},0);var bc=purchasesData.filter(function(p){return p.product_id==='transformational-mastery'}).length;
document.getElementById('acad-stats').innerHTML='<div class="stat-card" style="cursor:pointer" onclick="acadStatClick(\'active\')"><div class="stat-ico teal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/></svg></div><div><div class="stat-val">'+ae.length+'</div><div class="stat-lbl">Active Enrollments</div></div></div><div class="stat-card" style="cursor:pointer" onclick="acadStatClick(\'students\')"><div class="stat-ico warm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div><div class="stat-val">'+us+'</div><div class="stat-lbl">Unique Students</div></div></div><div class="stat-card" style="cursor:pointer" onclick="acadStatClick(\'revenue\')"><div class="stat-ico green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div><div><div class="stat-val">'+fmtMoney(ar)+'</div><div class="stat-lbl">Revenue</div></div></div><div class="stat-card" style="cursor:pointer" onclick="acadStatClick(\'bundles\')"><div class="stat-ico purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/></svg></div><div><div class="stat-val">'+bc+'</div><div class="stat-lbl">Bundle Sales</div></div></div>';
var ec={};ae.forEach(function(e){var t=e.qa_courses&&e.qa_courses.title||'Unknown';ec[t]=(ec[t]||0)+1});
document.getElementById('acad-courses').innerHTML=academyCourses.length?'<table class="tbl"><thead><tr><th>Course</th><th>Slug</th><th>Price</th><th>Enrolled</th><th>Status</th><th></th></tr></thead><tbody>'+academyCourses.map(function(c){return'<tr><td class="name">'+esc(c.title)+'</td><td class="mono">'+c.slug+'</td><td><input type="number" value="'+(c.price_cents||0)+'" style="width:80px;padding:4px 8px;font-size:12px;background:rgba(255,255,255,.06);border:1px solid var(--border);border-radius:4px;color:var(--text);font-family:Inter,sans-serif" id="price-'+c.id+'"> <span style="font-size:10px;color:var(--text-dim)">\u00a2</span></td><td><strong style="color:var(--teal)">'+(ec[c.title]||0)+'</strong></td><td><select style="padding:4px 8px;font-size:12px;background:rgba(255,255,255,.06);border:1px solid var(--border);border-radius:4px;color:var(--text);font-family:Inter,sans-serif" id="status-'+c.id+'"><option value="published" '+(c.status==='published'?'selected':'')+'>Published</option><option value="draft" '+(c.status==='draft'?'selected':'')+'>Draft</option><option value="archived" '+(c.status==='archived'?'selected':'')+'>Archived</option></select></td><td><button class="btn btn-primary btn-sm" onclick="updateCourse(\''+c.id+'\')">Save</button></td></tr>'}).join('')+'</tbody></table>':'<div class="empty"><p>No courses</p></div>'}
async function updateCourse(id){var price=document.getElementById('price-'+id).value,status=document.getElementById('status-'+id).value;try{await sb.from('qa_courses').update({price_cents:Number(price),status:status}).eq('id',id);await loadAllData();loadAcademyData()}catch(e){showToast('Error: '+e.message,'error')}}
var stuData=[],stuPage=1,stuPS=15;
function loadAcadStudents(){var prof=new Map();profilesData.forEach(function(p){prof.set(p.id,p)});var userProg={};lessonProgress.forEach(function(lp){if(!userProg[lp.user_id])userProg[lp.user_id]={total:0,completed:0};userProg[lp.user_id].total++;if(lp.completed)userProg[lp.user_id].completed++});var sel=document.getElementById('stu-course');var prev=sel.value;sel.innerHTML='<option value="all">All Courses</option>';academyCourses.forEach(function(c){sel.innerHTML+='<option value="'+c.id+'">'+esc(c.title)+'</option>'});sel.value=prev||'all';var esel=document.getElementById('enroll-course');esel.innerHTML='';academyCourses.forEach(function(c){esel.innerHTML+='<option value="'+c.slug+'">'+esc(c.title)+'</option>'});var bsel=document.getElementById('bulk-course');if(bsel){bsel.innerHTML='';academyCourses.forEach(function(c){bsel.innerHTML+='<option value="'+c.slug+'">'+esc(c.title)+'</option>'})};stuData=[];academyEnrollments.forEach(function(e){var p=prof.get(e.user_id);var email=p?p.email:e.user_id;var name=p?p.full_name||'':'';var courseName=e.qa_courses&&e.qa_courses.title||'Unknown';var courseId=e.qa_courses&&e.qa_courses.id||e.course_id;var prog=userProg[e.user_id]||{total:0,completed:0};var pct=prog.total?Math.round(prog.completed/prog.total*100):0;var purchase=purchasesData.find(function(px){return px.email&&px.email.toLowerCase()===email.toLowerCase()&&isAcademy(px.product_id)});var isGranted=purchase&&purchase.stripe_event_id&&purchase.stripe_event_id.indexOf('admin-grant')===0;stuData.push({id:e.id,email:email,name:name,userId:e.user_id,course:courseName,courseId:courseId,enrolled:e.enrolled_at,status:e.status,lessonsCompleted:prog.completed,lessonsTotal:prog.total,pct:pct,paid:purchase?Number(purchase.amount_paid)||0:0,granted:isGranted||false})});renderStudentTable()}
function renderStudentTable(){var courseF=document.getElementById('stu-course').value;var statusF=document.getElementById('stu-status').value;var sortF=document.getElementById('stu-sort').value;var searchF=(document.getElementById('stu-search').value||'').toLowerCase().trim();var filtered=stuData.filter(function(s){if(courseF!=='all'&&s.courseId!==courseF)return false;if(statusF==='active'&&s.status!=='active')return false;if(statusF==='granted'&&!s.granted)return false;if(statusF==='revoked'&&s.status!=='revoked')return false;if(searchF&&s.email.toLowerCase().indexOf(searchF)<0&&s.name.toLowerCase().indexOf(searchF)<0)return false;return true});filtered.sort(function(a,b){switch(sortF){case'enrolled-desc':return(b.enrolled||'').localeCompare(a.enrolled||'');case'enrolled-asc':return(a.enrolled||'').localeCompare(b.enrolled||'');case'progress-desc':return b.pct-a.pct;case'progress-asc':return a.pct-b.pct;case'email-asc':return a.email.localeCompare(b.email);case'name-asc':return(a.name||'').localeCompare(b.name||'');case'paid-desc':return b.paid-a.paid;default:return 0}});var tp=Math.ceil(filtered.length/stuPS)||1;stuPage=Math.min(stuPage,tp);var start=(stuPage-1)*stuPS;var page=filtered.slice(start,start+stuPS);var c=document.getElementById('acad-students-table');if(!page.length){c.innerHTML='<div class="empty"><p>No students match filters</p></div>';document.getElementById('stu-pagination').innerHTML='';return}
var html='<table class="tbl"><thead><tr><th>Student</th><th>Name</th><th>Course</th><th>Enrolled</th><th>Lessons</th><th>Progress</th><th>Paid</th><th>Status</th><th></th></tr></thead><tbody>';page.forEach(function(s){var statusBadge=s.status==='active'?(s.granted?'<span class="badge yellow">Granted</span>':'<span class="badge green">Active</span>'):'<span class="badge muted">Revoked</span>';var pBar='<div style="display:flex;align-items:center;gap:6px;min-width:90px"><div style="flex:1;height:5px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden"><div style="height:100%;width:'+s.pct+'%;background:linear-gradient(90deg,var(--teal),var(--teal-light));border-radius:3px"></div></div><span style="font-size:10px;font-weight:600;color:var(--teal);min-width:28px">'+s.pct+'%</span></div>';var e2=esc(s.email.replace(/'/g,"\\'"));html+='<tr><td class="email" style="cursor:pointer" onclick="go(\'customers\');setTimeout(function(){showCustomerDetail(\''+e2+'\')},100)">'+esc(s.email)+'</td><td class="name">'+(s.name?esc(s.name):'<span style="color:var(--text-dim)">\u2014</span>')+'</td><td style="font-size:12px">'+esc(s.course)+'</td><td>'+timeAgo(s.enrolled)+'</td><td>'+s.lessonsCompleted+'/'+s.lessonsTotal+'</td><td>'+pBar+'</td><td>'+(s.paid>0?'<span style="color:var(--success)">'+fmtMoney(s.paid)+'</span>':'\u2014')+'</td><td>'+statusBadge+'</td><td>'+(s.status==='active'?'<button class="btn btn-danger btn-sm" onclick="unenrollDirect(\''+s.id+'\')">Unenroll</button>':'')+'</td></tr>'});html+='</tbody></table>';c.innerHTML=html;document.getElementById('stu-pagination').innerHTML='<span>'+filtered.length+' enrollments \u00b7 Page '+stuPage+'/'+tp+'</span><div class="page-btns"><button class="btn btn-ghost btn-sm" onclick="stuPage=Math.max(1,stuPage-1);renderStudentTable()" '+(stuPage<=1?'disabled':'')+'>Prev</button><button class="btn btn-ghost btn-sm" onclick="stuPage=Math.min('+tp+',stuPage+1);renderStudentTable()" '+(stuPage>=tp?'disabled':'')+'>Next</button></div>'}
function acadStatClick(type){var btn=document.querySelector('#page-academy .tab-btn:last-child');switchAcadTab('students',btn);setTimeout(function(){document.getElementById('stu-course').value='all';document.getElementById('stu-status').value='all';document.getElementById('stu-search').value='';if(type==='active'){document.getElementById('stu-status').value='active';document.getElementById('stu-sort').value='enrolled-desc'}else if(type==='students'){document.getElementById('stu-sort').value='email-asc'}else if(type==='revenue'){document.getElementById('stu-sort').value='paid-desc'}else if(type==='bundles'){document.getElementById('stu-search').value=''}stuPage=1;renderStudentTable()},50)}
async function enrollStudent(){var email=document.getElementById('enroll-email').value.trim();var slug=document.getElementById('enroll-course').value;var msg=document.getElementById('enroll-msg');if(!email){showMsg(msg,'error','Enter a student email');return}try{var prof=await sb.from('qa_profiles').select('id').eq('email',email.toLowerCase());if(!prof.data||!prof.data.length){showMsg(msg,'error','No Academy account found for '+email+'. They need to sign up first.');return}var uid=prof.data[0].id;var course=await sb.from('qa_courses').select('id').eq('slug',slug).single();if(!course.data){showMsg(msg,'error','Course not found');return}await sb.from('qa_enrollments').upsert({user_id:uid,course_id:course.data.id,status:'active',enrolled_at:new Date().toISOString()},{onConflict:'user_id,course_id'});showMsg(msg,'success','Enrolled '+email+' in '+productName(slug));document.getElementById('enroll-email').value='';await logAudit('enroll_student',email,'Enrolled in '+productName(slug),{course_slug:slug});await loadAllData();loadAcadStudents();loadAcademyData()}catch(e){showMsg(msg,'error','Error: '+e.message)}}
async function unenrollDirect(id){if(!await qpConfirm('Confirm','Remove this enrollment?'))return;try{var stu=stuData.find(function(s){return s.id===id});await sb.from('qa_enrollments').update({status:'revoked'}).eq('id',id);if(stu)await logAudit('unenroll_student',stu.email,'Unenrolled from '+stu.course,{enrollment_id:id});await loadAllData();loadAcadStudents()}catch(e){showToast('Error: '+e.message,'error')}}
function loadFusionData(){if(!dataLoaded)return;var fp=purchasesData.filter(function(p){return isFusion(p.product_id)});var fr=fp.reduce(function(s,p){return s+(Number(p.amount_paid)||0)},0);var bc=fp.filter(function(p){return p.product_id==='bundle-all'}).length;var ub=new Set(fp.map(function(p){return p.email&&p.email.toLowerCase()})).size;var sc={};fp.forEach(function(p){if(p.product_id!=='bundle-all')sc[p.product_id]=(sc[p.product_id]||0)+1});
document.getElementById('fusion-stats').innerHTML='<div class="stat-card"><div class="stat-ico green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div><div><div class="stat-val">'+fmtMoney(fr)+'</div><div class="stat-lbl">Fusion Revenue</div></div></div><div class="stat-card"><div class="stat-ico purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/></svg></div><div><div class="stat-val">'+bc+'</div><div class="stat-lbl">Bundle Sales</div></div></div><div class="stat-card"><div class="stat-ico warm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div><div class="stat-val">'+ub+'</div><div class="stat-lbl">Total Buyers</div></div></div><div class="stat-card"><div class="stat-ico teal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div><div class="stat-val">'+fp.filter(function(p){return p.product_id!=='bundle-all'}).length+'</div><div class="stat-lbl">Individual Sales</div></div></div>';
var sl=Object.entries(FUSION_NAMES).filter(function(x){return x[0]!=='bundle-all'}).map(function(x){return{pid:x[0],name:x[1],count:sc[x[0]]||0}}).sort(function(a,b){return b.count-a.count});
document.getElementById('fusion-content').innerHTML='<table class="tbl"><thead><tr><th>Session</th><th>Sales</th></tr></thead><tbody>'+sl.map(function(s){return'<tr><td class="name">'+s.name+'</td><td><strong style="color:var(--purple)">'+s.count+'</strong></td></tr>'}).join('')+'</tbody></table><div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)"><div class="card-title" style="margin-bottom:12px">Recent Purchases</div>'+fp.slice(0,8).map(function(p){return'<div class="feed-item"><div class="feed-dot" style="background:var(--purple)"></div><div class="feed-content"><div class="feed-text"><strong>'+esc(p.email)+'</strong> \u2192 '+productName(p.product_id)+'</div><div class="feed-time">'+fmtMoney(p.amount_paid)+' \u00b7 '+timeAgo(p.purchased_at)+'</div></div></div>'}).join('')+'</div>'}

function switchCommTab(tab,btn){document.querySelectorAll('#page-community .tab-content').forEach(function(t){t.classList.remove('active')});document.getElementById('comm-tab-'+tab).classList.add('active');btn.closest('.tab-nav').querySelectorAll('.tab-btn').forEach(function(b){b.classList.remove('active')});btn.classList.add('active');if(tab==='academy')loadAcadDiscussions();if(tab==='fusion')loadFusionPosts();if(tab==='moderators')loadModerators()}
async function loadCommunityData(){try{var r=await Promise.all([sb.from('qa_discussions').select('*',{count:'exact',head:true}),sb.from('discussion_posts').select('*',{count:'exact',head:true})]);var ac=r[0].count||0,fc=r[1].count||0;document.getElementById('comm-stats').innerHTML='<div class="stat-card"><div class="stat-ico teal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><div><div class="stat-val">'+ac+'</div><div class="stat-lbl">Academy Posts</div></div></div><div class="stat-card"><div class="stat-ico purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><div><div class="stat-val">'+fc+'</div><div class="stat-lbl">Fusion Posts</div></div></div><div class="stat-card"><div class="stat-ico green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div><div class="stat-val">'+(ac+fc)+'</div><div class="stat-lbl">Total Posts</div></div></div>';loadAcadDiscussions()}catch(e){console.error(e)}}
async function loadAcadDiscussions(){var c=document.getElementById('comm-acad-posts');c.innerHTML='<div class="loading-center"><div class="spinner"></div>Loading...</div>';try{var q=sb.from('qa_discussions').select('*').order('created_at',{ascending:false}).limit(50);var f=document.getElementById('comm-acad-filter').value,s=document.getElementById('comm-acad-search').value.trim();if(f==='visible')q=q.or('is_hidden.is.null,is_hidden.eq.false');else if(f==='hidden')q=q.eq('is_hidden',true);else if(f==='pinned')q=q.eq('is_pinned',true);if(s)q=q.or('content.ilike.%'+s+'%,user_name.ilike.%'+s+'%');var res=await q;if(res.error)throw res.error;var posts=res.data;if(!posts||!posts.length){c.innerHTML='<div class="empty"><p>No discussions found</p></div>';return}c.innerHTML=posts.map(function(p){return renderPostCard(p,'qa_discussions')}).join('')}catch(e){c.innerHTML='<p style="color:var(--danger)">Error: '+e.message+'</p>'}}
async function loadFusionPosts(){var c=document.getElementById('comm-fus-posts');c.innerHTML='<div class="loading-center"><div class="spinner"></div>Loading...</div>';try{var q=sb.from('discussion_posts').select('*').order('created_at',{ascending:false}).limit(50);var f=document.getElementById('comm-fus-filter').value,s=document.getElementById('comm-fus-search').value.trim();if(f==='visible')q=q.or('is_hidden.is.null,is_hidden.eq.false');else if(f==='hidden')q=q.eq('is_hidden',true);else if(f==='pinned')q=q.eq('is_pinned',true);if(s)q=q.or('content.ilike.%'+s+'%,user_email.ilike.%'+s+'%');var res=await q;if(res.error)throw res.error;var posts=res.data;if(!posts||!posts.length){c.innerHTML='<div class="empty"><p>No posts found</p></div>';return}c.innerHTML=posts.map(function(p){return renderPostCard(p,'discussion_posts')}).join('')}catch(e){c.innerHTML='<p style="color:var(--danger)">Error: '+e.message+'</p>'}}
function renderPostCard(p,table){var name=p.user_name||(p.user_email?p.user_email.split('@')[0]:'Anonymous');var email=p.user_email||'';var init=(name[0]||'?').toUpperCase();var badges=[];if(p.is_pinned)badges.push('<span class="badge teal">Pinned</span>');if(p.is_hidden)badges.push('<span class="badge danger">Hidden</span>');return'<div class="post-card '+(p.is_hidden?'hidden-post ':'')+' '+(p.is_pinned?'pinned-post':'')+'"><div class="post-header"><div class="post-author"><div class="post-avatar">'+init+'</div><div><div style="font-size:13px;font-weight:500">'+esc(name)+'</div><div style="font-size:11px;color:var(--text-dim)">'+esc(email)+'</div></div></div><div>'+badges.join(' ')+'</div></div><div class="post-body">'+esc((p.content||'').substring(0,300))+((p.content||'').length>300?'...':'')+'</div><div class="post-meta"><span>'+timeAgo(p.created_at)+'</span>'+(p.reply_count?'<span>'+p.reply_count+' replies</span>':'')+'</div><div class="post-actions"><button class="btn btn-ghost btn-sm" onclick="togglePostPin(\''+p.id+'\','+(!p.is_pinned)+',\''+table+'\')">'+(p.is_pinned?'Unpin':'Pin')+'</button><button class="btn btn-ghost btn-sm" onclick="togglePostHide(\''+p.id+'\','+(!p.is_hidden)+',\''+table+'\')">'+(p.is_hidden?'Show':'Hide')+'</button><button class="btn btn-danger btn-sm" onclick="deletePost(\''+p.id+'\',\''+table+'\')">Delete</button></div></div>'}
async function togglePostPin(id,val,table){try{await sb.from(table).update({is_pinned:val}).eq('id',id);if(table==='qa_discussions')loadAcadDiscussions();else loadFusionPosts()}catch(e){showToast('Error: '+e.message,'error')}}
async function togglePostHide(id,val,table){try{await sb.from(table).update({is_hidden:val}).eq('id',id);if(table==='qa_discussions')loadAcadDiscussions();else loadFusionPosts()}catch(e){showToast('Error: '+e.message,'error')}}
async function deletePost(id,table){if(!await qpConfirm('Delete Post','Delete this post permanently?',{danger:true,okText:'Delete'}))return;try{var replyTable=table==='qa_discussions'?'qa_discussion_replies':'discussion_replies';var fk=table==='qa_discussions'?'discussion_id':'post_id';await sb.from(replyTable).delete().eq(fk,id);await sb.from(table).delete().eq('id',id);if(table==='qa_discussions')loadAcadDiscussions();else loadFusionPosts();loadCommunityData()}catch(e){showToast('Error: '+e.message,'error')}}
function loadReferralData(){if(!dataLoaded)return;var tco=referralData.reduce(function(s,r){return s+(Number(r.credit_balance)||0)},0);var te=referralData.reduce(function(s,r){return s+(Number(r.total_earned)||0)},0);var tr=referralData.reduce(function(s,r){return s+(r.successful_referrals||0)},0);var ar=referralData.filter(function(r){return r.successful_referrals>0}).length;

document.getElementById('ref-stats').innerHTML='<div class="stat-card"><div class="stat-ico green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div><div><div class="stat-val">'+fmtMoney(tco)+'</div><div class="stat-lbl">Credits Outstanding</div></div></div><div class="stat-card"><div class="stat-ico warm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div><div><div class="stat-val">'+fmtMoney(te)+'</div><div class="stat-lbl">Total Earned</div></div></div><div class="stat-card"><div class="stat-ico teal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></div><div><div class="stat-val">'+tr+'</div><div class="stat-lbl">Total Referrals</div></div></div><div class="stat-card"><div class="stat-ico purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div><div class="stat-val">'+ar+'</div><div class="stat-lbl">Active Referrers</div></div></div>';
var top=referralData.filter(function(r){return r.successful_referrals>0}).sort(function(a,b){return b.successful_referrals-a.successful_referrals}).slice(0,10);
document.getElementById('ref-leaderboard').innerHTML=top.length?'<table class="tbl"><thead><tr><th>Email</th><th>Code</th><th>Referrals</th><th>Balance</th><th>Earned</th></tr></thead><tbody>'+top.map(function(r){return'<tr><td class="email">'+esc(r.email)+'</td><td class="mono">'+r.code+'</td><td><strong style="color:var(--teal)">'+r.successful_referrals+'</strong></td><td>'+(Number(r.credit_balance)>0?'<span style="color:var(--success)">'+fmtMoney(r.credit_balance)+'</span>':'\u2014')+'</td><td style="color:var(--taupe)">'+fmtMoney(r.total_earned)+'</td></tr>'}).join('')+'</tbody></table>':'<div class="empty"><p>No referrals</p></div>';
var rc=creditHistory.slice(0,15);document.getElementById('ref-activity').innerHTML=rc.length?rc.map(function(c){return'<div class="feed-item"><div class="feed-dot" style="background:'+(c.amount>0?'var(--success)':'var(--warning)')+'"></div><div class="feed-content"><div class="feed-text"><strong>'+esc(c.email)+'</strong> '+(c.amount>0?'+':'')+fmtMoney(c.amount)+'</div><div class="feed-time">'+esc(c.description||c.type)+' \u00b7 '+timeAgo(c.created_at)+'</div></div></div>'}).join(''):'<div class="empty"><p>No activity</p></div>'}

/* --- CREATE REFERRAL CODE --- */
async function createReferralCode(email){if(!await qpConfirm('Create Referral Code','Create a new referral code for '+email+'?',{okText:'Create'}))return;try{var existing=await proxyFrom('referral_codes').select('code').eq('email',email.toLowerCase());if(existing.data&&existing.data.length){showToast('Already has code: '+existing.data[0].code,'info');await loadAllData();showCustomerDetail(email);return}var code='';var chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';for(var i=0;i<8;i++)code+=chars.charAt(Math.floor(Math.random()*chars.length));var codeCheck=await proxyFrom('referral_codes').select('code').eq('code',code);if(codeCheck.data&&codeCheck.data.length)code+=Math.floor(Math.random()*10);await proxyFrom('referral_codes').insert({email:email.toLowerCase(),code:code,credit_balance:0,total_earned:0,successful_referrals:0}).then(function(res){if(res.error){console.error('Insert error:',res.error);throw new Error(res.error.message)}});await logAudit('create_referral',email,'Created referral code: '+code,{code:code});await loadAllData();showCustomerDetail(email);showToast('Referral code created: '+code,'success')}catch(e){showToast('Error: '+e.message,'error')}}

/* --- DANGER ZONE: REVOKE ALL ACCESS (soft — marks revoked, no deletes) --- */
async function revokeAllAccess(email){if(!await qpConfirm('Revoke All Access','Revoke ALL access for '+email+'? This will mark all purchases as revoked and disable all enrollments. Data is preserved.',{danger:true,okText:'Revoke All'}))return;try{var freshPurchases=await proxyFrom('purchases').select('*').eq('email',email.toLowerCase());var cp=freshPurchases.data||[];for(var i=0;i<cp.length;i++){if(!cp[i].product_id.startsWith('revoked__')){await proxyFrom('purchases').update({product_id:'revoked__'+cp[i].product_id}).eq('id',cp[i].id)}}var prof=await proxyFrom('qa_profiles').select('id').eq('email',email.toLowerCase());if(prof.data&&prof.data.length){var uid=prof.data[0].id;await proxyFrom('qa_enrollments').update({status:'revoked'}).eq('user_id',uid)}await logAudit('revoke_all',email,'Revoked ALL access ('+cp.length+' purchases marked revoked, enrollments disabled)');await loadAllData();showCustomerDetail(email);showToast('All access revoked for '+email,'success')}catch(e){showToast('Error: '+e.message,'error')}}

/* --- DANGER ZONE: ARCHIVE ACCOUNT (soft — blocks auth, keeps all data) --- */
async function archiveAccount(email,userId){if(!await qpConfirm('Archive Account','Archive account for '+email+'? This will block login, revoke enrollments, and mark as blocked. All data is preserved and can be restored.',{danger:true,okText:'Archive'}))return;try{await authAdminAPI('update_user',{userId:userId,userData:{ban_duration:'876600h'}});await proxyFrom('profiles').update({is_blocked:true}).eq('id',userId);var qaProf=await proxyFrom('qa_profiles').select('id').eq('email',email.toLowerCase());if(qaProf.data&&qaProf.data.length){await proxyFrom('qa_enrollments').update({status:'revoked'}).eq('user_id',qaProf.data[0].id)}await logAudit('archive_account',email,'Archived account (auth banned, enrollments revoked, data preserved)',{user_id:userId});await loadAllData();showCustomerDetail(email);showToast('Account archived for '+email+'. Data preserved.','success')}catch(e){showToast('Error: '+e.message,'error')}}

/* --- RESET STUDENT PROGRESS --- */
async function resetStudentProgress(userId,courseId,courseName,email){if(!await qpConfirm('Reset Progress','Reset all lesson progress for '+email+' in '+courseName+'? This will mark all lessons as incomplete.',{danger:true,okText:'Reset'}))return;try{await sb.from('qa_lesson_progress').delete().eq('user_id',userId).eq('course_id',courseId);await logAudit('reset_progress',email,'Reset progress for '+courseName,{course_id:courseId});await loadAllData();showCustomerDetail(email);showToast('Progress reset for '+courseName,'success')}catch(e){showToast('Error: '+e.message,'error')}}

/* --- BULK ENROLL (CSV) --- */
async function bulkEnrollCSV(){var fileInput=document.getElementById('bulk-csv');if(!fileInput||!fileInput.files.length)return showToast('Select a CSV file first','error');var file=fileInput.files[0];var reader=new FileReader();reader.onload=async function(ev){var text=ev.target.result;var lines=text.split(/\r?\n/).filter(function(l){return l.trim()});if(lines.length<2)return showToast('CSV needs a header row and at least one data row','error');var header=lines[0].toLowerCase();var hasSlug=header.indexOf('course')>=0||header.indexOf('slug')>=0;var results=[];var errors=[];var slug=document.getElementById('bulk-course').value;for(var i=1;i<lines.length;i++){var parts=lines[i].split(',').map(function(s){return s.trim().replace(/^["']|["']$/g,'')});var email=parts[0];if(!email||email.indexOf('@')<0)continue;var courseSlug=hasSlug&&parts[1]?parts[1]:slug;try{var prof=await sb.from('qa_profiles').select('id').eq('email',email.toLowerCase());if(!prof.data||!prof.data.length){errors.push(email+': No Academy account');continue}var uid=prof.data[0].id;var course=await sb.from('qa_courses').select('id').eq('slug',courseSlug).single();if(!course.data){errors.push(email+': Course "'+courseSlug+'" not found');continue}await sb.from('qa_enrollments').upsert({user_id:uid,course_id:course.data.id,status:'active',enrolled_at:new Date().toISOString()},{onConflict:'user_id,course_id'});results.push(email)}catch(e){errors.push(email+': '+e.message)}}await logAudit('bulk_enroll',null,'Bulk enrolled '+results.length+' students'+(errors.length?' ('+errors.length+' errors)':''),{enrolled:results,errors:errors});await loadAllData();loadAcadStudents();loadAcademyData();var msg=document.getElementById('bulk-msg');var txt='Enrolled '+results.length+' students.';if(errors.length)txt+='\n\nErrors:\n'+errors.join('\n');showMsg(msg,errors.length?'error':'success',txt)};reader.readAsText(file)}

/* --- EMAIL CENTER --- */
const APPS_SCRIPT_URL='https://script.google.com/macros/s/AKfycbxHvXyIybqImwiCkWSj9_VcnmGGmeknJVLbWRa16LjVa6L5Md1IaMfw0kgO6RsrFNVz/exec';
let currentAudience=[],emailStatsUsersCache=[],emailStudentListData=[],currentEmailStudentFilter='total',_campaignHistoryData=[];
const EMAIL_TEMPLATES={welcome:{name:'Welcome',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:22px;height:22px"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',subject:'Welcome to the Quantum Physician Family!',body:'Hi {{name}},\n\nWelcome to Quantum Physician! We\'re so excited to have you join our healing community.\n\nYour journey toward balance, vitality, and inner alignment starts now.\n\nIf you have any questions, just reply to this email – we\'re here for you every step of the way.'},newSession:{name:'New Session',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:22px;height:22px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',subject:'New Fusion Session Now Available!',body:'Hi {{name}},\n\nExciting news! A new Fusion Session is now available.\n\nLog in to your dashboard to learn more and secure your spot.'},reminder:{name:'Session Reminder',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:22px;height:22px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',subject:'Your Fusion Session is Coming Up!',body:'Hi {{name}},\n\nJust a friendly reminder that your next Fusion Session is coming up soon!\n\nCheck your dashboard for the exact date and time.'},referral:{name:'Referral Promo',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:22px;height:22px"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',subject:'Share the Healing & Earn Rewards!',body:'Hi {{name}},\n\nDid you know you can earn credits just by sharing Quantum Physician with friends?\n\nYour personal referral code: {{referral_code}}\n\nVisit your Referral Hub to grab your shareable link!'},thankYou:{name:'Thank You',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:22px;height:22px"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',subject:'Thank You for Being Part of Our Community',body:'Hi {{name}},\n\nWe just wanted to take a moment to say THANK YOU.\n\nThank you for trusting us with your healing journey.\n\nWith gratitude and healing energy.'},academyWelcome:{name:'Academy Welcome',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:22px;height:22px"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',subject:'Welcome to the Self-H.O.P.E. Academy!',body:'Hi {{name}},\n\nWelcome to the Self-H.O.P.E. Academy! Your courses are ready and waiting for you.\n\nLog in to your student dashboard to start learning today.'}};

function loadEmailPage(){loadEmailStats();updateAudiencePreview();renderTemplateGrid();loadCampaignHistory();loadWeeklyEmailLimit();var si=document.getElementById('email-subject');if(si)si.oninput=function(){document.getElementById('subject-count').textContent=this.value.length}}

function loadEmailStats(){var optedIn=0,optedOut=0,total=0;authUsersMap.forEach(function(u){total++;var oi=true;if(((u.user_metadata||u.raw_user_meta_data||{}).marketing_opt_in===false))oi=false;if(oi)optedIn++;else optedOut++});document.getElementById('email-stats').innerHTML='<div class="stat-card" style="cursor:pointer" onclick="toggleEmailStudentList(\'opted-in\')"><div class="stat-ico green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div><div><div class="stat-val">'+optedIn+'</div><div class="stat-lbl">Opted In</div></div></div><div class="stat-card" style="cursor:pointer" onclick="toggleEmailStudentList(\'opted-out\')"><div class="stat-ico warm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></div><div><div class="stat-val">'+optedOut+'</div><div class="stat-lbl">Opted Out</div></div></div><div class="stat-card" style="cursor:pointer" onclick="toggleEmailStudentList(\'total\')"><div class="stat-ico teal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div><div class="stat-val">'+total+'</div><div class="stat-lbl">Total Users</div></div></div><div class="stat-card"><div class="stat-ico purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div><div><div class="stat-val">'+emailCampaignsData.length+'</div><div class="stat-lbl">Campaigns Sent</div></div></div>'}

function toggleEmailStudentList(filterType){var panel=document.getElementById('email-student-panel');if(panel.style.display!=='none'&&currentEmailStudentFilter===filterType){closeEmailStudentList();return}currentEmailStudentFilter=filterType;var titles={'opted-in':'Opted-In Users','opted-out':'Opted-Out Users','total':'All Users'};document.getElementById('email-student-title').textContent=titles[filterType]||'Users';document.getElementById('email-student-search').value='';panel.style.display='block';var wrap=document.getElementById('email-student-table-wrap');var users=[];authUsersMap.forEach(function(u){var oi=true;if(((u.user_metadata||u.raw_user_meta_data||{}).marketing_opt_in===false))oi=false;if(filterType==='opted-in'&&!oi)return;if(filterType==='opted-out'&&oi)return;var prof=profilesData.find(function(p){return p.email&&p.email.toLowerCase()===(u.email||'').toLowerCase()});users.push({email:u.email,name:prof?prof.full_name||'':'',optedIn:oi,lastLogin:u.last_sign_in_at})});emailStudentListData=users;renderEmailStudentList(users);panel.scrollIntoView({behavior:'smooth'})}
function closeEmailStudentList(){document.getElementById('email-student-panel').style.display='none'}
function filterEmailStudentList(){var q=(document.getElementById('email-student-search').value||'').toLowerCase().trim();var filtered=emailStudentListData.filter(function(u){return!q||u.email.toLowerCase().indexOf(q)>=0||(u.name||'').toLowerCase().indexOf(q)>=0});renderEmailStudentList(filtered)}
function renderEmailStudentList(users){var wrap=document.getElementById('email-student-table-wrap');if(!users.length){wrap.innerHTML='<p style="color:var(--text-dim);font-size:12px">No users match filter</p>';return}wrap.innerHTML='<table class="tbl"><thead><tr><th>Email</th><th>Name</th><th>Status</th><th>Last Login</th></tr></thead><tbody>'+users.map(function(u){return'<tr><td class="email">'+esc(u.email)+'</td><td>'+esc(u.name||'—')+'</td><td>'+(u.optedIn?'<span class="badge green">Opted In</span>':'<span class="badge muted">Opted Out</span>')+'</td><td style="font-size:11px;color:var(--text-dim)">'+timeAgo(u.lastLogin)+'</td></tr>'}).join('')+'</tbody></table>'}

function getWeeklyEmailLimit(){return parseInt(localStorage.getItem('weeklyPromoEmailLimit')||'3',10)}
function saveWeeklyEmailLimit(){var val=parseInt(document.getElementById('weekly-email-limit').value,10)||3;localStorage.setItem('weeklyPromoEmailLimit',val)}
function loadWeeklyEmailLimit(){var el=document.getElementById('weekly-email-limit');if(el)el.value=getWeeklyEmailLimit()}

async function updateAudiencePreview(){var audience=document.getElementById('email-audience').value;var customGroup=document.getElementById('custom-emails-group');var previewEl=document.getElementById('audience-preview');customGroup.style.display=audience==='custom'?'block':'none';if(audience==='custom'){previewEl.innerHTML='Enter emails above, then click Preview';currentAudience=[];updateSendCount();return}previewEl.innerHTML='<div class="spinner" style="display:inline-block;width:14px;height:14px;margin-right:8px"></div> Loading...';try{var recipients=[];if(audience==='all-opted-in'){authUsersMap.forEach(function(u){var oi=true;if(((u.user_metadata||u.raw_user_meta_data||{}).marketing_opt_in===false))oi=false;if(oi){var prof=profilesData.find(function(p){return p.email&&p.email.toLowerCase()===u.email.toLowerCase()});var ref=referralData.find(function(r){return r.email&&r.email.toLowerCase()===u.email.toLowerCase()});recipients.push({email:u.email,name:prof?prof.full_name||'':'',referral_code:ref?ref.code||'':''})}})}else if(audience==='bundle-owners'){var bundleEmails={};purchasesData.forEach(function(p){if(p.product_id==='bundle-all')bundleEmails[p.email.toLowerCase()]=true});authUsersMap.forEach(function(u){var oi=true;if(((u.user_metadata||u.raw_user_meta_data||{}).marketing_opt_in===false))oi=false;if(oi&&bundleEmails[u.email.toLowerCase()]){var prof=profilesData.find(function(p){return p.email&&p.email.toLowerCase()===u.email.toLowerCase()});var ref=referralData.find(function(r){return r.email&&r.email.toLowerCase()===u.email.toLowerCase()});recipients.push({email:u.email,name:prof?prof.full_name||'':'',referral_code:ref?ref.code||'':''})}})}else if(audience==='single-session'){var purchMap={};purchasesData.forEach(function(p){if(!purchMap[p.email.toLowerCase()])purchMap[p.email.toLowerCase()]={hasBundle:false};if(p.product_id==='bundle-all')purchMap[p.email.toLowerCase()].hasBundle=true});var singleEmails={};Object.keys(purchMap).forEach(function(e){if(!purchMap[e].hasBundle)singleEmails[e]=true});authUsersMap.forEach(function(u){var oi=true;if(((u.user_metadata||u.raw_user_meta_data||{}).marketing_opt_in===false))oi=false;if(oi&&singleEmails[u.email.toLowerCase()]){var prof=profilesData.find(function(p){return p.email&&p.email.toLowerCase()===u.email.toLowerCase()});var ref=referralData.find(function(r){return r.email&&r.email.toLowerCase()===u.email.toLowerCase()});recipients.push({email:u.email,name:prof?prof.full_name||'':'',referral_code:ref?ref.code||'':''})}})}else if(audience==='no-purchase'){var purchaserEmails={};purchasesData.forEach(function(p){purchaserEmails[p.email.toLowerCase()]=true});authUsersMap.forEach(function(u){var oi=true;if(((u.user_metadata||u.raw_user_meta_data||{}).marketing_opt_in===false))oi=false;if(oi&&!purchaserEmails[u.email.toLowerCase()]){var prof=profilesData.find(function(p){return p.email&&p.email.toLowerCase()===u.email.toLowerCase()});recipients.push({email:u.email,name:prof?prof.full_name||'':'',referral_code:''})}})}else if(audience.startsWith('session-')){var sessionEmails={};purchasesData.forEach(function(p){if(p.product_id===audience||p.product_id==='bundle-all')sessionEmails[p.email.toLowerCase()]=true});authUsersMap.forEach(function(u){var oi=true;if(((u.user_metadata||u.raw_user_meta_data||{}).marketing_opt_in===false))oi=false;if(oi&&sessionEmails[u.email.toLowerCase()]){var prof=profilesData.find(function(p){return p.email&&p.email.toLowerCase()===u.email.toLowerCase()});var ref=referralData.find(function(r){return r.email&&r.email.toLowerCase()===u.email.toLowerCase()});recipients.push({email:u.email,name:prof?prof.full_name||'':'',referral_code:ref?ref.code||'':''})}})}else if(audience.startsWith('academy-')){var acadEmails={};var courseSlug=audience==='academy-all'?null:audience.replace('academy-','');if(courseSlug){/* Individual course - check purchases for this slug + transformational-mastery (bundle) */purchasesData.forEach(function(p){if(p.product_id===courseSlug||p.product_id==='transformational-mastery')acadEmails[p.email.toLowerCase()]=true})}else{/* All academy - any academy purchase or active enrollment */academyEnrollments.forEach(function(e){if(e.status==='active'){var prof=profilesData.find(function(p){return p.id===e.user_id});if(prof&&prof.email)acadEmails[prof.email.toLowerCase()]=true}});purchasesData.forEach(function(p){if(isAcademy(p.product_id))acadEmails[p.email.toLowerCase()]=true})}authUsersMap.forEach(function(u){var oi=true;if(((u.user_metadata||u.raw_user_meta_data||{}).marketing_opt_in===false))oi=false;if(oi&&acadEmails[u.email.toLowerCase()]){var prof=profilesData.find(function(p){return p.email&&p.email.toLowerCase()===u.email.toLowerCase()});var ref=referralData.find(function(r){return r.email&&r.email.toLowerCase()===u.email.toLowerCase()});recipients.push({email:u.email,name:prof?prof.full_name||'':'',referral_code:ref?ref.code||'':''})}})}currentAudience=recipients;var emails=recipients.map(function(r){return r.email});var vis=emails.slice(0,8);var hidden=emails.slice(8);var html='<div style="display:flex;justify-content:space-between;align-items:center"><span style="color:var(--teal);font-weight:600">'+recipients.length+' recipient'+(recipients.length!==1?'s':'')+' selected</span>'+(recipients.length>0?'<button class="btn btn-ghost btn-sm" onclick="copyAllEmails()">Copy All</button>':'')+'</div>';if(recipients.length>0){html+='<div style="margin-top:8px;font-size:12px;color:var(--text-dim)">';vis.forEach(function(e){html+=esc(e)+'<br>'});if(hidden.length)html+='<span style="color:var(--teal);cursor:pointer" onclick="toggleAudienceExpand(this,'+hidden.length+')">...and '+hidden.length+' more ▼</span><span class="ec-hidden" style="display:none">'+hidden.map(function(e){return esc(e)}).join('<br>')+'</span>';html+='</div>'}previewEl.innerHTML=html;updateSendCount()}catch(e){console.error('Audience error:',e);previewEl.innerHTML='<span style="color:var(--danger)">Error loading audience</span>'}}

function updateSendCount(){var el=document.getElementById('send-count');if(el)el.textContent=currentAudience.length}
function copyAllEmails(){var emails=currentAudience.map(function(r){return r.email}).join('\n');navigator.clipboard.writeText(emails).then(function(){showToast('Copied '+currentAudience.length+' emails','success')}).catch(function(){showToast('Copy failed','error')})}
function toggleAudienceExpand(el,count){var hidden=el.parentElement.querySelector('.ec-hidden');if(!hidden)return;var showing=hidden.style.display!=='none';hidden.style.display=showing?'none':'block';el.textContent=showing?'...and '+count+' more ▼':'show less ▲'}
function insertEmailVar(v){var ta=document.getElementById('email-body');var s=ta.selectionStart,e=ta.selectionEnd,t=ta.value;ta.value=t.substring(0,s)+v+t.substring(e);ta.focus();ta.selectionStart=ta.selectionEnd=s+v.length}

function updateEmailTypeHint(){var type=document.getElementById('email-type-select').value;var hint=document.getElementById('email-type-hint');if(type==='promotional'){hint.style.color='var(--warning)';hint.textContent='Promotional emails count toward the weekly limit and respect opt-out preferences.'}else if(type==='automated'){hint.style.color='var(--teal)';hint.textContent='Automated/Course emails are NOT limited and sent regardless of opt-out.'}else{hint.style.color='var(--success)';hint.textContent='Transactional emails are NOT limited and sent regardless of opt-out.'}}

function previewEmail(){var fromEmail=document.getElementById('email-from').value;var subject=document.getElementById('email-subject').value;var body=document.getElementById('email-body').value;if(!subject||!body){showToast('Fill in subject and body','error');return}if(document.getElementById('email-audience').value==='custom'){var cust=document.getElementById('custom-emails').value.split('\n').map(function(e){return e.trim().toLowerCase()}).filter(function(e){return e&&e.indexOf('@')>=0});currentAudience=cust.map(function(email){return{email:email,name:'',referral_code:''}});updateSendCount()}var s=currentAudience.length?currentAudience[0]:{email:'preview@example.com',name:'Friend',referral_code:'ABC123'};var pb=body.replace(/\{\{name\}\}/g,s.name||'Friend').replace(/\{\{email\}\}/g,s.email).replace(/\{\{referral_code\}\}/g,s.referral_code||'XXXXXX');var toLabel=s.email+(currentAudience.length>1?' (+'+( currentAudience.length-1)+' more)':'');var useRich=document.getElementById('rich-email-toggle').checked;var richHtml=null;if(useRich){var discCfg=getDiscountConfig();var brand=getEmailBrand();richHtml=brand==='academy'?buildAcademyEmail(pb,null,'https://academy.quantumphysician.com',discCfg):buildRichEmail(pb,null,'https://fusionsessions.com',discCfg);if(s.referral_code)richHtml=richHtml.replace(/REFCODE/g,s.referral_code)}var old=document.getElementById('email-preview-modal');if(old)old.remove();var ov=document.createElement('div');ov.id='email-preview-modal';ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.8);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';ov.onclick=function(e){if(e.target===ov)ov.remove()};var box=document.createElement('div');box.style.cssText='background:#112a42;border:1px solid rgba(91,168,178,.25);border-radius:16px;padding:28px;width:95%;max-width:900px;max-height:90vh;overflow-y:auto;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.5)';var xBtn=document.createElement('button');xBtn.innerHTML='\u00d7';xBtn.style.cssText='position:absolute;top:14px;right:14px;background:rgba(91,168,178,.1);border:1px solid rgba(91,168,178,.25);color:#5ba8b2;font-size:18px;cursor:pointer;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;padding:0';xBtn.onclick=function(){ov.remove()};box.appendChild(xBtn);var info=document.createElement('div');info.style.cssText='margin-bottom:14px';info.innerHTML='<h3 style="margin:0 0 14px;font-size:16px;color:#e8e8e8">Email Preview</h3><p style="font-size:12px;margin:4px 0;color:#8899aa"><strong>From:</strong> '+fromEmail+'</p><p style="font-size:12px;margin:4px 0;color:#8899aa"><strong>To:</strong> '+toLabel+'</p><p style="font-size:12px;margin:4px 0;color:#8899aa"><strong>Subject:</strong> <span style="color:#5ba8b2">'+subject+'</span></p>';box.appendChild(info);if(richHtml){var fr=document.createElement('iframe');fr.style.cssText='width:100%;min-height:70vh;border:none;border-radius:8px;background:#2f5f7f;margin-top:4px';fr.srcdoc=richHtml;box.appendChild(fr)}else{var txt=document.createElement('div');txt.style.cssText='font-size:13px;color:#8899aa;white-space:pre-wrap;line-height:1.7;padding:16px;background:rgba(0,0,0,.15);border-radius:8px;max-height:60vh;overflow-y:auto;margin-top:4px';txt.textContent=pb;box.appendChild(txt)}ov.appendChild(box);document.body.appendChild(ov)}

function prepareToSend(){var subject=document.getElementById('email-subject').value;var body=document.getElementById('email-body').value;if(!subject||!body){showToast('Fill in subject and body','error');return}if(document.getElementById('email-audience').value==='custom'){var cust=document.getElementById('custom-emails').value.split('\n').map(function(e){return e.trim().toLowerCase()}).filter(function(e){return e&&e.indexOf('@')>=0});currentAudience=cust.map(function(email){return{email:email,name:'',referral_code:''}});updateSendCount()}if(!currentAudience.length){showToast('No recipients selected','error');return}qpConfirm('Confirm Send','Send this email to '+currentAudience.length+' recipients?\n\nSubject: '+subject+'\nFrom: '+document.getElementById('email-from').value,{okText:'Yes, Send'}).then(function(ok){if(ok)sendEmails()})}

async function sendEmails(){var fromEmail=document.getElementById('email-from').value;var subject=document.getElementById('email-subject').value;var body=document.getElementById('email-body').value;var emailType=document.getElementById('email-type-select').value;var isPromo=emailType==='promotional';document.getElementById('email-log').style.display='block';document.getElementById('send-btn').disabled=true;var logEntries=document.getElementById('email-log-entries');var progressFill=document.getElementById('progress-fill');var progressText=document.getElementById('progress-text');logEntries.innerHTML='';progressFill.style.width='0%';addLogEntry('Starting email send... (type: '+emailType+')','info');var sent=0,failed=0,skippedLimit=0;var total=currentAudience.length;
/* Create campaign record */
var campaignId=null;try{var res=await proxyFrom('email_campaigns').insert([{campaign_type:isPromo?'custom':'automated',campaign_name:subject,subject:subject,from_email:fromEmail,recipient_count:total,status:'sending',sent_at:new Date().toISOString()}]).select().single();if(res.data)campaignId=res.data.id}catch(e){console.error('Campaign insert error:',e)}
/* Pre-check weekly limits for promos */
var recipientEmailCounts={};if(isPromo){var weeklyLimit=getWeeklyEmailLimit();addLogEntry('Weekly promo limit: '+weeklyLimit+' per user','info');var sevenDaysAgo=new Date(Date.now()-7*24*60*60*1000).toISOString();try{var rt=await sb.from('email_tracking').select('recipient_email').in('recipient_email',currentAudience.map(function(r){return r.email})).eq('email_type','promotional').gte('sent_at',sevenDaysAgo);(rt.data||[]).forEach(function(t){recipientEmailCounts[t.recipient_email]=(recipientEmailCounts[t.recipient_email]||0)+1})}catch(e){addLogEntry('Could not pre-check limits','info')}}else{addLogEntry(''+emailType+' — weekly limit NOT enforced','info')}
for(var i=0;i<total;i++){var recipient=currentAudience[i];
/* Check weekly limit for promos */
if(isPromo){var wl=getWeeklyEmailLimit();var cc=(recipientEmailCounts[recipient.email]||0);if(cc>=wl){skippedLimit++;addLogEntry('Skipped '+recipient.email+' — promo limit ('+cc+'/'+wl+')','skip');progressFill.style.width=((i+1)/total*100).toFixed(0)+'%';progressText.textContent='Sent '+sent+'/'+total+(failed?' ('+failed+' failed':'')+(skippedLimit?', '+skippedLimit+' skipped':'')+')';continue}}
var trackingId=campaignId?(campaignId.slice(0,8)+'-'+Date.now()+'-'+Math.random().toString(36).substr(2,6)):('manual-'+Date.now()+'-'+Math.random().toString(36).substr(2,6));
/* Insert tracking record */
try{await proxyFrom('email_tracking').insert([{campaign_id:campaignId,recipient_email:recipient.email,tracking_id:trackingId,status:'sent',email_type:emailType,sent_at:new Date().toISOString()}])}catch(e){}
var ps=subject.replace(/\{\{name\}\}/g,recipient.name||'Friend').replace(/\{\{email\}\}/g,recipient.email);var pb=body.replace(/\{\{name\}\}/g,recipient.name||'Friend').replace(/\{\{email\}\}/g,recipient.email).replace(/\{\{referral_code\}\}/g,recipient.referral_code||'');
var useRich=document.getElementById('rich-email-toggle').checked;
var sendPayload={to:recipient.email,from:fromEmail,subject:ps,body:pb};
if(useRich){var discCfg=getDiscountConfig();var brand=getEmailBrand();var richHtml=brand==='academy'?buildAcademyEmail(pb,trackingId,'https://academy.quantumphysician.com',discCfg):buildRichEmail(pb,trackingId,'https://fusionsessions.com',discCfg);if(recipient.referral_code)richHtml=richHtml.replace(/REFCODE/g,recipient.referral_code);sendPayload.body=richHtml;sendPayload.isHtml=true}
try{await fetch(APPS_SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify(sendPayload)});sent++;addLogEntry('Sent to '+recipient.email,'success');if(isPromo)recipientEmailCounts[recipient.email]=(recipientEmailCounts[recipient.email]||0)+1}catch(e){failed++;addLogEntry('Error: '+recipient.email+' — '+e.message,'error')}
progressFill.style.width=((i+1)/total*100).toFixed(0)+'%';progressText.textContent='Sent '+sent+'/'+total+(failed?' ('+failed+' failed':'')+(skippedLimit?', '+skippedLimit+' skipped':'')+')';await new Promise(function(r){setTimeout(r,100)})}
/* Update campaign record */
if(campaignId){try{await proxyFrom('email_campaigns').update({status:failed===total?'failed':'sent',sent_count:sent,failed_count:failed}).eq('id',campaignId)}catch(e){}}
var summary='Complete! Sent: '+sent;if(failed)summary+=' | Failed: '+failed;if(skippedLimit)summary+=' | Skipped: '+skippedLimit;addLogEntry(summary,'success');document.getElementById('send-btn').disabled=false;await logAudit('send_email',null,'Sent campaign "'+subject+'" to '+sent+' recipients'+(failed?' ('+failed+' failed)':''),{campaign_id:campaignId,sent:sent,failed:failed,skipped:skippedLimit});await loadAllData();loadCampaignHistory()}

function addLogEntry(text,type){var e=document.createElement('div');e.className='log-entry '+(type||'info');e.textContent=text;document.getElementById('email-log-entries').appendChild(e);e.scrollIntoView({behavior:'smooth'})}

/* Templates */
function getAllTemplates(){var custom=JSON.parse(localStorage.getItem('customEmailTemplates')||'{}');return Object.assign({},EMAIL_TEMPLATES,custom)}
function loadTemplate(key){var tmpl=getAllTemplates()[key];if(!tmpl)return;document.getElementById('email-subject').value=tmpl.subject;document.getElementById('email-body').value=tmpl.body;document.getElementById('subject-count').textContent=tmpl.subject.length;showToast('Loaded "'+tmpl.name+'" template','success');document.getElementById('email-subject').scrollIntoView({behavior:'smooth',block:'center'});document.getElementById('email-subject').focus()}
function renderTemplateGrid(){var grid=document.getElementById('template-grid');if(!grid)return;var all=getAllTemplates();var custom=JSON.parse(localStorage.getItem('customEmailTemplates')||'{}');var html='';for(var key in all){var t=all[key];var isC=custom.hasOwnProperty(key);html+='<button class="template-btn'+(isC?' custom':'')+'" onclick="loadTemplate(\''+key+'\')" oncontextmenu="event.preventDefault();openTemplateEditor(\''+key+'\')"><span class="edit-icon">Edit</span><span class="template-icon">'+(t.icon||'')+'</span><span class="template-name">'+(t.name||key)+'</span></button>'}html+='<button class="template-btn" onclick="openTemplateEditor(null)"><span class="template-icon">+</span><span class="template-name">Create New</span></button>';grid.innerHTML=html}
var editingTemplateKey=null;
function openTemplateEditor(key){editingTemplateKey=key;var custom=JSON.parse(localStorage.getItem('customEmailTemplates')||'{}');var all=getAllTemplates();var t=key?all[key]:null;var title=key?'Edit Template':'Create New Template';var html='<div style="display:flex;flex-direction:column;gap:12px"><div class="form-group"><label>Name</label><input type="text" class="input" id="tmpl-name" value="'+(t?esc(t.name):'')+'"></div><div class="form-group"><label>Icon (emoji)</label><input type="text" class="input" id="tmpl-icon" value="'+(t?t.icon||'':'')+'" style="width:60px"></div><div class="form-group"><label>Subject</label><input type="text" class="input" id="tmpl-subject" value="'+(t?esc(t.subject):'')+'"></div><div class="form-group"><label>Body</label><textarea class="input" id="tmpl-body" rows="6">'+(t?esc(t.body):'')+'</textarea></div></div>';showModal({title:title,message:'',type:'confirm',okText:'Save'}).then(function(){});
/* Use a simpler modal approach */
var overlay=document.createElement('div');overlay.className='modal-overlay';overlay.innerHTML='<div class="modal-box" style="max-width:500px"><div class="modal-title">'+title+'</div>'+html+'<div class="modal-actions" style="margin-top:16px">'+(key&&custom.hasOwnProperty(key)?'<button class="btn btn-danger btn-sm" id="tmpl-del">Delete</button>':'')+'<button class="btn btn-ghost btn-sm" id="tmpl-cancel">Cancel</button><button class="btn btn-primary btn-sm" id="tmpl-save">Save</button></div></div>';document.body.appendChild(overlay);overlay.querySelector('#tmpl-save').onclick=function(){var n=document.getElementById('tmpl-name').value.trim(),ic=document.getElementById('tmpl-icon').value.trim()||'',su=document.getElementById('tmpl-subject').value.trim(),bo=document.getElementById('tmpl-body').value.trim();if(!n||!su||!bo){showToast('Fill in all fields','error');return}var ct=JSON.parse(localStorage.getItem('customEmailTemplates')||'{}');var k2=editingTemplateKey||n.toLowerCase().replace(/[^a-z0-9]/g,'_');ct[k2]={name:n,icon:ic,subject:su,body:bo};localStorage.setItem('customEmailTemplates',JSON.stringify(ct));overlay.remove();renderTemplateGrid();showToast('Template saved','success')};overlay.querySelector('#tmpl-cancel').onclick=function(){overlay.remove()};var delBtn=overlay.querySelector('#tmpl-del');if(delBtn)delBtn.onclick=function(){var ct=JSON.parse(localStorage.getItem('customEmailTemplates')||'{}');delete ct[editingTemplateKey];localStorage.setItem('customEmailTemplates',JSON.stringify(ct));overlay.remove();renderTemplateGrid();showToast('Template deleted','success')};overlay.onclick=function(e){if(e.target===overlay)overlay.remove()}}

/* Campaign History */
async function loadCampaignHistory(){var container=document.getElementById('campaign-history-list');if(!container)return;_campaignHistoryData=emailCampaignsData;renderCampaignHistory('all')}
function filterCampaignHistory(type,btn){if(btn){btn.parentElement.querySelectorAll('.ec-filter').forEach(function(b){b.classList.remove('active')});btn.classList.add('active')}renderCampaignHistory(type)}
function renderCampaignHistory(filterType){var container=document.getElementById('campaign-history-list');var campaigns=filterType==='all'?_campaignHistoryData:_campaignHistoryData.filter(function(c){return c.campaign_type===filterType});if(!campaigns.length){container.innerHTML='<div class="empty"><p>No campaigns found'+(filterType!=='all'?' for this filter':'')+'.</p></div>';return}container.innerHTML=campaigns.map(function(c){var date=c.sent_at?new Date(c.sent_at):null;var dateStr=date?date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})+' '+date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):'Draft';var openRate=c.sent_count>0?((c.open_count||0)/c.sent_count*100).toFixed(1):'0';var clickRate=c.open_count>0?((c.click_count||0)/c.open_count*100).toFixed(1):'0';var typeLabel=(c.campaign_type||'custom').replace(/_/g,' ');return'<div class="campaign-item" id="hc-'+c.id+'"><div class="campaign-item-header" onclick="toggleCampaignDetail(\''+c.id+'\')"><span class="campaign-type-badge '+(c.campaign_type||'custom')+'">'+typeLabel+'</span><span style="flex:1;font-weight:500;font-size:13px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(c.campaign_name||c.subject||'Untitled')+'</span><span style="display:flex;gap:14px;align-items:center;font-size:12px;color:var(--text-dim);flex-shrink:0"><span style="color:var(--text-dim)">'+dateStr+'</span><span><strong style="color:var(--teal)">'+(c.sent_count||0)+'</strong> sent</span><span><strong style="color:var(--purple)">'+openRate+'%</strong> opened</span><span><strong style="color:var(--warning)">'+clickRate+'%</strong> clicked</span><span style="font-size:14px">▼</span></span></div><div class="campaign-item-body"><div id="hc-recipients-'+c.id+'"><div class="loading-center"><div class="spinner"></div>Loading...</div></div></div></div>'}).join('')}

async function toggleCampaignDetail(id){var el=document.getElementById('hc-'+id);var wasExpanded=el.classList.contains('expanded');document.querySelectorAll('.campaign-item.expanded').forEach(function(c){c.classList.remove('expanded')});if(wasExpanded)return;el.classList.add('expanded');var rc=document.getElementById('hc-recipients-'+id);try{var res=await sb.from('email_tracking').select('*').eq('campaign_id',id).order('sent_at',{ascending:false});var tracking=res.data||[];if(!tracking.length){rc.innerHTML='<p style="color:var(--text-dim);font-size:12px">No tracking data for this campaign.</p>';return}var totalSent=tracking.length,totalOpened=tracking.filter(function(t){return t.opened_at}).length,totalClicked=tracking.filter(function(t){return t.clicked_at}).length;var html='<div style="display:flex;gap:14px;margin-bottom:12px;font-size:12px;color:var(--text-dim)"><span><strong style="color:var(--teal)">'+totalSent+'</strong> delivered</span><span><strong style="color:var(--purple)">'+totalOpened+'</strong> opened ('+(totalSent>0?(totalOpened/totalSent*100).toFixed(0):0)+'%)</span><span><strong style="color:var(--warning)">'+totalClicked+'</strong> clicked ('+(totalOpened>0?(totalClicked/totalOpened*100).toFixed(0):0)+'%)</span></div>';html+='<table class="tbl"><thead><tr><th>Recipient</th><th>Status</th><th>Opened</th><th>Clicked</th><th>Sent</th></tr></thead><tbody>';tracking.forEach(function(t){var statusColor=t.clicked_at?'var(--success)':(t.opened_at?'var(--purple)':'var(--text-dim)');var statusLabel=t.clicked_at?'Engaged':(t.opened_at?'Opened':'Delivered');var sentDate=t.sent_at?new Date(t.sent_at).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'-';var opened=t.opened_at?new Date(t.opened_at).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'—';var clicked=t.clicked_at?new Date(t.clicked_at).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'—';html+='<tr><td class="email" style="cursor:pointer" onclick="go(\'customers\');setTimeout(function(){showCustomerDetail(\''+esc(t.recipient_email)+'\')},100)">'+esc(t.recipient_email||'-')+'</td><td><span style="color:'+statusColor+';font-weight:600;font-size:10px;text-transform:uppercase">'+statusLabel+'</span></td><td style="font-size:11px">'+opened+'</td><td style="font-size:11px">'+clicked+'</td><td style="font-size:11px;color:var(--text-dim)">'+sentDate+'</td></tr>'});html+='</tbody></table>';rc.innerHTML=html}catch(e){rc.innerHTML='<p style="color:var(--danger);font-size:12px">Error loading recipients.</p>'}}

/* Email Customer (from detail panel) */
function emailCustomer(email){go('email',document.querySelector('.sb-link[onclick*="email"]'));setTimeout(function(){document.getElementById('email-audience').value='custom';document.getElementById('custom-emails-group').style.display='block';document.getElementById('custom-emails').value=email;currentAudience=[{email:email,name:'',referral_code:''}];document.getElementById('audience-preview').innerHTML='<span style="color:var(--teal);font-weight:600">1 recipient selected</span><div style="margin-top:4px;font-size:12px;color:var(--text-dim)">'+esc(email)+'</div>';updateSendCount();document.getElementById('email-subject').scrollIntoView({behavior:'smooth',block:'center'});document.getElementById('email-subject').focus();showToast('Ready to email '+email,'success')},200)}

/* Customer Email History (for detail panel) */
async function loadCustomerEmailHistory(email){var tracking=emailTrackingData.filter(function(t){return t.recipient_email&&t.recipient_email.toLowerCase()===email.toLowerCase()});if(!tracking.length)return'<div style="color:var(--text-dim);font-size:12px">No tracked emails</div>';var campaignMap={};emailCampaignsData.forEach(function(c){campaignMap[c.id]=c});return'<div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--text-dim);margin-bottom:8px">Email History ('+tracking.length+')</div>'+tracking.slice(0,20).map(function(t){var c=campaignMap[t.campaign_id]||{};var subj=c.subject||c.campaign_name||'Email';var statusDot=t.clicked_at?'clicked':(t.opened_at?'opened':'sent');var date=t.sent_at?new Date(t.sent_at).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'-';return'<div class="email-detail-row"><span class="email-status-dot '+statusDot+'"></span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(subj)+'</span><span style="color:var(--text-dim);flex-shrink:0">'+date+'</span></div>'}).join('')}

/* --- AUDIT LOG PAGE --- */
var auditPage=1,auditPS=25;
/* ===== PROMOTIONS MANAGER (SESSION 5) ===== */
function loadPromotionsPage(){if(!dataLoaded)return;var active=promotionsData.filter(function(p){return p.status==='active'&&!(p.expires_at&&new Date(p.expires_at)<new Date())}).length;var totalUses=promotionsData.reduce(function(s,p){return s+(p.times_used||0)},0);document.getElementById('promo-stats').innerHTML='<div class="stat-card"><div class="stat-ico green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></div><div><div class="stat-val">'+active+'</div><div class="stat-lbl">Active Promos</div></div></div><div class="stat-card"><div class="stat-ico purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div><div class="stat-val">'+totalUses+'</div><div class="stat-lbl">Total Uses</div></div></div><div class="stat-card"><div class="stat-ico teal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></div><div><div class="stat-val">'+promotionsData.length+'</div><div class="stat-lbl">Total Promos</div></div></div>';renderPromotionsList()}
function updatePromoDiscountUI(){var t=document.getElementById('promo-discount-type').value;document.getElementById('promo-percent-group').style.display=t==='percent'?'':'none';document.getElementById('promo-fixed-group').style.display=t==='fixed'?'':'none';document.getElementById('promo-setprice-group').style.display=t==='set_price'?'':'none'}
async function createPromotion(){var name=document.getElementById('promo-name').value.trim();var couponId=document.getElementById('promo-coupon-id').value.trim();var discountType=document.getElementById('promo-discount-type').value;var percent=document.getElementById('promo-percent').value;var fixedAmt=document.getElementById('promo-fixed-amount').value||0;var setP=document.getElementById('promo-set-price').value||0;var product=document.getElementById('promo-product').value;var method=document.getElementById('promo-method').value;var expires=document.getElementById('promo-expires').value;var maxUses=parseInt(document.getElementById('promo-max-uses').value)||0;var minPurch=parseInt(document.getElementById('promo-min-purchase').value)||0;var restrictions=document.getElementById('promo-restrictions').value;var stackable=document.getElementById('promo-stackable').checked;var onePerUser=document.getElementById('promo-one-per-user').checked;var notes=document.getElementById('promo-notes').value.trim();if(!name||!couponId){showToast('Fill in promotion name and promo code','error');return}var dp=0,df=0,ds=0;if(discountType==='percent')dp=parseInt(percent);else if(discountType==='fixed'){df=parseInt(fixedAmt)||0;if(!df){showToast('Enter a dollar amount','error');return}}else if(discountType==='set_price'){ds=parseInt(setP)||0;if(!ds){showToast('Enter the set price','error');return}}var dupCheck=await proxyFrom('promotions').select('id,status').eq('coupon_id',couponId.toUpperCase()).maybeSingle();if(dupCheck.data){showToast('Code '+couponId+' already exists (status: '+dupCheck.data.status+'). Delete or reuse it from the All tab.','error');return}try{var res=await proxyFrom('promotions').insert({name:name,coupon_id:couponId.toUpperCase(),discount_percent:dp,discount_type:discountType,discount_fixed:df,discount_set_price:ds,applies_to:product,distribution_method:method,min_purchase:minPurch,restrictions:restrictions,stackable_with_credits:stackable,one_per_user:onePerUser,notes:notes,expires_at:expires?new Date(expires+'T23:59:59Z').toISOString():null,max_uses:maxUses,status:'active'});if(res.error)throw new Error(res.error.message);document.getElementById('promo-name').value='';document.getElementById('promo-coupon-id').value='';document.getElementById('promo-expires').value='';document.getElementById('promo-max-uses').value='0';document.getElementById('promo-min-purchase').value='0';if(document.getElementById('promo-fixed-amount'))document.getElementById('promo-fixed-amount').value='';if(document.getElementById('promo-set-price'))document.getElementById('promo-set-price').value='';document.getElementById('promo-notes').value='';document.getElementById('promo-stackable').checked=false;document.getElementById('promo-one-per-user').checked=true;await logAudit('create_promo',null,'Created promotion: '+name+' ('+couponId.toUpperCase()+')',{coupon_id:couponId.toUpperCase(),discount_type:discountType});await loadAllData();loadPromotionsPage();showToast('Promotion created: '+couponId.toUpperCase(),'success')}catch(e){showToast('Error: '+e.message,'error')}}
function filterPromos(status,btn){currentPromoFilter=status;document.querySelectorAll('.promo-filter-btn').forEach(function(b){b.classList.remove('active')});btn.classList.add('active');renderPromotionsList()}
function renderPromotionsList(){var container=document.getElementById('promotions-list');var promos=promotionsData;if(currentPromoFilter!=='all'){promos=promos.filter(function(p){var isExp=p.expires_at&&new Date(p.expires_at)<new Date();var es=isExp&&p.status==='active'?'expired':p.status;return es===currentPromoFilter})}if(!promos.length){container.innerHTML='<div class="empty"><p>No '+currentPromoFilter+' promotions.</p></div>';return}var pl={'any':'Site-wide','bundle-all':'Bundle','sessions-only':'Sessions','session-01':'S1','session-02':'S2','session-03':'S3','session-04':'S4','session-05':'S5','session-06':'S6','session-07':'S7','session-08':'S8','session-09':'S9','session-10':'S10','session-11':'S11','session-12':'S12'};container.innerHTML=promos.map(function(p){var isExp=p.expires_at&&new Date(p.expires_at)<new Date();var es=isExp&&p.status==='active'?'expired':p.status;var sl=es.charAt(0).toUpperCase()+es.slice(1);var lnk='https://fusionsessions.com/?coupon='+p.coupon_id;var cd=new Date(p.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});var ed=p.expires_at?new Date(p.expires_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'Never';var ut=p.max_uses>0?(p.times_used||0)+'/'+p.max_uses:(p.times_used||0)+' (unlimited)';var dt=p.discount_type||'percent';var db='';if(dt==='percent')db=p.discount_percent+'% OFF';else if(dt==='fixed')db='$'+(p.discount_fixed||0)+' OFF';else if(dt==='set_price')db='SET $'+(p.discount_set_price||0);var al=pl[p.applies_to]||p.applies_to;var m=p.distribution_method||'both';var ml=m==='link'?'Link Only':m==='code'?'Code Only':'Link + Code';var sc=m!=='link',slk=m!=='code';var rb='';if(p.restrictions==='first_purchase')rb+='<span class="badge teal">1st Purchase</span> ';if(p.restrictions==='no_bundle_owners')rb+='<span class="badge teal">No Bundle</span> ';if(p.one_per_user)rb+='<span class="badge yellow">1x/User</span> ';if(p.stackable_with_credits)rb+='<span class="badge green">Stackable</span> ';if(p.min_purchase>0)rb+='<span class="badge muted">Min $'+p.min_purchase+'</span> ';if(p.notes&&p.notes.indexOf('Weekly Goal')>=0)rb+='<span class="badge purple">Auto</span> ';var h='<div class="promo-card promo-'+es+'"><div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px"><div><div style="font-weight:600;font-size:14px;margin-bottom:3px">'+esc(p.name)+'</div><div style="font-size:11px;color:var(--text-dim)">Created '+cd+' · Expires: '+ed+' · Uses: '+ut+(p.notes?' · <span style="color:var(--taupe)" title="'+esc(p.notes)+'">'+esc(p.notes.length>30?p.notes.substring(0,30)+'...':p.notes)+'</span>':'')+'</div>'+(rb?'<div class="promo-badges">'+rb+'</div>':'')+'</div><div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap"><span class="badge yellow">'+db+'</span><span class="badge purple">'+al+'</span><span class="badge teal">'+ml+'</span><span class="badge '+(es==='active'?'green':es==='inactive'?'yellow':es==='expired'?'danger':'muted')+'">'+sl+'</span></div></div>';if(es==='active'){if(slk)h+='<div class="promo-link-box" onclick="copyPromoLink(\''+lnk+'\',this)"><span>'+lnk+'</span><span style="font-size:10px;color:var(--text-dim)">Click to copy</span></div>';if(sc)h+='<div class="promo-link-box" onclick="copyPromoLink(\''+p.coupon_id+'\',this)" style="border-color:rgba(240,180,41,.3)"><span>Code: <strong style="color:var(--warning);font-size:14px;letter-spacing:2px">'+p.coupon_id+'</strong></span><span style="font-size:10px;color:var(--text-dim)">Click to copy</span></div>'}h+='<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">';if(es==='active')h+='<button class="btn btn-ghost btn-sm" onclick="editPromotion(\''+p.id+'\')">Edit</button><button class="btn btn-ghost btn-sm" onclick="usePromoInEmail(\''+p.coupon_id+'\',\''+esc(p.name.replace(/'/g,"\\'"))+'\')">Use in Email</button><button class="btn btn-ghost btn-sm" style="color:var(--warning);border-color:rgba(240,180,41,.2)" onclick="updatePromoStatus(\''+p.id+'\',\'inactive\')">Deactivate</button>';if(es==='inactive')h+='<button class="btn btn-success btn-sm" onclick="updatePromoStatus(\''+p.id+'\',\'active\')">Reactivate</button><button class="btn btn-ghost btn-sm" onclick="updatePromoStatus(\''+p.id+'\',\'archived\')">Archive</button>';if(es==='archived')h+='<button class="btn btn-success btn-sm" onclick="updatePromoStatus(\''+p.id+'\',\'active\')">Reactivate</button><button class="btn btn-danger btn-sm" onclick="deletePromotion(\''+p.id+'\',\''+esc(p.name.replace(/'/g,"\\'"))+'\')">Delete</button>';if(es==='expired')h+='<button class="btn btn-ghost btn-sm" onclick="updatePromoStatus(\''+p.id+'\',\'archived\')">Archive</button>';h+='</div></div>';return h}).join('')}
function copyPromoLink(link,el){navigator.clipboard.writeText(link).then(function(){var sp=el.querySelector('span:last-child');var orig=sp.textContent;sp.textContent='Copied!';sp.style.color='var(--success)';setTimeout(function(){sp.textContent=orig;sp.style.color=''},2000)})}
function usePromoInEmail(couponId,promoName){go('email',document.querySelector('.sb-link[onclick*="email"]'));setTimeout(function(){document.getElementById('email-body').value='Hi {{name}},\n\nWe have a special offer for you!\n\nUse code '+couponId+' at checkout or visit:\nhttps://fusionsessions.com/?coupon='+couponId+'\n\nWith warmth,\nDr. Tracey Clark';document.getElementById('email-subject').value='Special Offer: '+promoName;document.getElementById('subject-count').textContent=('Special Offer: '+promoName).length;document.getElementById('email-subject').scrollIntoView({behavior:'smooth',block:'center'});showToast('Email pre-filled with promo '+couponId,'success')},200)}
async function updatePromoStatus(promoId,newStatus){var act=newStatus==='inactive'?'deactivate':newStatus==='active'?'reactivate':'archive';if(!await qpConfirm('Confirm','Are you sure you want to '+act+' this promotion?'))return;try{var res=await proxyFrom('promotions').update({status:newStatus,updated_at:new Date().toISOString()}).eq('id',promoId);if(res.error)throw new Error(res.error.message);var pr=promotionsData.find(function(p){return p.id===promoId});await logAudit('update_promo',null,(pr?pr.name:'Promo')+' '+act+'d',{promo_id:promoId,new_status:newStatus});await loadAllData();loadPromotionsPage();showToast('Promotion '+act+'d','success')}catch(e){showToast('Error: '+e.message,'error')}}
async function deletePromotion(promoId,name){if(!await qpConfirm('Delete Promotion','Permanently delete "'+name+'"?',{danger:true,okText:'Delete'}))return;try{var pr=promotionsData.find(function(p){return p.id===promoId});await proxyFrom('promotions').delete().eq('id',promoId);await logAudit('delete_promo',null,'Deleted: '+name,{promo_id:promoId,coupon_id:pr?pr.coupon_id:''});await loadAllData();loadPromotionsPage();showToast('Promotion deleted','success')}catch(e){showToast('Error: '+e.message,'error')}}
/* ===== ORDERS (SESSION 5) ===== */
function loadOrdersPage(){if(!dataLoaded)return;filterOrders()}
function filterOrders(){var f=document.getElementById('orders-filter').value;var s=document.getElementById('orders-sort').value;var q=(document.getElementById('orders-search').value||'').toLowerCase().trim();ordersFiltered=purchasesData.filter(function(p){if(q&&(!p.email||p.email.toLowerCase().indexOf(q)<0))return false;switch(f){case'bundle-all':return p.product_id==='bundle-all';case'fusion-only':return isFusion(p.product_id);case'academy-only':return isAcademy(p.product_id);case'admin-granted':return p.stripe_event_id&&p.stripe_event_id.indexOf('admin-grant')===0;case'refunded':return p.product_id&&p.product_id.startsWith('revoked__');default:return true}});ordersFiltered.sort(function(a,b){switch(s){case'recent':return(b.purchased_at||'').localeCompare(a.purchased_at||'');case'oldest':return(a.purchased_at||'').localeCompare(b.purchased_at||'');case'amount-high':return(Number(b.amount_paid)||0)-(Number(a.amount_paid)||0);case'amount-low':return(Number(a.amount_paid)||0)-(Number(b.amount_paid)||0);default:return 0}});var tr=ordersFiltered.reduce(function(s,p){return s+(Number(p.amount_paid)||0)},0);var to=ordersFiltered.filter(function(p){return Number(p.amount_paid)>0}).length;var ao=to>0?(tr/to):0;var ag=ordersFiltered.filter(function(p){return p.stripe_event_id&&p.stripe_event_id.indexOf('admin-grant')===0}).length;document.getElementById('orders-stats').innerHTML='<div class="stat-card"><div class="stat-ico green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div><div><div class="stat-val">'+fmtMoney(tr)+'</div><div class="stat-lbl">Revenue</div></div></div><div class="stat-card"><div class="stat-ico teal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div><div><div class="stat-val">'+to+'</div><div class="stat-lbl">Paid Orders</div></div></div><div class="stat-card"><div class="stat-ico purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div><div><div class="stat-val">'+fmtMoney(ao)+'</div><div class="stat-lbl">Avg Order</div></div></div><div class="stat-card"><div class="stat-ico warm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><div><div class="stat-val">'+ag+'</div><div class="stat-lbl">Admin Grants</div></div></div>';ordersPage=1;renderOrdersTable()}
function renderOrdersTable(){var tbody=document.getElementById('orders-tbody');var tp=Math.ceil(ordersFiltered.length/ordersPS)||1;var start=(ordersPage-1)*ordersPS;var pd=ordersFiltered.slice(start,start+ordersPS);if(!pd.length){tbody.innerHTML='<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-dim)">No transactions match filters</td></tr>';document.getElementById('orders-pagination').innerHTML='';return}tbody.innerHTML=pd.map(function(p){var date=p.purchased_at?new Date(p.purchased_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'--';var isGrant=p.stripe_event_id&&p.stripe_event_id.indexOf('admin-grant')===0;var isRev=isRevoked(p.product_id);var sid=p.stripe_session_id||'';var ss=sid.length>20?sid.substring(0,18)+'...':sid;var pr='';if(p.referral_code_used)pr='<span class="badge teal">'+esc(p.referral_code_used)+'</span>';var e2=esc((p.email||'').replace(/'/g,"\\'"));return'<tr style="'+(isRev?'opacity:.5;text-decoration:line-through':'')+'"><td style="font-size:12px;color:var(--text-dim);white-space:nowrap">'+date+'</td><td class="email" style="cursor:pointer" onclick="go(\'customers\');setTimeout(function(){showCustomerDetail(\''+e2+'\')},100)">'+esc(p.email||'')+'</td><td>'+productBadge(p.product_id)+' <span style="font-size:12px">'+productName(p.product_id)+'</span></td><td>'+(Number(p.amount_paid)>0?'<span style="color:var(--success);font-weight:600">'+fmtMoney(p.amount_paid)+'</span>':(isGrant?'<span style="color:var(--taupe);font-size:11px">Granted</span>':'<span style="color:var(--text-dim)">$0</span>'))+'</td><td>'+pr+'</td><td style="font-size:10px;color:var(--text-dim);font-family:monospace" title="'+esc(sid)+'">'+esc(ss)+'</td><td><button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();go(\'customers\');setTimeout(function(){showCustomerDetail(\''+e2+'\')},100)">View</button>'+(Number(p.amount_paid)>0&&sid&&sid.indexOf('credit-')!==0&&sid.indexOf('admin-grant')!==0&&!isRev?' <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();refundPurchase(\''+esc(sid.replace(/'/g,"\\'"))+'\',\''+e2+'\',' + 'Number(p.amount_paid)||0)" style="font-size:9px;padding:3px 8px">Refund</button>':'')+'</td></tr>'}).join('');document.getElementById('orders-pagination').innerHTML='<span>'+ordersFiltered.length+' transactions · Page '+ordersPage+'/'+tp+'</span><div class="page-btns"><button class="btn btn-ghost btn-sm" onclick="ordersPage=Math.max(1,ordersPage-1);renderOrdersTable()" '+(ordersPage<=1?'disabled':'')+'>Prev</button><button class="btn btn-ghost btn-sm" onclick="ordersPage=Math.min('+tp+',ordersPage+1);renderOrdersTable()" '+(ordersPage>=tp?'disabled':'')+'>Next</button></div>'}
function exportOrders(){var csv=['Date,Email,Product,Amount,Referral,Stripe ID'];ordersFiltered.forEach(function(p){csv.push([p.purchased_at?new Date(p.purchased_at).toISOString():'','"'+(p.email||'')+'"','"'+productName(p.product_id)+'"',p.amount_paid||0,p.referral_code_used||'','"'+(p.stripe_session_id||'')+'"'].join(','))});var b=new Blob([csv.join('\n')],{type:'text/csv'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='qp-orders-'+new Date().toISOString().split('T')[0]+'.csv';a.click()}


/* ==================== RICH HTML EMAIL BUILDER ==================== */
function getDiscountConfig(){
if(!document.getElementById('discount-toggle').checked) return null;
var sel=document.getElementById('discount-promo-select').value;
var cust=document.getElementById('discount-promo-custom').value.trim();
var couponId=cust||sel;
if(!couponId) return null;
/* Find the promo details from promotionsData */
var promo=promotionsData.find(function(p){return p.coupon_id===couponId});
return {couponId:couponId,percent:promo?promo.discount_percent:'10',product:promo?promo.applies_to:'any'}
}

function toggleRichEmailOptions(){
var on=document.getElementById('rich-email-toggle').checked;
document.getElementById('rich-email-options').style.display=on?'block':'none'
}

function toggleDiscountConfig(){
var on=document.getElementById('discount-toggle').checked;
document.getElementById('discount-config').style.display=on?'flex':'none';
if(on) loadPromoSelect()
}

function getEmailBrand(){
return document.getElementById('email-brand-select').value||'fusion'
}

function insertDiscountBlock(){
var sel=document.getElementById('discount-promo-select').value;
var cust=document.getElementById('discount-promo-custom').value.trim();
var code=cust||sel||'YOUR_CODE';
var promo=promotionsData.find(function(p){return p.coupon_id===code});
var discountText='';
if(promo){
if(promo.discount_type==='percent') discountText='**'+promo.discount_percent+'% off** your next purchase!';
else if(promo.discount_type==='fixed') discountText='**$'+promo.discount_fixed+' off** your next purchase!';
else if(promo.discount_type==='set_price') discountText='Special price: **$'+promo.discount_set_price+'**!';
}else{discountText='Special discount on your next purchase!'}
var block='\n---\n'+discountText+'\n\nYour code: **'+code+'**\n\nThis offer is applied automatically when you use the link below.';
var textarea=document.getElementById('email-body');
textarea.value=textarea.value.trimEnd()+'\n'+block;
textarea.scrollTop=textarea.scrollHeight;
showToast('Discount card inserted into body','success')
}

function loadPromoSelect(){
var sel=document.getElementById('discount-promo-select');
if(sel.options.length>1) return;
var active=promotionsData.filter(function(p){return p.status==='active'});
active.forEach(function(p){
var opt=document.createElement('option');
opt.value=p.coupon_id;
var disc=p.discount_type==='percent'?p.discount_percent+'% off':(p.discount_type==='fixed'?'$'+p.discount_fixed+' off':'$'+p.discount_set_price);
opt.textContent=p.name+' ('+p.coupon_id+') — '+disc;
sel.appendChild(opt)
})
}

function buildRichEmail(bodyText,trackingId,siteUrl,discountConfig){
var trackBase=siteUrl+'/.netlify/functions/email-track';
var wrapLink=function(url){return trackingId?trackBase+'?action=click&tid='+trackingId+'&url='+encodeURIComponent(url):url};
var traceyImg='https://fusionsessions.com/dr-tracey-clark.jpg';
/* Strip emojis */
var cleanBody=bodyText
.replace(/[\u{1F600}-\u{1F64F}]/gu,'').replace(/[\u{1F300}-\u{1F5FF}]/gu,'')
.replace(/[\u{1F680}-\u{1F6FF}]/gu,'').replace(/[\u{2600}-\u{26FF}]/gu,'')
.replace(/[\u{2700}-\u{27BF}]/gu,'').replace(/[\u{1F900}-\u{1F9FF}]/gu,'')
.replace(/[\u{FE00}-\u{FE0F}]/gu,'').replace(/[\u{1F1E0}-\u{1F1FF}]/gu,'')
.replace(/  +/g,' ');
/* Split at --- divider */
var parts=cleanBody.split(/\n---\n/);
var mainBody=parts[0].trim();
var discountBody=parts[1]?parts[1].trim():'';
/* Strip signature block */
mainBody=mainBody.replace(/\n\n(With warmth,|With healing energy,|With gratitude,)\n.*$/s,'');
/* Remove raw URLs */
mainBody=mainBody.replace(/\n.*https?:\/\/[^\s]*/g,'');
mainBody=mainBody.replace(/^.*https?:\/\/[^\s]*/gm,'');
mainBody=mainBody.replace(/\n(Your link|Share your link|Claim your|Share it|Your share link|Visit the community|Our community|Join the conversation)[^\n]*/gi,'');
mainBody=mainBody.replace(/\n- /g,'\n\u2022 ').replace(/^- /gm,'\u2022 ');
/* Markdown to HTML */
var mainHtml=mainBody
.replace(/\*\*([^*]+)\*\*/g,'<strong style="color:#00f5ff;">$1</strong>')
.replace(/~~([^~]+)~~/g,'<span style="text-decoration:line-through;color:#ff4466;">$1</span>')
.replace(/\n/g,'<br>').replace(/(<br>){3,}/g,'<br><br>').replace(/^(<br>)+/,'').replace(/(<br>)+$/,'');
/* Session image tokens: {{session_image:session-XX}} */
var imgTokenReplace=function(html){return html.replace(/\{\{session_image:([^}]+)\}\}/g,function(_,sid){
var img=typeof FUSION_IMAGES!=='undefined'&&FUSION_IMAGES[sid];
if(!img)return'';
var isBundle=sid==='bundle-all';
return'<img src="'+img+'" '+(isBundle?'width="540"':'width="350" height="250"')+' alt="'+(typeof FUSION_SHORT!=='undefined'&&FUSION_SHORT[sid]||'Fusion Sessions')+'" style="display:block;margin:10px auto 15px;border-radius:12px;'+(isBundle?'':'border:2px solid #8338ec;')+'max-width:100%;">';
})};
mainHtml=imgTokenReplace(mainHtml);
/* Build discount card */
var discountCardHtml='';
if(discountBody){
var discountInner=discountBody
.replace(/\*\*(10% off)\*\*/g,'<span style="color:#2dff7a;font-size:20px;font-weight:700;">$1</span>')
.replace(/\*\*(\$\d+)\*\*/g,'<span style="color:#2dff7a;font-size:22px;font-weight:700;">$1</span>')
.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
.replace(/Credits work like cash[^<\n]*/g,'<span style="font-size:13px;color:#ffd700;font-weight:600;display:inline-block;margin-top:4px;">$&</span>')
.replace(/~~([^~]+)~~/g,'<span style="text-decoration:line-through;color:#ff4466;font-size:16px;">$1</span>')
.replace(/Your link:\s*<strong>((?:https?:\/\/)?fusionsessions\.com[^\s<]*)<\/strong>/gi,'Your link: <a href="https://$1" target="_blank" style="color:#00f5ff;font-size:12px;word-break:break-all;text-decoration:underline;">$1</a>')
.replace(/Your link:\s*(https?:\/\/[^\s<]+)/gi,'Your link: <a href="$1" target="_blank" style="color:#00f5ff;font-size:12px;word-break:break-all;text-decoration:underline;">$1</a>')
.replace(/\n(Share your link|Share it|Claim your)[^\n]*/gi,'')
.replace(/Your discount applies automatically:?\s*/gi,'')
.replace(/\n- /g,'\n\u2022 ').replace(/^- /gm,'\u2022 ')
.replace(/\n/g,'<br>').replace(/(<br>){3,}/g,'<br><br>').replace(/^(<br>)+/,'').replace(/(<br>)+$/,'');
/* QR code */
var qrHtml='';
if(discountInner.indexOf('{{qr_code}}')>=0){
discountInner=discountInner.replace(/\{\{qr_code\}\}/g,'');
qrHtml='<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:15px auto 5px;"><tr><td style="background:#fff;border-radius:10px;padding:8px;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data='+encodeURIComponent(siteUrl+'/?ref=REFCODE')+'" width="120" height="120" alt="QR Code" style="display:block;border-radius:4px;"></td></tr></table><p style="margin:6px 0 0;font-size:11px;color:#888;">Scan to share your link</p>'
}
/* Style code display */
discountInner=discountInner.replace(/Your code:\s*<strong>([^<]+)<\/strong>/i,'Your code: <span style="font-family:monospace;font-size:20px;letter-spacing:1px;color:#00f5ff;background:rgba(0,245,255,0.1);padding:5px 15px;border-radius:8px;">$1</span>');
discountInner=imgTokenReplace(discountInner);
var ctaLabel=discountInner.indexOf('Collection')>=0||discountInner.indexOf('Upgrade')>=0?'COMPLETE YOUR BUNDLE':(discountInner.indexOf('Dashboard')>=0||discountInner.indexOf('Log In')>=0||discountInner.indexOf('access your')>=0?'GO TO DASHBOARD':(discountInner.indexOf('code')>=0||discountInner.indexOf('Share')>=0||discountInner.indexOf('referral')>=0||discountInner.indexOf('Referral')>=0?'GO TO REFERRAL HUB':'CLAIM YOUR DISCOUNT'));
var ctaUrl2=ctaLabel==='GO TO REFERRAL HUB'?siteUrl+'/referral-hub.html':(ctaLabel==='GO TO DASHBOARD'?siteUrl+'/login.html':(discountConfig&&discountConfig.couponId?siteUrl+'/?coupon='+discountConfig.couponId:siteUrl));
discountCardHtml='<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:25px 0 5px;"><tr><td style="background:linear-gradient(135deg,#1a0533,#0f0f23);border:2px solid #ff006e;border-radius:16px;padding:30px 25px;text-align:center;"><p style="margin:0;font-size:16px;color:#fff;line-height:1.5;">'+discountInner+'</p>'+qrHtml+'<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:20px auto 0;"><tr><td style="background:linear-gradient(45deg,#ff006e,#8338ec);border-radius:50px;"><a href="'+wrapLink(ctaUrl2)+'" target="_blank" style="display:inline-block;padding:16px 45px;color:#fff;text-decoration:none;font-weight:700;font-size:16px;letter-spacing:2px;text-transform:uppercase;">'+ctaLabel+'</a></td></tr></table><p style="margin:12px 0 0;font-size:11px;color:#666;">'+(ctaLabel==='GO TO REFERRAL HUB'?'Share your code and start earning':(ctaLabel==='GO TO DASHBOARD'?'Sign in to access your content':'Applied automatically at checkout'))+'</p></td></tr></table>';
if(cleanBody.indexOf('community')>=0||cleanBody.indexOf('/community')>=0){
discountCardHtml+='<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:15px 0 0;"><tr><td align="center"><a href="'+wrapLink(siteUrl+'/community')+'" target="_blank" style="color:#8338ec;font-size:14px;font-weight:600;text-decoration:none;">Join the Community &rarr;</a></td></tr></table>'
}}
/* Additional cards */
for(var cx=2;cx<parts.length;cx++){
var card2Body=parts[cx].trim();
var card2Inner=card2Body
.replace(/\*\*([^*]+)\*\*/g,'<strong style="color:#00f5ff;">$1</strong>')
.replace(/\n/g,'<br>').replace(/(<br>){3,}/g,'<br><br>').replace(/^(<br>)+/,'').replace(/(<br>)+$/,'');
card2Inner=card2Inner.replace(/Your code:\s*<strong[^>]*>([^<]+)<\/strong>/i,'Your code: <span style="font-family:monospace;font-size:20px;letter-spacing:1px;color:#00f5ff;background:rgba(0,245,255,0.1);padding:5px 15px;border-radius:8px;">$1</span>');
card2Inner=imgTokenReplace(card2Inner);
var qr2Html='';
if(card2Inner.indexOf('{{qr_code}}')>=0){
card2Inner=card2Inner.replace(/\{\{qr_code\}\}/g,'');
qr2Html='<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:15px auto 5px;"><tr><td style="background:#fff;border-radius:10px;padding:8px;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data='+encodeURIComponent(siteUrl+'/?ref=REFCODE')+'" width="120" height="120" alt="QR Code" style="display:block;border-radius:4px;"></td></tr></table><p style="margin:6px 0 0;font-size:11px;color:#888;">Scan to share your link</p>'
}
var card2Cta=card2Inner.indexOf('Share')>=0||card2Inner.indexOf('referral')>=0||card2Inner.indexOf('Referral')>=0?'GO TO REFERRAL HUB':(card2Inner.indexOf('Dashboard')>=0||card2Inner.indexOf('Log In')>=0||card2Inner.indexOf('access')>=0?'GO TO DASHBOARD':(card2Inner.indexOf('code')>=0?'CLAIM YOUR DISCOUNT':'EXPLORE SESSIONS'));
var card2Url=card2Cta==='GO TO REFERRAL HUB'?siteUrl+'/referral-hub.html':(card2Cta==='GO TO DASHBOARD'?siteUrl+'/login.html':(discountConfig&&discountConfig.couponId?siteUrl+'/?coupon='+discountConfig.couponId:siteUrl));
discountCardHtml+='<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:20px 0 5px;"><tr><td style="background:linear-gradient(135deg,#1a0533,#0f0f23);border:2px solid #8338ec;border-radius:16px;padding:25px 20px;text-align:center;"><p style="margin:0;font-size:15px;color:#fff;line-height:1.6;">'+card2Inner+'</p>'+qr2Html+'<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:18px auto 0;"><tr><td style="background:linear-gradient(45deg,#8338ec,#00f5ff);border-radius:50px;"><a href="'+wrapLink(card2Url)+'" target="_blank" style="display:inline-block;padding:14px 40px;color:#fff;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:2px;text-transform:uppercase;">'+card2Cta+'</a></td></tr></table><p style="margin:10px 0 0;font-size:11px;color:#666;">'+(card2Cta==='GO TO DASHBOARD'?'Sign in to access your content':(card2Cta==='GO TO REFERRAL HUB'?'Share your code and start earning':'Applied automatically at checkout'))+'</p></td></tr></table>'
}
/* Main CTA (only if no discount card) */
var ctaUrl=discountConfig&&discountConfig.couponId?siteUrl+'/?coupon='+discountConfig.couponId:siteUrl;
var ctaHtml='';
if(!discountCardHtml){
ctaHtml='<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:25px 0 10px;"><tr><td align="center"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td style="background:linear-gradient(45deg,#ff006e,#8338ec);border-radius:50px;"><a href="'+wrapLink(ctaUrl)+'" target="_blank" style="display:inline-block;padding:16px 50px;color:#fff;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:2px;text-transform:uppercase;">EXPLORE SESSIONS</a></td></tr></table></td></tr></table>'
}
var pixelUrl=trackingId?trackBase+'?action=open&tid='+trackingId:'';
var unsubscribeUrl=wrapLink(siteUrl+'/unsubscribe.html');
return '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#0f0f23;font-family:Arial,Helvetica,sans-serif;"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#0f0f23;"><tr><td align="center" style="padding:20px 10px;"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;"><tr><td align="center" style="padding:30px 20px 15px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:16px 16px 0 0;"><h1 style="margin:0;font-size:24px;color:#fff;font-weight:700;letter-spacing:3px;">QUANTUM PHYSICIAN</h1><p style="margin:5px 0 0;font-size:11px;color:rgba(255,255,255,0.8);letter-spacing:4px;text-transform:uppercase;">Empowering Health</p></td></tr><tr><td style="background-color:#161630;padding:35px 30px 20px;"><p style="margin:0;color:#e8e8f0;font-size:16px;line-height:1.8;">'+mainHtml+'</p>'+ctaHtml+discountCardHtml+'</td></tr><tr><td style="background-color:#1a1a35;padding:25px 30px;border-top:1px solid #2a2a4a;"><table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center"><tr><td width="85" valign="top"><img src="'+traceyImg+'" width="75" height="75" alt="Dr. Tracey Clark" style="border-radius:50%;border:3px solid #8338ec;display:block;object-fit:cover;"></td><td valign="middle" style="padding-left:18px;"><p style="margin:0;color:#ccc;font-size:14px;">With warmth,</p><p style="margin:5px 0 0;color:#fff;font-weight:700;font-size:18px;">Dr. Tracey Clark</p><p style="margin:3px 0 0;color:#ff006e;font-size:13px;font-weight:600;letter-spacing:1px;">Quantum Physician</p></td></tr></table></td></tr><tr><td align="center" style="padding:20px;background-color:#0a0a1a;border-radius:0 0 16px 16px;"><p style="margin:0;font-size:11px;color:#555;">&copy; 2026 Quantum Physician. All rights reserved.</p><p style="margin:8px 0 0;"><a href="'+unsubscribeUrl+'" style="color:#444;font-size:10px;text-decoration:none;">unsubscribe</a></p></td></tr></table>'+(pixelUrl?'<img src="'+pixelUrl+'" width="1" height="1" style="display:none;" alt="">':'')+'</td></tr></table></body></html>'
}


function buildAcademyEmail(bodyText,trackingId,siteUrl,discountConfig){
var trackBase='https://fusionsessions.com/.netlify/functions/email-track';
var wrapLink=function(url){return trackingId?trackBase+'?action=click&tid='+trackingId+'&url='+encodeURIComponent(url):url};
var traceyImg='https://qp-homepage.netlify.app/assets/images/tracey-about-me.png';
var logoImg='https://qp-homepage.netlify.app/assets/images/QuantumPhysAcad_STACKED-RGB.png';
var cleanBody=bodyText
.replace(/[\u{1F600}-\u{1F64F}]/gu,'').replace(/[\u{1F300}-\u{1F5FF}]/gu,'')
.replace(/[\u{1F680}-\u{1F6FF}]/gu,'').replace(/[\u{2600}-\u{26FF}]/gu,'')
.replace(/[\u{2700}-\u{27BF}]/gu,'').replace(/[\u{1F900}-\u{1F9FF}]/gu,'')
.replace(/[\u{FE00}-\u{FE0F}]/gu,'').replace(/[\u{1F1E0}-\u{1F1FF}]/gu,'')
.replace(/  +/g,' ');
var parts=cleanBody.split(/\n---\n/);
var mainBody=parts[0].trim();
var discountBody=parts[1]?parts[1].trim():'';
mainBody=mainBody.replace(/\n\n(With warmth,|With healing energy,|With gratitude,)\n.*$/s,'');
mainBody=mainBody.replace(/\n.*https?:\/\/[^\s]*/g,'');
mainBody=mainBody.replace(/^.*https?:\/\/[^\s]*/gm,'');
mainBody=mainBody.replace(/\n- /g,'\n\u2022 ').replace(/^- /gm,'\u2022 ');
var mainHtml=mainBody
.replace(/\*\*([^*]+)\*\*/g,'<strong style="color:#5ba8b2;">$1</strong>')
.replace(/~~([^~]+)~~/g,'<span style="text-decoration:line-through;color:#ad9b84;">$1</span>')
.replace(/\n/g,'<br>').replace(/(<br>){3,}/g,'<br><br>').replace(/^(<br>)+/,'').replace(/(<br>)+$/,'');
/* Discount card - academy styled */
var discountCardHtml='';
if(discountBody){
var discountInner=discountBody
.replace(/\*\*([^*]+)\*\*/g,'<strong style="color:#5ba8b2;">$1</strong>')
.replace(/~~([^~]+)~~/g,'<span style="text-decoration:line-through;color:#ad9b84;">$1</span>')
.replace(/\n- /g,'\n\u2022 ').replace(/^- /gm,'\u2022 ')
.replace(/\n/g,'<br>').replace(/(<br>){3,}/g,'<br><br>').replace(/^(<br>)+/,'').replace(/(<br>)+$/,'');
discountInner=discountInner.replace(/Your code:\s*<strong[^>]*>([^<]+)<\/strong>/i,'Your code: <span style="font-family:monospace;font-size:20px;letter-spacing:1px;color:#5ba8b2;background:rgba(91,168,178,0.1);padding:5px 15px;border-radius:8px;">$1</span>');
var qrHtml='';
if(discountInner.indexOf('{{qr_code}}')>=0){
discountInner=discountInner.replace(/\{\{qr_code\}\}/g,'');
qrHtml='<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:15px auto 5px;"><tr><td style="background:#fff;border-radius:10px;padding:8px;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data='+encodeURIComponent(siteUrl+'/?ref=REFCODE')+'" width="120" height="120" alt="QR Code" style="display:block;border-radius:4px;"></td></tr></table><p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.4);">Scan to share your link</p>'
}
var ctaLabel2=discountInner.indexOf('referral')>=0||discountInner.indexOf('Referral')>=0||discountInner.indexOf('Share')>=0?'GO TO REFERRAL HUB':'CLAIM YOUR DISCOUNT';
var ctaUrl2=ctaLabel2==='GO TO REFERRAL HUB'?siteUrl+'/referral-hub.html':(discountConfig&&discountConfig.couponId?'https://fusionsessions.com/?coupon='+discountConfig.couponId:'https://academy.quantumphysician.com');
discountCardHtml='<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:25px 0 5px;"><tr><td style="background:linear-gradient(135deg,rgba(91,168,178,0.08),rgba(173,155,132,0.08));border:2px solid rgba(91,168,178,0.3);border-radius:12px;padding:28px 25px;text-align:center;"><p style="margin:0;font-size:15px;color:rgba(255,255,255,0.85);line-height:1.5;font-family:Georgia,serif;">'+discountInner+'</p>'+qrHtml+'<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:20px auto 0;"><tr><td style="background:linear-gradient(135deg,#5ba8b2,#4a97a1);border-radius:50px;"><a href="'+wrapLink(ctaUrl2)+'" target="_blank" style="display:inline-block;padding:14px 40px;color:#fff;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">'+ctaLabel2+'</a></td></tr></table><p style="margin:10px 0 0;font-size:11px;color:rgba(255,255,255,0.4);">'+(ctaLabel2==='GO TO REFERRAL HUB'?'Share your code and start earning':'Applied automatically at checkout')+'</p></td></tr></table>'
}
/* Additional cards */
for(var cx=2;cx<parts.length;cx++){
var card2Body=parts[cx].trim();
var card2Inner=card2Body
.replace(/\*\*([^*]+)\*\*/g,'<strong style="color:#5ba8b2;">$1</strong>')
.replace(/\n/g,'<br>').replace(/(<br>){3,}/g,'<br><br>').replace(/^(<br>)+/,'').replace(/(<br>)+$/,'');
card2Inner=card2Inner.replace(/Your code:\s*<strong[^>]*>([^<]+)<\/strong>/i,'Your code: <span style="font-family:monospace;font-size:20px;letter-spacing:1px;color:#5ba8b2;background:rgba(91,168,178,0.1);padding:5px 15px;border-radius:8px;">$1</span>');
var qr2Html2='';
if(card2Inner.indexOf('{{qr_code}}')>=0){
card2Inner=card2Inner.replace(/\{\{qr_code\}\}/g,'');
qr2Html2='<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:15px auto 5px;"><tr><td style="background:#fff;border-radius:10px;padding:8px;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data='+encodeURIComponent(siteUrl+'/?ref=REFCODE')+'" width="120" height="120" alt="QR Code" style="display:block;border-radius:4px;"></td></tr></table><p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.4);">Scan to share your link</p>'
}
var card2Cta2=card2Inner.indexOf('Share')>=0||card2Inner.indexOf('referral')>=0||card2Inner.indexOf('Referral')>=0?'GO TO REFERRAL HUB':(card2Inner.indexOf('code')>=0?'CLAIM YOUR DISCOUNT':'VISIT ACADEMY');
var card2Url2=card2Cta2==='GO TO REFERRAL HUB'?siteUrl+'/referral-hub.html':(discountConfig&&discountConfig.couponId?siteUrl+'/?coupon='+discountConfig.couponId:siteUrl);
discountCardHtml+='<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:20px 0 5px;"><tr><td style="background:linear-gradient(135deg,rgba(91,168,178,0.08),rgba(173,155,132,0.08));border:2px solid rgba(91,168,178,0.3);border-radius:12px;padding:24px 20px;text-align:center;"><p style="margin:0;font-size:15px;color:rgba(255,255,255,0.85);line-height:1.6;font-family:Georgia,serif;">'+card2Inner+'</p>'+qr2Html2+'<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:18px auto 0;"><tr><td style="background:linear-gradient(135deg,#5ba8b2,#4a97a1);border-radius:50px;"><a href="'+wrapLink(card2Url2)+'" target="_blank" style="display:inline-block;padding:14px 40px;color:#fff;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">'+card2Cta2+'</a></td></tr></table><p style="margin:10px 0 0;font-size:11px;color:rgba(255,255,255,0.4);">Applied automatically at checkout</p></td></tr></table>'
}
var ctaUrl=discountConfig&&discountConfig.couponId?'https://fusionsessions.com/?coupon='+discountConfig.couponId:'https://academy.quantumphysician.com';
var ctaHtml='';
if(!discountCardHtml){
ctaHtml='<div style="text-align:center;margin:28px 0;"><a href="'+wrapLink(ctaUrl)+'" style="display:inline-block;background:linear-gradient(135deg,#5ba8b2,#4a97a1);color:#fff;padding:14px 40px;text-decoration:none;border-radius:50px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:2px;font-family:Arial,sans-serif;">Visit the Academy &rarr;</a></div>'
}
var pixelUrl=trackingId?trackBase+'?action=open&tid='+trackingId:'';
var unsubscribeUrl=wrapLink('https://fusionsessions.com/unsubscribe.html');
return '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:20px;font-family:Georgia,Times New Roman,serif;background-color:#2f5f7f;"><div style="max-width:600px;margin:0 auto;background-color:#0a1e33;border-radius:16px;overflow:hidden;box-shadow:0 12px 60px rgba(0,0,0,0.5),0 0 0 1px rgba(91,168,178,0.08);"><div style="background:linear-gradient(135deg,#081a2e,#0f2942 50%,#123554);padding:35px 30px;text-align:center;border-bottom:2px solid rgba(91,168,178,0.3);"><img src="'+logoImg+'" alt="Quantum Physician Academy" style="max-width:180px;height:auto;margin:0 auto 16px;display:block;"><p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0;letter-spacing:3px;text-transform:uppercase;">Empowering Growth</p></div><div style="padding:35px 30px;color:rgba(255,255,255,0.85);"><p style="margin:0;font-size:16px;line-height:1.8;font-family:Georgia,serif;">'+mainHtml+'</p>'+ctaHtml+discountCardHtml+'</div><div style="padding:25px 30px;border-top:1px solid rgba(91,168,178,0.15);text-align:center;"><img src="'+traceyImg+'" alt="Dr. Tracey Clark" style="width:80px;height:80px;border-radius:50%;border:2px solid rgba(91,168,178,0.3);object-fit:cover;display:block;margin:0 auto 12px;"><p style="margin:0;color:rgba(255,255,255,0.6);font-size:14px;">With gratitude,</p><p style="margin:5px 0 0;color:#5ba8b2;font-weight:700;font-size:18px;font-family:Georgia,serif;">Dr. Tracey Clark</p><p style="margin:4px 0 0;color:rgba(255,255,255,0.35);font-size:12px;">Quantum Physician</p></div><div style="background-color:#071825;padding:20px;text-align:center;border-top:1px solid rgba(91,168,178,0.1);"><p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);">&copy; 2026 Quantum Physician Academy. All rights reserved.</p><p style="margin:8px 0 0;"><a href="'+unsubscribeUrl+'" style="color:rgba(255,255,255,0.2);font-size:10px;text-decoration:none;">unsubscribe</a></p></div></div>'+(pixelUrl?'<img src="'+pixelUrl+'" width="1" height="1" style="display:none;" alt="">':'')+'</body></html>'
}

/* ==================== EMAIL AUTOMATION PAGE ==================== */
function loadAutomationPage(){loadAutomationStats();loadScheduledEmails()}

function switchAutoTab(tab,btn){
document.querySelectorAll('.auto-tab-panel').forEach(function(p){p.style.display='none'});
document.getElementById('autotab-'+tab).style.display='block';
document.querySelectorAll('.auto-tab-btn').forEach(function(b){b.classList.remove('active')});
btn.classList.add('active');
if(tab==='scheduled') loadScheduledEmails();
if(tab==='logs') loadEmailLogs();
if(tab==='sessions') loadSessionSchedule()
}

async function loadAutomationStats(){
try{
var pending=scheduledEmailsData.filter(function(e){return e.status==='pending'}).length;
document.getElementById('auto-stat-pending').textContent=pending;
var thirtyDaysAgo=new Date(Date.now()-30*24*60*60*1000).toISOString();
var sent30=scheduledEmailsData.filter(function(e){return e.status==='sent'&&e.sent_at&&e.sent_at>=thirtyDaysAgo}).length;
document.getElementById('auto-stat-sent').textContent=sent30;
var failed=scheduledEmailsData.filter(function(e){return e.status==='failed'}).length;
document.getElementById('auto-stat-failed').textContent=failed;
var now=new Date().toISOString();
var next=sessionScheduleData.filter(function(s){return s.air_date>=now}).sort(function(a,b){return a.air_date>b.air_date?1:-1})[0];
if(next){var days=Math.ceil((new Date(next.air_date)-new Date())/(1000*60*60*24));document.getElementById('auto-stat-next').textContent=days+' days'}
else{document.getElementById('auto-stat-next').textContent='-'}
}catch(e){console.error('Automation stats error:',e)}
}

async function loadScheduledEmails(){
var container=document.getElementById('scheduled-emails-list');
container.innerHTML='<div class="empty"><p>Loading...</p></div>';
try{
var statusFilter=document.getElementById('filter-sched-status').value;
var typeFilter=document.getElementById('filter-sched-type').value;
var filtered=scheduledEmailsData;
if(statusFilter!=='all') filtered=filtered.filter(function(e){return e.status===statusFilter});
if(typeFilter!=='all') filtered=filtered.filter(function(e){return e.email_type===typeFilter});
if(!filtered.length){container.innerHTML='<div class="empty"><p>No scheduled emails found</p></div>';return}
var html='';
filtered.forEach(function(email){
var dt=new Date(email.scheduled_for);
var types={'reminder_7day':'7-Day','reminder_1day':'1-Day','reminder_2hr':'2-Hour','promo':'Promo','custom':'Custom'};
var typeLabel=types[email.email_type]||email.email_type||'—';
var statusColors={pending:'var(--warning)',sent:'var(--success)',failed:'var(--danger)',cancelled:'var(--text-dim)'};
var statusColor=statusColors[email.status]||'var(--text-dim)';
html+='<div style="padding:14px;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px;background:rgba(0,0,0,.1)">';
html+='<div style="display:flex;justify-content:space-between;align-items:start;gap:12px;flex-wrap:wrap">';
html+='<div style="flex:1;min-width:200px"><div style="font-weight:600;font-size:14px;margin-bottom:4px">'+esc(email.subject||'(no subject)')+'</div>';
html+='<div style="display:flex;gap:10px;flex-wrap:wrap;font-size:11px;color:var(--text-dim)">';
html+='<span style="color:'+statusColor+';font-weight:600;text-transform:uppercase">'+email.status+'</span>';
html+='<span>'+typeLabel+'</span>';
html+='<span>'+dt.toLocaleDateString()+' '+dt.toLocaleTimeString()+'</span>';
html+='<span>'+esc(email.audience||'—')+'</span>';
if(email.sent_count) html+='<span style="color:var(--success)">'+email.sent_count+' sent</span>';
if(email.failed_count) html+='<span style="color:var(--danger)">'+email.failed_count+' failed</span>';
html+='</div></div>';
html+='<div style="display:flex;gap:4px;flex-wrap:wrap">';
html+='<button class="btn btn-ghost btn-sm" onclick="previewScheduledEmail(\''+email.id+'\')">Preview</button>';
html+='<button class="btn btn-ghost btn-sm" onclick="editScheduledEmail(\''+email.id+'\')">Edit</button>';
if(email.status==='pending'){
html+='<button class="btn btn-sm" style="background:var(--success-soft);color:var(--success)" onclick="sendNowSched(\''+email.id+'\')">Send Now</button>';
html+='<button class="btn btn-sm" style="background:var(--danger-soft);color:var(--danger)" onclick="cancelSchedEmail(\''+email.id+'\')">Cancel</button>';
}
if(email.status==='failed') html+='<button class="btn btn-sm" style="background:var(--warning-soft);color:var(--warning)" onclick="retrySchedEmail(\''+email.id+'\')">Retry</button>';
if(email.status==='sent') html+='<button class="btn btn-sm" style="background:var(--warning-soft);color:var(--warning)" onclick="resendSchedEmail(\''+email.id+'\')">Resend</button>';
if(email.status==='cancelled') html+='<button class="btn btn-sm" style="background:var(--success-soft);color:var(--success)" onclick="reactivateSchedEmail(\''+email.id+'\')">Reactivate</button>';
html+='</div></div></div>'
});
container.innerHTML=html
}catch(e){container.innerHTML='<div class="empty"><p>Error: '+e.message+'</p></div>'}
}

async function loadEmailLogs(){
var container=document.getElementById('email-logs-list');
container.innerHTML='<div class="empty"><p>Loading...</p></div>';
try{
var emailFilter=(document.getElementById('filter-log-email').value||'').trim().toLowerCase();
var statusFilter=document.getElementById('filter-log-status').value;
var filtered=emailLogData;
if(emailFilter) filtered=filtered.filter(function(l){return l.recipient_email&&l.recipient_email.toLowerCase().indexOf(emailFilter)>=0});
if(statusFilter!=='all') filtered=filtered.filter(function(l){return l.status===statusFilter});
if(!filtered.length){container.innerHTML='<div class="empty"><p>No email logs found</p></div>';return}
var html='<table class="tbl"><thead><tr><th>Date</th><th>Recipient</th><th>Subject</th><th>Status</th></tr></thead><tbody>';
filtered.slice(0,100).forEach(function(log){
var dt=log.sent_at?new Date(log.sent_at):null;
var dateStr=dt?dt.toLocaleDateString()+' '+dt.toLocaleTimeString():'—';
var subj=log.subject||'—';
if(subj.length>50) subj=subj.substring(0,50)+'...';
var statusColor=log.status==='sent'?'var(--success)':'var(--danger)';
html+='<tr><td style="font-size:11px">'+dateStr+'</td><td class="email">'+esc(log.recipient_email||'—')+'</td><td style="font-size:12px">'+esc(subj)+'</td><td><span style="color:'+statusColor+';font-weight:600;font-size:10px;text-transform:uppercase">'+esc(log.status||'—')+'</span></td></tr>'
});
html+='</tbody></table>';
container.innerHTML=html
}catch(e){container.innerHTML='<div class="empty"><p>Error: '+e.message+'</p></div>'}
}

async function loadSessionSchedule(){
var container=document.getElementById('session-schedule-list');
container.innerHTML='<div class="empty"><p>Loading...</p></div>';
try{
if(!sessionScheduleData.length){container.innerHTML='<div class="empty"><p>No sessions scheduled yet.</p></div>';return}
var now=new Date();
var html='';
sessionScheduleData.forEach(function(s){
var airDate=new Date(s.air_date);
var isPast=airDate<now;
var daysUntil=Math.ceil((airDate-now)/(1000*60*60*24));
html+='<div style="padding:14px;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px;background:rgba(0,0,0,.1);opacity:'+(isPast?'.6':'1')+'">';
html+='<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">';
html+='<div><div style="font-weight:600;font-size:14px">Session '+s.session_number+': '+esc(s.title||'')+'</div>';
html+='<div style="font-size:12px;color:var(--text-dim);margin-top:2px">'+esc(s.topic||'')+'</div>';
if(s.zoom_link) html+='<div style="font-size:11px;margin-top:6px"><a href="'+esc(s.zoom_link)+'" target="_blank" style="color:var(--teal)">Zoom Link</a>'+(s.zoom_meeting_id?' &middot; ID: '+esc(s.zoom_meeting_id):'')+(s.zoom_passcode?' &middot; Pass: '+esc(s.zoom_passcode):'')+'</div>';
html+='</div>';
html+='<div style="text-align:right"><div style="font-size:13px;font-weight:600">'+airDate.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})+'</div>';
html+='<div style="font-size:12px;color:var(--text-dim)">'+airDate.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})+'</div>';
html+='<div style="font-size:11px;color:'+(isPast?'var(--text-dim)':'var(--teal)')+';margin-top:4px">'+(isPast?'Completed':daysUntil+' days away')+'</div>';
html+='<button class="btn btn-ghost btn-sm" style="margin-top:6px;font-size:10px" onclick="editSessionSchedule(\''+s.id+'\')">Edit</button>';
html+='</div></div></div>'
});
container.innerHTML=html
}catch(e){container.innerHTML='<div class="empty"><p>Error: '+e.message+'</p></div>'}
}

/* Scheduled email actions */
async function sendNowSched(id){
var ok=await qpConfirm('Send Now','Send this email immediately?',{okText:'Send Now'});
if(!ok) return;
try{var r=await proxyFrom('scheduled_emails').update({scheduled_for:new Date().toISOString()}).eq('id',id);
if(r.error) throw r.error;
showToast('Email queued for immediate send','success');
await loadAllData();loadScheduledEmails();loadAutomationStats()
}catch(e){showToast('Error: '+e.message,'error')}
}

async function cancelSchedEmail(id){
var ok=await qpConfirm('Cancel Email','Cancel this scheduled email?',{okText:'Cancel It',okClass:'btn-danger'});
if(!ok) return;
try{var r=await proxyFrom('scheduled_emails').update({status:'cancelled'}).eq('id',id);
if(r.error) throw r.error;
showToast('Email cancelled','success');
await loadAllData();loadScheduledEmails();loadAutomationStats()
}catch(e){showToast('Error: '+e.message,'error')}
}

async function retrySchedEmail(id){
var ok=await qpConfirm('Retry Email','Retry sending this failed email?',{okText:'Retry'});
if(!ok) return;
try{var r=await proxyFrom('scheduled_emails').update({status:'pending',scheduled_for:new Date().toISOString(),sent_count:0,failed_count:0,updated_at:new Date().toISOString()}).eq('id',id);
if(r.error) throw r.error;
showToast('Email queued for retry','success');
await loadAllData();loadScheduledEmails();loadAutomationStats()
}catch(e){showToast('Error: '+e.message,'error')}
}

async function resendSchedEmail(id){
var ok=await qpConfirm('Resend Email','Resend this email to all recipients again?',{okText:'Resend'});
if(!ok) return;
try{var r=await proxyFrom('scheduled_emails').update({status:'pending',scheduled_for:new Date().toISOString(),sent_count:0,failed_count:0,sent_at:null,updated_at:new Date().toISOString()}).eq('id',id);
if(r.error) throw r.error;
showToast('Email queued for resend','success');
await loadAllData();loadScheduledEmails();loadAutomationStats()
}catch(e){showToast('Error: '+e.message,'error')}
}

async function reactivateSchedEmail(id){
var newDT=prompt('Enter new date/time (YYYY-MM-DD HH:MM):');
if(!newDT) return;
var parsed=new Date(newDT);
if(isNaN(parsed.getTime())){showToast('Invalid date format','error');return}
try{var r=await proxyFrom('scheduled_emails').update({status:'pending',scheduled_for:parsed.toISOString(),updated_at:new Date().toISOString()}).eq('id',id);
if(r.error) throw r.error;
showToast('Email reactivated','success');
await loadAllData();loadScheduledEmails();loadAutomationStats()
}catch(e){showToast('Error: '+e.message,'error')}
}

async function previewScheduledEmail(id){
var email=scheduledEmailsData.find(function(e){return e.id===id});
if(!email){showToast('Email not found','error');return}
var previewBody=(email.body||'').replace(/\{\{name\}\}/g,'<strong style="color:#8338ec;">John Doe</strong>').replace(/\{\{email\}\}/g,'<strong style="color:#8338ec;">john@example.com</strong>').replace(/\{\{referral_code\}\}/g,'<strong style="color:#8338ec;">ABC123</strong>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
var content='<div style="margin-bottom:15px;padding-bottom:15px;border-bottom:2px solid #eee;"><p><strong>Subject:</strong> '+esc(email.subject)+'</p><p><strong>Scheduled:</strong> '+new Date(email.scheduled_for).toLocaleString()+'</p><p><strong>Audience:</strong> '+esc(email.audience||'—')+'</p></div><div style="font-family:Arial,sans-serif;line-height:1.6;">'+previewBody+'</div>';
document.getElementById('sched-preview-content').innerHTML=content;
document.getElementById('sched-preview-modal').style.display='flex'
}
function closeSchedPreviewModal(){document.getElementById('sched-preview-modal').style.display='none'}

async function editScheduledEmail(id){
var email=scheduledEmailsData.find(function(e){return e.id===id});
if(!email){showToast('Email not found','error');return}
document.getElementById('sched-edit-id').value=email.id;
document.getElementById('sched-edit-subject').value=email.subject||'';
document.getElementById('sched-edit-body').value=email.body||'';
document.getElementById('sched-edit-audience').value=email.audience||'all';
var dt=new Date(email.scheduled_for);
var local=new Date(dt.getTime()-dt.getTimezoneOffset()*60000);
document.getElementById('sched-edit-datetime').value=local.toISOString().slice(0,16);
document.getElementById('sched-edit-title').textContent=email.status==='pending'?'Edit Scheduled Email':'View/Edit Email';
document.getElementById('sched-edit-modal').style.display='flex'
}
function closeSchedEditModal(){document.getElementById('sched-edit-modal').style.display='none'}

async function saveScheduledEmail(){
var id=document.getElementById('sched-edit-id').value;
var subject=document.getElementById('sched-edit-subject').value.trim();
var body=document.getElementById('sched-edit-body').value.trim();
var audience=document.getElementById('sched-edit-audience').value;
var datetime=document.getElementById('sched-edit-datetime').value;
if(!subject||!body||!datetime){showToast('Fill in all fields','error');return}
try{var r=await proxyFrom('scheduled_emails').update({subject:subject,body:body,audience:audience,scheduled_for:new Date(datetime).toISOString(),updated_at:new Date().toISOString()}).eq('id',id);
if(r.error) throw r.error;
showToast('Email updated','success');
closeSchedEditModal();
await loadAllData();loadScheduledEmails()
}catch(e){showToast('Error: '+e.message,'error')}
}

async function loadAuditLog(){var c=document.getElementById('audit-log-content');if(!c)return;c.innerHTML='<div class="loading-center"><div class="spinner"></div>Loading...</div>';try{var filter=document.getElementById('audit-filter').value;var search=(document.getElementById('audit-search').value||'').trim().toLowerCase();var q=proxyFrom('admin_audit_log').select('*',{count:'exact'}).order('created_at',{ascending:false});if(filter!=='all')q=q.eq('action',filter);if(search)q=q.or('target_email.ilike.%'+search+'%,details.ilike.%'+search+'%,admin_user.ilike.%'+search+'%');q=q.range((auditPage-1)*auditPS,auditPage*auditPS-1);var res=await q;if(res.error)throw new Error(res.error.message||JSON.stringify(res.error));var logs=res.data||[];var total=res.count||0;var tp=Math.ceil(total/auditPS)||1;function auditSvg(name,col){var p={'check':'<polyline points="20 6 9 17 4 12"/>','x-circle':'<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>','lock':'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>','dollar':'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>','link':'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>','grad':'<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>','key':'<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>','refresh':'<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>','archive':'<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>','ban':'<circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/>','edit':'<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>','trash':'<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>','list':'<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>','user':'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>','mail':'<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>','tag':'<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>','shield':'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>','bulb':'<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>','users':'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>','star':'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>','zap':'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>','calendar':'<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'};var d=p[name]||p['edit'];return '<svg viewBox="0 0 24 24" fill="none" stroke="'+(col||'currentColor')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px">'+d+'</svg>'}
var actionCfg={grant_access:{label:'Granted Access',icon:'check',cat:'grant',verb:'granted access to'},revoke_access:{label:'Revoked Access',icon:'x-circle',cat:'revoke',verb:'revoked access for'},block_user:{label:'Block / Unblock',icon:'lock',cat:'revoke',verb:'blocked/unblocked'},adjust_credit:{label:'Credit Adjustment',icon:'dollar',cat:'info',verb:'adjusted credits for'},set_credit:{label:'Credit Set',icon:'dollar',cat:'info',verb:'set credits for'},create_referral:{label:'Referral Created',icon:'link',cat:'grant',verb:'created referral code for'},enroll_student:{label:'Enrolled Student',icon:'grad',cat:'grant',verb:'enrolled'},unenroll_student:{label:'Unenrolled',icon:'x-circle',cat:'revoke',verb:'unenrolled'},reset_password:{label:'Password Reset',icon:'key',cat:'info',verb:'reset password for'},reset_progress:{label:'Progress Reset',icon:'refresh',cat:'info',verb:'reset progress for'},archive_account:{label:'Account Archived',icon:'archive',cat:'revoke',verb:'archived account for'},delete_account:{label:'Account Archived',icon:'archive',cat:'revoke',verb:'archived account for'},revoke_all:{label:'All Access Revoked',icon:'ban',cat:'revoke',verb:'revoked all access for'},add_note:{label:'Note Added',icon:'edit',cat:'neutral',verb:'added a note on'},delete_note:{label:'Note Deleted',icon:'trash',cat:'neutral',verb:'deleted a note on'},bulk_enroll:{label:'Bulk Enroll',icon:'list',cat:'grant',verb:'bulk enrolled students'},login_as:{label:'Login As User',icon:'user',cat:'info',verb:'logged in as'},send_email:{label:'Email Sent',icon:'mail',cat:'info',verb:'sent email campaign'},create_promo:{label:'Promo Created',icon:'tag',cat:'grant',verb:'created promotion'},update_promo:{label:'Promo Updated',icon:'tag',cat:'info',verb:'updated promotion'},delete_promo:{label:'Promo Deleted',icon:'trash',cat:'revoke',verb:'deleted promotion'},assign_mod:{label:'Moderator Assigned',icon:'users',cat:'grant',verb:'assigned moderator role to'},remove_mod:{label:'Moderator Removed',icon:'users',cat:'revoke',verb:'removed moderator role from'},add_admin:{label:'Admin Added',icon:'shield',cat:'grant',verb:'added as admin:'},edit_admin:{label:'Admin Edited',icon:'shield',cat:'info',verb:'edited admin:'},enable_admin:{label:'Admin Enabled',icon:'shield',cat:'grant',verb:'enabled admin:'},disable_admin:{label:'Admin Disabled',icon:'shield',cat:'revoke',verb:'disabled admin:'},suggestion_action:{label:'Suggestion',icon:'bulb',cat:'info',verb:'acted on suggestion:'},suggestion_test_email:{label:'Test Email',icon:'mail',cat:'info',verb:'sent test email'}};var catColors={grant:'var(--success)',revoke:'var(--danger)',info:'var(--teal)',neutral:'var(--taupe)'};
var statsHtml='<div class="stat-card"><div class="stat-ico teal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div><div class="stat-val">'+total+'</div><div class="stat-lbl">Total Actions</div></div></div>';
var adminSet=new Set();logs.forEach(function(l){var an=l.admin_user||l.metadata&&l.metadata.admin_name;if(an)adminSet.add(an)});
statsHtml+='<div class="stat-card"><div class="stat-ico purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div><div class="stat-val">'+adminSet.size+'</div><div class="stat-lbl">Active Admins</div></div></div>';
document.getElementById('audit-stats').innerHTML=statsHtml;
if(!logs.length){c.innerHTML='<div class="empty"><p>No audit log entries'+(filter!=='all'?' for this filter':'')+'</p></div>';document.getElementById('audit-pagination').innerHTML='';return}
var grouped={};logs.forEach(function(l){var dateKey=new Date(l.created_at).toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric',year:'numeric'});if(!grouped[dateKey])grouped[dateKey]=[];grouped[dateKey].push(l)});
var out='';Object.keys(grouped).forEach(function(dateKey){out+='<div class="audit-date-group"><div class="audit-date-label">'+dateKey+'</div>';grouped[dateKey].forEach(function(l){var cfg=actionCfg[l.action]||{label:l.action,icon:'•',cat:'neutral',verb:l.action};var col=catColors[cfg.cat]||'var(--text-dim)';var adminName=l.admin_user||(l.metadata&&l.metadata.admin_name)||'System';var details=l.details||'';if(details.match(/^\[.+?\] /))details=details.replace(/^\[.+?\] /,'');var targetHtml='';if(l.target_email){targetHtml='<strong class="audit-target" onclick="go(\'customers\');setTimeout(function(){showCustomerDetail(\''+esc(l.target_email)+'\')},100)">'+esc(l.target_email)+'</strong>'}
var sentence='<span class="audit-admin">'+esc(adminName)+'</span> '+cfg.verb+' '+targetHtml;if(details&&!l.target_email)sentence='<span class="audit-admin">'+esc(adminName)+'</span> '+cfg.verb+' '+esc(details);
var time=new Date(l.created_at);var timeStr=time.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true});
out+='<div class="audit-row"><div class="audit-icon" style="color:'+col+'">'+auditSvg(cfg.icon,col)+'</div><div class="audit-body"><div class="audit-sentence">'+sentence+'</div>'+(details&&l.target_email?'<div class="audit-detail">'+esc(details)+'</div>':'')+'</div><div class="audit-meta"><span class="audit-badge" style="background:'+col+'15;color:'+col+'">'+cfg.label+'</span><span class="audit-time">'+timeStr+'</span></div></div>'});out+='</div>'});
c.innerHTML=out;document.getElementById('audit-pagination').innerHTML='<span>'+total+' entries \u00b7 Page '+auditPage+'/'+tp+'</span><div class="page-btns"><button class="btn btn-ghost btn-sm" onclick="auditPage=Math.max(1,auditPage-1);loadAuditLog()" '+(auditPage<=1?'disabled':'')+'>Prev</button><button class="btn btn-ghost btn-sm" onclick="auditPage=Math.min('+tp+',auditPage+1);loadAuditLog()" '+(auditPage>=tp?'disabled':'')+'>Next</button></div>'}catch(e){console.error('Audit log error:',e);c.innerHTML='<div class="empty"><p>Error loading audit log: '+esc(e.message)+'</p></div>'}}
try{var savedAdmin2=sessionStorage.getItem('qp_admin_auth');if(savedAdmin2){currentAdmin=JSON.parse(savedAdmin2);applyPermissions();document.getElementById('auth-screen').style.display='none';document.getElementById('admin-layout').style.display='block';initAdmin()}}catch(e){sessionStorage.removeItem('qp_admin_auth')}


// ============================================================
// SESSION 7: ANALYTICS DASHBOARD + CHART SYSTEM
// ============================================================
var qpCharts={};
function getChartColors(){
var isLight=document.documentElement.getAttribute('data-theme')==='light';
return {
teal:isLight?'#3d8a93':'#5ba8b2',tealA:isLight?'rgba(61,138,147,0.4)':'rgba(91,168,178,0.3)',
purple:isLight?'#7c3aed':'#a78bfa',purpleA:isLight?'rgba(124,58,237,0.4)':'rgba(167,139,250,0.3)',
success:isLight?'#16a34a':'#3dd68c',successA:isLight?'rgba(22,163,74,0.35)':'rgba(61,214,140,0.3)',
danger:isLight?'#dc2626':'#ef5350',dangerA:isLight?'rgba(220,38,38,0.3)':'rgba(239,83,80,0.3)',
taupe:isLight?'#8b7355':'#ad9b84',taupeA:isLight?'rgba(139,115,85,0.4)':'rgba(173,155,132,0.3)',
warning:isLight?'#d97706':'#f0b429',warningA:isLight?'rgba(217,119,6,0.35)':'rgba(240,180,41,0.3)',
white15:isLight?'rgba(0,0,0,0.1)':'rgba(255,255,255,0.15)'
}}
var COLORS=getChartColors();

function applyChartTheme(){
if(typeof Chart==='undefined')return;
var isLight=document.documentElement.getAttribute('data-theme')==='light';
Chart.defaults.color=isLight?'rgba(0,0,0,0.55)':'rgba(255,255,255,0.5)';
Chart.defaults.borderColor=isLight?'rgba(0,0,0,0.08)':'rgba(255,255,255,0.06)';
COLORS=getChartColors();
}
applyChartTheme()

function destroyQPChart(id){if(qpCharts[id]){qpCharts[id].destroy();delete qpCharts[id]}}

var chartModes={};
function switchQPChart(id,newType,btn){
chartModes[id]=newType;
renderAnalyticsCharts();
}
function syncChartButtons(){
document.querySelectorAll('[onclick*="switchQPChart"]').forEach(function(btn){
var m=btn.getAttribute('onclick').match(/switchQPChart\('([^']+)','([^']+)'/);
if(!m)return;
var id=m[1],type=m[2];
var current=chartModes[id]||'bar';
if(type===current)btn.classList.add('active');
else btn.classList.remove('active');
});
}

function isAcademyProduct(pid){return pid&&(pid.startsWith('qa-')||['quantum-vision-boards','becoming-present','breaking-up-with-your-beliefs','creative-mind-mapping','power-of-the-question','transformational-mastery'].indexOf(pid)!==-1)}
function isFusionProduct(pid){return pid&&(pid.startsWith('session-')||pid==='bundle-all')}

function loadAnalyticsPage(){renderQueryPresets();
if(!dataLoaded)return;
var p=purchasesData,r=referralData,cr=creditHistory,prof=profilesData;
var totalRev=p.reduce(function(s,x){return s+(Number(x.amount_paid)||0)},0);
var acadRev=p.filter(function(x){return isAcademyProduct(x.product_id)}).reduce(function(s,x){return s+(Number(x.amount_paid)||0)},0);
var fusionRev=p.filter(function(x){return isFusionProduct(x.product_id)}).reduce(function(s,x){return s+(Number(x.amount_paid)||0)},0);
var totalCredits=r.reduce(function(s,x){return s+(Number(x.total_earned)||0)},0);

document.getElementById('analytics-stats').innerHTML='<div class="stat-card"><div class="stat-ico teal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div><div><div class="stat-val">$'+totalRev.toLocaleString()+'</div><div class="stat-lbl">Total Revenue</div></div></div>'
+'<div class="stat-card"><div class="stat-ico purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div><div><div class="stat-val">$'+acadRev.toLocaleString()+'</div><div class="stat-lbl">Academy Revenue</div></div></div>'
+'<div class="stat-card"><div class="stat-ico warm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"/></svg></div><div><div class="stat-val">$'+fusionRev.toLocaleString()+'</div><div class="stat-lbl">Fusion Revenue</div></div></div>'
+'<div class="stat-card"><div class="stat-ico green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/></svg></div><div><div class="stat-val">$'+totalCredits.toLocaleString()+'</div><div class="stat-lbl">Credits Issued</div></div></div>';

renderAnalyticsCharts();
}


// Time range for charts
var currentTimeRange='month';
function setTimeRange(range,btn){
currentTimeRange=range;
document.querySelectorAll('.trng').forEach(function(b){b.classList.remove('active')});
if(btn)btn.classList.add('active');
renderAnalyticsCharts();
}

function renderAnalyticsCharts(){
if(typeof Chart==='undefined')return;
var p=purchasesData||[],r=referralData||[],cr=creditHistory||[],prof=profilesData||[];
var campaigns=emailCampaignsData||[];

// --- PRODUCT PRICES for fallback ---
var PP={'bundle-all':500,'session-01':50,'session-02':50,'session-03':50,'session-04':50,'session-05':50,'session-06':50,'session-07':50,'session-08':50,'session-09':50,'session-10':50,'session-11':50,'session-12':50,'quantum-vision-boards':90,'becoming-present':90,'breaking-up-with-your-beliefs':90,'creative-mind-mapping':90,'power-of-the-question':90,'transformational-mastery':360};

// === Revenue Over Time (time-range aware) ===
// Build revenue by selected time range
var trng=currentTimeRange||'month';
var revByPeriod={};
p.filter(function(x){return x.purchased_at}).forEach(function(x){
var d=new Date(x.purchased_at);var k;
if(trng==='day')k=d.toISOString().slice(0,10);
else if(trng==='week'){var ws=new Date(d);ws.setDate(d.getDate()-d.getDay());k=ws.toISOString().slice(0,10)}
else if(trng==='all')k='All Time';
else k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
var amt=(x.amount_paid&&x.amount_paid>0)?x.amount_paid:(PP[x.product_id]||0);
revByPeriod[k]=(revByPeriod[k]||0)+amt;
});
var periods=Object.keys(revByPeriod).sort();
var cum2=0;var cumData=periods.map(function(k){cum2+=revByPeriod[k];return cum2});
var revType=chartModes['chart-rev-time']||'bar';
var periodLabels=periods.map(function(k){
if(trng==='all')return k;
if(trng==='day')return new Date(k).toLocaleDateString('en-US',{month:'short',day:'numeric'});
if(trng==='week')return new Date(k).toLocaleDateString('en-US',{month:'short',day:'numeric'});
var p2=k.split('-');return new Date(p2[0],p2[1]-1).toLocaleDateString('en-US',{month:'short',year:'2-digit'});
});
destroyQPChart('chart-rev-time');
qpCharts['chart-rev-time']=new Chart(document.getElementById('chart-rev-time'),{
type:revType,data:{labels:periodLabels,
datasets:[{label:trng==='day'?'Daily Revenue':trng==='all'?'Total Revenue':trng.charAt(0).toUpperCase()+trng.slice(1)+'ly Revenue',data:periods.map(function(k){return revByPeriod[k]}),borderColor:COLORS.teal,backgroundColor:revType==='bar'?COLORS.teal:COLORS.tealA,fill:revType==='line',tension:0.4,pointRadius:revType==='line'?3:0,borderWidth:revType==='bar'?0:2,borderRadius:revType==='bar'?6:0},
{label:'Cumulative',data:cumData,backgroundColor:COLORS.purpleA,borderColor:COLORS.purple,borderWidth:revType==='bar'?0:2,borderRadius:revType==='bar'?4:0,fill:revType==='line',tension:0.4,pointRadius:revType==='line'?3:0,yAxisID:'y1'}]},
options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{boxWidth:10,font:{size:11}}}},scales:{y:{beginAtZero:true,ticks:{callback:function(v){return '$'+v}}},y1:{position:'right',grid:{drawOnChartArea:false},beginAtZero:true,ticks:{callback:function(v){return '$'+v}}}}}
});

// === Product Mix ===
var bundleEmails=new Set(p.filter(function(x){return x.product_id&&x.product_id.indexOf('bundle')!==-1}).map(function(x){return(x.email||'').toLowerCase()}).filter(Boolean));
var academyCount=p.filter(function(x){return isAcademyProduct(x.product_id)&&x.amount_paid>0}).length;
var fusionBundles=p.filter(function(x){return x.product_id==='bundle-all'}).length;
var fusionSingles=p.filter(function(x){return x.product_id&&x.product_id.startsWith('session-')&&!bundleEmails.has((x.email||'').toLowerCase())}).length;
var comps=p.filter(function(x){return!x.amount_paid||x.amount_paid===0}).length;
destroyQPChart('chart-product-mix');
qpCharts['chart-product-mix']=new Chart(document.getElementById('chart-product-mix'),{
type:'doughnut',data:{labels:['Academy','Fusion Bundles','Fusion Singles','Comps'],
datasets:[{data:[academyCount,fusionBundles,fusionSingles,comps],backgroundColor:[COLORS.teal,COLORS.purple,COLORS.taupe,COLORS.white15],borderWidth:0}]},
options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{padding:12,boxWidth:10,font:{size:11}}}},cutout:'60%'}
});

// === Purchase Timeline (uses time range) ===
// Purchase Timeline with time range
var byPeriod2={};
p.filter(function(x){return x.purchased_at}).forEach(function(x){
var d=new Date(x.purchased_at);var k;
if(trng==='day')k=d.toISOString().slice(0,10);
else if(trng==='week'){var ws=new Date(d);ws.setDate(d.getDate()-d.getDay());k=ws.toISOString().slice(0,10)}
else if(trng==='all')k='All Time';
else k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
if(!byPeriod2[k])byPeriod2[k]={academy:0,fusion:0};
if(isAcademyProduct(x.product_id))byPeriod2[k].academy++;
else if(isFusionProduct(x.product_id))byPeriod2[k].fusion++;
});
var pPeriods=Object.keys(byPeriod2).sort();
var ptType=chartModes['chart-purch-time']||'bar';
var pLabels=pPeriods.map(function(k){
if(trng==='all')return k;
if(trng==='day'||trng==='week')return new Date(k).toLocaleDateString('en-US',{month:'short',day:'numeric'});
var p2=k.split('-');return new Date(p2[0],p2[1]-1).toLocaleDateString('en-US',{month:'short',year:'2-digit'});
});
destroyQPChart('chart-purch-time');
qpCharts['chart-purch-time']=new Chart(document.getElementById('chart-purch-time'),{
type:ptType,data:{labels:pLabels,
datasets:[{label:'Academy',data:pPeriods.map(function(k){return byPeriod2[k].academy}),backgroundColor:ptType==='bar'?COLORS.teal:COLORS.tealA,borderColor:COLORS.teal,borderWidth:ptType==='bar'?0:2,borderRadius:ptType==='bar'?4:0,tension:0.4,fill:ptType==='line',pointRadius:ptType==='line'?3:0},
{label:'Fusion',data:pPeriods.map(function(k){return byPeriod2[k].fusion}),backgroundColor:ptType==='bar'?COLORS.purple:COLORS.purpleA,borderColor:COLORS.purple,borderWidth:ptType==='bar'?0:2,borderRadius:ptType==='bar'?4:0,tension:0.4,fill:ptType==='line',pointRadius:ptType==='line'?3:0}]},
options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{boxWidth:10,font:{size:11}}}},scales:{x:{stacked:ptType==='bar'},y:{stacked:ptType==='bar',beginAtZero:true}}}
});

// === Session Popularity (Fusion sessions) ===
var sessCounts={};
for(var i=1;i<=12;i++){var sid='session-'+String(i).padStart(2,'0');sessCounts[sid]=p.filter(function(x){return x.product_id===sid&&!bundleEmails.has((x.email||'').toLowerCase())}).length}
var sessColors=[COLORS.teal,COLORS.purple,COLORS.taupe,COLORS.success,COLORS.warning,COLORS.danger,'#60a5fa','#c084fc','#f472b6','#34d399','#fbbf24','#fb923c'];
destroyQPChart('chart-session-pop');
qpCharts['chart-session-pop']=new Chart(document.getElementById('chart-session-pop'),{
type:'bar',data:{labels:Object.keys(sessCounts).map(function(s,i){return 'S'+(i+1)}),
datasets:[{label:'Individual Sales',data:Object.values(sessCounts),backgroundColor:sessColors,borderWidth:0,borderRadius:4}]},
options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{beginAtZero:true}}}
});

// === Customer Segments ===
var purchEmails=new Set(p.map(function(x){return(x.email||'').toLowerCase()}).filter(Boolean));
var profEmails=new Set(prof.map(function(x){return(x.email||'').toLowerCase()}).filter(Boolean));
var noPurch=[...profEmails].filter(function(e){return!purchEmails.has(e)}).length;
var acadOnly=p.filter(function(x){return isAcademyProduct(x.product_id)}).map(function(x){return(x.email||'').toLowerCase()});
var fusionOnly=[...new Set(p.filter(function(x){return isFusionProduct(x.product_id)}).map(function(x){return(x.email||'').toLowerCase()}))].length;
destroyQPChart('chart-cust-seg');
qpCharts['chart-cust-seg']=new Chart(document.getElementById('chart-cust-seg'),{
type:'doughnut',data:{labels:['Fusion Customers','Academy Customers','Registered (No Purchase)'],
datasets:[{data:[fusionOnly,new Set(acadOnly).size,noPurch],backgroundColor:[COLORS.purple,COLORS.teal,COLORS.white15],borderWidth:0}]},
options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{padding:12,boxWidth:10,font:{size:11}}}},cutout:'55%'}
});

// === Referral vs Direct Revenue ===
var refRev=p.filter(function(x){return x.referral_code_used&&x.amount_paid>0}).reduce(function(s,x){return s+(x.amount_paid||0)},0);
var directRev=p.filter(function(x){return!x.referral_code_used&&x.amount_paid>0}).reduce(function(s,x){return s+(x.amount_paid||0)},0);
var riType=chartModes['chart-ref-impact']||'bar';
destroyQPChart('chart-ref-impact');
qpCharts['chart-ref-impact']=new Chart(document.getElementById('chart-ref-impact'),{
type:riType,data:{labels:['Referred','Direct'],
datasets:[{label:'Revenue',data:[refRev,directRev],backgroundColor:[COLORS.purple,COLORS.teal],borderColor:[COLORS.purple,COLORS.teal],borderWidth:0,borderRadius:riType==='bar'?6:0}]},
options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:riType==='doughnut',position:'bottom',labels:{boxWidth:10,font:{size:11}}}},scales:riType==='doughnut'?{}:{y:{beginAtZero:true,ticks:{callback:function(v){return '$'+v}}}},cutout:riType==='doughnut'?'55%':undefined}
});

// === Credit Economy ===
var totalIssued=r.reduce(function(s,x){return s+(Number(x.total_earned)||0)},0);
var totalBalance=r.reduce(function(s,x){return s+(Number(x.credit_balance)||0)},0);
var redeemed=Math.max(0,totalIssued-totalBalance);
destroyQPChart('chart-credit-eco');
qpCharts['chart-credit-eco']=new Chart(document.getElementById('chart-credit-eco'),{
type:'doughnut',data:{labels:['Redeemed/Used','Outstanding'],
datasets:[{data:[redeemed,totalBalance],backgroundColor:[COLORS.success,COLORS.warning],borderWidth:0}]},
options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{padding:12,boxWidth:10,font:{size:11}}}},cutout:'55%'}
});

// === Academy vs Fusion Revenue by Month ===
// Platform revenue with time range
var platByPeriod={};
p.filter(function(x){return x.purchased_at}).forEach(function(x){
var d=new Date(x.purchased_at);var k;
if(trng==='day')k=d.toISOString().slice(0,10);
else if(trng==='week'){var ws=new Date(d);ws.setDate(d.getDate()-d.getDay());k=ws.toISOString().slice(0,10)}
else if(trng==='all')k='All Time';
else k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
if(!platByPeriod[k])platByPeriod[k]={academy:0,fusion:0};
var amt=(x.amount_paid&&x.amount_paid>0)?x.amount_paid:(PP[x.product_id]||0);
if(isAcademyProduct(x.product_id))platByPeriod[k].academy+=amt;
if(isFusionProduct(x.product_id))platByPeriod[k].fusion+=amt;
});
var platPeriods=Object.keys(platByPeriod).sort();
var prType=chartModes['chart-platform-rev']||'bar';
var platLabels=platPeriods.map(function(k){
if(trng==='all')return k;
if(trng==='day'||trng==='week')return new Date(k).toLocaleDateString('en-US',{month:'short',day:'numeric'});
var p2=k.split('-');return new Date(p2[0],p2[1]-1).toLocaleDateString('en-US',{month:'short',year:'2-digit'});
});
destroyQPChart('chart-platform-rev');
qpCharts['chart-platform-rev']=new Chart(document.getElementById('chart-platform-rev'),{
type:prType,data:{labels:platLabels,
datasets:[{label:'Academy',data:platPeriods.map(function(k){return platByPeriod[k].academy}),backgroundColor:prType==='bar'?COLORS.teal:COLORS.tealA,borderColor:COLORS.teal,borderWidth:prType==='bar'?0:2,borderRadius:prType==='bar'?4:0,tension:0.4,fill:prType==='line',pointRadius:prType==='line'?3:0},
{label:'Fusion',data:platPeriods.map(function(k){return platByPeriod[k].fusion}),backgroundColor:prType==='bar'?COLORS.purple:COLORS.purpleA,borderColor:COLORS.purple,borderWidth:prType==='bar'?0:2,borderRadius:prType==='bar'?4:0,tension:0.4,fill:prType==='line',pointRadius:prType==='line'?3:0}]},
options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{boxWidth:10,font:{size:11}}}},scales:{y:{beginAtZero:true,ticks:{callback:function(v){return '$'+v}}}}}
});

// === Campaign Performance Charts ===
if(campaigns.length>0){
document.getElementById('no-campaigns-msg').style.display='none';
// Group campaigns by time range
var campByPeriod={};
campaigns.filter(function(c){return c.sent_at}).forEach(function(c){
var d=new Date(c.sent_at);var k;
if(trng==='day')k=d.toISOString().slice(0,10);
else if(trng==='week'){var ws=new Date(d);ws.setDate(d.getDate()-d.getDay());k=ws.toISOString().slice(0,10)}
else if(trng==='all')k='All Time';
else k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
if(!campByPeriod[k])campByPeriod[k]={sent:0,opens:0,clicks:0,conversions:0,count:0};
campByPeriod[k].sent+=(c.sent_count||0);
campByPeriod[k].opens+=(c.open_count||0);
campByPeriod[k].clicks+=(c.click_count||0);
campByPeriod[k].conversions+=(c.conversion_count||0);
campByPeriod[k].count++;
});
var campPeriods=Object.keys(campByPeriod).sort().slice(-12);
var campLabels=campPeriods.map(function(k){
if(trng==='all')return k;
if(trng==='day'||trng==='week')return new Date(k).toLocaleDateString('en-US',{month:'short',day:'numeric'});
var p2=k.split('-');return new Date(p2[0],p2[1]-1).toLocaleDateString('en-US',{month:'short',year:'2-digit'});
});
destroyQPChart('chart-camp-overview');
qpCharts['chart-camp-overview']=new Chart(document.getElementById('chart-camp-overview'),{
type:'bar',data:{labels:campLabels,
datasets:[{label:'Sent',data:campPeriods.map(function(k){return campByPeriod[k].sent}),backgroundColor:COLORS.teal,borderRadius:4},
{label:'Opens',data:campPeriods.map(function(k){return campByPeriod[k].opens}),backgroundColor:COLORS.purple,borderRadius:4},
{label:'Clicks',data:campPeriods.map(function(k){return campByPeriod[k].clicks}),backgroundColor:COLORS.warning,borderRadius:4},
{label:'Conversions',data:campPeriods.map(function(k){return campByPeriod[k].conversions}),backgroundColor:COLORS.success,borderRadius:4}]},
options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{boxWidth:10,font:{size:11}}}},scales:{y:{beginAtZero:true}}}
});
destroyQPChart('chart-camp-rates');
qpCharts['chart-camp-rates']=new Chart(document.getElementById('chart-camp-rates'),{
type:'bar',data:{labels:campLabels,
datasets:[{label:'Open %',data:campPeriods.map(function(k){var d=campByPeriod[k];return d.sent>0?((d.opens/d.sent)*100).toFixed(1):0}),backgroundColor:COLORS.purple,borderRadius:4},
{label:'Click %',data:campPeriods.map(function(k){var d=campByPeriod[k];return d.opens>0?((d.clicks/d.opens)*100).toFixed(1):0}),backgroundColor:COLORS.warning,borderRadius:4},
{label:'Conv %',data:campPeriods.map(function(k){var d=campByPeriod[k];return d.clicks>0?((d.conversions/d.clicks)*100).toFixed(1):0}),backgroundColor:COLORS.success,borderRadius:4}]},
options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{boxWidth:10,font:{size:11}}}},scales:{y:{beginAtZero:true,ticks:{callback:function(v){return v+'%'}}}}}
});
}else{
document.getElementById('no-campaigns-msg').style.display='';
document.getElementById('campaign-charts-grid').style.display='none';
}

// === Key Metrics Summary ===
var paid=p.filter(function(x){return x.amount_paid>0});
var totalRev=paid.reduce(function(s,x){return s+(x.amount_paid||0)},0);
var avgOrder=paid.length>0?(totalRev/paid.length).toFixed(2):'0';
var refPurch=p.filter(function(x){return x.referral_code_used}).length;
var withCredits=r.filter(function(x){return(x.credit_balance||0)>0}).length;
var topRef=r.slice().sort(function(a,b){return(b.successful_referrals||0)-(a.successful_referrals||0)})[0];
var thisMonth=new Date().getFullYear()+'-'+String(new Date().getMonth()+1).padStart(2,'0');
var thisMonthRev=0;p.filter(function(x){return x.purchased_at&&x.amount_paid>0}).forEach(function(x){var d=new Date(x.purchased_at);var k2=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');if(k2===thisMonth)thisMonthRev+=x.amount_paid});

document.getElementById('analytics-key-metrics').innerHTML='<div class="analytics-kpi-grid">'
+'<div class="kpi-item"><div class="kpi-val" style="color:var(--success)">$'+totalRev.toLocaleString()+'</div><div class="kpi-lbl">Lifetime Revenue</div></div>'
+'<div class="kpi-item"><div class="kpi-val" style="color:var(--teal)">$'+thisMonthRev.toLocaleString()+'</div><div class="kpi-lbl">This Month</div></div>'
+'<div class="kpi-item"><div class="kpi-val">$'+avgOrder+'</div><div class="kpi-lbl">Avg Order Value</div></div>'
+'<div class="kpi-item"><div class="kpi-val" style="color:var(--purple)">'+refPurch+'</div><div class="kpi-lbl">Referred Purchases</div></div>'
+'<div class="kpi-item"><div class="kpi-val" style="color:var(--warning)">'+withCredits+'</div><div class="kpi-lbl">Users With Credit</div></div>'
+'<div class="kpi-item"><div class="kpi-val">'+paid.length+'</div><div class="kpi-lbl">Paid Transactions</div></div>'
+(topRef?'<div class="kpi-item"><div class="kpi-val" style="color:var(--success);font-size:13px">'+esc(topRef.email||'').split('@')[0]+'</div><div class="kpi-lbl">Top Referrer ('+((topRef.successful_referrals||0))+' referrals)</div></div>':'')
+'</div>';
syncChartButtons();
}

// ============================================================
// SESSION 7: EDIT PROMOTION (Dynamic Modal)
// ============================================================
function editPromotion(promoId){
var promo=promotionsData.find(function(p){return p.id===promoId});
if(!promo){showToast('Promotion not found','error');return}

var overlay=document.createElement('div');
overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease';
overlay.id='edit-promo-overlay';
overlay.onclick=function(e){if(e.target===overlay)overlay.remove()};

var dt=promo.discount_type||'percent';
var expVal=promo.expires_at?new Date(promo.expires_at).toISOString().slice(0,10):'';

var box=document.createElement('div');
box.style.cssText='background:var(--navy-card);border:1px solid var(--border);border-radius:16px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;padding:28px';
box.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><h3 style="font-family:Playfair Display,serif;font-size:20px;margin:0">Edit Promotion</h3><button onclick="document.getElementById(\'edit-promo-overlay\').remove()" style="background:none;border:none;color:var(--text-dim);font-size:22px;cursor:pointer;padding:4px">&times;</button></div>'
+'<div class="form-group" style="margin-bottom:14px"><label>Name</label><input class="input" id="ep-name" value="'+esc(promo.name||'')+'"></div>'
+'<div class="form-group" style="margin-bottom:14px"><label>Promo Code</label><input class="input" id="ep-code" value="'+esc(promo.coupon_id||'')+'" disabled style="opacity:0.5" title="Code cannot be changed"></div>'
+'<div class="form-row"><div class="form-group"><label>Discount Type</label><select class="input" id="ep-dtype" onchange="toggleEPFields()"><option value="percent"'+(dt==='percent'?' selected':'')+'>Percent Off</option><option value="fixed"'+(dt==='fixed'?' selected':'')+'>Dollar Off</option><option value="set_price"'+(dt==='set_price'?' selected':'')+'>Set Price</option></select></div>'
+'<div class="form-group" id="ep-pct-grp"><label>Percent</label><input class="input" type="number" id="ep-pct" min="1" max="100" value="'+(promo.discount_percent||10)+'"></div>'
+'<div class="form-group" id="ep-fix-grp" style="display:none"><label>Amount ($)</label><input class="input" type="number" id="ep-fix" min="1" value="'+(promo.discount_fixed||0)+'"></div>'
+'<div class="form-group" id="ep-set-grp" style="display:none"><label>Set Price ($)</label><input class="input" type="number" id="ep-set" min="1" value="'+(promo.discount_set_price||0)+'"></div></div>'
+'<div class="form-row"><div class="form-group"><label>Applies To</label><select class="input" id="ep-product"><option value="any"'+(promo.applies_to==='any'?' selected':'')+'>Site-wide</option><option value="bundle-all"'+(promo.applies_to==='bundle-all'?' selected':'')+'>Bundle Only</option><option value="sessions-only"'+(promo.applies_to==='sessions-only'?' selected':'')+'>Sessions Only</option></select></div>'
+'<div class="form-group"><label>Expires</label><input class="input" type="date" id="ep-expires" value="'+expVal+'"></div></div>'
+'<div class="form-row"><div class="form-group"><label>Max Uses (0=unlimited)</label><input class="input" type="number" id="ep-max" min="0" value="'+(promo.max_uses||0)+'"></div>'
+'<div class="form-group"><label>Min Purchase ($)</label><input class="input" type="number" id="ep-min" min="0" value="'+(promo.min_purchase||0)+'"></div></div>'
+'<div class="form-row"><div class="form-group"><label>Restrictions</label><select class="input" id="ep-restrict"><option value="none"'+(promo.restrictions==='none'||!promo.restrictions?' selected':'')+'>None</option><option value="first_purchase"'+(promo.restrictions==='first_purchase'?' selected':'')+'>First Purchase Only</option><option value="no_bundle_owners"'+(promo.restrictions==='no_bundle_owners'?' selected':'')+'>No Bundle Owners</option></select></div>'
+'<div class="form-group"><label>Distribution</label><select class="input" id="ep-method"><option value="both"'+(promo.distribution_method==='both'||!promo.distribution_method?' selected':'')+'>Link + Code</option><option value="link"'+(promo.distribution_method==='link'?' selected':'')+'>Link Only</option><option value="code"'+(promo.distribution_method==='code'?' selected':'')+'>Code Only</option></select></div></div>'
+'<div style="display:flex;gap:12px;margin-bottom:14px"><label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer"><input type="checkbox" id="ep-stack"'+(promo.stackable_with_credits?' checked':'')+'>Stackable with credits</label>'
+'<label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer"><input type="checkbox" id="ep-once"'+(promo.one_per_user?' checked':'')+'>One per user</label></div>'
+'<div class="form-group" style="margin-bottom:20px"><label>Notes</label><textarea class="input" id="ep-notes" rows="2">'+esc(promo.notes||'')+'</textarea></div>'
+'<div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-ghost" onclick="document.getElementById(\'edit-promo-overlay\').remove()">Cancel</button><button class="btn btn-primary" onclick="saveEditPromotion(\''+promoId+'\')">Save Changes</button></div>';

overlay.appendChild(box);
document.body.appendChild(overlay);
toggleEPFields();
}

function toggleEPFields(){
var dt=document.getElementById('ep-dtype');if(!dt)return;
var v=dt.value;
var pct=document.getElementById('ep-pct-grp'),fix=document.getElementById('ep-fix-grp'),sp=document.getElementById('ep-set-grp');
if(pct)pct.style.display=v==='percent'?'':'none';
if(fix)fix.style.display=v==='fixed'?'':'none';
if(sp)sp.style.display=v==='set_price'?'':'none';
}

async function saveEditPromotion(promoId){
var name=document.getElementById('ep-name').value.trim();
if(!name){showToast('Name is required','error');return}
var dt=document.getElementById('ep-dtype').value;
var dp=0,df=0,ds=0;
if(dt==='percent')dp=parseInt(document.getElementById('ep-pct').value)||10;
else if(dt==='fixed'){df=parseInt(document.getElementById('ep-fix').value)||0;if(!df){showToast('Enter dollar amount','error');return}}
else if(dt==='set_price'){ds=parseInt(document.getElementById('ep-set').value)||0;if(!ds){showToast('Enter set price','error');return}}
var exp=document.getElementById('ep-expires').value;
var updates={
name:name,discount_type:dt,discount_percent:dp,discount_fixed:df,discount_set_price:ds,
applies_to:document.getElementById('ep-product').value,
expires_at:exp?new Date(exp+'T23:59:59Z').toISOString():null,
max_uses:parseInt(document.getElementById('ep-max').value)||0,
min_purchase:parseInt(document.getElementById('ep-min').value)||0,
restrictions:document.getElementById('ep-restrict').value,
distribution_method:document.getElementById('ep-method').value,
stackable_with_credits:document.getElementById('ep-stack').checked,
one_per_user:document.getElementById('ep-once').checked,
notes:document.getElementById('ep-notes').value.trim(),
updated_at:new Date().toISOString()
};
try{
var res=await proxyFrom('promotions').update(updates).eq('id',promoId);
if(res.error)throw new Error(res.error.message);
await logAudit('edit_promo',null,'Edited promotion: '+name,{promo_id:promoId});
document.getElementById('edit-promo-overlay').remove();
await loadAllData();loadPromotionsPage();
showToast('Promotion updated','success');
}catch(e){showToast('Error: '+e.message,'error')}
}

// ============================================================
// SESSION 7: REFUND FROM ADMIN
// ============================================================
async function refundPurchase(stripeSessionId, email, amount){
if(!stripeSessionId||stripeSessionId.startsWith('credit-')||stripeSessionId.startsWith('admin-grant')){
showToast('This purchase cannot be refunded (no Stripe payment)','error');return;
}
if(!await qpConfirm('Process Refund','Refund $'+(amount||0).toFixed(2)+' to '+email+'?\\n\\nThis will refund via Stripe. The purchase record will remain.',{danger:true,okText:'Refund'}))return;
try{
showToast('Processing refund...','');
var resp=await fetch('/.netlify/functions/stripe-refund',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({stripe_session_id:stripeSessionId,email:email})});
var data=await resp.json();
if(!resp.ok||data.error)throw new Error(data.error||'Refund failed');
await logAudit('refund',email,'Refunded $'+(data.amount_refunded||amount||0).toFixed(2)+' for session '+stripeSessionId,{stripe_session_id:stripeSessionId,amount:data.amount_refunded});
await loadAllData();loadOrdersPage();
showToast('Refund of $'+(data.amount_refunded||amount||0).toFixed(2)+' processed','success');
}catch(e){showToast('Refund error: '+e.message,'error')}
}

// ============================================================
// SESSION 7: CREATE SCHEDULED EMAIL
// ============================================================
async function createScheduledEmail(){
var overlay=document.createElement('div');
overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease';
overlay.id='create-sched-overlay';
overlay.onclick=function(e){if(e.target===overlay)overlay.remove()};

var box=document.createElement('div');
box.style.cssText='background:var(--navy-card);border:1px solid var(--border);border-radius:16px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;padding:28px';
box.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><h3 style="font-family:Playfair Display,serif;font-size:20px;margin:0">Create Scheduled Email</h3><button onclick="document.getElementById(\'create-sched-overlay\').remove()" style="background:none;border:none;color:var(--text-dim);font-size:22px;cursor:pointer;padding:4px">&times;</button></div>'
+'<div class="form-group" style="margin-bottom:14px"><label>Quick Template</label><select class="input" id="cse-template" onchange="applyCseTemplate()"><option value="">— Start from scratch —</option><option value="welcome">Welcome</option><option value="newSession">New Session Available</option><option value="reminder">Session Reminder</option><option value="referral">Referral Promo</option><option value="thankYou">Thank You</option><option value="academyWelcome">Academy Welcome</option></select></div><div class="form-group" style="margin-bottom:14px"><label>Subject</label><input class="input" id="cse-subject" placeholder="Email subject line"></div>'
+'<div class="form-group" style="margin-bottom:14px"><label>Body</label><textarea class="input" id="cse-body" rows="5" placeholder="Email body text..."></textarea></div>'
+'<div class="form-row"><div class="form-group"><label>Email Type</label><select class="input" id="cse-type"><option value="reminder">Reminder</option><option value="welcome">Welcome</option><option value="followup">Follow Up</option><option value="promo">Promotional</option><option value="custom">Custom</option></select></div>'
+'<div class="form-group"><label>Audience</label><select class="input" id="cse-audience"><optgroup label="General"><option value="all_customers">All Opted-In Subscribers</option><option value="bundle_owners">Bundle Owners</option><option value="session_buyers">Single Session Buyers (No Bundle)</option><option value="no_purchase">Registered (No Purchase)</option></optgroup><optgroup label="Fusion Sessions"><option value="session-01">S1 - Intolerance &amp; Sensitivity</option><option value="session-02">S2 - Anxiety &amp; Overwhelm</option><option value="session-03">S3 - Pain &amp; Tension</option><option value="session-04">S4 - Sleep &amp; Reset</option><option value="session-05">S5 - Digestion &amp; Integration</option><option value="session-06">S6 - Immune Balance</option><option value="session-07">S7 - Hormonal Harmony</option><option value="session-08">S8 - Phobias &amp; Fear</option><option value="session-09">S9 - Fatigue &amp; Vitality</option><option value="session-10">S10 - Weight &amp; Self-Perception</option><option value="session-11">S11 - Relationships &amp; Boundaries</option><option value="session-12">S12 - Purpose &amp; Alignment</option></optgroup><optgroup label="Academy"><option value="academy-all">All Academy Students</option><option value="academy-transformational-mastery">Transformational Mastery</option><option value="academy-quantum-vision-boards">Quantum Vision Boards</option><option value="academy-becoming-present">Becoming Present</option><option value="academy-breaking-up-with-your-beliefs">Breaking Up with Your Beliefs</option><option value="academy-creative-mind-mapping">Creative Mind Mapping</option><option value="academy-power-of-the-question">The Power of The Question</option></optgroup></select></div></div>'
+'<div class="form-row"><div class="form-group"><label>Scheduled Date & Time</label><input class="input" type="datetime-local" id="cse-datetime"></div></div>'
+'<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px"><button class="btn btn-ghost" onclick="document.getElementById(\'create-sched-overlay\').remove()">Cancel</button><button class="btn btn-primary" onclick="saveScheduledEmail()">Schedule Email</button></div>';

overlay.appendChild(box);
document.body.appendChild(overlay);

// Default datetime to tomorrow at 10am
var tm=new Date();tm.setDate(tm.getDate()+1);tm.setHours(10,0,0,0);
document.getElementById('cse-datetime').value=tm.toISOString().slice(0,16);
}

async function saveScheduledEmail(){
var subject=document.getElementById('cse-subject').value.trim();
var body=document.getElementById('cse-body').value.trim();
var type=document.getElementById('cse-type').value;
var audience=document.getElementById('cse-audience').value;
var datetime=document.getElementById('cse-datetime').value;
if(!subject||!body){showToast('Subject and body are required','error');return}
if(!datetime){showToast('Select a date and time','error');return}
try{
var res=await proxyFrom('scheduled_emails').insert({
subject:subject,body:body,email_type:type,audience:audience,
scheduled_for:new Date(datetime).toISOString(),
status:'pending',created_at:new Date().toISOString()
});
if(res.error)throw new Error(res.error.message);
await logAudit('create_scheduled_email',null,'Created scheduled email: '+subject,{type:type,audience:audience});
document.getElementById('create-sched-overlay').remove();
await loadAllData();loadAutomationPage();
showToast('Email scheduled','success');
}catch(e){showToast('Error: '+e.message,'error')}
}

// ============================================================
// SESSION 7: EDIT SESSION SCHEDULE
// ============================================================
function editSessionSchedule(sessionId){
var sess=(sessionScheduleData||[]).find(function(s){return s.id===sessionId});
if(!sess){showToast('Session not found','error');return}

var overlay=document.createElement('div');
overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease';
overlay.id='edit-sess-overlay';
overlay.onclick=function(e){if(e.target===overlay)overlay.remove()};

var dt=sess.air_date?new Date(sess.air_date).toISOString().slice(0,16):'';

var box=document.createElement('div');
box.style.cssText='background:var(--navy-card);border:1px solid var(--border);border-radius:16px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;padding:28px';
box.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><h3 style="font-family:Playfair Display,serif;font-size:20px;margin:0">Edit Session '+((sess.session_number||''))+'</h3><button onclick="document.getElementById(\'edit-sess-overlay\').remove()" style="background:none;border:none;color:var(--text-dim);font-size:22px;cursor:pointer;padding:4px">&times;</button></div>'
+'<div class="form-group" style="margin-bottom:14px"><label>Title</label><input class="input" id="ess-title" value="'+esc(sess.title||'')+'"></div>'
+'<div class="form-group" style="margin-bottom:14px"><label>Topic</label><input class="input" id="ess-topic" value="'+esc(sess.topic||'')+'"></div>'
+'<div class="form-group" style="margin-bottom:14px"><label>Date & Time</label><input class="input" type="datetime-local" id="ess-date" value="'+dt+'"></div>'
+'<div class="form-group" style="margin-bottom:14px"><label>Zoom Link</label><input class="input" id="ess-zoom" value="'+esc(sess.zoom_link||'')+'"></div>'
+'<div class="form-row"><div class="form-group"><label>Zoom Meeting ID</label><input class="input" id="ess-meetid" value="'+esc(sess.zoom_meeting_id||'')+'"></div><div class="form-group"><label>Zoom Passcode</label><input class="input" id="ess-passcode" value="'+esc(sess.zoom_passcode||'')+'"></div></div>'
+'<div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-ghost" onclick="document.getElementById(\'edit-sess-overlay\').remove()">Cancel</button><button class="btn btn-primary" onclick="saveSessionSchedule(\''+sessionId+'\')">Save</button></div>';

overlay.appendChild(box);
document.body.appendChild(overlay);
}

async function saveSessionSchedule(sessionId){
var title=document.getElementById('ess-title').value.trim();
var topic=document.getElementById('ess-topic').value.trim();
var date=document.getElementById('ess-date').value;
var zoom=document.getElementById('ess-zoom').value.trim();
var meetId=document.getElementById('ess-meetid').value.trim();
var passcode=document.getElementById('ess-passcode').value.trim();
var updates={updated_at:new Date().toISOString()};
if(title)updates.title=title;
if(topic!==undefined)updates.topic=topic;
if(date)updates.air_date=new Date(date).toISOString();
updates.zoom_link=zoom;
updates.zoom_meeting_id=meetId;
updates.zoom_passcode=passcode;
try{
var res=await proxyFrom('session_schedule').update(updates).eq('id',sessionId);
if(res.error)throw new Error(res.error.message);
await logAudit('edit_session_schedule',null,'Updated session schedule: '+(title||topic||'#'+sessionId),{topic:topic});
document.getElementById('edit-sess-overlay').remove();
await loadAllData();loadAutomationPage();
showToast('Session schedule updated','success');
}catch(e){showToast('Error: '+e.message,'error')}
}


function applyCseTemplate(){
var key=document.getElementById('cse-template').value;
if(!key){document.getElementById('cse-subject').value='';document.getElementById('cse-body').value='';return}
var t=EMAIL_TEMPLATES[key];
if(t){document.getElementById('cse-subject').value=t.subject||'';document.getElementById('cse-body').value=t.body||''}
}


// ============================================================
// SESSION 7: DOWNLOADABLE REPORTS
// ============================================================
function generateReport(type){
var csv=[],filename='qp-report.csv',now=new Date().toISOString().split('T')[0];

if(type==='revenue'){
filename='qp-revenue-'+now+'.csv';
csv.push('Date,Email,Product,Amount,Referral Code,Stripe ID,Type');
purchasesData.forEach(function(p){
var date=p.purchased_at?new Date(p.purchased_at).toLocaleDateString():'';
var isGrant=p.stripe_event_id&&p.stripe_event_id.indexOf('admin-grant')===0;
var ptype=isGrant?'Admin Grant':(Number(p.amount_paid)>0?'Paid':'Free');
csv.push([date,'"'+(p.email||'')+'"','"'+productName(p.product_id)+'"',p.amount_paid||0,p.referral_code_used||'','"'+(p.stripe_session_id||'')+'"',ptype].join(','))
});
var totalRev=purchasesData.reduce(function(s,p){return s+(Number(p.amount_paid)||0)},0);
var paidCount=purchasesData.filter(function(p){return Number(p.amount_paid)>0}).length;
csv.push('');
csv.push('SUMMARY');
csv.push('Total Revenue,$'+totalRev.toFixed(2));
csv.push('Total Transactions,'+purchasesData.length);
csv.push('Paid Transactions,'+paidCount);
csv.push('Average Order,$'+(paidCount>0?(totalRev/paidCount).toFixed(2):'0'));

}else if(type==='customers'){
filename='qp-customers-'+now+'.csv';
csv.push('Email,Name,Products,Total Spent,Credit Balance,Referral Code,Referrals,Has Account,Blocked');
allCustomers.forEach(function(c){
csv.push(['"'+c.email+'"','"'+(c.name||'')+'"','"'+c.purchases.map(productName).join('; ')+'"',c.totalSpent.toFixed(2),c.creditBalance.toFixed(2),c.referralCode,c.referralCount,c.hasAccount?'Yes':'No',c.isBlocked?'Yes':'No'].join(','))
});
csv.push('');
csv.push('SUMMARY');
csv.push('Total Customers,'+allCustomers.length);
csv.push('With Purchases,'+allCustomers.filter(function(c){return c.purchases.length>0}).length);
csv.push('Total Spent,$'+allCustomers.reduce(function(s,c){return s+c.totalSpent},0).toFixed(2));

}else if(type==='referrals'){
filename='qp-referrals-'+now+'.csv';
csv.push('Email,Referral Code,Successful Referrals,Credit Balance,Total Earned');
referralData.forEach(function(r){
csv.push(['"'+(r.email||'')+'"',r.code||'',r.successful_referrals||0,(Number(r.credit_balance)||0).toFixed(2),(Number(r.total_earned)||0).toFixed(2)].join(','))
});
csv.push('');
csv.push('SUMMARY');
csv.push('Total Codes,'+referralData.length);
csv.push('Active Referrers,'+referralData.filter(function(r){return(r.successful_referrals||0)>0}).length);
csv.push('Credits Outstanding,$'+referralData.reduce(function(s,r){return s+(Number(r.credit_balance)||0)},0).toFixed(2));
csv.push('Total Earned,$'+referralData.reduce(function(s,r){return s+(Number(r.total_earned)||0)},0).toFixed(2));

}else if(type==='enrollments'){
filename='qp-enrollments-'+now+'.csv';
csv.push('Email,Name,Course,Status,Enrolled Date,Lessons Completed,Lessons Total,Progress %');
var profMap={};profilesData.forEach(function(p){if(p.id)profMap[p.id]=p});
var progMap={};lessonProgress.forEach(function(lp){var k=lp.user_id+'_'+lp.course_id;if(!progMap[k])progMap[k]={total:0,done:0};progMap[k].total++;if(lp.completed)progMap[k].done++});
academyEnrollments.forEach(function(e){
var prof=profMap[e.user_id]||{};
var courseName=e.qa_courses&&e.qa_courses.title||'Unknown';
var prog=progMap[e.user_id+'_'+(e.qa_courses&&e.qa_courses.id||e.course_id)]||{total:0,done:0};
var pct=prog.total>0?Math.round(prog.done/prog.total*100):0;
csv.push(['"'+(prof.email||'')+'"','"'+(prof.full_name||'')+'"','"'+courseName+'"',e.status,e.enrolled_at?new Date(e.enrolled_at).toLocaleDateString():'',prog.done,prog.total,pct+'%'].join(','))
});
csv.push('');
csv.push('SUMMARY');
csv.push('Total Enrollments,'+academyEnrollments.length);
csv.push('Active,'+academyEnrollments.filter(function(e){return e.status==='active'}).length);

}else if(type==='monthly'){
filename='qp-monthly-breakdown-'+now+'.csv';
var byMonth={};
purchasesData.filter(function(p){return p.purchased_at}).forEach(function(p){
var d=new Date(p.purchased_at);
var k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
if(!byMonth[k])byMonth[k]={total:0,academy:0,fusion:0,bundles:0,count:0,paid:0};
var amt=Number(p.amount_paid)||0;
byMonth[k].total+=amt;
byMonth[k].count++;
if(amt>0)byMonth[k].paid++;
if(isAcademy(p.product_id))byMonth[k].academy+=amt;
if(isFusion(p.product_id))byMonth[k].fusion+=amt;
if(p.product_id==='bundle-all')byMonth[k].bundles++;
});
csv.push('Month,Total Revenue,Academy Revenue,Fusion Revenue,Transactions,Paid,Bundle Sales');
Object.keys(byMonth).sort().forEach(function(k){
var m=byMonth[k];
csv.push([k,'$'+m.total.toFixed(2),'$'+m.academy.toFixed(2),'$'+m.fusion.toFixed(2),m.count,m.paid,m.bundles].join(','))
});

}else if(type==='campaigns'){
filename='qp-campaigns-'+now+'.csv';
csv.push('Date,Campaign,Type,From,Sent,Opens,Clicks,Open Rate,Click Rate');
emailCampaignsData.forEach(function(c){
var date=c.sent_at?new Date(c.sent_at).toLocaleDateString():'Draft';
var openRate=c.sent_count>0?((c.open_count||0)/c.sent_count*100).toFixed(1)+'%':'0%';
var clickRate=c.open_count>0?((c.click_count||0)/c.open_count*100).toFixed(1)+'%':'0%';
csv.push([date,'"'+(c.campaign_name||c.subject||'')+'"',c.campaign_type||'custom',c.from_email||'',c.sent_count||0,c.open_count||0,c.click_count||0,openRate,clickRate].join(','))
});
}

var blob=new Blob([csv.join('\n')],{type:'text/csv'});
var a=document.createElement('a');
a.href=URL.createObjectURL(blob);
a.download=filename;
a.click();
showToast('Report downloaded: '+filename,'success');
}

// ============================================================
// SESSION 7: CUSTOM ANALYTICS QUERY BUILDER
// ============================================================
function updateCaqFields(){
var src=document.getElementById('caq-source').value;
var measure=document.getElementById('caq-measure');
var group=document.getElementById('caq-group');
var filter=document.getElementById('caq-filter-field');
measure.innerHTML='<option value="count">Count</option>';
group.innerHTML='<option value="none">No Grouping</option><option value="month">Month</option><option value="week">Week</option>';
filter.innerHTML='<option value="none">No Filter</option><option value="email">Email (contains)</option><option value="date_after">Date After</option><option value="date_before">Date Before</option>';
if(src.startsWith('purchases')){
measure.innerHTML+='<option value="sum_amount">Sum of Amount</option><option value="avg_amount">Average Amount</option><option value="unique_emails">Unique Emails</option><option value="min_amount">Min Amount</option><option value="max_amount">Max Amount</option>';
group.innerHTML+='<option value="product">Product</option><option value="email">Email</option><option value="day">Day</option><option value="referral_used">Referral Code Used</option>';
filter.innerHTML+='<option value="product_id">Product (contains)</option><option value="referral_code_used">Has Referral Code</option><option value="amount_paid_gt">Amount &gt; $</option><option value="amount_paid_lt">Amount &lt; $</option><option value="amount_paid_eq">Amount = $0 (Free)</option>';
}else if(src==='profiles'){
measure.innerHTML+='<option value="unique_emails">Unique Emails</option>';
group.innerHTML+='<option value="blocked">Blocked vs Active</option><option value="has_purchases">Has Purchases vs Not</option>';
filter.innerHTML+='<option value="blocked">Blocked Only</option><option value="full_name">Name (contains)</option>';
}else if(src==='referrals'){
measure.innerHTML+='<option value="sum_credits">Sum of Credit Balance</option><option value="sum_earned">Sum Total Earned</option><option value="avg_referrals">Avg Referrals</option><option value="unique_emails">Unique Emails</option>';
group.innerHTML+='<option value="has_balance">Has Balance vs Not</option><option value="referral_count">By Referral Count</option><option value="email">Email</option>';
filter.innerHTML+='<option value="has_referrals">Has Referrals</option><option value="has_balance">Has Balance &gt; 0</option>';
}else if(src==='credits'){
measure.innerHTML+='<option value="sum_amount">Sum of Amount</option><option value="avg_amount">Avg Amount</option><option value="unique_emails">Unique Emails</option>';
group.innerHTML+='<option value="type">Credit Type</option><option value="email">Email</option><option value="day">Day</option>';
filter.innerHTML+='<option value="type">Type (contains)</option><option value="amount_paid_gt">Amount &gt; $</option>';
}else if(src==='enrollments'){
measure.innerHTML+='<option value="unique_emails">Unique Students</option>';
group.innerHTML+='<option value="course">Course</option><option value="status">Status</option><option value="day">Day</option>';
filter.innerHTML+='<option value="status">Status (e.g. active)</option><option value="course">Course (contains)</option>';
}else if(src==='progress'){
measure.innerHTML+='<option value="unique_emails">Unique Students</option><option value="unique_lessons">Unique Lessons</option>';
group.innerHTML+='<option value="course">Course</option><option value="email">Student</option><option value="day">Day Completed</option>';
filter.innerHTML+='<option value="course">Course (contains)</option><option value="completed">Completed Only</option>';
}else if(src==='campaigns'){
measure.innerHTML+='<option value="sum_sent">Total Sent</option><option value="sum_opens">Total Opens</option><option value="sum_clicks">Total Clicks</option><option value="sum_conversions">Total Conversions</option><option value="avg_open_rate">Avg Open Rate %</option><option value="avg_click_rate">Avg Click Rate %</option>';
group.innerHTML+='<option value="type">Campaign Type</option><option value="day">Day</option>';
filter.innerHTML+='<option value="type">Type (contains)</option><option value="has_opens">Has Opens</option>';
}else if(src==='tracking'){
measure.innerHTML+='<option value="unique_emails">Unique Recipients</option>';
group.innerHTML+='<option value="status">Status</option><option value="email">Recipient</option><option value="day">Day</option>';
filter.innerHTML+='<option value="status">Status (e.g. opened, clicked)</option>';
}else if(src==='promotions'){
measure.innerHTML+='<option value="sum_uses">Total Uses</option><option value="avg_discount">Avg Discount %</option>';
group.innerHTML+='<option value="status">Status</option><option value="product">Applies To</option><option value="type">Discount Type</option>';
filter.innerHTML+='<option value="status">Status (e.g. active)</option><option value="product_id">Applies To (contains)</option>';
}else if(src==='posts'){
measure.innerHTML+='<option value="unique_emails">Unique Posters</option>';
group.innerHTML+='<option value="email">Author</option><option value="day">Day</option>';
filter.innerHTML='<option value="none">No Filter</option><option value="email">Author (contains)</option>';
}
}

function runCustomQuery(){
var src=document.getElementById('caq-source').value;
var measure=document.getElementById('caq-measure').value;
var groupBy=document.getElementById('caq-group').value;
var filterField=document.getElementById('caq-filter-field').value;
var filterVal=(document.getElementById('caq-filter-val').value||'').trim().toLowerCase();
var chartType=document.getElementById('caq-chart-type').value;

// Get source data
var data=[];
if(src==='purchases')data=(purchasesData||[]).slice();
else if(src==='purchases-paid')data=(purchasesData||[]).filter(function(x){return(Number(x.amount_paid)||0)>0});
else if(src==='purchases-fusion')data=(purchasesData||[]).filter(function(x){return isFusionProduct(x.product_id)});
else if(src==='purchases-academy')data=(purchasesData||[]).filter(function(x){return isAcademyProduct(x.product_id)});
else if(src==='profiles')data=(profilesData||[]).slice();
else if(src==='referrals')data=(referralData||[]).slice();
else if(src==='credits')data=(creditHistory||[]).slice();
else if(src==='enrollments')data=(academyEnrollments||[]).slice();
else if(src==='progress')data=(lessonProgress||[]).slice();
else if(src==='campaigns')data=(emailCampaignsData||[]).slice();
else if(src==='tracking')data=(emailTrackingData||[]).slice();
else if(src==='promotions')data=(promotionsData||[]).slice();
else if(src==='posts')data=(allFusionPosts||[]).concat(allAcadPosts||[]);

// Apply filter
if(filterField!=='none'&&filterField){
data=data.filter(function(d){
if(filterField==='product_id')return(d.product_id||d.applies_to||'').toLowerCase().indexOf(filterVal)!==-1;
if(filterField==='email')return(d.email||d.recipient_email||d.user_email||'').toLowerCase().indexOf(filterVal)!==-1;
if(filterField==='full_name')return(d.full_name||'').toLowerCase().indexOf(filterVal)!==-1;
if(filterField==='referral_code_used')return!!d.referral_code_used;
if(filterField==='amount_paid_gt')return(Number(d.amount_paid)||Number(d.amount)||0)>Number(filterVal);
if(filterField==='amount_paid_lt')return(Number(d.amount_paid)||Number(d.amount)||0)<Number(filterVal);
if(filterField==='amount_paid_eq')return!d.amount_paid||Number(d.amount_paid)===0;
if(filterField==='date_after'){var df=d.purchased_at||d.created_at||d.enrolled_at||d.sent_at||d.completed_at;return df&&new Date(df)>=new Date(filterVal)}
if(filterField==='date_before'){var df2=d.purchased_at||d.created_at||d.enrolled_at||d.sent_at||d.completed_at;return df2&&new Date(df2)<=new Date(filterVal)}
if(filterField==='has_referrals')return(d.successful_referrals||0)>0;
if(filterField==='has_balance')return(d.credit_balance||0)>0;
if(filterField==='has_opens')return(d.open_count||0)>0;
if(filterField==='blocked')return d.is_blocked===true;
if(filterField==='completed')return d.completed===true||d.status==='completed';
if(filterField==='type')return(d.type||d.campaign_type||d.email_type||d.discount_type||'').toLowerCase().indexOf(filterVal)!==-1;
if(filterField==='status')return(d.status||'').toLowerCase().indexOf(filterVal)!==-1;
if(filterField==='course'){var cname=(d.qa_courses&&(d.qa_courses.title||d.qa_courses.slug))||d.course_id||d.lesson_id||'';return cname.toLowerCase().indexOf(filterVal)!==-1}
return true;
});
}

if(!data.length){
document.getElementById('caq-result').style.display='none';
document.getElementById('caq-empty').style.display='';
return;
}

// Group
var groups={};
if(groupBy==='none'){groups['Total']=data}
else{
data.forEach(function(d){
var key='Unknown';
if(groupBy==='month'){var dt=d.purchased_at||d.created_at||d.enrolled_at||d.sent_at;if(dt){var dd=new Date(dt);key=dd.getFullYear()+'-'+String(dd.getMonth()+1).padStart(2,'0')}else key='No Date'}
else if(groupBy==='week'){var dt2=d.purchased_at||d.created_at||d.enrolled_at||d.sent_at;if(dt2){var dd2=new Date(dt2);var ws=new Date(dd2);ws.setDate(dd2.getDate()-dd2.getDay());key=ws.toISOString().slice(0,10)}else key='No Date'}
else if(groupBy==='day'){var dt3=d.purchased_at||d.created_at||d.enrolled_at||d.sent_at||d.completed_at;if(dt3)key=new Date(dt3).toISOString().slice(0,10);else key='No Date'}
else if(groupBy==='referral_used')key=d.referral_code_used?'With Referral':'No Referral';
else if(groupBy==='blocked')key=d.is_blocked?'Blocked':'Active';
else if(groupBy==='has_purchases'){var pe=new Set((purchasesData||[]).map(function(x){return(x.email||'').toLowerCase()}));key=pe.has((d.email||'').toLowerCase())?'Has Purchases':'No Purchases'}
else if(groupBy==='product')key=d.product_id||d.applies_to||'unknown';
else if(groupBy==='email')key=(d.email||d.recipient_email||'unknown').toLowerCase();
else if(groupBy==='type')key=d.type||d.campaign_type||d.email_type||'unknown';
else if(groupBy==='course')key=(d.qa_courses&&d.qa_courses.title)||d.course_id||'unknown';
else if(groupBy==='status')key=d.status||'unknown';
else if(groupBy==='has_balance')key=(d.credit_balance||0)>0?'Has Balance':'No Balance';
else if(groupBy==='referral_count'){var rc=d.successful_referrals||0;key=rc===0?'0 referrals':rc<=3?'1-3 referrals':'4+ referrals'}
if(!groups[key])groups[key]=[];
groups[key].push(d);
});
}

// Measure
var labels=Object.keys(groups).sort();
var values=labels.map(function(k){
var items=groups[k];
if(measure==='count')return items.length;
if(measure==='sum_amount')return items.reduce(function(s,d){return s+(Number(d.amount_paid)||Number(d.amount)||0)},0);
if(measure==='avg_amount'){var paid=items.filter(function(d){return(Number(d.amount_paid)||0)>0});return paid.length?(paid.reduce(function(s,d){return s+(Number(d.amount_paid)||0)},0)/paid.length):0}
if(measure==='unique_emails')return new Set(items.map(function(d){return(d.email||d.recipient_email||d.user_email||'').toLowerCase()}).filter(Boolean)).size;
if(measure==='sum_credits')return items.reduce(function(s,d){return s+(Number(d.credit_balance)||0)},0);
if(measure==='sum_earned')return items.reduce(function(s,d){return s+(Number(d.total_earned)||0)},0);
if(measure==='avg_referrals'){var total=items.reduce(function(s,d){return s+(Number(d.successful_referrals)||0)},0);return items.length?(total/items.length):0}
if(measure==='sum_sent')return items.reduce(function(s,d){return s+(Number(d.sent_count)||0)},0);
if(measure==='sum_opens')return items.reduce(function(s,d){return s+(Number(d.open_count)||0)},0);
if(measure==='sum_clicks')return items.reduce(function(s,d){return s+(Number(d.click_count)||0)},0);
if(measure==='avg_open_rate'){var rates=items.filter(function(d){return(d.sent_count||0)>0}).map(function(d){return(d.open_count||0)/(d.sent_count||1)*100});return rates.length?(rates.reduce(function(a,b){return a+b},0)/rates.length):0}
if(measure==='avg_click_rate'){var crates=items.filter(function(d){return(d.open_count||0)>0}).map(function(d){return(d.click_count||0)/(d.open_count||1)*100});return crates.length?(crates.reduce(function(a,b){return a+b},0)/crates.length):0}
if(measure==='sum_conversions')return items.reduce(function(s,d){return s+(Number(d.conversion_count)||0)},0);
if(measure==='sum_uses')return items.reduce(function(s,d){return s+(Number(d.times_used)||0)},0);
if(measure==='avg_discount'){var discs=items.filter(function(d){return(d.discount_percent||0)>0}).map(function(d){return d.discount_percent});return discs.length?(discs.reduce(function(a,b){return a+b},0)/discs.length):0}
if(measure==='min_amount'){var amts=items.map(function(d){return Number(d.amount_paid)||0}).filter(function(v){return v>0});return amts.length?Math.min.apply(null,amts):0}
if(measure==='max_amount'){var amts2=items.map(function(d){return Number(d.amount_paid)||0});return amts2.length?Math.max.apply(null,amts2):0}
if(measure==='unique_lessons')return new Set(items.map(function(d){return d.lesson_id||''}).filter(Boolean)).size;
return items.length;
});

// Round values
values=values.map(function(v){return Math.round(v*100)/100});

// Render
document.getElementById('caq-empty').style.display='none';
document.getElementById('caq-result').style.display='';

// Chart
var canvas=document.getElementById('caq-chart');
if(chartType==='table'){canvas.style.display='none'}
else{
canvas.style.display='';
destroyQPChart('caq-chart');
var bgColors=labels.map(function(_,i){var palette=[COLORS.teal,COLORS.purple,COLORS.taupe,COLORS.success,COLORS.warning,COLORS.danger,'#60a5fa','#c084fc','#f472b6','#34d399','#fbbf24','#fb923c'];return palette[i%palette.length]});
var bgAlphas=labels.map(function(_,i){var palette=[COLORS.tealA,COLORS.purpleA,COLORS.taupeA,COLORS.successA,COLORS.warningA,COLORS.dangerA,'rgba(96,165,250,.3)','rgba(192,132,252,.3)','rgba(244,114,182,.3)','rgba(52,211,153,.3)','rgba(251,191,36,.3)','rgba(251,146,60,.3)'];return palette[i%palette.length]});
qpCharts['caq-chart']=new Chart(canvas,{
type:chartType,
data:{labels:labels,datasets:[{label:document.getElementById('caq-measure').options[document.getElementById('caq-measure').selectedIndex].text,data:values,backgroundColor:chartType==='doughnut'?bgColors:bgAlphas,borderColor:bgColors,borderWidth:chartType==='doughnut'?0:1,borderRadius:chartType==='bar'?4:0,tension:0.4,fill:chartType==='line'}]},
options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:chartType==='doughnut',position:'bottom',labels:{boxWidth:10,font:{size:11}}}},scales:chartType==='doughnut'?{}:{y:{beginAtZero:true}}}
});
}

// Table
var isMoney=measure.indexOf('amount')!==-1||measure.indexOf('credits')!==-1||measure.indexOf('earned')!==-1||measure==='sum_amount'||measure==='avg_amount'||measure==='min_amount'||measure==='max_amount';
var thtml='<table class="tbl"><thead><tr><th>'+groupBy.charAt(0).toUpperCase()+groupBy.slice(1)+'</th><th style="text-align:right">'+document.getElementById('caq-measure').options[document.getElementById('caq-measure').selectedIndex].text+'</th></tr></thead><tbody>';
labels.forEach(function(k,i){
var displayVal=isMoney?'$'+values[i].toLocaleString():measure.indexOf('rate')!==-1?values[i].toFixed(1)+'%':values[i].toLocaleString();
thtml+='<tr><td>'+esc(k)+'</td><td style="text-align:right;font-weight:600;color:var(--teal)">'+displayVal+'</td></tr>';
});
thtml+='</tbody></table>';
if(labels.length>1){
var totalVal=values.reduce(function(a,b){return a+b},0);
var displayTotal=isMoney?'$'+totalVal.toLocaleString():totalVal.toLocaleString();
thtml+='<div style="text-align:right;margin-top:8px;font-size:12px;color:var(--text-muted)">Total: <strong style="color:var(--text)">'+displayTotal+'</strong> across '+labels.length+' groups</div>';
}
document.getElementById('caq-table').innerHTML=thtml;
}

function clearCustomQuery(){
document.getElementById('caq-filter-val').value='';
document.getElementById('caq-result').style.display='none';
document.getElementById('caq-empty').style.display='none';
destroyQPChart('caq-chart');
document.getElementById('caq-table').innerHTML='';
}


// ============================================================
// CUSTOM QUERY PRESETS
// ============================================================
function getQueryPresets(){return JSON.parse(localStorage.getItem('caq-presets')||'[]')}
function saveQueryPresets(list){localStorage.setItem('caq-presets',JSON.stringify(list))}

function renderQueryPresets(){
var presets=getQueryPresets();
var container=document.getElementById('caq-presets');
if(!container)return;
if(!presets.length){container.innerHTML='';return}
container.innerHTML=presets.map(function(p,i){
return '<button class="btn btn-ghost btn-sm" style="font-size:11px;border-color:var(--teal);color:var(--teal)" onclick="loadQueryPreset('+i+')" title="'+esc(p.source+' → '+p.measure+' by '+p.group)+'">'+esc(p.name)+'</button>'
+'<button class="btn btn-ghost btn-sm" style="font-size:9px;padding:2px 5px;color:var(--text-dim);border-color:var(--border)" onclick="deleteQueryPreset('+i+')" title="Remove">✕</button>';
}).join(' ');
}

function saveQueryPreset(){
var source=document.getElementById('caq-source').value;
var measure=document.getElementById('caq-measure').value;
var group=document.getElementById('caq-group').value;
var filterField=document.getElementById('caq-filter-field').value;
var filterVal=document.getElementById('caq-filter-val').value;
var chartType=document.getElementById('caq-chart-type').value;
var measureLabel=document.getElementById('caq-measure').options[document.getElementById('caq-measure').selectedIndex].text;
var sourceLabel=document.getElementById('caq-source').options[document.getElementById('caq-source').selectedIndex].text;
var defaultName=sourceLabel+': '+measureLabel;
var name=prompt('Name this preset:',defaultName);
if(!name)return;
var presets=getQueryPresets();
presets.push({name:name,source:source,measure:measure,group:group,filterField:filterField,filterVal:filterVal,chartType:chartType});
saveQueryPresets(presets);
renderQueryPresets();
showToast('Preset "'+name+'" saved','success');
}

function loadQueryPreset(idx){
var presets=getQueryPresets();
var p=presets[idx];if(!p)return;
document.getElementById('caq-source').value=p.source;
updateCaqFields();
setTimeout(function(){
document.getElementById('caq-measure').value=p.measure;
document.getElementById('caq-group').value=p.group;
document.getElementById('caq-filter-field').value=p.filterField||'none';
document.getElementById('caq-filter-val').value=p.filterVal||'';
document.getElementById('caq-chart-type').value=p.chartType||'bar';
runCustomQuery();
},50);
}

function deleteQueryPreset(idx){
var presets=getQueryPresets();
var name=presets[idx]?presets[idx].name:'';
presets.splice(idx,1);
saveQueryPresets(presets);
renderQueryPresets();
showToast('Preset "'+name+'" removed','info');
}


function toggleChartExpand(btn){
var card=btn.closest('.chart-card');
if(!card)return;
var title=card.querySelector('.card-title');
var titleText=title?title.textContent.trim():'Chart';
var canvas=card.querySelector('canvas');
if(!canvas)return;
var chartId=canvas.id;
var chart=qpCharts[chartId];
if(!chart)return;

var overlay=document.createElement('div');
overlay.className='chart-popout-overlay';
overlay.onclick=function(e){if(e.target===overlay){overlay.remove()}};

var box=document.createElement('div');
box.className='chart-popout-box';

var closeBtn=document.createElement('button');
closeBtn.className='chart-popout-close';
closeBtn.innerHTML='&times;';
closeBtn.onclick=function(){overlay.remove()};
box.appendChild(closeBtn);

var h=document.createElement('div');
h.style.cssText='font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:16px;padding-right:40px';
h.textContent=titleText;
box.appendChild(h);

var wrap=document.createElement('div');
wrap.style.cssText='position:relative;width:100%;height:420px';
var newCanvas=document.createElement('canvas');
wrap.appendChild(newCanvas);
box.appendChild(wrap);

overlay.appendChild(box);
document.body.appendChild(overlay);

// Escape key to close
var escHandler=function(e){if(e.key==='Escape'){overlay.remove();document.removeEventListener('keydown',escHandler)}};
document.addEventListener('keydown',escHandler);

new Chart(newCanvas,{
type:chart.config.type,
data:JSON.parse(JSON.stringify(chart.config.data)),
options:Object.assign({},JSON.parse(JSON.stringify(chart.config.options)),{responsive:true,maintainAspectRatio:false})
});
}



// ============ ADMIN PERMISSIONS SYSTEM ============
function applyPermissions(){if(!currentAdmin)return;
var n=currentAdmin.name||currentAdmin.email.split('@')[0];
var avatarEl=document.getElementById('sb-avatar');if(avatarEl)avatarEl.textContent=(n[0]||'?').toUpperCase();
var nameEl=document.getElementById('sb-user-name');if(nameEl)nameEl.textContent=n;
var roleEl=document.getElementById('sb-user-role');if(roleEl){var rl=currentAdmin.role.replace('_',' ');roleEl.textContent=rl.charAt(0).toUpperCase()+rl.slice(1)}
var p=currentAdmin.permissions||{};
var sectionMap={'customers':'customers','academy':'customers','fusion':'customers','sessions':'customers','memberships':'customers','community':'community','referrals':'customers','email':'email','automation':'automation','promotions':'promotions','orders':'orders','analytics':'analytics','audit':'audit','admin-users':'system'};
document.querySelectorAll('.sb-link').forEach(function(btn){var oc=btn.getAttribute('onclick')||'';var m=oc.match(/go\('([^']+)'/);if(m){var page=m[1];var perm=sectionMap[page];if(perm&&p[perm]===false)btn.style.display='none';else btn.style.display=''}});
var auBtn=document.getElementById('sb-admin-users');if(auBtn){if(currentAdmin.role==='super_admin')auBtn.style.display='';else auBtn.style.display='none'}
}
function canDo(perm){if(!currentAdmin)return true;return currentAdmin.permissions[perm]!==false}

// ============ MODERATOR MANAGEMENT ============
var modSearchResults=[],modSelectedIdx=-1;
function handleModSearch(){var inp=document.getElementById('mod-email'),dd=document.getElementById('mod-ac'),q=inp.value.trim().toLowerCase();if(q.length<2){dd.classList.remove('active');modSearchResults=[];modSelectedIdx=-1;return}var filtered=allCustomers.filter(function(c){return c.email.toLowerCase().includes(q)||(c.name&&c.name.toLowerCase().includes(q))}).slice(0,8);modSearchResults=filtered;if(!filtered.length){dd.classList.remove('active');return}modSelectedIdx=0;renderModDropdown(q);dd.classList.add('active')}
function renderModDropdown(q){var dd=document.getElementById('mod-ac');dd.innerHTML=modSearchResults.map(function(p,i){var hl=p.email.replace(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'),'<span class="ac-hl">$1</span>');return '<div class="ac-item'+(i===modSelectedIdx?' selected':'')+'" onclick="selectMod('+i+')" onmouseenter="modSelectedIdx='+i+';updateModSel()"><span>'+hl+'</span>'+(p.name?'<small style="display:block;color:var(--text-dim);font-size:11px">'+esc(p.name)+'</small>':'')+'</div>'}).join('')}
function updateModSel(){document.querySelectorAll('#mod-ac .ac-item').forEach(function(el,i){el.classList.toggle('selected',i===modSelectedIdx)})}
function handleModKeydown(e){var dd=document.getElementById('mod-ac');if(!dd.classList.contains('active')){if(e.key==='Enter')assignMod();return}if(e.key==='ArrowDown'){e.preventDefault();modSelectedIdx=Math.min(modSelectedIdx+1,modSearchResults.length-1);updateModSel()}else if(e.key==='ArrowUp'){e.preventDefault();modSelectedIdx=Math.max(modSelectedIdx-1,0);updateModSel()}else if(e.key==='Enter'){e.preventDefault();if(modSelectedIdx>=0&&modSearchResults[modSelectedIdx])selectMod(modSelectedIdx)}else if(e.key==='Escape')dd.classList.remove('active')}
function selectMod(i){var u=modSearchResults[i];if(u){document.getElementById('mod-email').value=u.email;document.getElementById('mod-ac').classList.remove('active')}}
document.addEventListener('click',function(e){var w=document.getElementById('mod-email');if(w&&!w.parentElement.contains(e.target))document.getElementById('mod-ac').classList.remove('active')});
async function loadModerators(){var el=document.getElementById('mod-list');if(!el)return;el.innerHTML='<div class="loading-center"><div class="spinner"></div>Loading...</div>';try{var res=await proxyFrom('profiles').select('id,email,full_name,community_role').in('community_role',['moderator','admin']).order('community_role',{ascending:false});if(res.error)throw res.error;var mods=res.data||[];if(!mods.length){el.innerHTML='<div class="empty"><p>No moderators assigned yet.</p></div>';return}var h='<div class="card"><div class="card-body" style="padding:0"><table class="tbl"><thead><tr><th>User</th><th>Role</th><th>Action</th></tr></thead><tbody>';mods.forEach(function(m){var init=(m.full_name||m.email||'?')[0].toUpperCase();h+='<tr><td><div style="display:flex;align-items:center;gap:10px"><div class="avatar-sm">'+init+'</div><div><div style="font-weight:500">'+esc(m.full_name||m.email.split('@')[0])+'</div><div style="font-size:12px;color:var(--text-muted)">'+esc(m.email)+'</div></div></div></td><td><span class="badge badge-'+(m.community_role==='admin'?'danger':'purple')+'">'+esc(m.community_role)+'</span></td><td><button class="btn btn-danger btn-sm" onclick="removeMod(\''+m.id+'\',\''+esc(m.email)+'\')">Remove</button></td></tr>'});h+='</tbody></table></div></div>';el.innerHTML=h}catch(e){el.innerHTML='<div class="empty"><p style="color:var(--danger)">Error: '+esc(e.message)+'</p></div>'}}
async function assignMod(){var email=document.getElementById('mod-email').value.trim().toLowerCase(),role=document.getElementById('mod-role').value,msg=document.getElementById('mod-msg');if(!email){showMsg(msg,'error','Enter an email');return}try{var prof=await proxyFrom('profiles').select('id').ilike('email',email).single();if(prof.error||!prof.data){showMsg(msg,'error','User must log in first to create an account.');return}await proxyFrom('profiles').update({community_role:role}).eq('id',prof.data.id);await logAudit('assign_mod',email,'Assigned '+role+' role',{role:role});showMsg(msg,'success','✓ '+email+' is now a '+role);document.getElementById('mod-email').value='';loadModerators()}catch(e){showMsg(msg,'error','Error: '+e.message)}}
async function removeMod(userId,email){if(!await qpConfirm('Remove Role','Remove moderator role from '+email+'?'))return;try{await proxyFrom('profiles').update({community_role:'member'}).eq('id',userId);await logAudit('remove_mod',email,'Removed moderator role');loadModerators();showToast('Role removed','success')}catch(e){showToast('Error: '+e.message,'error')}}

// ============ ADMIN USERS MANAGEMENT ============
var adminUsersData=[];
async function loadAdminUsers(){var el=document.getElementById('adm-list');if(!el)return;el.innerHTML='<div class="loading-center"><div class="spinner"></div>Loading...</div>';try{var res=await proxyFrom('admin_users').select('*').order('role',{ascending:true}).order('name');if(res.error)throw res.error;adminUsersData=res.data||[];var statsEl=document.getElementById('adm-stats');if(statsEl){var sa=adminUsersData.filter(function(a){return a.role==='super_admin'}).length;var ad=adminUsersData.filter(function(a){return a.role==='admin'}).length;var as=adminUsersData.filter(function(a){return a.role==='assistant'}).length;var active=adminUsersData.filter(function(a){return a.is_active}).length;statsEl.innerHTML='<div class="stat-card"><div class="stat-value">'+adminUsersData.length+'</div><div class="stat-label">Total Admins</div></div><div class="stat-card"><div class="stat-value">'+sa+'</div><div class="stat-label">Super Admins</div></div><div class="stat-card"><div class="stat-value">'+ad+'</div><div class="stat-label">Admins</div></div><div class="stat-card"><div class="stat-value">'+as+'</div><div class="stat-label">Assistants</div></div>'}if(!adminUsersData.length){el.innerHTML='<div class="empty"><p>No admin users yet.</p></div>';return}var h='<table class="tbl"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Last Login</th><th>Status</th><th>Actions</th></tr></thead><tbody>';adminUsersData.forEach(function(a){var ll=a.last_login?new Date(a.last_login).toLocaleDateString():'Never';var roleBadge=a.role==='super_admin'?'danger':a.role==='admin'?'primary':'default';h+='<tr><td><strong>'+esc(a.name||'—')+'</strong></td><td>'+esc(a.email)+'</td><td><span class="badge badge-'+roleBadge+'">'+esc(a.role.replace('_',' '))+'</span></td><td style="font-size:12px;color:var(--text-muted)">'+ll+'</td><td>'+(a.is_active?'<span class="badge badge-success">Active</span>':'<span class="badge badge-danger">Disabled</span>')+'</td><td style="display:flex;gap:6px">';if(currentAdmin&&currentAdmin.email!==a.email){h+='<button class="btn btn-ghost btn-sm" onclick="editAdminUser(\''+a.id+'\')">Edit</button>';h+='<button class="btn btn-danger btn-sm" onclick="toggleAdminActive(\''+a.id+'\','+(!a.is_active)+')">'+(a.is_active?'Disable':'Enable')+'</button>'}else{h+='<span style="font-size:11px;color:var(--text-dim)">You</span>'}h+='</td></tr>'});h+='</tbody></table>';el.innerHTML=h}catch(e){el.innerHTML='<div class="empty"><p style="color:var(--danger)">Error: '+esc(e.message)+'</p></div>'}}
async function addAdminUser(){var email=document.getElementById('adm-email').value.trim().toLowerCase(),name=document.getElementById('adm-name').value.trim(),role=document.getElementById('adm-role').value,msg=document.getElementById('adm-msg');if(!email){showMsg(msg,'error','Enter an email');return}if(!name){showMsg(msg,'error','Enter a name');return}try{var dup=await proxyFrom('admin_users').select('id').eq('email',email).maybeSingle();if(dup.data){showMsg(msg,'error','Admin already exists');return}var perms=getDefaultPerms(role);var ins=Object.assign({email:email,name:name,role:role,is_active:true},perms);var res=await proxyFrom('admin_users').insert(ins);if(res.error)throw res.error;await logAudit('add_admin',email,'Added as '+role);showMsg(msg,'success','✓ '+name+' added as '+role);document.getElementById('adm-email').value='';document.getElementById('adm-name').value='';loadAdminUsers()}catch(e){showMsg(msg,'error','Error: '+e.message)}}
function getDefaultPerms(role){if(role==='super_admin')return{can_customers:true,can_email:true,can_promotions:true,can_orders:true,can_community:true,can_analytics:true,can_suggestions:true,can_automation:true,can_audit:true,can_system:true,can_refund:true,can_delete:true};if(role==='admin')return{can_customers:true,can_email:true,can_promotions:true,can_orders:true,can_community:true,can_analytics:true,can_suggestions:true,can_automation:true,can_audit:true,can_system:false,can_refund:true,can_delete:false};return{can_customers:true,can_email:true,can_promotions:false,can_orders:true,can_community:true,can_analytics:false,can_suggestions:true,can_automation:false,can_audit:false,can_system:false,can_refund:false,can_delete:false}}
async function editAdminUser(id){var a=adminUsersData.find(function(x){return x.id===id});if(!a)return;var overlay=document.createElement('div');overlay.className='modal-overlay';var permChecks='';var permKeys=[{k:'can_customers',l:'Customers'},{k:'can_email',l:'Email'},{k:'can_promotions',l:'Promotions'},{k:'can_orders',l:'Orders'},{k:'can_community',l:'Community'},{k:'can_analytics',l:'Analytics'},{k:'can_suggestions',l:'Suggestions'},{k:'can_automation',l:'Automation'},{k:'can_audit',l:'Audit Log'},{k:'can_system',l:'System'},{k:'can_refund',l:'Refunds'},{k:'can_delete',l:'Delete'}];permKeys.forEach(function(pk){permChecks+='<label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer"><input type="checkbox" id="ep-'+pk.k+'" '+(a[pk.k]?'checked':'')+'>'+pk.l+'</label>'});overlay.innerHTML='<div class="modal-box" style="max-width:480px"><div class="modal-title">Edit Admin: '+esc(a.name)+'</div><div style="margin-bottom:14px"><label class="label-sm">Role</label><select class="input" id="ep-role"><option value="assistant"'+(a.role==='assistant'?' selected':'')+'>Assistant</option><option value="admin"'+(a.role==='admin'?' selected':'')+'>Admin</option><option value="super_admin"'+(a.role==='super_admin'?' selected':'')+'>Super Admin</option></select></div><div style="margin-bottom:14px"><label class="label-sm">Name</label><input class="input" id="ep-name" value="'+esc(a.name)+'"></div><div style="margin-bottom:18px"><label class="label-sm" style="margin-bottom:8px;display:block">Permissions</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 16px">'+permChecks+'</div></div><div class="modal-actions"><button class="btn btn-ghost btn-sm" onclick="this.closest(\'.modal-overlay\').remove()">Cancel</button><button class="btn btn-primary btn-sm" onclick="saveAdminEdit(\''+id+'\')">Save</button></div></div>';document.body.appendChild(overlay);overlay.onclick=function(e){if(e.target===overlay)overlay.remove()};var roleSelect=document.getElementById('ep-role');roleSelect.onchange=function(){var r=roleSelect.value;var dp=getDefaultPerms(r);permKeys.forEach(function(pk){document.getElementById('ep-'+pk.k).checked=dp[pk.k]})}}
async function saveAdminEdit(id){var role=document.getElementById('ep-role').value,name=document.getElementById('ep-name').value.trim();var update={role:role,name:name,updated_at:new Date().toISOString()};['can_customers','can_email','can_promotions','can_orders','can_community','can_analytics','can_suggestions','can_automation','can_audit','can_system','can_refund','can_delete'].forEach(function(k){update[k]=document.getElementById('ep-'+k).checked});try{var res=await proxyFrom('admin_users').update(update).eq('id',id);if(res.error)throw res.error;await logAudit('edit_admin',null,'Edited admin user: '+name+' ('+role+')',{admin_id:id});document.querySelector('.modal-overlay').remove();loadAdminUsers();showToast('Admin updated','success')}catch(e){showToast('Error: '+e.message,'error')}}
async function toggleAdminActive(id,active){var a=adminUsersData.find(function(x){return x.id===id});var action=active?'enable':'disable';if(!await qpConfirm('Confirm',action.charAt(0).toUpperCase()+action.slice(1)+' admin account for '+(a?a.email:'this user')+'?',{danger:!active,okText:action.charAt(0).toUpperCase()+action.slice(1)}))return;try{await proxyFrom('admin_users').update({is_active:active,updated_at:new Date().toISOString()}).eq('id',id);await logAudit(action+'_admin',a?a.email:null,(active?'Enabled':'Disabled')+' admin account');loadAdminUsers();showToast('Admin '+(active?'enabled':'disabled'),'success')}catch(e){showToast('Error: '+e.message,'error')}}


var auditACF=[],auditACI=0,ordersACF=[],ordersACI=0;
function handleAuditAC(){var q=document.getElementById('audit-search').value.trim().toLowerCase(),dd=document.getElementById('audit-ac');if(q.length<2){dd.classList.remove('open');loadAuditLog();return}auditACF=allCustomers.filter(function(c){return c.email.toLowerCase().indexOf(q)>=0||(c.name&&c.name.toLowerCase().indexOf(q)>=0)}).slice(0,8);if(!auditACF.length){dd.classList.remove('open');loadAuditLog();return}auditACI=0;renderAuditAC(q);dd.classList.add('open')}
function renderAuditAC(q){var dd=document.getElementById('audit-ac');var re=new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');dd.innerHTML=auditACF.map(function(c,i){return'<div class="ac-item '+(i===auditACI?'sel':'')+'" onclick="selAuditAC('+i+')"><span class="ac-email">'+c.email.replace(re,'<span class="ac-hl">$1</span>')+'</span>'+(c.name?'<span class="ac-name">'+esc(c.name)+'</span>':'')+'</div>'}).join('')}
function handleAuditKeydown(e){var dd=document.getElementById('audit-ac');if(!dd.classList.contains('open')){if(e.key==='Enter')loadAuditLog();return}if(e.key==='ArrowDown'){e.preventDefault();auditACI=Math.min(auditACI+1,auditACF.length-1);renderAuditAC(document.getElementById('audit-search').value.trim().toLowerCase())}if(e.key==='ArrowUp'){e.preventDefault();auditACI=Math.max(auditACI-1,0);renderAuditAC(document.getElementById('audit-search').value.trim().toLowerCase())}if(e.key==='Enter'){e.preventDefault();selAuditAC(auditACI)}if(e.key==='Escape')dd.classList.remove('open')}
function selAuditAC(i){var c=auditACF[i];if(c){document.getElementById('audit-search').value=c.email;document.getElementById('audit-ac').classList.remove('open');loadAuditLog()}}
function handleOrdersAC(){var q=document.getElementById('orders-search').value.trim().toLowerCase(),dd=document.getElementById('orders-ac');if(q.length<2){dd.classList.remove('open');filterOrders();return}ordersACF=allCustomers.filter(function(c){return c.email.toLowerCase().indexOf(q)>=0||(c.name&&c.name.toLowerCase().indexOf(q)>=0)}).slice(0,8);if(!ordersACF.length){dd.classList.remove('open');filterOrders();return}ordersACI=0;renderOrdersAC(q);dd.classList.add('open')}
function renderOrdersAC(q){var dd=document.getElementById('orders-ac');var re=new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');dd.innerHTML=ordersACF.map(function(c,i){return'<div class="ac-item '+(i===ordersACI?'sel':'')+'" onclick="selOrdersAC('+i+')"><span class="ac-email">'+c.email.replace(re,'<span class="ac-hl">$1</span>')+'</span>'+(c.name?'<span class="ac-name">'+esc(c.name)+'</span>':'')+'</div>'}).join('')}
function handleOrdersKeydown(e){var dd=document.getElementById('orders-ac');if(!dd.classList.contains('open')){if(e.key==='Enter')filterOrders();return}if(e.key==='ArrowDown'){e.preventDefault();ordersACI=Math.min(ordersACI+1,ordersACF.length-1);renderOrdersAC(document.getElementById('orders-search').value.trim().toLowerCase())}if(e.key==='ArrowUp'){e.preventDefault();ordersACI=Math.max(ordersACI-1,0);renderOrdersAC(document.getElementById('orders-search').value.trim().toLowerCase())}if(e.key==='Enter'){e.preventDefault();selOrdersAC(ordersACI)}if(e.key==='Escape')dd.classList.remove('open')}
function selOrdersAC(i){var c=ordersACF[i];if(c){document.getElementById('orders-search').value=c.email;document.getElementById('orders-ac').classList.remove('open');filterOrders()}}

function clSvg(name,col){var p={'link':'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>','users':'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>','calendar':'<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>','star':'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>','zap':'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>','grad':'<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>','key':'<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>'};var d=p[name]||'<circle cx="12" cy="12" r="10"/>';return '<svg viewBox="0 0 24 24" fill="none" stroke="'+(col||'currentColor')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px">'+d+'</svg>'}
var cardLibraryTemplates=[
{name:"Referral Invite",icon:"link",desc:"Invite friends & earn credits",body:"**Share the Healing Journey**\n\nKnow someone who could benefit? Share your personal referral link and earn credits toward future sessions.\n\nYour link: **https://fusionsessions.com/?ref={{referral_code}}**\n\n{{qr_code}}\n\nCredits work like cash toward any session or course"},
{name:"Community Invite",icon:"users",desc:"Join the discussion forum",body:"**Join Our Healing Community**\n\nConnect with fellow members, share insights, and get support on your wellness journey.\n\nOur community is a safe space for growth, questions, and celebration."},
{name:"Upcoming Session",icon:"calendar",desc:"Highlight next session",body:"**Your Next Session Is Coming Up**\n\nDo not miss our upcoming quantum healing session with Dr. Tracey Clark.\n\nMark your calendar and prepare to go deeper into your healing journey."},
{name:"Testimonial",icon:"star",desc:"Social proof quote block",body:"**What Members Are Saying**\n\nThis program has completely transformed how I approach my health and wellbeing. The sessions are profound. — Community Member"},
{name:"Bold CTA",icon:"zap",desc:"Strong call to action",body:"**Ready to Take the Next Step?**\n\nYour transformation is waiting. Whether you are continuing your journey or just beginning, now is the perfect time."},
{name:"Academy Promo",icon:"grad",desc:"Promote a course",body:"**Level Up Your Knowledge**\n\nExplore our self-paced courses designed to deepen your understanding of quantum healing principles.\n\nLearn at your own pace, on your own schedule."},
{name:"QR Code Only",icon:"key",desc:"Scannable referral QR",body:"**Scan & Share**\n\nShare your personal referral link with anyone — they scan, you earn credits.\n\n{{qr_code}}"},
{name:"Purchase Confirmation",icon:"check",desc:"Recovery how-to instructions",body:"**How to access your content:**\n\n**1.** Visit **fusionsessions.com** and click \"Log In\"\n**2.** Create an account using **{{email}}** (the email you purchased with)\n**3.** Go to your **Dashboard** — your purchased content will be waiting\n**4.** Click on your session to begin your healing journey"},
{name:"Getting Started Tips",icon:"lightbulb",desc:"Quick tips for new customers",body:"**Quick tips to get started:**\n\n• Make sure you sign up with the **exact email** shown above\n• Check your spam folder for the account verification email\n• Once logged in, your sessions appear on your **Dashboard**\n• Sessions are available to watch anytime, on any device\n\nHave questions? Reply to this email anytime."},
{name:"Session Product",icon:"play_circle",desc:"Individual session with image",body:"{{session_image:session-01}}\n\n**Session 1: Opening & Orientation**\n\nYour session is ready to watch. Log in to your Dashboard to begin your healing journey."},
{name:"Bundle Product",icon:"library_books",desc:"Full bundle with all 12 sessions",body:"{{session_image:bundle-all}}\n\n**The Complete Fusion Bundle**\n\nAll 12 healing sessions are now available in your Dashboard. Start with Session 1 and work through them at your own pace."}
];
function openCardLibrary(){
var existing=document.getElementById("card-library-panel");
if(existing){existing.remove();return}
var panel=document.createElement("div");
panel.id="card-library-panel";
panel.style.cssText="background:var(--navy-deep,#071825);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px;";
var h="<div style=\"display:flex;align-items:center;justify-content:space-between;margin-bottom:12px\"><span style=\"font-size:13px;font-weight:600;color:var(--text)\">Card Library</span><button class=\"btn btn-ghost btn-sm\" style=\"font-size:11px;padding:2px 8px\" onclick=\"document.getElementById('card-library-panel').remove()\">Close</button></div>";
h+="<div style=\"display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px\">";
cardLibraryTemplates.forEach(function(card,i){
var iconSvg=clSvg(card.icon,"var(--teal)");
h+="<div onclick=\"insertLibraryCard("+i+")\" style=\"cursor:pointer;background:var(--navy-card);border:1px solid var(--border);border-radius:10px;padding:12px;transition:all .2s;display:flex;flex-direction:column;gap:6px\" onmouseover=\"this.style.borderColor='var(--teal)';this.style.transform='translateY(-1px)'\" onmouseout=\"this.style.borderColor='var(--border)';this.style.transform='none'\">";
h+="<div style=\"display:flex;align-items:center;gap:6px\"><span style=\"width:24px;height:24px;display:flex;align-items:center;justify-content:center;background:rgba(91,168,178,.12);border-radius:6px\">"+iconSvg+"</span><span style=\"font-size:12px;font-weight:600;color:var(--text)\">"+card.name+"</span></div>";
h+="<span style=\"font-size:11px;color:var(--text-dim);line-height:1.3\">"+card.desc+"</span>";
h+="</div>";
});
h+="</div>";
panel.innerHTML=h;
var previewArea=document.getElementById("sg-preview-area");
if(previewArea)previewArea.parentNode.insertBefore(panel,previewArea);
}
function insertLibraryCard(index){
var card=cardLibraryTemplates[index];
if(!card)return;
var textarea=document.getElementById("sg-body");
if(!textarea)return;
var body=textarea.value.trimEnd();
textarea.value=body+"\n---\n"+card.body;
textarea.scrollTop=textarea.scrollHeight;
sgAutoPreview();
sgUpdateSectionControls();
showToast("Added: "+card.name,"success");
}

/* ================================================================
   EMAIL CENTER BRIDGE
   Ports sgSetupEmail popup features into the inline Email Center:
   - Cursor-position merge tag insert
   - Card Library (reuses cardLibraryTemplates)
   - Drag-to-reorder card pills
   - Live preview
   - Discount block insert
   ================================================================ */

function ecInsertVar(v){
  var ta=document.getElementById('email-body');if(!ta)return;
  var s=ta.selectionStart,en=ta.selectionEnd,t=ta.value;
  ta.value=t.substring(0,s)+v+t.substring(en);
  ta.focus();ta.selectionStart=ta.selectionEnd=s+v.length;
  ecAutoPreview();
}

var _ecPreviewTimer=null;
function ecAutoPreview(){
  ecUpdateSectionControls();
  clearTimeout(_ecPreviewTimer);
  _ecPreviewTimer=setTimeout(function(){ecPreview();ecUpdateSectionControls()},800);
}

function ecUpdateSectionControls(){
  var textarea=document.getElementById('email-body');
  var ctrl=document.getElementById('ec-section-controls');
  if(!textarea||!ctrl)return;
  var parts=textarea.value.split('\n---\n');
  if(parts.length<2){ctrl.style.display='none';return}
  ctrl.style.display='block';
  var pills=document.getElementById('ec-card-pills');
  if(!pills)return;
  var h='';
  for(var i=1;i<parts.length;i++){
    var label=sgCardLabel(parts[i]);
    h+='<div draggable="true" data-idx="'+i+'" ondragstart="sgStartDrag(event)" ondragover="sgOverDrag(event)" ondragleave="sgLeaveDrag(event)" ondrop="ecDropCard(event)" style="display:inline-flex;align-items:center;gap:4px;background:var(--navy-card);border:1px solid var(--border);border-radius:8px;padding:4px 8px 4px 10px;font-size:11px;color:var(--text);cursor:grab;user-select:none;transition:border-color .2s"><span style="opacity:.4;font-size:10px;margin-right:2px">\u2630</span>'+label+'<button onclick="ecDeleteCard('+i+')" style="background:none;border:none;color:var(--text-dim);cursor:pointer;padding:0 0 0 4px;font-size:14px;line-height:1;opacity:.5" onmouseover="this.style.opacity=1;this.style.color=\'#ff4d6a\'" onmouseout="this.style.opacity=.5;this.style.color=\'var(--text-dim)\'" title="Remove card">&times;</button></div>';
  }
  pills.innerHTML=h;
}

function ecDeleteCard(idx){
  var textarea=document.getElementById('email-body');if(!textarea)return;
  var parts=textarea.value.split('\n---\n');
  if(idx<1||idx>=parts.length)return;
  parts.splice(idx,1);
  textarea.value=parts.join('\n---\n');
  ecAutoPreview();showToast('Card removed','success');
}

function ecDropCard(e){
  e.preventDefault();
  e.currentTarget.style.borderColor='var(--border)';
  var to=parseInt(e.currentTarget.getAttribute('data-idx'));
  if(sgDragFrom===null||sgDragFrom===to)return;
  var textarea=document.getElementById('email-body');if(!textarea)return;
  var parts=textarea.value.split('\n---\n');
  var cards=parts.slice(1);
  var moved=cards.splice(sgDragFrom-1,1)[0];
  cards.splice(to-1,0,moved);
  textarea.value=parts[0]+'\n---\n'+cards.join('\n---\n');
  sgDragFrom=null;
  ecAutoPreview();showToast('Cards reordered','success');
}

function ecGetBrand(){
  var sel=document.getElementById('email-brand-select');
  return sel?sel.value:'fusion';
}

function ecBuildHtml(bodyText){
  var brand=ecGetBrand();
  var discCfg=null;
  var discTog=document.getElementById('discount-toggle');
  if(discTog&&discTog.checked){
    var code=document.getElementById('discount-promo-select').value||document.getElementById('discount-promo-custom').value;
    if(code){
      var promo=promotionsData.find(function(p){return p.coupon_id===code});
      if(promo)discCfg={couponId:code,percent:promo.discount_percent||0,product:promo.applies_to||'any'};
    }
  }
  if(!discCfg){
    var dm=bodyText.match(/\[PROMO:([^\]]+)\]/);
    if(dm){var mp=promotionsData.find(function(p){return p.coupon_id===dm[1]});
    if(mp)discCfg={couponId:dm[1],percent:mp.discount_percent||0,product:mp.applies_to||'any'}}
  }
  var siteUrl=brand==='academy'?'https://academy.quantumphysician.com':'https://fusionsessions.com';
  return brand==='academy'?buildAcademyEmail(bodyText,null,siteUrl,discCfg):buildRichEmail(bodyText,null,siteUrl,discCfg);
}

function ecPreview(){
  var subject=document.getElementById('email-subject').value;
  var body=document.getElementById('email-body').value;
  var from=document.getElementById('email-from').value;
  if(!body)return;
  var pb=body.replace(/\{\{name\}\}/g,'Friend').replace(/\{\{email\}\}/g,'preview@example.com').replace(/\{\{referral_code\}\}/g,'XXXXXX');
  var richHtml=ecBuildHtml(pb);
  richHtml=richHtml.replace(/REFCODE/g,'XXXXXX');
  var area=document.getElementById('ec-preview-area');
  if(!area)return;
  area.innerHTML='<div style="border-top:2px solid rgba(91,168,178,.3);padding-top:14px"><div style="font-size:12px;color:var(--text-muted);margin-bottom:8px"><strong>From:</strong> '+esc(from)+' &nbsp; <strong>Subject:</strong> <span style="color:var(--teal)">'+esc(subject||'(no subject)')+'</span> <button class="btn btn-ghost btn-sm" style="font-size:10px;margin-left:8px" onclick="document.getElementById(\'ec-preview-area\').innerHTML=\'\'">Close Preview</button></div><iframe id="ec-preview-iframe" style="width:100%;min-height:500px;border:none;border-radius:8px;background:#1a1a2e"></iframe></div>';
  var fr=document.getElementById('ec-preview-iframe');
  var iDoc=fr.contentDocument||fr.contentWindow.document;
  iDoc.open();iDoc.write(richHtml);iDoc.close();
  setTimeout(function(){try{fr.style.height=Math.max(500,iDoc.body.scrollHeight+20)+'px'}catch(e){}},400);
}

function ecOpenCardLibrary(){
  var existing=document.getElementById('ec-card-library-panel');
  if(existing){existing.remove();return}
  var panel=document.createElement('div');
  panel.id='ec-card-library-panel';
  panel.style.cssText='background:var(--navy-deep,#071825);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px;';
  var h='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><span style="font-size:13px;font-weight:600;color:var(--text)">Card Library</span><button class="btn btn-ghost btn-sm" style="font-size:11px;padding:2px 8px" onclick="document.getElementById(\'ec-card-library-panel\').remove()">Close</button></div>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px">';
  cardLibraryTemplates.forEach(function(card,i){
    var iconSvg=clSvg(card.icon,'var(--teal)');
    h+='<div onclick="ecInsertLibraryCard('+i+')" style="cursor:pointer;background:var(--navy-card);border:1px solid var(--border);border-radius:10px;padding:12px;transition:all .2s;display:flex;flex-direction:column;gap:6px" onmouseover="this.style.borderColor=\'var(--teal)\';this.style.transform=\'translateY(-1px)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.transform=\'none\'">';
    h+='<div style="display:flex;align-items:center;gap:6px"><span style="width:24px;height:24px;display:flex;align-items:center;justify-content:center;background:rgba(91,168,178,.12);border-radius:6px">'+iconSvg+'</span><span style="font-size:12px;font-weight:600;color:var(--text)">'+card.name+'</span></div>';
    h+='<span style="font-size:11px;color:var(--text-dim);line-height:1.3">'+card.desc+'</span>';
    h+='</div>';
  });
  h+='</div>';
  panel.innerHTML=h;
  var slot=document.getElementById('ec-card-library-slot');
  if(slot)slot.appendChild(panel);
}

function ecInsertLibraryCard(index){
  var card=cardLibraryTemplates[index];if(!card)return;
  var textarea=document.getElementById('email-body');if(!textarea)return;
  var body=textarea.value.trimEnd();
  textarea.value=body+'\n---\n'+card.body;
  textarea.scrollTop=textarea.scrollHeight;
  ecAutoPreview();showToast('Added: '+card.name,'success');
}

function ecInsertDiscountBlock(){
  var code=document.getElementById('discount-promo-select').value||document.getElementById('discount-promo-custom').value;
  if(!code){showToast('Select or enter a promo code first','error');return}
  var promo=promotionsData.find(function(p){return p.coupon_id===code});
  var discLabel=code;
  if(promo){
    if(promo.discount_type==='percent')discLabel=(promo.discount_percent||0)+'% off';
    else if(promo.discount_type==='fixed')discLabel='$'+(promo.discount_fixed||0)+' off';
    else if(promo.discount_type==='set_price')discLabel='Only $'+(promo.discount_set_price||0);
  }
  var textarea=document.getElementById('email-body');if(!textarea)return;
  /* Strip existing discount section if present */
  var body=textarea.value;
  var parts=body.split('\n---\n');
  var kept=[parts[0]];var removed=false;
  for(var i=1;i<parts.length;i++){
    if(!removed&&parts[i].match(/Limited Time:/i)){removed=true}else{kept.push(parts[i])}
  }
  body=kept.join('\n---\n');
  var discSection='\n---\n**Limited Time: '+discLabel+'**\n\nYour code: **'+code+'**\nYour discount applies automatically at checkout';
  textarea.value=body.trimEnd()+discSection;
  textarea.scrollTop=textarea.scrollHeight;
  ecAutoPreview();showToast('Discount card added: '+code,'success');
}

/* Also update the existing previewEmail to use live preview */
var _origPreviewEmail=typeof previewEmail==='function'?previewEmail:null;
function previewEmail(){ecPreview()}
