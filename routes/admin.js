// 只有管理员能操作的API

const router = require('koa-router')();

const methods_project = require('./admin/project');
const methods_department = require('./admin/department');
const methods_stuff = require('./admin/stuff');
const methods_professional = require('./admin/professional');
const methods_position = require('./admin/position');
const methods_files = require('./admin/file');

router.prefix('/admin');

/*
    员工操作相关接口
*/

// 创建一名员工
router.post('/createEmployee', async (ctx, next) => {
   await methods_stuff.createEmployee(ctx);
});
// 获取所有员工信息
router.get('/getAllStuffInfo', async (ctx, next) => {
   await methods_stuff.getAllStuffInfo(ctx);
});
// 批量删除员工
router.post('/deleteStaffInfo', async (ctx, next) => {
    await methods_stuff.deleteStaffInfo(ctx);

});
// 管理员修改员工信息
router.post('/changeStuffInfo', async (ctx, next) => {
   await methods_stuff.changeStuffInfo(ctx);
});
// 随机创建一名员工
router.post('/randomCreateStuff', async (ctx, next) => {
    await methods_stuff.randomCreateStuff(ctx);
});



/* 
    部门相关接口  
*/

// 管理员删除部门
router.post('/deleteDepartment', async (ctx, next) => {
    await methods_department.deleteDepartment(ctx);
})

// 设置或者清空某个部门下的管理员
router.post('/setManagerDepart', async (ctx, next) => {
    await methods_department.setManagerDepart(ctx);
});

// 管理员修改部门信息
router.post('/changeDepartmentInfo', async (ctx, next) => {
    await methods_department.changeDepartmentInfo(ctx);
});

// 增加一个部门 
router.post('/addDepartment', async (ctx, next) => {
   await methods_department.addDepartment(ctx);
})

/* 
    职业相关接口  
*/

//  增加一个职业
router.post('/addProfessional', async ctx => {
    await methods_professional.addProfessional(ctx);
})
// 删除一个职业
router.delete('/deleteProfessional', async ctx => { 
   await methods_professional.deleteProfessional(ctx);
})


/*
    职位相关接口
*/

// 增加一个职位
router.post('/addPosition', async ctx => {
    await methods_position.addPosition(ctx);
})

// 删除一个职位
router.delete('/deletePosition', async ctx => {
    await methods_position.deletePosition(ctx);
})




/*
    项目相关接口
*/

// 查看所有项目详细信息
router.get('/queryAllProject', async ctx => {
    await methods_project.queryAllProject(ctx);
});
// 新增一个项目
router.post('/addProject', async ctx => {
   await methods_project.addProject(ctx);
});
// 删除一个项目
router.delete('/deleteProject', async ctx => {
    await methods_project.deleteProject(ctx);
});
// 分配项目到部门
router.post('/distribeProject', async ctx => {
    await methods_project.distribeProject(ctx);
});

// 管理员上传文件
router.post('/postFile', async ctx => {
    await methods_files.postFile(ctx);
})

router.delete('/deleteFile', async ctx => {
    await methods_files.deleteFile(ctx);
})
module.exports = router;