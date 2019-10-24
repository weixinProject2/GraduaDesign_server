const mysql = require('mysql');
const config = require('./defaultConfig');

const pool = mysql.createPool({
  host: config.database.HOST,
  user: config.database.USERNAME,
  password: config.database.PASSWORD,
  database: config.database.DATABASE
});
let allServices = {
  query:function (sql,values) {
    return new Promise((resolve ,reject) =>{
      pool.getConnection(function (err,connection) {
          if(err){
            reject(err)
          }else
          {
            connection.query(sql,values,(err,rows) => {
                if(err){
                  reject(err)
                }else
              {
                resolve(rows)
              }
              connection.release()
            })
          }
      })
    })
  },

  // 获取登录用户信息
  getUerInfo:function (user) {
    let _sql = `select username,permissions,workNumber,position,professional,departmentId from user_info where workNumber = '${user.workNumber}' and password = '${user.password}'`;
    return allServices.query(_sql);
  },
};


module.exports = allServices;