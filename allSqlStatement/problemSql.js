// 问题sql语句

const allServices = require('./index');

let problemSql  = {
    // 创建问题
    createProblem:function(parmas) {
        let _sql = `insert into problem_info (
            problemName,
            problemDesc,
            kinds,
            remainTime,
            sprintId,
            agentRoleId,
            reporterRoleId,
            projectId,
            createTime,
            status,
            updateTime
        )VALUES(
            '${parmas.problemName}',
            '${parmas.problemDesc}',
            '${parmas.kinds}',
            '${parmas.remainTime}',
             ${parmas.sprintId},
             ${parmas.agentRoleId},
             ${parmas.reporterRoleId},
             ${parmas.projectId},
             '${parmas.createTime}',
             1,
             '${parmas.updateTime}'
        )`;
        return allServices.query(_sql)
    },
    // 删除问题
    deleteSprint: function(sprintId) {
        let _sql = `delete from sprint_info where sprintId = ${sprintId};`;
        return allServices.query(_sql);
    },
    // 获取问题状态
    getSprintStatus: function(sprintId) {
        let _sql = `select status from sprint_info where sprintId = ${sprintId};`;
        return allServices.query(_sql);
    },
    getAllProblem: function(projectId, sprintId, page, size, isPaging = true) {
        let _sql = `select 
        problemId, problemName, problemDesc, 
        kinds, remainTime, sprintId, agentRoleId,
         reporterRoleId, createTime, status, 
         updateTime, projectId from problem_info
         where projectId = ${projectId}`;
         if(sprintId) {
             _sql += ` and sprintId = ${sprintId}`;
         }
         if(isPaging) {
           _sql += ` limit ${(page - 1) * size} , ${size};`;
         }
         return allServices.query(_sql);
    },
    // 统计所有数量
    getAllProblemCount: function(projectId) {
        let _sql = `select 
        count(*) from problem_info
         where projectId = ${projectId}`;
         return allServices.query(_sql);
    },
    // 统计某个冲刺下问题的所处状态数量
    getStatusBySprintId: function(sprintId, status){
        let _sql = `select count(*) from problem_info where sprintId = ${sprintId} and status = ${status};`
        console.log(_sql)
        return allServices.query(_sql);
    }

}
module.exports = problemSql;
