import assert from 'node:assert/strict';
import {STEPS,createProject,demoProject,updateField,finishStep,addIssue,toggleIssue,progress,parseBackup,backup} from './dist/core.mjs';

let checks=0;
function check(name,fn){fn();checks++;console.log('PASS '+name);}
check('blank inputs and locked steps cannot advance',()=>{const p=createProject('测试产品','图片处理');assert.equal(finishStep(p,0),false);assert.equal(finishStep(p,2),false);assert.equal(p.unlocked,0);assert.equal(progress(p),0);});
check('complete six steps with unresolved-question gate',()=>{
 const p=createProject('测试产品','图片处理');
 for(let i=0;i<5;i++){for(const f of STEPS[i].fields.filter(f=>f.required))updateField(p,f.key,'真实代码中核实的记录');assert.equal(finishStep(p,i),true);assert.equal(p.step,i+1);}
 updateField(p,'acceptance','上传 → 抠图 → 下载，实际运行通过');addIssue(p,'确认超时重试',2);assert.equal(finishStep(p,5),false);toggleIssue(p,p.issues[0].id);assert.equal(finishStep(p,5),true);assert.equal(progress(p),100);
 const restored=parseBackup(backup([p]))[0];assert.equal(progress(restored),100);assert.equal(restored.issues[0].resolved,true);
 toggleIssue(p,p.issues[0].id);assert.equal(p.done[5],false);assert.equal(progress(p),83);
 updateField(p,'audience','  ');assert.equal(p.done[0],false);assert.equal(finishStep(p,5),false);
});
check('free browsing cannot finish an incomplete project',()=>{const p=createProject('a','b');p.unlocked=5;updateField(p,'acceptance','checked');assert.equal(finishStep(p,5),false);});
check('backup validation, empty workspace, and numeric step sanitizing',()=>{
 assert.deepEqual(parseBackup(backup([])),[]);assert.throws(()=>parseBackup('{broken'));assert.throws(()=>parseBackup('{"version":2,"projects":[]}'));
 const p=demoProject();p.step=3.5;p.unlocked=4.8;p.issues[0].step=-10;const r=parseBackup(backup([p]))[0];assert.equal(r.step,3);assert.equal(r.unlocked,4);assert.equal(r.issues[0].step,0);assert.notEqual(r.id,p.id);
});

// Exercise the actual application handlers and persistence without a browser.
// This small DOM stand-in covers events and generated markup, not layout or browser rendering.
const listeners=new Map(),elements=new Map(),memory=new Map();
class Element{
 constructor(id){this.selector=id;this.id=id.replace(/^#/,'');this.innerHTML='';this.textContent='';this.dataset={};this.hidden=false;this.files=[];this.value='';this.elements={name:{value:''},feature:{value:''},url:{value:''}};this.style={};this.classList={add(){},remove(){},toggle(){}};this.handlers={};}
 addEventListener(type,fn){this.handlers[type]=fn;}
 querySelector(selector){if(this.selector==='#project-dialog'&&selector==='form')return element('#project-form');return element(this.selector+' '+selector);}
 querySelectorAll(){return [];}
 reset(){for(const e of Object.values(this.elements))e.value='';}
 showModal(){this.open=true;}
 close(){this.open=false;this.handlers.close?.();}
 focus(){this.focused=true;}
 setAttribute(k,v){this[k]=v;}
 append(){} click(){this.clicked=true;} remove(){}
}
const element=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id);};
globalThis.document={querySelector:element,querySelectorAll:s=>s==='dialog'?[element('#project-dialog'),element('#confirm-dialog')]:[],addEventListener:(t,f)=>{if(!listeners.has(t))listeners.set(t,[]);listeners.get(t).push(f);},createElement:()=>new Element('anchor'),body:{append(){}}};
globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
globalThis.window={addEventListener(){}};
globalThis.FormData=class{constructor(form){this.form=form;}get(k){return this.form._values?.[k]??this.form.elements[k]?.value??'';}};
const emit=async(type,target)=>{for(const f of listeners.get(type)||[])await f({target,preventDefault(){}});};
const click=async(action,data={})=>emit('click',{closest:()=>({dataset:{action,...data}})});
const field=async(key,value)=>emit('input',{dataset:{field:key},value});
const stored=()=>JSON.parse([...memory.values()][0]);
await import('./dist/app.mjs');
check('initial app markup contains the example, editor, and flow',()=>{const html=element('#app').innerHTML;assert.ok(html.includes('Photoroom'));assert.ok(html.includes('33<small>%'));assert.ok(html.includes('id="step-form"'));assert.ok(html.includes('aria-label="模块流程图"'));});
await click('step',{step:'5'});
check('locked navigation gives a helpful message',()=>assert.ok(element('#toast').textContent.includes('先完成当前步骤')));
await field('endpoint','');await emit('submit',element('#step-form'));
check('empty submission stays in the editor and focuses the missing field',()=>{assert.equal(stored().projects[0].step,2);assert.equal(element('#form-error').hidden,false);assert.equal(element('#field-endpoint').focused,true);});
await field('endpoint','POST /api/test');await emit('submit',element('#step-form'));
check('save-and-continue updates storage, progress, and module view',()=>{const p=stored().projects[0];assert.equal(p.done[2],true);assert.equal(p.step,3);assert.equal(p.unlocked,3);assert.ok(element('#app').innerHTML.includes('第三方接收什么'));assert.ok(element('#app').innerHTML.includes('POST /api/test'));});
await click('add-question');element('#issue-form')._values={text:'确认真实响应格式',step:'3'};await emit('submit',element('#issue-form'));
check('question creation is linked to the selected module',()=>{const p=stored().projects[0];assert.equal(p.issues.length,4);assert.equal(p.issues[3].step,3);assert.ok(element('#app').innerHTML.includes('确认真实响应格式'));});
let issue=stored().projects[0].issues.at(-1);await emit('change',{dataset:{issue:issue.id}});
check('resolving a question persists its state',()=>assert.equal(stored().projects[0].issues.at(-1).resolved,true));
await click('new');const form=element('#project-form');form._values={name:'我的产品',feature:'真实功能',url:''};await emit('submit',form);
check('creating a project preserves existing work and starts at step one',()=>{const d=stored();assert.equal(d.projects.length,2);const p=d.projects[1];assert.equal(p.step,0);assert.equal(p.feature,'真实功能');assert.ok(element('#app').innerHTML.includes('谁会用这个功能'));});
await field('audience','<script>alert(1)</script>');
await click('tab',{tab:'overview'});
check('untrusted field values render as text',()=>{const html=element('#app').innerHTML;assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));assert.ok(!html.includes('<script>alert(1)</script>'));});
const f=element('#import-file');f.files=[{size:40,text:async()=>backup([demoProject()])}];await f.handlers.change({target:f});
check('import adds records without replacing existing projects',()=>assert.equal(stored().projects.length,3));
f.files=[{size:20,text:async()=>'{bad'}];await f.handlers.change({target:f});
check('invalid import does not alter existing work',()=>{assert.equal(stored().projects.length,3);assert.ok(element('#toast').textContent.includes('导入失败'));});
const snapshot=stored();elements.clear();await import('./dist/app.mjs?reload-check');
check('refresh restores the selected project and completion states',()=>{const active=snapshot.projects.find(p=>p.id===snapshot.activeId);assert.ok(element('#app').innerHTML.includes(active.feature));assert.ok(element('#app').innerHTML.includes('33<small>%'));});
console.log(`\n${checks} checks passed. Browser layout and real browser interaction QA remain unverified.`);
