$(function() {
    const socket = io('ws://localhost:8080'); // 連線至 socket
    let myName = null;
    let connect_status = true;

    // 防止重複觸發 emit
    let emit_flag_login = false;
    let emit_flag_logout = false;
    let emit_flag_send_msg = false;

    // 加入聊天室
    $('.login-btn').on("click", () => {
        myName = $('#loginName').val();
        console.log(myName);
        if(myName) {
            if(!emit_flag_login) {
                emit_flag_login = true;
                socket.emit('login', {name: myName}); // 發送登入 event
            }
        }
        else alert('Please enter a name');
    })
    // 離開聊天室
    $('.leaveBtn').on("click", () => {
        let leave = confirm('Are you sure you want to leave?')
        if(leave && !emit_flag_logout) {
            emit_flag_logout = true;
            socket.emit('logout', {name: myName});
        }
    });
    
    // 按下send按鈕
    $('.sendBtn').on("click", () => {
        sendMessage();
    });
    // 按下Enter
    $(document).on("keydown", (evt) => {
        if(evt.keyCode == 13) sendMessage();
    });
    
    // 伺服器連接成功
    socket.on('connect', () => {
        if(!connect_status) {
            connect_status = true;
            alert('伺服器連接成功');
        }
    });
    // 伺服器連線錯誤
    socket.on('disconnect', () => {
        connect_status = false;
        alert('伺服器連接失敗');
    });
    
    // 登入成功 event
    socket.on('loginSuccess', (data) => {
        emit_flag_login = false;
        if(data.name === myName) {
            checkIn();
            $('.chat-con').html('');
            console.log(data);
        }
        else alert('錯誤的用戶名稱，請再嘗試一次');
    });
    // 登入失敗 event
    socket.on('loginFail', () => {
        emit_flag_login = false;
        alert('用戶名稱已重複');
    });
    // 離開成功
    socket.on('leaveSuccess', () => {
        emit_flag_logout = false;
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
    

    // 隱藏登入頁，顯示聊天頁
    function checkIn() {
        $('.login-wrap').hide('slow');
        $('.chat-wrap').show('slow');
    }
    
    // 隱藏聊天頁，顯示登入頁
    function checkOut(){
        $(".login-wrap").show('slow');
        $(".chat-wrap").hide("slow");
    }
    
    // 發送訊息
    function sendMessage(){
        let txt = $('#sendtxt').val();
        $('#sendtxt').val('');
        if(txt) socket.emit('sendMessage', {name: myName, msg: txt});
    }
    
    // 顯示訊息
    function showMessage(data) {
        let html;
        if(data.name === myName) {
            html = `<div class="chat-item item-right clearfix">
                        <span class="abs uname">me</span>
                        <span class="message fr">${data.msg}</span>
                    </div>`;
        }
        else {
            html = `<div class="chat-item item-left clearfix rela">
                        <span class="abs uname">${data.name}</span>
                        <span class="fl message">${data.msg}</span>
                    </div>`;
        }
        $('.chat-con').append(html);
    }
});