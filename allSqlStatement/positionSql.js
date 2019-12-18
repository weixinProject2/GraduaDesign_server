// 职位操作相关sql语句

const allServices = require('./index');

let positionSql = {
  // 根据职位ID查询部门名称
  queryPositionNameById: function (positionId) {
    let _sql = `select positionName from position_info where positionId = ${positionId};`
    return allServices.query(_sql);
  },

  // 查询所有职位信息
  queryAllPositionInfo: function () {
    let _sql = 'select positionId,positionName from position_info;'
    return allServices.query(_sql);
  },

  // 根据名称模糊查询职位信息
  queryPositionByName: function (positionName) {
    let _sql = `select positionId,positionName from position_info where positionName like '%${positionName}%';`;
    return allServices.query(_sql);
  },
  // 分页查询过滤查询所有职业信息
  queryAllPositionInfo: function (page, size, queryFiled) {
    let _sql = `select 
         positionId,
         positionName
         from position_info`;
    let _sql3 = ` limit ${(page - 1) * size} , ${size};`;
    let _sql2 = '';
    let count = 0;
    for (let key in queryFiled) {
      if (queryFiled[key]) {
        count++;
        if (key === 'positionName') {
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
  // 查询所有满足条件的部门的数量
  queryAllPositionNum: function (queryFiled) {
    let _sql = 'select count(*) from position_info';
    let _sql2 = '';
    let count = 0;
    for (let key in queryFiled) {
      if (queryFiled[key]) {
        count++;
        if (key === 'positionName') {
          count > 1 ? _sql2 = ` and ${key} like '%${queryFiled[key]}%' ` : _sql2 = ` where ${key} like '%${queryFiled[key]}%'`;
        } else {
          count > 1 ? _sql2 = ` and ${key} = ${queryFiled[key]} ` : _sql2 = ` where ${key} = ${queryFiled[key]} `;
        }
        _sql += _sql2;
      }
    }
    return allServices.query(_sql);
  },
}
module.exports = positionSql;