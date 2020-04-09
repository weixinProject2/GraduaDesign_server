// 文件类sql语句

const allServices = require('./index');

let fileSql  = {
  // 根据登录用户信息返回侧边栏菜单
  postFile:function (fileInfo, caller) {
    let _sql;
    if(caller === "admin") {
      _sql = `insert into companyFile_info (
        filename,
        filehashname, 
        kinds,
        fileDesc, 
        createTime,
        workNumber,  
        isPublic,
        folderId
        ) values (
          '${fileInfo.filename}',
          '${fileInfo.fileHashName}',
          '${fileInfo.kinds}',
          '${fileInfo.desc}',
          '${fileInfo.createTime}',
          ${fileInfo.workNumber},
          ${fileInfo.isPublic},
          ${fileInfo.folderId}
        );`;
    }else if(caller === "department") {
      _sql = `insert into departmentFile_info (
        filename,
        filehashname, 
        kinds,
        fileDesc, 
        createTime,
        workNumber,  
        ) values (
          '${fileInfo.filename}',
          '${fileInfo.fileHashName}',
          '${fileInfo.kinds}',
          '${fileInfo.desc}',
          '${fileInfo.createTime}',
          ${fileInfo.workNumber},
        );`;
    }
      return allServices.query(_sql);
  },
  deleteCompanyFile: function(fileId) {
    let _sql = `delete from companyFile_info where fileId = ${fileId};`;
    return allServices.query(_sql);
  },
  // 根据文件夹ID删除文件
  deleteCompanyFileByFolderId: function(folderId) {
    let _sql = `delete from companyFile_info where folderId = ${folderId};`;
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
  queryFileList: function(page, size, queryFiled) {
    let _sql = 'select filename,filehashname ,fileId, kinds,fileDesc, isPublic, createTime from companyFile_info';
    let count = 0;
    for(let key in queryFiled) {
      if(key === 'startTime') {
         if(count > 0) {
           _sql += ' and';
         }else {
           count++;
           _sql += ' where';
         }
          _sql += ` createTime >= '${queryFiled[key]}'`
      }else if(key === 'endTime') {
        if(count > 0) {
          _sql += ' and';
        }else {
          count++;
          _sql += ' where';
        }
          _sql += ` createTime <= '${queryFiled[key]}'`;
      }else if(key === 'filename') {
        if(count > 0) {
          _sql += ' and';
        }else {
           count++;
          _sql += ' where';
        }
          _sql += ` filename like '%${queryFiled[key]}%'`;
      }else {
        if(count > 0) {
          _sql += ' and';
        }else {
           count++;
          _sql += ' where';
        }
          _sql += ` ${key} = '${queryFiled[key]}'`;
      }
  }
    _sql += ` limit ${(page - 1) * size} , ${size};`;
    return allServices.query(_sql);
  },
  // 查询满足条件的条数
  queryFiletotal: function(queryFiled) {
    let _sql = 'select filename from companyFile_info';
    let count = 0;
    for(let key in queryFiled) {
      if(key === 'startTime') {
         if(count > 0) {
           _sql += ' and';
         }else {
           count++;
           _sql += ' where';
         }
          _sql += ` createTime >= '${queryFiled[key]}'`
      }else if(key === 'endTime') {
        if(count > 0) {
          _sql += ' and';
        }else {
          count++;
          _sql += ' where';
        }
          _sql += ` createTime <= '${queryFiled[key]}'`;
      }else if(key === 'filename') {
        if(count > 0) {
          _sql += ' and';
        }else {
           count++;
          _sql += ' where';
        }
          _sql += ` filename like '%${queryFiled[key]}%'`;
      }else {
        if(count > 0) {
          _sql += ' and';
        }else {
           count++;
          _sql += ' where';
        }
          _sql += ` ${key} = '${queryFiled[key]}'`;
      }
  }
    return allServices.query(_sql);
  },
  changeFilePublic: function(isPublic, fileId) {
    let _sql = `update companyFile_info set isPublic = ${isPublic} where fileId = ${fileId};`;
    return allServices.query(_sql);
  },
  // 根据文件名称和文件类型以及文件夹ID查询是否出现同名文件
  querySameFile: function(filename, kinds, folderId) {
    let _sql = `select filename from companyFile_info where filename = '${filename}' and kinds = '${kinds}' and folderId = ${folderId};`;
    return allServices.query(_sql);
  }
}
module.exports = fileSql;
