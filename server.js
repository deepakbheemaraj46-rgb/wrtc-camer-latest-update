"use strict";
const http=require("http");
const fs=require("fs");
const path=require("path");
const crypto=require("crypto");
const WebSocket=require("ws");
const PORT=process.env.PORT||10000;
const ROOT=__dirname;
const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,"http://localhost").pathname;
  const files={"/":"camera.html","/viewer":"viewer.html"};
  const name=files[pathname];
  if(!name){res.writeHead(404,{"Content-Type":"text/plain; charset=utf-8"});return res.end("Not found");}
  fs.readFile(path.join(ROOT,name),(err,data)=>{
    if(err){res.writeHead(500);return res.end("Could not load page");}
    res.writeHead(200,{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"});
    res.end(data);
  });
});
const wss=new WebSocket.Server({server});
const cameras=new Map(),viewers=new Map();
function send(ws,msg){if(ws&&ws.readyState===WebSocket.OPEN){try{ws.send(JSON.stringify(msg));return true}catch{}}return false;}
function safeClose(ws){if(ws&&ws.readyState< WebSocket.CLOSING)try{ws.close()}catch{}}
wss.on("connection",ws=>{
  let role=null,id=null;
  ws.on("message",raw=>{
    let m;try{m=JSON.parse(raw.toString())}catch{return}
    if(m.type==="register-camera"&&typeof m.cameraId==="string"){
      role="camera";id=m.cameraId;
      const old=cameras.get(id);if(old&&old!==ws)safeClose(old);
      cameras.set(id,ws);
      for(const viewer of viewers.values())send(viewer,{type:"camera-online",cameraId:id});
      return;
    }
    if(m.type==="unregister-camera"){
      if(role==="camera"&&cameras.get(id)===ws)cameras.delete(id);
      return;
    }
    if(m.type==="register-viewer"&&typeof m.viewerId==="string"){
      role="viewer";id=m.viewerId;
      const old=viewers.get(id);if(old&&old!==ws)safeClose(old);
      viewers.set(id,ws);
      for(const cameraId of cameras.keys())send(ws,{type:"camera-online",cameraId});
      return;
    }
    if(m.type==="watch-camera"&&role==="viewer"&&typeof m.cameraId==="string"){
      const cam=cameras.get(m.cameraId);
      if(cam)send(cam,{type:"viewer-request",viewerId:id,cameraId:m.cameraId});
      else send(ws,{type:"camera-offline",cameraId:m.cameraId});
      return;
    }
    if(["offer","camera-ice"].includes(m.type)&&role==="camera"&&m.cameraId===id&&typeof m.viewerId==="string"){
      send(viewers.get(m.viewerId),m);return;
    }
    if(["answer","viewer-ice"].includes(m.type)&&role==="viewer"&&typeof m.cameraId==="string"){
      send(cameras.get(m.cameraId),m);return;
    }
  });
  ws.on("close",()=>{
    if(role==="camera"&&cameras.get(id)===ws){cameras.delete(id);for(const v of viewers.values())send(v,{type:"camera-offline",cameraId:id});}
    if(role==="viewer"&&viewers.get(id)===ws)viewers.delete(id);
  });
  ws.on("error",err=>console.error("WebSocket error:",err.message));
});
server.listen(PORT,()=>console.log(`Server listening on port ${PORT}; camera=/ viewer=/viewer`));
