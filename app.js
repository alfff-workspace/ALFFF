const $=id=>document.getElementById(id);
const messages=$("messages"), intro=$("intro"), input=$("prompt");
const KEY="alfff-phone-history-v1";
let history=[];
try{history=JSON.parse(localStorage.getItem(KEY)||"[]")}catch{}
let busy=false;
function save(){localStorage.setItem(KEY,JSON.stringify(history.slice(-60)))}
function add(role,text,typing=false){
  const row=document.createElement("div");row.className="message "+role;
  const avatar=document.createElement("div");avatar.className="avatar";avatar.textContent=role==="user"?"Y":"A";
  const bubble=document.createElement("div");bubble.className="bubble"+(typing?" typing":"");bubble.textContent=text;
  row.append(avatar,bubble);messages.append(row);$("conversation").scrollTop=$("conversation").scrollHeight;return bubble;
}
function show(){messages.replaceChildren();history.forEach(m=>add(m.role,m.content));intro.hidden=history.length>0}
function demoReply(q){
 const s=q.toLowerCase();
 if(s.includes("hello")||s.includes("hi"))return "Hello! I'm ALFFF. This is my free demo mode. Connect a real AI endpoint to unlock full AI conversations.";
 if(s.includes("study")||s.includes("learn"))return "Let's learn step by step. 1) Tell me the subject. 2) Pick one small topic. 3) Learn the concept. 4) Solve two practice questions. Connect an AI endpoint for a tailored lesson.";
 if(s.includes("code")||s.includes("program"))return "I can help plan code in demo mode, but I can't execute programs here. Connect an AI endpoint for real coding help.";
 return "I'm running in demo mode, so I don't have a real language model connected yet. You can still explore the interface. To enable real AI, configure a secure backend URL in config.js. Never paste an API key into this app.";
}
async function send(text){
 if(busy||!text.trim())return;
 const q=text.trim();history.push({role:"user",content:q});save();show();input.value="";resize();
 busy=true;$("send").disabled=true;
 const waiting=add("assistant","ALFFF is thinking…",true);
 try{
  const api=window.ALFFF_CONFIG?.API_URL;
  let reply;
  if(api){
   const r=await fetch(api,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:history.slice(-16)})});
   const data=await r.json();if(!r.ok)throw new Error(data.error||"AI service error");reply=data.reply;
  }else reply=demoReply(q);
  waiting.textContent=reply;waiting.classList.remove("typing");history.push({role:"assistant",content:reply});save();
 }catch(e){waiting.textContent="Couldn't reach ALFFF's AI service: "+e.message;waiting.classList.remove("typing")}
 finally{busy=false;$("send").disabled=false;$("conversation").scrollTop=$("conversation").scrollHeight}
}
$("form").addEventListener("submit",e=>{e.preventDefault();send(input.value)});
input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();$("form").requestSubmit()}});
function resize(){input.style.height="auto";input.style.height=Math.min(input.scrollHeight,150)+"px"}
input.addEventListener("input",resize);
$("clear").addEventListener("click",()=>{history=[];save();show();input.focus()});
document.querySelectorAll("[data-prompt]").forEach(b=>b.addEventListener("click",()=>send(b.dataset.prompt)));
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
$("mic").addEventListener("click",()=>{if(!SR){alert("Voice typing isn't supported by this browser.");return}const rec=new SR();rec.lang=navigator.language||"en-IN";rec.onresult=e=>{input.value+=(input.value?" ":"")+e.results[0][0].transcript;resize();input.focus()};rec.onerror=()=>alert("Microphone unavailable. Check browser permission.");rec.start()});
show();
