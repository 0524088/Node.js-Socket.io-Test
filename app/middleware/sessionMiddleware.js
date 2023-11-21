import session from 'express-session';

const sessionMiddleware = session({
    secret: 'nodejs_test',
    resave: false, // // 是否要每次進入網頁時重新設置 seesion cookie，如果有設置失效，例如 5 分鐘，重新整理後又有 5 分鐘，但是必須要改成 true 才有效
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000 * 3, // 存活時間為三小時
    },
    name: 'test'
});


export default sessionMiddleware;