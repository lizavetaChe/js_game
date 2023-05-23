
export class Entity{
    constructor() {
        this.pos_x = 0;
        this.pos_y = 0;
        this.size_x = 0;
        this.size_y = 0;
        this.state = 'alive';
    }

    kill() {
        this.lifetime -= 1;
        if (this.lifetime <= 0) {
            this.state = "dead";
        }
    }
}

export class Player extends Entity{
    constructor() {
        super();
        this.lifetime = 1;
        this.move_x = 0;
        this.move_y = 0;
        this.speed = 5;
        this.fireState = true;
        this.cadrCount = 10;
        this.mod = 0;
        this.cadr = 0;
        this.projCount = 1;
    }

    draw(ctx){
        let name;
        if(this.move_x===-1){
            if(this.mod===0){
                this.cadr = 0;
            }
            this.mod = 1;
            name = `player${this.mod}_${this.cadr}`;
        }
        if(this.move_x===1){
            if(this.mod===1){
                this.cadr = 0;
            }
            this.mod = 0;
            name = `player${this.mod}_${this.cadr}`;
        }
        if(this.move_x===0 && this.move_y===0 ){
            this.cadr = 0;
            name = `player${this.mod}_s`;
        }
        if(this.move_x === 0 && this.move_y!== 0){
            name = `player${this.mod}_${this.cadr}`;
        }
        this.spriteManager.drawSprite(ctx, name, this.pos_x, this.pos_y);
        this.cadr = (this.cadr+1)%this.cadrCount;
    }

    update(){
        this.physicManager.update(this);
    }

    onTouchEntity(obj) {
        if (obj instanceof Bonus || obj instanceof Rocket ||
            obj instanceof Portal || obj instanceof Princess ||
            obj instanceof Button || obj instanceof Boss || (obj instanceof Guard && obj.attackState)){
            obj.onTouchEntity(this);
        }
        if(obj.name==="altar5" || obj instanceof Key){
            let key = this.gameManager.entities.find((e) => {
                return (e instanceof Key);
            })
            if(key !== undefined){
                key.onTouchEntity(this);
            }
        }
    }


    fire() {
        if (this.fireState) {
            this.gameManager.soundManager.play("public/music/fire.mp3", {volume: 0.1});
            for(let i = 0; i<this.projCount; i++){
                let r = new Fireball();
                r.size_x = 32;
                r.size_y = 32;
                r.name = "fire_" + (++this.gameManager.fireNum);
                r.move_x = this.move_x;
                r.move_y = this.move_y;
                r.speed = 10;
                r.spriteManager = this.spriteManager;
                r.physicManager = this.physicManager;
                switch (this.move_x + 2 * this.move_y) {
                    case -1: // Выстрел влево
                        r.pos_x = this.pos_x - r.size_x -10; // Появиться слева от игрока
                        r.pos_y = this.pos_y - i*32+0.5*i*16;
                        break;
                    case 1: // Выстрел вправо
                        r.pos_x = this.pos_x + this.size_x +10; // Появиться справа
                        r.pos_y = this.pos_y - i*32+0.5*i*16;
                        break;
                    case -2: // Bыстрел вверх
                        r.pos_x = this.pos_x - i*32+0.5*i*16+10;
                        r.pos_y = this.pos_y - r.size_y - 10; // Появиться сверху от игрока
                        break;
                    case 2: // Bыстрел вниз
                        r.pos_x = this.pos_x - i*32+0.5*i*16+10;
                        r.pos_y = this.pos_y + this.size_y + 10; // Появиться снизу от игрока
                        break;
                    default:
                        return;
                }
                this.gameManager.entities.push(r);
            }
            this.fireState = false;
            setTimeout(() => {
                this.fireState = true
            }, 500);
        }
    }

    kill() {
        this.lifetime -= 1;
        if(this.lifetime>=0){
            document.getElementById("life").innerHTML = this.gameManager.player.lifetime;
        }
        if (this.lifetime<=0) {
            this.gameManager.soundManager.stopFon();
            this.gameManager.soundManager.play("public/music/death2.mp3", {volume: 0.5});
            this.state = "dead";
            this.gameManager.GameOver();
        }
    }
}

export class Rocket extends Entity{
    constructor() {
        super();
        this.lifetime = 1;
        this.move_x = 0;
        this.move_y = 0;
        this.speed = 4;
    }
    draw(ctx){
        this.spriteManager.drawSprite(ctx, this.name, this.pos_x, this.pos_y);
    }

    update(){
        this.physicManager.update(this);
    }

