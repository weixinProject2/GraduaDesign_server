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
    }
    
}
module.exports = professionaSql;