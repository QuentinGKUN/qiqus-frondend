<template>
  <div class="dashboard">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">数据概览</h1>
        <p class="page-subtitle">实时监控七曲山管理系统核心数据指标</p>
      </div>
      <div class="header-right">
        <el-radio-group v-model="timeRange" size="small" @change="handleTimeRangeChange">
          <el-radio-button label="day">日</el-radio-button>
          <el-radio-button label="month">周</el-radio-button>
          <el-radio-button label="year">月</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- KPI 卡片区域 -->
    <div class="kpi-container">
      <div class="kpi-card-wrapper">
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">今日上香次数</span>
            <div class="kpi-icon incense-icon">
              <i class="el-icon-star-on"></i>
            </div>
          </div>
          <div class="kpi-value">{{ formatNumber(stats.todayRecords) }}</div>
          <div class="kpi-change" :class="stats.recordsChangeClass">
            <i v-if="stats.recordsChangeDirection === 'up'" class="el-icon-arrow-up"></i>
            <i v-else-if="stats.recordsChangeDirection === 'down'" class="el-icon-arrow-down"></i>
            <span>{{ stats.recordsChange || '0%' }} 较{{ stats.comparisonText }}</span>
          </div>
          <div class="kpi-chart">
            <div ref="recordsChart" class="chart-container"></div>
          </div>
        </div>
      </div>
      <div class="kpi-card-wrapper">
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">当前占用位置数</span>
            <div class="kpi-icon position-icon">
              <i class="el-icon-s-grid"></i>
            </div>
          </div>
          <div class="kpi-value">{{ formatNumber(stats.occupiedPositions) }}</div>
          <div class="kpi-change" :class="stats.positionsChangeClass">
            <i v-if="stats.positionsChangeDirection === 'up'" class="el-icon-arrow-up"></i>
            <i v-else-if="stats.positionsChangeDirection === 'down'" class="el-icon-arrow-down"></i>
            <span>{{ stats.positionsChange || '0%' }} 较{{ stats.comparisonText }}</span>
          </div>
          <div class="kpi-chart">
            <div ref="positionsChart" class="chart-container"></div>
          </div>
        </div>
      </div>
      <div class="kpi-card-wrapper">
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">活跃员工数</span>
            <div class="kpi-icon employee-icon">
              <i class="el-icon-user"></i>
            </div>
          </div>
          <div class="kpi-value">{{ formatNumber(stats.activeEmployees) }}</div>
          <div class="kpi-change" :class="stats.employeesChangeClass">
            <i v-if="stats.employeesChangeDirection === 'up'" class="el-icon-arrow-up"></i>
            <i v-else-if="stats.employeesChangeDirection === 'down'" class="el-icon-arrow-down"></i>
            <span>{{ stats.employeesChange || '0%' }} 较{{ stats.comparisonText }}</span>
          </div>
          <div class="kpi-chart">
            <div ref="employeesChart" class="chart-container"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷操作区域（移动端放在图表上方） -->
    <div class="quick-actions">
      <h3 class="actions-title">快捷操作</h3>
      <div class="actions-grid">
        <div class="action-item" @click="$router.push('/admin/posts')">
          <div class="action-icon posts-icon">
            <i class="el-icon-s-custom"></i>
          </div>
          <div class="action-label">岗位管理</div>
        </div>
        <div class="action-item" @click="$router.push('/admin/employees')">
          <div class="action-icon employees-icon">
            <i class="el-icon-user"></i>
          </div>
          <div class="action-label">员工管理</div>
        </div>
        <div class="action-item" @click="$router.push('/admin/position-configs')">
          <div class="action-icon config-icon">
            <i class="el-icon-map-location"></i>
          </div>
          <div class="action-label">位置配置</div>
        </div>
        <div class="action-item" @click="$router.push('/admin/positions')">
          <div class="action-icon positions-icon">
            <i class="el-icon-s-grid"></i>
          </div>
          <div class="action-label">座位管理</div>
        </div>
        <div class="action-item" @click="$router.push('/admin/incense-types')">
          <div class="action-icon incense-types-icon">
            <i class="el-icon-goods"></i>
          </div>
          <div class="action-label">香品管理</div>
        </div>
        <div class="action-item" @click="$router.push('/admin/incense-records')">
          <div class="action-icon records-icon">
            <i class="el-icon-document"></i>
          </div>
          <div class="action-label">上香记录</div>
        </div>
      </div>
    </div>

    <!-- 统计图表区域 -->
    <div class="chart-container-wrapper">
      <div class="chart-card-wrapper">
        <el-card class="chart-card">
          <div slot="header" class="chart-header">
            <span class="chart-title">香品使用统计</span>
            <div class="chart-actions">
              <el-button type="text" icon="el-icon-refresh" @click="refreshIncenseStats"></el-button>
              <el-button type="text" icon="el-icon-download" @click="exportIncenseStats"></el-button>
              <el-button type="text" icon="el-icon-more"></el-button>
            </div>
          </div>
          <div class="chart-content">
            <div v-if="incenseLoading" style="text-align: center; padding: 40px; color: #999;">
              <i class="el-icon-loading" style="font-size: 24px;"></i>
              <p style="margin-top: 10px;">加载中...</p>
            </div>
            <div v-else ref="incenseChart" class="echarts-container"></div>
          </div>
        </el-card>
      </div>
      <div class="chart-card-wrapper">
        <el-card class="chart-card">
          <div slot="header" class="chart-header">
            <span class="chart-title">位置占用分布</span>
            <div class="chart-header-right">
              <el-select 
                v-model="selectedPositionConfig" 
                placeholder="选择位置" 
                size="small" 
                style="width: 150px; margin-right: 8px;"
                @change="handlePositionConfigChange"
              >
                <el-option
                  v-for="config in positionConfigs"
                  :key="config.id"
                  :label="config.name"
                  :value="config.id"
                />
              </el-select>
              <div class="chart-actions">
                <el-button type="text" icon="el-icon-refresh" @click="refreshPositionStats"></el-button>
                <el-button type="text" icon="el-icon-download" @click="exportPositionStats"></el-button>
              </div>
            </div>
          </div>
          <div class="chart-content position-chart-content">
            <div v-if="positionLoading" style="text-align: center; padding: 40px; color: #999;">
              <i class="el-icon-loading" style="font-size: 24px;"></i>
              <p style="margin-top: 10px;">加载中...</p>
            </div>
            <div v-else-if="previewSeatsByRow && Object.keys(previewSeatsByRow).length > 0" class="position-preview-container">
              <SeatPicker
                :seats-by-row="previewSeatsByRow"
                :selected-seat-id="null"
                :disabled-seat-ids="previewDisabledSeatIds"
                :occupied-seat-ids="previewOccupiedSeatIds"
                stage-label="供奉台"
                row-label-prefix="第"
                row-label-suffix="排"
                :show-tooltip="true"
                :legends="[]"
              />
            </div>
            <div v-else style="text-align: center; padding: 40px; color: #999;">
              <p>暂无位置数据</p>
              <p style="font-size: 12px; color: #909399; margin-top: 10px;">
                请选择位置配置查看占用情况
              </p>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { adminApi } from '@/api'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import SeatPicker from '@/components/SeatPicker.vue'