    onTouchEntity(obj) {
        if(this.state==="alive"){
            if (obj instanceof Player){
                obj.kill();
            }
            if(!(obj instanceof Fireball)){
                this.kill();
            }
        }
    }

    kill(){
        this.state = "dead";
    }

    onTouchMap(idx){
        this.kill();
    }

}

export class Fireball extends Rocket{
    constructor() {
        super();
        this.cadr = 0;
        this.cadrCount = 4;
    }

    draw(ctx){
        this.spriteManager.drawSprite(ctx, `fire_${Math.floor(this.cadr)}`, this.pos_x, this.pos_y);
        this.cadr = (this.cadr+1)%this.cadrCount;
    }

    onTouchEntity(obj) {
        if (obj instanceof Button || obj instanceof Fireball || obj instanceof Player || obj.name.match(/altar[\d*]/) )
            return;
        if(this.state==="alive"){
            if (obj instanceof Guard || obj instanceof Waterball || obj instanceof Boss){
                obj.kill();
            }
            this.kill();
        }
    }
}


export class Portal extends Entity{
    constructor() {
        super();
        this.isActivated = false;
    }

    draw(ctx){
        if (this.isActivated)
            this.spriteManager.drawSprite(ctx, this.name, this.pos_x, this.pos_y);
    }

    onTouchEntity(obj){
        if (obj instanceof Player && this.isActivated && this.gameManager.levelChanging===undefined){
            this.gameManager.levelChanging = setTimeout(()=>{
                this.gameManager.loadAll2();
            },1000)
        }
    }
}


export class Key extends Entity{
    constructor() {
        super();
    }

    draw(ctx){
        this.spriteManager.drawSprite(ctx, this.name, this.pos_x, this.pos_y);
    }

    onTouchEntity(obj){
        if (obj instanceof Player){
            this.gameManager.entities.forEach((e)=>{
                if (e instanceof Portal){
                    e.isActivated = true;
                }
            })
            this.kill();
        }
    }

    kill(){
        this.state="dead"
    }
}


export class Bonus extends Entity{
    constructor() {
        super();
        this.state = "closed";
        this.type = Math.floor(Math.random()*3);
    }

    draw(ctx){
        this.spriteManager.drawSprite(ctx, this.name, this.pos_x, this.pos_y);
    }

    onTouchEntity(obj){
        if (obj instanceof Player && this.state==="closed"){
            this.type = Math.floor(Math.random()*3)
            console.log(this.type)
            switch (this.type){
                case 0:
                    this.gameManager.player.lifetime+=1;
                    document.getElementById("life").innerHTML = this.gameManager.player.lifetime;
                    break;
                case 1:
                    this.gameManager.player.speed+=1;
                    document.getElementById("speed").innerHTML = this.gameManager.player.speed;
                    break;
                case 2:
                    if(this.gameManager.player.projCount<3){
                        this.gameManager.player.projCount+=1;
                        document.getElementById("power").innerHTML = this.gameManager.player.projCount;
                    } else{
                        this.gameManager.player.lifetime+=1;
                        document.getElementById("life").innerHTML = this.gameManager.player.lifetime;
                    }
                    break;
            }
            this.name = "chest_open_down";
            let upperPart = this.gameManager.entities.find(e=>{
                return (e.pos_x===this.pos_x && this.pos_y-32===e.pos_y);
            })
            upperPart.name = "chest_open_up";
            upperPart.state = "open";
            this.state = "open";
        }
    }

}


export class MaterialObject extends Entity{
    constructor() {
        super();
    }

    draw(ctx){
        this.spriteManager.drawSprite(ctx, this.name, this.pos_x, this.pos_y);
    }
}

export class MyObject extends Entity{
    constructor() {
        super();
    }

    draw(ctx){
        this.spriteManager.drawSprite(ctx, this.name, this.pos_x, this.pos_y);
    }
}

export class Sword extends Entity{
    constructor() {
        super();
        this.fireState = true;
    }

    draw(ctx){
        //this.spriteManager.drawSprite(ctx, this.name, this.pos_x, this.pos_y);
    }

    update(){
        if (this.fireState){
            let dir = this.name.split('_')[1];
            let r = new Rocket();
            r.size_x = 16;
            r.size_y = 32;
            r.name = `sword_${dir}`
            r.move_x= 0;
            r.move_y= dir==='down' ? 1 : -1;
            r.spriteManager = this.spriteManager;
            r.physicManager = this.physicManager;
            switch (dir) {
                case 'up': // Bыстрел вверх
                    r.pos_x= this.pos_x;
                    r.pos_y=this.pos_y- r.size_y; // Появиться сверху от игрока
                    break;
                case 'down': // Bыстрел вниз
                    r.pos_x=this.pos_x;
                    r.pos_y=this.pos_y + this.size_y; // Появиться снизу от игрока
                    break;
                default: return;
            }
            this.gameManager.entities.push(r);
            this.fireState = false;
            setTimeout(()=>{
                this.fireState=true
            },1500);
        }
    }
}


