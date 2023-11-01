require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const Url = process.env["APP_URL"];
const Port = process.env["APP_PORT"];
const corsOptions = {
    origin: Url, // 客戶端 port
    credentials: true,
};
const app = express();
const AuthController = require(`${process.cwd()}/app/controller/AuthController.js`);

// 加上一個監聽器來監聽這個 port
app.listen(Port, () => {    
    console.log(`server start.\napp listening at ${Url}`);
});

// 設定模板引擎
app.set('view engine', 'ejs');

// 設定 ejs 引入目錄的路徑
app.use(express.static(`${process.cwd()}/public`));
app.use('/node_modules', express.static(`${process.cwd()}/node_modules/`));

// 解析JSON
app.use(express.json());

// session 設置
app.use(session({
    secret: 'thef2e_chatroom',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000 * 3, // 存活時間為三小時
    },
}));

app.use(cors(corsOptions)); // 要在 API 的上面先使用

// [Router]===========================================================================================================================
app.get('/', (request, response) => {
    response.render('index');
});

app.get('/index', (request, response) => {
    response.send('index')
});

// 登入
app.post("/login", (request, response) => {
    AuthController.checkAccount(request, response);
});
// =================================================================================================================================