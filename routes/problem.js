// 冲刺API

const router = require('koa-router')();

const methods_problem = require('./methods/problem');

router.prefix('/project/sprint/problem');

// 创建问题
router.post('/createProblem', async ctx => {
    await methods_problem.createProblem(ctx);
})
// 删除冲刺
router.delete('/deleteSprint', async ctx => {
    await methods_sprint.deleteProblem(ctx);
})
// 获取所有问题列表
router.get('/getAllProblem', async ctx => {
    await methods_problem.getAllProblem(ctx);
})
// 修改问题
router.post('/changeProblem', async ctx => {
    await methods_problem.changeProblem(ctx);
})
module.exports = router;