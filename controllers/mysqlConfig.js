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
    let _sql = `select userName,permissions,workNumber,position,professional,departmentId from user_info where workNumber = ${user.workNumber} and password = ${user.password}`;
    return allServices.query(_sql);
  },

  // 查询用户信息
  queryUserInfo:function(workNumber) {
    let _sql = `select userName, workNumber,position,professional,departmentId,email,telNumber,sex,address from user_info where workNumber = ${workNumber}`
    return allServices.query(_sql);
  },
  // 根据部门ID查询部门名称
  queryDepartNameById:function(departmentId) {
    let _sql = `select departmentName from department_info where departmentId = ${departmentId};`
    return allServices.query(_sql);
  },
  //修改用户信息
  changeUserInfo:function (password, telNumber, email, address, workNumber) {
    let _sql = `update user_info set password='${password}', telNumber='${telNumber}', email='${email}', address='${address}' where workNumber = '${workNumber}';`;
    return allServices.query(_sql);
  },

  // 根据登录用户信息返回侧边栏菜单
  getSiderMenu:function (permission) {
    let _sql = `select menuName,menuId,fatherMenuId from menu_info where menuPermissionId = '${permission}';`;
    return allServices.query(_sql);
  }
};



module.exports = allServices;