// 只有管理员能操作的API

const router = require('koa-router')();
const moment = require('moment');

const allUserSql = require('../allSqlStatement/userSql');
const positionSql = require('../allSqlStatement/positionSql');
const professionalSql = require('../allSqlStatement/professionaSql');
const departmentSql = require('../allSqlStatement/departmentSql');
const until = require('../until/getStuffInfo');

router.prefix('/admin');
// 创建一名员工
router.post('/createEmployee',async(ctx,next) => {
    const userInfo = ctx.request.body;
    const userName = userInfo.userName;
    const sex = userInfo.sex;
    const telNumber = userInfo.telNumber;
    const email = userInfo.email;
    const address = userInfo.address;
    const departmentId = userInfo.departmentId;
    const professionalId = userInfo.professionalId;
    const positionId = userInfo.positionId;
    const Id_Card = userInfo.Id_Card;
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
        userName,
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
        Id_Card,
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
});
// 批量删除员工
router.post('/deleteStaffInfo', async(ctx,next) => {
    const ret =  ctx.request.body;
    let workNumbers = ret.ids;
    let res;
    workNumbers = workNumbers.replace('[', '(');
    workNumbers = workNumbers.replace(']', ')');
    try {
         res = await allUserSql.deleteStuff(workNumbers);
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
    } catch (e) {
        ctx.body = {
            message : '此人为部门管理员，无法删除',
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

// 管理员修改员工信息
router.post('/changeStuffInfo', async(ctx,next) => {
    const info = ctx.request.body;
    const workNumber = info.workNumber;
    const professionalId = info.professionalId;
    const positionId = info.positionId;
    const departmentId = info.departmentId;
    const res_professional = await professionalSql.queryPrefossinalById(professionalId);
    const professionalName = res_professional[0].professionalName;
    const res_position = await positionSql.queryPositionNameById(positionId);
    const positionName = res_position[0].positionName;
    const user = {
        workNumber,
        departmentId,
        professionalName,
        positionName,
    }
    try {
        const ret = await allUserSql.changeStuffInfo(user);
        console.log(ret);
        if (ret.protocol41) {
            ctx.body = {
                message: '信息修改成功',
                error : 0,
            }    
        } else {
            ctx.body = {
                message: '信息修改失败',
                error: -1,
            }
        }
    } catch (e) {
        ctx.body = {
            message: '出现错误信息修改失败',
            error: -1,
        }
    }
   
});

// 随机创建一名员工
router.post('/randomCreateStuff',async (ctx,next) => {
    const userName = until.getName();
    const sex = until.getSex();
    const email = until.getEmail();
    const telNumber = until.getMoble();
    const address = until.getAddress();
    const professionalId = until.getProfessionalId();
    const positionId = until.getPositionID();
    const departmentId = until.getDepartmentId();
    const Id_Card = until.getId_no();

    let createTime = new Date();
    createTime = moment(createTime).format('YYYY-MM-DD HH:mm:ss');
    const position = await positionSql.queryPositionNameById(Number(positionId));
    const positionName = position[0].positionName;
    const professional = await professionalSql.queryPrefossinalById(Number(professionalId));
    const professionalName = professional[0].professionalName;
    const permissions = 2;

    const number = await allUserSql.getMaxWorkNumber();
    const maxWorkNumber = number[0]['max(workNumber)'];
    const workNumber = maxWorkNumber + 1;

    const password = '000000';

    const user = {
        userName,
        sex,
        email,
        telNumber,
        address,
        positionName,
        professionalName,
        permissions,
        workNumber,
        password,
        departmentId: Number(departmentId),
        Id_Card,
        createTime,
    }
    try {
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
    }catch(e) {
        console.log(e);
    }
});
module.exports = router;