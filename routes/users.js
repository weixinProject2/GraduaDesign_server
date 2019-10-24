const router = require('koa-router')();
const userService = require('../controllers/mysqlConfig');

router.prefix('/test');
// 获取登录用户信息
router.get('/getsession',async (ctx,next) => {
    ctx.body = {
    }
});
module.exports = router;
