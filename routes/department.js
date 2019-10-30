 // 部门操作相关APi
const router = require('koa-router')();

router.prefix('/user');

// 获取所有部门
router.get('getAllDepartment', async(ctx,next) => {
    
});

module.exports = router;