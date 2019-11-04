// 跟用户操作有关的sql语句
const allServices = require('./index');

// 获取登录用户信息
let  userSql = {

    // 登录
    login:function (user) {
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
         entryTime 
         from user_info 
         where permissions != '0'
         `
         ;
         let _sql3 = `limit ${(page -1) * size} , ${size};`;
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
         _sql += _sql3;
        return allServices.query(_sql);
    },

    // 查询用户信息
    queryUserInfo:function(workNumber) {
        let _sql = `select userName, workNumber,position,professional,departmentId,email,telNumber,sex,address from user_info where workNumber = ${workNumber};`
        return allServices.query(_sql);
    }, 

    //修改用户信息
    changeUserInfo:function (telNumber, email, address, workNumber) {
        console.log(workNumber);
        let _sql = `update user_info set telNumber='${telNumber}', email='${email}', address='${address}' where workNumber = '${workNumber}';`;
         return allServices.query(_sql);
    },
    // 根据工号获取查询密码、修改密码
    getPassByWorkNum:function(workNumber, newPassword = null){
        let _sql;
        if (newPassword) {
        _sql = `update user_info set password = '${newPassword}' where workNumber = ${workNumber}`;
        } else {
        _sql = `select password from user_info where workNumber =${workNumber}`;
        }
        return allServices.query(_sql);
    },
    // 查询表中最大的workNumber
    getMaxWorkNumber:function(){
        let _sql = 'select max(workNumber) from user_info';
        return allServices.query(_sql);
    },
    // 插入一名新的员工
    insetNewEmployee:function(user){
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
            entryTime
        ) VALUES (
            '${user.name}',
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
            '${user.createTime}'
        );`;
         return allServices.query(_sql);
    },
    // 统计满足条件的员工人数
    countAllStuff:function(queryFiled) {
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
    queryworkNumberISExit:function(workNumber){
        let _sql = `select count(*) from user_info where workNumber = ${workNumber};`;
        return allServices.query(_sql);
    },
    // 批量删除员工
    deleteStuff:function (workNumbers){
        let _sql = `delete from user_info where workNumber in ${workNumbers};`;
        console.log(_sql);
        return allServices.query(_sql);
    },

}   
module.exports = userSql;