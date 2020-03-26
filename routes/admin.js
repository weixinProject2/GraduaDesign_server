// 只有管理员能操作的API

const router = require('koa-router')();
const moment = require('moment');

const allUserSql = require('../allSqlStatement/userSql');
const positionSql = require('../allSqlStatement/positionSql');
const professionalSql = require('../allSqlStatement/professionaSql');
const departmentSql = require('../allSqlStatement/departmentSql');
const projectSql = require('../allSqlStatement/projectSql');
const until = require('../until/getStuffInfo');
const getToken = require('../token/getToken');

router.prefix('/admin');
// 创建一名员工
router.post('/createEmployee', async (ctx, next) => {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if (res_token.permission != '0') {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    }
    const userInfo = ctx.request.body;
    const userName = userInfo.userName;
    const sex = userInfo.sex;
    const telNumber = userInfo.telNumber;
    const email = userInfo.email;
    const address = userInfo.address.join(',');
    const departmentId = userInfo.departmentId || null;
    const professionalId = userInfo.professionalId;
    const positionId = userInfo.positionId;
    const Id_Card = userInfo.Id_Card;
    if (!userName) {
        ctx.status = 400;
        return ctx.body = {
            message: '姓名不可为空',
            error: -1
        }
    }
    if (!sex) {
        ctx.status = 400;
        return ctx.body = {
            message: '性别不可为空',
            error: -1
        }
    }
    if (sex !== '男' && sex !== '女') {
        ctx.status = 400;
        return ctx.body = {
            message: '性别不合法',
            error: -1,
        }
    }
    if (!telNumber) {
        ctx.status = 400;
        return ctx.body = {
            message: '电话号码不可为空',
            error: -1
        }
    }
    if (!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(telNumber))) {
        ctx.status = 400;
        return ctx.body = {
            message: '请上传正确的手机号码',
            error: -1,
        };
    }

    if (!email) {
        ctx.status = 400;
        return ctx.body = {
            message: '邮箱不可为空',
            error: -1
        }
    }
    const reg = /^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/;
    if (!reg.test(email)) {
        ctx.status = 400;
        return ctx.body = {
            message: '邮箱格式不正确',
            error: -1,
        }
    }
    if (!Id_Card) {
        ctx.status = 400;
        return ctx.body = {
            message: '身份证号码不可为空',
            error: -1
        }
    }
    if (departmentId) {
        try {
            const res_isDeparmentId = await departmentSql.queryDepartmentIdfromInfo(departmentId);
            if (!res_isDeparmentId.length) {
                ctx.status = 400;
                return ctx.body = {
                    mess: '不存在该部门ID',
                    error: -1,
                }
            }
        } catch (e) {
            ctx.status = 400;
            return ctx.body = {
                message: '部门Id不合法',
                error: -1,
            }
        }
    }
    let createTime = new Date();
    createTime = moment(createTime).format('YYYY-MM-DD HH:mm:ss');
    let positionName = '';
    try {
        const position = await positionSql.queryPositionNameById(positionId);
        positionName = position[0].positionName;
    } catch (e) {
        ctx.status = 400;
        return ctx.body = {
            message: '请上传正确的职位ID',
            error: -1,
        }
    }
    let professionalName = '';
    try {
        const professional = await professionalSql.queryPrefossinalById(professionalId);
        professionalName = professional[0].professionalName;
    } catch (e) {
        ctx.status = 400;
        return ctx.body = {
            message: '请上传正确的职业ID',
            error: -1,
        }
    }

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
    let res;
    try {
        res = await allUserSql.insetNewEmployee(user);
    } catch (e) {
        ctx.status = 500;
        return ctx.body = {
            message: '员工增加失败',
            error: -2,
        }
    }
    if (res.protocol41) {
        ctx.body = {
            message: '员工新增成功',
            error: 0,
        }
    } else {
        ctx.body = {
            message: '新增员工失败',
            error: -1,
        }
    }
});
// 获取所有员工信息
router.get('/getAllStuffInfo', async (ctx, next) => {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if (res_token.permission != 0) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    }
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
    for (let i = 0; i < res.length; i++) {
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
        res[i].address = res[i].address.split(',');
        res[i].entryTime = entryTime;
    }
    ctx.body = {
        list: res,
        page: Number(page),
        size: Number(size),
        totalPage: Math.ceil(total / Number(size)),
        total,
    }
});
// 批量删除员工
router.post('/deleteStaffInfo', async (ctx, next) => {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if (res_token.permission != 0) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    }
    const ret = ctx.request.body;
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
            message: '此人为部门管理员，无法删除',
            error: 1,
        }
    }

});
// 设置或者清空某个部门下的管理员
router.post('/setManagerDepart', async (ctx, next) => {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if (res_token.permission != 0) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    }
    const params = ctx.request.body;
    const workNumber = params.workNumber || null;
    const departmentId = params.departmentId;
    const res_isExitManager = await departmentSql.queryManagerDepart(departmentId);
    let res_isSet = null;
    const res_departmentName = await departmentSql.queryDepartNameById(departmentId);
    const departmentName = res_departmentName[0].departmentName;
    if (!res_isExitManager[0].departmentMangerId || res_isExitManager[0].departmentMangerId == workNumber) {
        if (res_isExitManager[0].departmentMangerId == workNumber) {
            res_isSet = await departmentSql.emptyManagerIdAndName(departmentId);
            const res_clearPerssions = await allUserSql.clearpermission(workNumber);
            ctx.body = {
                message: `重置${departmentName}管理员成功`,
                error: 0,
            }
        } else {
            const res_name = await allUserSql.queryNameByWorkNumber(workNumber);
            const name = await res_name[0].userName;
            res_isSet = await departmentSql.setDepartManageIdAndName(workNumber, name, departmentId);
            const res_setPerssions = await allUserSql.setDepartmentManaInfo(workNumber, departmentId);
            ctx.body = {
                message: `设置${departmentName}管理员成功`,
                error: 0,
            }
        }
    } else {
        ctx.body = {
            message: `${departmentName}已存在管理员，不可重新设置管理员`,
            error: 1,
        }
    }
});

