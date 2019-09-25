const router = require('koa-router')();
const userService = require('../controllers/mysqlConfig');

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
});
// 用户登录接口
router.post('/login', async (ctx, next) => {
  const username = ctx.request.body.params.username || '';
  const password = ctx.request.body.params.pass || '';
  const user = {
    username,
    password,
  };
  const res = await userService.LoginfindUserData(user);
  if(res.toString() === [].toString()){
      ctx.body = {
        title:'用户名或者密码不正确',
        status:false
      }
  }else
  {
    ctx.body = {
      title :'登录成功',
      status:true
    }
  }
});

router.post('/getPaymentList',async(ctx,next) =>{
  const res = await userService.getParmentList();
  ctx.body = {
    list:res
  }
});
module.exports = router;