export default {
  name: 'AdminDashboard',
  components: {
    SeatPicker
  },
  data() {
    return {
      timeRange: 'day',
      stats: {
        todayRecords: 0,
        occupiedPositions: 0,
        activeEmployees: 0,
        recordsChange: '0%',
        positionsChange: '0%',
        employeesChange: '0%',
        recordsChangeDirection: 'same',
        positionsChangeDirection: 'same',
        employeesChangeDirection: 'same',
        recordsChangeClass: 'neutral',
        positionsChangeClass: 'neutral',
        employeesChangeClass: 'neutral',
        comparisonText: '昨日',
        periodLabel: '当天'
      },
      incenseStats: [],
      positionStats: [],
      totalUsage: 0,
      positionConfigs: [],
      selectedPositionConfig: null,
      positionLoading: false,
      incenseLoading: false,
      incenseChartInstance: null,
      previewSeatsByRow: null,
      previewDisabledSeatIds: [],
      previewOccupiedSeatIds: []
    }
  },
  mounted() {
    this.loadStats()
    this.loadPositionConfigs()
    this.loadIncenseStats()
  },
  beforeDestroy() {
    if (this.incenseChartInstance) {
      this.incenseChartInstance.dispose()
    }
    if (this._incenseChartResizeHandler) {
      window.removeEventListener('resize', this._incenseChartResizeHandler)
    }
  },
  methods: {
    async loadStats() {
      try {
        // 根据timeRange设置type参数
        // type=day: 当天, type=month: 当周, type=year: 当月
        const params = {
          type: this.timeRange
        }

        const res = await adminApi.statistics.overview(params)
        
        if (res.code === 200 && res.data) {
          const data = res.data
          
          // 处理上香次数
          const incenseCount = data.incense_count || {}
          const incenseChangePercent = incenseCount.change_percent || 0
          const incenseChangeDirection = incenseCount.change_direction || 'same'
          
          // 处理占用位置数
          const occupiedPositions = data.occupied_positions || {}
          const positionsChangePercent = occupiedPositions.change_percent || 0
          const positionsChangeDirection = occupiedPositions.change_direction || 'same'
          
          // 处理活跃员工数
          const activeEmployees = data.active_employees || {}
          const employeesChangePercent = activeEmployees.change_percent || 0
          const employeesChangeDirection = activeEmployees.change_direction || 'same'
          
          // 格式化百分比
          const formatChange = (percent) => {
            if (percent === 0) return '0%'
            const sign = percent > 0 ? '+' : ''
            return `${sign}${percent.toFixed(1)}%`
          }
          
          // 获取变化样式类
          const getChangeClass = (direction) => {
            if (direction === 'up') return 'positive'
            if (direction === 'down') return 'negative'
            return 'neutral'
          }

          // 根据period_label生成比较文本
          let comparisonText = '上一周期'
          const periodLabel = data.period_label || ''
          if (periodLabel === '当天') {
            comparisonText = '昨日'
          } else if (periodLabel === '当周') {
            comparisonText = '上周'
          } else if (periodLabel === '当月') {
            comparisonText = '上月'
          }

          this.stats = {
            todayRecords: incenseCount.value || 0,
            occupiedPositions: occupiedPositions.value || 0,
            activeEmployees: activeEmployees.value || 0,
            recordsChange: formatChange(incenseChangePercent),
            positionsChange: formatChange(positionsChangePercent),
            employeesChange: formatChange(employeesChangePercent),
            recordsChangeDirection: incenseChangeDirection,
            positionsChangeDirection: positionsChangeDirection,
            employeesChangeDirection: employeesChangeDirection,
            recordsChangeClass: getChangeClass(incenseChangeDirection),
            positionsChangeClass: getChangeClass(positionsChangeDirection),
            employeesChangeClass: getChangeClass(employeesChangeDirection),
            comparisonText: comparisonText,
            periodLabel: periodLabel
          }
        } else {
          console.warn('统计数据接口返回错误:', res.message)
          // 设置默认值
          this.stats = {
            ...this.stats,
            comparisonText: this.timeRange === 'day' ? '昨日' : this.timeRange === 'month' ? '上周' : '上月'
          }
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
        // 设置默认值
        this.stats = {
          ...this.stats,
          comparisonText: this.timeRange === 'day' ? '昨日' : this.timeRange === 'month' ? '上周' : '上月'
        }
      }
    },
    async loadPositionConfigs() {
      try {
        const res = await adminApi.positionConfigs.list({ status: 1 })
        if (res.code === 200) {
          this.positionConfigs = res.data || []
          if (this.positionConfigs.length > 0) {
            this.selectedPositionConfig = this.positionConfigs[0].id
            this.loadPositionStats()
          }
        }
      } catch (error) {
        console.error('加载位置配置失败:', error)
      }
    },
    async loadIncenseStats() {
      this.incenseLoading = true
      try {
        const res = await adminApi.incenseTypes.statistics()
        if (res.code === 200) {
          // 处理数据格式，确保是数组
          let data = res.data
          if (!Array.isArray(data)) {
            // 如果返回的是对象，尝试提取数组
            if (data && data.list) {
              data = data.list
            } else if (data && Array.isArray(data.data)) {
              data = data.data
            } else {
              data = []
            }
          }
          this.incenseStats = data || []
          this.totalUsage = this.incenseStats.reduce((sum, item) => sum + (item.usage_count || 0), 0)
        } else {
          console.warn('香品统计接口返回错误:', res.message)
          this.incenseStats = []
        }
      } catch (error) {
        console.error('加载香品统计失败:', error)
        this.incenseStats = []
      } finally {
        this.incenseLoading = false
        // 在loading结束后，确保容器已渲染，再初始化图表
        this.$nextTick(() => {
          // 使用setTimeout确保DOM完全渲染
          setTimeout(() => {
            this.initIncenseChart()
          }, 100)
        })
      }
    },
    async loadPositionStats() {
      if (!this.selectedPositionConfig) {
        return
      }
      
      this.positionLoading = true
      this.previewSeatsByRow = null
      this.previewDisabledSeatIds = []
      this.previewOccupiedSeatIds = []
      
      try {
        // 计算当前时间到后一个小时的时间段
        const now = dayjs()
        const startTime = now.format('YYYY-MM-DDTHH:mm:00Z')
        const endTime = now.add(1, 'hour').format('YYYY-MM-DDTHH:mm:00Z')
        
        // 调用getByConfig接口，传入时间段参数
        const previewRes = await adminApi.positions.getByConfig(this.selectedPositionConfig, {
          start_time: startTime,
          end_time: endTime
        })
        
        if (previewRes.code === 200) {
          const seatsByRow = previewRes.data.seats_by_row || {}
          // 确保行号是字符串格式（SeatPicker 组件需要字符串键）
          const normalizedSeatsByRow = {}
          Object.keys(seatsByRow).forEach(key => {
            const rowKey = String(key)
            normalizedSeatsByRow[rowKey] = seatsByRow[key] || []
          })
          this.previewSeatsByRow = normalizedSeatsByRow
          
          // 提取不可用的上香位置ID（status !== 1）
          Object.values(this.previewSeatsByRow).forEach(seats => {
            if (Array.isArray(seats)) {
              seats.forEach(seat => {
                if (seat && seat.status !== 1) {
                  this.previewDisabledSeatIds.push(seat.id)
                }
              })
            }
          })
          
          // 查询该时间段内的占用情况，获取已占用的位置ID
          try {
            const recordsRes = await adminApi.incenseRecords.list({
              start_date: now.format('YYYY-MM-DD'),
              end_date: now.format('YYYY-MM-DD'),
              page_size: 1000
            })
            
            if (recordsRes.code === 200) {
              const records = recordsRes.data?.list || []
              const occupiedPositionIds = new Set()
              
              // 获取所有位置ID
              const allPositionIds = new Set()
              Object.values(this.previewSeatsByRow).forEach(seats => {
                if (Array.isArray(seats)) {
                  seats.forEach(seat => {
                    if (seat && seat.id) {
                      allPositionIds.add(seat.id)
                    }
                  })
                }
              })
              
              // 筛选出在当前时间段内且属于该位置配置的记录
              records.forEach(record => {
                const recordStart = dayjs(record.start_time)
                const recordEnd = dayjs(record.end_time)
                const nowTime = dayjs()
                const nextHour = nowTime.add(1, 'hour')
                
                // 判断记录是否与当前时间段有重叠
                if (recordStart.isBefore(nextHour) && recordEnd.isAfter(nowTime)) {
                  if (allPositionIds.has(record.position_id)) {
                    occupiedPositionIds.add(record.position_id)
                  }
                }
              })
              
              this.previewOccupiedSeatIds = Array.from(occupiedPositionIds)
            }
          } catch (error) {
            console.error('查询占用记录失败:', error)
          }
        } else {
          console.warn('预览数据加载失败:', previewRes.message)
          this.previewSeatsByRow = {}
        }
      } catch (error) {
        console.error('加载位置统计失败:', error)
        this.previewSeatsByRow = {}
      } finally {
        this.positionLoading = false
      }
    },
    handlePositionConfigChange() {
      this.loadPositionStats()
    },
    initIncenseChart() {
      if (!this.$refs.incenseChart) {
        console.warn('echarts容器不存在')
        return
      }
      
      if (this.incenseStats.length === 0) {
        console.warn('统计数据为空')
        return
      }
      
      // 检查容器是否有尺寸
      const container = this.$refs.incenseChart
      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        console.warn('echarts容器尺寸为0，延迟初始化')
        setTimeout(() => {
          this.initIncenseChart()
        }, 200)
        return
      }
      
      if (this.incenseChartInstance) {
        this.incenseChartInstance.dispose()
      }
      
      try {
        this.incenseChartInstance = echarts.init(this.$refs.incenseChart)
        
        const names = this.incenseStats.map(item => item.name || '未知')
        const values = this.incenseStats.map(item => item.usage_count || 0)
        
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: names,
            axisLabel: {
              rotate: names.some(n => n.length > 4) ? 45 : 0,
              interval: 0
            }
          },
          yAxis: {
            type: 'value',
            name: '使用次数'
          },
          series: [{
            name: '使用次数',
            type: 'bar',
            data: values,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#8b572a' },
                { offset: 1, color: '#a66a35' }
              ])
            },
            label: {
              show: true,
              position: 'top'
            }
          }]
        }
        
        this.incenseChartInstance.setOption(option)
        
        // 响应式调整
        const resizeHandler = () => {
          if (this.incenseChartInstance) {
            this.incenseChartInstance.resize()
          }
        }
        window.addEventListener('resize', resizeHandler)
        
        // 保存resize handler以便清理
        this._incenseChartResizeHandler = resizeHandler
      } catch (error) {
        console.error('初始化echarts失败:', error)
      }
    },
    formatNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    handleTimeRangeChange() {
      // 根据时间范围重新加载数据
      this.loadStats()
    },
    refreshIncenseStats() {
      this.loadIncenseStats()
      this.$message.success('已刷新')
    },
    refreshPositionStats() {
      this.loadPositionStats()
      this.$message.success('已刷新')
    },
    exportIncenseStats() {
      this.$message.info('导出功能开发中')
    },
    exportPositionStats() {
      this.$message.info('导出功能开发中')
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 24px;
  background: var(--color-bg);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--color-text);
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: var(--color-muted);
  margin: 0;
}

