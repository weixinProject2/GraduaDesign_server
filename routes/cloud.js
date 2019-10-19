const router = require('koa-router')();
const fs = require('fs');
const userService = require('../controllers/mysqlConfig');

router.prefix('/cloud');

// 获取云慕课课程详情
router.post('/cloudGetMoocCourseDetail', async (ctx, next) => {
  const category = ctx.request.body.category;
  const res = await userService.cloudMoocCourse(category);
  ctx.body = {
    list: res
  }
});

router.get('/getPdfInfo', async (ctx, next) => {
  // ctx.body = {
  //   list :'data',
  // }
  ctx.response.set({
    "Content-type":"application/octet-stream",
    "Content-Disposition":"attachment;filename=test.pdf"
  })
  const ret = fs.readFileSync("./test.pdf");
  ctx.body = {
    bufferData:ret
  }
  // console.log(ret);
  // //有效代码结束
  // //下面的是读取文件的另一种方式
  // let readStream = fs.createReadStream('./test.pdf', { encoding: 'utf8' });
  // var fileData = '';
  // //读取文件发生错误事件
  // readStream.on('error', (err) => {
  //     console.log('发生异常:', err);
  // });
  // //已打开要读取的文件事件
  // readStream.on('open', (fd) => {
  //     console.log('文件已打开:');
  // });
  // //文件已经就位，可用于读取事件
  // readStream.on('ready', () => {
  //     console.log('文件已准备好..');
  // });
  // //文件读取中事件·····
  // readStream.on('data', (chunk) => {
  //     console.log('读取文件数据:');

  //     fileData += chunk;
  // });
  // //文件读取完成事件
  // readStream.on('end', (data) => {
  //     console.log('读取已完成..');
  //     // res.send(fileData)
  // });

  // //文件已关闭事件
  // readStream.on('close', () => {
  //     console.log('文件已关闭！');
  // });

});
module.exports = router;