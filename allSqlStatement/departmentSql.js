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
  // 查询数据表中最大部门ID
  queryMaxDepartmentId:function() {
    let _sql = `select max(departmentId) from department_info;`;
    return allServices.query(_sql);
  },
  // 查询所有部门的详细信息
  queryAllDepartmentInfo:function(page, size, queryFiled) {
    let _sql = `select 
    departmentId,
    departmentMangerId,
    departmentMangerName,
     departmentName,
     departmentDesc,
     departmentAddress 
     from department_info`;
     let _sql3 = ` limit ${(page -1) * size} , ${size};`;
     let _sql2 = '';
     let count = 0;
     for (let key in queryFiled) {
      if (queryFiled[key]) {
          count ++;
          if (key === 'departmentMangerName' || key === 'departmentName') {
           count > 1?  _sql2 = ` and ${key} like '%${queryFiled[key]}%' ` : _sql2 = ` where ${key} like '%${queryFiled[key]}%'` ; 
          } else {
            count > 1? _sql2 = ` and ${key} = ${queryFiled[key]} ` : _sql2 = ` where ${key} = ${queryFiled[key]} `;
          }
          _sql += _sql2;
      }
  }
  _sql += _sql3;
    return allServices.query(_sql);
  },
  // 查询所有部门的数量
  queryAllDepartmentNum:function() {
    let _sql = 'select count(*) from department_info';
    return allServices.query(_sql);
  },
  // 添加一个部门
  addDepartment:function(departmentInfo){
    let _sql = `insert into department_info (
      departmentId,
      departmentMangerId,
      departmentName,
      departmentDesc,
      departmentAddress
    ) values (
      ${departmentInfo.departmentId},
      ${departmentInfo.departmentMangerId},
      '${departmentInfo.departmentName}',
      '${departmentInfo.departmentDesc}',
      '${departmentInfo.departmentAddress}'
    );`;
    return allServices.query(_sql);
  }
}
module.exports = departmentSql;