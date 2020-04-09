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
const fileSql = require('../allSqlStatement/fileSql');

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

// 获取文件树接口
router.get('/getFolderTree', async(ctx,next) => {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if (res_token.permission != 0) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    }
    await deepQueryTree(treeObj, 10047);
    return ctx.body = {
        tree: treeObj,
    }
});

// 创建文件夹接口
router.post('/createFolder', async ctx => {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if (res_token.permission != 0) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    }
    const params = ctx.request.body;
    if(!params.parentId) {
        return ctx.body = {
            message: '父级ID不能为空',
            error: -1
        }
    }
    if(!params.folderName) {
        return ctx.body = {
            message: '不能创建空文件夹',
            error: -1,
        }
    }
    try {
        const isExit = await folderTreeSql.queryisExitFolder(params.parentId, params.folderName);
        if(isExit.length > 0) {
            return ctx.body = {
                message: '不可创建同名文件夹',
                error: -1,
            }
        }
        const res_result = await folderTreeSql.createNewFolder(params.parentId, params.folderName);
        return ctx.body = {
            message: '文件夹创建成功',
            error: 0,
        }
    }catch(e) {
        return ctx.body = {
            message: e.toString(),
            error: -2,
        }
    }
})

// 重命名文件夹
router.post('/changeFolderName', async ctx => {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if (res_token.permission != 0) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    }
    const folderInfo = ctx.request.body;
    const folderId = folderInfo.folderId;
    const folderName = folderInfo.folderName;
    if(!folderId) {
        return ctx.body  = {
            message: '文件夹ID不能为空',
            error: -1,
        }
    }
    if(!folderName) {
        return ctx.body = {
            message: '文件夹命不能为空',
            error: -1
        }
    }
    try {
        const res_parent = await folderTreeSql.queryParentID(folderId);
        const parentId = res_parent[0].parentFolderId;
        const result  = await folderTreeSql.queryisExitFolder(parentId, folderName);
        if(result.length) {
            return ctx.body = {
                message: '文件命不可重复',
                error: -1,
            }
        }
        const res_result = await folderTreeSql.renameFolder(folderId, folderName);
        return ctx.body = {
            message: '重命名成功',
            error: 0,
        }
    }catch (e) {

    }
})

// 删除文件夹
router.delete('/deleteFolder', async ctx => {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    if (res_token.permission != 0) {
        ctx.status = 403;
        return ctx.body = {
            message: '权限不足',
            error: -1
        }
    }
    const params = ctx.query;
    const folderId = params.folderId;
    if(!folderId) {
        return ctx.body  = {
            message: '文件夹ID不能为空',
            error: -1,
        }
    }
    try {
        const isFolderId = await folderTreeSql.queryFolderisExit(folderId);
        if(isFolderId.length === 0) {
            return ctx.body = {
                message: '无效的文件夹ID',
                error: -1
            }
        }
        await deepDeleteTree(folderId);
        return ctx.body = {
            message: '文件夹删除成功',
            error: 0,
        }
    }catch(e) {
        return ctx.body = {
            message: e.toString(),
            error: -2
        }
    }
})
// 递归查询文件树
async function deepQueryTree(obj, folderId) {
    const result = await folderTreeSql.queryFolder(folderId);
    const res_fileResult = await fileSql.queryFileInfo(folderId);
    if(res_fileResult.length) {
        obj.fileList = [...res_fileResult];
    }
    if(result.length) {
        obj.children = [...result];
        for(let i = 0; i < obj.children.length; i++) {
            await deepQueryTree(obj.children[i], obj.children[i].folderId);
        }
    }else {
        return ;
    }
}

// 递归删除文件树和相应的文件
async function deepDeleteTree(folderId) {
    await fileSql.deleteCompanyFileByFolderId(folderId);
    await folderTreeSql.deleteFileByFolderId(folderId);
    const res_Folder = await folderTreeSql.queryFolder(folderId);
    if(res_Folder.length) {
        for(let i = 0; i < res_Folder.length; i++) {
            await deepDeleteTree(res_Folder[i].folderId);
        }
    }else {
        return;
    }
}

module.exports = router;
