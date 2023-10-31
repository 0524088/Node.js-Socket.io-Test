import sql from './sql.js';

// node.js 內建 http 相關 module
const http = require('http')
// createServer() 要傳入的參數是 function
const server = http.createServer(handler)


// 兩個參數分別是 request 和 response，這裡使用命名慣例寫法
function checkLogin(data) {
    result = sql.query(data);
    if(result.status === true) {

    }
    else {

    }

    response.write(result) // 指定 respone 回傳內容
    response.end(); // 結束這個 response
}

// 常見為 80 port，測試時使用 5001 port 就不易發生衝突
server.listen(5000);