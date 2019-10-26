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
    let _sql = `select userName,permissions,workNumber,position,professional,departmentId from user_info where workNumber = '${user.workNumber}' and password = '${user.password}'`;
    return allServices.query(_sql);
  },
  
  // 根据登录用户信息返回侧边栏菜单
  getSiderMenu:function (permission) {
    let _sql = `select menuName,menuId,fatherMenuId from menu_info where menuPermissionId = '${permission}';`;
    return allServices.query(_sql);
  }
};



module.exports = allServices;