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
// 获取冲刺信息下拉框
router.get('/selectSprintInfo', async ctx => {
    await methods_sprint.getAllSprintByProjectID(ctx);
})
// 开启冲刺或者关闭冲刺

router.post('/startOrEndSprint', async ctx => {
    await methods_sprint.startOrEndSprint(ctx);
})
module.exports = router;