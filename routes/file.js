// 文件管理API

const router = require('koa-router')();

const methods_files = require('./admin/file');

router.prefix('/file');


// 管理员上传文件
router.post('/postFile', async ctx => {
    await methods_files.postFile(ctx);
})

router.delete('/deleteFile', async ctx => {
    await methods_files.deleteFile(ctx);
})
router.get('/queryfileList', async ctx => {
    await methods_files.queryFileList(ctx);
})
router.put('/changeFilePublic', async ctx => {
    await methods_files.changeFilePublic(ctx);
})
module.exports = router;