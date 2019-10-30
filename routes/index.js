const router = require('koa-router')();
const moment = require('moment');

const allUserSql = require('../allSqlStatement/userSql');
const allOtherSql  = require('../allSqlStatement/otherSql');
const addtoken = require('../token/index'); 
const getToken = require('../token/getToken');


// 获取登录用户信息
router.get('/login',async (ctx,next) => {
  const user = ctx.query;
  const userInfo = await allUserSql.login(user);
  if (userInfo.length === 0) {
    ctx.body = {
      message: '用户名或密码不正确'
    }
  } else {
    const tk = addtoken(userInfo[0]);
    ctx.body = {
      token: tk,
      userInfo:userInfo[0],
    }
  }
});

// 获取侧边栏
router.get('/getMenu',async (ctx,next) => {
  let token = ctx.request.header.authorization;
  let res = getToken(token);
  const permissionId = res.permission;
  const data = await allOtherSql.getSiderMenu(permissionId);
  for (let i = 0;i < data.length; i++) {
    if(data[i].fatherMenuId){
      const fatherId = data[i].fatherMenuId;
      for(let j=0;j<data.length;j++){
        if(data[j].menuId === Number(fatherId)){
          if(!data[j].children){
            data[j].children = [];
          }
          data[j].children.push(data[i]);
        }
      }
    }
  }
  const temData = data.filter((item)=>!item.fatherMenuId);
  ctx.body = {
    menus: temData,
  }
});

// 管理员创建员工 
router.post('/createEmploye',async (ctx,next) => {
      const userInfo = ctx.request.body;
      
});
module.exports = router;