export class Guard extends Entity{
    constructor() {
        super();
        this.cadr = 0;
        this.lifetime=2;
        this.cadrCount = 20;
        this.attackState = true;
        this.speed = 2;
        this.dir = null;
        this.mod = 0;
    }

    draw(ctx){
        this.spriteManager.drawSprite(ctx, `guard${this.mod}_${Math.floor(this.cadr/5)}`, this.pos_x, this.pos_y);
        this.cadr = (this.cadr+1)%this.cadrCount;
    }

    onTouchEntity(obj){
        if (this.attackState && (obj instanceof Player)){
            obj.kill();
            this.attackState=false;
            setTimeout(()=>{
                this.attackState=true
            },1500);
        }
    }

    update(){
        if(this.dir === null){
            this.dir=this.name.split("_")[1];
        }
        if(764<this.pos_x && this.pos_x<932 && 380<this.pos_y && this.pos_y<388 && this.dir==="right"){
            this.move_x = 1;
            this.move_y = 0;
            this.mod = 0;
            if (this.pos_x>924 && this.pos_x<932)
                this.dir="up"
        }
        if(924<this.pos_x && this.pos_x<932 && 220<this.pos_y && this.pos_y<388 && this.dir==="up"){
            this.move_x = 0;
            this.move_y = -1;
            this.mod = 0;
            if (this.pos_y>220 && this.pos_y<228)
                this.dir="left"
        }
        if(764<this.pos_x && this.pos_x<932 && 220<this.pos_y && this.pos_y<228 && this.dir==='left'){
            this.move_x = -1;
            this.move_y = 0;
            this.mod = 1;
            if (this.pos_x>764 && this.pos_x<772)
                this.dir='down';
        }
        if(764<this.pos_x && this.pos_x<772 && 220<this.pos_y && this.pos_y<388 && this.dir==='down'){
            this.move_x = 0;
            this.move_y = 1;
            this.mod = 1;
            if (this.pos_y>380 && this.pos_y<388)
                this.dir='right'
        }
        this.physicManager.update(this);
    }

}

export class Waterball extends Entity {
    constructor() {
        super();
        this.cadr = 0;
        this.lifetime=1;
        this.cadrCount = 15;
        this.attackState = true;
        this.speed = 10;
        this.dist = 0;
        this.move_y = 0;
        this.move_x = 0;
    }

    draw(ctx){
        this.spriteManager.drawSprite(ctx, `waterball${this.cadr}`, this.pos_x, this.pos_y);
        this.cadr = (this.cadr+1)%this.cadrCount;
    }

    onTouchEntity(obj){
        if (this.attackState && (obj instanceof Player)){
            obj.kill();
            this.attackState=false;
            setTimeout(()=>{
                this.attackState=true
            },1500);
        }
    }

    update(){
        if (this.move_x === 0){
            let dir = this.name.split("_")[1];
            if (dir==="right"){
                this.move_x=1;
            }
            if(dir==="left"){
                this.move_x = -1;
            }
        }
        if(this.dist<192){
            this.dist+=Math.abs(this.move_x)*this.speed
        } else {
            this.dist=0;
            this.move_x = this.move_x*(-1);
        }
        this.physicManager.update(this);
    }
}

export class Heart extends Entity {
    constructor() {
        super();
        this.love = false;
    }

    draw(ctx){
        if (this.love){
            this.spriteManager.drawSprite(ctx, this.name, this.pos_x, this.pos_y);
        }
    }
}

export class Princess extends Entity {
    constructor() {
        super();
        this.cadr = 0;
        this.cadrCount = 4;
    }

    draw(ctx){
        this.spriteManager.drawSprite(ctx, `princess${this.cadr}`, this.pos_x, this.pos_y);
        this.cadr = (this.cadr+1)%this.cadrCount;
    }

    onTouchEntity(obj){
        if (obj instanceof Player){
            this.gameManager.soundManager.stopFon();
            this.gameManager.soundManager.play("public/music/win.mp3", {volume: 0.2});
            this.gameManager.entities.forEach((e)=>{
                if (e instanceof Heart){
                    e.love = true;
                }
            })
            this.gameManager.gameFinish();
        }
    }
}

