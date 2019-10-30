// 其他类sql语句

const allServices = require('./index');

let otherSql  = {
  // 根据登录用户信息返回侧边栏菜单
  getSiderMenu:function (permission) {
    let _sql = `select menuName,menuId,fatherMenuId from menu_info where menuPermissionId = '${permission}';`;
    return allServices.query(_sql);
  }
}
module.exports = otherSql;
