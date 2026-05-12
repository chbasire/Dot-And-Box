const express=require("express");
const http=require("http");
const {Server}=require("socket.io");
const path=require("path");

const app=express();
const server=http.createServer(app);
const io=new Server(server,{cors:{origin:"*"}});
app.use(express.static(path.join(__dirname,"public")));

let rooms={};
function code(){return Math.random().toString(36).substr(2,5).toUpperCase();}

io.on("connection",s=>{
 s.on("createRoom",()=>{
  let c=code();
  rooms[c]={players:[s.id],state:{lines:[],boxes:{},currentPlayer:1,scores:{1:0,2:0}}};
  s.join(c);
  s.emit("roomCreated",c);
 });

 s.on("joinRoom",c=>{
  if(rooms[c]&&rooms[c].players.length<2){
   rooms[c].players.push(s.id);
   s.join(c);
   io.to(c).emit("startGame",rooms[c].state);
  }
 });

 s.on("update",({c,state})=>{
  if(!rooms[c])return;
  rooms[c].state=state;
  s.to(c).emit("sync",state);
 });
});

server.listen(process.env.PORT||3000);
