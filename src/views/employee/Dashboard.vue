<template>
  <div class="dashboard">
    <el-card>
      <div slot="header">
        <span>欢迎，{{ userInfo?.name || userInfo?.username }}</span>
      </div>
      <div class="cards-container">
        <div class="stat-card-wrapper">
          <el-card class="stat-card" @click.native="$router.push('/employee/incense-records')">
            <div class="stat-content">
              <div class="stat-icon" style="background: #409EFF;">
                <i class="el-icon-plus"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">办理上香</div>
                <div class="stat-label">为游客办理上香业务</div>
              </div>
            </div>
          </el-card>
        </div>
        <div class="stat-card-wrapper">
          <el-card class="stat-card" @click.native="$router.push('/employee/my-records')">
            <div class="stat-content">
              <div class="stat-icon" style="background: #67C23A;">
                <i class="el-icon-document"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">我的记录</div>
                <div class="stat-label">查看我办理的所有记录</div>
              </div>
            </div>
          </el-card>
        </div>
        <div class="stat-card-wrapper">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: #E6A23C;">
                <i class="el-icon-user"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ myRecordsCount || 0 }}</div>
                <div class="stat-label">今日办理记录数</div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { employeeApi } from '@/api'

export default {
  name: 'EmployeeDashboard',
  data() {
    return {
      myRecordsCount: 0
    }
  },
  computed: {
    ...mapGetters('user', ['userInfo'])
  },
  mounted() {
    this.loadTodayRecords()
  },
  methods: {
    async loadTodayRecords() {
      try {
        // 使用新的count接口，不传date参数则默认查询今天
        const res = await employeeApi.incenseRecords.myCount()
        if (res.code === 200) {
          this.myRecordsCount = res.data?.count || 0
        }
      } catch (error) {
        console.error('加载今日记录失败:', error)
        this.myRecordsCount = 0
      }
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 1.25rem; /* 20px */
  width: 100%;
  box-sizing: border-box;
}

.cards-container {
  display: flex;
  gap: 1.25rem; /* 20px */
  width: 100%;
  flex-wrap: wrap;
}

.stat-card-wrapper {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.stat-icon {
  width: 3.75rem; /* 60px */
  height: 3.75rem; /* 60px */
  min-width: 3.75rem;
  flex-shrink: 0;
  border-radius: 0.5rem; /* 8px */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.5rem; /* 24px */
  margin-right: 0.9375rem; /* 15px */
}

.stat-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.stat-value {
  font-size: 1.25rem; /* 20px */
  font-weight: bold;
  color: #333;
  margin-bottom: 0.3125rem; /* 5px */
  word-break: break-word;
}

.stat-label {
  font-size: 0.875rem; /* 14px */
  color: #999;
  word-break: break-word;
  line-height: 1.4;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .dashboard {
    padding: 1rem; /* 16px */
  }

  .cards-container {
    flex-direction: column;
    gap: 1rem; /* 16px */
  }

  .stat-card-wrapper {
    width: 100%;
  }

  .stat-content {
    padding: 0.5rem 0;
  }

  .stat-icon {
    width: 3rem; /* 48px */
    height: 3rem; /* 48px */
    min-width: 3rem;
    font-size: 1.25rem; /* 20px */
    margin-right: 0.75rem; /* 12px */
  }

  .stat-value {
    font-size: 1.125rem; /* 18px */
  }

  .stat-label {
    font-size: 0.8125rem; /* 13px */
  }
}

/* 平板适配 */
@media (min-width: 769px) and (max-width: 992px) {
  .stat-card-wrapper {
    width: calc(50% - 0.625rem); /* 50% - 10px gap */
  }

  .cards-container {
    flex-wrap: wrap;
  }

  .stat-card-wrapper:last-child {
    width: 100%;
  }
}

/* 桌面端：三个卡片等宽 */
@media (min-width: 993px) {
  .stat-card-wrapper {
    width: calc(33.333% - 0.833rem); /* 33.333% - 20px gap / 3 */
  }
}
</style>


