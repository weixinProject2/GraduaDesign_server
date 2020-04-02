// 文件类sql语句

const allServices = require('./index');

let fileSql  = {
  // 根据登录用户信息返回侧边栏菜单
  postCompanyFile:function (fileInfo) {
    let _sql = `insert into companyFile_info (
        filename,
        filehashname, 
        kinds,
        fileDesc, 
        createTime,
        workNumber,  
        public
        ) values (
          '${fileInfo.filename}',
          '${fileInfo.fileHashName}',
          '${fileInfo.kinds}',
          '${fileInfo.desc}',
          '${fileInfo.createTime}',
          ${fileInfo.workNumber},
          ${fileInfo.isPublic}
        );`;
      return allServices.query(_sql);
  }
}
module.exports = fileSql;
