(function(){
if(window.ethereum)return;
var KEY="efik_wallet_v1",W=null,E=null,prov=null;
function err(c,m){var e=new Error(m);e.code=c;return e}
function load(){return new Promise(function(res,rej){if(E&&prov)return res();var old=window.ethers;var s=document.createElement("script");s.src="/wallet/ethers.umd.min.js?v=6";s.onload=function(){E=window.ethers;if(old===undefined)delete window.ethers;else window.ethers=old;try{prov=new E.JsonRpcProvider("https://rpc.efikcoin.com",199714,{staticNetwork:true});res()}catch(x){rej(x)}};s.onerror=function(){window.ethers=old;rej(err(-32603,"Could not load wallet library"))};document.head.appendChild(s)})}
function ask(title,body,pw){return new Promise(function(res){
var o=document.createElement("div");o.style.cssText="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.7);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px";
var b=document.createElement("div");b.setAttribute("role","dialog");b.setAttribute("aria-modal","true");b.style.cssText="background:#111a2e;color:#e6e9f2;font-family:system-ui,sans-serif;border-radius:16px;padding:18px;max-width:420px;width:100%";
var h=document.createElement("b");h.textContent=title;var p=document.createElement("p");p.style.cssText="font-size:14px;word-break:break-word;white-space:pre-wrap;color:#c9d1e6";p.textContent=body;b.appendChild(h);b.appendChild(p);
var i=null;if(pw){i=document.createElement("input");i.type="password";i.setAttribute("aria-label","Wallet password");i.placeholder="Wallet password";i.style.cssText="width:100%;box-sizing:border-box;padding:12px;border-radius:10px;border:1px solid #243051;background:#0b1220;color:#e6e9f2;font-size:16px;margin-bottom:10px";b.appendChild(i)}
function btn(t,bg,ok){var x=document.createElement("button");x.textContent=t;x.style.cssText="width:100%;padding:12px;border:0;border-radius:12px;color:#fff;font-size:16px;font-weight:600;margin:4px 0;background:"+bg;x.onclick=function(){o.remove();res(ok?(pw?i.value:true):null)};b.appendChild(x);return x}
var ok=btn("Confirm","#8b5cf6",true);btn("Cancel","#1d2840",false);
if(i)i.addEventListener("keydown",function(e){if(e.key=="Enter")ok.click()});
o.appendChild(b);document.body.appendChild(o);(i||ok).focus()})}
async function unlock(){if(W)return;var j=null;try{j=localStorage.getItem(KEY)}catch(x){}
if(!j){await ask("No wallet on this site","Create or import your wallet at efikcoin.com/wallet first, then come back to this page.",false);throw err(4100,"No wallet found. Open efikcoin.com/wallet to create one")}
var pw=await ask("Unlock EfikChain Wallet","Enter your wallet password to connect this site. Unlocking takes a few seconds.",true);if(!pw)throw err(4001,"User rejected");
await load();try{W=(await E.Wallet.fromEncryptedJson(j,pw)).connect(prov)}catch(x){throw err(4001,"Wrong password")}}
window.ethereum={isEfikWallet:true,on:function(){},removeListener:function(){},
request:async function(a){var m=a.method,p=a.params||[];
switch(m){
case "eth_requestAccounts":await unlock();return [W.address];
case "eth_accounts":return W?[W.address]:[];
case "eth_chainId":return "0x30c22";
case "net_version":return "199714";
case "wallet_switchEthereumChain":if(p[0]&&String(p[0].chainId).toLowerCase()!="0x30c22")throw err(4902,"Only EfikChain is supported here");return null;
case "wallet_addEthereumChain":case "wallet_revokePermissions":return null;
case "wallet_watchAsset":return true;
case "eth_sendTransaction":{await unlock();var t=p[0];if(!await ask("Confirm transaction","To: "+t.to+"\nValue: "+(t.value?E.formatEther(t.value):"0")+" EFIK"+(t.data&&t.data!="0x"?"\nThis calls a contract.":""),false))throw err(4001,"User rejected");var tx=await W.sendTransaction({to:t.to,value:t.value,data:t.data});return tx.hash}
case "personal_sign":{await unlock();var s=p[0],t2;try{t2=s.indexOf("0x")==0?E.toUtf8String(s):s}catch(x){t2="(binary data)"}if(!await ask("Sign message",t2,false))throw err(4001,"User rejected");return W.signMessage(s.indexOf("0x")==0?E.getBytes(s):s)}
default:await load();return prov.send(m,p)}}};
})();
