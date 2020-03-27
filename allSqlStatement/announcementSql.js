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
    let _sql = `select title,createTime,from annount_info where personId = ${workNumber}`;
    const startTime = queryFiled.startTime;
    const endTime = queryFiled.endTime;
    const title = queryFiled.title; 
    let flag = false;
    if(startTime || endTime || title) {
        _sql += 'where';
    }
    // 如果只有开始时间
    if(startTime && !endTime) {
        _sql += `createTime >= '${startTime}'`;
        flag = true;
    }
    // 如果只有结束时间
    if(!startTime && endTime) {
        _sql += `createTime <= '${endTime}'`;
        flag = true;
    }
    if(startTime && endTime) {
        _sql += `datetime >= '${startTime}' and datetime <=  '${endTime}`;
        flag = true;
    }
    if(flag) {
        // 如果title存在, 并且开始结束时间存在一个
        if(title) {
            _sql += `and title = '${title}'`;
        }
    }else {
        if(title) {
            _sql += `title like %'${title}'%`;
        }
    }
     _sql += `limit ${(page -1) * size} , ${size};`;

    return allServices.query(_sql);
  },
};

module.exports = announcementSql;