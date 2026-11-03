(function(){
var d=document,$=function(i){return d.getElementById(i)},cur=null,cache={};
var NETS=[
{id:1,name:"Ethereum",sym:"ETH",rpc:"https://ethereum-rpc.publicnode.com",ex:"https://etherscan.io",c:"#627eea"},
{id:56,name:"BNB Chain",sym:"BNB",rpc:"https://bsc-rpc.publicnode.com",ex:"https://bscscan.com",c:"#d9a406"},
{id:137,name:"Polygon",sym:"POL",rpc:"https://polygon-bor-rpc.publicnode.com",ex:"https://polygonscan.com",c:"#8247e5"},
{id:42161,name:"Arbitrum One",sym:"ETH",rpc:"https://arbitrum-one-rpc.publicnode.com",ex:"https://arbiscan.io",c:"#28a0f0"},
{id:10,name:"Optimism",sym:"ETH",rpc:"https://optimism-rpc.publicnode.com",ex:"https://optimistic.etherscan.io",c:"#ff0420"},
{id:8453,name:"Base",sym:"ETH",rpc:"https://base-rpc.publicnode.com",ex:"https://basescan.org",c:"#0052ff"},
{id:43114,name:"Avalanche",sym:"AVAX",rpc:"https://avalanche-c-chain-rpc.publicnode.com",ex:"https://snowtrace.io",c:"#e84142"}];
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function tm(p,ms){return Promise.race([p,new Promise(function(_,r){setTimeout(function(){r(new Error("timeout"))},ms)})])}
function custom(){try{return JSON.parse(localStorage.getItem("efik_nets")||"[]")}catch(x){return []}}
function all(){return NETS.concat(custom())}
function pv(n){var k=n.id+n.rpc;if(!cache[k])cache[k]=new E.JsonRpcProvider(n.rpc,n.id,{staticNetwork:true});return cache[k]}
async function bal(n){return fmt(E.formatEther(await tm(pv(n).getBalance(W.address),10000)))}
function row(n,i){return '<div class="tk" role="button" tabindex="0" data-i="'+i+'" aria-label="'+esc(n.name)+'"><div class="ic" style="background:'+n.c+'">'+esc(n.sym.slice(0,1))+'</div><div class="n"><b>'+esc(n.name)+'</b><div class="t">Chain '+n.id+'</div></div><div class="r"><b id="nb'+i+'">...</b><div class="t">'+esc(n.sym)+'</div></div></div>'}
function list(){var a=all();$("nl").innerHTML=a.map(row).join("");
 $("nl").querySelectorAll(".tk").forEach(function(r){var i=+r.getAttribute("data-i");r.style.cursor="pointer";r.onclick=function(){openNet(i)};r.onkeydown=function(e){if(e.key=="Enter"||e.key==" "){e.preventDefault();openNet(i)}}});
 a.forEach(function(n,i){bal(n).then(function(v){var e=$("nb"+i);if(e)e.textContent=v}).catch(function(){var e=$("nb"+i);if(e)e.textContent="n/a"})})}
var vn=d.createElement("div");vn.id="v-net";vn.style.display="none";
vn.innerHTML='<div class="card"><button class="s" id="nback" style="width:auto;padding:8px 14px;margin:0 0 10px" aria-label="Back to wallet">&#8592; Back</button><b>Networks</b><p class="t">Your address is the same on every EVM network. Tap a network to see its coin balance, send and receive.</p><div id="nl"></div></div><div class="card"><b>Add a network</b><input id="cn-name" placeholder="Network name" aria-label="Network name"><input id="cn-rpc" placeholder="RPC URL https://..." autocapitalize="off" aria-label="RPC URL"><input id="cn-id" inputmode="numeric" placeholder="Chain ID" aria-label="Chain ID"><input id="cn-sym" placeholder="Coin symbol" aria-label="Coin symbol"><input id="cn-ex" placeholder="Explorer URL (optional)" autocapitalize="off" aria-label="Explorer URL"><button id="cn-add">Add network</button></div>';
var vd=d.createElement("div");vd.id="v-ndet";vd.className="card";vd.style.display="none";
vd.innerHTML='<button class="s" id="dback" style="width:auto;padding:8px 14px;margin:0 0 10px" aria-label="Back to networks">&#8592; Networks</button><div style="display:flex;align-items:center;gap:12px"><div class="ic" id="dic"></div><div><b id="dn" style="font-size:18px"></b><div class="t" id="dc"></div></div></div><div id="db" style="font-size:28px;font-weight:700;margin:12px 0"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><button class="s" id="dsb">Send</button><button class="s" id="drb">Receive</button></div><div id="dsend" style="display:none"><input id="dto" placeholder="Recipient address 0x..." aria-label="Recipient address"><input id="dam" inputmode="decimal" placeholder="Amount" aria-label="Amount"><button id="dgo">Send</button></div><div id="drecv" style="display:none;text-align:center"><div class="qr" id="dqr"></div><p class="t" id="dad"></p><button id="dcp">Copy address</button></div><p class="t"><a id="dlink" target="_blank" rel="noopener">Open in explorer</a></p><p class="t">Only this network\'s main coin is shown. Tokens sent to you on this network are safe at your address and visible in its explorer.</p><button class="s" id="drm" style="display:none">Remove this network</button>';
var w=d.querySelector(".w");w.appendChild(vn);w.appendChild(vd);
VIEWS.push("net","ndet");APP.push("net","ndet");
function openNet(i){cur=all()[i];$("dic").style.background=cur.c;$("dic").textContent=cur.sym.slice(0,1);$("dn").textContent=cur.name;$("dc").textContent="Chain ID "+cur.id+" | "+cur.sym;$("db").textContent="...";$("dsend").style.display="none";$("drecv").style.display="none";var l=$("dlink");if(cur.ex){l.href=cur.ex+"/address/"+W.address;l.style.display="inline"}else l.style.display="none";$("drm").style.display=cur.u?"block":"none";show("ndet");bal(cur).then(function(v){$("db").textContent=v+" "+cur.sym}).catch(function(){$("db").textContent="Could not read balance"})}
$("nback").onclick=function(){show("home")};$("dback").onclick=function(){show("net")};
$("dsb").onclick=function(){$("dsend").style.display="block";$("drecv").style.display="none"};
$("drb").onclick=function(){var q=qrcode(0,"M");q.addData(W.address);q.make();$("dqr").innerHTML=q.createSvgTag(5,0);$("dad").textContent=W.address;$("drecv").style.display="block";$("dsend").style.display="none"};
$("dcp").onclick=function(){navigator.clipboard.writeText(W.address).then(function(){msg("Address copied. Receive "+cur.sym+" on "+cur.name+" only.","ok")})};
$("dgo").onclick=async function(){var to=$("dto").value.trim(),am=$("dam").value.trim();if(!E.isAddress(to))return msg("Recipient address is not valid","er");if(!(Number(am)>0))return msg("Enter an amount","er");if(!confirm("Send "+am+" "+cur.sym+" on "+cur.name+" to\n"+to+"\n\nMake sure the receiver uses "+cur.name+". This cannot be undone."))return;msg("Sending...","");
 try{var tx=await W.connect(pv(cur)).sendTransaction({to:to,value:E.parseEther(am)});msg("Waiting for confirmation...","");await tx.wait();var m=$("msg");m.className="m ok";m.textContent="Confirmed. ";if(cur.ex){var a=d.createElement("a");a.href=cur.ex+"/tx/"+tx.hash;a.target="_blank";a.rel="noopener";a.textContent="View transaction";m.appendChild(a)}else m.textContent+=tx.hash;openNet(all().indexOf(cur))}catch(x){msg(x.shortMessage||x.message,"er")}};
$("drm").onclick=function(){if(!confirm("Remove "+cur.name+" from your list?"))return;localStorage.setItem("efik_nets",JSON.stringify(custom().filter(function(n){return n.id!=cur.id})));show("net")};
$("cn-add").onclick=async function(){var name=$("cn-name").value.trim(),rpc=$("cn-rpc").value.trim(),id=Number($("cn-id").value),sym=$("cn-sym").value.trim(),ex=$("cn-ex").value.trim().replace(/\/$/,"");
 if(!name||!sym||!id||!/^https:\/\//.test(rpc))return msg("Fill in name, symbol, chain ID and an https RPC URL","er");
 if(all().some(function(n){return n.id==id}))return msg("That chain ID is already in the list","er");
 msg("Checking the network...","");
 try{var ctl=new AbortController();setTimeout(function(){ctl.abort()},8000);var r=await fetch(rpc,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"eth_chainId",params:[]}),signal:ctl.signal}),j=await r.json(),got=parseInt(j.result,16);
  if(got!==id)return msg("That RPC reports chain "+got+", not "+id,"er");
  var c=custom();c.push({id:id,name:name,sym:sym,rpc:rpc,ex:ex,c:"#475569",u:1});localStorage.setItem("efik_nets",JSON.stringify(c));
  ["cn-name","cn-rpc","cn-id","cn-sym","cn-ex"].forEach(function(k){$(k).value=""});msg("Network added","ok");list()}catch(x){msg("Could not reach that RPC","er")}};
