 // 部门操作相关APi
const router = require('koa-router')();
const moment = require('moment');

const departmentSql = require('../allSqlStatement/departmentSql');
const userSql = require('../allSqlStatement/userSql');
const positionSql = require('../allSqlStatement/positionSql');
const professionalSql = require('../allSqlStatement/professionaSql');

router.prefix('/department');

// 部门管理员查询起部门下所有员工信息
router.get('/getAllStuffInfo',async ctx=>{
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
                  mess: '该部门下还没有员工',
                  error: 0,
              }
          }
        }
    } catch(e) {
        console.log(e);
        ctx.body = {
            mess: '出现错误，查询失败',
            error: -1,
        }
    }



    console.log(workNumber);
});
// 管理员批量删除部门员工
router.post('/deleteStuff', async ctx=>{
    const ret =  ctx.request.body;
    let workNumbers = ret.ids;
    let res;
    workNumbers = workNumbers.replace('[', '(');
    workNumbers = workNumbers.replace(']', ')');
    try {
         res = await userSql.deleteStuff(workNumbers);
         if (res.protocol41) {
            ctx.body = {
                message: '删除成功',
                error: 0,
            }
        } else {
            ctx.body = {
                message: '删除失败',
                error: -1,
            }
        }
    } catch (e) {
        ctx.body = {
            message : '出现错误，删除失败',
            error: -1,
        }
    }
})

module.exports = router;