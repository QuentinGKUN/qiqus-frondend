<template>
  <div class="page-container">
    <div class="card-container">
      <div class="table-header">
        <h3>查看可用上香位置</h3>
      </div>

      <el-form :inline="true" style="margin-bottom: 20px;" >
        <el-form-item label="位置配置">
          <el-select v-model="selectedConfigId" placeholder="请选择位置配置" @change="handleConfigChange">
            <el-option
              v-for="config in configs"
              :key="config.id"
              :label="config.name"
              :value="config.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <div v-if="selectedConfigId && seatsByRow" class="seat-layout">
        <div v-for="(seats, row) in seatsByRow" :key="row" class="seat-row">
          <div class="row-label">第{{ row }}行</div>
          <div class="seat-items">
            <div
              v-for="seat in seats"
              :key="seat.id"
              :class="['seat-item', getSeatClass(seat)]"
            >
              {{ seat.name }}
            </div>
          </div>
        </div>
      </div>
      <div v-else style="text-align: center; padding: 40px; color: #999;">
        请先选择位置配置
      </div>
    </div>
  </div>
</template>

<script>
import { publicApi, adminApi } from '@/api'

export default {
  name: 'PublicPositions',
  data() {
    return {
      configs: [],
      selectedConfigId: null,
      seatsByRow: null,
      availableSeats: []
    }
  },
  mounted() {
    this.loadConfigs()
  },
  methods: {
    async loadConfigs() {
      try {
        const res = await adminApi.positionConfigs.list({ status: 1 })
        if (res.code === 200) {
          this.configs = res.data || []
        }
      } catch (error) {
        console.error('加载位置配置失败:', error)
      }
    },
    async handleConfigChange() {
      if (!this.selectedConfigId) return
      try {
        // 加载可用座位
        const [configRes, availableRes] = await Promise.all([
          adminApi.positions.getByConfig(this.selectedConfigId),
          publicApi.availablePositions({ position_config_id: this.selectedConfigId })
        ])
        if (configRes.code === 200) {
          this.seatsByRow = configRes.data.seats_by_row || {}
        }
        if (availableRes.code === 200) {
          this.availableSeats = (availableRes.data || []).map(s => s.id)
        }
      } catch (error) {
        console.error('加载上香位置失败:', error)
      }
    },
    getSeatClass(seat) {
      if (seat.status !== 1) return 'seat-disabled'
      if (this.availableSeats.includes(seat.id)) {
        return 'seat-available'
      }
      return 'seat-occupied'
    }
  }
}
</script>

<style scoped>
.seat-layout {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 4px;
  background: #f9f9f9;
}

.seat-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.row-label {
  width: 80px;
  font-weight: bold;
  text-align: center;
}

.seat-items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  flex: 1;
}

.seat-item {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-weight: bold;
}

.seat-available {
  background: #67C23A;
  color: #fff;
  border-color: #67C23A;
}

.seat-occupied {
  background: #F56C6C;
  color: #fff;
  border-color: #F56C6C;
}

.seat-disabled {
  background: #C0C4CC;
  color: #fff;
  border-color: #C0C4CC;
}
</style>


