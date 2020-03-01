// 和职业相关的sql

const allServices = require('./index');

let professionaSql = {
    // 查询所有职业信息
    queryAllPrefossinal:function(){
        let _sql = 'select professionalName,professionalId from professional_info';
        return allServices.query(_sql);
    },

    // 根据Id查询某个职业
    queryPrefossinalById:function (professionaId) {
        let _sql = `select professionalName,professionalId from professional_info where professionalId = ${professionaId}`;
        return allServices.query(_sql);
    },

    // 根据名字模糊查询职业名
    queryPrefossinalByNmae:function (professionaName) {
         let _sql = `select professionalName,professionalId from professional_info where professionalName like '%${professionaName}%';`;
        return allServices.query(_sql);
    },
    // 分页查询过滤查询所有职业信息
    queryAllPrefossinalInfo:function(page, size, queryFiled) {
        let _sql = `select 
        professionalId,
        professionalName,
        description
         from professional_info`;
         let _sql3 = ` limit ${(page -1) * size} , ${size};`;
         let _sql2 = '';
         let count = 0;
         for (let key in queryFiled) {
          if (queryFiled[key]) {
              count ++;
              if (key === 'professionalName') {
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
     // 查询所有满足条件的职业的数量
  queryAllProfessionaNum:function(queryFiled) {
    let _sql = 'select count(*) from professional_info';
    let _sql2 = '';
    let count = 0;
    for (let key in queryFiled) {
     if (queryFiled[key]) {
         count ++;
         if (key === 'professionalName') {
          count > 1?  _sql2 = ` and ${key} like '%${queryFiled[key]}%' ` : _sql2 = ` where ${key} like '%${queryFiled[key]}%'` ; 
         } else {
           count > 1? _sql2 = ` and ${key} = ${queryFiled[key]} ` : _sql2 = ` where ${key} = ${queryFiled[key]} `;
         }
         _sql += _sql2;
     }
 }
    return allServices.query(_sql);
  },

  // 查询当前最大的职业ID
  queryMaxProfessionalId:function() {
    let _sql = 'select max(professionalId) from professional_info';
    return allServices.query(_sql);
  },
   // 增加一个新的职业
   addNewProfessional: function(professionalInfo) {
     let _sql = `insert into professional_info (
       professionalName, 
       professionalId, 
       description
       ) VALUES (
         '${professionalInfo.professionaName}',
          ${professionalInfo.professionalId},
          '${professionalInfo.description}'
         );`;
         return allServices.query(_sql);
   },
   // 删除一个职业
   deleteProfessional: function(professionalId) {
     let _sql = `delete from professional_info where professionalId = ${professionalId};`;
     return allServices.query(_sql);
   }
}
module.exports = professionaSql;