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
        let _sql = `select anmountId, title, createTime from annount_info `;
        delete queryFiled.workNumber;
        let count = 0;
        for(let key in queryFiled) {
            if(key === 'startTime') {
                if(count === 0) {
                    _sql += ' where '
                }else {
                    _sql += ' and '
                }
                _sql += `  createTime >= '${queryFiled[key]}'`;
                count++
            }else if(key === 'endTime') {
                if(count === 0) {
                    _sql += ' where '
                }else {
                    _sql += ' and '
                }
                _sql += `  createTime <= '${queryFiled[key]}'`;
                count++
            }else if(key === 'title') {
                if(count === 0) {
                    _sql += ' where '
                }else {
                    _sql += ' and '
                }
                _sql += `  title like '%${queryFiled[key]}%'`;
                count++
            }else {
                continue;
            }
        }
        _sql += ` limit ${(page -1) * size} , ${size};`;
        console.log(_sql)
        return allServices.query(_sql);
    },

    // 统计符合条件的公告数量
    queryAnouncementTotal:function(queryFiled) {
        const workNumber = queryFiled.workNumber;
        let _sql = `select anmountId from annount_info `;
        delete queryFiled.workNumber;
        let count = 0;
        for(let key in queryFiled) {
            if(key === 'startTime') {
                if(count === 0) {
                    _sql += ' where '
                }else {
                    _sql += ' and '
                }
                _sql += `  createTime >= '${queryFiled[key]}'`;
                count++
            }else if(key === 'endTime') {
                if(count === 0) {
                    _sql += ' where '
                }else {
                    _sql += ' and '
                }
                _sql += `  createTime <= '${queryFiled[key]}'`;
                count++
            }else if(key === 'title') {
                if(count === 0) {
                    _sql += ' where '
                }else {
                    _sql += ' and '
                }
                _sql += `  title like '%${queryFiled[key]}%'`;
                count++
            }else {
                continue;
            }
        }
        _sql += ';';
        return allServices.query(_sql);
    },
  
    // 根据公告ID查询公告详情
    queryAnouncementDetail: function(anmountId) {
        let _sql = `select content, title, createTime from annount_info where anmountId = ${anmountId};`;
        return allServices.query(_sql);
    },

    // 删除或者批量删除公告
    deleteAnouncement: function(ids) {
        let _sql = ` delete from annount_info where anmountId in ${ids};`;
        return allServices.query(_sql);
    }

};

module.exports = announcementSql;