.kpi-container {
  display: flex;
  gap: 1.25rem; /* 20px */
  width: 100%;
  margin-bottom: 1.5rem; /* 24px */
  flex-wrap: wrap;
}

.kpi-card-wrapper {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.kpi-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-light);
  transition: transform 0.3s, box-shadow 0.3s;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.kpi-label {
  font-size: 14px;
  color: var(--color-muted);
}

.kpi-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
}

.incense-icon {
  background: linear-gradient(135deg, #8b572a 0%, #a66a35 100%);
}

.position-icon {
  background: linear-gradient(135deg, #d4a574 0%, #c8966a 100%);
}

.employee-icon {
  background: linear-gradient(135deg, #f5a623 0%, #e6961f 100%);
}

.kpi-value {
  font-size: 32px;
  font-weight: bold;
  color: var(--color-text);
  margin-bottom: 8px;
}

.kpi-change {
  font-size: 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.kpi-change.positive {
  color: #67C23A;
}

.kpi-change.negative {
  color: #F56C6C;
}

.kpi-change.neutral {
  color: var(--color-muted);
}

.kpi-chart {
  height: 30px;
  margin-top: 8px;
}

.chart-container {
  width: 100%;
  height: 100%;
}

.chart-container-wrapper {
  display: flex;
  gap: 1.25rem; /* 20px */
  width: 100%;
  margin-bottom: 1.5rem; /* 24px */
  flex-wrap: wrap;
}

.chart-card-wrapper {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.chart-card {
  height: 100%;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header-right {
  display: flex;
  align-items: center;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.chart-actions {
  display: flex;
  gap: 4px;
}

.chart-content {
  min-height: 300px;

}

.echarts-container {
  width: 100%;
  height: 300px;
}

.chart-content {
  min-height: 300px;
}

.position-chart-content {
  min-height: 300px;
  max-height: 300px;
  overflow-y: auto;
}

.position-preview-container {
  height: 100%;
}

.quick-actions {
  margin: 32px 0;
}

.actions-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 16px;
}

.actions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem; /* 16px */
  width: 100%;
}

.action-item {
  flex: 1;
   /* 33.333% - 16px gap / 3 */
  max-width: calc(33.333% - 0.667rem);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: var(--shadow-light);
  cursor: pointer;
  transition: all 0.3s;
}

.action-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  margin-bottom: 12px;
}

.posts-icon {
  background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
}

.employees-icon {
  background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
}

.config-icon {
  background: linear-gradient(135deg, #E6A23C 0%, #ebb563 100%);
}

.positions-icon {
  background: linear-gradient(135deg, #909399 0%, #a6a9ad 100%);
}

.incense-types-icon {
  background: linear-gradient(135deg, #8b572a 0%, #a66a35 100%);
}

.records-icon {
  background: linear-gradient(135deg, #F56C6C 0%, #f78989 100%);
}

.action-label {
  font-size: 14px;
  color: var(--color-text);
  text-align: center;
}

/* 平板适配 */
@media (min-width: 769px) and (max-width: 992px) {
  .kpi-card-wrapper {
    width: calc(50% - 0.625rem); /* 50% - 10px gap */
  }

  .kpi-card-wrapper:last-child {
    width: 100%;
  }

  .chart-card-wrapper {
    width: 100%;
  }
}

/* 桌面端：三个卡片等宽 */
@media (min-width: 993px) {
  .kpi-card-wrapper {
    width: calc(33.333% - 0.833rem); /* 33.333% - 20px gap / 3 */
  }

  .chart-card-wrapper {
    width: calc(50% - 0.625rem); /* 50% - 10px gap */
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem; /* 16px */
  }

  .page-header {
    flex-direction: column;
    gap: 1rem; /* 16px */
  }

  .header-right {
    width: 100%;
  }

  .page-title {
    font-size: 1.25rem; /* 20px */
  }

  .page-subtitle {
    font-size: 0.8125rem; /* 13px */
  }

  /* 移动端KPI卡片横向滚动 */
  .kpi-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    flex-wrap: nowrap;
  }

  .kpi-card-wrapper {
    flex: 0 0 17.5rem; /* 280px */
    max-width: 17.5rem; /* 280px */
    width: auto;
  }

  .kpi-card {
    min-width: 16.25rem; /* 260px */
    padding: 1rem; /* 16px */
  }

  .kpi-value {
    font-size: 1.75rem; /* 28px */
  }

  .kpi-label {
    font-size: 0.8125rem; /* 13px */
  }

  .kpi-change {
    font-size: 0.75rem; /* 12px */
  }

  /* 快捷操作上移，在图表之前 */
  .quick-actions {
    order: -1;
    margin-top: 0;
    margin-bottom: 1.5rem; /* 24px */
  }

  .actions-title {
    font-size: 1rem; /* 16px */
    margin-bottom: 1rem; /* 16px */
  }

  .actions-grid {
    gap: 0.75rem; /* 12px */
  }

  .action-item {
    max-width: calc(33.333% - 0.5rem);
    padding: 1rem; /* 16px */
  }

  .action-icon {
    width: 2.5rem; /* 40px */
    height: 2.5rem; /* 40px */
    font-size: 1.25rem; /* 20px */
    margin-bottom: 0.5rem; /* 8px */
  }

  .action-label {
    font-size: 0.75rem; /* 12px */
  }

  /* 图表区域移动端全宽 */
  .chart-container-wrapper {
    flex-direction: column;
  }

  .chart-card-wrapper {
    width: 100%;
    margin-bottom: 1rem; /* 16px */
  }

  .chart-card-wrapper:last-child {
    margin-bottom: 0;
  }

  .chart-title {
    font-size: 0.9375rem; /* 15px */
  }

  .chart-content {
    min-height: 18.75rem; /* 300px */
    padding: 1rem 0; /* 16px 0 */
    padding-top:0;
  }

  .position-chart-content {
    min-height: 18.75rem; /* 300px */
    max-height: 18.75rem; /* 300px */
  }
}
</style>
