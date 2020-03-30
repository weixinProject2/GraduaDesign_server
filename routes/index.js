const router = require('koa-router')();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const allUserSql = require('../allSqlStatement/userSql');
const positionSql = require('../allSqlStatement/positionSql');
const professionalSql = require('../allSqlStatement/professionaSql');
const departmentSql = require('../allSqlStatement/departmentSql');
const userSql = require('../allSqlStatement/userSql');
const projectSql = require('../allSqlStatement/projectSql');

const methods_project = require('./admin/project');
const methods_department = require('./admin/department');
const methods_stuff = require('./admin/stuff');
const methods_professional = require('./admin/professional');
const methods_position = require('./admin/position');

const methods_announce = require('./public/announcement');

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
    const workNumber = userInfo[0].workNumber;
    const res_projectId = await allUserSql.queryMyProject(workNumber);
    let projectIdArr = [];
      if(res_projectId[0].currentProjectID) {
        projectIdArr = res_projectId[0].currentProjectID && res_projectId[0].currentProjectID.split(',');
      }
      const arr = []; 
      for(let item of projectIdArr) {
        const res_name = await projectSql.queryProjectNameById(item);
        const name = res_name[0].projectName;
        arr.push({
          projectName: name,
          projectId: item,
        })
    }
    userInfo[0].projectList = arr;
   return  ctx.body = {
      token: tk,
      userInfo:userInfo[0],
    }
  }
});

// 查询职位信息
router.get('/getPosition', async(ctx,next) => {
  await methods_position.getPosition(ctx);
});
// 查询职业信息
router.get('/getProfessional', async(ctx,next) => {
  await methods_professional.getProfessional(ctx);
});

// 查询部门信息
router.get('/getDepartment',async(ctx,next) => {
  const info = ctx.query;
  const departmentName = info.departmentName;
  const isProjectAssign = info.isProjectAssign;
  let list = [];
  if (!departmentName) {
    list = await departmentSql.queryAllDepartInfo();
    if(isProjectAssign) {
      list = list.filter((item) => {
        return item.departmentMangerId
      })
    }
  } else {
    list = await departmentSql.queryDepartmentByName(departmentName);
  }
  ctx.body = {
    data : list,
    code : 0,
    total: list.length,
  }
});

// 查询所属于项目
 router.get('/getMyProject', async ctx => {
    await methods_project.getMyProject(ctx);
 })



// 获取所有部门详细信息
router.get('/getAllDepartmentInfo', async(ctx,next ) => {
  const params = ctx.query;
  const initValue = {
      "departmentId": null,
      "departmentName": null,
      "departmentMangerName": null,
  };
  let queryFiled = params.queryparams;
  if (queryFiled) {
      queryFiled = JSON.parse(queryFiled);
  } else {
      queryFiled = initValue;
  }
  const page = params.page || 1;
  const size = params.size || 10;
  try {
      const res_result = await departmentSql.queryAllDepartmentInfo(page, size, queryFiled);
      const res_count =await departmentSql.queryAllDepartmentNum(queryFiled);
      const total = res_count[0]['count(*)'];
      ctx.body = {
          data:res_result,
          page: Number(page),
          size: Number(size),
          total,
          totalPage: Math.ceil(total/Number(size)),
          error: 0,
      }
  }catch(e) {
      ctx.body = {
          mess: e,
          error:-1,
      }
  }
});

// 查看所有职业详细信息
router.get('/getAllProfessionalInfo', async ctx => {
  const params = ctx.query;
  const page = params.page || 1;
  const size = params.size || 10;
  const initValue = {
      "professionalId": null,
      "professionalName": null,
  };
  let queryFiled = params.queryparams;
  if (queryFiled) {
      queryFiled = JSON.parse(queryFiled);
  } else {
      queryFiled = initValue;
  }
  try {
      const res_result = await professionalSql.queryAllPrefossinalInfo(page, size, queryFiled);
      const res_count =await professionalSql.queryAllProfessionaNum(queryFiled);
      for(let i=0;i<res_result.length;i++) {
          const res_num = await userSql.queryProfessionStuffNum(res_result[i].professionalName);
          const num = res_num[0]['count(*)'];
          res_result[i].num = num;
      }
      const total = res_count[0]['count(*)'];
      ctx.body = {
          data:res_result,
          page: Number(page),
          size: Number(size),
          total,
          totalPage: Math.ceil(total/Number(size)),
          error: 0,
      }
  }catch(e) {
      ctx.body = {
          mess: e,
          error:-1,
      }
  }
});

// 查看所有职位详细信息
router.get('/getAllPositionInfo', async ctx => {
  const params = ctx.query;
  const page = params.page || 1;
  const size = params.size || 10;
  const initValue = {
      "positionId": null,
      "positionName": null,
  };
  let queryFiled = params.queryparams;
  if (queryFiled) {
      queryFiled = JSON.parse(queryFiled);
  } else {
      queryFiled = initValue;
  }
  try {
      const res_result = await positionSql.queryAllPositionInfo(page, size, queryFiled);
      const res_count =await positionSql.queryAllPositionNum(queryFiled);
      for(let i=0;i<res_result.length;i++) {
          const res_num = await userSql.queryPositionNum(res_result[i].positionName);
          const num = res_num[0]['count(*)'];
          res_result[i].totalNumbers = num;
      }
      const total = res_count[0]['count(*)'];
      ctx.body = {
          data:res_result,
          page: Number(page),
          size: Number(size),
          total,
          totalPage: Math.ceil(total/Number(size)),
          error: 0,
      }
  }catch(e) {
      ctx.body = {
          mess: e,
          error:-1,
      }
  }
});

router.put('/releaseAnnoun', async ctx => {
    await methods_announce.releaseAnnouncement(ctx);
});

// 获取所有公告
router.get('/getAllAnnouncement', async ctx => {
  await methods_announce.getAllAnnouncement(ctx);
})

// 获取公告详情
router.get('/getAnnounceDetail', async ctx => {
  await methods_announce.getAllAnnounceDetail(ctx);
})

// 富文本上传图片
router.post('/postImg', async (ctx) => {
  const file = ctx.request.files.file; // 获取上传文件
  // 创建可读流
  const reader = fs.createReadStream(file.path);
  const format = file.name.split('.');
  var current_date = (new Date()).valueOf().toString();
  var random = Math.random().toString();
  var fileName = crypto.createHash('sha1', file.name).update(current_date + random).digest('hex');
  let filePath = path.join('../../file/imgUrl/') + `${fileName}.${format[format.length - 1]}`;
  try {  
      // 创建可写流
    const upStream = fs.createWriteStream(filePath);
     // 可读流通过管道写入可写流
     reader.pipe(upStream);
     return ctx.body = {
       message: '图片添加成功',
       url: `http://106.54.206.102:8080/imgUrl/${fileName}.${format[format.length - 1]}`,
     };
  }catch(e) {
    return ctx.body = {
      error: -1,
      message: '图片添加失败失败'
    }
  }
})

router.delete('/deleteAnouncement', async ctx => {
  await methods_announce.deleteAnouncement(ctx);
})

module.exports = router;
