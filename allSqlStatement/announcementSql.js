const allServices = require('./index');

let announcementSql = {
    addAnouncement: function(obj) {
        let _sql = `insert into annount_info (
        createTime, 
        content,
        personId, 
        title
        ) values (
        '${obj.createTime}',
         '${obj.content}',
         '${obj.personId}',
         '${obj.title}'
        );`;
    return allServices.query(_sql);
    },

    // 查询公告列表
  queryAnouncementInfo:function(page, size, queryFiled) {
    const workNumber = queryFiled.workNumber;
    let _sql = `select anmountId, title, createTime from annount_info where personId = ${workNumber}`;
    delete queryFiled.workNumber;
    for(let key in queryFiled) {
        if(key === 'startTime') {
            _sql += ` and createTime >= '${queryFiled[key]}'`;
        }else if(key === 'endTime') {
            _sql += ` and createTime <= '${queryFiled[key]}'`;
        }else if(key === 'title') {
            _sql += ` and title like '%${queryFiled[key]}%'`;
        }else {
            continue;
        }
    }
     _sql += ` limit ${(page -1) * size} , ${size};`;
    return allServices.query(_sql);
  },

      // 统计符合条件的公告数量
  queryAnouncementTotal:function(queryFiled) {
        const workNumber = queryFiled.workNumber;
        console.log(queryFiled);
        let _sql = `select anmountId from annount_info where personId = ${workNumber}`;
        delete queryFiled.workNumber;
        for(let key in queryFiled) {
            if(key === 'startTime') {
                _sql += ` and createTime >= '${queryFiled[key]}'`;
            }else if(key === 'endTime') {
                _sql += ` and createTime <= '${queryFiled[key]}'`;
            }else if(key === 'title') {
                _sql += ` and title like '%${queryFiled[key]}%'`;
            }else {
                continue;
            }
        }
         _sql += ';';
        return allServices.query(_sql);
      },
  
  // 根据公告ID查询公告详情
  queryAnouncementDetail: function(anmountId) {
    let _sql = `select content from annount_info where anmountId = ${anmountId};`;
    return allServices.query(_sql);
  }

};

module.exports = announcementSql;