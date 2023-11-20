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

// 切換至登入頁面
function switchToAuthPage() {
    $('#div_auth').show();
    $('#div_socket').hide();

}

// 切換至房間頁面
function switchToJoinRoomPage() {
    $('#div_auth').hide();
    $('#div_socket').show();
}

// 顯示自己發送的訊息
function showOwnMessage(msg) {
    let html = 
                `   
                    <div class="chat-item item-right clearfix">
                        <span class="abs uname">me</span>
                        <span class="message fr">${msg}</span>
                    </div>
                `;
    $('.chat-con').append(html);
}

// 顯示其他人發送的訊息
function showMessage(data) {
    let html = 
                `
                    <div class="chat-item item-left clearfix rela">
                        <span class="abs uname">${data.username}</span>
                        <span class="fl message">${data.msg}</span>
                    </div>
                `;
    $('.chat-con').append(html);
}

export {
    checkIn,
    checkOut,
    switchToAuthPage,
    switchToJoinRoomPage,
    showOwnMessage,
    showMessage
}