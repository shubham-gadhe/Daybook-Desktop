(function(){
'use strict';

var $=function(s){return document.querySelector(s)};
var pad=function(n){return String(n).padStart(2,'0')};
var ymd=function(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
var parse=function(s){var p=s.split('-').map(Number);return new Date(p[0],p[1]-1,p[2])};
var addDays=function(s,n){var d=parse(s);d.setDate(d.getDate()+n);return ymd(d)};
var todayStr=function(){return ymd(new Date())};
var nowHM=function(){var d=new Date();return pad(d.getHours())+':'+pad(d.getMinutes())};
var LOC='en-IN';
var fmtLong=function(s,o){return parse(s).toLocaleDateString(LOC,o)};

// Method Name: fmtTime
// Description: Converts 24-hour time into 12-hour time.
function fmtTime(hm){if(!hm)return'';var p=hm.split(':').map(Number);return (p[0]%12||12)+':'+pad(p[1])+' '+(p[0]<12?'AM':'PM')}

// Method Name: relDay
// Description: Returns a readable name for a date.
function relDay(s){var t=todayStr();if(s===t)return'Today';if(s===addDays(t,1))return'Tomorrow';if(s===addDays(t,-1))return'Yesterday';return fmtLong(s,{weekday:'short',day:'numeric',month:'short'})}

// Method Name: relMins
// Description: Converts reminder time into minutes or hours.
function relMins(ms){var m=Math.max(0,Math.round(ms/60000));if(m<60)return m+' min';var h=Math.floor(m/60);return h+' h'+(m%60?' '+(m%60)+' min':'')}

var ICONS={
  check:'<path d="M20 6L9 17l-5-5"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>',
  trash:'<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/>',
  left:'<path d="M15 18l-6-6 6-6"/>',
  right:'<path d="M9 18l6-6-6-6"/>',
  bell:'<path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  x:'<path d="M18 6L6 18M6 6l12 12"/>',
  book:'<path d="M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4z"/><path d="M8 4v16"/>'
};

// Method Name: ico
// Description: Creates an icon element.
function ico(n){
  var s=document.createElement('span');
  s.className='ico';
  s.setAttribute('aria-hidden','true');
  s.innerHTML='<svg viewBox="0 0 24 24">'+ICONS[n]+'</svg>';
  return s;
}

// Method Name: h
// Description: Creates an HTML element and adds its attributes and children.
function h(tag,attrs){
  var e=document.createElement(tag);
  if(attrs)for(var k in attrs){
    var v=attrs[k];
    if(v==null||v===false)continue;
    if(k==='class')e.className=v;
    else if(k==='text')e.textContent=v;
    else if(k.slice(0,2)==='on')e.addEventListener(k.slice(2),v);
    else if(v===true)e.setAttribute(k,'');
    else e.setAttribute(k,v);
  }
  for(var i=2;i<arguments.length;i++){
    var c=arguments[i];
    if(Array.isArray(c)){
      c.forEach(function(x){
        if(x!=null&&x!==false)e.append(x.nodeType?x:document.createTextNode(x));
      });
    }else if(c!=null&&c!==false){
      e.append(c.nodeType?c:document.createTextNode(c));
    }
  }
  return e;
}

// Store the current planner data and settings.
var S={
  tasks:new Map(),mode:'boot',col:null,sel:todayStr(),tab:'plan',
  filter:'all',range:14,hfilter:'all',editing:null,
  notified:new Set(),snooze:new Map(),chains:{},seeded:false
};

// Method Name: seed
// Description: Creates sample tasks for the planner.
function seed(){
  var T=todayStr();
  var rows=[
   [-6,'Revise DBMS normalization notes','18:00','high','Study',1],
   [-6,'Morning walk','06:30','low','Health',1],
   [-6,'Recharge mobile plan','','med','Personal',1],
   [-5,'Finish Java lab record','16:00','high','Study',1],
   [-5,'Gym session','07:00','med','Health',1],
   [-5,'Laundry','','low','Personal',0],
   [-4,'Aptitude practice set','19:00','med','Study',1],
   [-4,'Email project mentor','11:00','med','Work',1],
   [-4,'Grocery run','18:30','low','Personal',0],
   [-3,'Mock interview prep','17:00','high','Work',1],
   [-3,'Gym session','07:00','med','Health',1],
   [-3,'Morning walk','06:30','low','Health',1],
   [-2,'Operating systems assignment','15:00','high','Study',0],
   [-2,'Update resume','20:00','med','Work',1],
   [-1,'Morning walk','06:30','low','Health',1],
   [-1,'Read networking chapter 4','19:30','med','Study',1],
   [-1,'Pay credit card bill','','high','Personal',1],
   [-1,'Water the plants','','low','Personal',0],
   [0,'Morning walk','06:30','low','Health',1],
   [0,'Revise OS scheduling notes','10:00','high','Study',0],
   [0,'Team stand-up','11:30','med','Work',0],
   [0,'Gym session','18:00','med','Health',0],
   [0,'Pay electricity bill','','med','Personal',0],
   [1,'Submit Java lab record','10:00','high','Study',0],
   [1,'Call home','20:00','low','Personal',0],
   [2,'Dentist appointment','17:00','med','Health',0]
  ];
  return rows.map(function(r,i){
    var date=addDays(T,r[0]),done=!!r[5];
    return ['s_'+i,{
      title:r[1],note:'',date:date,time:r[2],remind:10,
      prio:r[3],cat:r[4],done:done,
      doneAt:done?parse(date).toISOString():null,
      createdAt:'2000-01-01T00:00:'+pad(i),sample:true
    }];
  });
}

// Method Name: clean
// Description: Copies task data without undefined values.
function clean(t){
  var o={};
  for(var k in t)if(t[k]!==undefined)o[k]=t[k];
  return o;
}

// Method Name: queue
// Description: Runs save operations one after another.
function queue(id,fn){
  S.chains[id]=(S.chains[id]||Promise.resolve()).then(fn).catch(function(){
    toast({title:'Could not save',body:'Check your connection. Your latest change may not be stored.'});
  });
}

// Method Name: saveLocal
// Description: Saves all tasks in browser local storage.
function saveLocal(){
  try{localStorage.setItem('daybook.v1',JSON.stringify(Array.from(S.tasks.entries())))}catch(e){}
}

// Method Name: loadLocal
// Description: Loads saved tasks from browser local storage.
function loadLocal(){
  try{
    var r=localStorage.getItem('daybook.v1');
    return r?JSON.parse(r):null;
  }catch(e){return null}
}

// Method Name: persist
// Description: Saves one task when cloud storage is enabled.
function persist(id){
  var t=S.tasks.get(id);
  if(!t)return;
  if(S.mode==='cloud')queue(id,function(){return S.col.doc(id).set(clean(t))});
  else if(S.mode==='local')saveLocal();
}

// Method Name: persistDelete
// Description: Removes a task from saved data.
function persistDelete(id){
  if(S.mode==='cloud')queue(id,function(){return S.col.doc(id).delete()});
  else if(S.mode==='local')saveLocal();
}

// Method Name: newId
// Description: Creates a unique ID for a task.
function newId(){return 't_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}

// Method Name: loadNotified
// Description: Loads reminders that have already been shown.
function loadNotified(){
  try{
    var a=JSON.parse(localStorage.getItem('daybook.notified')||'[]');
    a.forEach(function(k){S.notified.add(k)});
  }catch(e){}
}

// Method Name: saveNotified
// Description: Saves the reminders that were already shown.
function saveNotified(){
  try{
    var t=todayStr();
    var a=Array.from(S.notified).filter(function(k){return k.split('|')[1]>=addDays(t,-1)});
    localStorage.setItem('daybook.notified',JSON.stringify(a));
  }catch(e){}
}

/* ---------- queries ---------- */

// Method Name: byTime
// Description: Sorts tasks by time and creation date.
function byTime(a,b){
  return (a[1].time||'99:99').localeCompare(b[1].time||'99:99')||
    (a[1].createdAt||'').localeCompare(b[1].createdAt||'');
}

// Method Name: tasksOn
// Description: Returns all tasks for the selected date.
function tasksOn(d){
  return Array.from(S.tasks).filter(function(e){return e[1].date===d}).sort(byTime);
}

// Method Name: dayStat
// Description: Returns the total and completed task count for a date.
function dayStat(d){
  var ts=tasksOn(d);
  return {d:d,total:ts.length,done:ts.filter(function(e){return e[1].done}).length};
}

/* ---------- actions ---------- */

// Method Name: toggle
// Description: Marks a task as completed or incomplete.
function toggle(id){
  var t=S.tasks.get(id);
  if(!t)return;
  S.tasks.set(id,Object.assign({},t,{
    done:!t.done,
    doneAt:!t.done?new Date().toISOString():null
  }));
  persist(id);
  renderAll();
}

// Method Name: removeTask
// Description: Deletes a task from the planner.
function removeTask(id){
  var t=S.tasks.get(id);
  if(!t)return;
  S.tasks.delete(id);
  persistDelete(id);
  if(S.editing===id)resetComposer();
  renderAll();
  toast({
    title:'Task deleted',body:t.title,ttl:6000,
    actions:[{label:'Undo',fn:function(){
      S.tasks.set(id,t);
      persist(id);
      renderAll();
    }}]
  });
}

// Method Name: moveToToday
// Description: Moves selected tasks to today.
function moveToToday(ids){
  var t0=todayStr();
  ids.forEach(function(id){
    var t=S.tasks.get(id);
    if(t){
      S.tasks.set(id,Object.assign({},t,{date:t0}));
      persist(id);
    }
  });
  renderAll();
  toast({title:ids.length>1?ids.length+' tasks moved to today':'Moved to today',ttl:3000});
}

// Method Name: clearSamples
// Description: Removes sample tasks from the planner.
function clearSamples(){
  Array.from(S.tasks).forEach(function(e){
    if(e[1].sample){
      S.tasks.delete(e[0]);
      persistDelete(e[0]);
    }
  });
  renderAll();
  toast({title:'Sample tasks cleared',ttl:3000});
}

/* ---------- composer ---------- */
var F={
  title:$('#f-title'),date:$('#f-date'),time:$('#f-time'),
  remind:$('#f-remind'),prio:$('#f-prio'),cat:$('#f-cat'),note:$('#f-note')
};

// Method Name: resetComposer
// Description: Clears the task form and restores its default values.
function resetComposer(){
  S.editing=null;
  F.title.value='';
  F.time.value='';
  F.note.value='';
  F.remind.value='10';
  F.prio.value='med';
  F.cat.value='';
  F.date.value=S.sel;
  $('#f-submit').textContent='Add task';
  $('#editbar').hidden=true;
}

// Method Name: startEdit
// Description: Loads an existing task into the edit form.
function startEdit(id){
  var t=S.tasks.get(id);
  if(!t)return;
  S.editing=id;
  F.title.value=t.title;
  F.date.value=t.date;
  F.time.value=t.time||'';
  F.note.value=t.note||'';
  F.remind.value=String(t.remind==null||t.remind<0?(t.time?-1:10):t.remind);
  F.prio.value=t.prio||'med';
  F.cat.value=t.cat||'';
  $('#f-submit').textContent='Save changes';
  $('#editbar').hidden=false;
  F.title.focus();
  $('#composer').scrollIntoView({behavior:'smooth',block:'center'});
}

$('#composer').addEventListener('submit',function(e){
  e.preventDefault();
  var title=F.title.value.trim();
  if(!title){
    F.title.focus();
    toast({title:'Add a title first',body:'Type what needs doing, then press Enter.',ttl:2500});
    return;
  }

  var date=F.date.value||S.sel,time=F.time.value;
  var base={
    title:title,note:F.note.value.trim(),date:date,time:time,
    remind:time?parseInt(F.remind.value,10):-1,
    prio:F.prio.value,cat:F.cat.value
  };
  var id,t;

  if(S.editing&&S.tasks.get(S.editing)){
    id=S.editing;
    t=Object.assign({},S.tasks.get(S.editing),base,{sample:false});
  }else{
    id=newId();
    t=Object.assign({},base,{
      done:false,doneAt:null,createdAt:new Date().toISOString(),sample:false
    });
  }

  var wasEdit=!!S.editing;
  S.tasks.set(id,t);
  persist(id);
  S.sel=date;
  resetComposer();
  renderAll();
  F.title.focus();
  toast({
    title:wasEdit?'Task updated':'Task added',
    body:relDay(date)+(time?' at '+fmtTime(time):''),
    ttl:2500
  });
});

$('#f-cancel').addEventListener('click',resetComposer);
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&S.editing)resetComposer();
});

/* ---------- rendering ---------- */

// Method Name: seg
// Description: Builds a group of selectable buttons.
function seg(box,opts,cur,fn){
  box.replaceChildren.apply(box,opts.map(function(o){
    return h('button',{
      type:'button',
      'aria-pressed':String(o[0]===cur),
      onclick:function(){fn(o[0])}
    },o[1]);
  }));
}

// Method Name: chip
// Description: Creates a small label for task information.
function chip(cls,text,icon){
  return h('span',{class:'chip '+cls},icon?ico(icon):null,text);
}

// Method Name: taskRow
// Description: Builds the task row displayed in the list.
function taskRow(id,t,o){
  o=o||{};
  var today=todayStr();
  var overdue=!t.done&&t.date<today;
  var late=!t.done&&t.date===today&&t.time&&t.time<nowHM();

  var meta=h('div',{class:'meta'},
    o.showDate?chip('',fmtLong(t.date,{weekday:'short',day:'numeric',month:'short'}),'cal'):null,
    t.time?chip('time'+(late?' bad':''),fmtTime(t.time),'clock'):null,
    t.done?chip('good','Done'):null,
    overdue?chip('bad','Overdue'):null,
    t.prio==='high'&&!t.done?chip('high','High priority'):null,
    t.cat?chip('',t.cat):null,
    (t.time&&t.remind>=0&&!t.done&&!t.sample)?
      h('span',{class:'chip',title:'Reminder set'},ico('bell'),t.remind===0?'At start':t.remind+' min before'):null
  );

  var chk=h('button',{
    class:'check',type:'button',role:'checkbox',
    'aria-checked':String(!!t.done),
    'aria-label':(t.done?'Mark as not done: ':'Mark as done: ')+t.title,
    onclick:function(){toggle(id)}
  },ico('check'));

  var acts=h('div',{class:'tactions'},
    (overdue&&o.move)?h('button',{
      class:'btn small ghost',type:'button',
      onclick:function(){moveToToday([id])}
    },'Move to today'):null,
    h('button',{
      class:'iconbtn',type:'button','aria-label':'Edit '+t.title,
      onclick:function(){startEdit(id)}
    },ico('edit')),
    h('button',{
      class:'iconbtn danger',type:'button','aria-label':'Delete '+t.title,
      onclick:function(){removeTask(id)}
    },ico('trash'))
  );

  return h('li',{class:'task'+(t.done?' is-done':'')},chk,
    h('div',{class:'tbody'},
      h('div',{class:'ttitle',text:t.title}),
      t.note?h('div',{class:'tnote',text:t.note}):null,
      meta
    ),acts
  );
}

// Method Name: renderHero
// Description: Displays the selected date heading.
function renderHero(){
  var t=todayStr(),isToday=S.sel===t,st=dayStat(S.sel),left=st.total-st.done;
  $('#hero-day').textContent=fmtLong(S.sel,{weekday:'long'})+' · '+parse(S.sel).getFullYear();
  $('#hero-date').textContent=fmtLong(S.sel,{day:'numeric',month:'long'});

  var hr=new Date().getHours();
  var greet=hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';
  var line;

  if(!st.total)line=isToday?'Nothing planned yet. Add your first task below.':'No tasks on this day.';
  else if(isToday)line=greet+'. '+(left?left+' of '+st.total+' tasks still to do today.':'All '+st.total+' tasks done today. Nice work.');
  else if(S.sel<t)line=st.done+' of '+st.total+' tasks were completed on this day.';
  else line='Planning ahead: '+st.total+(st.total===1?' task':' tasks')+' scheduled.';

  $('#hero-sub').textContent=line;
  $('#jump-date').value=S.sel;
}

// Method Name: mondayOf
// Description: Finds the Monday for the week of a given date.
function mondayOf(s){
  var d=parse(s),w=(d.getDay()+6)%7;
  d.setDate(d.getDate()-w);
  return ymd(d);
}

// Method Name: renderWeek
// Description: Displays the days of the selected week.
function renderWeek(){
  var mon=mondayOf(S.sel),t=todayStr(),box=$('#week'),days=[];
  for(var i=0;i<7;i++)days.push(addDays(mon,i));

  $('#wk-label').textContent=fmtLong(days[0],{day:'numeric',month:'short'})+' – '+fmtLong(days[6],{day:'numeric',month:'short'});

  box.replaceChildren.apply(box,days.map(function(d){
    var st=dayStat(d),pct=st.total?Math.round(st.done/st.total*100):0;
    return h('button',{
      type:'button',
      class:'day'+(d===t?' is-today':''),
      'aria-pressed':String(d===S.sel),
      'aria-label':fmtLong(d,{weekday:'long',day:'numeric',month:'long'})+', '+st.done+' of '+st.total+' done',
      onclick:function(){setSel(d)}
    },
      h('span',{class:'wd',text:fmtLong(d,{weekday:'short'})}),
      h('span',{class:'dn',text:String(parse(d).getDate())}),
      h('span',{class:'cnt',text:st.total?st.done+'/'+st.total:'–'}),
      h('span',{class:'meter'},h('i',{style:'width:'+pct+'%'}))
    );
  }));
}

// Method Name: setSel
// Description: Changes the selected date and refreshes the page.
function setSel(d){
  S.sel=d;
  if(!S.editing)F.date.value=d;
  renderAll();
}

// Method Name: renderCarry
// Description: Displays tasks carried over to another day.
function renderCarry(){
  var box=$('#carry');
  box.replaceChildren();
  var t=todayStr();
  if(S.sel!==t)return;

  var over=Array.from(S.tasks).filter(function(e){
    return !e[1].done&&e[1].date<t;
  }).sort(function(a,b){
    return a[1].date.localeCompare(b[1].date)||byTime(a,b);
  });

  if(!over.length)return;
  var ids=over.map(function(e){return e[0]});
  var ul=h('ul',{class:'tasklist'},over.slice(0,6).map(function(e){
    return taskRow(e[0],e[1],{showDate:true,move:true});
  }));

  box.append(h('div',{class:'carry'},
    h('div',{class:'head'},
      h('b',{text:over.length+(over.length===1?' task':' tasks')+' left over from earlier'}),
      h('button',{
        class:'btn small',type:'button',
        onclick:function(){moveToToday(ids)}
      },'Move all to today')
    ),
    ul,
    over.length>6?h('div',{
      class:'muted',style:'padding-left:4px',
      text:'And '+(over.length-6)+' more. See History for the full list.'
    }):null
  ));
}

// Method Name: renderList
// Description: Displays tasks for the selected date.
function renderList(){
  $('#list-title').textContent=relDay(S.sel);
  seg($('#filter'),[['all','All'],['open','Open'],['done','Done']],S.filter,function(v){
    S.filter=v;
    renderList();
    renderFilterSeg();
  });

  var rows=tasksOn(S.sel);
  if(S.filter==='open')rows=rows.filter(function(e){return !e[1].done});
  if(S.filter==='done')rows=rows.filter(function(e){return e[1].done});

  var box=$('#list');
  box.replaceChildren();

  if(!rows.length){
    var all=tasksOn(S.sel).length;
    box.append(h('div',{class:'empty'},
      h('b',{text:all?'Nothing in this filter':'A clear day'}),
      all?'Switch the filter to see the other tasks.':'Add a task above to plan '+(S.sel===todayStr()?'today':relDay(S.sel).toLowerCase())+'.'
    ));
    return;
  }

  box.append(h('ul',{class:'tasklist'},rows.map(function(e){
    return taskRow(e[0],e[1]);
  })));
}

// Method Name: renderFilterSeg
// Description: Displays the task filter buttons.
function renderFilterSeg(){
  seg($('#filter'),[['all','All'],['open','Open'],['done','Done']],S.filter,function(v){
    S.filter=v;
    renderList();
  });
}

// Method Name: renderRing
// Description: Displays the task completion summary.
function renderRing(){
  var st=dayStat(S.sel),pct=st.total?st.done/st.total:0,R=52,C=2*Math.PI*R;
  var card=$('#ring-card');
  card.replaceChildren();

  var ring=h('div',{class:'ring'});
  ring.innerHTML='<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="'+R+'" fill="none" stroke="var(--line)" stroke-width="11"/><circle cx="60" cy="60" r="'+R+'" fill="none" stroke="var(--accent)" stroke-width="11" stroke-linecap="round" stroke-dasharray="'+(pct*C).toFixed(1)+' '+C.toFixed(1)+'"/></svg>';
  ring.append(h('div',{class:'pct',text:Math.round(pct*100)+'%'}));

  var msg=!st.total?'Nothing scheduled':st.done===st.total?'Everything done':(st.total-st.done)+' remaining';
  card.append(
    h('h3',{text:S.sel===todayStr()?'Today’s progress':relDay(S.sel)+' progress'}),
    h('div',{class:'ringwrap'},ring,
      h('div',{class:'ringtext'},
        h('b',{text:st.done+' of '+st.total+' done'}),
        h('span',{text:msg})
      )
    )
  );
}

// Method Name: renderNext
// Description: Displays the next upcoming tasks.
function renderNext(){
  var card=$('#next-card');
  card.replaceChildren(h('h3',{text:'Next up'}));
  var t=todayStr(),now=Date.now();
  var open=tasksOn(t).filter(function(e){return !e[1].done});
  var timed=open.filter(function(e){return e[1].time});
  var upcoming=timed.filter(function(e){
    var s=parse(t),p=e[1].time.split(':');
    s.setHours(+p[0],+p[1],0,0);
    return s.getTime()>=now;
  });
  var lateN=timed.length-upcoming.length;

  if(upcoming.length){
    var e=upcoming[0],p=e[1].time.split(':'),s=parse(t);
    s.setHours(+p[0],+p[1],0,0);
    card.append(
      h('div',{class:'when'},'in '+relMins(s.getTime()-now)+' · '+fmtTime(e[1].time)),
      h('div',{class:'what',text:e[1].title})
    );
  }else if(open.length){
    card.append(h('div',{class:'what',text:open.length+(open.length===1?' task':' tasks')+' open without a time'}));
  }else{
    card.append(h('div',{class:'what',text:'All clear for today'}));
  }

  if(lateN)card.append(h('p',{class:'muted',text:lateN+(lateN===1?' task is':' tasks are')+' past their time and still open.'}));
}

// Method Name: notifState
// Description: Checks the current browser notification permission.
function notifState(){
  return ('Notification' in window)?Notification.permission:'unsupported';
}

// Method Name: renderAlerts
// Description: Displays reminder and notification settings.
function renderAlerts(){
  var card=$('#alerts-card');
  card.replaceChildren(h('h3',{text:'Reminders'}));
  var ns=notifState();
  var sys=ns==='granted'?'System notifications are on.':
    ns==='denied'?'System notifications are blocked in this browser.':
    ns==='unsupported'?'System notifications are not available here.':
    'System notifications are off.';

  card.append(h('div',{class:'stack'},
    h('div',{class:'status'},
      h('span',{class:'dot on'}),
      h('span',{text:'In-page reminders with a chime are on. They work while this tab is open.'})
    ),
    h('div',{class:'status'},
      h('span',{class:'dot'+(ns==='granted'?' on':'')}),
      h('span',{text:sys})
    ),
    ns==='default'?h('button',{
      class:'btn small',type:'button',
      onclick:enableAlerts
    },'Enable system notifications'):null,
    h('button',{
      class:'btn small',type:'button',
      onclick:function(){
        fireReminder(null,{title:'Test reminder',body:'This is how a reminder looks.'});
      }
    },'Send a test')
  ));
}

// Method Name: streak
// Description: Calculates the current task completion streak.
function streak(){
  var t=todayStr(),n=0;
  for(var i=0;i<90;i++){
    var st=dayStat(addDays(t,-i));
    // An empty day does not count. Allow today to be empty and continue
    // yesterday's streak, but an empty day in the past breaks the streak.
    if(!st.total){
      if(i===0)continue;
      break;
    }
    if(st.done===st.total)n++;
    else if(i===0)continue;
    else break;
  }
  return n;
}

// Method Name: renderHistory
// Description: Displays task history and completion statistics.
function renderHistory(){
  seg($('#range'),[[7,'7 days'],[14,'14 days'],[30,'30 days']],S.range,function(v){
    S.range=v;
    renderHistory();
  });
  seg($('#hfilter'),[['all','All'],['done','Completed'],['open','Remaining']],S.hfilter,function(v){
    S.hfilter=v;
    renderHistory();
  });

  var t=todayStr(),days=[],i;
  for(i=S.range-1;i>=0;i--)days.push(addDays(t,-i));
  var stats=days.map(dayStat);
  var total=0,done=0;
  stats.forEach(function(s){total+=s.total;done+=s.done});
  var rate=total?Math.round(done/total*100):0;
  var max=Math.max(4,Math.max.apply(null,stats.map(function(s){return s.total})));

  var left=h('div',{},
    h('div',{class:'eyebrow',text:'Completion rate'}),
    h('div',{class:'big'},String(rate),h('small',{text:'%'})),
    h('div',{class:'facts'},
      h('span',{},h('b',{text:String(done)}),' completed'),
      h('span',{},h('b',{text:String(total-done)}),' remaining'),
      h('span',{},h('b',{text:String(streak())}),' day clean streak')
    )
  );

  var plot=h('div',{class:'plot'}),labels=h('div',{class:'labels'});
  stats.forEach(function(s){
    var rem=s.total-s.done;
    var col=h('button',{
      type:'button',class:'col',
      title:fmtLong(s.d,{weekday:'short',day:'numeric',month:'short'})+': '+s.done+' done, '+rem+' remaining',
      'aria-label':fmtLong(s.d,{weekday:'long',day:'numeric',month:'long'})+': '+s.done+' done, '+rem+' remaining. Open this day.',
      onclick:function(){S.tab='plan';setSel(s.d);applyTab()}
    },
      rem?h('div',{class:'r',style:'height:'+(rem/max*100)+'%'}):null,
      s.done?h('div',{class:'d',style:'height:'+(s.done/max*100)+'%'}):null
    );
    plot.append(col);

    var d=parse(s.d);
    labels.append(h('div',{class:s.d===t?'today':''},
      S.range<=14?h('div',{text:d.toLocaleDateString(LOC,{weekday:'narrow'})}):null,
      h('div',{text:String(d.getDate())})
    ));
  });

  var right=h('div',{},
    h('div',{class:'chartscroll'},plot,labels),
    h('div',{class:'legend'},
      h('span',{},h('i',{class:'ld'}),'Completed'),
      h('span',{},h('i',{class:'lr'}),'Remaining'),
      h('span',{text:'Tap a bar to open that day'})
    )
  );
  $('#hsum').replaceChildren(left,right);

  var box=$('#hlist');
  box.replaceChildren();
  var shown=0;

  days.slice().reverse().forEach(function(d){
    var rows=tasksOn(d);
    if(!rows.length)return;
    var st=dayStat(d);

    if(S.hfilter==='done')rows=rows.filter(function(e){return e[1].done});
    if(S.hfilter==='open')rows=rows.filter(function(e){return !e[1].done});
    if(!rows.length)return;
    shown++;

    box.append(h('div',{class:'daygroup'},
      h('div',{class:'gh'},
        h('button',{
          type:'button',
          onclick:function(){S.tab='plan';setSel(d);applyTab()}
        },relDay(d)+' · '+fmtLong(d,{day:'numeric',month:'short'})),
        h('span',{
          class:'chip '+(st.done===st.total?'good':''),
          text:st.done+' of '+st.total+' done'
        })
      ),
      h('ul',{class:'tasklist'},rows.map(function(e){
        return taskRow(e[0],e[1],{move:true});
      }))
    ));
  });

  if(!shown)box.append(h('div',{class:'empty'},
    h('b',{text:'No tasks to show'}),
    'Nothing matches this range and filter yet.'
  ));
}

// Method Name: renderAll
// Description: Refreshes the planner views.
function renderAll(){
  $('#banner').hidden=!Array.from(S.tasks.values()).some(function(t){return t.sample});
  renderHero();
  renderWeek();
  renderCarry();
  renderList();
  renderRing();
  renderNext();
  renderAlerts();
  if(S.tab==='history')renderHistory();
}

// Method Name: applyTab
// Description: Switches between planner and history views.
function applyTab(){
  $('#view-plan').hidden=S.tab!=='plan';
  $('#view-history').hidden=S.tab!=='history';
  $('#tab-plan').setAttribute('aria-selected',String(S.tab==='plan'));
  $('#tab-history').setAttribute('aria-selected',String(S.tab==='history'));
  renderAll();
  window.scrollTo(0,0);
}

$('#tab-plan').addEventListener('click',function(){S.tab='plan';applyTab()});
$('#tab-history').addEventListener('click',function(){S.tab='history';applyTab()});
$('#btn-today').addEventListener('click',function(){setSel(todayStr())});
$('#jump-date').addEventListener('change',function(e){if(e.target.value)setSel(e.target.value)});
$('#wk-prev').addEventListener('click',function(){setSel(addDays(S.sel,-7))});
$('#wk-next').addEventListener('click',function(){setSel(addDays(S.sel,7))});
$('#btn-clear-samples').addEventListener('click',clearSamples);
$('#wk-prev').append(ico('left'));
$('#wk-next').append(ico('right'));
$('#logo').append(ico('book'));

/* ---------- toasts, chime, reminders ---------- */

// Method Name: toast
// Description: Displays a short message on the page.
function toast(o){
  var box=$('#toasts');
  var el=h('div',{class:'toast',role:'status'});
  var tx=h('div',{class:'tx'},h('b',{text:o.title}),o.body?h('span',{class:'sm',text:o.body}):null);

  if(o.actions&&o.actions.length){
    tx.append(h('div',{class:'acts'},o.actions.map(function(a){
      return h('button',{
        type:'button',
        onclick:function(){el.remove();a.fn()}
      },a.label);
    })));
  }

  if(o.bell)el.append(h('span',{class:'bell'},ico('bell')));
  el.append(tx,h('button',{
    class:'x',type:'button','aria-label':'Dismiss',
    onclick:function(){el.remove()}
  },ico('x')));

  box.append(el);
  while(box.children.length>4)box.firstChild.remove();
  if(o.ttl)setTimeout(function(){el.remove()},o.ttl);
}

var AC=null;

// Method Name: chime
// Description: Plays a short reminder sound.
function chime(){
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    if(AC.resume)AC.resume();

    [660,880].forEach(function(f,i){
      var o=AC.createOscillator(),g=AC.createGain(),t0=AC.currentTime+i*.16;
      o.type='sine';
      o.frequency.value=f;
      g.gain.setValueAtTime(0,t0);
      g.gain.linearRampToValueAtTime(.18,t0+.02);
      g.gain.exponentialRampToValueAtTime(.001,t0+.35);
      o.connect(g);
      g.connect(AC.destination);
      o.start(t0);
      o.stop(t0+.4);
    });
  }catch(e){}
}

