// 跟用户操作有关的sql语句
const allServices = require('./index');

// 获取登录用户信息
let userSql = {

    // 登录
    login: function (user) {
        let _sql = `select userName,permissions,workNumber,position,professional,departmentId from user_info where workNumber = ${user.workNumber} and password = '${user.password}'`;
        return allServices.query(_sql);
    },
    // 查询所有用户信息
    queryAllUserInfo(page, size, queryFiled) {
        let _sql = `select 
        userName,
        workNumber,
        permissions,
        position,
        professional,
        departmentId,
        email,telNumber,
        sex,address,
        Id_Card,
         entryTime 
         from user_info 
         where permissions != '0'
         `
            ;
        let _sql3 = ` limit ${(page - 1) * size} , ${size};`;
        let _sql4 = ` order by entryTime desc`;
        let _sql2 = '';
        for (let key in queryFiled) {
            if (queryFiled[key]) {
                if (key === 'userName') {
                    _sql2 = ` and ${key} like '%${queryFiled[key]}%' `
                } else {
                    _sql2 = ` and ${key} = '${queryFiled[key]}' `;
                }
                _sql += _sql2;
            }
        }
        _sql += _sql4;
        _sql += _sql3;
        return allServices.query(_sql);
    },
    // 查询用户信息
    queryUserInfo: function (workNumber) {
        let _sql = `select userName, workNumber,position,professional,departmentId,email,telNumber,sex,address,Id_Card, headerImg from user_info where workNumber = ${workNumber};`
        return allServices.query(_sql);
    },
    // 查询员工名称, 头像信息
    queryUserNameAndHeadeImg: function(workNumber) {
        let _sql = `select userName, headerImg from user_info where workNumber = ${workNumber};`;
        return allServices.query(_sql);
    },
    // 根据工号查询部门管理员名称
    queryNameByWorkNumber: function (workNumber) {
        if (!workNumber) {
            return null;
        }
        let _sql = `select userName from user_info where workNumber = ${workNumber};`;
        return allServices.query(_sql);
    },
    //修改用户信息
    changeUserInfo: function (telNumber, email, address, workNumber) {
        let _sql = `update user_info set telNumber='${telNumber}', email='${email}', address='${address}' where workNumber = '${workNumber}';`;
        return allServices.query(_sql);
    },
    // 根据工号获取查询密码、修改密码
    getPassByWorkNum: function (workNumber, newPassword = null) {
        let _sql;
        if (newPassword) {
            _sql = `update user_info set password = '${newPassword}' where workNumber = ${workNumber}`;
        } else {
            _sql = `select password from user_info where workNumber =${workNumber}`;
        }
        return allServices.query(_sql);
    },
    // 查询表中最大的workNumber
    getMaxWorkNumber: function () {
        let _sql = 'select max(workNumber) from user_info';
        return allServices.query(_sql);
    },
    // 将某个员工设置为部门管理员，更改其权限信息
    setpermissions: function (workNumber) {
        let _sql = `update user_info set permissions = 1 where workNumber = ${workNumber};`;
        return allServices.query(_sql);
    },
    // 把某个部门ID为空的人设置为部门管理员，修改权限信息，并且修改其部门
    setDepartmentManaInfo: function (workNumber, departmentId) {
        let _sql = `update user_info set permissions = 1,departmentId = ${departmentId} where workNumber = ${workNumber};`;
        return allServices.query(_sql);
    },
    // 清空某个员工为部门管理员，更改其权限信息
    clearpermission: function (workNumber) {
        let _sql = `update user_info set permissions = 2 where workNumber = ${workNumber};`;
        return allServices.query(_sql);
    },
    // 插入一名新的员工
    insetNewEmployee: function (user) {
        let _sql = `insert into user_info (
            userName,
            password,
            sex,
            email,
            telNumber,
            address,
            permissions,
            workNumber,
            position,
            professional,
            departmentId,
            entryTime,
            Id_Card
        ) VALUES (
            '${user.userName}',
            '${user.password}',
            '${user.sex}',
            '${user.email}',
            ${user.telNumber},
            '${user.address}',
            ${user.permissions},
            ${user.workNumber},
            '${user.positionName}',
            '${user.professionalName}',
            ${user.departmentId},
            '${user.createTime}',
            '${user.Id_Card}'
        );`;
        return allServices.query(_sql);
    },
    // 统计某个部门的人数
    countStuffByDepartmentId: function (departmentId) {
        let _sql = `select count(*) from user_info where departmentId = ${departmentId};`;
        return allServices.query(_sql);
    },
    // 统计满足条件的员工人数
    countAllStuff: function (queryFiled) {
        let _sql = `select count(*) from user_info
        where permissions != '0'`;
        let _sql2 = '';
        for (let key in queryFiled) {
            if (queryFiled[key]) {
                if (key === 'userName') {
                    _sql2 = ` and ${key} like '%${queryFiled[key]}%' `
                } else {
                    _sql2 = ` and ${key} = '${queryFiled[key]}' `;
                }
                _sql += _sql2;
            }
        }
        return allServices.query(_sql);
    },
    // 判断工号是否在数据库中
    queryworkNumberISExit: function (workNumber) {
        let _sql = `select count(*) from user_info where workNumber = ${workNumber};`;
        return allServices.query(_sql);
    },
    // 判断工号是否属于当前部门
    queryworkNumberisDepartment: function (workNumber, departmentId) {
        let _sql = `select id from user_info where workNumber = ${workNumber} and departmentId = ${departmentId};`;
        return allServices.query(_sql);
    },
    // 批量删除员工
    deleteStuff: function (workNumbers) {
        let _sql = `delete from user_info where workNumber in ${workNumbers};`;
        return allServices.query(_sql);
    },
    // 批量清空员工部门Id
    clearDeparymentId: function (workNumbers, departmentId) {
        let _sql = `update user_info set departmentId = null where workNumber in ${workNumbers} and departmentId = ${departmentId};`;
        return allServices.query(_sql);
    },
    // 管理员修改员工信息
    changeStuffInfo: function (user) {
        let _sql = `update user_info set
         departmentId=${user.departmentId}, 
         professional='${user.professionalName}', 
         position ='${user.positionName}' 
         where workNumber = ${user.workNumber};
         `;
        return allServices.query(_sql);
    },
    // 根据部门ID查询该部门下所有的员工信息
    queryAllStuffInfoByDeartmentId: function (page, size, departmentId, queryFiled) {
        let _sql = `select 
        userName,
        permissions,
        workNumber,
        position,
        professional,
        departmentId,
        email,
        telNumber,
        sex,
        address,
        entryTime,
        Id_Card 
        from user_info where departmentId = ${departmentId} `;
        let _sql2 = '';
        for (let key in queryFiled) {
            if (queryFiled[key]) {
                if (key === 'userName') {
                    _sql2 = ` and ${key} like '%${queryFiled[key]}%' `
                } else {
                    _sql2 = ` and ${key} = '${queryFiled[key]}' `;
                }
                _sql += _sql2;
            }
        }
        const _sql3 = ` limit ${(page - 1) * size} , ${size};`;
        _sql += _sql3;
        return allServices.query(_sql);
    },
    // 统计所有人数
    queryCountStuffInfo: function (departmentId, queryFiled) {
        let _sql = `select 
        count(*)
        from user_info where departmentId = ${departmentId}`;
        let _sql2 = '';
        for (let key in queryFiled) {
            if (queryFiled[key]) {
                if (key === 'userName') {
                    _sql2 = ` and ${key} like '%${queryFiled[key]}%' `
                } else {
                    _sql2 = ` and ${key} = '${queryFiled[key]}' `;
                }
                _sql += _sql2;
            }
        }
        return allServices.query(_sql);
    },
    // 统计某个职业有多少人
    queryProfessionStuffNum: function (professionalName) {
        let _sql = `select count(*) from  user_info where professional = '${professionalName}';`;
        return allServices.query(_sql);
    },
    // 统计某个职位有多少人
    queryPositionNum: function (positionName) {
        let _sql = `select count(*) from  user_info where position = '${positionName}';`;
        return allServices.query(_sql);
    },
    // 测试头像上传
    uploadHeaderImg: function (imgUrl, workNumber) {
        let _sql = `update user_info set headerImg = '${imgUrl}' where workNumber = ${workNumber};`;
        return allServices.query(_sql);
    },
    // 判断用户头像是否已经存在
    queryUserHeader: function(workNumber) {
        let _sql = `select headerImg from user_info where workNumber = ${workNumber};`;
        return allServices.query(_sql);
    },
    // 查询该员工所参与的项目
    queryMyProject: function(workNumber) {
        let _sql = `select currentProjectID from user_info where workNumber = ${workNumber};`;
        return allServices.query(_sql);
    },
    // 更改员工所参与的项目
    updateProject: function(workNumber, currentProjectID) {
        let _sql = `update user_info set currentProjectID = '${currentProjectID}' where workNumber = ${workNumber};`;
        return allServices.query(_sql);
    },
    // 根据部门ID获取该部门下员工所参与的项目、员工工号、员工姓名、员工头像等信息
    getProjectConnectInfo: function(departmentId, undistribute = false) {
        let _sql = `select email, telNumber, professional, currentProjectID, workNumber, userName, headerImg from user_info where departmentId = ${departmentId} and permissions = 2`;
        if(!undistribute) { //sd
            _sql += " and currentProjectID!=''";
        }
        _sql +=';'; 
        return allServices.query(_sql);
    }
}
module.exports = userSql;