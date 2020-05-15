 // 部门操作相关APi
const router = require('koa-router')();
const moment = require('moment');

const departmentSql = require('../allSqlStatement/departmentSql');
const userSql = require('../allSqlStatement/userSql');
const positionSql = require('../allSqlStatement/positionSql');
const professionalSql = require('../allSqlStatement/professionaSql');
const methods_files = require('./admin/file');
const getToken = require('../token/getToken');

router.prefix('/department');

// 部门管理员查询其部门下所有员工信息
router.get('/getAllStuffInfo',async ctx=>{
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if(res_token.permission != 1 && res_token.permission != 0) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    } 
    const info  = ctx.query;
    const workNumber = info.workNumber;
    const initValue = {
        "userName": null,
        "workNumber": null,
        "positionId": null,
        "professionalId": null
    };
    let queryFiled = info.queryFiled;
    if (queryFiled) {
        try {
            queryFiled = JSON.parse(queryFiled);
        } catch(e) {
            ctx.status = 400;
            return ctx.body = {
                mess: '错误请求参数',
                error: -2
            }
        }
    } else {
        queryFiled = initValue;
    }
    const positionId = queryFiled.positionId;
    const professionalId = queryFiled.professionalId;
    if (positionId) {
        const res_postion = await positionSql.queryPositionNameById(positionId);
        const postionName = res_postion[0].positionName;
        delete queryFiled.positionId;
        queryFiled.position = postionName;
    }
    if (professionalId) {
        const res_professional = await professionalSql.queryPrefossinalById(professionalId);
        const professionalName = res_professional[0].professionalName;
        delete queryFiled.professionalId;
        queryFiled.professional = professionalName;
    }
    if(!workNumber) {
        return (
            ctx.body = {
                mess: '部门管理员工号不能为空',
                error: -3,
            }
        )
    }
    try {
        const res_isDeparmentManger = await departmentSql.queryDeparmentManagerId(workNumber);
        if(!res_isDeparmentManger.length) {
            ctx.body = {
                mess: '该工号不是部门管理员',
                error: -2
            }
        } else {
          const page = info.page || 1;
          const size = info.size || 10;
          
          const departmentId = res_isDeparmentManger[0].departmentId;
          const res = await userSql.queryAllStuffInfoByDeartmentId(page, size,departmentId, queryFiled);
          const res_total = await userSql.queryCountStuffInfo(departmentId, queryFiled);
          const total = res_total[0]['count(*)'];
          if(res.length) {
            for (let i=0;i<res.length;i++){
                const departmentId = res[i].departmentId;
                const positionName = res[i].position;
                const professionalName = res[i].professional;
                let entryTime = res[i].entryTime;
                entryTime = moment(entryTime).format('YYYY年MM月DD日');
                if (departmentId) {
                    const res_department = await departmentSql.queryDepartNameById(departmentId);
                    const departmentName = res_department[0].departmentName;
                    res[i].departmentName = departmentName;
                } else {
                    res[i].departmentName = null;
                }
                if (positionName) {
                    const res_position = await positionSql.queryPositionByName(positionName);
                    const positionId = res_position[0].positionId;
                    res[i].positionId = positionId;
                }
                if (professionalName) {
                    const res_professional = await professionalSql.queryPrefossinalByNmae(professionalName);
                    const professionalId = res_professional[0].professionalId;
                    res[i].professionalId = professionalId;
                }
                res[i].entryTime = entryTime;
            }
                ctx.body = {
                    list: res,
                    page: Number(page),
                    size: Number(size),
                    totalPage: Math.ceil(total/Number(size)),
                    total,
                }
          } else {
              ctx.body = {
                  list: [],
                  code: 0,
              }
          }
        }
    } catch(e) {
        
        ctx.body = {
            mess: '出现错误，查询失败',
            error: -1,
        }
    }
});
// 管理员批量删除部门员工
router.post('/deleteStuff', async ctx=>{
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if(res_token.permission != 1 && res_token.permission != 0) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    } 
    const departmentId = res_token.departmentId;
    const ret =  ctx.request.body;
    let workNumbers = ret.ids;
    let res;
    workNumbers = workNumbers.replace('[', '(');
    workNumbers = workNumbers.replace(']', ')');
    let workNumberArr = ret.ids;
    workNumberArr = workNumberArr.replace('[','');
    workNumberArr = workNumberArr.replace(']','');
    workNumberArr = workNumberArr.split(',');
    try {
        for(let i=0;i < workNumberArr.length;i++) {
            if(res_token.workNumber == workNumberArr[i]) {
                return ctx.body = {
                    mess: '移除失败，没有权限',
                    error: -4,
                }
            }
            let res_isDeparmentWork = await userSql.queryworkNumberisDepartment(workNumberArr[i], departmentId);
            if(!res_isDeparmentWork.length) {
                return ctx.body = {
                    mess: '当前部门中不存在该工号',
                    error: -1,
                }
            }
        }
    }catch(e) {

    }
    try {
         res = await userSql.clearDeparymentId(workNumbers, departmentId);
         if(!res.affectedRows) {
             ctx.body = {
                 mess: '当前部门下不存在该工号'
             }
         }
         if (res.protocol41) {
            ctx.body = {
                message: '移除成功',
                error: 0,
            }
        } else {
            ctx.body = {
                message: '移除失败',
                error: -1,
            }
        }
    } catch (e) {
        ctx.body = {
            message : '出现错误，移除失败',
            error: -1,
        }
    }
})

// 部门管理员上传部门文件
router.post('/postFile', async ctx => {
    await methods_files.postFile(ctx, "department");
})

module.exports = router;