// Method Name: systemNotify
// Description: Displays a browser notification.
function systemNotify(title,body,tag){
  try{
    if('Notification' in window&&Notification.permission==='granted'){
      new Notification(title,{body:body,tag:tag||'daybook'});
    }
  }catch(e){}
}

// Method Name: enableAlerts
// Description: Requests permission to show browser notifications.
function enableAlerts(){
  try{
    var p=Notification.requestPermission();
    Promise.resolve(p).then(function(r){
      renderAlerts();
      toast({
        title:r==='granted'?'System notifications are on':'Notifications were not enabled',
        body:r==='granted'?'You will also get alerts outside this tab while Daybook stays open.':'In-page reminders keep working while Daybook is open.',
        ttl:4000
      });
    }).catch(function(){renderAlerts()});
  }catch(e){
    toast({
      title:'Notifications are unavailable here',
      body:'In-page reminders keep working while Daybook is open.',
      ttl:4000
    });
    renderAlerts();
  }
}

// Method Name: fireReminder
// Description: Shows a reminder for a task.
function fireReminder(id,o){
  chime();
  var acts=[];

  if(id){
    acts.push({label:'Mark done',fn:function(){
      var t=S.tasks.get(id);
      if(t&&!t.done)toggle(id);
    }});
    acts.push({label:'Snooze 10 min',fn:function(){
      S.snooze.set(id,Date.now()+600000);
    }});
  }

  toast({title:o.title,body:o.body,bell:true,actions:acts});
  systemNotify(o.title,o.body,id);
}

