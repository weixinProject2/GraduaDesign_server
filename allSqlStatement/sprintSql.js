// 迭代sql语句

const allServices = require('./index');

let sprintSql  = {
    // 创建迭代
    createSprint:function(parmas) {
        let _sql = `insert into sprint_info (
            sprintName,
            createTime,
            endTime,
            status,
            sprintDesc,
            projectId
        )VALUES(
            '${parmas.sprintName}',
            '${parmas.createTime}',
            '${parmas.endTime}',
            0,
            '${parmas.sprintDesc}',
            ${parmas.projectId}
        )`;
        return allServices.query(_sql)
    },
    // 删除迭代
    deleteSprint: function(sprintId) {
        // 根据迭代ID，将问题迭代ID设为空
        let _sql1 = `update problem_info set sprintId = null where sprintId = ${sprintId};`;
        // 删除迭代
        let _sql2 = `delete from sprint_info where sprintId = ${sprintId};`;
        return allServices.transaction([_sql1, _sql2]);
    },
    // 获取迭代状态
    getSprintStatus: function(sprintId) {
        let _sql = `select status from sprint_info where sprintId = ${sprintId};`;
        return allServices.query(_sql);
    },
    // 根据迭代ID获取迭代名称
    getSprintName: function(sprintId) {
        let _sql = `select sprintName from sprint_info where sprintId = ${sprintId};`;
        return allServices.query(_sql);
    },
    // 获取迭代的详细信息
    getSprintDetailInfo: function(projectId, page, size) {
        let _sql = `select sprintId, sprintName, createTime, endTime, status, sprintDesc from sprint_info
        where projectId = ${projectId} limit ${(page - 1) * size} , ${size};`;
        return allServices.query(_sql)
    },
    // 根据项目ID获取该项目下所有迭代信息
    getAllSprintByProjectID: function(projetcId) {
        let _sql = `select sprintId, sprintName, status from sprint_info where projectID = ${projetcId};`;
        return allServices.query(_sql);
    },
    // 获取某个项目下的迭代的最后完成时间
    getMaxTimeSpintTime: function(projectId) {
        let _sql = `select max(endTime) from sprint_info where projectId = ${projectId};`;
        return allServices.query(_sql);
    },
    // 开启或者关闭迭代
    startOrEndSprint: function(sprintId, status) {
        let _sql = `update sprint_info set status = ${status} where sprintId = ${sprintId};`;
        return allServices.query(_sql);
    }
}
module.exports = sprintSql;