// 管理员修改员工信息
router.post('/changeStuffInfo', async (ctx, next) => {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if (res_token.permission != 0) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    }
    const info = ctx.request.body;
    const workNumber = info.workNumber;
    const professionalId = info.professionalId;
    const positionId = info.positionId;
    const departmentId = info.departmentId;
    let professionalName = '';
    let positionName = '';
    if (!workNumber || !professionalId || !positionId || !departmentId) {
        ctx.status = 400;
        return ctx.body = {
            mess: '缺少必要的请求字段',
            error: -1,
        }
    }
    try {
        const res_professional = await professionalSql.queryPrefossinalById(professionalId);
        professionalName = res_professional[0].professionalName;
    } catch (e) {
        ctx.body = 400;
        return ctx.body = {
            mess: '请输入正确的职业ID',
            error: -1,
        }
    }
    try {
        const res_position = await positionSql.queryPositionNameById(positionId);
        positionName = res_position[0].positionName;
    } catch (e) {
        ctx.status = 400;
        return ctx.body = {
            mess: '请输入正确的职位ID',
            error: -1,
        }
    }
    try {
        const res_isDeparmentId = await departmentSql.queryDepartmentIdfromInfo(departmentId);
        if (!res_isDeparmentId.length) {
            ctx.status = 400;
            return ctx.body = {
                mess: '不存在该部门ID',
                error: -1,
            }
        }
    } catch (e) {
        return ctx.body = {
            mess: '部门ID错误，修改信息失败',
            error: -2,
        }
    }
    const user = {
        workNumber,
        departmentId,
        professionalName,
        positionName,
    }
    if (workNumber === 100000) {
        return ctx.body = {
            mess: '您没有权限修改',
            error: -1,
        }
    }
    try {
        const ret = await allUserSql.changeStuffInfo(user);
        console.log(ret);
        if (ret.protocol41) {
            ctx.body = {
                message: '信息修改成功',
                error: 0,
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
            error: -2,
        }
    }

});

