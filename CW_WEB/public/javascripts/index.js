import SpriteManager from "./SpriteManager.js";
import MapManager from "./MapManager.js";
import EventManager from "./EventManager.js";
import PhysicManager from "./PhysicManager.js";
import GameManager from "./GameManager.js";
import {SoundManager} from "./SoundManager.js";


let canvas = document.getElementById("gamefield");
let ctx = canvas.getContext('2d');
let body = document.body;

let bossSpriteManager = new SpriteManager();
let mobsSpriteManager = new SpriteManager();
let spriteManager = new SpriteManager();

let mapManager = new MapManager();
let eventManager = new EventManager();
let physicManager = new PhysicManager();
let gameManager = new GameManager(ctx);
let soundManager = new SoundManager();

gameManager.setManager(spriteManager, mapManager, eventManager, physicManager, mobsSpriteManager, bossSpriteManager, soundManager);
gameManager.loadAll(canvas,body);
gameManager.play();




