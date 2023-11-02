const checkIsLogin = (req, res, next) => {
    // 执行身份验证逻辑
    if (req.session.token) {
        next(); // 如果身份验证成功，调用下一个中间件
    }
    else
    {
        res.status(400).send({
            status: false,
            msg: "user has not logged"
        });
    }
};

module.exports = checkIsLogin;