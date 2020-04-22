// 其他类sql语句

const allServices = require('./index');

let menuSql  = {
  // 根据登录用户信息返回侧边栏菜单
  getSiderMenu:function (permission) {
    let _sql = `select menu_key, menu_icon, menu_path, menu_text from menu_info where permission = ${permission};`;
    console.log(_sql)
    return allServices.query(_sql);
  }
}
module.exports = menuSql;
