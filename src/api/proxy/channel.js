import request from '@/utils/request'
import { DollarsToCent, PerRatioToInteger } from '@/common/commonFun'

export function getProxyChannelList(parameter) {
  return request({
    url: '/admin/proxyChannel/getProxyChannelList',
    method: 'post',
    data: {
      condition: parameter.condition,
      pageNum: parameter.pageNum,
      size: parameter.size
    }
  })
}

export function editProxyChannel(parameter) {
  console.log(parameter)
  return request({
    url: '/admin/proxyChannel/editProxyChannel',
    method: 'post',
    data: {
      id: parameter.id,
      brokerage: PerRatioToInteger(parameter.brokerage),
      sysBrokerage: PerRatioToInteger(parameter.sysBrokerage),
      maxLimitAmount: DollarsToCent(parameter.maxLimitAmount),
      maxPayAmount: DollarsToCent(parameter.maxPayAmount),
      miniPayAmount: DollarsToCent(parameter.miniPayAmount),
      channelId: parameter.channelId,
      proxyId: parameter.proxyId
    }
  })
}