/* 部门相关接口  */
// 管理员删除部门
router.post('/deleteDepartment', async (ctx, next) => {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if (res_token.permission != 0) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    }
    const info = ctx.request.body;
    const departmentId = info.departmentId;
    try {
        const res_StuffNumber = await allUserSql.countStuffByDepartmentId(departmentId);
        if (res_StuffNumber[0]['count(*)'] > 0) {
            return ctx.body = {
                mess: '还有员工隶属当前部门，无法删除',
                error: -3,
            }
        }
        const res_deleteResult = await departmentSql.deleteDepartment(departmentId);
        ctx.body = {
            mess: '部门删除成功',
            error: 0,
        }
    } catch (e) {
        if (!departmentId) {
            ctx.body = {
                mess: '部门Id不能为空',
                error: -2,
            }
        } else {
            ctx.body = {
                mess: e,
                error: -1,
            }
        }
    }

})
// 管理员修改部门信息
router.post('/changeDepartmentInfo', async (ctx, next) => {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if (res_token.permission != 0) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    }
    const info = ctx.request.body;
    let departmentMangerName = '';
    const departmentName = info.departmentName;
    const departmentDesc = info.departmentDesc;
    const departmentAddress = info.departmentAddress;
    const departmentMangerId = info.departmentMangerId;
    const departmentId = info.departmentId;
    try {
        if (!departmentId) {
            return ctx.body = {
                mess: '部门ID不能为空',
                error: -1,
            }
        } else {
            const res_isDeparmentId = await departmentSql.queryDepartmentByDepartmentId(departmentId);
            if (!res_isDeparmentId.length) {
                return ctx.body = {
                    mess: '没有该部门Id对应的部门，请更正后重新输入',
                    error: -2
                }
            }
        }
        if (departmentMangerId) {
            const res_stuffInfo = await allUserSql.queryUserInfo(departmentMangerId);
            const stuff_departmentId = res_stuffInfo[0].departmentId;
            if (stuff_departmentId && stuff_departmentId != departmentId) {
                return ctx.body = {
                    mess: '该员工不属于当前部门，请先将员工添加到部门中',
                    error: -1,
                }
            }
            if (!res_stuffInfo.length) {
                return ctx.body = {
                    mess: '系统中不存在该工号，请输入正确的工号',
                    error: -2,
                }
            }
        }
    } catch (e) {
        ctx.body = {
            mess: e,
            error: -1,
        }
    }
    try {
        if (departmentName) {
            const res_isDepartmentName = await departmentSql.queryDepartmentName(departmentName);
            if (res_isDepartmentName.length > 0) {
                for (item of res_isDepartmentName) {
                    if (item.departmentId != departmentId) {
                        return ctx.body = {
                            mess: '部门名称已经存在，修改失败',
                            error: -3,
                        }
                    }
                }
            }
        }
    } catch (e) {
        return ctx.body = {
            mess: e,
            error: -2,
        }
    }
    try {
        if (departmentMangerId) {
            const res_isDeparmentManagerId = await departmentSql.queryDeparmentManagerId(departmentMangerId);
            if (res_isDeparmentManagerId.length > 0) {
                for (item of res_isDeparmentManagerId) {
                    if (item.departmentId != departmentId) {
                        return ctx.body = {
                            mess: '当前员工已经是其他部门管理员，修改失败',
                            error: -2,
                        }
                    }
                }
            }
        }
    } catch (e) {
        return ctx.body = {
            mess: e,
            error: -2,
        }
    }
    const changeInfo = {
        departmentName,
        departmentDesc,
        departmentAddress,
        departmentId,
    }
    try {
        const res_departmentManId = await departmentSql.queryManagerDepart(departmentId);
        const isDeparmentManagerId = res_departmentManId[0].departmentMangerId;
        if (departmentMangerId) {
            if (isDeparmentManagerId) {
                if (departmentMangerId === isDeparmentManagerId) {
                    // 相等 不做任何处理
                } else {
                    // 不相等 判断上传的管理员ID是否合法
                    const res_clearPerssions = await allUserSql.clearpermission(isDeparmentManagerId);
                    const res_setPerssions = await allUserSql.setpermissions(departmentMangerId);
                    const res_setManager = await departmentSql.emptySetManagerDepart(departmentMangerId, departmentId)
                    const res_getManagerName = await allUserSql.queryNameByWorkNumber(departmentMangerId);
                    departmentMangerName = res_getManagerName[0].userName;
                    changeInfo.departmentMangerName = departmentMangerName;
                }
            } else {
                const res_setManager = await departmentSql.emptySetManagerDepart(departmentMangerId, departmentId);
                const res_setPerssions = await allUserSql.setDepartmentManaInfo(departmentMangerId, departmentId);
                const res_getManagerName = await allUserSql.queryNameByWorkNumber(departmenntMangerId);
                departmentMangerName = res_getManagerName[0].userName;
                changeInfo.departmentMangerName = departmentMangerName;
            }
        } else {
            const res_clearPerssions = await allUserSql.clearpermission(isDeparmentManagerId);
            const res_setManager = await departmentSql.emptyManagerIdAndName(departmentId);
        }
        const res_changeInfo = await departmentSql.changeDepartmentInfo(changeInfo);
        ctx.body = {
            mess: '修改部门信息成功',
            error: 0,
        }
    } catch (e) {
        console.log(e);
        ctx.body = {
            mess: "系统中没有当前工号，请更正后重新录入",
            error: -1,
        }
    }
});

