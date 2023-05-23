export default class EventManager{
    constructor() {
        this.bind = [];
        this.action = [];
    }

    setup(canvas, body){
        this.bind[87] = 'up';
        this.bind[65] = 'left';
        this.bind[83] = 'down';
        this.bind[68] = 'right';
        this.bind[32] = 'fire';

        canvas.addEventListener("mousedown", event =>{
                this.action["fire"] = true;
        });
        canvas.addEventListener("mouseup", event =>{
            this.action["fire"] = false;
        });
        body.addEventListener("keydown", event =>{
            let action = this.bind[event.keyCode];
            if (action)
                this.action[action] = true;
        });
        body.addEventListener("keyup", event =>{
            let action = this.bind[event.keyCode];
            if (action)
                this.action[action] = false;
        });
    }
};