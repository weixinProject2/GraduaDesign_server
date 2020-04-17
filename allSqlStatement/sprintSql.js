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
        let _sql = `delete from sprint_info where sprintId = ${sprintId};`;
        return allServices.query(_sql);
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
    }
}
module.exports = sprintSql;