// 增加一个部门 
router.post('/addDepartment', async (ctx, next) => {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if (res_token.permission != 0) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    }
    const departmentInfo = ctx.request.body;
    try {
        let maxdepartmentId = await departmentSql.queryMaxDepartmentId();
        let departmentManagerName = '';
        const departmentId = maxdepartmentId[0]['max(departmentId)'] + 100;
        departmentInfo.departmentId = departmentId;
        departmentInfo.departmentMangerId = departmentInfo.departmentMangerId || null;
        if (departmentInfo.departmentMangerId) {
            departmentManagerName = await allUserSql.queryNameByWorkNumber(departmentInfo.departmentMangerId);
            departmentInfo.departmentManagerName = departmentManagerName[0].userName;
        }
        departmentInfo.departmentName = departmentInfo.departmentName || null;
        departmentInfo.departmentDesc = departmentInfo.departmentDesc || null;
        departmentInfo.departmentAddress = departmentInfo.departmentAddress || null;
        if (!departmentInfo.departmentName) {
            return ctx.body = {
                mess: '部门名称不能为空',
                error: -1
            }
        }
        if (!departmentInfo.departmentAddress) {
            return ctx.body = {
                mess: '部门地址不能为空',
                error: -1,
            }
        }
        const res_isDepartmentName = await departmentSql.queryDepartmentName(departmentInfo.departmentName);
        if (res_isDepartmentName.length > 0) {
            return ctx.body = {
                mess: '该部门名称已经存在',
                error: -2,
            }
        }
        const res_isDeparmentManagerId = await departmentSql.queryDeparmentManagerId(departmentInfo.departmentMangerId);
        if (res_isDeparmentManagerId.length > 0) {
            return ctx.body = {
                mess: '当前工号已经为部门管理员',
                error: -3,
            }
        }
        const res_setDeparmentManger = await allUserSql.setpermissions(departmentInfo.departmentMangerId);
        const res_addResult = await departmentSql.addDepartment(departmentInfo);
        ctx.body = {
            mess: '创建部门成功',
            error: 0,
        }
    } catch (e) {
        ctx.body = {
            mess: "系统中没有当前工号，请更正后重新录入",
            error: -1,
        }
    }
})

