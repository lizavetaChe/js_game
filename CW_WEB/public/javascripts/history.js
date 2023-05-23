let img = new Image();
let imgLoaded = false;
img.onload = () => {
    imgLoaded = true;
}
img.src = "public/scroll1.png";
draw()

function draw(){
    if(!imgLoaded){
        setTimeout(() => {
            draw()
        }, 100);
    }
    fetch(
        '/getName',
    )
        .then((res)=>{
            return res.json();
        })
        .then(result => {
            let Name = result.Name;
            let arr = ["                  ПОСЛАНИЕ ОТ КОРОЛЯ",
                `Великий рыцарь огня ${Name}!`,
                "Приключилась беда в нашем царстве...",
                "Злой маг украл мою дочь - принцессу ", "7 королевств и держит её в своём ", "ледяном замке. Одна надежда на тебя!",
                "Многие пытались,", "но никто не вернулся оттуда живым.",
                "Замок хранит множество тайн и окутан", "легендами. Будь осторожен: ",
                "ловушки поджидают тебя на каждом шагу!",
                "Берегись невиданных существ, что наполняют", "эту снежную цитадель!",
                "                         УДАЧИ ТЕБЕ!!!"];
            let cnv = document.getElementById("scroll");
            let ctx = cnv.getContext("2d");
            ctx.drawImage(img, 0, 0, 510, 600, 0, 0, 510, 600,);
            ctx.font = "20px Luminari fantasy";
            ctx.textAlign = "left";
            ctx.fillStyle = "Crimson";
            for(let i = 0; i<arr.length; i++){
                if(i===0 || i===13){
                    setTimeout(() => {
                        ctx.fillStyle = "Maroon";
                        ctx.fillText(arr[i], 55, 115+i*30);
                        ctx.fillStyle = "Crimson";
                    }, i*1300+1000);
                }
                else{
                    setTimeout(() => {
                        ctx.fillText(arr[i], 55, 115+i*30);
                    }, i*1300+1000);
                }
            }
        })
}

function game(){
    window.location.href='/game';
}

