const ignored=new Set('what whats is are the a an my your please tell me do you know about'.split(' '));
export function normalize(text){return text.toLowerCase().replace(/colour/g,'color').replace(/favourite/g,'favorite').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();}
export function findMemory(query,memories){
 const normalized=normalize(query);
 const exact=memories.find(m=>m.question&&normalize(m.question)===normalized);
 if(exact)return exact;
 const words=normalized.split(' ').filter(w=>!ignored.has(w));
 if(!words.length)return null;
 const scored=memories.map(memory=>{
  const source=new Set(normalize(memory.question||memory.content).split(' '));
  const matches=words.filter(w=>source.has(w)).length;
  return {memory,score:matches/words.length,matches};
 }).sort((a,b)=>b.score-a.score||b.matches-a.matches);
 const first=scored[0];
 if(!first||first.score<.8||first.matches<Math.min(2,words.length))return null;
 if(scored[1]?.score===first.score&&scored[1]?.matches===first.matches)return null;
 return first.memory;
}
export function validateBackup(value){
 const items=Array.isArray(value)?value:value?.memories;
 if(!Array.isArray(items)||items.length>5000)throw Error('Choose a TalkToMe backup with up to 5,000 memories.');
 return items.map(m=>{
  if(!m||typeof m.content!=='string'||!m.content.trim()||m.content.length>4000|| (m.question!==undefined&&(typeof m.question!=='string'||m.question.length>500)))throw Error('This backup contains an invalid memory. Nothing was imported.');
  return {id:crypto.randomUUID(),question:m.question||'',content:m.content,created_at:typeof m.created_at==='string'?m.created_at:new Date().toISOString()};
 });
}
