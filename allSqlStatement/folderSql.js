// 其他类sql语句

const allServices = require('./index');

let folderSql  = {
  // 根据登录用户信息返回侧边栏菜单
  queryFolder:function (parentFolderId) {
    let _sql = `select folderId,folderName from companyFolder_info where parentFolderId = ${parentFolderId};`;
    return allServices.query(_sql);
  },
  queryMinLevel: function() {
      let _sql = 'select max(level) from companyFolder_info';
      return allServices.query(_sql);
  }
}
module.exports = folderSql;
