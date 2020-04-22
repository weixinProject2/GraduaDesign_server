// 项目类sql语句

const allServices = require('./index');

let projectSql = {
    // 根据名称模糊查询项目信息
    queryProjectByName: function (projectName) {
        let _sql = `select projectId,projectName from project_info where projectName like '%${projectName}%';`;
        return allServices.query(_sql);
    },
    // 查询项目名称
    queryProjectName: function(projectName) {
        let _sql = `select projectId,projectName from project_info where projectName = '${projectName}';`;
        return allServices.query(_sql);
    },
    // 根据项目ID查询项目名
    queryProjectNameById: function(projectId) {
        let _sql = `select projectName from project_info where projectId = ${projectId};`;
        return allServices.query(_sql);
    },
    // 根据项目ID查询项目进度，项目所属部门ID, 项目是否已经开启
    queryProjectInfoByID: function(projectId) {
        let _sql = `select projectName, describtion, projectId,createTime, bToDepartmentID, schedultion, isOpen from project_info where projectId = ${projectId};`;
        return allServices.query(_sql);
    },
    // 分配项目所属部门
    describeProject: function(info) {
        let _sql = `update project_info set 
        bToDepartmentID = ${info.bToDepartmentID}
        where projectId = ${info.projectId};
         `;
         return allServices.query(_sql);
    },
    // 删除某一个项目
    deleteProject: function(projectId) {
        let _sql = `delete from project_info where projectId = ${projectId};`;
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
        let _sql = '';
        if(projectInfo.bToDepartmentID) {
            _sql = `insert into project_info (
                projectName, 
                projectId, 
                schedultion,
                bToDepartmentID,
                describtion,
                createTime,
                isOpen
                  ) VALUES (
                    '${projectInfo.projectName}',
                     ${projectInfo.projectId},
                     '${projectInfo.schedule}',
                     ${projectInfo.bToDepartmentID},
                     '${projectInfo.describe}',
                     '${projectInfo.createTime}',
                     0
                    );`;
        }else {
            _sql = `insert into project_info (
                projectName, 
                projectId, 
                schedultion,
                describtion,
                createTime,
                isOpen
                  ) VALUES (
                    '${projectInfo.projectName}',
                     ${projectInfo.projectId},
                     '${projectInfo.schedule}',
                     '${projectInfo.describe}',
                     '${projectInfo.createTime}',
                     0
                    );`;
        }
        return allServices.query(_sql);
    },
    // 开启项目
    openProject: function(projectId) {
        let _sql = `update project_info set isOpen = 1 where projectId = ${projectId};`;
        return allServices.query(_sql);
    },
    // 关闭项目
    closeProject: function(projectId) {
        let _sql = `update project_info set isOpen = 0 where projectId = ${projectId};`;
        let _sql2 = `delete from sprint_info where projectId = ${projectId};`;
        let _sql3 = `delete from problem_info where projectId = ${projectId};`;
        return allServices.transaction([_sql, _sql2, _sql3]);
    },
    // 设置项目进度
    setProjectSchedultion: function(projectId, schedultion) {
        let _sql = `update project_info set schedultion = ${schedultion} where projectId = ${projectId};`;
        return allServices.query(_sql);
    },
    // 修改项目名称和描述
    changeProjectInfo: function(params, projectId) {
        let _sql = `update project_info set `;
        for(let key in params) {
            if(params[key]) {
             _sql += key === 'bToDepartmentID' ? ` ${key} = ${params[key]} and` : ` ${key} = '${params[key]}' and`;
            }
        }
        _sql = _sql.replace(/and$/g, '');
        _sql += ` where projectId = ${projectId};`;
        console.log(_sql)
        return allServices.query(_sql);
    }
}
module.exports = projectSql;
