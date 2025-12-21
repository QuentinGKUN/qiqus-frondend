# 本地开发配置说明

## 功能说明

在本地开发环境中，可以使用特殊账号进行免 token 登录，方便本地开发和调试。

## 使用方法

### 管理员账号
1. **登录账号**：在登录页面使用以下账号登录
   - 用户名：`adminGK`
   - 密码：任意（不会验证）
   - 登录方式：选择"管理员登录"

2. **权限**：自动获得管理员权限，可以访问所有管理员功能

### 员工账号
1. **登录账号**：在登录页面使用以下账号登录
   - 用户名：`employeeGK`
   - 密码：任意（不会验证）
   - 登录方式：选择"员工登录"

2. **权限**：自动获得员工权限，可以访问员工功能（如办理上香业务、选择上香位置等）

### 自动识别
系统会自动识别为本地开发账号，跳过 token 校验，无需后端服务器支持

## 安全说明

⚠️ **重要**：此功能仅在开发环境（`NODE_ENV === 'development'`）生效，生产环境会自动禁用。

## 配置文件

配置文件位置：`src/config/local.js`

可以在此文件中添加更多本地开发账号：

```javascript
localAccounts: {
  adminGK: {
    username: 'adminGK',
    name: '本地管理员',
    role: 'admin',
    token: 'local-dev-token-adminGK'
  },
  // 可以添加更多本地账号
  employeeGK: {
    username: 'employeeGK',
    name: '本地员工',
    role: 'employee',
    token: 'local-dev-token-employeeGK'
  }
}
```

## 工作原理

1. **登录时**：检查用户名是否为本地账号，如果是则直接返回本地配置的用户信息
2. **请求时**：如果是本地账号，不添加 Authorization token，而是添加特殊的 header 标识
3. **路由守卫**：本地账号直接放行，不进行 token 校验








