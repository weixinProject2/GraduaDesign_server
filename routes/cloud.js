const router = require('koa-router')();
const userService = require('../controllers/mysqlConfig');

router.prefix('/cloud');

// 获取云慕课课程详情
router.post('/cloudGetMoocCourseDetail',async(ctx,next)=>{
    const res=await userService.cloudMoocCourse();
    ctx.body = {
      list:res
    }
});


module.exports = router;