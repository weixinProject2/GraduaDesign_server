const moment = require('moment');
const allUserSql = require('../../allSqlStatement/userSql');
const positionSql = require('../../allSqlStatement/positionSql');
const professionalSql = require('../../allSqlStatement/professionaSql');
const departmentSql = require('../../allSqlStatement/departmentSql');
const userSql = require('../../allSqlStatement/userSql');
const projectSql = require('../../allSqlStatement/projectSql');
const addtoken = require('../../token/index'); 
const getToken = require('../../token/getToken');

// 查看所有项目详细信息
async function queryAllProject (ctx) {
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
        for(let item of res_result) {
            const departmentName = await departmentSql.queryDepartNameById(item.bToDepartmentID);
            item.departmentName = departmentName[0] ? departmentName[0].departmentName : null;
        }
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
};


// 新增一个项目
async function addProject(ctx){
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
};

// 删除项目
async function deleteProject(ctx) {
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
};


// 分配项目到部门
async function distribeProject (ctx) {
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
};

const methods = {
    queryAllProject,
    addProject,
    deleteProject,
    distribeProject
}


module.exports = methods;
