const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db");

router.post("/done", async (req, res) => {
    console.log(req.session.user);
    if (!req.session.user) {
        return res.status(401).json({ message: "로그인 필요" });
    }
    const { text, category } = req.body;
    const user_id = req.session.user.user_id;
    if (!text || !category) {
        return res.status(400).json({ message: "필수 값 누락" });
    }
    const sql = `insert into todo.todo (text,category, user_id, completed,date) values(?,?,?,0,CURDATE())`;
    db.query(sql, [text, category, user_id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "DB error" });
        }
        res.send("할 일 등록 완료");
    })
});
router.get("/todolist", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "로그인 필요" });
    }

    const user_id = req.session.user.user_id;
    const sql = `select * from todo.todo where user_id = ? and date = CURDATE() order by completed, created_at desc`;
    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "DB error" });
        }

        res.json(results);
    })
})
router.post("/del", async (req, res) => {
    const { text_id } = req.body;
    const user_id = req.session.user.user_id;
    if (!text_id) {
        return res.status(400).json({ message: "text_id 없음" });
    }
    const sql = `delete from todo.todo where text_id = ? and user_id = ?`;
    db.query(sql, [text_id, user_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "DB 오류" });
        }
        res.json({ success: true });
    })
})
router.post("/completed", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "로그인 필요" });
    }
    const { text_id, completed } = req.body;
    const user_id = req.session.user.user_id;
    if (text_id === undefined || completed === undefined) {
        return res.status(400).json({ message: "값 없음" });
    }
    const sql = `update todo.todo set completed = ? where text_id = ? and user_id = ?`;
    db.query(sql, [completed, text_id, user_id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "DB 오류" });
        }
        res.json({ success: true });
    })
})
router.get("/remain", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "need to login" });
    }
    
    const user_id = req.session.user.user_id;

    const sql = `select * from todo.todo where user_id = ? and completed = 0`;
    db.query(sql, [user_id], (err,results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "DB error" });
        }
        res.json(results);
    });
})
router.get("/calender", async(req,res)=>{
    if(!req.session.user){
        return res.status(401).json({message: "need to login"});
    }
    const user_id = req.session.user.user_id;
    const sql = `select text_id, text, category, date,completed from todo.todo where user_id = ?`;
    db.query(sql, [user_id], (err,results)=>{
        if(err){
            console.error(err);
            return res.status(500).json({message: "DB error"});
        }
        res.json(results);
    })
})
module.exports = router;