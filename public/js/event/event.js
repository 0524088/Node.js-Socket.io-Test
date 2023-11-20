import socketInstance from '../share/socket-module.js';
import public_var from '../share/public_var.js';
import { showOwnMessage, switchToAuthPage, switchToJoinRoomPage } from '../view-control.js';
import { showSweetAlert } from '../sweetalert.js';

let socket = '';
let isLogin = public_var.isLogin;

function initEventSocket() {
    socket = socketInstance.getSocketInstance();
}

function addEventListner() {
    // 登入
    $('#btn-login').on("click", () => {
        let acc = $('#account').val();
        let pwd = $('#password').val();
        if(acc && pwd) {
            fetch(`${SERVER_URL}/login`, {
                method: 'post',
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    account: acc,
                    password: pwd,
                })
            })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                $("#account").val('');
                $("#password").val('');
                if(data.status) {
                    showSweetAlert({
                        iconClass: "success",
                        msg: data.msg,
                        timer: 1500
                    })
                    .then(() => {
                        initEventSocket();
                        switchToJoinRoomPage();
                        isLogin = true;
                    });
                }
                else {
                    showSweetAlert({
                        iconClass: "error",
                        msg: data.msg,
                        timer: 1500
                    });
                }
            })
            .catch((error) => {
                console.log(error);
            });
        }
        else {
            showSweetAlert({
                iconClass: "error",
                msg: "Please enter a account & password"
            });
        }
    });

    // 加入房間
    $('#btn-join').on('click', () => {
        let room = $('#room').val();
        if(room) {
            socket.emit('join', room);
        }
        else {
            showSweetAlert({
                iconClass: "error",
                msg: "Please enter a room name"
            });
        }
    });

    // 按下Enter
    $(document).on("keypress", (e) => {
        if(e.keyCode == 13) {
            // 只有当SweetAlert2弹窗不可见时才模拟点击按钮
            // if(!$('.swal2-container').is(':visible') && !isLogin) {
            //     $('.login-btn').click();
            // }
            // else {
            //     $('.sendBtn').click();
            // }
        }
    });

    // 登出按鈕
    $('#btn-logout').on("click", () => {
        fetch(`${SERVER_URL}/logout`, {
            method: 'GET'
        })
        .then((response) => response.json())
        .then((res) => {
            if(res.status) {
                showSweetAlert({
                    iconClass: "success",
                    msg: "logged out success!",
                    timer: 1500
                })
                .then(() => {
                    isLogin = false;
                    socket.removeSocketListener();
                    switchToAuthPage();
                });
            }
        });
    });

    // 離開聊天室按紐
    $('#btn-leave').on("click", () => {
        Swal.fire({
            text: "Are you sure to leave?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel',
        })
        .then((result) => {
            if (result.isConfirmed) {
                socket.emit('leave');
            }
        });
    });

    // 按下send按鈕
    $('.sendBtn').on("click", () => {
        let msg = $('#sendtxt').val();
        sendMessage(msg);
        $('#sendtxt').val('');
    });
}

// 發送訊息
function sendMessage(msg) {
    if(msg) {
        console.log(msg);
        showOwnMessage(msg);
        socket.emit('sendMessage', msg);
    }
}



export {
    initEventSocket,
    addEventListner
}