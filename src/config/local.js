/**
 * 本地开发环境配置
 * 仅在开发环境生效，生产环境不会包含此配置
 */

// 判断是否为开发环境
const isDevelopment = process.env.NODE_ENV === 'development'

// 本地开发配置
export const localConfig = {
  // 是否启用本地开发模式
  enabled: isDevelopment,
  
  // 本地免登录账号（仅在开发环境生效）
  localAccounts: {
    // 管理员账号（管理员和员工登录都可以使用）
    adminGK: {
      username: 'adminGK',
      name: '本地管理员',
      role: 'admin', // 默认管理员角色，员工登录时也可以使用但会以管理员身份登录
      token: 'local-dev-token-adminGK'
    },
    // 员工账号（员工登录使用）
    employeeGK: {
      username: 'employeeGK',
      name: '本地员工',
      role: 'employee', // 员工角色，用于测试员工功能
      token: 'local-dev-token-employeeGK'
    }
  }
}

/**
 * 检查是否为本地开发账号
 * @param {string} username - 用户名
 * @returns {boolean}
 */
export function isLocalAccount(username) {
  if (!localConfig.enabled) {
    return false
  }
  return !!localConfig.localAccounts[username]
}

/**
 * 获取本地账号信息
 * @param {string} username - 用户名
 * @returns {object|null}
 */
export function getLocalAccount(username) {
  if (!localConfig.enabled) {
    return null
  }
  return localConfig.localAccounts[username] || null
}

/**
 * 检查是否应该跳过 token 校验
 * @param {string} username - 用户名
 * @returns {boolean}
 */
export function shouldSkipTokenCheck(username) {
  return isLocalAccount(username)
}

