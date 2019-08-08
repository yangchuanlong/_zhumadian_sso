
const users = require('./users');
const express = require('express');
const path = require('path');
const md5 = require('js-md5');
const bodyParser = require('body-parser');


const app = express();
const secretConstant = 'HONGhxzqXINQ3571!%*$0793yaba87^%';

const NodeCache = require( "node-cache" );
const myCache = new NodeCache();

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, content-type,timestr, randomStr, md5Str");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    //res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({ extended: false }));



app.get('/', function (req, res) {
    const token = req.query.token || "";
    if(!myCache.get(token)) {
        res.sendFile(path.resolve(__dirname, './public/login.html'), {headers: {'Content-Type': 'text/html;charset=utf-8'}});
    } else {
        res.sendFile(path.resolve(__dirname, './public/index.html'), {headers: {'Content-Type': 'text/html;charset=utf-8'}});
    }
});


app.post('/login', function (req, res) {
   const timeStr = req.get('timestr');
   const randomStr = req.get('randomstr');
   const md5Str = req.get('md5str');
   const username = req.body.username;
   const password = req.body.password;
   const tmp = timeStr + secretConstant + randomStr;
   let calculatedMd5 = md5(tmp);
   calculatedMd5 = calculatedMd5.toUpperCase();
   if(md5Str !== calculatedMd5) { //数据不完整
       res.send({state: 0, nexturl: ''});
       return;
   }
   const existed = users.some(user => {
       if(user.username === username && user.password === password) {
           return true;
       }
   });

   if(existed) { //用户名密码正确
       const token = md5(username + password);
       myCache.set(token, true);
       res.send({state: 1, nexturl: `http://39.98.230.3:3000?token=${token}`});
       return;
   } else { //用户不存在
       res.send({state: 0, nexturl: ''});
       return;
   }
});


app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});

