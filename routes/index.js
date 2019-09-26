const router = require('koa-router')();
const userService = require('../controllers/mysqlConfig');

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
});
router.post('/getPaymentList',async(ctx,next) =>{
  const houseSouce = ctx.request.body.houseSouce;
  const paymentMethod = ctx.request.body.paymentMethod;
  const data = {
    houseSouce,
    paymentMethod,
  };
  const res = await userService.getParmentList(data);
  ctx.body = {
    list:res
  };
});
router.post('/createTableList',async(ctx,next) =>{
  const res = await userService.savetableList(ctx.request.body);
  if(res.protocol41){
    ctx.body ={
      message:'新增数据成功'
    }
  } else {
    ctx.body = {
      message:'主键id不唯一，数据插入失败'
    }
  }
});
router.post('/deleteTableList',async(ctx,next) =>{
  const res = await userService.deleteTableList(ctx.request.body);
  if(res.protocol41){
    ctx.body ={
      message:'删除数据成功'
    }
  } else {
    ctx.body = {
      message:'删除数据失败'
    }
  }
});
module.exports = router;
