<template>
  <div class="login-container">
    <div class="login-bg"></div>
    <div class="login-box">
      <div class="logo-wrap">
        <img class="logo" src="@/assets/images/logo.png" alt="logo" />
      </div>
      <h2 class="title">七曲山风景区</h2>
      <el-tabs v-model="activeTab" class="login-tabs">
        <el-tab-pane label="管理员登录" name="admin">
          <el-form
            ref="adminForm"
            :model="adminForm"
            :rules="adminRules"
            label-width="70px"
            class="login-form"
          >
            <el-form-item label="账号" prop="username">
              <el-input
                v-model="adminForm.username"
                placeholder="请输入账号"
                prefix-icon="el-icon-user"
              />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="adminForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="el-icon-lock"
                @keyup.enter.native="handleAdminLogin"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                style="width: 100%"
                :loading="loading"
                @click="handleAdminLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="员工登录" name="employee">
          <el-form
            ref="employeeForm"
            :model="employeeForm"
            :rules="employeeRules"
            label-width="70px"
            class="login-form"
          >
            <el-form-item label="账号" prop="username">
              <el-input
                v-model="employeeForm.username"
                placeholder="请输入账号"
                prefix-icon="el-icon-user"
              />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="employeeForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="el-icon-lock"
                @keyup.enter.native="handleEmployeeLogin"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                style="width: 100%"
                :loading="loading"
                @click="handleEmployeeLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <div class="login-footer">
        <el-link type="primary" @click="$router.push('/public/records')">
          游客查询入口
        </el-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Login',
  data() {
    return {
      activeTab: 'admin',
      loading: false,
      adminForm: {
        username: '',
        password: ''
      },
      employeeForm: {
        username: '',
        password: ''
      }
    }
      },
  computed: {
    adminRules() {
      return {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
      },
    employeeRules() {
      return {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    ...mapActions('user', ['adminLogin', 'employeeLogin']),
    handleTabClick(tab) {
      this.activeTab = tab.name
    },
    async handleAdminLogin() {
      this.$refs.adminForm.validate(async (valid) => {
        if (valid) {
          this.loading = true
          try {
            await this.adminLogin(this.adminForm)
            this.$router.push('/admin/dashboard').catch(err => {
              // 忽略重复导航错误
              if (err.name !== 'NavigationDuplicated') {
                console.error('路由错误:', err)
              }
            })
          } catch (error) {
            // 错误已在store中处理，这里不需要再次提示
            console.error('登录失败:', error)
          } finally {
            this.loading = false
          }
        }
      })
    },
    async handleEmployeeLogin() {
      this.$refs.employeeForm.validate(async (valid) => {
        if (valid) {
          this.loading = true
          try {
            await this.employeeLogin(this.employeeForm)
            this.$router.push('/employee/dashboard').catch(err => {
              // 忽略重复导航错误
              if (err.name !== 'NavigationDuplicated') {
                console.error('路由错误:', err)
              }
            })
          } catch (error) {
            // 错误已在store中处理，这里不需要再次提示
            console.error('登录失败:', error)
          } finally {
            this.loading = false
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.login-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  background: url('~@/assets/images/loginbg.png') center/cover no-repeat;
  filter: blur(4px);
  transform: scale(1.02);
}

.login-box {
  position: relative;
  width: 420px;
  max-width: 92%;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 16px;
  padding: 32px 32px 24px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(6px);
  z-index: 1;
}

.logo-wrap {
  text-align: center;
  margin-bottom: 12px;
}

.logo {
  width: 88px;
  height: 88px;
  object-fit: contain;
}

.title {
  text-align: center;
  font-size: 22px;
  color: var(--color-primary);
  margin-bottom: 16px;
  letter-spacing: 1px;
}

.login-form {
  margin-top: 20px;
}

.login-tabs ::v-deep(.el-tabs__nav-wrap::after) {
  background: transparent;
}

.login-tabs ::v-deep(.el-tabs__item) {
  color: var(--color-muted);
}

.login-tabs ::v-deep(.el-tabs__item.is-active) {
  color: var(--color-primary);
}

.login-footer {
  text-align: center;
  margin-top: 20px;
}

@media (max-width: 480px) {
  .login-box {
    padding: 24px 20px 18px;
  }
}
</style>

