// 只有管理员能操作的API

const router = require('koa-router')();
const moment = require('moment');

const allUserSql = require('../allSqlStatement/userSql');
const positionSql = require('../allSqlStatement/positionSql');
const professionalSql = require('../allSqlStatement/professionaSql');
const departmentSql = require('../allSqlStatement/departmentSql');

router.prefix('/admin');

router.post('/createEmployee',async(ctx,next) => {
    const userInfo = ctx.request.body;
    const name = userInfo.name;
    const sex = userInfo.sex;
    const telNumber = userInfo.telNumber;
    const email = userInfo.email;
    const address = userInfo.address;
    const departmentId = userInfo.departmentId;
    const professionalId = userInfo.professionalId;
    const positionId = userInfo.positionId;
    let createTime = new Date();
    createTime = moment(createTime).format('YYYY-MM-DD HH:mm:ss');
    const position = await positionSql.queryPositionNameById(positionId);
    const positionName = position[0].positionName;
    const professional = await professionalSql.queryPrefossinalById(professionalId);
    const professionalName = professional[0].professionalName;
    const permissions = 2;

    const number = await allUserSql.getMaxWorkNumber();
    const maxWorkNumber = number[0]['max(workNumber)'];
    const workNumber = maxWorkNumber + 1;

    const password = '000000';

    const user = {
        name,
        sex,
        telNumber,
        email,
        address,
        departmentId,
        positionName,
        professionalName,
        permissions,
        workNumber,
        password,
        createTime,
    }
    const res = await allUserSql.insetNewEmployee(user);
    if (res.protocol41) {
        ctx.body = {
            message: '员工新增成功',
            error: 0,
        }
    } else {
        ctx.body = {
            message : '新增员工失败',
            error: -1,
        }
    }
});

router.get('/getAllStaffInfo', async(ctx,body) => {
    const res = await allUserSql.queryAllUserInfo();
   for (let i=0;i<res.length;i++){
    const departmentId = res[i].departmentId;
    if (departmentId) {
        const res_department = await departmentSql.queryDepartNameById(departmentId);
        const departmentName = res_department[0].departmentName;
        res[i].departmentName = departmentName;
    } else {
        res[i].departmentName = null;
    }
   }
});



module.exports = router;