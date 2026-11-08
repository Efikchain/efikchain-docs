(function(){
var P2P='0x389Cb2f5BF30C96d5cEA59dC460bF1Dbe2Fe2485',FAC='0x3A9A76315b562457891F994CB2Ebc557EbC943b3',WEF='0x57c49E28d5F291B5461D96709851555F7Ce49594',EUT='0xcC20fc280ccbe1cb124c434c36DBBee946e05a83',EUT_USD=1;
var V6=!ethers.providers;
var ro=V6?new ethers.JsonRpcProvider('https://rpc.efikcoin.com',199714,{staticNetwork:true}):new ethers.providers.StaticJsonRpcProvider('https://rpc.efikcoin.com',199714);
var Z=V6?ethers.ZeroAddress:ethers.constants.AddressZero;
var fE=V6?ethers.formatEther:ethers.utils.formatEther,pE=V6?ethers.parseEther:ethers.utils.parseEther;
function kc(t){return V6?ethers.keccak256(ethers.toUtf8Bytes(t)):ethers.utils.keccak256(ethers.utils.toUtf8Bytes(t))}
var ST=['None','Open','Taken','Paid','Disputed','Completed','Cancelled'];
var ABI=["function offerCount() view returns (uint256)","function offers(uint256) view returns (address seller,address buyer,address token,uint256 amount,uint64 payWindow,uint64 deadline,uint64 paidAt,uint64 disputedAt,uint8 status,string terms)","function createOffer(address token,uint256 amount,uint64 payWindow,string terms) payable returns (uint256)","function take(uint256)","function markPaid(uint256)","function release(uint256)","function cancelOffer(uint256)","function reclaim(uint256)","function dispute(uint256)","event OfferCreated(uint256 indexed id,address indexed seller,address token,uint256 amount,uint64 payWindow,string terms)"];
var BANKS=['Access Bank','Zenith Bank','GTBank','First Bank','UBA','Fidelity Bank','FCMB','Union Bank','Sterling Bank','Stanbic IBTC','Wema Bank','Polaris Bank','Keystone Bank','Ecobank','Heritage Bank','Unity Bank','Providus Bank','Jaiz Bank'],FIN=['Opay','PalmPay','Moniepoint','Kuda'],CUR=['NGN','USD','GHS','KES','ZAR','EUR','GBP'];
var CODES={'Access Bank':'044','Zenith Bank':'057','GTBank':'058','First Bank':'011','UBA':'033','Fidelity Bank':'070','FCMB':'214','Union Bank':'032','Sterling Bank':'232','Stanbic IBTC':'221','Wema Bank':'035','Polaris Bank':'076','Keystone Bank':'082','Ecobank':'050','Heritage Bank':'030','Unity Bank':'215','Providus Bank':'101','Jaiz Bank':'301'};
function chk(bank,ac){
 if(!bank||!ac)return {m:'',c:'#93a08a'};
 if(!/^[0-9]{10}$/.test(ac))return {m:'Account number should be 10 digits ('+ac.length+' so far).',c:'#ff8a7a',bad:1};
 var code=CODES[bank];
 if(!code)return {m:'10 digits. The last digit cannot be checked for this bank or app, so double-check it.',c:'#ffb86b'};
 var w=[3,7,3,3,7,3,3,7,3,3,7,3],s=code+ac.slice(0,9),t=0;
 for(var i=0;i<12;i++)t+=Number(s[i])*w[i];
 var k=(10-t%10)%10;
 return k===Number(ac[9])?{m:'✓ This account number is valid for '+bank+'.',c:'#8fe388'}:{m:'✗ This number does not match '+bank+'. Check the number and the bank.',c:'#ff8a7a',bad:1};
}
var o,msg,list,hd,price=null;
function W0(){return (typeof W!=='undefined'&&W&&W.address)?W:null}
function sg(){var w=W0();return w?w.connect(ro):null}
function ct(){return new ethers.Contract(P2P,ABI,sg()||ro)}
function sh(a){return a.slice(0,6)+'…'+a.slice(-4)}
function num(x){return Number(String(x))}
function say(t,e){msg.textContent=t;msg.style.color=e?'#ff8a7a':'#93a08a'}
function er(e){return e.reason||(e.error&&e.error.message)||e.shortMessage||e.message}
function mk(tag,txt,css){var d=document.createElement(tag);if(txt)d.textContent=txt;if(css)d.style.cssText=css;return d}
async function act(fn){
 if(!sg()){say('Unlock your wallet first, then open P2P again.',1);return}
 try{say('Confirm in your wallet…');var tx=await fn();say('Waiting for the block…');await tx.wait();say('Done.');load()}catch(e){say(er(e),1)}
}
async function vstat(){try{var r=await fetch('/p2papi/status',{cache:'no-store'});return await r.json()}catch(e){return null}}
async function getPrice(){
 try{
  var f=new ethers.Contract(FAC,["function getPair(address,address) view returns (address)"],ro);
  var pa=await f.getPair(WEF,EUT);if(pa===Z)throw 0;
  var p=new ethers.Contract(pa,["function getReserves() view returns (uint112,uint112,uint32)","function token0() view returns (address)"],ro);
  var r=await p.getReserves(),t0=await p.token0();
  var a=t0.toLowerCase()===WEF.toLowerCase()?[r[0],r[1]]:[r[1],r[0]];
  if(String(a[0])==='0')throw 0;
  price=num(a[1])/num(a[0])*EUT_USD;
 }catch(e){price=null}
}
async function head(){
 var w=W0();if(!w){hd.textContent='Wallet locked. Unlock it, then reopen P2P.';return}
 var v=Number(fE(await ro.getBalance(w.address)));
 hd.textContent=sh(w.address)+' · '+v.toLocaleString(undefined,{maximumFractionDigits:4})+' EFIK'+(price!==null?' ≈ $'+(v*price).toFixed(2)+' (1 EFIK ≈ $'+price.toFixed(4)+', from the pool)':' · no pool price yet');
}
function fmtLeft(s){var h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h>0?h+'h '+m+'m':m+'m '+(s%60)+'s'}
function cd(l,ts){var s=mk('span');s.setAttribute('data-ts',ts);s.setAttribute('data-l',l);return s}
function tick(){var n=Math.floor(Date.now()/1000);document.querySelectorAll('#efikp2p [data-ts]').forEach(function(s){var l=Number(s.getAttribute('data-ts'))-n;s.textContent=s.getAttribute('data-l')+': '+(l<=0?'time is up':fmtLeft(l))})}
async function upload(id,d){
 var h=kc(d),sig=await W0().signMessage('EfikP2P put:'+id+':'+h);
 var r=await fetch('/p2papi/put',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:id,details:d,sig:sig})});
 if(!r.ok)throw new Error('Could not save payment details. Use the Save payment details button on the offer, or cancel it.');
 localStorage.removeItem('p2pd'+id);
}
function idFrom(rc){
 for(var k=0;k<rc.logs.length;k++){var l=rc.logs[k];if(String(l.address).toLowerCase()!==P2P.toLowerCase())continue;
  try{var p=ct().interface.parseLog({topics:l.topics,data:l.data});if(p&&p.name==='OfferCreated')return num(p.args.id)}catch(e){}}
 return 0;
}
async function showDetails(id,box){
 if(!W0()){say('Unlock your wallet first.',1);return}
 try{
  say('Checking…');var ts=Math.floor(Date.now()/1000),sig=await W0().signMessage('EfikP2P read:'+id+':'+ts);
  var r=await fetch('/p2papi/get?id='+id+'&ts='+ts+'&sig='+encodeURIComponent(sig),{cache:'no-store'}),j=await r.json();
  if(!j.details)throw new Error(j.error==='not allowed'?'Only the buyer of a taken offer can see these details.':'Details are not available.');
  var p=j.details.split('|');box.textContent='';
  [['Bank',p[0]],['Account name',p[1]],['Account number',p[2]]].forEach(function(x){box.appendChild(mk('div',x[0]+': '+(x[1]||''),'word-break:break-all'))});
  var c=mk('button','Copy account number');c.onclick=function(){if(navigator.clipboard)navigator.clipboard.writeText(p[2]||'')};box.appendChild(c);
  say('Check the account name in your bank app matches, then send the agreed amount and tap I have paid.');
 }catch(e){say(er(e),1)}
}
function renderOffer(i,f,me,has,vOk){
 var st=num(f.status),d=mk('div',null,'border-top:1px solid #2a3626;padding:10px 0');
 var t={};try{t=JSON.parse(f.terms)}catch(e){t={m:f.terms}}
 var amt=Number(fE(f.amount));
 var pt=t.p?(t.c+' '+t.p+' each, total '+t.c+' '+(t.p*amt).toFixed(t.p*amt<1?4:2)):(t.usd?'$'+t.usd+' each':'');
 var pay=t.b?t.b:(t.m?t.m+(t.d?' — '+t.d:''):(t.pay||''));
 d.appendChild(mk('div','#'+i+' · '+amt+' EFIK · '+ST[st]));
 if(pt)d.appendChild(mk('div',pt));
 d.appendChild(mk('div','Seller '+sh(f.seller)+(pay?' · Pays to: '+pay:''),'color:#93a08a;word-break:break-all'));
 var c=mk('div',null,'color:#ffb86b;font-size:14px');
 if(st===2)c.appendChild(cd('Time to pay',num(f.deadline)));
 else if(st===3)c.appendChild(cd('Dispute opens in',num(f.paidAt)+3600));
 else if(st===4)c.appendChild(cd('Auto-split after 30 days in',num(f.disputedAt)+2592000));
 if(c.firstChild)d.appendChild(c);
 var isS=f.seller.toLowerCase()===me,isB=f.buyer.toLowerCase()===me,now=Math.floor(Date.now()/1000);
 var r=mk('div',null,'display:flex;gap:8px;flex-wrap:wrap;margin-top:8px'),box=mk('div',null,'margin-top:8px');
 function btn(x,fn){var b=mk('button',x);b.onclick=fn;r.appendChild(b)}
 function call(m,q){return function(){if(q&&!confirm(q))return;act(function(){return ct()[m](i)})}}
 var relQ='Release only after the money is already in YOUR bank account. This cannot be undone. Continue?';
 if(st===1){
  if(isS){btn('Cancel offer',call('cancelOffer'));
   if(has.indexOf(i)<0&&localStorage.getItem('p2pd'+i))btn('Save payment details',async function(){try{say('Saving…');await upload(i,localStorage.getItem('p2pd'+i));say('Saved.');load()}catch(e){say(er(e),1)}})}
  else if(!vOk)d.appendChild(mk('div','Payment server not reachable. Try again soon.','color:#ff8a7a;font-size:14px'));
  else if(has.indexOf(i)<0)d.appendChild(mk('div','The seller has not saved payment details yet.','color:#ffb86b;font-size:14px'));
  else btn('Take offer',call('take','You must send '+(t.p?t.c+' '+(t.p*amt).toFixed(t.p*amt<1?4:2):'the agreed amount')+' to the seller bank account within the time limit, then tap I have paid. Continue?'));
 }
 if(st===2){if(isB){btn('Show payment details',function(){showDetails(i,box)});btn('I have paid',call('markPaid'))}
  if(isS){btn('Release EFIK',call('release',relQ));if(now>num(f.deadline))btn('Reopen',call('reclaim'))}}
 if(st===3){if(isB)btn('Show payment details',function(){showDetails(i,box)});if(isS)btn('Release EFIK',call('release',relQ));
  if(isS||isB)btn('Open dispute',call('dispute','Open a dispute? The arbiter will decide. Continue?'))}
 if(st===4){if(isB)btn('Show payment details',function(){showDetails(i,box)});if(isS)btn('Release EFIK',call('release',relQ))}
 var cbox=mk('div',null,'margin-top:8px');if(st>=2&&st<=5&&(isS||isB))btn('Chat',function(){chatToggle(i,cbox)});if(r.firstChild)d.appendChild(r);d.appendChild(box);d.appendChild(cbox);return d;
}
async function load(){
 list.textContent='Loading…';
 try{
  await getPrice();await head();
  var vs=await vstat(),has=(vs&&vs.has)||[],vOk=!!vs;
  var n=num(await ct().offerCount());list.textContent='';
  if(!n){list.textContent='No offers yet. Post the first one.';return}
  var me=W0()?W0().address.toLowerCase():'';
  for(var i=n;i>Math.max(0,n-15);i--){var f=await ct().offers(i);list.appendChild(renderOffer(i,f,me,has,vOk))}
  tick();
 }catch(e){list.textContent='Could not load offers: '+er(e)}
}
function opts(a){return a.map(function(x){return '<option>'+x+'</option>'}).join('')}
function build(){
 o=document.createElement('div');o.id='efikp2p';
 o.style.cssText='display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;background:#10150f;color:#eef2e6;overflow:auto;padding:calc(env(safe-area-inset-top,0px) + 14px) 14px 40px;font:16px/1.45 system-ui,sans-serif';
 o.innerHTML='<style>#efikp2p input,#efikp2p select{width:100%;box-sizing:border-box;background:#10150f;color:#eef2e6;border:1px solid #2a3626;border-radius:8px;padding:10px;font-size:16px;margin:4px 0 8px}#efikp2p button{background:#d8f24a;color:#10150f;border:0;border-radius:8px;padding:10px 14px;font-weight:600;font-size:15px}</style><div style="max-width:560px;margin:auto"><div style="display:flex;justify-content:space-between;align-items:center"><h2 style="margin:0">P2P market</h2><button id="p2x">Close</button></div><div id="p2h" style="color:#93a08a;margin:8px 0"></div><button id="p2al" style="margin-bottom:8px">Turn on phone alerts</button><div style="color:#93a08a;font-size:14px">The seller locks EFIK in escrow. The buyer pays the seller bank account directly, then taps I have paid. The seller releases the EFIK only after the money arrives. Disputes go to the arbiter.</div><h3>Sell EFIK</h3><input id="p2m" placeholder="EFIK to sell" inputmode="decimal"><div style="display:flex;gap:8px"><input id="p2u" placeholder="Price per EFIK" inputmode="decimal"><select id="p2c" style="width:40%">'+opts(CUR)+'</select></div><select id="p2b"><option value="">Choose your bank</option><optgroup label="Banks">'+opts(BANKS)+'</optgroup><optgroup label="Mobile money and fintech">'+opts(FIN)+'</optgroup><option value="Other">Other bank</option></select><input id="p2o" placeholder="Bank name" style="display:none" maxlength="40"><input id="p2n" placeholder="Account name" maxlength="60"><input id="p2a" placeholder="Account number (10 digits)" inputmode="numeric" maxlength="10"><div id="p2v" style="font-size:14px;min-height:20px;margin-bottom:8px"></div><input id="p2w" placeholder="Minutes the buyer has to pay (15 to 1440)" inputmode="numeric" value="30"><div style="color:#ffb86b;font-size:13px;margin-bottom:8px">Your bank details are stored encrypted on the EfikChain server. Only the buyer of your offer can read them, and only after taking it.</div><button id="p2s">Lock EFIK and post offer</button><div id="p2g" style="min-height:20px;margin-top:8px;font-size:14px;word-break:break-all"></div><h3>Offers</h3><div id="p2l"></div></div>';
 document.body.appendChild(o);
 msg=o.querySelector('#p2g');list=o.querySelector('#p2l');hd=o.querySelector('#p2h');o.querySelector('#p2al').onclick=function(){if(window.Notification)Notification.requestPermission().then(function(p){say(p==='granted'?'Alerts are on.':'Alerts are blocked in your browser settings.',p!=='granted')});else say('This browser does not support phone alerts.',1)};
 var bk=o.querySelector('#p2b'),ot=o.querySelector('#p2o'),ai=o.querySelector('#p2a'),vv=o.querySelector('#p2v');
 function cv(){var r=chk(bk.value==='Other'?ot.value.trim():bk.value,ai.value.trim());vv.textContent=r.m;vv.style.color=r.c}
 bk.onchange=function(){ot.style.display=bk.value==='Other'?'block':'none';cv()};ai.oninput=cv;ot.oninput=cv;
 o.querySelector('#p2x').onclick=function(){o.style.display='none'};
 o.querySelector('#p2s').onclick=async function(){
  if(!sg()){say('Unlock your wallet first.',1);return}
  try{
   var am=o.querySelector('#p2m').value,pr=parseFloat(o.querySelector('#p2u').value),cu=o.querySelector('#p2c').value,wn=parseInt(o.querySelector('#p2w').value,10);
   var bank=bk.value==='Other'?ot.value.trim().replace(/[|"\\]/g,''):bk.value,nm=o.querySelector('#p2n').value.trim().replace(/[|"\\]/g,' '),ac=ai.value.trim();
   if(!(parseFloat(am)>0)||!(pr>0))throw new Error('Enter the EFIK amount and your price.');
   if(!bank)throw new Error('Choose your bank.');
   if(nm.length<3)throw new Error('Enter the account name.');
   if(!/^[0-9]{10}$/.test(ac))throw new Error('Account number must be 10 digits.');
   if(!(wn>=15&&wn<=1440))throw new Error('Pay window must be 15 to 1440 minutes.');
   var vr=chk(bank,ac);
   if(vr.bad&&!confirm('Warning: '+vr.m+'\n\nPost the offer anyway?'))throw new Error('Check the account number and try again.');
   if(!confirm('Check carefully. The buyer will send money to:\n\nBank: '+bank+'\nName: '+nm+'\nNumber: '+ac+'\n\nWrong details mean lost money. Post this offer?'))throw new Error('Cancelled. Nothing was sent.');
   var det=bank+'|'+nm+'|'+ac,terms=JSON.stringify({p:pr,c:cu,m:'Bank',b:bank,h:kc(det)});
   if(terms.length>195)throw new Error('Bank name is too long.');
   var wei=pE(am);say('Confirm in your wallet…');
   var tx=await ct().createOffer(Z,wei,wn*60,terms,{value:wei});say('Waiting for the block…');
   var rc=await tx.wait(),id=idFrom(rc)||num(await ct().offerCount());
   localStorage.setItem('p2pd'+id,det);say('Saving payment details securely…');
   await upload(id,det);say('Offer #'+id+' is live.');load();
  }catch(e){say(er(e),1);load()}
 };
 setInterval(tick,1000);
}
async function chatList(id){
 var ts=Math.floor(Date.now()/1000),sig=await W0().signMessage('EfikP2P chatread:'+id+':'+ts);
 var r=await fetch('/p2papi/chat/list?id='+id+'&ts='+ts+'&sig='+encodeURIComponent(sig),{cache:'no-store'}),j=await r.json();
 if(!j.messages)throw new Error('Chat is not available for this trade.');
 return j.messages;
}
async function chatSend(id,text){
 var ts=Math.floor(Date.now()/1000),sig=await W0().signMessage('EfikP2P chat:'+id+':'+ts+':'+kc(text));
 var r=await fetch('/p2papi/chat/send',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:id,ts:ts,text:text,sig:sig})});
 if(!r.ok)throw new Error('Message not sent. Chat is open only while the trade is active.');
}
var ctm={};
async function chatToggle(id,box){
 if(box.firstChild){box.textContent='';clearInterval(ctm[id]);return}
 var lst=mk('div',null,'max-height:220px;overflow:auto;background:#0b100a;border:1px solid #2a3626;border-radius:8px;padding:8px;font-size:14px'),inp=mk('input'),sb=mk('button','Send');
 inp.placeholder='Type a message to the other person';inp.maxLength=500;
 box.appendChild(lst);box.appendChild(inp);box.appendChild(sb);
 async function refresh(){
  if(!document.body.contains(lst)){clearInterval(ctm[id]);return}
  try{var m=await chatList(id),me=W0().address.toLowerCase();lst.textContent='';
   if(!m.length)lst.textContent='No messages yet. Say hello and confirm the payment details.';
   m.forEach(function(x){var mine=x.f.toLowerCase()===me,row=mk('div',null,'margin:4px 0;text-align:'+(mine?'right':'left'));
    row.appendChild(mk('span',x.t,'display:inline-block;max-width:85%;padding:6px 10px;border-radius:10px;word-break:break-word;background:'+(mine?'#d8f24a;color:#10150f':'#1c2a18')));lst.appendChild(row)});
   lst.scrollTop=lst.scrollHeight}catch(e){lst.textContent=er(e)}
 }
 sb.onclick=async function(){var t=inp.value.trim().slice(0,500);if(!t)return;try{sb.disabled=true;await chatSend(id,t);inp.value='';await refresh()}catch(e){say(er(e),1)}sb.disabled=false};
 await refresh();ctm[id]=setInterval(refresh,8000);
}
function beep(){try{var a=new (window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=880;g.gain.value=0.15;o.start();o.stop(a.currentTime+0.25)}catch(e){}}
function banner(t){
 var b=document.getElementById('p2nb');
 if(!b){b=mk('div',null,'position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top,0px) + 12px);z-index:10000;background:#d8f24a;color:#10150f;border-radius:10px;padding:12px 14px;font:600 15px/1.35 system-ui,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.4)');b.id='p2nb';b.onclick=function(){b.style.display='none';if(window.EfikP2P)EfikP2P.open()};document.body.appendChild(b)}
 b.textContent=t+' (tap to open P2P)';b.style.display='block';beep();if(navigator.vibrate)navigator.vibrate(200);
 try{if(window.Notification&&Notification.permission==='granted'){if(navigator.serviceWorker&&navigator.serviceWorker.getRegistration){navigator.serviceWorker.getRegistration('/wallet/').then(function(r){if(r)r.showNotification('EfikChain P2P',{body:t,icon:'icon-192.png'});else new Notification('EfikChain P2P',{body:t})})}else new Notification('EfikChain P2P',{body:t})}}catch(e){}
 clearTimeout(b._t);b._t=setTimeout(function(){b.style.display='none'},12000);
}
var known=null,pbusy=false;
async function npoll(){
 if(pbusy||!W0())return;pbusy=true;
 try{
  var vs=await vstat();if(!vs||!vs.offers){pbusy=false;return}
  var me=W0().address.toLowerCase(),cur={},k;
  for(k in vs.offers)cur[k]=vs.offers[k].s;
  if(known===null||known._me!==me){known={_me:me};for(k in cur)known[k]=cur[k];pbusy=false;return}
  var ids={};
  for(k in cur)if(known[k]!==cur[k])ids[k]=1;
  for(k in known)if(k!=='_me'&&cur[k]===undefined)ids[k]=1;
  for(k in ids){
   var f=await ct().offers(Number(k)),st=num(f.status),isS=f.seller.toLowerCase()===me,isB=f.buyer.toLowerCase()===me,amt=Number(fE(f.amount)),m=null,t={};
   try{t=JSON.parse(f.terms)}catch(e){}
   if(known[k]===undefined&&st===1&&!isS)m='New offer #'+k+': '+amt+' EFIK'+(t.p?' at '+t.c+' '+t.p+' each':'');
   else if(isS&&st===2)m='Someone took your offer #'+k+'. They must pay within the time limit.';
   else if(isS&&st===3)m='Buyer says offer #'+k+' is paid. Check your bank, then release.';
   else if(isB&&st===5)m='EFIK was released to you for offer #'+k+'.';
   else if((isS||isB)&&st===4)m='A dispute was opened on offer #'+k+'.';
   else if(isB&&st===1)m='Offer #'+k+' was reopened because payment was late.';
   if(m)banner(m);
  }
  known={_me:me};for(k in cur)known[k]=cur[k];
 }catch(e){}
 pbusy=false;
}
setTimeout(npoll,4000);setInterval(npoll,20000);
var lastP=0;
async function usdTick(){
 try{
  var t=document.getElementById('tot');if(!t)return;
  if(!lastP||Date.now()-lastP>60000){await getPrice();lastP=Date.now()}
  var d=document.getElementById('totusd');
  if(!d){d=document.createElement('div');d.id='totusd';d.className='t';d.style.cssText='opacity:.9;margin-top:2px';t.parentNode.insertBefore(d,t.nextSibling)}
  var v=parseFloat(String(t.textContent).replace(/[^0-9.]/g,''));
  if(price===null||!(v>=0)){d.textContent='';return}
  d.textContent='≈ $'+(v*price).toLocaleString(undefined,{maximumFractionDigits:2})+' (1 EFIK ≈ $'+price.toFixed(4)+')';
 }catch(e){}
}
setTimeout(usdTick,3000);setInterval(usdTick,15000);
var dp=null;window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();dp=e});
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js',{scope:'/wallet/'}).catch(function(){});
window.EfikP2P={open:function(){if(!o)build();o.style.display='block';load()},openMode:function(){window.EfikP2P.open()}};
})();
