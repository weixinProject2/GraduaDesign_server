const moment = require('moment')
const allUserSql = require('../../allSqlStatement/userSql')
const positionSql = require('../../allSqlStatement/positionSql')
const professionalSql = require('../../allSqlStatement/professionaSql')
const departmentSql = require('../../allSqlStatement/departmentSql')
const userSql = require('../../allSqlStatement/userSql')
const projectSql = require('../../allSqlStatement/projectSql')
const addtoken = require('../../token/index')
const getToken = require('../../token/getToken')

async function addDepartment (ctx) {
  let token = ctx.request.header.authorization
  let res_token = getToken(token)
  if (res_token.permission != 0) {
    ctx.status = 403
    return (ctx.body = {
      message: '权限不足',
      error: -1
    })
  }
  const departmentInfo = ctx.request.body
  try {
    let maxdepartmentId = await departmentSql.queryMaxDepartmentId()
    let departmentManagerName = ''
    const departmentId = maxdepartmentId[0]['max(departmentId)'] + 100
    departmentInfo.departmentId = departmentId
    departmentInfo.departmentMangerId =
      departmentInfo.departmentMangerId || null
    if (departmentInfo.departmentMangerId) {
      departmentManagerName = await allUserSql.queryNameByWorkNumber(
        departmentInfo.departmentMangerId
      )
      departmentInfo.departmentManagerName = departmentManagerName[0].userName
    }
    departmentInfo.departmentName = departmentInfo.departmentName || null
    departmentInfo.departmentDesc = departmentInfo.departmentDesc || null
    departmentInfo.departmentAddress = departmentInfo.departmentAddress || null
    if (!departmentInfo.departmentName) {
      return (ctx.body = {
        mess: '部门名称不能为空',
        error: -1
      })
    }
    if (!departmentInfo.departmentAddress) {
      return (ctx.body = {
        mess: '部门地址不能为空',
        error: -1
      })
    }
    const res_isDepartmentName = await departmentSql.queryDepartmentName(
      departmentInfo.departmentName
    )
    if (res_isDepartmentName.length > 0) {
      return (ctx.body = {
        mess: '该部门名称已经存在',
        error: -2
      })
    }
    const res_isDeparmentManagerId = await departmentSql.queryDeparmentManagerId(
      departmentInfo.departmentMangerId
    )
    if (res_isDeparmentManagerId.length > 0) {
      return (ctx.body = {
        mess: '当前工号已经为部门管理员',
        error: -3
      })
    }
    const res_havaDepartmentId = await allUserSql.queryDeparmentIdByWorkNumber(
      departmentInfo.departmentMangerId
    )
    if(res_havaDepartmentId.length) {
      return ctx.body = {
        mess: '当前员工已有部门，不能添加为管理员',
        error: -2
      }
    }

    const res_setDeparmentManger = await allUserSql.setDepartmentManaInfo(
      departmentInfo.departmentMangerId, departmentId
    )
    const res_addResult = await departmentSql.addDepartment(departmentInfo)
    ctx.body = {
      mess: '创建部门成功',
      error: 0
    }
  } catch (e) {
    ctx.body = {
      mess: '系统中没有当前工号，请更正后重新录入',
      error: -1
    }
  }
}

