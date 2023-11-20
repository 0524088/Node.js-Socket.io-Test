import socketInstance from './share/socket-module.js';
import public_var from './share/public_var.js';
import { checkIn, switchToJoinRoomPage } from './view-control.js';
import { initEventSocket, addEventListner } from './event/event.js';

$(() => {
    
    let socket = '';
    let isLogin = public_var.isLogin;

    checkStatus();
    addEventListner();

    async function checkStatus() {
        await checkLoginStatus();
        await checkDisconnectFromRoom();
    }

    // 判斷是否有已登入
    async function checkLoginStatus() {
        await fetch(`${SERVER_URL}/api/checkLoginStatus`, { method: 'get' })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                if(data.status) {
                    socket = socketInstance.getSocketInstance();
                    initEventSocket();
                    isLogin = true;
                    switchToJoinRoomPage();
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    // 判斷是否曾意外從聊天室斷線 (判斷是否直接進入聊天室)
    async function checkDisconnectFromRoom() {
        await fetch(`${SERVER_URL}/api/checkDisconnectFromRoom`, { method: 'get' })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                if(data.status) {
                    checkIn();
                    $('.chat-con').html('');
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }
});

