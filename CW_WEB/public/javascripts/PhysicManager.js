import {Bonus, Button, Fireball, Guard, Heart, MyObject, Portal, Sword} from "./Entity.js";

export default class PhysicManager{

    setManager(gameManager, mapManager){
        this.gameManager = gameManager;
        this.mapManager = mapManager;
        this.allowed = [21,22,24,79,55,39,71,23,88,87,69,70,64,37,34,35,85]
    }

    update(obj){ //Обновление состояния объекта
        if(obj.move_x === 0 && obj.move_y === 0)
            return "stop";
        let newX = obj.pos_x + Math.floor(obj.move_x * obj.speed);
        let newY = obj.pos_y + Math.floor(obj.move_y * obj.speed);
        let ts = this.mapManager.getTilesetId(newX+ obj.size_x / 2, newY + obj.size_y / 2);
        let e = this.entityAtXY(obj, newX, newY);
        //console.log(ts)
        if(e !== null && obj.onTouchEntity) {
            obj.onTouchEntity(e);
        }
        if(!this.allowed.includes(ts) && obj.onTouchMap) // 7 - код блока, обозначающего пустое пространство
            obj.onTouchMap(ts);
        if(this.allowed.includes(ts) && (e === null ||
            (e instanceof MyObject) || (e instanceof Sword) ||
            e instanceof Portal || (e instanceof Heart)
            || (e instanceof Button) || (e instanceof Fireball))) {
            obj.pos_x = newX;
            obj.pos_y = newY;
        } else
            return "break";
        return "move";
    }

    entityAtXY(obj, x, y) { // Определение столкновения с объектом по заданным координатам
        for(let i = 0; i < this.gameManager.entities.length; i++) {
            let e = this.gameManager.entities[i];
            if(e.name !== obj.name) {
                if (x + obj.size_x < e.pos_x ||
                    y + obj.size_y < e.pos_y ||
                    x > e.pos_x+ e.size_x ||
                    y > e.pos_y + e.size_y)
                    continue;
                if(obj instanceof Guard && e.name!=="player"){
                    continue;
                }
                return e;
            }
        }
        return null;
    }
};