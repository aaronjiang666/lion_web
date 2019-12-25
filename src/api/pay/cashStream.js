import request from '@/utils/request'

export function getCashStreamList(parameter) {
  return request({
    url: '/admin/cashStream/getCashStreamList',
    method: 'post',
    data: {
      condition: parameter.condition,
      pageNum: parameter.pageNum,
      size: parameter.size
    }
  })
}

export function getCashStreamAllList(parameter) {
  return request({
    url: '/admin/cashStream/getCashStreamAllList',
    method: 'post',
    data: {
      condition: parameter.condition,
      pageNum: parameter.pageNum,
      size: parameter.size
    }
  })
}
