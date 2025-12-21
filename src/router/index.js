import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import { shouldSkipTokenCheck } from '@/config/local'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '管理后台' }
      },
      {
        path: 'posts',
        name: 'AdminPosts',
        component: () => import('@/views/admin/Posts.vue'),
        meta: { title: '岗位管理' }
      },
      {
        path: 'employees',
        name: 'AdminEmployees',
        component: () => import('@/views/admin/Employees.vue'),
        meta: { title: '员工管理' }
      },
      {
        path: 'position-configs',
        name: 'AdminPositionConfigs',
        component: () => import('@/views/admin/PositionConfigs.vue'),
        meta: { title: '位置配置管理' }
      },
      {
        path: 'positions',
        name: 'AdminPositions',
        component: () => import('@/views/admin/Positions.vue'),
        meta: { title: '座位管理' }
      },
      {
        path: 'incense-types',
        name: 'AdminIncenseTypes',
        component: () => import('@/views/admin/IncenseTypes.vue'),
        meta: { title: '香品管理' }
      },
      {
        path: 'incense-records',
        name: 'AdminIncenseRecords',
        component: () => import('@/views/admin/IncenseRecords.vue'),
        meta: { title: '上香记录查询' }
      }
    ]
  },
  {
    path: '/employee',
    component: () => import('@/layouts/EmployeeLayout.vue'),
    meta: { requiresAuth: true, role: 'employee' },
    children: [
      {
        path: 'dashboard',
        name: 'EmployeeDashboard',
        component: () => import('@/views/employee/Dashboard.vue'),
        meta: { title: '员工工作台' }
      },
      {
        path: 'incense-records',
        name: 'EmployeeIncenseRecords',
        component: () => import('@/views/employee/IncenseRecords.vue'),
        meta: { title: '上香记录管理' }
      },
      {
        path: 'my-records',
        name: 'EmployeeMyRecords',
        component: () => import('@/views/employee/MyRecords.vue'),
        meta: { title: '我的记录' }
      }
    ]
  },
  {
    path: '/public',
    component: () => import('@/layouts/PublicLayout.vue'),
    children: [
      {
        path: 'records',
        name: 'PublicRecords',
        component: () => import('@/views/public/Records.vue'),
        meta: { title: '查询上香记录' }
      },
      {
        path: 'positions',
        name: 'PublicPositions',
        component: () => import('@/views/public/Positions.vue'),
        meta: { title: '查看可用座位' }
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  try {
    const isAuthenticated = store.getters['user/isAuthenticated']
    const role = store.getters['user/role']
    const userInfo = store.getters['user/userInfo']
    const username = userInfo?.username
    
    // 设置页面标题
    if (to.meta.title) {
      document.title = `${to.meta.title} - 七曲山寺庙智能上香系统`
    }
    
    // 本地开发账号特殊处理：直接放行
    if (username && shouldSkipTokenCheck(username)) {
      // 本地开发账号，直接允许访问
      if (to.path === '/login') {
        // 如果访问登录页，重定向到对应首页
        if (role === 'admin') {
          next('/admin/dashboard')
        } else if (role === 'employee') {
          next('/employee/dashboard')
        } else {
          next()
        }
      } else {
        next()
      }
      return
    }
    
    // 需要认证的路由
    if (to.meta.requiresAuth) {
      if (!isAuthenticated) {
        // 避免重复导航到登录页
        if (to.path !== '/login') {
          next('/login')
        } else {
          next()
        }
      } else if (to.meta.role && to.meta.role !== role) {
        // 角色不匹配，重定向到对应角色的首页
        if (role === 'admin') {
          next('/admin/dashboard')
        } else if (role === 'employee') {
          next('/employee/dashboard')
        } else {
          next('/login')
        }
      } else {
        next()
      }
    } else {
      // 已登录用户访问登录页，重定向到对应首页
      if (to.path === '/login' && isAuthenticated) {
        if (role === 'admin') {
          next('/admin/dashboard')
        } else if (role === 'employee') {
          next('/employee/dashboard')
        } else {
          next()
        }
      } else {
        next()
      }
    }
  } catch (err) {
    // 捕获路由导航错误，避免重复导航
    if (err.name !== 'NavigationDuplicated') {
      console.error('路由错误:', err)
    }
    next(false)
  }
})

export default router

