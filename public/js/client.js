$(function() {
    
    let socket = '';
    let room = '';
    let connect_status = true;

    let isLogin = false;
    // 防止重複觸發 emit
    let emit_flag_join = false;
    let emit_flag_send_msg = false;

    // 判斷是否有已登入
    fetch(`${SERVER_URL}/api/checkLoginStatus`, {
        method: 'get',
    })
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
        if(data.status) {
            isLogin = true;
            // 判斷是否曾意外從聊天室斷線 (判斷是否直接進入聊天室)
            fetch(`${SERVER_URL}/api/checkDisconnectFromRoom`, {
                method: 'get',
            })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                socket = io.connect(SOCKET_URL);
                addSocketListener();
                if(data.status) {
                    checkIn();
                    $('.chat-con').html('');
                }
                else {
                    switchFirstView(false);
                }
            })
            .catch((error) => {
                console.log(error);
            });
        }
    })
    .catch((error) => {
        console.log(error);
    });


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
                        socket = io.connect(SOCKET_URL); // 連線至 socket
                        addSocketListener();
                        switchFirstView(false);
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
                    removeSocketListener();
                    switchFirstView(true);
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
                emit_flag_logout = true;
            }
        });
    });

    // 按下send按鈕
    $('.sendBtn').on("click", () => {
        let msg = $('#sendtxt').val();
        sendMessage(msg);
        $('#sendtxt').val('');
    });

    // 隱藏登入頁，顯示聊天頁
    function checkIn() {
        $('.login-wrap').hide('slow');
        $('.chat-wrap').show('slow');
    }
    // 隱藏聊天頁，顯示登入頁
    function checkOut() {
        $(".login-wrap").show('slow');
        $(".chat-wrap").hide("slow");
    }

    function switchFirstView(enable) {
        if(enable) {
            $('#div_auth').show();
            $('#div_socket').hide();
        }
        else {
            $('#div_auth').hide();
            $('#div_socket').show();
        }
    }

    // 發送訊息
    function sendMessage(msg) {
        if(msg) {
            console.log(msg);
            showOwnMessage(msg);
            socket.emit('sendMessage', msg);
        }
    }
    
    // 顯示自己發送的訊息
    function showOwnMessage(msg) {
        html = `<div class="chat-item item-right clearfix">
                    <span class="abs uname">me</span>
                    <span class="message fr">${msg}</span>
                </div>`;
        $('.chat-con').append(html);
    }
    // 顯示其他人發送的訊息
    function showMessage(data) {
        html = `<div class="chat-item item-left clearfix rela">
                    <span class="abs uname">${data.username}</span>
                    <span class="fl message">${data.msg}</span>
                </div>`;
        $('.chat-con').append(html);
    }

    function addSocketListener() {
        // 登入後連接 socket 成功
        socket.on('joinSuccess', () => {
            emit_flag_join = false;
            socket.emit('getUsersCount');
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
        socket.on('connect', () => {
            if(!connect_status) {
                connect_status = true;
                showSweetAlert({
                    iconClass: "success",
                    msg: "伺服器連接成功",
                    timer: 1500
                });
            }
            console.log("socket is connecting");
        });
    
        // 連線錯誤
        socket.on('disconnect', (reason) => {
            connect_status = false;
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
        
        // 離開成功
        socket.on('leaveSuccess', () => {
            emit_flag_logout = false;
            console.log('leaveout');
            switchFirstView(false);
            checkOut();
        });

        // 其他使用者訊息
        socket.on('getUsersMsg', (data) => {
            showMessage(data);
        });
    
        // 伺服器提示
        socket.on('getServerMsg', (msg) => {
            $('.chat-con').append(`<p>${msg}</p>`);
        });
    
        // 目前聊天室人數
        socket.on('getUsersCount', (count) => {
            console.log(count);
            document.getElementById('chat-title').innerHTML = `在線人數: ${count}`;
        });
    }
    
    // 移除 socket 監聽
    function removeSocketListener() {
        socket.off('loginSuccess');
        socket.off('connect');
        socket.off('disconnect');
        socket.off('logoutSuccess');
        socket.off('getUsersMsg');
        socket.off('getServerMsg');
        socket.off('getUsersCount');
    }


    async function showSweetAlert({iconClass = '', msg = '', timer}) {
        let options = {
            icon: iconClass, // 消息框的图标
            text: msg, // 消息框的文本内容
            heightAuto: false // 關閉避免跑版
        }

        if(timer) options.timer = timer;

        await Swal.fire(options)
    }
});

