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
          const departmentId = res_isDeparmentManger[0].departmentId;
          const res = await userSql.queryAllStuffInfoByDeartmentId(departmentId);

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
                }
          } else {
              ctx.body = {
                  mess: '该部门下还没有员工',
                  error: 0,
              }
          }
        }
    } catch(e) {
        ctx.body = {
            mess: '出现错误，查询失败',
            error: -1,
        }
    }



    console.log(workNumber);
})

module.exports = router;