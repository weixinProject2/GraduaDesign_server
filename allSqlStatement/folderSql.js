// 其他类sql语句

const allServices = require('./index');

let folderSql  = {
  // 根据登录用户信息返回侧边栏菜单
  q:function (permission) {
    let _sql = `select menuName,menuId,fatherMenuId from menu_info where menuPermissionId = '${permission}';`;
    return allServices.query(_sql);
  }
}
module.exports = folderSql;
