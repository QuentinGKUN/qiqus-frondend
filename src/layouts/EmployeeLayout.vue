<template>
  <div class="employee-layout">
    <div class="topbar">
      <div class="logo-area">
        <span class="brand">七曲山管理系统</span>
        <span class="divider"></span>
        <span class="subtitle">员工工作台</span>
      </div>
      <div class="header-right">
        <!-- 通知栏 -->
        <el-popover
          placement="bottom-end"
          width="400"
          trigger="click"
          v-model="notificationVisible"
          popper-class="expired-records-popover"
        >
          <div class="notification-content">
            <div class="notification-header">
              <span class="notification-title">到期记录通知</span>
              <span class="notification-count">共 {{ expiredCount }} 条</span>
            </div>
            <div v-if="expiredRecords.length > 0" class="notification-list">
              <div
                v-for="record in expiredRecords"
                :key="record.id"
                class="notification-item"
                @click="handleViewRecord(record)"
              >
                <div class="record-info">
                  <div class="record-main">
                    <span class="tourist-name">{{ record.tourist?.name || '未填写' }}</span>
                    <span class="incense-type">{{ record.incense_type?.name || '-' }}</span>
                  </div>
                  <div class="record-meta">
                    <span class="position">{{ record.position_path || (record.incense_type?.type === 'banner' ? '锦旗' : '-') }}</span>
                    <span class="end-time">{{ formatEndTime(record.end_time) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="notification-empty">
              <p>暂无到期记录</p>
            </div>
            <div class="notification-footer" v-if="expiredCount > 5">
              <el-button type="text" size="small" @click="handleViewMore">查看更多</el-button>
            </div>
          </div>
          <el-badge :value="expiredCount" :hidden="expiredCount === 0" :max="99" slot="reference" class="notification-badge">
            <el-button type="text" class="notification-icon" icon="el-icon-bell"></el-button>
          </el-badge>
        </el-popover>
        <span class="user-info">
          <i class="el-icon-user"></i>
          <span class="user-name">{{ userInfo?.name || userInfo?.username }}</span>
          <span v-if="userInfo?.post" class="post-name">
            ({{ userInfo.post.name }})
          </span>
        </span>
        <el-button type="primary" size="mini" plain @click="handleLogout">退出</el-button>
      </div>
    </div>
    <!-- 移动端横向导航 -->
    <div class="mobile-nav">
      <el-menu
        :default-active="activeMenu"
        router
        mode="horizontal"
        background-color="transparent"
        text-color="var(--color-text)"
        active-text-color="var(--color-primary)"
        class="mobile-menu"
      >
        <el-menu-item index="/employee/dashboard">
          <i class="el-icon-s-home"></i>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/employee/incense-records">
          <i class="el-icon-plus"></i>
          <span>办理上香</span>
        </el-menu-item>
        <el-menu-item index="/employee/my-records">
          <i class="el-icon-document"></i>
          <span>我的记录</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="layout-body">
      <aside class="sider">
        <el-menu
          :default-active="activeMenu"
          router
          background-color="transparent"
          text-color="var(--color-text)"
          active-text-color="var(--color-primary)"
          class="sider-menu"
        >
          <el-menu-item index="/employee/dashboard">
            <i class="el-icon-s-home"></i>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/employee/incense-records">
            <i class="el-icon-plus"></i>
            <span>办理上香</span>
          </el-menu-item>
          <el-menu-item index="/employee/my-records">
            <i class="el-icon-document"></i>
            <span>我的记录</span>
          </el-menu-item>
        </el-menu>
      </aside>
      <main class="content">
        <div class="page-inner">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { employeeApi } from '@/api'
import dayjs from 'dayjs'

export default {
  name: 'EmployeeLayout',
  data() {
    return {
      notificationVisible: false,
      expiredCount: 0,
      expiredRecords: [],
      refreshTimer: null
    }
  },
  computed: {
    ...mapGetters('user', ['userInfo']),
    activeMenu() {
      return this.$route.path
    }
  },
  mounted() {
    this.loadExpiredCount()
    this.loadExpiredRecords()
    // 每5分钟刷新一次
    this.refreshTimer = setInterval(() => {
      this.loadExpiredCount()
      if (this.notificationVisible) {
        this.loadExpiredRecords()
      }
    }, 5 * 60 * 1000)
  },
  beforeDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
  },
  watch: {
    notificationVisible(newVal) {
      if (newVal) {
        this.loadExpiredRecords()
      }
    }
  },
  methods: {
    ...mapActions('user', ['logout']),
    handleLogout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.logout()
        this.$router.push('/login')
      }).catch(() => {
        // 用户取消操作，无需处理
      })
    },
    // 加载到期记录数量
    async loadExpiredCount() {
      try {
        const res = await employeeApi.incenseRecords.myExpired({
          page: 1,
          page_size: 1
        })
        if (res.code === 200) {
          this.expiredCount = res.data?.total || 0
        }
      } catch (error) {
        console.error('加载到期记录数量失败:', error)
      }
    },
    // 加载到期记录列表（前5条）
    async loadExpiredRecords() {
      try {
        const res = await employeeApi.incenseRecords.myExpired({
          page: 1,
          page_size: 5
        })
        if (res.code === 200) {
          this.expiredRecords = res.data?.list || []
        }
      } catch (error) {
        console.error('加载到期记录列表失败:', error)
      }
    },
    // 格式化结束时间
    formatEndTime(endTime) {
      if (!endTime) return '-'
      const d = dayjs(endTime)
      if (!d.isValid()) return '-'
      return d.format('MM-DD HH:mm')
    },
    // 查看单条记录详情
    handleViewRecord(record) {
      this.notificationVisible = false
      this.$router.push({
        path: '/employee/expired-records',
        query: { id: record.id }
      })
    },
    // 查看更多
    handleViewMore() {
      this.notificationVisible = false
      this.$router.push('/employee/expired-records')
    }
  }
}
</script>

