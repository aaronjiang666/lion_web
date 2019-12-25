import request from '@/utils/request'
import { DollarsToCent } from '@/common/commonFun'

export function getAllCashInApply(parameter) {
  return request({
    url: '/admin/cashApply/getAllCashInApply',
    method: 'post',
    data: {
      condition: parameter.condition,
      pageNum: parameter.pageNum,
      size: parameter.size
    }
  })
}

export function getCashInApplyList(parameter) {
  return request({
    url: '/admin/cashApply/getCashInApplyList',
    method: 'post',
    data: {
      condition: parameter.condition,
      pageNum: parameter.pageNum,
      size: parameter.size
    }
  })
}

export function saveApplyPayment(parameter) {
  return request({
    url: '/admin/cashApply/saveApplyPayment',
    method: 'post',
    data: {
      id: parameter.id,
      remarks: parameter.remarks
    }
  })
}

export function revokeCashInApply(parameter) {
  return request({
    url: '/admin/cashApply/revokeCashInApply',
    method: 'post',
    data: {
      id: parameter.id,
      remarks: parameter.remarks
    }
  })
}

export function saveCashApply(parameter) {
  return request({
    url: '/admin/cashApply/saveCashApply',
    method: 'post',
    data: {
      applyMoney: DollarsToCent(parameter.applyMoney),
      bankId: parameter.bankId,
      googleCode: parameter.googleCode
    }
  })
}
