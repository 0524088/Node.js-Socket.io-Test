require('dotenv').config(); // 使用環境變數
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const sharedSession = require('express-socket.io-session');

const app = express();
const httpServer = http.createServer(app); // 創建伺服器實例 with express框架
const wsServer = http.createServer();

const app_Url = process.env["APP_URL"];
const app_Port = process.env["APP_PORT"];
const socket_Url = process.env["SOCKET_URL"];
const socket_Port = process.env["SOCKET_PORT"];

const Middleware = require(`${process.cwd()}/app/middleware/middlewareController.js`);
const AuthController = require(`${process.cwd()}/app/controller/AuthController.js`);

// 加上一個監聽器來監聽這個 port
httpServer.listen(app_Port, () => {    
    console.log(`Http server start.\napp listening at ${app_Url}`);
});

// WebSocket服务器
wsServer.listen(socket_Port, () => {
    console.log(`WebSocket server start.\napp listening at ${socket_Url}`);
});

// 创建Socket.IO实例
const io = socketIo(wsServer);

// session 設置
app.use(Middleware.sessionMiddleware);
io.use(sharedSession(Middleware.sessionMiddleware, {
    autoSave: true
}));

// 設定模板引擎
app.set('view engine', 'ejs');

// 設定 ejs 引入目錄的路徑
app.use(express.static(`${process.cwd()}/public`));
app.use('/node_modules', express.static(`${process.cwd()}/node_modules/`));

// 解析JSON
app.use(express.json());


// [Router]===========================================================================================================================
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/index', (req, res) => {
    res.render('index');
});

// 登入
app.post("/login", Middleware.checkIsNotLogin, (req, res) => {
    AuthController.login(req, res);
});

// 登出
app.get("/logout", Middleware.checkIsLogin, (req, res) => {
    AuthController.logout(io, req, res); // 會通知 socket 登出
});

// 路由都沒找到會走這條
app.use((req, res) => {
    res.send('404 not found');
});
// =================================================================================================================================


// 連線事件處理
io.on('connection', (socket) => {
    console.log('WebSocket client connect');
    let session = socket.handshake.session;

    // 登入(手動連線會額外發送此事件，和自動連線做區別)
    socket.on('login', () => {
        socket.emit('loginSuccess'); // 發送登入成功訊息
        io.sockets.emit('getUsersCount', io.engine.clientsCount); // 目前連線數
        io.sockets.emit('getServerMsg', `${session.username} 加入聊天室`); // 從 session 取得進入的用戶名稱並顯示
    })
    
    // 發送訊息
    socket.on('sendMessage', (msg) => {
        console.log('WebSocket get message: ', msg);
        socket.broadcast.emit('getUsersMsg', { username: session.username, msg: msg });
    });

    // 登出(手動斷開 socket)
    socket.on('logout', (username) => {
        console.log(username);
        // socket.emit('logoutSuccess'); // 發送登出成功訊息
        io.sockets.emit('getUsersCount', io.engine.clientsCount);
        io.sockets.emit('getServerMsg', `${username} 離開聊天室`);
        // delete socketSession.someData; // 将 "someData" 替换为要删除的数据字段名
        // socketSession.save(); // 保存更改
    });
});
  
  