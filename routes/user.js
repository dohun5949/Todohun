const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db");



router.post("/signup", async (req, res) => {
    console.log(req.body);
    const { login_id, pwd, pwd_check, name, nickname, birth, email, phone } = req.body;


    if (!login_id || !pwd || !name || !birth || !email || !phone) {
        return res.status(400).send("필드를 채워주세요");
    }
    try {
        const hashedPw = await bcrypt.hash(pwd, 10);
        const sql = `Insert into todo.user (login_id, pwd,name,nickname, birth,email,phone) values(?,?,?,?,?,?,?)`;
        db.query(sql, [login_id, hashedPw, name, nickname, birth, email, phone], (err) => {
            if (err) {
                console.error("회원가입 실패");
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({message : "이미 존재하는 아이디 또는 이메일입니다."});
                }
                console.error("MySQL 오류 코드:", err.code);
                console.error("MySQL 오류 메시지:", err.message);
                return res.status(500).json({message: "회원가입 실패 (DB 오류)"});
            }
            res.send("회원가입 완료!");
        });
    }
    catch (error) {
        console.error("회원가입 오류:", error);
        res.status(500).send("서버 오류");
    }
});
router.post("/unique", async (req, res) => {
    const { login_id } = req.body;
    if (!login_id) {
        return res.status(400).json({message : "아이디를 입력하세요"});
    }
    const sql = `select 1 from todo.user where login_id = ?`;
    db.query(sql, [login_id], (err, results) => {
        if (err) {
            console.error("중복 확인 오류:", err);
            return res.status(500).json({message: "DB 오류"});
        }
        if (results.length > 0) {
            return res.status(400).json({message: "이미 존재하는 아이디입니다."});
        }
        res.send("사용 가능");
    });
});
router.post("/login", async (req, res) => {
    console.log(req.body);
    const { login_id, pwd } = req.body;
    if (!login_id || !pwd) {
        return res.status(400).json({message: "필드를 채워주세요"});
    }
    const sql = `select * from todo.user where login_id = ?`;
    db.query(sql, [login_id], async (err, results) => {
        if (err) {
            console.error("로그인 쿼리 오류:", err);
            return res.status(500).json({message: "로그인 실패"});
        }
        if (results.length === 0) {
            return res.status(400).json({message: "아이디가 존재하지 않습니다."});
        }
        const user = results[0];
        const password = await bcrypt.compare(pwd, user.pwd);
        if (!password) {
            return res.status(401).json({message: "비밀번호가 일치하지 않습니다."});
        }
        req.session.user = {
            user_id: user.user_id,
            login_id: user.login_id,
            nickname: user.nickname
        };
        res.redirect("/main.html");
    })
});
router.post("/myinfo_edit", async (req, res) => {
    const { nickname, writing } = req.body;
    const login_id = req.session.user.login_id;
    if (!nickname || !writing) {
        return res.status(400).json({message : "필드를 채워주세요"});
    }
    const sql = `update todo.user set nickname = ?, writing = ? where login_id = ?`;
    db.query(sql, [nickname,writing,login_id], async (err, results) => {
        if (err) {
            console.error("정보 수정 오류", err);
            return res.status(500).json({message: "edit failure"});
        }
        if (results.affectedRows === 0) {
            return res.status(400).json({message: "아이디가 존재하지 않습니다."});
        }
        res.send({success: true});
    })
});
router.get("/myinfo",async(req,res)=>{
    if(!req.session.user){
        return res.status(401).json({message:"need to login"});
    }
    const login_id = req.session.user.login_id;
    
    const sql = `select nickname, email, writing from todo.user where login_id = ?`;
    db.query(sql,[login_id],(err,results)=>{
        if(err){
            console.error("loda info error");
            return res.status(500).json({message: "load info error"});
        }
        if(results.length === 0){
            return res.status(400).json({message: "no user"});
        }
        res.json(results[0]);
    })
    
});
router.post("/withdraw", (req,res)=>{
    const login_id = req.session.user.login_id;
    const {nickname} = req.body;
    const sql = `select nickname from todo.user where login_id = ?`;
    db.query(sql,[login_id],(err,results)=>{
        if(err){
            console.log("load info error");
            return res.status(500).json({message: "load info error"});
        }
        if(results.length === 0){
            return res.status(404).json({message: "no user"});
        }
        if(results[0].nickname !== nickname){
            return res.status(400).json({message: "no match"});
        }
        const del = `delete from todo.user where login_id = ?`;
        db.query(del,[login_id],(err)=>{
            if(err){
                console.error("withdraw error",err);
                return res.status(500).json({message: "withdraw error"});
            }
            req.session.destroy(()=>{
                res.json({success: true});
            })
        });
    })
})
module.exports = router;