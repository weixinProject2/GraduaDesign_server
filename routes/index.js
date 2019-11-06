const router = require('koa-router')();
var fs=require("fs");
const path = require('path');
const moment = require('moment');

const allUserSql = require('../allSqlStatement/userSql');
const allOtherSql  = require('../allSqlStatement/otherSql');
const positionSql = require('../allSqlStatement/positionSql');
const professionalSql = require('../allSqlStatement/professionaSql');
const departmentSql = require('../allSqlStatement/departmentSql');
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
// 查询职位信息
router.get('/getPosition', async(ctx,next) => {
  const info = ctx.query;
  const professionalName = info.professionalName;
  let list;
  if (!professionalName) {
    list = await positionSql.queryAllPositionInfo();
  } else {
    list = await positionSql.queryPositionByName(professionalName);
  }
  console.log(list)
  ctx.body = {
    data: list,
    code: 0,
    total: list.length
}
});
// 查询职业信息
router.get('/getProfessional', async(ctx,next) => {
  const info = ctx.query;
  const professionalName = info.professionalName;
  let list;
  if (professionalName) {
     list = await professionalSql.queryPrefossinalByNmae(professionalName);
  } else {
     list = await professionalSql.queryAllPrefossinal();
  }
  ctx.body = {
    data: list,
    code: 0,
    total: list.length
}
});

// 查询部门信息

router.get('/getDepartment',async(ctx,next) => {
  const info = ctx.query;
  const departmentName = info.departmentName;
  let list;
  if (!departmentName) {
    list = await departmentSql.queryAllDepartInfo();
  } else {
    list = await departmentSql.queryDepartmentByName(departmentName);
  }
  ctx.body = {
    data : list,
    code : 0,
    total: list.length,
  }
});

// 管理员创建员工 
router.post('/createEmploye',async (ctx,next) => {
      const userInfo = ctx.request.body;
      
});


router.post("/upload", async (ctx)=>{

  const uploadUrl="http://hocalhost:3000/public/upload";
  const file=ctx.request.files.file;
  const reader=fs.createReadStream(file.path);
  let filePath = path.join(__dirname, '/public/upload/');
  
  let fileResource=filePath+`/${file.name}`;
  if(!fs.existsSync(filePath)){  //判断staic/upload文件夹是否存在，如果不存在就新建一个
  
  fs.mkdir(filePath,(err)=>{
  
  if(err){
  
  throw new Error(err)
  
  }else{
  
  let upstream=fs.createWriteStream(fileResource);
  
  reader.pipe(upstream);
  
  ctx.response.body={
  
  url:uploadUrl+`/${file.name}`
  
  }
  
  }
  
  })
  
  }else{
  
  let upstream=fs.createWriteStream(fileResource)
  
  reader.pipe(upstream);
  
  ctx.response.body={
  
        url:uploadUrl+`/${file.name}` //返给前端一个url地址
  
  }
  
  }
  
  })




module.exports = router;
