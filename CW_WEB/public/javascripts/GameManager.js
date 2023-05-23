import {
    Bonus, Boss, Button,
    Guard, Heart,
    Key,
    MaterialObject,
    MyObject,
    Player,
    Portal,
    Princess,
    Rocket,
    Sword,
    Waterball
} from "./Entity.js";
import SpriteManager from "./SpriteManager.js";
import MapManager from "./MapManager.js";
import EventManager from "./EventManager.js";
import PhysicManager from "./PhysicManager.js";

export default class GameManager{
    constructor(ctx) {
        this.factory = {};
        this.entities = [];
        this.fireNum = 0;
        this.player = null;
        this.laterKill = [];
        this.ctx = ctx;
        this.time_start = new Date();
    }

    setManager(spriteManager, mapManager, eventManager, physicManager, mobsSpriteManager, bossSpriteManager, soundManager){
        this.spriteManager = spriteManager;
        this.mapManager =  mapManager;
        this.eventsManager =  eventManager;
        this.physicManager = physicManager;
        this.mobsSpriteManager = mobsSpriteManager;
        this.bossSpriteManager = bossSpriteManager;
        this.soundManager = soundManager;

        this.mapManager.setManager(this.spriteManager,this, this.physicManager, this.mobsSpriteManager, this.bossSpriteManager);
        this.spriteManager.setManager(this.mapManager);
        this.mobsSpriteManager.setManager(this.mapManager);
        this.bossSpriteManager.setManager(this.mapManager)
        this.physicManager.setManager(this, this.mapManager);
        this.soundManager.setManagers(this);
    }

    gameFinish(){
        this.time_end = new Date();
        clearInterval(this.interval);
        setTimeout(()=>{
            let cnv = document.getElementById("gamefield");
            this.ctx.font = "30px Luminari fantasy";
            this.ctx.fillStyle  = "#CD5C5C";
            this.ctx.fillRect(0,0,cnv.width,cnv.height);
            this.ctx.textAlign = "center";
            this.ctx.fillStyle = "#FFDAB9";
            this.ctx.fillText("YOU ARE WIN", cnv.width/2, cnv.height/2);

            setTimeout(()=>{
                fetch(
                    window.location.href,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8'
                        },
                        body: JSON.stringify({time: this.time_end-this.time_start})
                    }
                )
                window.location.href = '/records'
            }, 2000);
        }, 2300);
    }

    GameOver(){
        setTimeout(()=>{
            clearInterval(this.interval);

            let cnv = document.getElementById("gamefield");
            this.ctx.font = "30px Luminari fantasy";
            this.ctx.fillStyle  = "rgb(32, 40, 78)";
            this.ctx.fillRect(0,0,cnv.width,cnv.height);
            this.ctx.textAlign = "center";
            this.ctx.fillStyle = "#d7e2ea";
            this.ctx.fillText("YOU ARE DEAD", cnv.width/2, cnv.height/2);
            setTimeout(()=>{
                window.location.href = "/game";
            }, 2200);
        }, 1000);
    }

    initPlayer(obj) {
        if (this.player!==null){
            obj.lifetime = this.player.lifetime;
            obj.projCount = this.player.projCount;
            obj.speed = this.player.speed;
        }
        this.player = obj;
    }

    kill(obj) {
        this.laterKill.push(obj);
    }

    update() {
        if(this.player === null){
            return;
        }

        this.time_end = new Date();
        document.getElementById("currentTime").innerHTML = Math.floor((this.time_end - this.time_start)/1000);

        this.player.move_x = 0;
        this.player.move_y = 0;
        if (this.eventsManager.action["up"])
            this.player.move_y = -1;
        if (this.eventsManager.action["down"])
            this.player.move_y = 1;
        if (this.eventsManager.action["left"])
            this.player.move_x = -1;
        if (this.eventsManager.action["right"])
            this.player.move_x = 1;
        if (this.eventsManager.action["fire"])
            this.player.fire();

        this.entities.forEach((e) =>{
            try {
                if (e.state === 'dead'){
                    this.kill(e);
                }
                e.update();
            } catch(ex) {}
        });
        for(let i = 0; i < this.laterKill.length; i++) {
            let idx = this.entities.indexOf(this.laterKill[i]);
            if(idx > -1)
                this.entities.splice(idx, 1);
        }
        if (this.laterKill.length > 0)
            this.laterKill.length = 0;
        this.mapManager.draw(this.ctx);
        this.mapManager.centerAt(this.player.pos_x, this.player.pos_y);
        this.draw(this.ctx);
    }

    draw(ctx) {
        for (let e = 0; e < this.entities.length; e++)
            this.entities[e].draw(ctx);
    }

    loadAll(canvas, body) {
        this.mapManager.loadMap("public/javascripts/lvl1.json");
        this.spriteManager.loadAtlas("public/javascripts/sprites.json", "public/javascripts/sprites.png");

        this.mobsSpriteManager.loadAtlas("public/javascripts/mobs.json", "public/javascripts/mobs.png");
        this.soundManager.loadArray(["public/music/win.mp3","public/music/fire.mp3","public/music/fon.mp3","public/music/death2.mp3"]);


        this.factory['Player'] = Player;
        this.factory['Rocket'] = Rocket;
        this.factory['Portal'] = Portal;
        this.factory['Key'] = Key;
        this.factory['Bonus'] = Bonus;
        this.factory['MaterialObject'] = MaterialObject;
        this.factory['Object'] = MyObject;
        this.factory['Sword'] = Sword;
        this.factory['Guard'] = Guard;
        this.factory['Heart'] = Heart;
        this.factory['Waterball'] = Waterball;
        this.factory['Princess'] = Princess;
        this.factory['Boss'] = Boss;
        this.factory['Button'] = Button;
        this.mapManager.parseEntities();
        this.mapManager.draw(this.ctx);
        this.eventsManager.setup(canvas, body);
        this.soundManager.play("public/music/fon.mp3", {volume: 0.5});

    }

    loadAll2() {
        clearInterval(this.interval);

        this.setManager(
            new SpriteManager(),
            new MapManager(),
            this.eventsManager,
            new PhysicManager(),
            new SpriteManager(),
            new SpriteManager(),
            this.soundManager);


        this.entities.length = 0;
        this.mapManager.loadMap("public/javascripts/lvl2.json");
        this.bossSpriteManager.loadAtlas("public/javascripts/boss.json", "public/javascripts/boss.png");
        this.spriteManager.loadAtlas("public/javascripts/sprites.json", "public/javascripts/sprites.png");

        this.mapManager.parseEntities();
        this.mapManager.draw(this.ctx);
        this.play();
    }

    play() {
        this.interval = setInterval(()=>{
            this.updateWorld()
        }, 50);
    }

    updateWorld(){
        this.update();
    }
};

