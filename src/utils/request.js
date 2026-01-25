import axios from 'axios'
import { Message } from 'element-ui'
import router from '@/router'
import store from '@/store'
import { shouldSkipTokenCheck } from '@/config/local'

// 创建axios实例
const service = axios.create({
  baseURL: 'http://175.178.119.226:20255/api/v1',
  timeout: 30000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = store.getters['user/token']
    const userInfo = store.getters['user/userInfo']
    const username = userInfo?.username
    
    // 如果是本地开发账号，跳过 token 校验（不添加 Authorization 头）
    if (username && shouldSkipTokenCheck(username)) {
      // 本地开发模式，不添加 token，让后端知道这是本地账号
      // 或者可以添加一个特殊的 header 标识
      config.headers['X-Local-Dev'] = 'true'
      config.headers['X-Local-User'] = username
    } else if (token) {
      // 正常情况添加 token
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    const userInfo = store.getters['user/userInfo']
    const username = userInfo?.username

    // 文件下载等二进制响应，直接返回 data（避免按 {code,message,data} 解析）
    const rt = response.config && response.config.responseType
    if (rt === 'blob' || rt === 'arraybuffer') {
      return res
    }
    
    // 如果返回的状态码不是200，说明有错误
    if (res.code !== 200) {
      // 401: Token过期或无效
      if (res.code === 401) {
        // 如果是本地开发账号，跳过退出登录
        if (username && shouldSkipTokenCheck(username)) {
          console.warn('本地开发模式：忽略 401 错误，不退出登录')
          // 本地账号不显示错误提示，直接返回错误让业务层处理
          return Promise.reject(new Error(res.message || '请求失败'))
        }
        
        // 正常账号才退出登录
        Message.error(res.message || '请求失败')
        store.dispatch('user/logout')
        // 避免重复导航
        if (router.currentRoute.path !== '/login') {
          router.push('/login').catch(err => {
            // 忽略重复导航错误
            if (err.name !== 'NavigationDuplicated') {
              console.error(err)
            }
          })
        }
      } else {
        // 其他错误正常显示
        Message.error(res.message || '请求失败')
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    } else {
      return res
    }
  },
  error => {
    console.error('响应错误:', error)
    let errorMessage = '网络错误'
    
    const userInfo = store.getters['user/userInfo']
    const username = userInfo?.username
    
    // 如果是本地开发账号，跳过 401 错误处理
    if (username && shouldSkipTokenCheck(username)) {
      // 本地开发模式，即使返回 401 也不退出登录
      if (error.response && error.response.status === 401) {
        console.warn('本地开发模式：忽略 401 错误')
        // 可以返回一个模拟的成功响应，或者让错误继续传播
        return Promise.reject(error)
      }
    }
    
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      store.dispatch('user/logout')
      // 避免重复导航
      if (router.currentRoute.path !== '/login') {
        router.push('/login').catch(err => {
          // 忽略重复导航错误
          if (err.name !== 'NavigationDuplicated') {
            console.error(err)
          }
        })
      }
      errorMessage = '登录已过期，请重新登录'
    } else if (error.response) {
      errorMessage = error.response.data?.message || `请求失败: ${error.response.status}`
    } else if (error.message) {
      errorMessage = error.message
    }
    
    Message.error(errorMessage)
    return Promise.reject(error)
  }
)

export default service

