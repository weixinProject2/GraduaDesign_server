const moment = require('moment')
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const allUserSql = require('../../allSqlStatement/userSql')
const positionSql = require('../../allSqlStatement/positionSql')
const professionalSql = require('../../allSqlStatement/professionaSql')
const departmentSql = require('../../allSqlStatement/departmentSql')
const userSql = require('../../allSqlStatement/userSql')
const projectSql = require('../../allSqlStatement/projectSql')
const folderTreeSql = require('../../allSqlStatement/folderSql');
const fileSql = require('../../allSqlStatement/fileSql');
const addtoken = require('../../token/index')
const getToken = require('../../token/getToken')

async function postFile (ctx, caller = "admin") {
  let token = ctx.request.header.authorization
  let res_token = getToken(token)
 
  let permission = Number(res_token.permission);
  let departmentId = null;
  let workNumber = null;
  workNumber = res_token.workNumber;
  if(permission === 1) {
    const res_DepartmentId   = await departmentSql.queryDeparmentIdByWorkNumber(workNumber);
    departmentId = res_DepartmentId[0].departmentId;
  }

  const file = ctx.request.files.file; // 获取上传文件
  const fileInfo = ctx.request.body; 
  const folderId = fileInfo.folderId; // 获取文件夹ID
  if(!folderId) {
    return ctx.body = {
      message: '文件夹ID不能为空',
      error: -1,
    }
  }

  const desc = fileInfo.desc; // 获取文件描述信息
  isPublic = fileInfo.isPublic || 0; // 文件是否公开
  const createTime = moment(new Date).format('YYYY-MM-DD hh-ss-mm'); // 获取最新时间
  // 创建可读流
  const reader = fs.createReadStream(file.path);
  const format = file.name.split('.');
  var current_date = (new Date()).valueOf().toString();
  var random = Math.random().toString();
  const filename = file.name; // 获取文件名
  const kinds = format[format.length - 1]; // 获取文件类型
  var fileHashName = crypto.createHash('sha1', file.name).update(current_date + random).digest('hex'); //  获取文件加密后的名字
  let filePath = path.join('../../file/files/') + `${fileHashName}.${format[format.length - 1]}`;
  const userInfo = {
      filename,
      kinds,
      createTime,
      fileHashName,
      desc,
      folderId,
  }
  try {
    let tableFileName = ''
    let tableFolderName = ''
    if(permission === 0) {
      tableFolderName = "companyFolder_info"
      tableFileName = "companyFile_info";
      userInfo.isPublic = isPublic;
    }
    if(departmentId) {
        tableFolderName = "departmentFolder_info"
        tableFileName = "departmentFile_info";
        userInfo.departmentId = departmentId;
    }
    if(permission !== 0 && workNumber && `${folderId}`.length > 7) {
        tableFolderName = "personFolder_info"
        tableFileName = "personFile_info";
        userInfo.workNumber = workNumber;
    }  

    const res_idFolderId = await folderTreeSql.queryFolderisExit(folderId, tableFolderName);
    if(!res_idFolderId.length) {
      return ctx.body = {
        message: '无效的文件ID',
        error: -1
      }
    }
    const res_sameFile = await fileSql.querySameFile(filename, kinds, folderId, tableFileName);
    if(res_sameFile.length) {
      return ctx.body = {
        message: '同一个文件夹下，不可上传同名同类型文件',
        error: -1
      }
    }

    const res_result = await fileSql.postFile(userInfo, tableFileName);
      // 创建可写流
     
    const upStream = fs.createWriteStream(filePath);
     // 可读流通过管道写入可写流
     reader.pipe(upStream);
     return ctx.body = {
       message: '文件上传添加成功',
       url: `http://106.54.206.102:8080/files/${fileHashName}.${format[format.length - 1]}`,
     };
  }catch(e) {
    return ctx.body = {
      error: e.toString(),
      message: '文件上传失败'
    }
  }
}

