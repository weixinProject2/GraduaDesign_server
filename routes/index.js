const router = require('koa-router')();

const allUserSql = require('../allSqlStatement/userSql');
const positionSql = require('../allSqlStatement/positionSql');
const professionalSql = require('../allSqlStatement/professionaSql');
const departmentSql = require('../allSqlStatement/departmentSql');
const userSql = require('../allSqlStatement/userSql');
const projectSql = require('../allSqlStatement/projectSql');
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

// 查询职位信息
router.get('/getPosition', async(ctx,next) => {
  const info = ctx.query;
  const positionName = info.positionName;
  let list;
  if (!positionName) {
    list = await positionSql.queryPositionInfo();
  } else {
    list = await positionSql.queryPositionByName(positionName);
  }
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
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    const workNumber = res_token.workNumber; 
    try {
      const res_projectId = await allUserSql.queryMyProject(workNumber);
      let projectIdArr = res_projectId[0].currentProjectID.split(',');
      const arr = []; 
      for(let item of projectIdArr) {
        const res_name = await projectSql.queryProjectNameById(item);
        const name = res_name[0].projectName;
        arr.push({
          projectName: name,
          projectId: item,
        })
      }
      return ctx.body = {
        data: arr,
        error: 0,
      }
    }catch(e) {
      return ctx.body = {
        message: String(e),
        error: -1,
      }
    }
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

module.exports = router;
