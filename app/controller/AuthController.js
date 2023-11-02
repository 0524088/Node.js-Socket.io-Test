const Users = require(`${process.cwd()}/model/Users`);

const AuthController = {
    login: async (request, response) => {
        try {
            let result = await Users.checkAccount(request.body);
            let res = {
                status : false,
                msg    : "",
            };
            
            // 查無資料
            if(result.length === 0) {
                res.msg = "user undefined!";
            }
            // 密碼不符
            else if(result[0].password != request.body.password) {
                res.msg = "password not matched!";
            }
            else {
                res.status = true;
                res.msg = "login success!";
                result = await Users.login(request.body); // 寫入登入狀態 & 產生&取得 token
                request.session.token     = result.token; // session 紀錄 token
                request.session.username  = request.body.account;
            }
    
            response.setHeader('Content-Type', 'application/json');
            response.send(JSON.stringify(res));
        }
        catch(err) {
            response.send(err);
        }
    },

    logout: async (io, request, response) => {
        try {
            const session = request.session;
            const username = session.username;
            result = await Users.logout(session.token);
            if(result) {
                console.log(username);
                io.emit('logout', username);
                await session.destroy();
                response.setHeader('Content-Type', 'application/json');
                response.status(200).send({
                    status: true,
                    msg: "user logout success!"
                });
            }
        }
        catch(err) {
            response.send(err);
        }
    }
};


module.exports = AuthController;