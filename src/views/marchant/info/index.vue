<template>
  <el-card v-if="showCard" v-loading="loading" shadow="always">
    <div slot="header">
      <span style="font-size: 1.5em; font-weight: bold">商户详细信息</span>
    </div>
    <el-row>
      <el-col :span="5" :offset="1">
        <!-- 商户信息 -->
        <el-input v-show="info.userType === 2" :value="dataModel.merchantNo" :readonly="true" class="marchan_info">
          <template slot="prepend">
            商户号：
          </template>
        </el-input>
        <!--代理商信息-->
        <el-input v-show="info.userType === 3" :value="dataModel.proxyNo" :readonly="true" class="marchan_info">
          <template slot="prepend">
            代理编号：
          </template>
        </el-input>
        <hr color="white" style="margin: 1.3em">
        <el-input :value="dataModel.totalAccount.intoMoney | CentToDollars" :readonly="true" class="marchan_info">
          <template slot="prepend">
            总收入金额:
          </template>
          <template slot="append">
            ￥
          </template>
        </el-input>
        <hr color="white" style="margin: 1.3em">
        <el-input :value="dataModel.totalAccount.freezeMoney | CentToDollars" :readonly="true" class="marchan_info">
          <template slot="prepend">
            待拨款:
          </template>
          <template slot="append">
            ￥
          </template>
        </el-input>
        <hr color="white" style="margin: 1.3em">
        <el-input :value="dataModel.totalAccount.totalPoundage | CentToDollars" :readonly="true" class="marchan_info">
          <template slot="prepend">
            总手续费:
          </template>
          <template slot="append">
            ￥
          </template>
        </el-input>
      </el-col>
      <el-col :span="7" :offset="1">
        <el-input v-show="info.userType === 2" :value="dataModel.merchantKey" :readonly="true" class="marchan_info">
          <template slot="prepend">
            商户KEY:
          </template>
        </el-input>
        <hr color="white" style="margin: 1.3em">
        <el-input :value="dataModel.totalAccount.outMoney | CentToDollars" :readonly="true" class="marchan_info">
          <template slot="prepend">
            总支出金额:
          </template>
          <template slot="append">
            ￥
          </template>
        </el-input>
        <hr color="white" style="margin: 1.3em">
        <el-input :value="dataModel.totalAccount.surplusMoney | CentToDollars" :readonly="true" class="marchan_info">
          <template slot="prepend">
            余额:
          </template>
          <template slot="append">
            ￥
          </template>
        </el-input>
      </el-col>
      <el-col :span="7" :offset="1">
        <el-card v-show="permission.bind && permission.secret" shadow="never" class="bind-google-card">
          <div slot="header">
            <span>Goole验证器绑定</span>
            <el-switch
              v-model="isVerify"
              class="bind-google-switch"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="1"
              :inactive-value="0"
              :disabled="switchDisabled"
              @change="getGooleSecret"
            />
          </div>
          <div>
            <span>安装Goole身份验证器后,请使用身份验证器扫码或将秘钥输入. 下列信息请妥善保存.</span>
            <hr color="white" style="margin: 1.3em">
            <el-input :value="info.loginName" :readonly="true" class="marchan_info">
              <template slot="prepend">
                当前用户：
              </template>
            </el-input>
            <hr color="white" style="margin: 1.3em">
            <div>
              <hr color="white" style="margin: 0.2em">
              <el-col :span="16">
                <el-input
                  v-show="showBindInput"
                  v-model="googleAut.googleCode"
                  class="googleCode_input"
                  placeholder="输入验证器Code"
                  size="mini"
                />
                <hr color="white" style="margin: 1.3em">
                <span>绑定秘钥:</span>
                <hr color="white" style="margin: 0.2em">
                <el-input size="large" :value="googleAut.secret" :readonly="true" class="marchan_info" />
              </el-col>
              <el-col :span="2" :offset="1">
                <el-button v-show="showBindInput" type="success" size="mini" @click="bindGoogleAuth()">
                  绑定
                </el-button>
              </el-col>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <hr color="white" style="margin: 0.8em">
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="5" :offset="1">
        <el-input :value="dataModel.qq" :readonly="true" class="marchan_info">
          <template slot="prepend">
            QQ:
          </template>
        </el-input>
        <hr color="white" style="margin: 1.3em">
        <el-input :value="dataModel.phone" :readonly="true" class="marchan_info">
          <template slot="prepend">
            电话:
          </template>
        </el-input>
        <hr color="white" style="margin: 1.3em">
      </el-col>
      <el-col :span="7" :offset="1">
        <el-input :value="dataModel.loginName" :readonly="true" class="marchan_info">
          <template slot="prepend">
            后台管理登录名:
          </template>
        </el-input>
        <hr color="white" style="margin: 1.3em">
        <el-input :value="dataModel.userName" :readonly="true" class="marchan_info">
          <template slot="prepend">
            管理用户名称:
          </template>
        </el-input>
        <hr color="white" style="margin: 1.3em">
      </el-col>
      <el-col :span="3" :offset="1">
        <span>认证码:</span>
        <hr color="white" style="margin: 0.2em">
        <img :src="googleAut.secretQrCode">
      </el-col>
      <el-col :span="4">
        <span>登录IP地址绑定:</span>
        <hr color="white" style="margin: 0.2em">
        <el-input
          v-model="ipAddrs"
          type="textarea"
          placeholder="输入IP地址,多个使用逗号分隔"
        />
        <hr color="white" style="margin: 0.5em">
        <el-button type="success" size="mini" @click="bindIpadder()">
          绑定
        </el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="7" :offset="1">
        <el-input :value="dataModel.email" :readonly="true" class="marchan_info">
          <template slot="prepend">
            EMAIL:
          </template>
        </el-input>
        <hr color="white" style="margin: 1.3em">
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import { getMarchantInfo } from '@/api/pay/marchant'
import { getProxyInfo } from '@/api/sys/proxy'
import { commaIsIp } from '@/common/commonFun'
import { bindIpadder, getGooleSecret, bindGoogleAuthenticator } from '@/api/sys/user'
import store from '@/store'
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      loading: false,
      showCard: false,
      permission: {
        bind: false,
        secret: false
      },
      isVerify: 0,
      googleAut: {
        secret: '',
        googleCode: '',
        secretQrCode: ''
      },
      ipAddrs: '',
      switchDisabled: false,
      showBindInput: false,
      dataModel: {}
    }
  },
  computed: {
    ...mapGetters([
      'info'
    ])
  },
  mounted() {
    this.pageInit()
  },
  methods: {
    pageInit() {
      this.loading = true
      let resources = store.getters.resources
      let read = resources.find(item => {
        return item.permission === 'admin:current_info:read'
      })
      if (!read) {
        this.loading = false
        new Promise((resolve, reject) => {
          reject(new Error('没有访问权限'))
        }).catch(reason => {
          this.outputError(reason)
        })
        return
      }
      this.permission.bind = resources.find(item => {
        return item.permission === 'admin:users:google:bind'
      })
      this.permission.secret = resources.find(item => {
        return item.permission === 'admin:users:google:getSecret'
      })
      if (this.info.userType === 2) {
        getMarchantInfo().then(response => {
          this.dataModel = response.data
          this.loading = false
          this.showCard = true
        }).catch(error => {
          this.outputError(error)
        })
      } else if (this.info.userType === 3) {
        getProxyInfo().then(response => {
          this.dataModel = response.data
          this.loading = false
          this.showCard = true
        }).catch(error => {
          this.outputError(error)
        })
      }
      this.isVerify = this.info.isVerify
      this.ipAddrs = this.info.ipAdder
      if (this.info.isVerify === 0) {
        this.showBindInput = false
        this.switchDisabled = false
      } else if (this.info.isVerify === 1) {
        this.switchDisabled = true
        this.showBindInput = false
        this.getGooleSecret(this.info.isVerify)
      }
    },
    getGooleSecret(val) {
      if (val === 0) {
        this.googleAut.secret = ''
        this.googleAut.secretQrCode = ''
        this.showBindInput = false
        return
      }
      this.loading = true
      getGooleSecret().then(response => {
        this.googleAut.secret = response.data.secret
        this.googleAut.secretQrCode = response.data.secretQrCode
        if (this.info.isVerify === 0) {
          this.showBindInput = true
        }
        this.loading = false
      }).catch(error => {
        this.outputError(error)
      })
    },
    bindGoogleAuth() {
      this.loading = true
      this.showBindInput = true
      bindGoogleAuthenticator(this.googleAut).then(resources => {
        this.showBindInput = false
        this.switchDisabled = true
        this.loading = false
      }).catch(error => {
        this.outputError(error)
      })
    },
    bindIpadder() {
      this.loading = true
      if (!commaIsIp(this.ipAddrs)) {
        let error = {}
        error.message = 'ip地址格式错误'
        this.outputError(error)
      } else {
        bindIpadder(this.ipAddrs).then(resources => {
          this.loading = false
        }).catch(error => {
          this.outputError(error)
        })
      }
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
<style>
  .marchan_info input.el-input__inner{
    border-top-color: #ffff;
    border-right-color: #ffff;
    border-left-color: #ffff;
    border-bottom-color: #0b5268;
    padding-left: 5px;
    align: left;
  }
  .marchan_info div.el-input-group__prepend{
    background-color: #ffff;
    border-color: #ffff;
    border-bottom-color: #0b5268;
    padding-right: 5px;
    color: #000;
  }

  .marchan_info div.el-input-group__append{
    background-color: #ffff;
    border-color: #ffff;
    border-bottom-color: #0b5268;
    color: #000;
  }
  .marchan_info div.el-input-group__append button.el-button{
    background-color: #13ce66
  }
  .marchan_info div.googleCode_input{
    height: 42px;
  }
</style>
<style lang="scss" scoped>

  .marchan_info{
    font-size: 1.0em;
  }

  .marchan_field_name {
    margin: 5px;
  }
  .bind-google-switch {
    float: right;
  }
  .bind-google-card {
    border-color: #ffff;
  }
</style>
