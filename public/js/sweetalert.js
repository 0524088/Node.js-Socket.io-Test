async function showSweetAlert({ iconClass = '', msg = '', timer }) {
    let options = {
        icon: iconClass, // 消息框的图标
        text: msg, // 消息框的文本内容
        heightAuto: false // 關閉避免跑版
    }

    if(timer) options.timer = timer;

    await Swal.fire(options);
}

export {
    showSweetAlert
}