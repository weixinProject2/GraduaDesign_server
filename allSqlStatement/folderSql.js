// 其他类sql语句

const allServices = require('./index');

let folderSql  = {
  // 根据登录用户信息返回侧边栏菜单
  queryFolder:function (parentFolderId) {
    let _sql = `select folderId,folderName from companyFolder_info where parentFolderId = ${parentFolderId};`;
    return allServices.query(_sql);
  },
  // 查询是否存在同名文件夹
  queryisExitFolder: function(parentId, folderName) {
     let _sql = `select folderId from companyFolder_info where parentFolderId = ${parentId} and folderName = '${folderName}';`;
     return allServices.query(_sql);
  },
  queryParentID: function(folderId) {
    let _sql = `select parentFolderId from companyFolder_info where folderId = ${folderId};`;
    return allServices.query(_sql);
  },
  // 重命名文件夹
  renameFolder: function(folderId, folderName) {
    let _sql = `update companyFolder_info set folderName = '${folderName}' where folderId = ${folderId};`;
    return allServices.query(_sql);
  },
  // 新建文件夹
  createNewFolder: function(parentId, folderName) {
    let _sql = `insert into companyFolder_info(
      folderName,
      parentFolderId
    ) VALUES (
      '${folderName}',
      ${parentId}
    );
    `;
    return allServices.query(_sql);
  }
}
module.exports = folderSql;
