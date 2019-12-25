import request from '@/utils/request'

export function getAllOrderList(parameter) {
  return request({
    url: '/admin/order/getAllOrderList',
    method: 'post',
    data: {
      condition: parameter.condition,
      pageNum: parameter.pageNum,
      size: parameter.size
    }
  })
}

export function getMarchantOrderList(parameter) {
  return request({
    url: '/admin/order/getMarchantOrderList',
    method: 'post',
    data: {
      condition: parameter.condition,
      pageNum: parameter.pageNum,
      size: parameter.size
    }
  })
}

export function startCallback(id) {
  return request({
    url: '/admin/order/startCallback?id=' + id,
    method: 'get'
  })
}

export function countOrderMoney() {
  return request({
    url: '/admin/order/countOrderMoney',
    method: 'get'
  })
}

export function getOrderState(id) {
  return request({
    url: '/admin/order/getOrderState?id=' + id,
    method: 'get'
  })
}

export function balanceOrder(id) {
  return request({
    url: '/admin/order/balanceOrder?id=' + id,
    method: 'get'
  })
}

