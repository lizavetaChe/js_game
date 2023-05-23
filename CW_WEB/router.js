import {Router} from "express";
import fs from 'fs'

let router = Router();

let nickName='Unknown player';

let records = fs.readFileSync('public/state/state.json').toString()
records = (JSON.parse(records)).records

router.get("/history",(req, res) => {
    res.render("history", {
        nickname : nickName
    });
});

router.get("/getName", (req, res) =>{
    res.status(200).json({Name: nickName});
})

router.get("/game",(req, res) => {
    res.render("main",{
        nickname : nickName
    });
});

router.post("/game",(req, res) => {
    let score = req.body.time;
    records.push({
        nickname: nickName,
        score: score
    });
    records.sort((a,b)=>{
        return a.score-b.score;
    });
    if (records.length>10)
        records.length=10;
    fs.writeFile('public/state/state.json',JSON.stringify({records: records}),(err)=>{
        if (err) throw err;
        console.log("Database was successfully saved");
    })
});

router.get('/',(req,res)=>{
    res.render('login');
})

router.get('/records',(req,res)=>{
    res.render('records',{
        players: records
    });
})

router.post('/login',(req,res)=>{
    nickName = req.body.nickname;
    res.sendStatus(200);
});

export default router;