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
  let res = getToken(token);
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
})
module.exports = router;
