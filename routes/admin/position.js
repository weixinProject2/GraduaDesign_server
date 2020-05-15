const moment = require('moment');
const allUserSql = require('../../allSqlStatement/userSql');
const positionSql = require('../../allSqlStatement/positionSql');
const professionalSql = require('../../allSqlStatement/professionaSql');
const departmentSql = require('../../allSqlStatement/departmentSql');
const userSql = require('../../allSqlStatement/userSql');
const projectSql = require('../../allSqlStatement/projectSql');
const addtoken = require('../../token/index'); 
const getToken = require('../../token/getToken');


async function addPosition(ctx) {
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
}


async function deletePosition(ctx) {
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
        await positionSql.deletePosition(positionId);
        return ctx.body = {
            message: '删除职位成功',
            error: 0
        }
    }
}

async function getPosition(ctx) {
    const info = ctx.query;
    const positionName = info.positionName; // 获取职位名称
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
}

const methods = {
    addPosition,
    deletePosition,
    getPosition,
}

module.exports = methods;