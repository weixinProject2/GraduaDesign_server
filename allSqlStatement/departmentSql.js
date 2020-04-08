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
    let _sql = 'select departmentId,departmentMangerId ,departmentName from department_info;'
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
  // 设置部门管理员的工号和名字
  setDepartManageIdAndName:function(workNumber, name, departmentId) {
    let _sql = `update department_info set 
    departmentMangerId = ${workNumber},
    departmentMangerName = '${name}'
    where departmentId = ${departmentId};
   `;
   return allServices.query(_sql);
  },
  // 清空部门管理员和管理员名字
  emptyManagerIdAndName:function(departmentId) {
   let _sql = `update department_info set 
    departmentMangerId = null,
    departmentMangerName = null
    where departmentId = ${departmentId};
   `;
   return allServices.query(_sql);
  },
  // 删除某个部门
  deleteDepartment:function(departmentId) {
    let _sql = `delete from department_info where departmentId = ${departmentId};`;
    console.log(_sql);
    return allServices.query(_sql);
  },
  // 查询某个ID是否为部门管理员ID
  queryDeparmentManagerId:function(workNumber) {
    let _sql = `select * from department_info where find_in_set(${workNumber},departmentMangerId);`;
    return allServices.query(_sql);
  },
  // 查询部门表中是否存在某个部门ID
  queryDepartmentByDepartmentId: function(departmentId) {
    let _sql = `select * from department_info where find_in_set(${departmentId},departmentId);`;
    return allServices.query(_sql);
  },
  // 修改部门信息
  changeDepartmentInfo:function(info) {
    let _sql  = '';
    if (!info.departmentMangerName) {
      const departmentId = info.departmentId;
      delete info.departmentId;
      _sql += `update department_info set `;
      for(let key in info) {
        info[key] ? _sql += `${key} = '${info[key]}', ` : null;
     }
     _sql =  _sql.substring(0, _sql.length - 2);  
     _sql += ` where departmentId = ${departmentId};`
    ;
  } else {
    const departmentMangerName = info.departmentMangerName;
    const departmentId = info.departmentId;
    delete info.departmentMangerName;
    delete info.departmentMangerName;
    _sql += `update department_info set `;
    for(let key in info) {
        info[key] ? _sql += `${key} = '${info[key]}', ` : null;
    }
   _sql += ` departmentMangerName = '${departmentMangerName}' where departmentId = ${departmentId};`;
  }
  return allServices.query(_sql);
},
  // 查询数据表中最大部门ID
  queryMaxDepartmentId:function() {
    let _sql = `select max(departmentId) from department_info;`;
    return allServices.query(_sql);
  },
  // 查询部门表中是否包含有某部门ID
  queryDepartmentIdfromInfo:function(departmentId){
    let _sql = `select * from department_info where find_in_set('${departmentId}',departmentId);`;
    return allServices.query(_sql);
  },
  // 查询当前部门名称是否已经存在
  queryDepartmentName:function(name){
    let _sql = `select * from department_info where find_in_set('${name}',departmentName);`;
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
  // 查询所有满足条件的部门的数量
  queryAllDepartmentNum:function(queryFiled) {
    let _sql = 'select count(*) from department_info';
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
    return allServices.query(_sql);
  },
  // 查询部门ID通过工号
  queryDeparmentIdByWorkNumber: function() {
    let _sql = `select departmentId from deparment_info where departmentMangerId = ${workNumber};`;
    return allServices.query(_sql);
  },
  // 添加一个部门
  addDepartment:function(departmentInfo){
    let _sql = '';
    if(!departmentInfo.departmentMangerId) {
      _sql = `insert into department_info (
        departmentId,
        departmentName,
        departmentDesc,
        departmentAddress
      ) values (
        ${departmentInfo.departmentId},
        '${departmentInfo.departmentName}',
        '${departmentInfo.departmentDesc}',
        '${departmentInfo.departmentAddress}'
      );`;
    } else {
       _sql = `insert into department_info (
        departmentId,
        departmentMangerId,
        departmentName,
        departmentDesc,
        departmentAddress,
        departmentMangerName
      ) values (
        ${departmentInfo.departmentId},
        ${departmentInfo.departmentMangerId},
        '${departmentInfo.departmentName}',
        '${departmentInfo.departmentDesc}',
        '${departmentInfo.departmentAddress}',
        '${departmentInfo.departmentManagerName}'
      );`;
    }
    return allServices.query(_sql);
  },
}
module.exports = departmentSql;