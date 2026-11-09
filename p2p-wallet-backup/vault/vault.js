require('dotenv').config({path:__dirname+'/.env'});
const http=require('http'),fs=require('fs'),crypto=require('crypto');
const {ethers}=require('ethers');
const P2P='0x389Cb2f5BF30C96d5cEA59dC460bF1Dbe2Fe2485';
const prov=new ethers.JsonRpcProvider('https://rpc.efikcoin.com',199714,{staticNetwork:true});
const c=new ethers.Contract(P2P,[
"function offerCount() view returns (uint256)","function arbiter() view returns (address)",
"function offers(uint256) view returns (address seller,address buyer,address token,uint256 amount,uint64 payWindow,uint64 deadline,uint64 paidAt,uint64 disputedAt,uint8 status,string terms)",
"function forceSplit(uint256)"],prov);
const KEY=Buffer.from(process.env.VAULT_KEY||'','hex');
if(KEY.length!==32){console.error('VAULT_KEY missing');process.exit(1)}
const DB=__dirname+'/data.json',STF=__dirname+'/status.json';
let db={};try{db=JSON.parse(fs.readFileSync(DB,'utf8'))}catch(e){}
const CH=__dirname+'/chat.json';let chat={};try{chat=JSON.parse(fs.readFileSync(CH,'utf8'))}catch(e){}
const PF=__dirname+'/proofs.json';let proofs={};try{proofs=JSON.parse(fs.readFileSync(PF,'utf8'))}catch(e){}
const body2=(req,max)=>new Promise((ok,no)=>{let b='';req.on('data',d=>{b+=d;if(b.length>max){no(new Error('big'));req.destroy()}});req.on('end',()=>ok(b));req.on('error',no)});
const wr=(f,o)=>{fs.writeFileSync(f+'.tmp',JSON.stringify(o));fs.renameSync(f+'.tmp',f)};
function enc(t){const iv=crypto.randomBytes(12),ci=crypto.createCipheriv('aes-256-gcm',KEY,iv),b=Buffer.concat([ci.update(t,'utf8'),ci.final()]);return Buffer.concat([iv,ci.getAuthTag(),b]).toString('base64')}
function dec(s){const b=Buffer.from(s,'base64'),d=crypto.createDecipheriv('aes-256-gcm',KEY,b.subarray(0,12));d.setAuthTag(b.subarray(12,28));return Buffer.concat([d.update(b.subarray(28)),d.final()]).toString('utf8')}
const hits={};setInterval(()=>{for(const k in hits)delete hits[k]},60000);
const body=req=>new Promise((ok,no)=>{let b='';req.on('data',d=>{b+=d;if(b.length>3000){no(new Error('big'));req.destroy()}});req.on('end',()=>ok(b));req.on('error',no)});
const send=(res,code,o)=>{res.writeHead(code,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(o))};
http.createServer(async(req,res)=>{
 try{
  const ip=req.headers['x-real-ip']||req.socket.remoteAddress;hits[ip]=(hits[ip]||0)+1;
  if(hits[ip]>40)return send(res,429,{error:'slow down'});
  const u=new URL(req.url,'http://x');
  if(req.method==='GET'&&u.pathname==='/status'){let s={};try{s=JSON.parse(fs.readFileSync(STF,'utf8'))}catch(e){}s.has=Object.keys(db).map(Number);return send(res,200,s)}
  if(req.method==='POST'&&u.pathname==='/put'){
   const b=JSON.parse(await body(req)),id=Number(b.id),d=String(b.details||'');
   if(!(id>0)||d.length>500||d.length<5)return send(res,400,{error:'bad request'});
   const o=await c.offers(id),h=ethers.keccak256(ethers.toUtf8Bytes(d));
   const who=ethers.verifyMessage('EfikP2P put:'+id+':'+h,String(b.sig));
   let t={};try{t=JSON.parse(o.terms)}catch(e){}
   if(who!==o.seller||Number(o.status)!==1||t.h!==h)return send(res,403,{error:'not allowed'});
   db[id]=enc(d);wr(DB,db);return send(res,200,{ok:true});
  }
  if(req.method==='GET'&&u.pathname==='/get'){
   const id=Number(u.searchParams.get('id')),ts=Number(u.searchParams.get('ts'));
   if(!(id>0)||Math.abs(Date.now()/1000-ts)>300||!db[id])return send(res,404,{error:'not found'});
   const who=ethers.verifyMessage('EfikP2P read:'+id+':'+ts,String(u.searchParams.get('sig'))),o=await c.offers(id),s=Number(o.status);
   const ok=(who===o.buyer&&s>=2&&s<=4)||who===o.seller||(s===4&&who===await c.arbiter());
   if(!ok)return send(res,403,{error:'not allowed'});
   return send(res,200,{details:dec(db[id])});
  }
    if(req.method==='POST'&&u.pathname==='/chat/send'){
   const b=JSON.parse(await body(req)),id=Number(b.id),ts=Number(b.ts),tx=String(b.text||'').trim().slice(0,500);
   if(!(id>0)||!tx||!(Math.abs(Date.now()/1000-ts)<300))return send(res,400,{error:'bad request'});
   const h=ethers.keccak256(ethers.toUtf8Bytes(tx)),who=ethers.verifyMessage('EfikP2P chat:'+id+':'+ts+':'+h,String(b.sig));
   const o=await c.offers(id),s=Number(o.status);
   const ok=(s>=2&&s<=4&&(who===o.seller||who===o.buyer))||(s===4&&who===await c.arbiter());
   if(!ok)return send(res,403,{error:'not allowed'});
   const k='c'+id;let a=[];try{a=JSON.parse(dec(chat[k]))}catch(e){}
   a.push({f:who,t:tx,ts:Math.floor(Date.now()/1000)});a=a.slice(-200);chat[k]=enc(JSON.stringify(a));wr(CH,chat);
   return send(res,200,{ok:true});
  }
  if(req.method==='GET'&&u.pathname==='/chat/list'){
   const id=Number(u.searchParams.get('id')),ts=Number(u.searchParams.get('ts'));
   if(!(id>0)||!(Math.abs(Date.now()/1000-ts)<300))return send(res,400,{error:'bad request'});
   const who=ethers.verifyMessage('EfikP2P chatread:'+id+':'+ts,String(u.searchParams.get('sig'))),o=await c.offers(id),s=Number(o.status);
   const ok=(s>=2&&s<=5&&(who===o.seller||who===o.buyer))||(s===4&&who===await c.arbiter());
   if(!ok)return send(res,403,{error:'not allowed'});
   let a=[];try{a=JSON.parse(dec(chat['c'+id]))}catch(e){}
   return send(res,200,{messages:a});
  }
    if(req.method==='POST'&&u.pathname==='/proof/put'){
   const b=JSON.parse(await body2(req,600000)),id=Number(b.id),ts=Number(b.ts),img=String(b.img||''),note=String(b.note||'').slice(0,300);
   if(!(id>0)||!(Math.abs(Date.now()/1000-ts)<300)||img.length>450000||(img&&!/^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(img))||(!img&&!note))return send(res,400,{error:'bad request'});
   const h=ethers.keccak256(ethers.toUtf8Bytes(img+'|'+note)),who=ethers.verifyMessage('EfikP2P proof:'+id+':'+ts+':'+h,String(b.sig));
   const o=await c.offers(id),s=Number(o.status);
   if(!(s>=2&&s<=4&&(who===o.seller||who===o.buyer)))return send(res,403,{error:'not allowed'});
   const k='p'+id;let a=[];try{a=JSON.parse(dec(proofs[k]))}catch(e){}
   if(a.length>=10)return send(res,400,{error:'too many'});
   a.push({f:who,role:who===o.seller?'seller':'buyer',note:note,img:img,ts:Math.floor(Date.now()/1000)});
   proofs[k]=enc(JSON.stringify(a));wr(PF,proofs);
   return send(res,200,{ok:true});
  }
  if(req.method==='GET'&&u.pathname==='/proof/list'){
   const id=Number(u.searchParams.get('id')),ts=Number(u.searchParams.get('ts'));
   if(!(id>0)||!(Math.abs(Date.now()/1000-ts)<300))return send(res,400,{error:'bad request'});
   const who=ethers.verifyMessage('EfikP2P proofread:'+id+':'+ts,String(u.searchParams.get('sig'))),o=await c.offers(id),s=Number(o.status);
   const ok=(s>=2&&s<=5&&(who===o.seller||who===o.buyer))||(s===4&&who===await c.arbiter());
   if(!ok)return send(res,403,{error:'not allowed'});
   let a=[];try{a=JSON.parse(dec(proofs['p'+id]))}catch(e){}
   return send(res,200,{proofs:a});
  }
  send(res,404,{error:'no'});
 }catch(e){send(res,400,{error:'bad request'})}
}).listen(8787,'127.0.0.1');
const kw=process.env.KEEPER_KEY?new ethers.Wallet(process.env.KEEPER_KEY,prov):null;
async function tick(){
 try{
  const now=Math.floor(Date.now()/1000),n=Number(await c.offerCount()),out={};
  for(let id=Math.max(1,n-200);id<=n;id++){
   const o=await c.offers(id),s=Number(o.status);if(s===0||s>=5)continue;
   const e={s};
   if(s===2)e.expired=now>Number(o.deadline);
   if(s===3)e.disputeAt=Number(o.paidAt)+3600;
   if(s===4){e.splitAt=Number(o.disputedAt)+2592000;
    if(kw&&now>=e.splitAt){try{const tx=await c.connect(kw).forceSplit(id);await tx.wait();console.log('forceSplit',id)}catch(x){console.log('split fail',id,x.shortMessage||x.message)}}}
   out[id]=e;
  }
  wr(STF,{updated:now,offers:out});
 }catch(e){console.log('tick fail',e.shortMessage||e.message)}
 setTimeout(tick,15000);
}
tick();
