<template>
  <div class="public-layout">
    <div class="topbar">
      <div class="logo-area">
        <span class="brand">七曲山寺庙智能上香</span>
        <span class="divider"></span>
        <span class="subtitle">公开服务</span>
      </div>
      <div class="header-right">
        <el-button type="primary" size="small" plain @click="$router.push('/login')">
          员工/管理员登录
        </el-button>
      </div>
    </div>
    <main class="content">
      <div class="page-inner">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'PublicLayout'
}
</script>

<style scoped>
.public-layout {
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

.content {
  flex: 1;
  /* padding: 20px; */
}

.page-inner {
  max-width: var(--max-width);
}

@media (max-width: 767px) {
  .topbar {
    padding: 0 16px;
  }
  .content {
    padding: 12px;
  }
}
</style>

