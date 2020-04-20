const moment = require('moment');
const allUserSql = require('../../allSqlStatement/userSql');
const positionSql = require('../../allSqlStatement/positionSql');
const professionalSql = require('../../allSqlStatement/professionaSql');
const departmentSql = require('../../allSqlStatement/departmentSql');
const userSql = require('../../allSqlStatement/userSql');
const projectSql = require('../../allSqlStatement/projectSql');
const problemSql = require('../../allSqlStatement/problemSql');
const sprintSql = require('../../allSqlStatement/sprintSql');
const addtoken = require('../../token/index'); 
const getToken = require('../../token/getToken');


async function createProblem(ctx) {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    const workNumber =res_token.workNumber; // 经办人工号
    const parmas = ctx.request.body;
    if(!parmas.projectId) {
        return ctx.body = {
            message: '项目ID不能为空',
            error: -1
        }
    }
    if(!parmas.problemName) {
        return ctx.body = {
            message: '问题名不能为空',
            error: -1
        }
    }
    if(!parmas.problemDesc) {
        return ctx.body = {
            message: '问题描述不能为空',
            error: -1
        }
    }
    if(!parmas.kinds) {
        return ctx.body = {
            message: '问题类型不能为空',
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
                message: '项目未开启,无法创建问题',
                error: -1
            }
        }
        parmas.createTime = moment(new Date()).format('YYYY-MM-DD hh-mm-ss');
        parmas.updateTime = parmas.createTime
        parmas.agentRoleId = workNumber;
        parmas.reporterRoleId = parmas.reporterRoleId || null;
        parmas.remainTime = parmas.remainTime || null;
        parmas.sprintId = parmas.sprintId || null;

        await problemSql.createProblem(parmas);
        return ctx.body = {
            message: '问题创建成功',
            error: 0
        }
    }catch(e) {
        return ctx.body = {
            message: e.toString(),
            error: -2
        }
    }
}

async function getAllProblem(ctx) {
    const parmas = ctx.query;
    const page = parmas.page || 1;
    const size = parmas.size || 10;
    const sprintId = parmas.sprintId || null;
    if(!parmas.projectId) {
        return ctx.body = {
            message: '项目ID不能为空',
            error: -1
        }
    }
    try {
        const result = await problemSql.getAllProblem(parmas.projectId, sprintId, page, size); 
        const res_total = await problemSql.getAllProblemCount(parmas.projectId);
        const total = res_total[0]['count(*)'];
        
        for(let i = 0; i < result.length; i++) {
            const item = result[i];
            item.createTime = moment(item.createTime).format('YYYY-MM-DD hh:mm:ss');
            item.updateTime = moment(item.updateTime).format('YYYY-MM-DD hh:mm:ss');
            item.status = Number(item.status);
            if(item.remainTime === 0) {
                item.remainTime = null;
            }
            if(item.sprintId) {
                console.log(item.sprintId);
                const res_sprint = await sprintSql.getSprintName(item.sprintId);
                item.sprintName = res_sprint[0].sprintName || null;
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
        return ctx.body = {
            list: result,
            page: Number(page),
            size: Number(size),
            total,
            totalPage: Math.ceil(total / Number(size)),
            error: 0,
        }
    }catch(e) {
        return ctx.body = {
            message: e.toString(),
            error: -2
        }
    }
}

async function changeProblem(ctx) {
    const parmas = ctx.request.body;
    if(!parmas.problemId) {
        return ctx.body = {
            message: '问题ID不能为空',
            error: -1
        }
    }
    let arr = ['problemName', 'problemDesc'];
    for(let key in parmas) {
        if(!arr.includes(key)) {
            parmas[key] = Number(parmas[key]);
        }
    }   
    const problemId = parmas.problemId;
    delete parmas.problemId;
    parmas.updateTime = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
    try {
        await problemSql.updateProblem(problemId, parmas);
        return ctx.body = {
            message: '修改问题成功',
            error: 0,
        }

    }catch(e) {
        return ctx.body = {
            message: e.toString(),
            error: -2
        }
    }
}

async function deleteProblem(ctx) {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    const workNumber =res_token.workNumber; // 经办人工号
    const problemId = ctx.query.problemId;
    if(!problemId) {
        return ctx.body = {
            message: "问题ID不能为空",
            error: -1
        }
    }
    try {
        const result = await problemSql.getAgentRoleId(problemId);
        if(result.length === 0) {
            return ctx.body = {
                message: '无效的问题ID',
                error: -1
            }
        }
        if(result[0].agentRoleId != workNumber) {
            return ctx.body = {
                message: '只有任务报告人才能删除此问题',
                error: -1
            }
        }
        await problemSql.deleteProblem(problemId);
        return ctx.body = {
            message: '问题删除成功',
            error: 0
        }
    }catch(e) {
        return ctx.body = {
            message: e.toString(),
            error: -2
        }
    }
}

async function getMyProblem(ctx) {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    const workNumber =res_token.workNumber; // 经办人工号
    const parmas = ctx.query;
    const projectId = parmas.projectId;
    const sprintId = parmas.sprintId;
    if(!projectId) {
        return ctx.body = {
            message: '项目ID不能为空',
            error: -1
        }
    }
    try{
        const list_result = await problemSql.queryMyProblem(projectId, sprintId, workNumber);
        list_result.map(item => {
            item.createTime = moment(item.createTime).format('YYYY-MM-DD hh:mm:ss');
            item.status = Number(item.status)
            item.updateTime = moment(item.updateTime).format('YYYY-MM-DD hh:mm:ss');
        })
        return ctx.body = {
            list: list_result,
            error: 0
        }
    }catch(e) {
        return ctx.body = {
            message: e.toString(),
            error: -2
        }
    }
}
const methods = {
    createProblem,
    getAllProblem,
    changeProblem,
    deleteProblem,
    getMyProblem
}

module.exports = methods;




