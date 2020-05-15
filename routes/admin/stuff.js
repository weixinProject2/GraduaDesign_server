const moment = require('moment');
const allUserSql = require('../../allSqlStatement/userSql');
const positionSql = require('../../allSqlStatement/positionSql');
const professionalSql = require('../../allSqlStatement/professionaSql');
const departmentSql = require('../../allSqlStatement/departmentSql');
const userSql = require('../../allSqlStatement/userSql');
const projectSql = require('../../allSqlStatement/projectSql');
const addtoken = require('../../token/index'); 
const getToken = require('../../token/getToken');2

async function createEmployee (ctx) {
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
}

async function getAllStuffInfo(ctx) {
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
}

async function deleteStaffInfo(ctx) {
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
}

async function changeStuffInfo(ctx) {
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
}

async function randomCreateStuff(ctx) {
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
        
    }
}

const methods = {
    createEmployee,
    getAllStuffInfo,
    deleteStaffInfo,
    changeStuffInfo,
    randomCreateStuff,
}
module.exports = methods;