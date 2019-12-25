import request from '@/utils/request'

export function addUpstream(parameter) {
  return request({
    url: '/admin/upstream/addUpstream',
    method: 'post',
    data: {
      name: parameter.name,
      marchantNo: parameter.marchantNo,
      marchantKey: parameter.marchantKey,
      marchantToken: parameter.marchantToken,
      apiUrl: parameter.apiUrl,
      asynUrl: parameter.asynUrl,
      syncUrl: parameter.syncUrl,
      repBeanName: parameter.repBeanName,
      reqBeanName: parameter.reqBeanName,
      remarks: parameter.remarks
    }
  })
}

export function editUpstream(parameter) {
  return request({
    url: '/admin/upstream/editUpstream',
    method: 'post',
    data: {
      id: parameter.id,
      name: parameter.name,
      marchantNo: parameter.marchantNo,
      marchantKey: parameter.marchantKey,
      marchantToken: parameter.marchantToken,
      apiUrl: parameter.apiUrl,
      asynUrl: parameter.asynUrl,
      syncUrl: parameter.syncUrl,
      repBeanName: parameter.repBeanName,
      reqBeanName: parameter.reqBeanName,
      remarks: parameter.remarks
    }
  })
}

export function delUpstream(id) {
  return request({
    url: '/admin/upstream/delUpstream?id=' + id,
    method: 'get'
  })
}

export function getAllList() {
  return request({
    url: '/admin/upstream/getAllList',
    method: 'get'
  })
}

export function getById(id) {
  return request({
    url: '/admin/upstream/getById?id=' + id,
    method: 'get'
  })
}

export function getList(parameter) {
  return request({
    url: '/admin/upstream/getList',
    method: 'post',
    data: {
      condition: parameter.condition,
      pageNum: parameter.pageNum,
      size: parameter.size
    }
  })
}

