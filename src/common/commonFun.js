/**
 * 公共函数
 * @param val
 * @returns {number}
 * @constructor
 */

import * as Valide from './valide'

// 将金额从元转换为分
export function DollarsToCent(val) {
  if (!Valide.isNumber(val) && !Valide.isFloating(val)) {
    return undefined
  }
  return val * 100
}

// 将千分比转换为整数
export function PerRatioToInteger(val) {
  if (!Valide.isNumber(val)) {
    return undefined
  }
  return val * 1000
}

// 将百分比换算为整数
export function PercentRatioToInteger(val) {
  if (!Valide.isFloating(val)) {
    return undefined
  }
  return val * 100
}

// 将金额从分转换为元
export function CentToDollars(val) {
  if (!Valide.isNumber(val)) {
    return 'invalid'
  }
  if (val !== 0) {
    return val / 100
  } else {
    return val
  }
}

// 将金额元转为万元
export function DollarsToThousand(val) {
  if (val !== 0) {
    return val / 10000
  } else {
    return val
  }
}

// 手续费转换
export function brokerageConvert(val) {
  if (!Valide.isNumber(val)) {
    return 'invalid'
  }
  if (val > 0) {
    return val / 1000.00
  } else if (val === 0) {
    return val
  } else if (val < 0) {
    return 'invalid'
  }
}

export function dateFormat(date, fmt) {
  let o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) { fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length)) }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) { fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))) }
  }
  return fmt
}

export function dataPaging(dataList, size, pageNum) {
  if (!dataList) {
    return
  }
  if (size <= 0) {
    size = 20
  }
  if (pageNum <= 0) {
    pageNum = 1
  }
  let offset = (pageNum - 1) * size
  return (offset + size >= dataList.length)
    ? dataList.slice(offset, dataList.length)
    : dataList.slice(offset, offset + size)
}

// 过滤密码复杂度
export function pwdFilter(val) {
  let repStr = new RegExp(/^[0-9a-zA-Z]\w{3,30}$/g)
  return repStr.test(val)
}

export function isIp(value) {
  let regexp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/
  let valid = regexp.test(value)
  if (!valid) { // 首先必须是 xxx.xxx.xxx.xxx 类型的数字，如果不是，返回false
    return false
  }
  return value.split('.').every(function(num) {
    // 切割开来，每个都做对比，可以为0，可以小于等于255，但是不可以0开头的俩位数
    // 只要有一个不符合就返回false
    if (num.length > 1 && num.charAt(0) === '0') {
      // 大于1位的，开头都不可以是‘0’
      return false
    } else if (parseInt(num, 10) > 255) {
      // 大于255的不能通过
      return false
    }
    return true
  })
}

/**
 * 逗号分隔的ip地址列表
 */
export function commaIsIp(val) {
  return val.split(',').every(ip => {
    return isIp(ip)
  })
}
