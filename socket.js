const app = require('http').createServer();
const io = require('socket.io')(app);
const port = 8000;
app.listen(port);

console.log(`socket server start.\napp is listening at ${port}.`);


let users = [];
// 當有連線進來
io.on('connection', (socket) => {
    let ip = socket.handshake.address;
    let name = null; // 當前登入用戶
    console.log(socket.handshake);
    console.log(`user[${ip}] connect`);

    // 斷線
    socket.on('disconnect', () => {
        users.splice(users.indexOf(name), 1); // 移除使用者名稱
        console.log(`user[${ip}] disconnect`);
        console.log(users);
        userOut(name);
    });

    // 登入
    socket.on('login', (data) => {
        let isNewPerson = true; // 是否為新用戶
        // 檢查有無重複使用者名稱
        for(i = 0; i < users.length; i++) {
            isNewPerson = (users[i].name === data.name) ? false : true;
        }

        // 新加入使用者
        if(isNewPerson) {
            name = data.name;
            socket.emit('loginSuccess', data);
            userIn(name, users.length);
        }
        else socket.emit('loginFail', '');
    });

    // 登出
    socket.on('logout', function(){
        socket.emit('leaveSuccess');
        userOut(name, users.length);
    });

    // 發送訊息
    socket.on('sendMessage', (data) => {
        io.sockets.emit('getUsersMsg', data);
    });


    // 使用者進入
    function userIn(name) {
        // 紀錄該使用者名稱
        users.push({
            name: name
        });
        console.log(users);
        io.sockets.emit('getServerMsg', `${name} 加入聊天室`); // 向所有連接的用戶廣播事件
        io.sockets.emit('getUsersCount', users.length);
    }
    // 使用者離開
    function userOut(name) {
        // 清除該使用者名稱
        users.map((val, index) => {
            if(val.name === name){
                users.splice(index, 1);
            }
        });
        console.log(`${name} left`);
        io.sockets.emit('getServerMsg', `${name} 離開聊天室`); // 向所有連接的用戶廣播事件
        io.sockets.emit('getUsersCount', users.length);
    }
});

