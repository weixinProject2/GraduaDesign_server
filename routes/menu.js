// 文件管理API

const router = require('koa-router')();

const methods_menu = require('./public/menu');

router.prefix('/menu');

router.get('/getSiderMenu', async ctx => {
    await methods_menu.getSiderMenu(ctx);
})

module.exports = router;