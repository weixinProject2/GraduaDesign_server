// 部门操作相关sql语句

const allServices = require('./index');

let departmentSql  = {
  // 根据部门ID查询部门名称
  queryDepartNameById:function(departmentId) {
    let _sql = `select departmentName from department_info where departmentId = ${departmentId};`
    return allServices.query(_sql);
  },

  // 查询所有部门信息
  queryAllDepartInfo:function(){
    let _sql = 'select departmentId,departmentName from department_info;'
    return allServices.query(_sql);
  },

  // 根据名称模糊查询部门信息
  queryDepartmentByName:function(departmentName){
    let _sql = `select departmentId,departmentName from department_info where departmentName like '%${departmentName}%';`;
    return allServices.query(_sql);
  },
  // 查询某个部门是否存在管理员
  queryManagerDepart:function(departmentId) {
    let _sql =  `select departmentMangerId from department_info where departmentId = ${departmentId};`;    
    return allServices.query(_sql);
  },
  // 清空或者设置某个部门的管理员
  emptySetManagerDepart:function(workNumber, departmentId){
    let _sql = `update department_info set departmentMangerId = ${workNumber} where departmentId = ${departmentId};`;
    return allServices.query(_sql);
  },
}
module.exports = departmentSql;