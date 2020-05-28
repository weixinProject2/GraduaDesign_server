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


async function openProject(ctx) {
    let token = ctx.request.header.authorization
    let res_token = getToken(token)
    if (res_token.permission != 1) {
      ctx.status = 403
      return (ctx.body = {
        message: '权限不足',
        error: -1
      })
    }
    const projectId = ctx.request.body.projectId;
    if(!projectId) {
        return ctx.body = {
            message: '项目ID不能为空',
            error: -1
        }
    }
    try {
        const res_result = await  projectSql.queryProjectNameById(projectId);
        if(!res_result.length) {
            return ctx.body = {
                message: '无效的项目ID',
                error: -1
            }
        }
        await projectSql.openProject(projectId);
        return ctx.body = {
            message: '项目开启成功',
            error: 0
        }
    }catch (e) {
        return ctx.body = {
            message: e.toString(),
            error: -2
        }
    }
}

async function distribeProject(ctx) {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if (res_token.permission != 1) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    }
    const postInfo = ctx.request.body;
    const projectId = postInfo.projectId;
    const workNumber = postInfo.workNumber;
    if(!projectId && !workNumber) {
        return ctx.body = {
            message: '项目ID或员工工号不能为空',
            error: -1,
        }
    }
    try {
        const res_result = await  projectSql.queryProjectInfoByID(projectId);
        if(!res_result.length) {
            return ctx.body = {
                message: '无效的项目ID',
                error: -1
            }
        }
        if(res_result[0].isOpen == 0) {
            return ctx.body = {
                message: "项目尚未开启，无法分配员工",
                error: -1
            }
        }
        let currentProjectId = '';
        const res_currentProjectId = await allUserSql.queryMyProject(workNumber);
        currentProjectId = res_currentProjectId[0].currentProjectID || '';
        if(currentProjectId) {
            const  result =  currentProjectId.split(',');
            for(let key of result) {
                if(key == projectId) {
                    return ctx.body = {
                        message: '当前员工已经被分配到该项目,不可重新分配',
                        error: -1
                    }
                }
            }
        }
        currentProjectId ? currentProjectId += `,${projectId}` : currentProjectId += `${projectId}`;
        await allUserSql.updateProject(workNumber, currentProjectId);
        return ctx.body = {
            message: '项目分配成功',
            error: 0
        }
    }catch(e) {
        return ctx.body = {
            message: e.toString(),
            error: -1
        }
    }
}

async function queryListInfo(ctx) {
    let token = ctx.request.header.authorization
    let res_token = getToken(token)

    const workNumber = res_token.workNumber;
    const params = ctx.query;
    const page = params.page || 1;
    const size = params.size || 10;
    const projectId = params.projectId;

    if(!projectId) {
        return ctx.body = {
            message: '项目ID不能为空',
            error: -1,
        }
    }
    try {
        let professionlName = ''
        if(params.professionalId) {
            const res_professionl = await professionalSql.queryPrefossinalById(params.professionalId);
            professionlName = res_professionl[0].professionalName;
        }
        const queryFiled = {
            userName: params.userName,
            workNumber: params.workNumber,
            professional: professionlName,
        }
        
        

        const res_result = await  projectSql.queryProjectNameById(projectId);
        if(!res_result.length) {
            return ctx.body = {
                message: '无效的项目ID',
                error: -1
            }
        }
       const res_department = await userSql.queryDeparmentIdByWorkNumber(workNumber);
       const departmentId = res_department[0].departmentId;
       const user_list = await allUserSql.getProjectConnectInfo(departmentId, false, queryFiled);
       const responseList = user_list.filter((item) => {
           let flag = false;
           const arr = item.currentProjectID.split(',');
           arr.map(key => {
               if(key == projectId) {
                   flag = true;
               }
           })
           if(flag) {
               delete item.currentProjectID;
               if(item.headerImg) {
                  item.headerImg = `http://106.54.206.102:8080/header/${item.headerImg}`;
              }
               return item;
           }
       })
       return ctx.body = {
            list: page && size ? responseList.slice((page - 1) * size, page * size) : responseList,
            page: Number(page),
            size: Number(size),
            totalPage: Math.ceil(responseList.length / size),
            total: responseList.length,
            error: 0,
       }
    }catch(e) {
        return ctx.body = {
            message: e.toString(),
            error: -1
        }
    }
}

