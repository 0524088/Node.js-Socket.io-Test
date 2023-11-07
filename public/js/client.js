$(function() {
    
    let socket = '';
    let connect_status = true;

    let isLogin = false;
    // 防止重複觸發 emit
    let emit_flag_login = false;
    let emit_flag_logout = false;
    let emit_flag_send_msg = false;

    // 判斷是否有已登入
    fetch(`${SERVER_URL}/api/checkLoginStatus`, {
        method: 'get',
    })
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
        if(data.status) {
            socket = io.connect(SOCKET_URL);
            socket.emit('login');
            isLogin = true;
            addSocketListener();
            checkIn();
            $('.chat-con').html('');
        }
    })
    .catch((error) => {
        console.log(error);
    });


    // 登入
    $('.login-btn').on("click", () => {
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
                    password: pwd
                })
            })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                if(data.status) {
                    Swal.fire({
                        icon: "success", // 消息框的图标
                        text: data.msg, // 消息框的文本内容
                        timer: 1500, // 自动关闭消息框的时间（毫秒）
                        heightAuto: false // 關閉避免跑版
                    })
                    .then(() => {
                        socket = io.connect(SOCKET_URL); // 連線至 socket
                        socket.emit('login');
                        isLogin = true;
                        addSocketListener();
                    });
                }
                else {
                    Swal.fire({
                        icon: "error",
                        text: data.msg,
                        timer: 1500,
                        heightAuto: false // 關閉避免跑版
                    });
                }
            })
            .catch((error) => {
                console.log(error);
            });

            // axios.post(`${baseUrl}/login`, {
            //     account: acc,
            //     password: pwd
            // }, {
            //     headers: {'content-type': 'text/json'}
            // })
            // .then(function(response) {
            //     console.log(response);
            // })
            // .catch(function(error) {
            //     console.log(error);
            // });
        }
        else {
            Swal.fire({
                icon: "error",
                text: "Please enter a account & password",
                timer: 1500,
                heightAuto: false
            });
        }
    })

    // 按下Enter
    $(document).on("keypress", (e) => {
        if(e.keyCode == 13) {
            // 只有当SweetAlert2弹窗不可见时才模拟点击按钮
            if(!$('.swal2-container').is(':visible') && !isLogin) {
                $('.login-btn').click();
            }
            else {
                $('.sendBtn').click();
            }
        }
    });

    // 離開聊天室按鈕
    $('.leaveBtn').on("click", () => {
        let leave = confirm('Are you sure you want to leave?');
        if(leave && !emit_flag_logout) {
            socket.emit('logout');
            emit_flag_logout = true;
            fetch(`${SERVER_URL}/logout`, {
                method: 'GET'
            })
            .then((response) => response.json())
            .then((res) => {
                if(res.status) {
                    Swal.fire({
                        icon: "success",
                        text: "登出成功",
                        timer: 1500,
                        heightAuto: false
                    }).then(() => {
                        isLogin = false;
                        connect_status = true;
                        checkOut();
                    });
                }
            })
        }
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
        $("#account").val('');
        $("#password").val('');
    }
    
    // 隱藏聊天頁，顯示登入頁
    function checkOut() {
        $(".login-wrap").show('slow');
        $(".chat-wrap").hide("slow");
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
        socket.on('loginSuccess', (data) => {
            emit_flag_login = false;
            Swal.fire({
                icon: "success",
                text: "聊天室進入成功",
                timer: 1500,
                heightAuto: false
            }).then(() => {
                checkIn();
                $('.chat-con').html('');
            });
        });
        
        // 斷線重連
        socket.on('connect', () => {
            if(!connect_status) {
                connect_status = true;
                alert('伺服器連接成功');
            }
        });
    
        // 連線錯誤
        socket.on('disconnect', (reason) => {
            connect_status = false;
            if (reason === 'transport close') {
                console.log('服务器意外断开');
                alert('伺服器連接失敗');
            }
            else if (reason === 'ping timeout') {
              console.log('服务器手动断开或网络问题');
            }
        });
    
        // 離開成功
        socket.on('logoutSuccess', () => {
            emit_flag_logout = false;
            console.log('logout');
            removeSocketListener();
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
});

