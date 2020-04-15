// 项目API

const router = require('koa-router')();

const methods_project = require('./methods/project');

router.prefix('/project');

// 部门管理员开启项目
router.put('/openProject', async ctx => {
    await methods_project.openProject(ctx);
}) 
// 部门管理员分配项目到员工
router.post('/distribeProject', async ctx => {
   await methods_project.distribeProject(ctx);
})
router.get('/queryListInfo', async ctx => {
    await methods_project.queryListInfo(ctx);
})
// 删除项目成员
router.post('/deleteProjectStuff', async ctx => {
    await methods_project.deleteProjectStuff(ctx);
})

// 设置项目进度
router.post('/setProjectSchedultion', async ctx => {
    await methods_project.setProjectSchedultion(ctx);
})
//获取项目的详细信息
router.get('/getProjectDetailInfo', async ctx => {
    await methods_project.getProjectDetailInfo(ctx);
})
module.exports = router;