function openWeb(u){show("web");var i=$("wurl");i.value=u;$("wform").dispatchEvent(new Event("submit",{cancelable:true,bubbles:true}))}
var home=$("v-home"),more=home.children[2];
var c1=d.createElement("div");c1.className="card";
c1.innerHTML='<b>EfikChain apps</b><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px"><button class="s" data-w="/dex/">DEX</button><button class="s" data-w="/chart/">Price chart</button><button class="s" data-w="/connect/">Add network</button><button class="s" data-w="/whitepaper.html">Whitepaper</button><button class="s" data-w="/">Website</button><button class="s" id="hx">Explorer</button></div>';
var c2=d.createElement("div");c2.className="card";
c2.innerHTML='<b>Other networks</b><p class="t">Ethereum, BNB Chain, Polygon, Arbitrum, Optimism, Base, Avalanche, or add your own.</p><button id="hn">Open networks</button>';
home.insertBefore(c1,more);home.insertBefore(c2,more);
c1.querySelectorAll("[data-w]").forEach(function(b){b.onclick=function(){openWeb(this.getAttribute("data-w"))}});
$("hx").onclick=function(){window.open("https://explorer.efikcoin.com","_blank","noopener")};
$("hn").onclick=function(){show("net")};
var _s=window.show;window.show=function(x){_s(x);if(x=="net")list()};
})();
