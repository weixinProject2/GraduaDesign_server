const router = require('koa-router')();
const userService = require('../controllers/mysqlConfig');

router.prefix('/cluster');
// 获取所有集群和node列表
router.post('/getNodeList',  async(ctx, next) =>{
  const res1 = await  userService.clusteGetMenuItemList();
  const res2 = await userService.clusteGetMenuList();
  const data = [];
  let res = {};
  for (let i=0;i<res1.length;i++)
  {
    res.title = res1[i].title;
    res.id = res1[i].id;
    res.key = res1[i].key;
    res.clusterId = res1[i].clusterId;
    res.children = [];
    for(let j=0;j<res2.length;j++){
      if (res1[i].sub === res2[j].sub) {
        res.children.push(res2[j]);
      }
    }
    data.push(res);
    res = {};
  }
  ctx.body = {
    data,
  }
});
//证书列表
router.get('/getCertificateList',async(ctx,next) => {
  const res = await  userService.certificateList();
  ctx.body = {
    list:res
  };
});
//权限列表
router.get('/permissionAllocationList',async(ctx,next) => {
  const res = await  userService.permissionAllocationList();
  ctx.body = {
    list:res
  };
});
// 获取某个集群下的详细node内容
router.post('/getNodeDetail',  async(ctx, next) =>{
  const  clusterName = ctx.request.body.clusterName;
  const res = await  userService.clusteGetMenuList(clusterName);
  ctx.response.body = {
    list:res,
  }

});
module.exports = router;
