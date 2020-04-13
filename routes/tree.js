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

function getRootTree(index) {
    const choise = ["公司文件夹", "部门文件夹", "个人文件夹"];
    const folderIdArr = [10047, 100021, 10036221]
    let obj = {
        folderName: choise[index],
        folderId: folderIdArr[index],
    }
    return obj
}


// 获取文件树接口
router.get('/getFolderTree', async(ctx,next) => {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    const permission = Number(res_token.permission);
    let departmentId = null;
    let workNumber = null;
    workNumber = res_token.workNumber;
    if(permission === 1) {
        const res_DepartmentId   = await departmentSql.queryDeparmentIdByWorkNumber(workNumber);
        departmentId = res_DepartmentId[0].departmentId;
    }
    let treeObj = getRootTree(permission);
    await deepQueryTree(treeObj, treeObj.folderId, permission, departmentId);
    if(permission === 0) {
        return ctx.body = {
            tree: [treeObj],
            error: 0
        }
    }else if(permission === 1){
        const companyTree = {
            folderName: '公司公开文件夹',
            folderId:100000,
        }
        const personTree = getRootTree(2)
        await deepQueryTree(personTree, personTree.folderId, 2, null, workNumber);
        return ctx.body = {
            tree: [companyTree, treeObj, personTree],
            error: 0
        }
    }else {
        const companyTree = {
            folderName: '公司公开文件夹',
            folderId:100000,
        }
        const departmentTree = {
            folderName: '部门相关文件夹',
            folderId: 200000,
        }
        const personTree = getRootTree(2);
        await deepQueryTree(personTree, personTree.folderId, 2, null ,workNumber);
        return ctx.body = {
            tree: [companyTree, departmentTree, personTree],
            error: 0
        }
    }
});

// 创建文件夹接口
router.post('/createFolder', async ctx => {
    let token = ctx.request.header.authorization;
    let res_token = getToken(token);
    const permission = Number(res_token.permission);
    let departmentId = null;
    let workNumber = null;
    workNumber = res_token.workNumber;
    if(permission === 1) {
        const res_DepartmentId   = await departmentSql.queryDeparmentIdByWorkNumber(workNumber);
        departmentId = res_DepartmentId[0].departmentId;
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
        // 查询公司文件夹下是否存在同名文件
        let isExit = []
        if(permission === 0) {
           isExit = await folderTreeSql.queryisExitFolder(params.parentId, params.folderName, "company");
        }
        if(departmentId) {
             // 查询部门文件夹下是否存在同名文件
             isExit = await folderTreeSql.queryisExitFolder(params.parentId, params.folderName, "department", departmentId);
        }
        if(permission !== 0 && workNumber) {
             isExit = await folderTreeSql.queryisExitFolder(params.parentId, params.folderName, "person", null, workNumber);
        }
        if(isExit.length) {
            return ctx.body = {
                message: '不可创建同名文件夹',
                error: -1,
            }
        }
        if(permission === 0) {
            await folderTreeSql.createNewFolder(params.parentId, params.folderName, "company");
        }
        if(departmentId) {
            await folderTreeSql.createNewFolder(params.parentId, params.folderName, "department", departmentId);
        }
        if(permission !== 0 && workNumber) {
            await folderTreeSql.createNewFolder(params.parentId, params.folderName, "person", null, workNumber);
        }
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
    const permission = Number(res_token.permission);
    let departmentId = null;
    let workNumber = null;
    workNumber = res_token.workNumber;
    if(permission === 1) {
        const res_DepartmentId   = await departmentSql.queryDeparmentIdByWorkNumber(workNumber);
        departmentId = res_DepartmentId[0].departmentId;
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
        let tableName = '';
        let result = [];
        if(permission === 0) {
            tableName = "companyFolder_info";
            const res_parent = await folderTreeSql.queryParentID(folderId, "companyFolder_info");
            const parentId = res_parent[0].parentFolderId;
            result  = await folderTreeSql.queryisExitFolder(parentId, folderName, "company");
        }
        if(departmentId) {
            tableName = "departmentFolder_info";
            const res_parent = await folderTreeSql.queryParentID(folderId, "departmentFolder_info");
            if(res_parent.length) {
                const parentId = res_parent[0].parentFolderId;
                result  = await folderTreeSql.queryisExitFolder(parentId, folderName, "department", departmentId);
            }
        }
        if(permission !== 0 && workNumber && `${folderId}`.length > 7) {
            tableName = "personFolder_info";
            const res_parent = await folderTreeSql.queryParentID(folderId, "personFolder_info");
            if(res_parent.length) {
                const parentId = res_parent[0].parentFolderId;
                result  = await folderTreeSql.queryisExitFolder(parentId, folderName, "person", null, workNumber);
            }
        }
        if(result.length) {
            return ctx.body = {
                message: '文件命不可重复',
                error: -1,
            }
        }
        await folderTreeSql.renameFolder(folderId, folderName, tableName);
        return ctx.body = {
            message: '重命名成功',
            error: 0,
        }
    }catch (e) {
        return ctx.body = {
            message: e.toString(),
            error: -2
        }
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
async function deepQueryTree(obj, folderId, permission, departmentId = null, workNumber) {
    const result = await folderTreeSql.queryFolder(folderId, permission, departmentId, workNumber);
    if(result.length) {
        obj.children = [...result];
        for(let i = 0; i < obj.children.length; i++) {
            await deepQueryTree(obj.children[i], obj.children[i].folderId, permission, departmentId, workNumber);
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
