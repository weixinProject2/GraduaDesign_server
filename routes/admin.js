// 只有管理员能操作的API

const router = require('koa-router')();
const moment = require('moment');

const allUserSql = require('../allSqlStatement/userSql');
const positionSql = require('../allSqlStatement/positionSql');
const professionalSql = require('../allSqlStatement/professionaSql');
const departmentSql = require('../allSqlStatement/departmentSql');

router.prefix('/admin');
// 创建一名员工
router.post('/createEmployee',async(ctx,next) => {
    const userInfo = ctx.request.body;
    const name = userInfo.name;
    const sex = userInfo.sex;
    const telNumber = userInfo.telNumber;
    const email = userInfo.email;
    const address = userInfo.address;
    const departmentId = userInfo.departmentId;
    const professionalId = userInfo.professionalId;
    const positionId = userInfo.positionId;
    let createTime = new Date();
    createTime = moment(createTime).format('YYYY-MM-DD HH:mm:ss');
    const position = await positionSql.queryPositionNameById(positionId);
    const positionName = position[0].positionName;
    const professional = await professionalSql.queryPrefossinalById(professionalId);
    const professionalName = professional[0].professionalName;
    const permissions = 2;

    const number = await allUserSql.getMaxWorkNumber();
    const maxWorkNumber = number[0]['max(workNumber)'];
    const workNumber = maxWorkNumber + 1;

    const password = '000000';

    const user = {
        name,
        sex,
        telNumber,
        email,
        address,
        departmentId,
        positionName,
        professionalName,
        permissions,
        workNumber,
        password,
        createTime,
    }
    const res = await allUserSql.insetNewEmployee(user);
    if (res.protocol41) {
        ctx.body = {
            message: '员工新增成功',
            error: 0,
        }
    } else {
        ctx.body = {
            message : '新增员工失败',
            error: -1,
        }
    }
});
// 获取所有员工信息
router.get('/getAllStaffInfo', async(ctx,next) => {
    const params = ctx.query;
    const initValue = {
        "userName": null,
        "workNumber": null,
        "positionId": null,
        "departmentId": null,
        "professionalId": null
    };
    let queryFiled = params.queryFiled;
    if (queryFiled) {
        queryFiled = JSON.parse(queryFiled);
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
    const page = params.page || 1;
    const size = params.size || 10;
    const res = await allUserSql.queryAllUserInfo(page, size, queryFiled);
    const res_total = await allUserSql.countAllStuff(queryFiled);
    const total = res_total[0]['count(*)'];
    for (let i=0;i<res.length;i++){
        const departmentId = res[i].departmentId;
        let entryTime = res[i].entryTime;
        entryTime = moment(entryTime).format('YYYY年MM月DD日');
        if (departmentId) {
            const res_department = await departmentSql.queryDepartNameById(departmentId);
            const departmentName = res_department[0].departmentName;
            res[i].departmentName = departmentName;
        } else {
            res[i].departmentName = null;
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
});
// 批量删除员工
router.post('/deleteStaffInfo', async(ctx,next) => {
    const ret =  ctx.request.body;
    let workNumbers = ret.ids;
    workNumbers = workNumbers.replace('[', '(');
    workNumbers = workNumbers.replace(']', ')');
    const res = await allUserSql.deleteStuff(workNumbers);
    if (res.protocol41) {
        ctx.body = {
            message: '删除成功',
            error: 0,
        }
    } else {
        ctx.body = {
            message: '删除失败',
            error: 1,
        }
    }
});
// 设置或者清空某个部门下的管理员
router.post('/setManagerDepart', async(ctx,next) => {
    const params = ctx.request.body;
    const workNumber = params.workNumber || null;
    const departmentId = params.departmentId;
    const res_isExitManager = await departmentSql.queryManagerDepart(departmentId);
    let res_isSet = null;
    const res_departmentName = await departmentSql.queryDepartNameById(departmentId);
    const departmentName = res_departmentName[0].departmentName;
    if (!res_isExitManager[0].departmentMangerId || res_isExitManager[0].departmentMangerId == workNumber) {
        if (res_isExitManager[0].departmentMangerId == workNumber) {
             res_isSet = await departmentSql.emptySetManagerDepart(null, departmentId);
             ctx.body = {
                 message: `重置${departmentName}管理员成功`,
                 error: 0,
             }
        } else {
            res_isSet = await departmentSql.emptySetManagerDepart(workNumber, departmentId);
            ctx.body = {
                message: `设置${departmentName}管理员成功`,
                error: 0,
            }
        }
        console.log(res_isSet);
    } else {
        ctx.body = {
            message: `${departmentName}已存在管理员，不可重新设置管理员`,
            error: 1,
        }
    }
});

module.exports = router;