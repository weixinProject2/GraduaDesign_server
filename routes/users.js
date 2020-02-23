
// 员工操作相关API

const router = require('koa-router')();
const allUserSql = require('../allSqlStatement/userSql');
const departmentSql = require('../allSqlStatement/departmentSql');
const getToken = require('../token/getToken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

router.prefix('/user');

// 获取用户信息
router.get('/getUserInfo', async (ctx,next) => {
  let token = ctx.request.header.authorization;
  let res_token = getToken(token);
  const workNumber = res_token.workNumber;
  const res = await allUserSql.queryUserInfo(workNumber);
  const departmentId = res[0].departmentId;
  let imgUrl = res[0].headerImg;
  if(imgUrl) {
    imgUrl = `http://106.54.206.102:8080/header/${imgUrl}`;
  }
  res[0].headerImg = imgUrl;
  if (departmentId) {
    const res_department = await departmentSql.queryDepartNameById(departmentId);
    const departmentName = res_department[0].departmentName;
    res[0].address = res[0].address.split(',');
    res[0].departmentName = departmentName;
      ctx.body = {
        data: res,
      }
  } else {
    ctx.body = {
      data: res
    }
  }
});


// 修改用户信息
router.post('/changeUserInfo',async (ctx,next) => {
    let token = ctx.request.header.authorization;
    const userInfo = ctx.request.body;
    const telNumber = userInfo.telNumber;
    const email = userInfo.email;
    const address = userInfo.address;
    let res_token = getToken(token);
    const workNumber = res_token.workNumber;
    if(workNumber == 100000) {
      return ctx.body = {
        message: '管理员信息不可修改',
        error: -1,
      }
    }
    const changeStatus = await allUserSql.changeUserInfo(telNumber, email, address, workNumber);
    if (changeStatus.protocol41) {
        ctx.body = {
            message: '信息修改成功',
            code: 0,
        }
    } else {
        ctx.body = {
            message: '信息修改失败',
            code: -1,
        }
    }
});

// 修改用户密码
router.post('/changePassword', async(ctx,next) => {
   const userInfo = ctx.request.body;
   const workNumber = userInfo.workNumber;
   const oldPassword = userInfo.oldPassword;
   const newPassword = userInfo.newPassword;
   const res_oldPass = await allUserSql.getPassByWorkNum(workNumber);
    if (oldPassword !== res_oldPass[0].password) {
      ctx.body = {
        message : '旧密码错误',
        error: -1,
      }
    } else {
      const res = await allUserSql.getPassByWorkNum(workNumber, newPassword);
      if (res.protocol41) {
        ctx.body = {
          message: '密码修改成功',
          error: 0,
        }
      } else {
        ctx.bodu = {
          message: '未知错误,密码修改失败',
          error: -2,
        }
      }
    }
});

// 用户上传头像
router.post('/postHeaderImg', async (ctx) => {
  let token = ctx.request.header.authorization;
  let res_token = getToken(token);
  const workNumber = res_token.workNumber;
  const file = ctx.request.files.file; // 获取上传文件
  // 创建可读流
  const reader = fs.createReadStream(file.path);
  const format = file.name.split('.');
  var current_date = (new Date()).valueOf().toString();
  var random = Math.random().toString();
  var fileName = crypto.createHash('sha1', file.name).update(current_date + random).digest('hex');
  let filePath = path.join('../file/header/') + `${fileName}.${format[format.length - 1]}`;
  try {
    const res_header_isSave = await allUserSql.queryUserHeader(workNumber);
    const imgPath = res_header_isSave[0].headerImg || null;
    if(imgPath) {
      // 异步删除已经存在的用户头像
      fs.unlink(`../file/header/${imgPath}`, err => {
        if(err) {
            throw err;
        }
      })
    }
    const res = await allUserSql.uploadHeaderImg(`${fileName}.${format[format.length - 1]}`, workNumber);
      // 创建可写流
    const upStream = fs.createWriteStream(filePath);
     // 可读流通过管道写入可写流
     reader.pipe(upStream);
     return ctx.body = "头像上传成功！";
  }catch(e) {
    return ctx.body = {
      error: -1,
      message: '上传头像失败'
    }
  }
})
module.exports = router;
