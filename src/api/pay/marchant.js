import request from '@/utils/request'
import { DollarsToCent } from '@/common/commonFun'

export function getMarchantList(parameter) {
  return request({
    url: '/admin/marchant/getMarchantList',
    method: 'post',
    data: {
      condition: parameter.condition,
      pageNum: parameter.pageNum,
      size: parameter.size
    }
  })
}

export function addMarchant(parameter) {
  return request({
    url: '/admin/marchant/addMarchant',
    method: 'post',
    data: {
      loginName: parameter.loginName,
      userName: parameter.userName,
      password: parameter.password,
      phone: parameter.phone,
      email: parameter.email,
      qq: parameter.qq,
      idCard: parameter.idCard,
      state: parameter.state
    }
  })
}

export function stopMarchant(id) {
  return request({
    url: '/admin/marchant/stopMarchant?id=' + id,
    method: 'get'
  })
}

export function enableMarchant(id) {
  return request({
    url: '/admin/marchant/enableMarchant?id=' + id,
    method: 'get'
  })
}

export function getMarchantInfo() {
  return request({
    url: '/admin/marchant/getMarchantInfo',
    method: 'get'
  })
}

export function resetMerchantKey(merchantId) {
  return request({
    url: '/admin/marchant/resetMerchantKey?merchantId=' + merchantId,
    method: 'get'
  })
}

export function editMerchantAccount(parameter) {
  return request({
    url: '/admin/marchant/editMerchantAccount',
    method: 'post',
    data: {
      merchantId: parameter.merchantId,
      merchantType: 2,
      intoOrOut: parameter.intoOrOut,
      remarks: parameter.remarks,
      money: DollarsToCent(parameter.money),
      poundage: DollarsToCent(parameter.poundage),
      googleCode: parameter.googleCode
    }
  })
}

