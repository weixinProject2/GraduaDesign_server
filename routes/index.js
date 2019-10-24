const router = require('koa-router')();
const userService = require('../controllers/mysqlConfig');
const addtoken = require('../token/index'); 

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
});

// 获取登录用户信息
router.get('/getUserInfo',async (ctx,next) => {
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
module.exports = router;
