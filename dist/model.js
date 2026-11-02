export const VERSION=1;
export const PRODUCTION={draft:'Taslak',in_progress:'Üretimde',ready:'Hazır'};
export const UPLOAD={unknown:'Bilinmiyor',not_uploaded:'Yüklenmedi',uploaded:'Yüklendi'};
export const PUBLICATION={unknown:'Doğrulanmadı',unpublished:'Yayınlanmadı',scheduled:'Platformda planlandı',published:'Yayınlandı'};
export const PLATFORMS=['YouTube','Instagram','TikTok','Diğer'];
export const FORMATS=['Uzun video','Shorts','Reels','Gönderi','Diğer'];
const ID=/^[a-zA-Z0-9_-]{1,100}$/;
export const uid=()=>crypto.randomUUID();
export function today(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export function dayAdd(date,n){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
export function monday(date){const d=new Date(date+'T12:00:00Z');return dayAdd(date,-((d.getUTCDay()+6)%7));}
export function validDateTime(s){if(s==='')return true;if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s))return false;const d=new Date(s+':00Z');return !isNaN(d)&&d.toISOString().slice(0,16)===s&&s.slice(0,4)>='2000'&&s.slice(0,4)<='2100';}
function str(x,max=1000){return typeof x==='string'&&x.length<=max;}
export function validURL(x){if(!x)return true;try{return ['https:','http:'].includes(new URL(x).protocol);}catch{return false;}}
export function validateState(input){
 if(!input||input.version!==VERSION||!Array.isArray(input.channels)||!Array.isArray(input.items))throw Error('Beklenen biçim: version: 1, channels ve items dizileri.');
 if(input.channels.length>100||input.items.length>1000)throw Error('En fazla 100 kanal ve 1000 içerik içe alınabilir.');
 const ids=new Set();const names=new Set();
 const channels=input.channels.map(c=>{
  if(!c||typeof c.id!=='string'||!ID.test(c.id)||ids.has(c.id)||!str(c.name,100)||!c.name.trim()||names.has(c.name.trim().toLocaleLowerCase('tr')))throw Error('Kanal kimliği / adı eksik, geçersiz veya tekrarlı.');
  ids.add(c.id);names.add(c.name.trim().toLocaleLowerCase('tr'));
  if(!/^#[0-9a-fA-F]{6}$/.test(c.color)||!PLATFORMS.includes(c.platform)||!str(c.url||'',500)||!validURL(c.url||''))throw Error('Kanal rengi, platformu veya bağlantısı geçersiz.');
  return {id:c.id,name:c.name.trim(),color:c.color,platform:c.platform,url:c.url||''};
 });const itemIds=new Set();
 const items=input.items.map(i=>{
  if(!i||typeof i.id!=='string'||typeof i.channelId!=='string'||!ID.test(i.id)||itemIds.has(i.id)||!ids.has(i.channelId))throw Error('İçerik kimliği tekrarlı veya kanal bulunamadı.');itemIds.add(i.id);
  if(!str(i.title,200)||!i.title.trim()||!FORMATS.includes(i.format)||!Object.hasOwn(PRODUCTION,i.production)||!Object.hasOwn(UPLOAD,i.upload)||!Object.hasOwn(PUBLICATION,i.publication))throw Error('İçerik başlığı, biçimi veya durumları geçersiz.');
  for(const k of ['plannedAt','publishedAt','verifiedAt','platformPlannedAt'])if(!validDateTime(i[k]||''))throw Error('Tarih / saat geçersiz. 2000–2100 arası YYYY-MM-DDTHH:mm kullanın.');
  if(i.publication==='scheduled'&&(!i.plannedAt||i.upload!=='uploaded'))throw Error('Platformda planlandı durumu için yükleme ve plan tarihi gerekli.');
  if(i.publication==='published'&&(!i.publishedAt||i.upload!=='uploaded'))throw Error('Yayınlandı durumu için gerçek yayın tarihi ve yükleme gerekli.');
  if(i.publication!=='published'&&i.publishedAt)throw Error('Gerçek yayın tarihi varsa yayın durumu Yayınlandı olmalı.');
  for(const k of ['source','notes','asset'])if(!str(i[k]||'',2000))throw Error('Kaynak / not / dosya alanı çok uzun.');
  if(!str(i.url||'',500)||!validURL(i.url||''))throw Error('Video bağlantısı http veya https olmalı.');
  return {id:i.id,channelId:i.channelId,title:i.title.trim(),format:i.format,production:i.production,upload:i.upload,publication:i.publication,plannedAt:i.plannedAt||'',platformPlannedAt:i.platformPlannedAt||'',publishedAt:i.publishedAt||'',verifiedAt:i.verifiedAt||'',url:i.url||'',source:i.source||'',asset:i.asset||'',notes:i.notes||'',archived:i.archived===true};
 });return {version:VERSION,channels,items};
}
export function issues(i,asOf=today()){
 const out=[];if(i.publication==='scheduled'&&i.platformPlannedAt&&i.platformPlannedAt!==i.plannedAt)out.push('Hedef tarih platform planından farklı');if(i.publication!=='published'&&i.plannedAt&&i.plannedAt.slice(0,10)<asOf)out.push('Plan günü geçti; yayın doğrulanmalı');
 if(i.production!=='ready'&&i.plannedAt)out.push('Üretim tamamlanmadı');
 if(i.publication==='unknown')out.push('Yayın durumu doğrulanmadı');
 if(i.publication==='published'&&!i.source)out.push('Yayın kaynağı eklenmeli');
 return out;
}
export function weekItems(items,start){const end=dayAdd(start,7);return items.filter(i=>!i.archived&&i.plannedAt&&i.plannedAt.slice(0,10)>=start&&i.plannedAt.slice(0,10)<end).sort((a,b)=>a.plannedAt.localeCompare(b.plannedAt));}
export function demoState(date=today()){
 const base=monday(date);const at=(n,h='18:00')=>dayAdd(base,n)+'T'+h;
 return validateState({version:1,channels:[{id:'demo-studio',name:'Stüdyo Atlas',color:'#6d5ce7',platform:'YouTube',url:''},{id:'demo-minik',name:'Minik Keşifler',color:'#e79a3b',platform:'YouTube',url:''},{id:'demo-doga',name:'Doğa Günlüğü',color:'#319b83',platform:'Instagram',url:''}],items:[
 {id:'demo-1',channelId:'demo-studio',title:'Bir şehrin görünmeyen hikâyesi',format:'Uzun video',production:'ready',upload:'uploaded',publication:'scheduled',plannedAt:at(2,'20:30'),source:'Sentetik demo kaydı',notes:'Kapak ve açıklama hazır.'},
 {id:'demo-2',channelId:'demo-minik',title:'Renklerin küçük dünyası',format:'Uzun video',production:'in_progress',upload:'not_uploaded',publication:'unpublished',plannedAt:at(4,'10:00'),source:'Sentetik yerel plan',notes:'Seslendirme ve son kurgu bekleniyor.'},
 {id:'demo-3',channelId:'demo-doga',title:'Sabahın ilk ışıkları',format:'Reels',production:'ready',upload:'unknown',publication:'unknown',plannedAt:at(1),source:'Sentetik yerel plan'},
 {id:'demo-4',channelId:'demo-studio',title:'Sahne arkasından 30 saniye',format:'Shorts',production:'ready',upload:'uploaded',publication:'published',plannedAt:at(0),publishedAt:at(0),source:'Sentetik yayın örneği',notes:'Bu içerik gerçek bir kanala ait değildir.'},
 {id:'demo-5',channelId:'demo-minik',title:'Şekilleri birlikte tanıyalım',format:'Shorts',production:'draft',upload:'not_uploaded',publication:'unpublished',plannedAt:at(6,'13:00'),source:'Sentetik yerel plan'},
 {id:'demo-6',channelId:'demo-doga',title:'Yağmurdan sonra',format:'Reels',production:'draft',upload:'not_uploaded',publication:'unknown',source:'Sentetik fikir havuzu'}]});
}
export const CSV_COLUMNS=['id','channelId','channel','platform','color','title','format','production','upload','publication','plannedAt','platformPlannedAt','publishedAt','verifiedAt','url','source','asset','notes','archived'];
export function parseCSV(text){
 text=text.replace(/^\uFEFF/,'');let rows=[],row=[],value='',quoted=false,closed=false;
 for(let n=0;n<text.length;n++){const c=text[n];if(quoted){if(c==='"'){if(text[n+1]==='"'){value+='"';n++;}else{quoted=false;closed=true;}}else value+=c;}else if(c==='"'){if(value||closed)throw Error('CSV tırnak yapısı geçersiz.');quoted=true;}else if(c===','){row.push(value);value='';closed=false;}else if(c==='\n'||c==='\r'){if(c==='\r'&&text[n+1]==='\n')n++;row.push(value);if(row.some(x=>x!==''))rows.push(row);row=[];value='';closed=false;}else{if(closed)throw Error('CSV kapanış tırnağından sonra ayırıcı bekleniyor.');value+=c;}}
 if(quoted)throw Error('CSV içinde kapanmamış tırnak var.');row.push(value);if(row.some(x=>x!==''))rows.push(row);
 if(rows.length<1)throw Error('CSV boş.');const head=rows.shift();if(new Set(head).size!==head.length)throw Error('CSV sütun başlıkları tekrarlı.');
 const required=['id','channel','title','format','production','upload','publication'];if(required.some(k=>!head.includes(k)))throw Error('CSV başlıkları eksik. Uygulamanın CSV şablonunu kullanın.');
 return rows.map(r=>{if(r.length!==head.length)throw Error('CSV satırlarında sütun sayısı eşleşmiyor.');return Object.fromEntries(head.map((h,n)=>[h,r[n]]));});
}
export function csvState(text,current){
 const records=parseCSV(text),channels=new Map(),items=[];
 for(const r of records){const existing=current.channels.find(c=>c.name.toLocaleLowerCase('tr')===r.channel.toLocaleLowerCase('tr'));const imported=[...channels.values()].find(c=>c.name.toLocaleLowerCase('tr')===r.channel.toLocaleLowerCase('tr'));const cid=r.channelId||existing?.id||imported?.id||'csv-'+channels.size+'-'+uid();
  if(!channels.has(cid))channels.set(cid,{id:cid,name:r.channel,platform:r.platform||existing?.platform||'YouTube',color:r.color||existing?.color||'#6d5ce7',url:existing?.url||''});
  else if(channels.get(cid).name!==r.channel)throw Error('CSV kanal kimliği birden fazla kanal adıyla kullanılmış.');
  items.push({...r,channelId:cid,archived:r.archived==='true'});
 }return validateState({version:1,channels:[...channels.values()],items});
}
export function mergeState(current,incoming){
 const channels=new Map(current.channels.map(c=>[c.id,c]));const map=new Map();
 for(const c of incoming.channels){const match=[...channels.values()].find(x=>x.name.toLocaleLowerCase('tr')===c.name.toLocaleLowerCase('tr'));if(match&&match.id!==c.id){map.set(c.id,match.id);}else channels.set(c.id,c);}
 const items=new Map(current.items.map(i=>[i.id,i]));for(const i of incoming.items)items.set(i.id,{...i,channelId:map.get(i.channelId)||i.channelId});
 return validateState({version:1,channels:[...channels.values()],items:[...items.values()]});
}
export function exportCSV(state){const cell=x=>{let s=String(x??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};return '\uFEFF'+[CSV_COLUMNS,...state.items.map(i=>{const c=state.channels.find(c=>c.id===i.channelId);return CSV_COLUMNS.map(k=>({channel:c.name,platform:c.platform,color:c.color,...i})[k]);})].map(r=>r.map(cell).join(',')).join('\r\n');}
export function movePlan(state,id,date){
 if(date!==''&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!validDateTime(date+'T18:00')))throw Error('Geçerli bir plan günü seçin.');
 const item=state.items.find(i=>i.id===id);if(!item||item.archived)throw Error('Taşınacak içerik bulunamadı.');
 if(item.publication==='published')throw Error('Yayınlanmış içerik yeniden planlanamaz. Yeni bir içerik kaydı oluşturun.');
 if(date===''&&item.publication==='scheduled')throw Error('Platformda planlı içerik tarihsiz bırakılamaz. Önce platform durumunu kontrol edin.');
 return validateState({...state,items:state.items.map(i=>i.id===id?{...i,platformPlannedAt:i.platformPlannedAt||(i.publication==='scheduled'?i.plannedAt:''),plannedAt:date?date+'T'+(i.plannedAt?.slice(11,16)||'18:00'):''}:i)});
}
