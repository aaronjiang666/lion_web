import request from '@/utils/request'
import { DollarsToCent, PerRatioToInteger } from '@/common/commonFun'

export function getChannelList(parameter) {
  return request({
    url: '/admin/channel/getChannelList',
    method: 'post',
    data: {
      condition: parameter.condition,
      pageNum: parameter.pageNum,
      size: parameter.size
    }
  })
}

export function getMarchantChannelInfoList() {
  return request({
    url: '/admin/channel/getMarchantChannelInfoList',
    method: 'get'
  })
}

export function getChannelById(id) {
  return request({
    url: '/admin/channel/getChannelById?id=' + id,
    method: 'get'
  })
}

export function getAllChannel() {
  return request({
    url: '/admin/channel/getAllChannel',
    method: 'get'
  })
}

export function saveChannel(parameter) {
  return request({
    url: '/admin/channel/saveChannel',
    method: 'post',
    data: {
      code: parameter.code,
      name: parameter.name,
      isDownstream: parameter.isDownstream,
      maxLimitAmount: DollarsToCent(parameter.maxLimitAmount),
      maxPayAmount: DollarsToCent(parameter.maxPayAmount),
      miniPayAmount: DollarsToCent(parameter.miniPayAmount),
      state: parameter.state,
      brokerage: PerRatioToInteger(parameter.brokerage),
      upstreamBrokerage: PerRatioToInteger(parameter.upstreamBrokerage),
      upstreamId: parameter.upstreamId,
      upstreamCode: parameter.upstreamCode
    }
  })
}

export function editChannel(parameter) {
  return request({
    url: '/admin/channel/editChannel',
    method: 'post',
    data: {
      id: parameter.id,
      code: parameter.code,
      name: parameter.name,
      brokerage: PerRatioToInteger(parameter.brokerage),
      upstreamBrokerage: PerRatioToInteger(parameter.upstreamBrokerage),
      isDownstream: parameter.isDownstream,
      maxLimitAmount: DollarsToCent(parameter.maxLimitAmount),
      maxPayAmount: DollarsToCent(parameter.maxPayAmount),
      miniPayAmount: DollarsToCent(parameter.miniPayAmount),
      state: parameter.state,
      upstreamCode: parameter.upstreamCode,
      upstreamId: parameter.upstreamId
    }
  })
}

export function editMarchantChannel(parameter) {
  return request({
    url: '/admin/channel/editMarchantChannel',
    method: 'post',
    data: {
      id: parameter.id,
      brokerage: PerRatioToInteger(parameter.brokerage),
      status: parameter.status,
      channelId: parameter.channelId,
      marchantId: parameter.marchantId,
      remarks: parameter.remarks
    }
  })
}

export function deleteChannel(id) {
  return request({
    url: '/admin/channel/deleteChannel?id=' + id,
    method: 'get'
  })
}

