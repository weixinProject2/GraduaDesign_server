const router = require('koa-router')();
const moment = require('moment');
const userService = require('../controllers/mysqlConfig');
const addtoken = require('../token/index'); 
const getToken = require('../token/getToken');

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
});

// 获取登录用户信息
router.get('/login',async (ctx,next) => {
  const user = ctx.query;
  const userInfo = await userService.getUerInfo(user);
  if (userInfo.length === 0) {
    ctx.body = {
      message: '用户名或密码不正确'
    }
  } else {
    const tk = addtoken(userInfo[0]);
    ctx.body = {
      token: tk,
      userInfo:userInfo[0],
    }
  }
});
router.get('/getMenu',async (ctx,next) => {
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
      const permissionId = res.permission;
        const data = await userService.getSiderMenu(permissionId);
        for (let i = 0;i < data.length; i++) {
          if(data[i].fatherMenuId){
            const fatherId = data[i].fatherMenuId;
            for(let j=0;j<data.length;j++){
              if(data[j].menuId === Number(fatherId)){
                if(!data[j].children){
                  data[j].children = [];
                }
                data[j].children.push(data[i]);
              }
            }
          }
        }
        const temData = data.filter((item)=>!item.fatherMenuId);
      ctx.body = {
        menus: temData,
      }
    }
  } else {
    ctx.status = 401;
    ctx.body = {
      msg: '没有token',
      code: 0,
    }
  }
})
module.exports = router;
