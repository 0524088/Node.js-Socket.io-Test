// routes.js
import      express        from 'express';
import * as Middleware     from '../app/middleware/middlewareController.js';
import      AuthController from '../app/controller/AuthController.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/index', (req, res) => {
    res.render('index');
});

// 登入
router.post("/login", Middleware.checkIsNotLogin, (req, res) => {
    AuthController.login(req, res);
});

// 登出
router.get("/logout", Middleware.checkIsLogin, (req, res) => {
    res = AuthController.logout(req, res);
    if(res.status) {
        io.emit('logout', res.username); // 會通知 socket 登出
    }
});

// 確認登入狀態
router.get("/api/checkLoginStatus", (req, res) => {
    if(req.session.token) {
        res.send({
            status: true,
            msg: "user has already logged in!"
        });
    }
    else {
        res.send({
            status: false,
            msg: "user has not logged in"
        });
    }
});

// 確認是否曾意外從聊天室斷線 (判斷是否直接進入聊天室)
router.get("/api/checkDisconnectFromRoom", (req, res) => {
    if(req.session.room) {
        res.send({
            status: true,
            msg: "user enter room again!"
        });
    }
    else {
        res.send({
            status: false,
            msg: "user haven't enter room!"
        });
    }
});

// 路由都沒找到會走這條
router.use((req, res) => {
    res.send('404 not found');
});

export default router;