async function deleteFile(ctx) {
  let token = ctx.request.header.authorization
  let res_token = getToken(token)
  if (res_token.permission != 0) {
    ctx.status = 403;
    return ctx.body = {
        message: '权限不足',
        error: -1
    }
  }
  const fileInfo = ctx.query;
  const fileId = fileInfo.fileId;
  if(!fileId) {
    return ctx.body = {
      message: '文件ID不能为空',
      error: -2,
    }
  }
  try {
      const res_fileName = await fileSql.queryFileName(fileId);
      if(res_fileName.length === 0) {
        return ctx.body = {
          message: '不存在此文件',
          error: -2,
        }
      }
      const fileTem = res_fileName[0];
      const filename = `${fileTem.filehashname}.${fileTem.kinds}`;
      const result = await fileSql.deleteCompanyFile(fileId);
      //  同步删除需要删除的文件 
      fs.unlinkSync(`../../file/files/${filename}`, err => {
        if(err) {
          throw  new Error(err);
        }
      })
      return ctx.body = {
        message: '文件删除成功',
        error: 0,
      }
  }catch (e) {
    return ctx.body = {
         message: e.toString(),
         error: -1,
    }
  }
}

async function queryFileList(ctx) {
  let token = ctx.request.header.authorization
  let res_token = getToken(token)
  if (res_token.permission != 0) {
    ctx.status = 403;
    return ctx.body = {
        message: '权限不足',
        error: -1
    }
  }
  const folderId = ctx.query.folderId
  if(!folderId) {
    return ctx.body = {
      message: "文件夹ID不能为空",
      error: -1
    }
  }
  const isPublic = ctx.query.isPublic || null;
  const page = ctx.query.page || 1;
  const size = ctx.query.size || 10;
  const startTime = ctx.query.startTime || null;
  const endTime = ctx.query.endTime || null;
  const kinds = ctx.query.kinds || null;
  const filename = ctx.query.filename || null;
  const queryFiled = {
    isPublic,
    startTime,
    endTime,
    kinds,
    filename,
  }
  for(let key in queryFiled) {
    if(queryFiled[key] === null) {
      delete queryFiled[key];
    }
  }
  try {
    const res_list = await fileSql.queryFileList(page, size, queryFiled, folderId);
    const res_total = await fileSql.queryFiletotal(queryFiled, folderId);
    res_list.map(item => {
      item.createTime = moment(item.createTime).format('YYYY-MM-DD');
      item.filepath = `http://106.54.206.102:8080/files/${item.filehashname}.${item.kinds}`
      delete item.filehashname;
    })
    return ctx.body = {
      list: res_list,
      page,
      size,
      total: res_total.length,
      error: 0,
    }
  }catch (e) {
    return ctx.body = {
      message: e.toString(),
      error: -1,
    }
  }
}

async function changeFilePublic(ctx) {
  let token = ctx.request.header.authorization
  let res_token = getToken(token)
  if (res_token.permission != 0) {
    ctx.status = 403;
    return ctx.body = {
        message: '权限不足',
        error: -1
    }
  }
  const params = ctx.request.body;
  const isPublic = params.isPublic;
  const fileId = params.fileId;
  if(!fileId) {
    return ctx.body = {
      message: '文件ID不能为空',
      error: -1
    }
  }
  if(isPublic !== 0 && isPublic !== 1) {
    return ctx.body = {
      message: '无效的isPublic字段',
      error: -2
    }
  }
  try {
    const res_fileName = await fileSql.queryFileName(fileId);
    if(res_fileName.length === 0) {
      return ctx.body = {
        message: '不存在此文件',
        error: -2,
      }
    }
    const res_result = await fileSql.changeFilePublic(isPublic, fileId);
    return ctx.body = {
      message: '修改成功',
      error: 0
    }
  }catch (e) {
    return ctx.body = {
      message: e.toString(),
      error: -1,
    }
  }
}

const methods = {
    postFile,
    deleteFile,
    queryFileList,
    changeFilePublic,
}

module.exports = methods
