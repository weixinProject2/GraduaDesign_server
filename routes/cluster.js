const router = require('koa-router')();
const userService = require('../controllers/mysqlConfig');

router.prefix('/cluster');

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

module.exports = router;
