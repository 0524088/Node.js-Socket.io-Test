require('dotenv').config(); // 使用環境變數
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const session = require('express-session');

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
    console.log(`WebSocket server start.\napp listening at ws://${socket_Url}`);
});

const io = socketIo(wsServer); // 创建Socket.IO实例

// 設定模板引擎
app.set('view engine', 'ejs');

// 設定 ejs 引入目錄的路徑===============================================================
app.use(express.static(`${process.cwd()}/public`));
app.use('/node_modules', express.static(`${process.cwd()}/node_modules/`));
//======================================================================================

// 解析JSON
app.use(express.json());

// session 設置
app.use(session({
    secret: 'nodejs_test',
    resave: false, // // 是否要每次進入網頁時重新設置 seesion cookie，如果有設置失效，例如 5 分鐘，重新整理後又有 5 分鐘，但是必須要改成 true 才有效
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000 * 3, // 存活時間為三小時
    },
    name: 'test'
}));
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

// 路由都沒找到會走這條
app.use((req, res) => {
    res.send('404 not found');
});
// =================================================================================================================================





// WebSocket Socket.IO连接事件处理
io.on('connection', (socket) => {
    console.log('WebSocket客户端已连接');

    // 处理WebSocket Socket.IO消息
    socket.on('message', (message) => {
        console.log('收到WebSocket Socket.IO消息:', message);

        // 回复WebSocket Socket.IO消息
        socket.emit('message', 'WebSocket服务器已收到消息: ' + message);
    });
});
  
  
  
  
  
  