export class Boss extends Entity {
    constructor() {
        super();
        this.cadr = 0;
        this.cadrCount = 12;
        this.mod = "stay";
        this.move_y = 0;
        this.move_x = 0;
        this.speed = 4;
        this.lifetime = 5;
        this.fireState = true;
        this.skullState = true;
        this.attackState = true;
        this.isActivated = false;
    }

    draw(ctx){
        if(this.mod==="death" && this.cadr===27){
            this.state = "dead";
            this.gameManager.entities.forEach((e)=>{
                    if (e.name === "block" || e.name === "chain"){
                        e.state = "dead";
                    }
            })
        }
        this.spriteManager.drawSprite(ctx, `boss_${this.mod}_${this.cadr}`, this.pos_x, this.pos_y);
        this.cadr = (this.cadr+1)%this.cadrCount;
    }

    onTouchEntity(obj){
        if (this.attackState && (obj instanceof Player)){
            obj.kill();
            this.attackState=false;
            setTimeout(()=>{
                this.attackState=true
            },1500);
        }
    }

    update(){
        if(this.isActivated){
            this.attack();
            this.snow();
            if(this.lifetime<=0){
                return;
            }
            if (this.gameManager.player.pos_y-this.pos_y-32>10){
                this.move_y = 1;
                if (this.mod!=="walk")
                    this.cadr = 0;
                this.mod = "walk";
                this.cadrCount = 9;
            }
            else{
                if(this.gameManager.player.pos_y-this.pos_y-32<-10){
                    this.move_y = -1;
                    if (this.mod!=="walk")
                        this.cadr = 0;
                    this.mod = "walk";
                    this.cadrCount = 9;
                }
                else{
                    this.move_y = 0;
                    if (this.mod!=="stay")
                        this.cadr = 0;
                    this.mod = "stay";
                    this.cadrCount = 12;
                }
            }
            this.physicManager.update(this);
        }
    }

    kill(){
        this.lifetime-=1;
        if(this.lifetime<=0){
            this.mod = "death";
            clearTimeout(this.fireId);
            clearTimeout(this.snowId);
            this.gameManager.entities.forEach(e => {
                if (e.name==="snow"){
                    e.state="dead";
                }
            })
            this.cadrCount = 28;
        }
    }

    attack(){
        if (this.fireState) {
            for(let i = 0; i<3; i++){
                let r = new Rocket();
                r.size_x = 32;
                r.size_y = 32;
                r.name = "ball1";
                r.move_x = -1;
                r.move_y = this.move_y;
                r.speed = 4;
                r.spriteManager = this.gameManager.spriteManager;
                r.physicManager = this.physicManager;

                r.pos_x = this.pos_x - r.size_x;
                r.pos_y = this.pos_y+i*32;
                this.gameManager.entities.push(r);
            }
            this.fireState = false;
            this.fireId = setTimeout(() => {
                this.fireState = true
            }, 3500);
        }
    }

    snow(){
        if (this.skullState){
            this.gameManager.entities.forEach(e=>{
                if (e.name==="col_down" || e.name==="short_col_down"){
                    for (let i=-1;i<2;i++){
                        for (let j=-1;j<2;j++){
                            if (i===-1 && j===0 && e.name==="col_down")
                                continue;
                            if (i===0 && j===0)
                                continue;
                            let r = new Rocket();
                            r.size_x = 32;
                            r.size_y = 32;
                            r.name = "snow";
                            r.move_x = 0;
                            r.move_y = 0;
                            r.speed=3;
                            r.spriteManager = this.gameManager.spriteManager;
                            r.physicManager = this.physicManager;

                            r.pos_x = e.pos_x+j*32;
                            r.pos_y = e.pos_y+i*32;

                            if (Math.abs(this.gameManager.player.pos_x-r.pos_x)<25 && Math.abs(this.gameManager.player.pos_y-r.pos_y)<25){
                                this.gameManager.player.kill();
                            }
                            this.snowId = setTimeout(()=>{
                                r.state='dead';
                            },3000)
                            this.gameManager.entities.push(r);
                        }
                    }
                }
            })
            this.skullState=false;
            setTimeout(()=>{
                this.skullState=true;
            },10000)
        }
    }

}

export class Button extends Entity{
    constructor() {
        super();
    }

    onTouchEntity(obj){
        if (obj instanceof Player){
            this.gameManager.entities.forEach((e)=>{
                if (e instanceof Boss){
                    e.isActivated = true;
                }
            })
        }
    }

    draw(ctx){}

}