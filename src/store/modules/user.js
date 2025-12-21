import { authApi } from '@/api'
import { Message } from 'element-ui'
import { getLocalAccount, isLocalAccount } from '@/config/local'

const state = {
  token: localStorage.getItem('token') || '',
  userInfo: (() => {
    try {
      const userInfoStr = localStorage.getItem('userInfo')
      return userInfoStr ? JSON.parse(userInfoStr) : null
    } catch (e) {
      return null
    }
  })(),
  role: localStorage.getItem('role') || ''
}

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
    localStorage.setItem('token', token)
  },
  SET_USER_INFO(state, userInfo) {
    state.userInfo = userInfo
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
  },
  SET_ROLE(state, role) {
    state.role = role
    localStorage.setItem('role', role)
  },
  CLEAR_USER(state) {
    state.token = ''
    state.userInfo = null
    state.role = ''
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('role')
  }
}

const actions = {
  // 管理员登录
  async adminLogin({ commit }, loginForm) {
    try {
      // 检查是否为本地开发账号
      if (isLocalAccount(loginForm.username)) {
        const localAccount = getLocalAccount(loginForm.username)
        if (!localAccount) {
          throw new Error('本地账号配置错误')
        }
        commit('SET_TOKEN', localAccount.token)
        commit('SET_USER_INFO', {
          id: 999,
          username: localAccount.username,
          name: localAccount.name
        })
        commit('SET_ROLE', localAccount.role)
        Message.success('本地开发模式登录成功')
        return Promise.resolve({
          code: 200,
          message: '登录成功',
          data: {
            token: localAccount.token,
            user: {
              id: 999,
              username: localAccount.username,
              name: localAccount.name
            }
          }
        })
      }
      
      // 正常登录流程
      const res = await authApi.adminLogin(loginForm)
      if (res.code === 200) {
        commit('SET_TOKEN', res.data.token)
        commit('SET_USER_INFO', res.data.user)
        commit('SET_ROLE', 'admin')
        Message.success('登录成功')
        return Promise.resolve(res)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  },
  // 员工登录
  async employeeLogin({ commit }, loginForm) {
    try {
      // 检查是否为本地开发账号
      if (isLocalAccount(loginForm.username)) {
        const localAccount = getLocalAccount(loginForm.username)
        if (!localAccount) {
          throw new Error('本地账号配置错误')
        }
        commit('SET_TOKEN', localAccount.token)
        // 本地开发账号也包含模拟的岗位和区域信息
        commit('SET_USER_INFO', {
          id: 999,
          username: localAccount.username,
          name: localAccount.name,
          post: {
            id: 1,
            name: '测试岗位',
            code: 'TEST',
            status: 1
          },
          position_configs: [
            {
              id: 1,
              name: '大殿',
              type: 'grid',
              status: 1
            },
            {
              id: 2,
              name: '偏殿',
              type: 'custom',
              status: 1
            }
          ]
        })
        // 使用本地账号配置的角色（admin 或 employee）
        commit('SET_ROLE', localAccount.role)
        Message.success('本地开发模式登录成功')
        return Promise.resolve({
          code: 200,
          message: '登录成功',
          data: {
            token: localAccount.token,
            user: {
              id: 999,
              username: localAccount.username,
              name: localAccount.name
            }
          }
        })
      }
      
      // 正常登录流程
      const res = await authApi.employeeLogin(loginForm)
      if (res.code === 200) {
        commit('SET_TOKEN', res.data.token)
        // 保存完整的登录数据（包含 post 和 position_configs）
        const userInfo = {
          id: res.data.user_id,
          username: res.data.username,
          name: res.data.name,
          post: res.data.post,
          position_configs: res.data.position_configs || []
        }
        commit('SET_USER_INFO', userInfo)
        commit('SET_ROLE', res.data.role || 'employee')
        Message.success('登录成功')
        return Promise.resolve(res)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  },
  // 退出登录
  logout({ commit }) {
    commit('CLEAR_USER')
    Message.success('已退出登录')
  }
}

const getters = {
  token: state => state.token,
  userInfo: state => state.userInfo,
  role: state => state.role,
  isAdmin: state => state.role === 'admin',
  isEmployee: state => state.role === 'employee',
  isAuthenticated: state => !!state.token
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}


