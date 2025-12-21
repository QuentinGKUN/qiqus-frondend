<template>
  <div class="employee-layout">
    <div class="topbar">
      <div class="logo-area">
        <span class="brand">七曲山管理系统</span>
        <span class="divider"></span>
        <span class="subtitle">员工工作台</span>
      </div>
      <div class="header-right">
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

export default {
  name: 'EmployeeLayout',
  computed: {
    ...mapGetters('user', ['userInfo']),
    activeMenu() {
      return this.$route.path
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
</style>

