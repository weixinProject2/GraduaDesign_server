const moment = require('moment');
const allUserSql = require('../../allSqlStatement/userSql');
const positionSql = require('../../allSqlStatement/positionSql');
const professionalSql = require('../../allSqlStatement/professionaSql');
const departmentSql = require('../../allSqlStatement/departmentSql');
const userSql = require('../../allSqlStatement/userSql');
const projectSql = require('../../allSqlStatement/projectSql');
const announcementSql = require('../../allSqlStatement/announcementSql');
const addtoken = require('../../token/index'); 
const getToken = require('../../token/getToken');

// 发布公告
async function releaseAnnouncement(ctx) {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    const workNumber = res_token.workNumber;
    if (res_token.permission != 0 && res_token.permission != 1) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    }
    const announcontent = ctx.request.body; 
    if(!announcontent.content) {
        return ctx.body = {
            message: "公告内容不能为空",
            error: -1,
        }
    }
    if(!announcontent.title) {
        return ctx.body = {
            message: '公告标题不能为空',
            error: -1,
        }
    }
     const creteTime = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
     announcontent.personId = workNumber;
     announcontent.createTime = creteTime;
    try {
        const res_addData = await announcementSql.addAnouncement(announcontent);
        if(res_addData.protocol41) {
            return ctx.body = {
                message: '发布公告成功',
                error: 0
            }
        }
    }catch (e) {
        return ctx.body = {
            message: e.toString(),
            error: -2,
        }
    }
}

// 获取所有公告
async function getAllAnnouncement(ctx) {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    const workNumber = res_token.workNumber;
    let page = ctx.query.page || 1;
    let size = ctx.query.size || 10;
    const queryFiled = ctx.query;
    delete queryFiled.page;
    delete queryFiled.size;
    queryFiled.workNumber = workNumber;
    let queryParams = {...queryFiled};
    try {
      const res_announce = await announcementSql.queryAnouncementInfo(page, size, queryFiled);
      res_announce.map(item => {
          item.createTime = moment(item.createTime).format("YYYY-MM-DD hh:mm:ss");
      })
      const res_total = await announcementSql.queryAnouncementTotal(queryParams);
      return ctx.body = {
          list: res_announce,
          page: Number(page),
          size: Number(size),
          total: res_total.length,
          error: 0,
      }
    }catch (e) {
        return ctx.body = {
            message: e.toString(),
            error: -1,
        }
    }
}

async function getAllAnnounceDetail(ctx) {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);

    const anmountId = ctx.query.anmountId;
    if(!anmountId) {
        return ctx.body = {
            message: '公告Id不能为空',
            error: -1,
        }
    }
    try {
        const res_detail = await announcementSql.queryAnouncementDetail(anmountId);
        const data = res_detail[0];
        data.createTime = moment(data.createTime).format("YYYY-MM-DD hh-mm-ss");
        return ctx.body = {
            data,
            error: 0,
        }
    }catch (e) {
        return ctx.body = {
            message: e.toString(),
            error: -1,
        }
    }
}

async function deleteAnouncement(ctx) {
    if(!ctx.query.ids) {
        return ctx.body = {
            message: '公告ID不能为空',
            error: -2,
        }
    }
    const ids = `(${ctx.query.ids})`;
    try {
    const result = await announcementSql.deleteAnouncement(ids);
        return ctx.body = {
            message: "删除公告成功",
            error: 0,
        }
    }catch (e) {
        return ctx.body = {
            message: e.toString(),
            error: -1
        }
    }
}

const methods = {
    releaseAnnouncement,
    getAllAnnouncement,
    getAllAnnounceDetail,
    deleteAnouncement
};

module.exports = methods;