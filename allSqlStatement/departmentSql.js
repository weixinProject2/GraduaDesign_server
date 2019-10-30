// 部门操作相关sql语句

const allServices = require('./index');

let departmentSql  = {
  // 根据部门ID查询部门名称
  queryDepartNameById:function(departmentId) {
    let _sql = `select departmentName from department_info where departmentId = ${departmentId};`
    return allServices.query(_sql);
  },
}
module.exports = departmentSql;