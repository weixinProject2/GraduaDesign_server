// 项目类sql语句

const allServices = require('./index');

let projectSql = {
    // 根据名称模糊查询项目信息
    queryProjectByName: function (projectName) {
        let _sql = `select projectId,projectName from project_info where projectName like '%${projectName}%';`;
        return allServices.query(_sql);
    },
    // 查询当前最大的项目于ID
    queryMaxProjectId: function () {
        let _sql = 'select max(projectId) from project_info';
        return allServices.query(_sql);
    },
    // 分页查询过滤查询所有项目信息
    queryAllProjectInfo: function (page, size, queryFiled) {
        let _sql = `select *
         from project_info`;
        let _sql3 = ` limit ${(page - 1) * size} , ${size};`;
        let _sql2 = '';
        let count = 0;
        for (let key in queryFiled) {
            if (queryFiled[key]) {
                count++;
                if (key === 'projectName') {
                    count > 1 ? _sql2 = ` and ${key} like '%${queryFiled[key]}%' ` : _sql2 = ` where ${key} like '%${queryFiled[key]}%'`;
                } else {
                    count > 1 ? _sql2 = ` and ${key} = ${queryFiled[key]} ` : _sql2 = ` where ${key} = ${queryFiled[key]} `;
                }
                _sql += _sql2;
            }
        }
        _sql += _sql3;
        return allServices.query(_sql);
    },
    // 查询所有满足条件的项目的数量
    queryAllProjectNum: function (queryFiled) {
        let _sql = 'select count(*) from project_info';
        let _sql2 = '';
        let count = 0;
        for (let key in queryFiled) {
            if (queryFiled[key]) {
                count++;
                if (key === 'projectName') {
                    count > 1 ? _sql2 = ` and ${key} like '%${queryFiled[key]}%' ` : _sql2 = ` where ${key} like '%${queryFiled[key]}%'`;
                } else {
                    count > 1 ? _sql2 = ` and ${key} = ${queryFiled[key]} ` : _sql2 = ` where ${key} = ${queryFiled[key]} `;
                }
                _sql += _sql2;
            }
        }
        return allServices.query(_sql);
    },
    // 增加一个新的项目
    addNewProject: function (projectInfo) {
        let _sql = `insert into project_info (
            projectName, 
            projectId, 
            schedultion,
            describtion,
            createTime
              ) VALUES (
                '${projectInfo.projectName}',
                 ${projectInfo.projectId},
                 '${projectInfo.schedule}',
                 '${projectInfo.describe}',
                 '${projectInfo.createTime}'
                );`;
        return allServices.query(_sql);
    },
}
module.exports = projectSql;