// Method Name: checkReminders
// Description: Checks whether any task reminder should be shown.
function checkReminders(){
  var now=Date.now(),changed=false;

  S.tasks.forEach(function(t,id){
    if(t.done||t.sample||!t.time||t.remind==null||t.remind<0)return;

    var p=t.time.split(':'),start=parse(t.date);
    start.setHours(+p[0],+p[1],0,0);

    var sn=S.snooze.get(id);
    var eff=sn||(start.getTime()-t.remind*60000);
    var key=id+'|'+t.date+'|'+t.time+'|'+t.remind+(sn?'|s'+sn:'');

    if(now>=eff&&now<start.getTime()+3*3600000&&!S.notified.has(key)){
      S.notified.add(key);
      changed=true;
      var diff=start.getTime()-now;
      fireReminder(id,{
        title:t.title,
        body:(diff>60000?'Starts in '+relMins(diff):'Starting now')+' · '+fmtTime(t.time)
      });
    }
  });

  if(changed)saveNotified();
}

var lastDay=todayStr();

setInterval(function(){
  checkReminders();
  var t=todayStr();

  if(t!==lastDay){
    if(S.sel===lastDay&&!S.editing)S.sel=t;
    lastDay=t;
    renderAll();
  }else{
    renderNext();
    renderHero();
  }
},15000);

