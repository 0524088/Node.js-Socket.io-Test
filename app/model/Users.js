const pool = require(`${process.cwd()}/sql.js`);
const Users = {
    checkAccount: async (data) => {
        try {
            const conn = await pool.getConnection(); // 从连接池获取连接
            let sql = "select * from users where account = ?";
            const [result] = await conn.query(sql, [data.account]); // [result] 返回的结果中提取第一个元素，并将其赋值给名为 result 的变量
            conn.release(); // 释放连接回连接池
            return result;
        }
        catch (error) {
            console.error(error);
        }
    }
}

module.exports = Users;
