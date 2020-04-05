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
const fileSql = require('../../allSqlStatement/fileSql');
const addtoken = require('../../token/index')
const getToken = require('../../token/getToken')

async function postFile (ctx) {
  let token = ctx.request.header.authorization
  let res_token = getToken(token)
  if (res_token.permission != 0) {
    ctx.status = 403;
    return ctx.body = {
        message: '权限不足',
        error: -1
    }
  }
  const workNumber = res_token.workNumber; // 获取工号

  const file = ctx.request.files.file; // 获取上传文件
  const fileInfo = ctx.request.body; 
  const desc = fileInfo.desc; // 获取文件描述信息
  const isPublic = fileInfo.isPublic || 0; // 文件是否公开，
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
      workNumber,
      filename,
      kinds,
      createTime,
      fileHashName,
      isPublic,
      desc,
  }
  try {  

    const res_result = await fileSql.postCompanyFile(userInfo);
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
  console.log(queryFiled);
  try {
    const res_list = await fileSql.queryFileList(page, size, queryFiled);
    res_list.map(item => {
      item.createTime = moment(item.createTime).format('YYYY-MM-DD');
      item.filepath = `http://106.54.206.102:8080/files/${item.filehashname}.${item.kinds}`
      delete item.filehashname;
    })
    return ctx.body = {
      list: res_list,
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