//  增加一个职业
router.post('/addProfessional', async ctx => {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if (res_token.permission != 0) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    }
    const professionalInfo = ctx.request.body;
    if (!professionalInfo.professionaName || !professionalInfo.description) {
        ctx.status = 400;
        return ctx.body = {
            message: '请求参数有误',
            error: -2,
        }
    }
    try {
        const res_result = await professionalSql.queryPrefossinalByNmae(professionalInfo.professionaName);
        if (res_result.length) {
            return ctx.body = {
                message: '不可重复添加已经存在的职业',
                error: -3,
            }
        }
    } catch (e) {
        const str = e.toString();
        return ctx.body = {
            message: str,
            error: -4,
        }
    }
    let professionalId = null;
    try {
        const res_maxProfessionalId = await professionalSql.queryMaxProfessionalId();
        professionalId = res_maxProfessionalId[0]['max(professionalId)'] + 1;
    } catch (e) {
        professionalId = 10001;
    }
    professionalInfo.professionalId = professionalId;
    try {
        const res_result = await professionalSql.addNewProfessional(professionalInfo);
        if (res_result.protocol41) {
            return ctx.body = {
                message: '新增职业成功',
                error: 0,
            }
        }
    } catch (e) {
        return ctx.body = {
            message: '新增职业失败',
            error: -1
        }
    }
})

// 删除一个职业
router.delete('/deleteProfessional', async ctx => {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if (res_token.permission != 0) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    }
    const professionalId = ctx.query.professionalId;
    if (!professionalId) {
        ctx.status = 400;
        return ctx.body = {
            message: '参数错误',
            error: -2,
        }
    }
    const res_Profession = await professionalSql.queryPrefossinalById(professionalId);
    if (res_Profession.length === 0) {
        return ctx.body = {
            message: '没有当前ID所对应的职业',
            error: 0
        }
    } else {
        const res_deleteisTure = await professionalSql.deleteProfessional(professionalId);
        return ctx.body = {
            message: '删除职业成功',
            error: 0
        }
    }
})

// 增加一个职位
router.post('/addPosition', async ctx => {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if (res_token.permission != 0) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    }
    const positionInfo = ctx.request.body;
    if (!positionInfo.positionName || !positionInfo.description) {
        ctx.status = 400;
        return ctx.body = {
            message: '请求参数有误',
            error: -2,
        }
    }
    try {
        const res_result = await positionSql.queryPositionByName(positionInfo.positionName);
        if (res_result.length) {
            return ctx.body = {
                message: '不可重复添加已经存在的职位',
                error: -3,
            }
        }
    } catch (e) {
        const str = e.toString();
        return ctx.body = {
            message: str,
            error: -4,
        }
    }
    let positionId = null;
    try {
        const res_maxPositionId = await positionSql.queryMaxPositionId();
        positionId = res_maxPositionId[0]['max(positionId)'] + 1;
    } catch (e) {
        positionId = 1200001;
    }
    positionInfo.positionId = positionId;
    try {
        const res_result = await positionSql.addNewPosition(positionInfo);
        if (res_result.protocol41) {
            return ctx.body = {
                message: '新增职位成功',
                error: 0,
            }
        }
    } catch (e) {
        return ctx.body = {
            message: '新增职位失败',
            error: -1
        }
    }
})

// 删除一个职位
router.delete('/deletePosition', async ctx => {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if (res_token.permission != 0) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    }
    const positionId = ctx.query.positionId;
    if (!positionId) {
        ctx.status = 400;
        return ctx.body = {
            message: '参数错误',
            error: -2,
        }
    }
    const res_Prosition = await positionSql.queryPositionNameById(positionId);
    if (res_Prosition.length === 0) {
        return ctx.body = {
            message: '没有当前ID所对应的职位',
            error: 0
        }
    } else {
        const res_deleteIsTure = await positionSql.queryPositionNameById(positionId);
        return ctx.body = {
            message: '删除职位成功',
            error: 0
        }
    }
})


