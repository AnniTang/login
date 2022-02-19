/**
 * Created by tjm on 9/7/2017.
 */
/*
 var express = require('express');
 var app = express();
 var session = require('express-session');
 var bodyparser = require('body-parser');
 // 下面三行设置渲染的引擎模板
 app.set('views', __dirname); //设置模板的目录
 app.set('view engine', 'html'); // 设置解析模板文件类型：这里为html文件
 app.engine('html', require('ejs').__express); // 使用ejs引擎解析html文件中ejs语法
 
 app.use(bodyparser.json()); // 使用bodyparder中间件，
 app.use(bodyparser.urlencoded({ extended: true }));
 
 // 使用 session 中间件
 app.use(session({
     secret :  'secret', // 对session id 相关的cookie 进行签名
     resave : true,
     saveUninitialized: false, // 是否保存未初始化的会话
     cookie : {
         maxAge : 1000 * 60 * 3, // 设置 session 的有效时间，单位毫秒
     },
 }));
 
 // 获取登录页面
 app.get('/login', function(req, res){
     res.sendFile(__dirname + '/login.html')
 });
 
 // 用户登录
 app.post('/login', function(req, res){
     if(req.body.username === 'admin' && req.body.pwd === '123'){
         req.session.userName = req.body.username; // 登录成功，设置 session
         res.redirect('/');
     }
     else{
         res.json({ret_code : 1, ret_msg : '账号或密码错误'});// 若登录失败，重定向到登录页面
     }
 });
 
 // 获取主页
 app.get('/', function (req, res) {
     if(req.session.userName){  //判断session 状态，如果有效，则返回主页，否则转到登录页面
         res.render('home',{username : req.session.userName});
     }else{
         res.redirect('login');
     }
 })
 
 // 退出
 app.get('/logout', function (req, res) {
     req.session.userName = null; // 删除session
     res.redirect('login');
 });
 
 app.listen(8000,function () {
     console.log('http://127.0.0.1:8000')
 })
*/
/*
const Koa = require('koa');                               // 导入Koa
const Koa_Session = require('koa-session');   // 导入koa-session     
// 配置
const session_signed_key = ["some secret hurr"];  // 这个是配合signed属性的签名key
const session_config = {
    key: 'koa:sess', // cookie的key。 (默认是 koa:sess) 
    maxAge: 4000000,   //  session 过期时间，以毫秒ms为单位计算 。
    autoCommit: true, // 自动提交到响应头。(默认是 true) 
    overwrite: true, // 是否允许重写 。(默认是 true) 
    httpOnly: true, // 是否设置HttpOnly，如果在Cookie中设置了"HttpOnly"属性，那么通过程序(JS脚本、Applet等)将无法读取到Cookie信息，这样能有效的防止XSS攻击。  (默认 true) 
    signed: true, //是否签名。(默认是 true) 
    rolling: true, // 是否每次响应时刷新Session的有效期。(默认是 false) 
    renew: false, // 是否在Session快过期时刷新Session的有效期。(默认是 false) 
};

// 实例化
const app = new Koa();
const session = Koa_Session(session_config, app)
app.keys = session_signed_key;

// 使用中间件，注意有先后顺序
app.use(session);

app.use(ctx => {
    const databaseUserName = "testSession";
    const databaseUserPasswd = "noDatabaseTest";
    // 对/favicon.ico网站图标请求忽略
    if (ctx.path === '/favicon.ico') return;

    if (!ctx.session.logged) {  // 如果登录属性为undefined或者false，对应未登录和登录失败
        // 设置登录属性为false
        ctx.session.logged = false;

        // 取请求url解析后的参数对象，方便比对
        // 如?nickname=post修改&passwd=123解析为{nickname:"post修改",passwd:"123"}
        let query = ctx.request.query;

        // 判断用户名密码是否为空
        if (query.nickname && query.passwd) {

            // 比对并分情况返回结果  
            if (databaseUserName == query.nickname) {  // 如果存在该用户名

                // 进行密码比对并返回结果 
                ctx.body = (databaseUserPasswd == query.passwd) ? "登录成功" : "用户名或密码错误";
                ctx.session.logged = true;
            } else {                    // 如果不存在该用户名                                           //  如果用户名不存在
                ctx.body = "用户名不存在";
            }
        } else {
            ctx.body = "用户名密码不能为空";
        }
    } else {
        ctx.body = "已登录";
    }

}
);

app.listen(3000);
console.log("Koa运行在：http://127.0.0.1:3000");*/
const Koa = require('koa')
const Router = require('koa-router')
const render = require('koa-art-template')
const static = require('koa-static')
const bodyParser = require('koa-bodyparser')
const session = require('koa-session')
const path = require('path')
let app = new Koa()
 
// 通过任意字符串为基准进行加密算法的字符串
app.keys = ['some secret hurr']
const CONFIG = {
  key: 'koa:sess',
  maxAge: 86400000,
  autoCommit: true,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: true,
  renew: false
};

render(app, {
  root: path.join(__dirname, ''),
  extname: '.html',
  debug: process.env.NODE_ENV !== 'production'
})  
let router = new Router()

router.get('/', async ctx => {
  ctx.render('index')

    let username = ctx.request.body.username
    let password = ctx.request.body.password
    if(ctx.session.logged){
        ctx.session.user = {username}
        ctx.body = '登录成功'
}
else{
    if (username !== 'abc' || password !== '123') {
        ctx.throw(400, '用户名或密码错误')
      } else {
        ctx.session.user = {username}
        ctx.body = '登录成功:' + ctx.session.user.username
        ctx.session.logged = true;
      }
}
})

app.use(static(path.resolve('/login')))
app.use(session(CONFIG, app))
 
app.use(bodyParser())
app.use(router.routes())
  .use(router.allowedMethods())
 
app.on('error', (err,ctx) => {
  console.log(err)
  ctx.body = '有错了' + err
})
 
app.listen(8000,function () {
    console.log('http://127.0.0.1:8000')
})