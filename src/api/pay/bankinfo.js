import request from '@/utils/request'

// ============ 平台管理员 ====================================
export function getAllBankInfoList(parameter) {
  return request({
    url: '/admin/bankInfo/getAllBankInfoList',
    method: 'post',
    data: {
      condition: parameter.condition,
      pageNum: parameter.pageNum,
      size: parameter.size
    }
  })
}

export function bankInfoAuditing(id) {
  return request({
    url: '/admin/bankInfo/bankInfoAuditing?id=' + id,
    method: 'get'
  })
}

// ============== End ====================================

// ============== 商户管理员 ==============================

export function getBankInfoList(parameter) {
  return request({
    url: '/admin/bankInfo/getBankInfoList',
    method: 'post',
    data: {
      condition: parameter.condition,
      pageNum: parameter.pageNum,
      size: parameter.size
    }
  })
}

export function saveBankInfo(parameter) {
  return request({
    url: '/admin/bankInfo/saveBankInfo',
    method: 'post',
    data: {
      accountName: parameter.accountName, // 开户名
      accountNumber: parameter.accountNumber, // 账号
      bankName: parameter.bankName, // 银行名称
      branchAddr: parameter.branchAddr, // 支行地址
      branchName: parameter.branchName, // 支行名称
      remarks: parameter.remarks // 备注
    }
  })
}

export function editBankInfo(parameter) {
  return request({
    url: '/admin/bankInfo/editBankInfo',
    method: 'post',
    data: {
      id: parameter.id,
      accountName: parameter.accountName, // 开户名
      accountNumber: parameter.accountNumber, // 账号
      bankName: parameter.bankName, // 银行名称
      branchAddr: parameter.branchAddr, // 支行地址
      branchName: parameter.branchName, // 支行名称
      remarks: parameter.remarks // 备注
    }
  })
}

export function deleteBankInfo(id) {
  return request({
    url: '/admin/bankInfo/deleteBankInfo?id=' + id,
    method: 'get'
  })
}

export function getBankInfoById(id) {
  return request({
    url: '/admin/bankInfo/getBankInfoById?id=' + id,
    method: 'get'
  })
}

export function getAllBankInfo() {
  return request({
    url: '/admin/bankInfo/getAllBankInfo',
    method: 'get'
  })
}

// ============== End ====================================
