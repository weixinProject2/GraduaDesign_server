const router = require('koa-router')();
const userService = require('../controllers/mysqlConfig');
const getToken = require('../token/getToken');

router.prefix('/user');
router.get('/getUserInfo', async (ctx,next) => {
  const user = ctx.query;
  const workNumber = user.workNumber;
  let token = ctx.request.header.authorization;
  if (token) {
    let res = getToken(token);
    if (res && res.exp <= new Date()/1000) {
      ctx.status = 403;
      ctx.body = {
        msg: 'token已过期，请重新登录',
        code: 0
      }
    } else {
    const res = await userService.queryUserInfo(workNumber);
    const departmentId = res[0].departmentId;
    const res_department = await userService.queryDepartNameById(departmentId);
    const departmentName = res_department[0].departmentName;
    res[0].departmentName = departmentName;
      ctx.body = {
        data: res,
      }
    }
  } else {
    ctx.status = 401;
    ctx.body = {
      msg: '没有token',
      code: 0,
    }
  }
});
// 修改用户信息
router.post('/changeUserInfo',async (ctx,next) => {
    const userInfo = ctx.request.body;
    const password = userInfo.password;
    const telNumber = userInfo.telNumber;
    const email = userInfo.email;
    const address = userInfo.address;
    let token = ctx.request.header.authorization;
    if (token) {
        let res = getToken(token);
        if (res && res.exp <= new Date()/1000) {
          ctx.status = 403;
          ctx.body = {
            msg: 'token已过期，请重新登录',
            code: 0
          }
        } else {
        const workNumber = res.workNumber;
        const changeStatus = await userService.changeUserInfo(password, telNumber, email, address, workNumber);
        if (changeStatus.protocol41) {
            ctx.body = {
                message: '信息修改成功',
            }
        } else {
            ctx.body = {
                message: '信息修改失败',
            }
        }
        }
      } else {
        ctx.status = 401;
        ctx.body = {
          msg: '没有token',
          code: 0,
        }
      }
});
module.exports = router;