// 查看所有项目详细信息
router.get('/queryAllProject', async ctx => {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if (res_token.permission != 0) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    }
    const params = ctx.query;
    const page = params.page || 1;
    const size = params.size || 10;

    const projectName = params.projectName || null;
    const bToDepartmentID = params.bToDepartmentID || null;
    const initValue = {
        projectName,
        bToDepartmentID,
    };
    try {
        const res_result = await projectSql.queryAllProjectInfo(page, size, initValue);
        const res_count = await projectSql.queryAllProjectNum(initValue);
        const total = res_count[0]['count(*)'];
        ctx.body = {
            data: res_result,
            page: Number(page),
            size: Number(size),
            total,
            totalPage: Math.ceil(total / Number(size)),
            error: 0,
        }
    } catch (e) {
        ctx.body = {
            mess: e.toString(),
            error: -1,
        }
    }
});

// 新增一个项目
router.post('/addProject', async ctx => {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if (res_token.permission != 0) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    }
    const projectInfo = ctx.request.body;
    const bToDepartmentID = projectInfo.bToDepartmentID;
    let bToDepartmentAdminID = null; 
    let res_isDeparmentId = [];
    if(bToDepartmentID) {
        try {
             res_isDeparmentId = await departmentSql.queryDepartmentByDepartmentId(bToDepartmentID);
            if(!res_isDeparmentId.length) {
                return ctx.body = {
                    message: '系统中不存在该项目ID，项目创建失败',
                    error: -2
                }
            }
        }catch (e) {
            return ctx.body = {
                message: e.toString(),
                error: -1
            }
        }
    }
    if (!projectInfo.projectName) {
        ctx.status = 400;
        return ctx.body = {
            message: '项目名称不能为空',
            error: -2,
        }
    }
    if(!projectInfo.describe) {
        ctx.status = 400;
        return ctx.body = {
            message: '项目描述不能为空',
            error: -2,
        }
    }
   
    try {
        const res_result = await projectSql.queryProjectByName(projectInfo.projectName);
        if (res_result.length) {
            return ctx.body = {
                message: '不可重复添加已经存在的项目',
                error: -3,
            }
        }
    } catch (e) {
        const str = e.toString();
        return ctx.body = {
            message: str,
            error: -4,
        }
    }
    let projectId = null;
    let currentProjectId = '';
    try {
        const res_maxProjectId = await projectSql.queryMaxProjectId();
        projectId = res_maxProjectId[0]['max(projectId)'] + 1;
    } catch (e) {
        projectId = 750001;
    }
    if(bToDepartmentID) {
        try {
            const res_departmentAdmin = await departmentSql.queryManagerDepart(bToDepartmentID);
            if(res_departmentAdmin.length === 0) {
                return ctx.body = {
                    message: '该部门不存在管理员不可分配项目',
                    error: -1,
                }
            }
             bToDepartmentAdminID = res_departmentAdmin[0].departmentMangerId;
            const res_currentProjectId = await allUserSql.queryMyProject(bToDepartmentAdminID);
            currentProjectId = res_currentProjectId[0].currentProjectID || '';
        }catch (e) {
            return ctx.body = {
                message: e.toString(),
                error: -1,
            }
        }
        projectInfo.bToDepartmentID = bToDepartmentID;
    }
    currentProjectId ? currentProjectId += `,${projectId}` : currentProjectId += `${projectId}`;
    projectInfo.projectId = projectId;
    projectInfo.schedule = 0;
    let createTime = moment(new Date()).format('YYYY-MM-DD');;
    projectInfo.createTime = createTime;

    try {
        const res_result = await projectSql.addNewProject(projectInfo);
        if(bToDepartmentAdminID) {
           const res_resultAddProject = await allUserSql.updateProject(bToDepartmentAdminID, currentProjectId);
        }
        if (res_result.protocol41) {
            return ctx.body = {
                message: '新增项目成功',
                error: 0,
            }
        }
    } catch (e) {
        console.log(e);
        return ctx.body = {
            message: '新增项目失败',
            error: -1
        }
    }
});
// 删除项目
router.delete('/deleteProject', async ctx => {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if (res_token.permission != 0) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    }
    const parmas = ctx.query;
    const projectId = parmas.projectId;
    if(!projectId) {
        return ctx.body = {
            message: '项目ID不能为空',
            error: -1
        }
    }
    const res_isProjectId = await projectSql.queryProjectInfoByID(projectId);
    if(res_isProjectId.length === 0) {
        return ctx.body = {
            message: '没有当前项目对应的项目ID',
            error: -2
        }
    }
    const projectInfo = res_isProjectId[0];
    if(Number(projectInfo.schedultion) !== 100) {
        return ctx.body = {
            message: '项目尚未完成，无法删除该项目',
            error: 0,
        }
    }
    if(projectInfo.bToDepartmentID) {
        return ctx.body = {
            message: '项目还有所属部门，无法删除',
            error: 0,
        }
    }
    try {

    const res_deleteStatus = await projectSql.deleteProject(projectId);
    if(res_deleteStatus.protocol41) {
        return ctx.body = {
            message : '项目删除成功',
            error: 0,
        }
    }
    }catch (e) {
        return ctx.body = { 
          message: e.toString,
          error: -3
        }
    }
});

