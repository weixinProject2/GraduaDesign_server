const router = require('koa-router')();
const userService = require('../controllers/mysqlConfig');

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
});
router.post('/getPaymentList',async(ctx,next) =>{
  const houseSouce = ctx.request.body.houseSouce;
  const paymentCode = ctx.request.body.paymentCode;
  const paymentDesc = ctx.request.body.paymentMethod;
  const data = {
    houseSouce,
    paymentCode,
    paymentDesc
  };
  const res = await userService.getParmentList(data);
  ctx.body = {
    list:res
  };
});
router.post('/createTableList',async(ctx,next) =>{
  let ret = true;
  let res = true;
  const tableData = ctx.request.body;
  let i;
  for (i=0;i<tableData.length;i++){
    res = await userService.savetableList(tableData[i]);
    ret &= res.protocol41;
  }
  if(res){
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
  let ret = true;
  let res = true;
  let i;
  const tableData = ctx.request.body;
  for (i=0;i<tableData.length;i++) {
       res = await userService.deleteTableList(tableData[i]);
       ret &= res.protocol41;
  }
  if(ret){
    ctx.body ={
      message:'删除数据成功'
    }
  } else {
    ctx.body = {
      message:'删除数据失败'
    }
  }
});
router.get('/getOrderList',async(ctx,next) =>{
  const res = await userService.getOrderList();
  ctx.body = {
    list:res
  }
});
router.post('/createOrderList',async(ctx,next) =>{
  const data = ctx.request.body.params;
  console.log(data);
  let flag = true;
  for(var i=0;i<data.length;i++){
    const res = await userService.saveOrderList(data[i]);
    flag &= res.protocol41;
  }
  if(flag){
    const res = await userService.getOrderList();
    ctx.body = {
      list:res
    }
  }
});
router.post('/deleteOrderList',async(ctx,next) =>{
  const data = ctx.request.body.params;
  let flag = true;
  for(var i=0;i<data.length;i++){
    const res = await userService.deleteOrderList(data[i].id);
    flag &= res.protocol41;
  }
  if(flag){
    const res = await userService.getOrderList();
    ctx.body = {
      list:res
    }
  }
});

//请求用户信息
router.post('/getUser',async(ctx,next)=>{
  const {username,password} = ctx.request.body.values;
  const res = await userService.userList(username,password);
  ctx.body = res
})
module.exports = router;
