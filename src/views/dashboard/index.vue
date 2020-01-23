<template>
  <el-row>
    <el-col :span="24">
      <NoticeShow ref="noticeShow" />
      <div style="height: 30px" />
    </el-col>
    <el-col :offset="1" :span="9">
      <div style="height: 400px;">
        <el-card shadow="hover" class="noticeCard">
          <div slot="header" class="clearfix" style="text-align: center;">
            <span>系统公告</span>
          </div>
          <div style="height: 300px">
            <el-table
              :data="noticeModel"
              class="noticeCard-table"
              style="width: 100%;"
              max-height="290"
              :show-header="false"
              @row-click="clickTable"
            >
              <el-table-column
                prop="title"
                tit="false"
              />
              <el-table-column
                prop="createTime"
                width="160"
              />
            </el-table>
          </div>
        </el-card>
      </div>
    </el-col>
    <el-col :offset="1" :span="12">
      <div style="height: 390px; background-color: #001528">
        <el-card shadow="hover" class="noticeCard">
          <div slot="header" class="clearfix" style="text-align: center;">
            <span>对接帮助</span>
          </div>
          <div style="height: 300px">
            <a class="api-link" :href="'http://apitongdapay.com/doc/支付系统API文档-2.0.0.pdf'" target="_blank" type="success">
              点击获取Api文档
            </a>
            <hr/>
            <a class="api-link" :href="'http://apitongdapay.com/doc/java-api-demo.zip'" target="_blank" type="success">
              对接示例ApiDemo(Java)
            </a>
          </div>
        </el-card>
      </div>
    </el-col>
    <el-col :span="24">
      <div style="height: 30px" />
    </el-col>
    <el-col :offset="1" :span="22">
      <el-card shadow="hover">
        <div id="homeCardEcarts" style="height: 350px" />
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import { getNoticeList, getNotice, getNewOneNotice } from '@/api/sys/notice'
import { countOrderMoney } from '@/api/pay/order'
import { CentToDollars } from '@/common/commonFun'
import NoticeShow from '@/components/Notice/noticeShow'
// 引入基本模板
import Echarts from 'echarts/lib/echarts'
// 引入柱状图
require('echarts/lib/chart/bar')
// 引入提示框和title组件
require('echarts/lib/component/tooltip')
require('echarts/lib/component/title')

export default {
  name: 'Dashboard',
  components: { NoticeShow },
  computed: {
    ...mapGetters([
      'info'
    ])
  },
  data() {
    return {
      noticeModel: [],
      xAxisData: [],
      paySuccessSeries: {
        itemStyle: {
          normal: {
            color: '#6cff96'
          }
        },
        name: '已支付',
        type: 'bar',
        stack: '已支付',
        data: []
      },
      allOrderSeries: {
        itemStyle: {
          normal: {
            color: '#7866ff'
          }
        },
        name: '全部(含未支付)',
        type: 'bar',
        stack: '全部(含未支付)',
        data: []
      }
    }
  },
  created() {
    this.pageInit()
  },
  mounted() {
    this.drawLine()
  },
  methods: {
    async pageInit() {
      try {
        let [noticeList, newOneNotice] = await Promise.all([
          getNoticeList(),
          getNewOneNotice()
        ])
        this.noticeModel = noticeList.data
        if (newOneNotice.data) {
          this.$refs.noticeShow.$emit('openNoticeShowDialog', newOneNotice.data)
        }
      } catch (error) {
        this.outputError(error)
      }
    },
    async drawLine() {
      try {
        let [orderData] = await Promise.all([
          countOrderMoney()
        ])
        for (let i = 0, len = orderData.data.allOrder.length; i < len; i++) {
          this.xAxisData.push(orderData.data.allOrder[i].orderDate.substr(5, 5))
          this.allOrderSeries.data.push(CentToDollars(orderData.data.allOrder[i].orderMoney))
          this.paySuccessSeries.data.push(CentToDollars(orderData.data.paySuccess[i].orderMoney))
        }
        // 初始化echarts实例
        let homeCardEcarts = Echarts.init(document.getElementById('homeCardEcarts'))
        // 绘制图表
        homeCardEcarts.setOption({
          title: {
            text: '订单金额(元)',
            x: 'center',
            y: 'top',
            textAlign: 'center'
          },
          tooltip: {
            trigger: 'axis',
            borderColor: '#636F7F',
            borderWidth: 1,
            backgroundColor: 'rgba(99,111,127,1)',
            textStyle: {
              color: '#ffffff',
              fontSize: 14
            },
            transitionDuration: 0.6,
            axisPointer: {
              type: 'shadow',
              lineStyle: {
                color: '#05F41E',
                width: 1,
                type: 'solid'
              }
            }
          },
          legend: {
            data: ['已支付', '全部(含未支付)']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            data: this.xAxisData
          },
          yAxis: {},
          series: [this.paySuccessSeries, this.allOrderSeries]
        }, true)
      } catch (e) {
        this.outputError(e)
      }
    },
    clickTable(row, index, e) {
      getNotice(row.id).then(rep => {
        this.$refs.noticeShow.$emit('openNoticeShowDialog', rep.data)
      }).catch(error => {
        this.outputError(error)
      })
    },
    outputError(error) {
      console.log(error.response ? error.response : error.message)
      this.loading = false
      this.$message({
        showClose: true,
        message: error.message,
        type: 'error'
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
 .noticeCard-table tr{
   height: 0px;
 }
 .noticeCard-table td{
  padding-top: 0px;
  padding-bottom: 0px;
 }
  .noticeCard-table div.el-card__body{
    padding-top: 0px;
  }

 .api-link:link{
   color:black;
 }
 .api-link:hover{
   color:purple;
 }
 .api-link:visited {
   color: red;
 }
  .api-link-old{
    color: black;
  }
</style>
