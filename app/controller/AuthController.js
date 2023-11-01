const Users = require(`${process.cwd()}/app/model/Users`);

const AuthController = {
    checkAccount: async (request, response) => {
        try {
            const result = await Users.checkAccount(request.body);
    
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
    }
};


module.exports = AuthController;