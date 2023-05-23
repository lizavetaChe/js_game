import express from 'express';
import router from './router.js'
import bodyParser from "body-parser";
const server = express();

server.use("/public",express.static('public'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

server.set("view engine","pug");
server.set("views","./views");

server.use("/",router);

server.listen(3000,()=>{
  console.log("Server started");
});