async function queryUndistributedList(ctx) {
    let token = ctx.request.header.authorization
    let res_token = getToken(token)
    if (res_token.permission != 1) {
      ctx.status = 403
      return (ctx.body = {
        message: '权限不足',
        error: -1
      })
    }
    const workNumber = res_token.workNumber;
    const params = ctx.query;
    const page = params.page || 1;
    const size = params.size || 10;
    const projectId = params.projectId;
    if(!projectId) {
        return ctx.body = {
            message: '项目ID不能为空',
            error: -1,
        }
    }
    try {
        const res_result = await  projectSql.queryProjectNameById(projectId);
        if(!res_result.length) {
            return ctx.body = {
                message: '无效的项目ID',
                error: -1
            }
        }
       const res_department = await departmentSql.queryDeparmentIdByWorkNumber(workNumber);
       const departmentId = res_department[0].departmentId;
       const user_list = await allUserSql.getProjectConnectInfo(departmentId, true);
       const responseList = user_list.filter((item) => {
           let flag = false;
           if(!item.currentProjectID) {
               return item;
           }
           const arr = item.currentProjectID.split(',');
           arr.map(key => {
               if(key == projectId) {
                   flag = true;
               }
           })
           if(!flag) {
               delete item.currentProjectID;
               if(item.headerImg) {
                   item.headerImg = `http://106.54.206.102:8080/header/${item.headerImg}`;
               }
                return item;
           }
       })
       return ctx.body = {
            list: responseList.slice((page - 1) * size, page * size),
            page: Number(page),
            size: Number(size),
            totalPage: Math.ceil(responseList.length / size),
            total: responseList.length,
            error: 0,
       }
    }catch(e) {
        return ctx.body = {
            message: e.toString(),
            error: -1
        }
    }
}

