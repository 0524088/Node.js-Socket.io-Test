import { checkIn, checkOut, showMessage } from '../view-control.js';
import { showSweetAlert } from '../sweetalert.js';


class SocketClient {
    constructor() {
        this.connect_status = true;
        this.socket = io.connect(SOCKET_URL);
        this.addSocketListener();
    }
     
    addSocketListener() {
        // 登入後連接 socket 成功
        this.socket.on('joinSuccess', (room) => {
            document.getElementById('room-title').innerHTML = `房間名稱: ${room}`;
            showSweetAlert({
                iconClass: "success",
                msg: `room: ${room} join success!`
            })
            .then(() => {
                checkIn();
                $('.chat-con').html('');
            });
        });

        // 斷線重連
        this.socket.on('connect', () => {
            if(!this.connect_status) {
                this.connect_status = true;
                showSweetAlert({
                    iconClass: "success",
                    msg: "伺服器連接成功",
                    timer: 1500
                });
            }
            console.log("socket is connecting");
        });

        // 離開成功
        this.socket.on('leaveSuccess', () => {
            console.log('leaveout');
            checkOut();
        });

        // 連線錯誤
        this.socket.on('disconnect', (reason) => {
            this.connect_status = false;
            if (reason === 'transport close') {
                showSweetAlert({
                    iconClass: "error",
                    msg: "服务器意外断开",
                });
            }
            else if (reason === 'ping timeout') {
                showSweetAlert({
                    iconClass: "error",
                    msg: "服务器手动断开或网络问题",
                });
            }
        });

        // 其他使用者訊息
        this.socket.on('getUsersMsg', (data) => {
            showMessage(data);
        });

        // 伺服器提示
        this.socket.on('getServerMsg', (msg) => {
            $('.chat-con').append(`<p>${msg}</p>`);
        });

        // 目前聊天室人數
        this.socket.on('getUsersCount', (count) => {
            console.log(`房間人數:${count}`);
            document.getElementById('chat-title').innerHTML = `在線人數: ${count}`;
        });
    }


    // 移除 socket 監聽
    removeSocketListener() {
        this.socket.off('loginSuccess');
        this.socket.off('connect');
        this.socket.off('disconnect');
        this.socket.off('logoutSuccess');
        this.socket.off('getUsersMsg');
        this.socket.off('getServerMsg');
        this.socket.off('getUsersCount');
    }

    emit(event, data) {
        if(typeof data == 'undefined') return this.socket.emit(event);
        else return this.socket.emit(event, data)
    }
}


export default SocketClient;