// Start the planner and load saved tasks.
loadNotified();
S.tasks=new Map(seed());
resetComposer();
applyTab();

(async function init(){
  // Standalone desktop edition: use persistent local storage on this laptop.
  var db=null,uid=null;

  if(db&&uid){
    S.mode='cloud';
    S.col=db.collection('data/users/'+uid);

    S.col.onSnapshot(function(snap){
      var m=new Map(),meta=false;
      snap.docs.forEach(function(d){
        if(d.id==='_meta'){meta=true;return}
        m.set(d.id,d.data());
      });

      S.tasks=m;

      if(!snap.metadata.fromCache&&!meta&&m.size===0&&!S.seeded){
        S.seeded=true;
        seed().forEach(function(e){
          S.tasks.set(e[0],e[1]);
          persist(e[0]);
        });
        queue('_meta',function(){
          return S.col.doc('_meta').set({seeded:true,at:new Date().toISOString()});
        });
      }

      renderAll();
    },function(){
      S.mode='local';
      var saved=loadLocal();
      S.tasks=saved?new Map(saved):new Map(seed());
      saveLocal();
      renderAll();
      toast({
        title:'Cloud save is unavailable',
        body:'Tasks will be kept in this browser instead.',
        ttl:5000
      });
    });
  }else{
    S.mode='local';
    var saved=loadLocal();
    S.tasks=new Map(saved||seed());
    saveLocal();
    renderAll();
  }
})();
})();
</script>
</body>
</html>