async function changeDepartmentInfo (ctx) {
  let token = ctx.request.header.authorization
  let res_token = getToken(token)
  if (res_token.permission != 0) {
    ctx.status = 403
    return (ctx.body = {
      message: '权限不足',
      error: -1
    })
  }
  const info = ctx.request.body
  let departmentMangerName = ''
  const departmentName = info.departmentName
  const departmentDesc = info.departmentDesc
  const departmentAddress = info.departmentAddress
  const departmentMangerId = info.departmentMangerId
  const departmentId = info.departmentId
  try {
    if (!departmentId) {
      return (ctx.body = {
        mess: '部门ID不能为空',
        error: -1
      })
    } else {
      const res_isDeparmentId = await departmentSql.queryDepartmentByDepartmentId(
        departmentId
      )
      if (!res_isDeparmentId.length) {
        return (ctx.body = {
          mess: '没有该部门Id对应的部门，请更正后重新输入',
          error: -2
        })
      }
    }
    if (departmentMangerId) {
      const res_stuffInfo = await allUserSql.queryUserInfo(departmentMangerId)
      if (res_stuffInfo.length === 0) {
        return (ctx.body = {
          mess: '系统中不存在该工号，请输入正确的工号',
          error: -2
        })
      }
      const stuff_departmentId = res_stuffInfo[0].departmentId
      if (stuff_departmentId && stuff_departmentId != departmentId) {
        return (ctx.body = {
          mess: '该员工不属于当前部门，请先将员工添加到部门中',
          error: -1
        })
      }

    }
  } catch (e) {
    ctx.body = {
      mess: e,
      error: -1
    }
  }
  try {
    if (departmentName) {
      const res_isDepartmentName = await departmentSql.queryDepartmentName(
        departmentName
      )
      if (res_isDepartmentName.length > 0) {
        for (item of res_isDepartmentName) {
          if (item.departmentId != departmentId) {
            return (ctx.body = {
              mess: '部门名称已经存在，修改失败',
              error: -3
            })
          }
        }
      }
    }
  } catch (e) {
    return (ctx.body = {
      mess: e,
      error: -2
    })
  }
  try {
    if (departmentMangerId) {
      const res_isDeparmentManagerId = await departmentSql.queryDeparmentManagerId(
        departmentMangerId
      )
      if (res_isDeparmentManagerId.length > 0) {
        for (item of res_isDeparmentManagerId) {
          if (item.departmentId != departmentId) {
            return (ctx.body = {
              mess: '当前员工已经是其他部门管理员，修改失败',
              error: -2
            })
          }
        }
      }
    }
  } catch (e) {
    return (ctx.body = {
      mess: e,
      error: -2
    })
  }
  const changeInfo = {
    departmentName,
    departmentDesc,
    departmentAddress,
    departmentId
  }
  try {
    const res_departmentManId = await departmentSql.queryManagerDepart(
      departmentId
    )
    const isDeparmentManagerId = res_departmentManId[0].departmentMangerId // 获取当前管理员ID
    if (departmentMangerId) {
      // 如果当前管理员ID存在
      if (isDeparmentManagerId) {
        if (departmentMangerId === isDeparmentManagerId) {
          // 判断是否需要修改管理员ID
          // 相等 不做任何处理
        } else {
          // 不相等 判断上传的管理员ID是否合法
          await allUserSql.clearpermission(isDeparmentManagerId)
          await allUserSql.setpermissions(departmentMangerId) // 更改权限码
          await departmentSql.emptySetManagerDepart(
            departmentMangerId,
            departmentId
          )
          const res_getManagerName = await allUserSql.queryNameByWorkNumber(
            departmentMangerId
          )
          departmentMangerName = res_getManagerName[0].userName
          changeInfo.departmentMangerName = departmentMangerName
        }
      } else {
        await departmentSql.emptySetManagerDepart(
          departmentMangerId,
          departmentId
        )
        await allUserSql.setDepartmentManaInfo(departmentMangerId, departmentId) 
        const res_getManagerName = await allUserSql.queryNameByWorkNumber(
          departmentMangerId
        )
        departmentMangerName = res_getManagerName[0].userName
        changeInfo.departmentMangerName = departmentMangerName
      }
    } else {
      await allUserSql.clearpermission(isDeparmentManagerId)
      await departmentSql.emptyManagerIdAndName(departmentId)
    }
    await departmentSql.changeDepartmentInfo(changeInfo)
    ctx.body = {
      mess: '修改部门信息成功',
      error: 0
    }
  } catch (e) {
    ctx.body = {
      mess: e.toString(),
      error: -1
    }
  }
}

async function deleteDepartment (ctx) {
  let token = ctx.request.header.authorization
  let res_token = getToken(token)
  if (res_token.permission != 0) {
    ctx.status = 403
    return (ctx.body = {
      message: '权限不足',
      error: -1
    })
  }
  const info = ctx.request.body
  const departmentId = info.departmentId
  try {
    const res_StuffNumber = await allUserSql.countStuffByDepartmentId(
      departmentId
    )
    if (res_StuffNumber[0]['count(*)'] > 0) {
      return (ctx.body = {
        mess: '还有员工隶属当前部门，无法删除',
        error: -3
      })
    }
    const res_deleteResult = await departmentSql.deleteDepartment(departmentId)
    ctx.body = {
      mess: '部门删除成功',
      error: 0
    }
  } catch (e) {
    if (!departmentId) {
      ctx.body = {
        mess: '部门Id不能为空',
        error: -2
      }
    } else {
      ctx.body = {
        mess: e,
        error: -1
      }
    }
  }
}

async function setManagerDepart (ctx) {
  let token = ctx.request.header.authorization
  let res_token = getToken(token)
  if (res_token.permission != 0) {
    ctx.status = 403
    return (ctx.body = {
      message: '权限不足',
      error: -1
    })
  }
  const params = ctx.request.body
  const workNumber = params.workNumber || null
  const departmentId = params.departmentId
  const res_isExitManager = await departmentSql.queryManagerDepart(departmentId)
  let res_isSet = null
  const res_departmentName = await departmentSql.queryDepartNameById(
    departmentId
  )
  const departmentName = res_departmentName[0].departmentName
  if (
    !res_isExitManager[0].departmentMangerId ||
    res_isExitManager[0].departmentMangerId == workNumber
  ) {
    if (res_isExitManager[0].departmentMangerId == workNumber) {
      res_isSet = await departmentSql.emptyManagerIdAndName(departmentId)
      const res_clearPerssions = await allUserSql.clearpermission(workNumber)
      ctx.body = {
        message: `重置${departmentName}管理员成功`,
        error: 0
      }
    } else {
      const res_name = await allUserSql.queryNameByWorkNumber(workNumber)
      const name = await res_name[0].userName
      res_isSet = await departmentSql.setDepartManageIdAndName(
        workNumber,
        name,
        departmentId
      )
      const res_setPerssions = await allUserSql.setDepartmentManaInfo(
        workNumber,
        departmentId
      )
      ctx.body = {
        message: `设置${departmentName}管理员成功`,
        error: 0
      }
    }
  } else {
    ctx.body = {
      message: `${departmentName}已存在管理员，不可重新设置管理员`,
      error: 1
    }
  }
}

const methods = {
  addDepartment,
  changeDepartmentInfo,
  deleteDepartment,
  setManagerDepart
}

module.exports = methods
