const router = require('koa-router')();
const userService = require('../controllers/mysqlConfig');

router.prefix('/users');

router.get('/',  async(ctx, next) =>{
  ctx.body = await userService.findUserData();
});

module.exports = router;
