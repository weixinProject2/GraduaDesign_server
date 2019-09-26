const mysql = require('mysql');
const config = require('./defaultConfig');

const pool = mysql.createPool({
  host: config.database.HOST,
  user: config.database.USERNAME,
  password: config.database.PASSWORD,
  database: config.database.DATABASE
});
let allServices = {
  query:function (sql,values) {
    return new Promise((resolve ,reject) =>{
      pool.getConnection(function (err,connection) {
          if(err){
            reject(err)
          }else
          {
            connection.query(sql,values,(err,rows) => {
                if(err){
                  reject(err)
                }else
              {
                resolve(rows)
              }
              connection.release()
            })
          }
      })
    })
  },
  getParmentList:function(){
    let _sql = `select * from paymentlist;`;
    return  allServices.query(_sql);
  },
  getOrderList:function(){
    let _sql = `select * from orderList;`;
    return allServices.query(_sql);
  },
  saveOrderList:function(tableData){
      let _sql = `insert into orderList set 
      id="${tableData.id}",
      projectNum="${tableData.projectNum}",
      custormName="${tableData.custormName}",
      houseSouce="${tableData.houseSouce}",
      paymentCode="${tableData.paymentCode}",
      paymentDesc="${tableData.paymentDesc}";`;
      return allServices.query(_sql);
  },
  deleteOrderList:function(id){
    let _sql = `DELETE FROM orderList WHERE id=${id};`;
    return allServices.query(_sql);
  }
};

module.exports = allServices;