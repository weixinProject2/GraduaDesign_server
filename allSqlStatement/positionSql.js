// 职位操作相关sql语句

const allServices = require('./index');

let positionSql  = {
  // 根据职位ID查询部门名称
  queryPositionNameById:function(positionId) {
    let _sql = `select positionName from position_info where positionId = ${positionId};`
    return allServices.query(_sql);
  },

  // 查询所有职位信息
  queryAllPositionInfo:function(){
    let _sql = 'select positionId,positionName from position_info;'
    return allServices.query(_sql);
  },

  // 根据名称模糊查询职位信息
  queryPositionByName:function(positionName){
    let _sql = `select positionId,positionName from position_info where positionName like '%${positionName}%';`;
    return allServices.query(_sql);
  }
}
module.exports = positionSql;