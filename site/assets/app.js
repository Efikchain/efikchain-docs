(function(){
var C=window.CHAIN;function $(i){return document.getElementById(i)}
var pages=[["index.html","Home"],["scan.html","EfikchainScan"],["network.html","Network"],["developers.html","Developers"],["trust.html","Trust"],["roadmap.html","Roadmap"]];
var cur=location.pathname.split("/").pop()||"index.html";
var h=document.createElement("header");
h.innerHTML='<div class="w"><img src="'+C.logo+'" alt="" onerror="this.style.display=\'none\'"><b>'+C.short+'</b><nav>'+pages.map(function(p){return '<a href="'+p[0]+'"'+(p[0]===cur?' class="on"':'')+'>'+p[1]+'</a>'}).join("")+'</nav></div>';
document.body.insertBefore(h,document.body.firstChild);
var f=document.createElement("footer");
f.innerHTML='<div class="w">'+C.name+', chain ID '+C.chainId+'. <a href="'+C.docs+'" target="_blank" rel="noopener">Docs</a> | <a href="'+C.explorer+'" target="_blank" rel="noopener">Explorer</a></div>';
document.body.appendChild(f);

document.querySelectorAll("[data-cfg]").forEach(function(e){e.textContent=C[e.getAttribute("data-cfg")]});
document.querySelectorAll("[data-href]").forEach(function(e){e.href=C[e.getAttribute("data-href")]});
document.querySelectorAll("[data-tpl]").forEach(function(e){e.textContent=e.textContent.replace(/\{\{(\w+)\}\}/g,function(_,k){return C[k]})});

function rpc(m,p){return fetch(C.rpc,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",method:m,params:p||[],id:1})}).then(function(r){return r.json()}).then(function(j){if(j.error)throw new Error(j.error.message);return j.result})}
function copy(t,b){var d=function(){var o=b.textContent;b.textContent="Copied";setTimeout(function(){b.textContent=o},1200)};
 function fb(){var a=document.createElement("textarea");a.value=t;document.body.appendChild(a);a.select();try{document.execCommand("copy");d()}catch(e){}document.body.removeChild(a)}
 if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(t).then(d,fb)}else{fb()}}
document.querySelectorAll("[data-copy]").forEach(function(b){b.addEventListener("click",function(){copy(String(C[b.getAttribute("data-copy")]),b)})});
function say(id,t,cls){var m=$(id);if(!m)return;m.textContent=t;m.className="msg "+(cls||"")}

if($("add"))$("add").addEventListener("click",function(){
 if(!window.ethereum){say("addmsg","No wallet found in this browser. Open this page inside your wallet app browser, or add the network manually with the details above.");return}
 window.ethereum.request({method:"wallet_addEthereumChain",params:[{chainId:C.hex,chainName:C.name,nativeCurrency:{name:C.symbol,symbol:C.symbol,decimals:C.decimals},rpcUrls:[C.rpc],blockExplorerUrls:[C.explorer]}]})
 .then(function(){say("addmsg","Network added. Switch to "+C.name+" in your wallet.","ok")})
 .catch(function(e){say("addmsg","Your wallet refused: "+(e&&e.message?e.message:"unknown error")+". Add it manually with the details above.","bad")})});

function fmt(w){var b=BigInt(w),d=10n**BigInt(C.decimals),f=(b%d).toString().padStart(C.decimals,"0").slice(0,4);return (b/d).toLocaleString()+"."+f}
if($("bb"))$("bb").addEventListener("click",function(){var a=$("ba").value.trim();
 if(!/^0x[0-9a-fA-F]{40}$/.test(a)){say("bres","Enter a valid 0x address (42 characters).","bad");return}
 say("bres","Checking...");rpc("eth_getBalance",[a,"latest"]).then(function(r){say("bres",fmt(r)+" "+C.symbol,"ok")}).catch(function(){say("bres","Could not reach the RPC.","bad")})});
function search(){var v=$("q").value.trim(),u=null;
 if(/^0x[0-9a-fA-F]{64}$/.test(v))u="/tx/"+v;else if(/^0x[0-9a-fA-F]{40}$/.test(v))u="/address/"+v;else if(/^[0-9]+$/.test(v))u="/block/"+v;
 if(!u){say("smsg","Enter a block number, a 0x transaction hash or a 0x address.","bad");return}
 window.open(C.explorer+u,"_blank","noopener")}
if($("go")){$("go").addEventListener("click",search);$("q").addEventListener("keydown",function(e){if(e.key==="Enter")search()})}

var N=parseInt(($("tb")||{dataset:{}}).dataset.n||"0",10);
function tick(){rpc("eth_blockNumber").then(function(hx){
 var n=parseInt(hx,16);if($("blk"))$("blk").textContent=n.toLocaleString();if($("st"))$("st").textContent="Online";
 if(!N)return;var ps=[];for(var i=0;i<N&&n-i>=0;i++)ps.push(rpc("eth_getBlockByNumber",["0x"+(n-i).toString(16),false]));
 return Promise.all(ps).then(function(bs){$("tb").innerHTML=bs.map(function(b){var k=parseInt(b.number,16);
  return '<tr><td><a href="'+C.explorer+'/block/'+k+'" target="_blank" rel="noopener">'+k.toLocaleString()+'</a></td><td>'+b.transactions.length+'</td><td>'+new Date(parseInt(b.timestamp,16)*1000).toISOString().slice(11,19)+'</td><td>'+parseInt(b.gasUsed,16).toLocaleString()+'</td></tr>'}).join("")})
 }).catch(function(){if($("st"))$("st").textContent="Offline"})}
if($("blk")||$("tb")){tick();setInterval(tick,6000)}

if($("verify"))$("verify").addEventListener("click",function(){
 var o=$("vres");o.innerHTML="Running checks...";var out=[];
 rpc("eth_chainId").then(function(id){out.push([id===C.hex,"Chain ID answers "+id+(id===C.hex?" (matches "+C.chainId+")":" (expected "+C.hex+")")]);return rpc("eth_getBlockByNumber",["latest",false])})
 .then(function(b){var age=Math.round(Date.now()/1000-parseInt(b.timestamp,16));out.push([age<120,"Latest block "+parseInt(b.number,16).toLocaleString()+" is "+age+" seconds old"]);return rpc("eth_getBlockByNumber",["0x0",false])})
 .then(function(g){out.push([true,"Genesis block hash: "+g.hash])})
 .catch(function(){out.push([false,"RPC did not answer"])})
 .then(function(){o.innerHTML=out.map(function(r){return '<div class="'+(r[0]?"ok":"bad")+'">'+(r[0]?"PASS ":"FAIL ")+r[1]+'</div>'}).join("")})});
})();