async function deleteProjectStuff(ctx) {
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
    const projectId = parmas.projectId;
    const workNumberlist = parmas.workNumberlist;
    const workNumberArr = workNumberlist.split(',');
    if(!projectId && !workNumberlist.length) {
        return ctx.body = {
            message: '项目ID或员工工号不能为空',
            error: -1,
        }
    }
    try {
        const res_result = await  projectSql.queryProjectNameById(projectId);
        if(!res_result.length) {
            return ctx.body = {
                message: '无效的项目ID',
                error: -1
            }
        }
        for(let i = 0; i < workNumberArr.length; i++) {
            const workNumber = workNumberArr[i];
            let currentProjectId = '';
            const res_currentProjectId = await allUserSql.queryMyProject(workNumber);
            currentProjectId = res_currentProjectId[0].currentProjectID || '';
            const result =  currentProjectId.split(',');
            let flag = false;
            for(let key in result) {
                if(result[key] == projectId) {
                    result.splice(key, 1);
                    flag = true;
                }
            }
            if(!flag) {
                return ctx.body = {
                    message: '该员工没有参与该项目',
                    error: -1
                }
            }
            currentProjectId = result.join(',')
            await allUserSql.updateProject(workNumber, currentProjectId);
        }
        return ctx.body = {
            message: '移除项目成员成功',
            error: 0
        }
    }catch(e) {
        return ctx.body = {
            message: e.toString(),
            error: -1
        }
    }
}
async function setProjectSchedultion(ctx) {
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
    const projectId = parmas.projectId;
    const schedultion = parmas.schedultion;
    if(!projectId && !schedultion) {
        return ctx.body = {
            message: '项目ID或进度不能为空',
            error: -1,
        }
    }
    if(Number(schedultion) > 100) {
        return ctx.body = {
            message: '项目进度只能为0到100',
            error: -1
        }
    }
    try {
        const res_result = await  projectSql.queryProjectNameById(projectId);
        if(!res_result.length) {
            return ctx.body = {
                message: '无效的项目ID',
                error: -1
            }
        }
        const res_schedultion = await projectSql.queryProjectInfoByID(projectId);
        const isOpen = res_schedultion[0].isOpen;
        if(Number(isOpen) === 0) {
            return ctx.body = {
                message: '项目没有开启，无法设置项目进度',
                error: -1
            }
        }
        if(Number(res_schedultion[0].schedultion) > Number(schedultion)) {
            return ctx.body = {
                message: '项目进度只能增长，不能减少',
                error: -1
            }
        }
        await projectSql.setProjectSchedultion(projectId, Number(schedultion));
        return ctx.body = {
            message: "项目进度设置成功",
            error: 0
        }
    }catch(e) {
        return ctx.body = {
            message: e.toString(),
            error: -1
        }
    }
}
async function getProjectDetailInfo(ctx) {
    let token = ctx.request.header.authorization
    let res_token = getToken(token)
    if (res_token.permission != 1) {
      ctx.status = 403
      return (ctx.body = {
        message: '权限不足',
        error: -1
      })
    }
    const projectId = ctx.query.projectId;
    if(!projectId) {
        return ctx.body = {
            message: '项目ID不能为空',
            error: -1,
        }
    }
    try {
        const res_result = await  projectSql.queryProjectNameById(projectId);
        if(!res_result.length) {
            return ctx.body = {
                message: '无效的项目ID',
                error: -1
            }
        }
       const result = await projectSql.queryProjectInfoByID(projectId);
       const sprintList = await sprintSql.getAllSprintByProjectID(projectId);
       let sprintOngoingName = null;
       sprintList.map(item => {
           if(item.status == 1) {
            sprintOngoingName = item.sprintName
           }
       })

       const Info = result[0];
       Info.sprintOngoingName = sprintOngoingName;
       Info.sprintCount = sprintList.length;
       Info.createTime = moment(Info.createTime).format('YYYY-MM-DD')
       Info.isOpen = Number(Info.isOpen);
       return ctx.body = {
           data: Info,
           error: 0,
       }
    }catch(e) {
        return ctx.body = {
            message: e.toString(), 
            error: -1
        }
    }
}

async function closeProject(ctx) {
    let token = ctx.request.header.authorization
    let res_token = getToken(token)
    if (res_token.permission != 1) {
      ctx.status = 403
      return (ctx.body = {
        message: '权限不足',
        error: -1
      })
    }
    const projectId = ctx.request.body.projectId;
    if(!projectId) {
        return ctx.body = {
            message: '项目ID不能为空',
            error: -1,
        }
    }
    try {
       const res_result = await sprintSql.getAllSprintByProjectID(projectId);
       for(let item of res_result) {
           if(item.status != 2) {
               return ctx.body = {
                   message: '项目下还有迭代在进行中，无法关闭该项目',
                   error: -1
               }
           }
       }
       const res_schedultion = await projectSql.queryProjectInfoByID(projectId);
       if(!res_schedultion.length) {
           return ctx.body = {
               message: '无效的项目ID',
               error: -1
           }
       }
       if(res_schedultion[0].schedultion !== 100) {
            return ctx.body = {
                message: '项目尚未完成，无法关闭',
                error: -1
            }
       }
       await projectSql.closeProject(projectId);
       return ctx.body = {
           message: '项目关闭成功',
           error: 0
       }
    }catch(e) {
        return ctx.body = {
            message: e.toString(), 
            error: -1
        }
    }
}

const methods = {
    openProject,
    distribeProject,
    queryListInfo,
    deleteProjectStuff,
    setProjectSchedultion,
    getProjectDetailInfo,
    queryUndistributedList,
    closeProject,
}

module.exports = methods;




