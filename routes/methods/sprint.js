const moment = require('moment');
const allUserSql = require('../../allSqlStatement/userSql');
const positionSql = require('../../allSqlStatement/positionSql');
const professionalSql = require('../../allSqlStatement/professionaSql');
const departmentSql = require('../../allSqlStatement/departmentSql');
const userSql = require('../../allSqlStatement/userSql');
const projectSql = require('../../allSqlStatement/projectSql');
const sprintSql = require('../../allSqlStatement/sprintSql');
const addtoken = require('../../token/index'); 
const getToken = require('../../token/getToken');

async function createSprint(ctx) {
    let token = ctx.request.header.authorization
    let res_token = getToken(token)
    if (res_token.permission != 1) {
      ctx.status = 403
      return (ctx.body = {
        message: '权限不足',
        error: -1
      })
    }
    const parmas = ctx.request.body;
    if(!parmas.projectId) {
        return ctx.body = {
            message: '项目ID不能为空',
            error: -1
        }
    }
    if(!parmas.sprintName) {
        return ctx.body = {
            message: '冲刺名称不能为空',
            error: -1
        }
    }
    if(!parmas.sprintDesc) {
        return ctx.body = {
            message: '冲刺目标不能为空',
            error: -1
        }
    }
    if(!parmas.createTime) {
        return ctx.body = {
            message: '冲刺计划开启时间不能为空',
            error: -1
        }
    }
    if(!parmas.endTime) {
        return ctx.body = {
            message: '冲刺计划结束时间不能为空',
            error: -1
        }
    }
    try {
        const res_projectId = await projectSql.queryProjectInfoByID(parmas.projectId);
        if(res_projectId.length === 0) {
            return ctx.body = {
                message: '无效的项目ID',
                error: -1
            }
        }
        if(res_projectId[0].isOpen == 0) {
            return ctx.body = {
                message: '项目未开启,无法创建冲刺',
                error: -1
            }
        }
        await sprintSql.createSprint(parmas);
        return ctx.body = {
            message: "冲刺创建成功",
            error: 0
        }
    }catch (e) {
        return ctx.body = {
            message: e.toString(),
            error: -2
        }
    }
}

async function deleteSprint(ctx) {
    let token = ctx.request.header.authorization
    let res_token = getToken(token)
    if (res_token.permission != 1) {
      ctx.status = 403
      return (ctx.body = {
        message: '权限不足',
        error: -1
      })
    }
    const parmas = ctx.query;
    if(!parmas.sprintId) {
        return ctx.body = {
            message: '冲刺ID不能为空',
            error: -1
        }
    }
    try {
        const res_status = await sprintSql.getSprintStatus(parmas.sprintId);
        if(res_status.length === 0) {
            return ctx.body = {
                message: '无效的冲刺ID',
                error: -1
            }
        }
        if(res_status[0].status == 1) {
            return ctx.body = {
                message: '冲刺已经开启，无法删除',
                error: -1
            }
        }
        await sprintSql.deleteSprint(parmas.sprintId);
        return ctx.body = {
            message:'删除冲刺成功',
            error: 0,
        }
    }catch (e) {
        return ctx.body = {
            message: e.toString(),
            error: -2
        }
    }
}

const methods = {
    createSprint,
    deleteSprint,
}

module.exports = methods;




