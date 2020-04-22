const moment = require('moment');
const menuSql = require('../../allSqlStatement/menuSql');


const getToken = require('../../token/getToken');

async function getSiderMenu(ctx) {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    const permission = res_token.permission;
    try{
        const list = await menuSql.getSiderMenu(permission);
        return ctx.body = {
            menuList: list,
            error: 0
        }
    }catch(e) {
        return ctx.body = {
            message: e.toString(),
            error: -2
        }
    }
}

const methods = {
    getSiderMenu,
};

module.exports = methods;