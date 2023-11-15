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


const socketData = {
    roomList: {}
};

/**
 * socketData = {
 *     roomList: // 房間列表
 *     {
 *         [roomname1]: // 房間成員
 *         {
 *             [username1]: {},
 *             [username2]: {},...
 *         },
 *         [roomname2]: [
 *             [username1]: {},
 *             [username2]: {},...
 *         ],...
 *     }
 * }
 * 
 */

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
    res = AuthController.logout(req, res);
    if(res.status) {
        io.emit('logout', res.username); // 會通知 socket 登出
    }
});

// 確認登入狀態
app.get("/api/checkLoginStatus", (req, res) => {
    if(req.session.token) {
        res.send({
            status: true,
            msg: "user has already logged in!"
        });
    }
    else {
        res.send({
            status: false,
            msg: "user has not logged in"
        });
    }
});

// 確認是否曾意外從聊天室斷線 (判斷是否直接進入聊天室)
app.get("/api/checkDisconnectFromRoom", (req, res) => {
    if(req.session.room) {
        res.send({
            status: true,
            msg: "user enter room again!"
        });
    }
    else {
        res.send({
            status: false,
            msg: "user haven't enter room!"
        });
    }
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

    // 意外斷線情況回復
    if(session.room) {
        socket.join(session.room);
        socketData.roomList[session.room][session.token] = {};
        joinRoomEvent({ io: io, socket: socket, room: session.room, username: session.username });
    }

    // 加入房間
    socket.on('join', (room) => {
        // 将用户加入指定房间
        socket.join(room);

        if(!socketData.roomList.hasOwnProperty(room)) {
            socketData.roomList[room] = {}; // 房間內部成員
        }

        joinRoomEvent({ io: io, socket: socket, room: room, username: session.username });
    });
    
    // 發送訊息
    socket.on('sendMessage', (msg) => {
        console.log('WebSocket get message: ', msg);
        socket.to(room).emit('getUsersMsg', { username: session.username, msg: msg });
    });

    // 取得數量
    socket.on('getUsersCount', () => {
        const roomUsersCount = Object.keys(socketData.roomList[session.room]).length;
        socket.emit('getUsersCount', roomUsersCount);
    });

    // 登出(手動斷開 socket，需註銷 session)
    socket.on('leave', () => {
        console.log(`user: ${session.username} leave`);
        const room  = session.room;
        const token = session.token;

        // 將使用者從房間內移除
        delete socketData.roomList[room][token];

        leaveRoomEvent({ socket: socket, room: room });

        // 斷開房間連接
        socket.leave('room');
        socket.emit('leaveSuccess');
    });

    // 斷線
    socket.on('disconnect', (reason) => {
        console.log(`user: "${session.username}" leave unexpected`);
        const room  = session.room;
        const token = session.token;

        // 在房間的時候斷線
        if(room) {
            // 將使用者從房間內移除
            delete socketData.roomList[room][token];
            leaveRoomEvent({ socket: socket, room: room });
        }
    });
});

function joinRoomEvent({ io, socket, room, token, username }) {
    console.log(socketData.roomList);
    // 获取房间内的连接数量
    const roomUsersCount = Object.keys(socketData.roomList[room]).length;

    // 廣播給所有用戶
    io.to(room).emit('getUsersCount', roomUsersCount);

    // 廣播給其他用戶
    socket.to(room).emit('getServerMsg', `${username} 加入聊天室`);
}

function leaveRoomEvent({ socket, room, token, username }) {
    // 获取房间内的连接数量
    const roomUsersCount = Object.keys(socketData.roomList[room]).length;

    // 广播给房间内其他用户
    socket.to(room).emit('getUsersCount', roomUsersCount);
    socket.to(room).emit('getServerMsg', `${session.username} 離開聊天室`);
}
  
  