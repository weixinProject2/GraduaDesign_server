const moment = require('moment')
const allUserSql = require('../../allSqlStatement/userSql')
const positionSql = require('../../allSqlStatement/positionSql')
const professionalSql = require('../../allSqlStatement/professionaSql')
const departmentSql = require('../../allSqlStatement/departmentSql')
const userSql = require('../../allSqlStatement/userSql')
const projectSql = require('../../allSqlStatement/projectSql')
const addtoken = require('../../token/index')
const getToken = require('../../token/getToken')

async function addProfessional (ctx) {
  let token = ctx.request.header.authorization
  let res_token = getToken(token)
  if (res_token.permission != 0) {
    ctx.status = 403
    return (ctx.body = {
      message: '权限不足',
      error: -1
    })
  }
  const professionalInfo = ctx.request.body
  if (!professionalInfo.professionaName || !professionalInfo.description) {
    ctx.status = 400
    return (ctx.body = {
      message: '请求参数有误',
      error: -2
    })
  }
  try {
    const res_result = await professionalSql.queryPrefossinalByNmae(
      professionalInfo.professionaName
    )
    if (res_result.length) {
      return (ctx.body = {
        message: '不可重复添加已经存在的职业',
        error: -3
      })
    }
  } catch (e) {
    const str = e.toString()
    return (ctx.body = {
      message: str,
      error: -4
    })
  }
  let professionalId = null
  try {
    const res_maxProfessionalId = await professionalSql.queryMaxProfessionalId()
    professionalId = res_maxProfessionalId[0]['max(professionalId)'] + 1
  } catch (e) {
    professionalId = 10001
  }
  professionalInfo.professionalId = professionalId
  try {
    const res_result = await professionalSql.addNewProfessional(
      professionalInfo
    )
    if (res_result.protocol41) {
      return (ctx.body = {
        message: '新增职业成功',
        error: 0
      })
    }
  } catch (e) {
    return (ctx.body = {
      message: '新增职业失败',
      error: -1
    })
  }
}

async function deleteProfessional (ctx) {
  let token = ctx.request.header.authorization
  let res_token = getToken(token)
  if (res_token.permission != 0) {
    ctx.status = 403
    return (ctx.body = {
      message: '权限不足',
      error: -1
    })
  }
  const professionalId = ctx.query.professionalId
  if (!professionalId) {
    ctx.status = 400
    return (ctx.body = {
      message: '参数错误',
      error: -2
    })
  }
  const res_Profession = await professionalSql.queryPrefossinalById(
    professionalId
  )
  if (res_Profession.length === 0) {
    return (ctx.body = {
      message: '没有当前ID所对应的职业',
      error: 0
    })
  } else {
    const res_deleteisTure = await professionalSql.deleteProfessional(
      professionalId
    )
    return (ctx.body = {
      message: '删除职业成功',
      error: 0
    })
  }
}

async function getProfessional (ctx) {
  const info = ctx.query
  const professionalName = info.professionalName
  let list
  if (professionalName) {
    list = await professionalSql.queryPrefossinalByNmae(professionalName)
  } else {
    list = await professionalSql.queryAllPrefossinal()
  }
  ctx.body = {
    data: list,
    code: 0,
    total: list.length
  }
}

const methods = {
  addProfessional,
  deleteProfessional,
  getProfessional
}

module.exports = methods
