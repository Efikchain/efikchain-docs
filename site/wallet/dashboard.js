(function(){
var d=document,$=function(i){return d.getElementById(i)},cur="EFIK",ST="0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822";
var v=d.createElement("div");v.id="v-coin";v.className="card";v.style.display="none";
v.innerHTML='<button class="s" id="cback" style="width:auto;padding:8px 14px;margin:0 0 10px" aria-label="Back to wallet">&#8592; Back</button><div id="chd" style="display:flex;align-items:center;gap:12px"></div><div id="cp" style="font-size:28px;font-weight:700;margin:12px 0 2px"></div><div class="t" id="cs"></div><canvas id="cc" role="img" aria-label="Price chart" style="width:100%;height:200px;background:#0b1220;border-radius:12px;margin:12px 0"></canvas><div class="t" id="cn"></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px"><button class="s" id="a-send">Send</button><button class="s" id="a-recv">Receive</button><button class="s" id="a-swap">Swap</button><button class="s" id="a-dep">Deposit</button><button class="s" id="a-wd">Withdraw</button></div><div id="cw" style="display:none;margin-top:12px"><div class="t">WEFIK: Deposit wraps EFIK into WEFIK, Withdraw unwraps it back, 1:1.</div><input id="wamt" inputmode="decimal" placeholder="Amount" aria-label="Wrap or unwrap amount"></div>';
d.querySelector(".w").appendChild(v);VIEWS.push("coin");APP.push("coin");
function paint(){var s=cur,b=BAL[s],p=PX;
$("cs").textContent="Balance: "+fmt(b)+" "+s+(s=="EUT"&&p?" (about "+fmt(b*p)+" EFIK)":"");
$("cp").textContent=!p?"...":s=="EUT"?"1 EUT = "+fmt(p)+" EFIK":s=="EFIK"?"1 EFIK = "+fmt(1/p)+" EUT":"1 WEFIK = 1 EFIK"}
function draw(p){var c=$("cc"),r=window.devicePixelRatio||1,w=c.clientWidth,h=c.clientHeight;c.width=w*r;c.height=h*r;var x=c.getContext("2d");x.scale(r,r);x.fillStyle="#8a94ad";x.font="11px sans-serif";
if(p.length<2){x.fillText("Not enough trades for a chart yet",12,20);return}
var mn=Math.min.apply(null,p),mx=Math.max.apply(null,p);if(mx==mn){mx+=1;mn-=1}
x.strokeStyle="#a78bfa";x.lineWidth=2;x.beginPath();p.forEach(function(q,i){var X=12+i*(w-24)/(p.length-1),Y=h-22-(q-mn)*(h-44)/(mx-mn);i?x.lineTo(X,Y):x.moveTo(X,Y)});x.stroke();x.fillText(mx.toFixed(4),12,12);x.fillText(mn.toFixed(4),12,h-6)}
async function chart(s){var n=$("cn");n.textContent="Loading chart...";draw([]);
try{var logs=await prov.send("eth_getLogs",[{address:POOL,fromBlock:"0x0",toBlock:"latest",topics:[ST]}]),pts=[];
logs.forEach(function(l){var h=l.data.slice(2),q=[0,1,2,3].map(function(i){return Number(BigInt("0x"+h.slice(i*64,i*64+64)))/1e18}),a=q[0]+q[2],b=q[1]+q[3];if(a>0&&b>0)pts.push(a/b)});
var tr=pts.length;if(PX)pts.push(PX);if(s!="EUT")pts=pts.map(function(x){return 1/x});
draw(pts);n.textContent=(s=="EUT"?"EUT priced in EFIK.":s=="EFIK"?"EFIK priced in EUT.":"WEFIK follows EFIK 1:1. Chart shows EFIK priced in EUT.")+" "+tr+" trades. No dollar price: no USD-priced pool exists yet."}catch(x){n.textContent="Could not load chart: "+(x.shortMessage||x.message)}}
function openCoin(s){cur=s;show("coin");
$("chd").innerHTML=(s=="EUT"?'<div class="ic" style="background:#f59e0b">E</div>':'<img class="ic" src="/assets/logo-256.png">')+'<div><b style="font-size:18px">'+s+'</b><div class="t">'+({EFIK:"EfikChain native coin",WEFIK:"Wrapped EFIK",EUT:"EUT token"})[s]+'</div></div>';
$("cw").style.display=s=="WEFIK"?"block":"none";paint();chart(s)}
async function wrap(un){var a=$("wamt").value.trim();if(!(Number(a)>0)){msg("Enter an amount in the box","er");$("wamt").focus();return}
if(!confirm((un?"Unwrap ":"Wrap ")+a+(un?" WEFIK back to EFIK?":" EFIK into WEFIK?")))return;msg("Working...","");
try{var c=new E.Contract(TOK.WEFIK,["function deposit() payable","function withdraw(uint256)"],W),tx=un?await c.withdraw(E.parseUnits(a,18)):await c.deposit({value:E.parseUnits(a,18)});await tx.wait();done(tx.hash);refresh()}catch(x){msg(x.shortMessage||x.message,"er")}}
var _r=window.render;window.render=function(){_r();var s=["EFIK","WEFIK","EUT"];d.querySelectorAll("#tl .tk").forEach(function(r,i){r.style.cursor="pointer";r.tabIndex=0;r.setAttribute("role","button");r.setAttribute("aria-label",s[i]+" dashboard");r.onclick=function(){openCoin(s[i])};r.onkeydown=function(e){if(e.key=="Enter"||e.key==" "){e.preventDefault();openCoin(s[i])}}});if($("v-coin").style.display=="block")paint()};
$("cback").onclick=function(){show("home")};
$("a-send").onclick=function(){$("asset").value=cur;show("send")};
$("a-recv").onclick=function(){showRecv()};
$("a-swap").onclick=function(){$("dir").value=cur=="EUT"?"EUT>EFIK":cur+">EUT";$("sq").textContent="";show("swap")};
$("a-dep").onclick=function(){if(cur=="WEFIK")wrap(false);else showRecv()};
$("a-wd").onclick=function(){if(cur=="WEFIK")wrap(true);else{$("asset").value=cur;show("send")}};
})();