// 分配项目到部门
router.post('/distribeProject', async ctx => {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if (res_token.permission != 0) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    }
    const postInfo = ctx.request.body;
    const projectId = postInfo.projectId;
    const bToDepartmentID = postInfo.bToDepartmentID;
    if(!projectId && !bToDepartmentID) {
        return ctx.body = {
            message: '项目ID或部门ID不能为空',
            error: -1,
        }
    }
    try {
        const res_haveAdminId = await projectSql.queryProjectInfoByID(projectId);
        if(res_haveAdminId.length === 0) {
            return ctx.body = {
                message: '不存在此部门ID',
                error: -1,
            }
        }
        const adminId = res_haveAdminId[0].bToDepartmentID;
        if(adminId) {
            return ctx.body = {
                message: '当前项目已被分配到部门，不可重新分配',
                error: -1,
            }
        }
    }catch (e) {
        return ctx.body = {
            message: e.toString(),
            error: -3,
        }
    }

    let departmentInfo;

    try {
        const res_DepartmentInfo = await departmentSql.queryDepartmentByDepartmentId(bToDepartmentID);
        if(res_DepartmentInfo.length === 0) {
            return ctx.body = {
                message: '系统中没有当前部门ID',
                error: -1,
            }
        }
        departmentInfo = res_DepartmentInfo[0];
        if(!departmentInfo.departmentMangerId) {
            return ctx.body = {
                message: '当前部门没有管理员不可分配项目',
                error: -1,
            }
        }
    }catch (e) {
        return ctx.body = {
            message: e.toString(),
            error: -3,
        }
    }

    try {
        const info = {
            projectId,
            bToDepartmentID,
            bToDepartmentAdmin: departmentInfo.departmentMangerName,
            bToDepartmentAdminID: departmentInfo.departmentMangerId,
            bToDepartment: departmentInfo.departmentName,
        }
        const res_setInfo = await projectSql.describeProject(info);
        let currentProjectId = '';
        const res_currentProjectId = await allUserSql.queryMyProject(info.bToDepartmentAdminID);
        currentProjectId = res_currentProjectId[0].currentProjectID || '';
        currentProjectId ? currentProjectId += `,${projectId}` : currentProjectId += `${projectId}`;
        const res_changeCurrprojectId = await allUserSql.updateProject(info.bToDepartmentAdminID, currentProjectId);
        
        return ctx.body = {
            message: '分配项目成功',
            error: 0,
        }

    }catch (e) {
        return ctx.body = {
            message: e.toString(),
            error: -3
        }
    }


});

// 随机创建一名员工
router.post('/randomCreateStuff', async (ctx, next) => {
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
                message: '新增员工失败',
                error: -1,
            }
        }
    } catch (e) {
        console.log(e);
    }
});
module.exports = router;