import request from '@/utils/request'

export function getNoticePageList(parameter) {
  return request({
    url: '/admin/notice/getNoticePageList',
    method: 'post',
    data: {
      condition: parameter.condition,
      pageNum: parameter.pageNum,
      size: parameter.size
    }
  })
}

export function saveNotice(parameter) {
  return request({
    url: '/admin/notice/saveNotice',
    method: 'post',
    data: {
      title: parameter.title,
      content: parameter.content,
      state: parameter.state
    }
  })
}

export function getNotice(id) {
  return request({
    url: '/admin/notice/getNotice?id=' + id,
    method: 'get'
  })
}

export function deleteNotice(id) {
  return request({
    url: '/admin/notice/deleteNotice?id=' + id,
    method: 'get'
  })
}

export function getNoticeList() {
  return request({
    url: '/admin/notice/getNoticeList',
    method: 'get'
  })
}

export function getNewOneNotice() {
  return request({
    url: '/admin/notice/getNewOneNotice',
    method: 'get'
  })
}
