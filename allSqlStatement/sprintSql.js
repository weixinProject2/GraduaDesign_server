// 冲刺sql语句

const allServices = require('./index');

let sprintSql  = {
    // 创建冲刺
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
    // 删除冲刺
    deleteSprint: function(sprintId) {
        // 根据冲刺ID，将问题冲刺ID设为空
        let _sql1 = `update problem_info set sprintId = null where sprintId = ${sprintId};`;
        // 删除冲刺
        let _sql2 = `delete from sprint_info where sprintId = ${sprintId};`;
        return allServices.transaction([_sql1, _sql2]);
    },
    // 获取冲刺状态
    getSprintStatus: function(sprintId) {
        let _sql = `select status from sprint_info where sprintId = ${sprintId};`;
        return allServices.query(_sql);
    },
    // 根据冲刺ID获取冲刺名称
    getSprintName: function(sprintId) {
        let _sql = `select sprintName from sprint_info where sprintId = ${sprintId};`;
        return allServices.query(_sql);
    },
    // 获取冲刺的详细信息
    getSprintDetailInfo: function(projectId, page, size) {
        let _sql = `select sprintId, sprintName, createTime, endTime, status, sprintDesc from sprint_info
        where projectId = ${projectId} limit ${(page - 1) * size} , ${size};`;
        return allServices.query(_sql)
    },
    // 根据项目ID获取该项目下所有冲刺信息
    getAllSprintByProjectID: function(projetcId) {
        let _sql = `select sprintId, sprintName, status from sprint_info where projectID = ${projetcId};`;
        return allServices.query(_sql);
    },
    // 获取某个项目下的冲刺的最后完成时间
    getMaxTimeSpintTime: function(projectId) {
        let _sql = `select max(endTime) from sprint_info where projectId = ${projectId};`;
        return allServices.query(_sql);
    },
    // 开启或者关闭冲刺
    startOrEndSprint: function(sprintId, status) {
        let _sql = `update sprint_info set status = ${status} where sprintId = ${sprintId};`;
        return allServices.query(_sql);
    }
}
module.exports = sprintSql;
