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
  },
  deleteCompanyFile: function(fileId) {
    let _sql = `delete from companyFile_info where fileId = ${fileId};`;
    return allServices.query(_sql);
  },
  queryFileName: function(fileId) {
    let _sql = `select filehashname,kinds from companyFile_info where fileId = ${fileId};`;
    return allServices.query(_sql);
  },
  queryFileList: function(isPublic) {
    let _sql;
    if(isPublic == 0 || isPublic == 1) {
      _sql = `select filename,filehashname ,fileId, kinds,fileDesc, public, createTime from companyFile_info where public = ${isPublic}`;
    }else {
      _sql = 'select filename, fileId, kinds,fileDesc, public, createTime from companyFile_info';
    }
    return allServices.query(_sql);
  },
  changeFilePublic: function(isPublic, fileId) {
    let _sql = `update companyFile_info set public = ${isPublic} where fileId = ${fileId};`;
    return allServices.query(_sql);
  }
}
module.exports = fileSql;
