
// 员工操作相关API

const router = require('koa-router')();
const allUserSql = require('../allSqlStatement/userSql');
const departmentSql = require('../allSqlStatement/departmentSql');

router.prefix('/user');

// 获取用户信息
router.get('/getUserInfo', async (ctx,next) => {
  const user = ctx.query;
  const workNumber = user.workNumber;
  const res = await allUserSql.queryUserInfo(workNumber);
  const departmentId = res[0].departmentId;
  if (departmentId) {
    const res_department = await departmentSql.queryDepartNameById(departmentId);
    const departmentName = res_department[0].departmentName;
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
    const userInfo = ctx.request.body;
    const telNumber = userInfo.telNumber;
    const email = userInfo.email;
    const address = userInfo.address;
    const workNumber = userInfo.workNumber;
    if (!workNumber) {
      ctx.status = 400;
      ctx.body = {
        message: 'workNumber不能为空',
        code: -1,
      }
      return ;
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
module.exports = router;
