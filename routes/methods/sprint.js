const moment = require('moment');
const allUserSql = require('../../allSqlStatement/userSql');
const positionSql = require('../../allSqlStatement/positionSql');
const professionalSql = require('../../allSqlStatement/professionaSql');
const departmentSql = require('../../allSqlStatement/departmentSql');
const userSql = require('../../allSqlStatement/userSql');
const projectSql = require('../../allSqlStatement/projectSql');
const sprintSql = require('../../allSqlStatement/sprintSql');
const problemSql = require('../../allSqlStatement/problemSql');
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
    const startTime = new Date(parmas.createTime);
    const endTime = new Date(parmas.endTime);
    if(endTime <= startTime) {
        return ctx.body = {
            message: "请注意时间范围",
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
        const result_MaxTime = await sprintSql.getMaxTimeSpintTime(parmas.projectId);
        if(result_MaxTime.length) {
            let maxTime = result_MaxTime[0]['max(endTime)'];
            if(startTime <= maxTime) {
                return ctx.body = {
                    message: '当前冲刺开始日期不能小于上一个冲刺的结束日期',
                    error: -1
                }
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
async function queryAllSprint(ctx) {
    const parmas = ctx.query;
    if(!parmas.projectId) {
        return ctx.body = {
            message: '项目ID不能为空',
            error: -1
        }
    }
    const page = parmas.page || 1;
    const size = parmas.size || 10;
    try{
        const res_sprint = await sprintSql.getSprintDetailInfo(parmas.projectId, page, size);
        for(let j = 0; j < res_sprint.length; j++) {
            const res_reporterRoleId = await problemSql.queryReporterRoleId(res_sprint[j].sprintId);
            let res_arr = res_reporterRoleId.reduce((tem, item)=> {
                let flag = true;
                tem.map(key => {
                    if(key.reporterRoleId === item.reporterRoleId) {
                        flag = false;
                    }
                })
                flag && tem.push(item);
                return tem;
            }, []);
            for(let i = 0; i < res_arr.length; i++) {
                const item = res_arr[i];
                const res_reporterRole = await allUserSql.queryUserNameAndHeadeImg(item.reporterRoleId);
                const res_count = await problemSql.queryProblemBySprintIDAndReporterRoleId(res_sprint[j].sprintId, item.reporterRoleId);
                item.problemTotal = res_count.length;
                item.problemComplateCount = res_count.reduce((count, item) => {
                    if(item.status == 5) {
                        count++;
                    }
                    return count;
                }, 0);
                item.remainingEstimatedTime = res_count.reduce((hours, item) => {
                    return hours + item.remainTime;
                }, 0);
                item.problemPendingCount = item.problemTotal - item.problemComplateCount;
                item.userName = res_reporterRole[0].userName;
                if(res_reporterRole[0].headerImg) {
                    item.headerImg = `http://106.54.206.102:8080/header/${res_reporterRole[0].headerImg}`;
                }else {
                    item.headerImg = null;
                }
                item.workNumber = item.reporterRoleId;
                delete item.reporterRoleId;
            }
            res_sprint[j].workList = res_arr;
            const result = await problemSql.getAllProblem(parmas.projectId, res_sprint[j].sprintId, 0, 0, false);
            for(let i = 0; i < result.length; i++) {
                const item = result[i];
                item.createTime = moment(item.createTime).format('YYYY-MM-DD hh:mm:ss');
                item.updateTime = moment(item.updateTime).format('YYYY-MM-DD hh:mm:ss');
                item.status = Number(item.status);
                if(item.remainTime === 0) {
                    item.remainTime = null;
                }
                if(item.sprintId) {
                    const res_sprint = await sprintSql.getSprintName(item.sprintId);
                    item.sprintName = res_sprint[0].sprintName;
                }else {
                    item.sprintName = null;
                }
                const res_agentRole = await allUserSql.queryUserNameAndHeadeImg(item.agentRoleId);
                item.agentRoleName = res_agentRole[0].userName;
                headerImg = res_agentRole[0].headerImg;
                if(headerImg) {
                    item.agentRoleHeaderImg =  `http://106.54.206.102:8080/header/${headerImg}`;
                } else {
                    item.agentRoleHeaderImg = null;
                }
                if(item.reporterRoleId) {
                    const res_reporterRole = await allUserSql.queryUserNameAndHeadeImg(item.reporterRoleId);
                    item.reporterRoleName = res_reporterRole[0].userName;
                    headerImg = res_reporterRole[0].headerImg;
                    if(headerImg) {
                        item.reporterRoleHeaderImg =  `http://106.54.206.102:8080/header/${headerImg}`;
                    } else {
                        item.reporterRoleHeaderImg = null;
                    }
                }else {
                    item.reporterRoleName = null;
                    item.reporterRoleHeaderImg = null;
                }
            }
            const map = new Map();
            map.set("dealtWith", 1);
            map.set("development", 2);
            map.set("InTest", 3);
            map.set("needCheck", 4);
            map.set("complate", 5);
            for(let [key, value] of map) {
                const res_total = await problemSql.getStatusBySprintId(res_sprint[j].sprintId, value); 
                let total = 0;
                if(res_total.length) {
                    total = res_total[0]['count(*)'];
                }
                res_sprint[j][key] = total;
            }
            res_sprint[j].createTime = moment(res_sprint[j].createTime).format('YYYY-MM-DD hh:mm:ss');
            res_sprint[j].endTime = moment(res_sprint[j].endTime).format('YYYY-MM-DD hh:mm:ss');
            res_sprint[j].problemList = result;
        }

        return ctx.body = {
            list: res_sprint,
            error: 0,
        }
    }
    catch(e) {
        return ctx.body = {
            message: e.toString(),
            error: -2
        }
    }
}

async function getAllSprintByProjectID(ctx) {
    const projectId = ctx.query.projectId;
    if(!projectId) {
        return ctx.body = {
            message: '项目ID不能为空',
            error: -1
        }
    }
    try{
        const res_result = await sprintSql.getAllSprintByProjectID(projectId);
        return ctx.body = {
            list: res_result,
            error: 0
        }
    }catch(e) {
        return ctx.body = {
            message: e.toString(),
            error: -2
        }
    }
}
async function startOrEndSprint(ctx) {
    
    const params = ctx.request.body;
    const sprintId = params.sprintId;
    const projectId = params.projectId;
    const status = Number(params.status);
    if(!sprintId) {
        return ctx.body = {
            message: '冲刺ID不能为空',
            error: -1
        }
    }
    if(status !== 0 && status !== 2 && status !== 1) {
        return ctx.body = {
            message: '冲刺状态不能为空, 或者冲刺状态有误',
            error: -1
        }
    }
    try{
        if(status === 1) {
            const sprintList = await sprintSql.getAllSprintByProjectID(projectId);
            for(let i = 0; i < sprintList.length; i++) {
                if(sprintList[i].status == 1) {
                    return ctx.body = {
                        message: '已有其他阶段的迭代开启，不能开次此迭代',
                        error: -1
                    }
                }
            }
        }
        await sprintSql.startOrEndSprint(sprintId, status);
        return ctx.body = {
            message: status === 2 ? '冲刺结束成功' : status ? '冲刺开启成功' : '冲刺关闭成功',
            error: 0
        }
    }
    catch(e) {
        return ctx.body = {
            message: e.toString(),
            error: -2
        }
    }
}
const methods = {
    createSprint,
    queryAllSprint,
    deleteSprint,
    getAllSprintByProjectID,
    startOrEndSprint
}

module.exports = methods;




