(function(){
var d=document,$=function(i){return d.getElementById(i)},hist=[],pos=-1;
d.documentElement.lang="en";
var st=d.createElement("style");st.textContent=":focus-visible{outline:3px solid #a78bfa;outline-offset:2px}button:disabled{opacity:.4}";d.head.appendChild(st);
var v=d.createElement("div");v.id="v-web";v.className="card";v.style.display="none";
v.innerHTML='<div style="display:flex;gap:6px"><button class="s" id="wb" aria-label="Back" style="margin:0">&#8592;</button><button class="s" id="wf" aria-label="Forward" style="margin:0">&#8594;</button><button class="s" id="wr" aria-label="Reload" style="margin:0">&#8635;</button></div><form id="wform" role="search"><input id="wurl" aria-label="Search or enter address" placeholder="Search or enter address" autocapitalize="off" autocorrect="off"></form><div style="display:flex;gap:6px"><button class="s" data-u="/dex/" style="margin:0">DEX</button><button class="s" data-u="/chart/" style="margin:0">Chart</button><button class="s" data-u="https://explorer.efikcoin.com/" style="margin:0">Explorer</button><button class="s" data-u="/connect/" style="margin:0">Connect</button></div><iframe id="wfr" title="EfikChain browser" style="width:100%;height:58vh;border:0;border-radius:12px;background:#fff;margin-top:10px"></iframe><div class="t" id="wnote"></div>';
d.querySelector(".w").appendChild(v);
var nb=d.createElement("button");nb.id="n-web";nb.textContent="Browser";nb.setAttribute("onclick","show('web')");$("nav").insertBefore(nb,$("n-act"));
VIEWS.push("web");APP.push("web");
function ui(){$("wb").disabled=pos<=0;$("wf").disabled=pos>=hist.length-1}
function go(u,push){u=u.trim();if(!u)return;var url;
 if(u.charAt(0)=="/")url=location.origin+u;else if(/^https?:\/\//i.test(u))url=u;else if(/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(u))url="https://"+u;else url="https://duckduckgo.com/?q="+encodeURIComponent(u);
 var h;try{h=new URL(url).hostname}catch(x){return}
 if(!(h=="efikcoin.com"||h.slice(-12)==".efikcoin.com")){window.open(url,"_blank","noopener,noreferrer");$("wnote").textContent="Opened in a new tab: other websites cannot be shown inside this page.";return}
 if(push!==false){hist=hist.slice(0,pos+1);hist.push(url);pos=hist.length-1}
 $("wfr").src=url;$("wurl").value=url;$("wnote").textContent="";ui()}
$("wb").onclick=function(){if(pos>0){pos--;go(hist[pos],false)}};
$("wf").onclick=function(){if(pos<hist.length-1){pos++;go(hist[pos],false)}};
$("wr").onclick=function(){if(pos>=0)$("wfr").src=hist[pos]};
$("wform").onsubmit=function(e){e.preventDefault();go($("wurl").value)};
v.querySelectorAll("[data-u]").forEach(function(b){b.onclick=function(){go(this.getAttribute("data-u"))}});
function err(c,m){var e=new Error(m);e.code=c;return e}
function need(){if(!W)throw err(4100,"Wallet is locked")}
function txt(m){try{return m.indexOf("0x")==0?E.toUtf8String(m):m}catch(x){return "(binary data)"}}
var provider={isEfikWallet:true,isMetaMask:false,on:function(){},removeListener:function(){},
request:async function(a){var m=a.method,p=a.params||[];
 switch(m){
  case "eth_requestAccounts":need();if(!confirm("Allow this site to see your address?\n"+W.address))throw err(4001,"User rejected");return [W.address];
  case "eth_accounts":return W?[W.address]:[];
  case "eth_chainId":return "0x30c22";
  case "net_version":return "199714";
  case "wallet_switchEthereumChain":if(p[0]&&String(p[0].chainId).toLowerCase()!="0x30c22")throw err(4902,"Only EfikChain is supported here");return null;
  case "wallet_addEthereumChain":case "wallet_revokePermissions":return null;
  case "wallet_watchAsset":return true;
  case "eth_sendTransaction":{need();var t=p[0];if(!confirm("A site wants to send a transaction.\nTo: "+t.to+"\nValue: "+(t.value?E.formatEther(t.value):"0")+" EFIK"))throw err(4001,"User rejected");var tx=await W.sendTransaction({to:t.to,value:t.value,data:t.data});return tx.hash}
  case "personal_sign":{need();var s=p[0];if(!confirm("A site wants you to sign:\n"+txt(s)))throw err(4001,"User rejected");return W.signMessage(s.indexOf("0x")==0?E.getBytes(s):s)}
  default:return prov.send(m,p)}}};
$("wfr").addEventListener("load",function(){try{var w=this.contentWindow;if(w.location.origin==location.origin){w.ethereum=provider}}catch(x){}});
var _s=window.show;window.show=function(x){_s(x);
 ["home","swap","web","act","set"].forEach(function(k){var e=$("n-"+k);if(!e)return;e.className=k==x?"on":"";if(k==x)e.setAttribute("aria-current","page");else e.removeAttribute("aria-current")});
 var c=$("v-"+x);if(c){c.setAttribute("tabindex","-1");c.focus({preventScroll:true})}
 if(x=="web"&&!hist.length)go("/dex/")};
$("msg").setAttribute("role","status");$("msg").setAttribute("aria-live","polite");
$("nav").setAttribute("role","navigation");$("nav").setAttribute("aria-label","Main");
var L={asset:"Asset to send",dir:"Swap direction",slock:"Auto-lock time",sslip:"Swap slippage"};
d.querySelectorAll("input,select,textarea").forEach(function(i){if(!i.getAttribute("aria-label")&&!i.closest("label"))i.setAttribute("aria-label",L[i.id]||i.placeholder||i.id)});
var ad=$("ad");ad.setAttribute("role","button");ad.tabIndex=0;ad.setAttribute("aria-label","Copy wallet address");
ad.addEventListener("keydown",function(e){if(e.key=="Enter"||e.key==" "){e.preventDefault();copyAddr()}});
var K={upw:"doUnlock",cpw:"finishCreate",ipw:"doImport",amt:"doSend",samt:"quote",rpw:"showPhrase"};
Object.keys(K).forEach(function(id){$(id).addEventListener("keydown",function(e){if(e.key=="Enter"){e.preventDefault();window[K[id]]()}})});
})();
