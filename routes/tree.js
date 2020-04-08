const router = require('koa-router')();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const allUserSql = require('../allSqlStatement/userSql');
const positionSql = require('../allSqlStatement/positionSql');
const professionalSql = require('../allSqlStatement/professionaSql');
const departmentSql = require('../allSqlStatement/departmentSql');
const userSql = require('../allSqlStatement/userSql');
const projectSql = require('../allSqlStatement/projectSql');
const folderTreeSql = require('../allSqlStatement/folderSql');

const methods_project = require('./admin/project');
const methods_department = require('./admin/department');
const methods_stuff = require('./admin/stuff');
const methods_professional = require('./admin/professional');
const methods_position = require('./admin/position');

const methods_announce = require('./public/announcement');

const addtoken = require('../token/index'); 
const getToken = require('../token/getToken');


router.prefix('/folderTree');

let treeObj = {
    title: '公司文件夹',
    folderId: 10047,
}

router.get('/getFolderTree', async(ctx,next) => {
    const res_min = await folderTreeSql.queryMinLevel();
    await deepQueryTree(treeObj, 10047);
    return ctx.body = {
        tree: treeObj,
    }
});

async function deepQueryTree(obj, folderId) {
    const result = await folderTreeSql.queryFolder(folderId); 
    if(result.length) {
        obj.children = [...result];
        for(let i = 0; i < obj.children.length; i++) {
            const item = obj.children[i];
            const folderId = obj.children[i].folderId
            await deepQueryTree(obj.children[i], obj.children[i].folderId);
        }
    }else {
        return ;
    }

}

module.exports = router;
