// 冲刺API

const router = require('koa-router')();

const methods_sprint = require('./methods/sprint');

router.prefix('/project/sprint');

// 创建冲刺
router.post('/createSprint', async ctx => {
    await methods_sprint.createSprint(ctx);
})
// 删除冲刺
router.delete('/deleteSprint', async ctx => {
    await methods_sprint.deleteSprint(ctx);
})
// 获取冲刺列表
router.get('/queryAllSprint', async ctx => {
    await methods_sprint.queryAllSprint(ctx);
})
module.exports = router;