<style scoped>
.employee-layout {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: var(--shadow-light);
  position: sticky;
  top: 0;
  z-index: 10;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: var(--color-primary);
}

.brand {
  font-size: 18px;
}

.subtitle {
  color: var(--color-muted);
  font-size: 14px;
}

.divider {
  width: 1px;
  height: 18px;
  background: var(--color-border);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text);
  white-space: nowrap;
}

.user-name {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-name {
  font-size: 12px;
  color: var(--color-muted);
  white-space: nowrap;
}

.mobile-nav {
  display: none;
}

.layout-body {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow-x: auto;
}

.sider {
  width: 220px;
  min-width: 190px;
  background: #f0eadf;
  border-right: 1px solid var(--color-border);
  padding: 12px 8px;
}

.sider-menu {
  border-right: none;
  background: transparent;
}

.sider-menu ::v-deep(.el-menu-item.is-active) {
  background: rgba(139, 87, 42, 0.1);
  border-radius: 10px;
}

.content {
  flex: 1;
  /* padding: 20px 20px; */
}

.page-inner {
  max-width: var(--max-width);
}

@media (max-width: 992px) {
  .sider {
    display: none;
  }
  
  .mobile-nav {
    display: block;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: var(--shadow-light);
    position: sticky;
    /* top: 64px; */
    z-index: 9;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
  }
  
  .mobile-menu {
    border-bottom: none;
    white-space: nowrap;
    min-width: max-content;
  }
  
  .mobile-menu ::v-deep(.el-menu-item) {
    padding: 0 16px !important;
    font-size: 14px;
  }
  
  .mobile-menu ::v-deep(.el-menu-item span) {
    margin-left: 4px;
  }
  
  .content {
    /* padding: 16px; */
  }
  
  .topbar {
    padding: 0 12px;
    height: auto;
    min-height: 56px;
    flex-wrap: wrap;
  }
  
  .logo-area {
    flex: 1;
    min-width: 0;
  }
  
  .brand {
    font-size: 16px;
  }
  
  .subtitle {
    font-size: 12px;
  }
  
  .header-right {
    flex-shrink: 0;
    gap: 8px;
  }
  
  .user-info {
    font-size: 13px;
  }
  
  .user-name {
    max-width: 60px;
  }
  
  .post-name {
    font-size: 11px;
    max-width: 50px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .header-right .el-button {
    padding: 5px 10px;
    font-size: 12px;
  }
}

.notification-badge {
  margin-right: 8px;
}

.notification-icon {
  font-size: 20px;
  color: var(--color-text);
  padding: 0;
}

.notification-content {
  max-height: 500px;
  overflow-y: auto;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 8px;
}

.notification-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text);
}

.notification-count {
  font-size: 12px;
  color: var(--color-muted);
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f5f5f5;
}

.notification-item:last-child {
  border-bottom: none;
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.record-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tourist-name {
  font-weight: 500;
  color: var(--color-text);
  font-size: 14px;
}

.incense-type {
  font-size: 12px;
  color: var(--color-primary);
  background: rgba(139, 87, 42, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}

.record-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--color-muted);
}

.position {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.end-time {
  margin-left: 8px;
  color: #f56c6c;
}

.notification-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-muted);
}

.notification-footer {
  text-align: center;
  padding: 12px 0;
  border-top: 1px solid var(--color-border);
  margin-top: 8px;
}
</style>

