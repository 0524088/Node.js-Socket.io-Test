const express = require('express');
const app = express();
const Sql = require('./sql.js')
const baseUrl = "http://localhost";
const port = 8080;

// 加上一個監聽器來監聽這個 port
app.listen(port, () => {    
    console.log(`server start.\napp listening at ${baseUrl}:${port}`);
});

// 設定模板引擎
app.set('view engine', 'ejs');

// 設定 ejs 引入目錄的路徑
app.use(express.static(`${__dirname}/public`));
app.use('/node_modules', express.static(__dirname + '/node_modules/'));


app.use(express.json()); // 解析JSON


// [Router]===========================================================================================================================
app.get('/', (request, response) => {
    response.render('index');
});

app.get('/index', (request, response) => {
    response.send('index')
});

// 登入
app.post("/login", async (request, response) => {
    try {
        const result = await Sql.checkAccount(request.body);

        let res = {
            status : false,
            msg    : "",
        };

        if(result.length === 0) {
            res.msg = "user undefined!";
        }
        else if(result[0].password != request.body.password) {
            res.msg = "password not matched!";
        }
        else {
            res.status = true;
            res.msg = "login success!";
        }

        response.setHeader('Content-Type', 'application/json');
        response.send(JSON.stringify(res));
	}
    catch(err) {
		response.send(err);
	}
});
// =================================================================================================================================