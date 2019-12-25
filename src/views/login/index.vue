<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">
      <h3 class="title">
        通达支付系统
      </h3>
      <el-tabs v-model="activeName" class="loginTypeTabs" @tab-click="activeTabs">
        <el-tab-pane label="用户名密码" name="namePwd">
          <el-form-item prop="userName">
            <span class="svg-container">
              <svg-icon icon-class="user" />
            </span>
            <el-input
              v-model="loginForm.userName"
              name="username"
              type="text"
              auto-complete="on"
              placeholder="用户名"
            />
          </el-form-item>
          <el-form-item prop="password">
            <span class="svg-container">
              <svg-icon icon-class="password" />
            </span>
            <el-input
              v-model="loginForm.password"
              :type="pwdType"
              name="password"
              auto-complete="on"
              placeholder="密码"
            />
            <span class="show-pwd" @click="showPwd">
              <svg-icon :icon-class="pwdType === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </el-form-item>
          <el-form-item prop="vCode" class="vcode-input">
            <span class="svg-container">
              <svg-icon icon-class="form" />
            </span>
            <el-input
              v-model="loginForm.vCode"
              name="vCode"
              type="text"
              auto-complete="on"
              placeholder="验证码"
              @keyup.enter.native="handleLogin"
            />
            <img
              class="vCodeImgShow"
              :src="vCodeImg"
              @click="getVCodeImage"
            >
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="Google验证器" name="googleAut">
          <el-form-item prop="userName">
            <span class="svg-container">
              <svg-icon icon-class="user" />
            </span>
            <el-input
              v-model="loginForm.userName"
              name="username"
              type="text"
              auto-complete="on"
              placeholder="用户名"
            />
          </el-form-item>
          <el-form-item prop="code">
            <span class="svg-container">
              <svg-icon icon-class="password" />
            </span>
            <el-input
              v-model="loginForm.code"
              name="code"
              type="text"
              auto-complete="on"
              placeholder="Google验证码"
              @keyup.enter.native="handleLogin"
            />
          </el-form-item>
        </el-tab-pane>
        <el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            style="width:100%;"
            @click.native.prevent="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-tabs>
    </el-form>
  </div>
</template>

<script>
import { isvalidUsername } from '@/utils/validate'
import { getVCodeImage } from '@/api/sys/login'
import { isNumber } from '@/common/valide'
export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入用户名'))
      }
      if (!isvalidUsername(value)) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    const validatePass = (rule, value, callback) => {
      if (this.loginForm.loginType === 1 && value.length < 2) {
        callback(new Error('密码不能小于2位'))
      } else {
        callback()
      }
    }
    const validateCode = (rule, value, callback) => {
      if (this.loginForm.loginType === 2) {
        if (value.length < 6 || !isNumber(value)) {
          callback(new Error('Google验证码为6位数字'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    const validatevCode = (rule, value, callback) => {
      if (this.loginForm.loginType === 1) {
        if (!value) {
          callback(new Error('请输入验证码'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        userName: '',
        password: '',
        code: '',
        vCode: '',
        loginType: 1,
        clientId: ''
      },
      vCodeImg: '',
      loginRules: {
        userName: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePass }],
        code: [{ required: true, trigger: 'blur', validator: validateCode }],
        vCode: [{ required: true, trigger: 'blur', validator: validatevCode }]
      },
      loading: false,
      pwdType: 'password',
      redirect: undefined,
      activeName: 'namePwd'
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  mounted() {
    this.getVCodeImage()
  },
  methods: {
    showPwd() {
      if (this.pwdType === 'password') {
        this.pwdType = ''
      } else {
        this.pwdType = 'password'
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          if (this.loginForm.loginType === 1) {
            this.$store.dispatch('NamePwdLogin', this.loginForm).then(() => {
              this.loading = false
              this.$router.push({ path: this.redirect || '/' })
            }).catch((error) => {
              this.outputError(error)
            })
          } else if (this.loginForm.loginType === 2) {
            this.$store.dispatch('GoogleAutLogin', this.loginForm).then(() => {
              this.loading = false
              this.$router.push({ path: this.redirect || '/' })
            }).catch((error) => {
              this.outputError(error)
            })
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    activeTabs() {
      if (this.activeName === 'namePwd') {
        this.loginForm.loginType = 1
      } else if (this.activeName === 'googleAut') {
        this.loginForm.loginType = 2
      }
    },
    getVCodeImage() {
      this.loading = true
      getVCodeImage().then(response => {
        this.loginForm.clientId = response.data.clientId
        this.vCodeImg = response.data.codeImg
        this.loading = false
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
$bg:#2d3a4b;
$light_gray:#eee;

/* reset element-ui css */
.login-container {
  $el-input-width: 85%;
  $vCode-image-width: 100px;
  .el-input {
    display: inline-block;
    height: 47px;
    width: $el-input-width;
    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      &:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: #fff !important;
      }
    }
  }
  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
  .vcode-input{
    .el-input {
      width: calc(#{$el-input-width} - #{$vCode-image-width})
    }
  }

}
.loginTypeTabs{
  .el-tabs__item{
    color: #cadee6
  }
}

</style>

<style rel="stylesheet/scss" lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;
.login-container {
  position: fixed;
  height: 100%;
  width: 100%;
  background-image: url('../../assets/back-image.jpg');
  background-color: $bg;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  .login-form {
    position: absolute;
    left: 0;
    right: 0;
    width: 520px;
    max-width: 100%;
    padding: 35px 35px 15px 35px;
    margin: 120px auto;
  }
  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;
    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }
  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }
  .vCodeImgShow{
    width: 100px;
    height: 47px;
    display: inline-block;
    vertical-align: middle;
  }
  .title {
    font-size: 26px;
    font-weight: 400;
    color: $light_gray;
    margin: 0px auto 40px auto;
    text-align: center;
    font-weight: bold;
  }
  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
