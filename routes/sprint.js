// 迭代API

const router = require('koa-router')();

const methods_sprint = require('./methods/sprint');

router.prefix('/project/sprint');

// 创建迭代
router.post('/createSprint', async ctx => {
    await methods_sprint.createSprint(ctx);
})
// 删除迭代
router.delete('/deleteSprint', async ctx => {
    await methods_sprint.deleteSprint(ctx);
})
// 获取迭代列表
router.get('/queryAllSprint', async ctx => {
    await methods_sprint.queryAllSprint(ctx);
})
// 获取迭代信息下拉框
router.get('/selectSprintInfo', async ctx => {
    await methods_sprint.getAllSprintByProjectID(ctx);
})
// 开启迭代或者关闭迭代

router.post('/startOrEndSprint', async ctx => {
    await methods_sprint.startOrEndSprint(ctx);
})
module.exports = router;