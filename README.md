# 七曲山寺庙智能上香系统 - 前端

## 项目说明

这是七曲山寺庙智能上香系统的前端项目，基于Vue2开发。

## 技术栈

- Vue 2.6.14
- Vue Router 3.5.4
- Vuex 3.6.2
- Element UI 2.15.13
- Axios 0.27.2
- Day.js 1.11.7

## 项目结构

```
src/
├── api/              # API接口封装
├── assets/           # 静态资源
├── layouts/          # 布局组件
├── router/           # 路由配置
├── store/            # Vuex状态管理
├── utils/            # 工具函数
└── views/            # 页面组件
    ├── admin/        # 管理员页面
    ├── employee/     # 员工页面
    └── public/       # 游客公开页面
```

## 安装和运行

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run serve
```

访问地址：http://localhost:8081

### 生产环境构建

```bash
npm run build
```

## 功能模块

### 管理员功能
- 岗位管理
- 员工管理
- 位置配置管理
- 座位管理
- 香品管理
- 上香记录查询

### 员工功能
- 办理上香业务
- 搜索游客
- 查看我的记录

### 游客功能
- 查询上香记录
- 查看可用座位

## API配置

API基础地址配置在 `vue.config.js` 中，默认代理到 `http://117.72.123.149:20255`

## 注意事项

1. 所有接口需要JWT Token认证（除公开接口外）
2. Token存储在localStorage中
3. Token过期会自动跳转到登录页
4. 时间格式使用ISO 8601格式


