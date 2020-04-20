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
        return allServices.query(_sql);
    },
    // 获取经办人工号
    getAgentRoleId: function(problemId) {
        let _sql = `select agentRoleId from problem_info where problemId = ${problemId};`;
        return allServices.query(_sql);
    },
    // 删除问题
    deleteProblem: function(problemId) {
        let _sql = `delete from problem_info where problemId = ${problemId};`;
        return allServices.query(_sql);
    },
    // 更新问题
    updateProblem: function(problemId, filed) {
        let arr = ['problemName', 'problemDesc', 'updateTime'];
        let _sql = `update problem_info set`;
        for(let key in filed) {
            if(!arr.includes(key)) {
               _sql += ` ${key} = ${filed[key]},`;
            }else {
                _sql += ` ${key} = '${filed[key]}',`;
            }
        }
        _sql = _sql.replace(/\,$/, '');
        _sql += ` where problemId = ${problemId};`;
        return allServices.query(_sql);
    },
    // 根据冲刺ID获取被分配到问题的员工工号
    queryReporterRoleId: function(sprintId) {
        let _sql = `select reporterRoleId from problem_info where sprintId = ${sprintId} and reporterRoleId!='';`;
        return allServices.query(_sql);
    },
    // 查询成员某个冲刺下的问题数量
    queryProblemBySprintIDAndReporterRoleId: function(sprintId, reporterRoleId) {
        let _sql = `select status, remainTime from problem_info where sprintId = ${sprintId} and reporterRoleId = ${reporterRoleId};`;
        return allServices.query(_sql);
    },
}
module.exports = problemSql;
