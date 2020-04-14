// 文件类sql语句

const allServices = require('./index');

let fileSql  = {
  // 根据登录用户信息返回侧边栏菜单
  postFile:function (fileInfo, tableName) {
    let _sql;
    if(tableName === "companyFile_info") {
      _sql = `insert into companyFile_info (
        filename,
        filehashname, 
        kinds,
        fileDesc, 
        createTime,
        isPublic,
        folderId
        ) values (
          '${fileInfo.filename}',
          '${fileInfo.fileHashName}',
          '${fileInfo.kinds}',
          '${fileInfo.desc}',
          '${fileInfo.createTime}',
          ${fileInfo.isPublic},
          ${fileInfo.folderId}
        );`;
    }else if(tableName === "departmentFile_info") {
      _sql = `insert into departmentFile_info (
        filename,
        filehashname, 
        kinds,
        fileDesc, 
        createTime,
        departmentId,  
        folderId
        ) values (
          '${fileInfo.filename}',
          '${fileInfo.fileHashName}',
          '${fileInfo.kinds}',
          '${fileInfo.desc}',
          '${fileInfo.createTime}',
          ${fileInfo.departmentId},
          ${fileInfo.folderId}
        );`;
    }else {
      _sql = `insert into personFile_info (
        filename,
        filehashname, 
        kinds,
        fileDesc, 
        createTime,
        workNumber,  
        folderId
        ) values (
          '${fileInfo.filename}',
          '${fileInfo.fileHashName}',
          '${fileInfo.kinds}',
          '${fileInfo.desc}',
          '${fileInfo.createTime}',
          ${fileInfo.workNumber},
          ${fileInfo.folderId}
        );`;
    }
      return allServices.query(_sql);
  },
  deleteFile: function(fileId, tableFileName) {
    let _sql = `delete from ${tableFileName} where fileId = ${fileId};`;
    return allServices.query(_sql);
  },
  // 根据文件夹ID删除文件
  deleteCompanyFileByFolderId: function(folderId, tableName) {
    let _sql = `delete from ${tableName} where folderId = ${folderId};`;
    return allServices.query(_sql);
  },
  queryFileName: function(fileId) {
    let _sql = `select filehashname,kinds from companyFile_info where fileId = ${fileId};`;
    return allServices.query(_sql);
  },
  // 根据文件夹ID查询文件
  queryFileInfo: function(folderId) {
    let _sql = `select fileId, folderId, filename ,filehashname,kinds from companyFile_info where folderId = ${folderId};`;
    return allServices.query(_sql);
  },
  // 查询文件
  queryFileList: function(page, size, queryFiled, folderId, tableFileName) {
    let _sql = '';
    if(tableFileName === 'companyFile_info') {
        _sql = `select folderId, filename,filehashname ,fileId, kinds,fileDesc, isPublic, createTime from companyFile_info where folderId = ${folderId}`;
    }else if(tableFileName === "departmentFile_info"){
       _sql = `select folderId, filename,filehashname ,fileId, kinds,fileDesc, createTime from departmentFile_info where folderId = ${folderId}`;
    }else {
      _sql = `select folderId, filename,filehashname ,fileId, kinds,fileDesc, createTime from personFile_info where folderId = ${folderId}`;
    }
    for(let key in queryFiled) {
      if(key === 'startTime') {
          _sql += ` and createTime >= '${queryFiled[key]}'`
      }else if(key === 'endTime') {
          _sql += ` and createTime <= '${queryFiled[key]}'`;
      }else if(key === 'filename') {
          _sql += ` and filename like '%${queryFiled[key]}%'`;
      }else if(key === 'workNumber') {
        _sql += ` and ${key} = ${queryFiled[key]}`;
      }
      else {
          _sql += ` and ${key} = '${queryFiled[key]}'`;
      }
  }
    _sql += ` limit ${(page - 1) * size} , ${size};`;
    console.log(_sql)
    return allServices.query(_sql);
  },
  // 查询所有公司公开文件
    queryPublicFileInfo:function(){
      let _sql = 'select folderId, filename,filehashname ,fileId, kinds,fileDesc, createTime from companyFile_info where isPublic = 1;';
      return allServices.query(_sql);
    },
  // 查询满足条件的条数
  queryFiletotal: function(queryFiled, folderId, tableFileName) {
    let _sql = `select filename from ${tableFileName} where folderId = ${folderId}`;
    for(let key in queryFiled) {
      if(key === 'startTime') {
          _sql += ` and createTime >= '${queryFiled[key]}'`
      }else if(key === 'endTime') {
          _sql += ` and createTime <= '${queryFiled[key]}'`;
      }else if(key === 'filename') {
          _sql += ` and filename like '%${queryFiled[key]}%'`;
      }else {
          _sql += ` and ${key} = '${queryFiled[key]}'`;
      }
  }
    return allServices.query(_sql);
  },
  changeFilePublic: function(isPublic, fileId) {
    let _sql = `update companyFile_info set isPublic = ${isPublic} where fileId = ${fileId};`;
    return allServices.query(_sql);
  },
  // 根据文件名称和文件类型以及文件夹ID查询是否出现同名文件
  querySameFile: function(filename, kinds, folderId, tableName) {
    let _sql = `select filename from ${tableName} where filename = '${filename}' and kinds = '${kinds}' and folderId = ${folderId};`;
    return allServices.query(_sql);
  }
}
module.exports = fileSql;
