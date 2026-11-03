function m(t,k){var e=document.getElementById("msg");e.className="msg "+k;e.textContent=t;}
function errText(e){return "Error "+((e&&e.code!==undefined)?e.code:"")+": "+((e&&e.message)||JSON.stringify(e)||"unknown");}
async function fixPerms(){
  try{await ethereum.request({method:"wallet_revokePermissions",params:[{eth_accounts:{}}]});return true;}
  catch(x){return false;}
}
async function withRetry(fn){
  try{return await fn();}
  catch(e){
    var msg=(e&&e.message)||"";
    if(msg.indexOf("Invalid merged permissions")>-1||msg.indexOf("caip25")>-1){
      if(await fixPerms()){return await fn();}
      throw new Error("Old saved permission found. In your wallet open Settings > Connections, disconnect efikcoin.com, then reload this page.");
    }
    throw e;
  }
}
async function addNet(){
  if(!window.ethereum)return noWallet();
  try{await withRetry(function(){return switchOrAddChain(199714);});m("EfikChain added!","ok");}
  catch(e){console.error(e);m(errText(e),"er");}
}
async function addTok(addr,sym){
  if(!window.ethereum)return noWallet();
  try{
    await withRetry(function(){return switchOrAddChain(199714);});
    await withRetry(function(){return ethereum.request({method:"wallet_watchAsset",params:{type:"ERC20",options:{address:addr,symbol:sym,decimals:18,image:"https://efikcoin.com/assets/logo-256.png"}}});});
    m(sym+" request sent to wallet","ok");
  }catch(e){console.error(e);m(errText(e),"er");}
}
var _oldAddTok=addTok;
addTok=async function(addr,sym){
  await _oldAddTok(addr,sym);
  var el=document.getElementById("msg");
  if(el.className.indexOf("er")>-1){el.textContent+=" | Import manually: Import tokens > Custom token > paste "+addr;}
};
function noWallet(){
  var e=document.getElementById("msg");e.className="msg ok";e.textContent="No wallet found in this browser. Choose one:";
  function a(t,h){var x=document.createElement("a");x.href=h;x.textContent=t;x.style.cssText="display:block;margin:10px 0;color:#a78bfa";e.appendChild(x)}
  a("Open the EfikChain Wallet","/wallet/");
  a("Open in MetaMask","https://metamask.app.link/dapp/efikcoin.com/connect/");
  a("Open in Trust Wallet","https://link.trustwallet.com/open_url?coin_id=60&url=https%3A%2F%2Fefikcoin.com%2Fconnect%2F");
}
