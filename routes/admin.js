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
    if(workNumber === 100000) {
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
            error: -2,
        }
    }
   
});
// 管理员删除部门
router.post('/deleteDepartment',async(ctx,next) => {
    const info = ctx.request.body;
    const departmentId = info.departmentId;
    try {
        const res_StuffNumber =await allUserSql.countStuffByDepartmentId(departmentId);
        if(res_StuffNumber[0]['count(*)'] > 0) {
            return ctx.body ={
                mess: '还有员工隶属当前部门，无法删除',
                error: -3,
            }
        }
        const res_deleteResult = await departmentSql.deleteDepartment(departmentId);
        ctx.body = {
            mess: '部门删除成功',
            error: 0,
        }
    }catch(e) {
        if(!departmentId) {
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
router.post('/changeDepartmentInfo', async(ctx,next) => {
        const info =ctx.request.body;
        let departmentMangerName = '';
        const departmentName = info.departmentName;
        const departmentDesc = info.departmentDesc;
        const departmentAddress = info.departmentAddress;
        const departmentMangerId = info.departmentMangerId;
        const departmentId = info.departmentId;
        try {
            if(!departmentId) {
                return ctx.body = {
                    mess: '部门ID不能为空',
                    error: -1,
                }
            } else {
                const res_isDeparmentId = await departmentSql.queryDepartmentByDepartmentId(departmentId);
                if(!res_isDeparmentId.length) {
                    return ctx.body = {
                        mess: '没有该部门Id对应的部门，请更正后重新输入',
                        error: -2
                    }
                }
            }
            if(departmentMangerId) {
                const res_stuffInfo = await allUserSql.queryUserInfo(departmentMangerId);
                if(!res_stuffInfo.length) {
                    return ctx.body = {
                        mess: '系统中不存在该工号，请输入正确的工号',
                        error: -2,
                    }
                }
            } else {
                return ctx.body = {
                    mess: '管理员ID不能为空',
                    error: -1,
                }
            }
        }catch(e) {
            ctx.body = {
                mess: e,
                error: -1,
            }
        }
        const res_isDepartmentName = await departmentSql.queryDepartmentName(departmentName);
        if (res_isDepartmentName.length > 0) {
            for (item of res_isDepartmentName) {
                if(item.departmentId != departmentId){
                    return ctx.body = {
                        mess: '部门名称已经存在，修改失败',
                        error: -3,
                    }
                }
            }
        }
        const res_isDeparmentManagerId = await departmentSql.queryDeparmentManagerId(departmentMangerId);
        console.log(res_isDeparmentManagerId);
        if (res_isDeparmentManagerId.length > 0) {
            for (item of res_isDeparmentManagerId) {
                if(item.departmentId != departmentId){
                    return ctx.body = {
                        mess: '当前员工已经是其他部门管理员，修改失败',
                        error: -2,
                    }
                }
            }
        }
        const changeInfo =  {
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
                        const res_setManager = await departmentSql.emptySetManagerDepart(departmentMangerId,departmentId)
                        const res_getManagerName = await allUserSql.queryNameByWorkNumber(departmentMangerId);
                        departmentMangerName = res_getManagerName[0].userName;
                        changeInfo.departmentMangerName = departmentMangerName;
                    }
                } else {
                    const res_setManager = await departmentSql.emptySetManagerDepart(departmentMangerId,departmentId);
                    const res_getManagerName = await allUserSql.queryNameByWorkNumber(departmentMangerId);
                    departmentMangerName = res_getManagerName[0].userName;
                    changeInfo.departmentMangerName = departmentMangerName;
                }
            } else {
                const res_clearPerssions = await allUserSql.clearpermission(isDeparmentManagerId);
                const res_setManager = await departmentSql.emptySetManagerDepart(null,departmentId);
                changeInfo.departmentMangerName = null;
            }
            const res_changeInfo = await departmentSql.changeDepartmentInfo(changeInfo);
            ctx.body = {
                mess: '修改部门信息成功',
                error: 0,
            }
        }catch(e) {
            ctx.body = {
                mess: "系统中没有当前工号，请更正后重新录入",
                error: -1,
            }
        }
});
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
// 增加一个部门 
router.post('/addDepartment',async (ctx,next) => {
    const departmentInfo = ctx.request.body;
    try {
        let maxdepartmentId =await departmentSql.queryMaxDepartmentId();    
        let departmentManagerName = '';
        const departmentId = maxdepartmentId[0]['max(departmentId)'] + 100;
        departmentInfo.departmentId = departmentId;
        departmentInfo.departmentMangerId = departmentInfo.departmentMangerId || null;
        if(departmentInfo.departmentMangerId) {
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
        if(res_isDepartmentName.length > 0) {
            return ctx.body = {
                mess: '该部门名称已经存在',
                error : -2,
            }
        }
        const res_isDeparmentManagerId = await departmentSql.queryDeparmentManagerId(departmentInfo.departmentMangerId);
        if(res_isDeparmentManagerId.length > 0) {
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
    } catch(e) {
        ctx.body = {
            mess: "系统中没有当前工号，请更正后重新录入",
            error : -1,
        }
    } 
})

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