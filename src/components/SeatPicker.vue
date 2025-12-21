<template>
  <div class="seat-picker-container">
    <!-- 缩放控制栏 -->
    <div class="zoom-controls">
      <el-button-group>
        <el-button size="mini" icon="el-icon-zoom-out" @click="zoomOut" :disabled="zoomLevel <= minZoom"></el-button>
        <el-button size="mini" @click="resetZoom">{{ Math.round(zoomLevel * 100) }}%</el-button>
        <el-button size="mini" icon="el-icon-zoom-in" @click="zoomIn" :disabled="zoomLevel >= maxZoom"></el-button>
      </el-button-group>
    </div>
    
    <!-- 舞台/屏幕区域 -->
    <div class="stage-area">
      <div class="stage-label">{{ stageLabel }}</div>
    </div>
    
    <!-- 上香位置区域 -->
    <div class="seat-layout-container" :style="{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }">
      <div v-for="(seats, row) in normalizedSeatsByRow" :key="row" class="seat-row">
        <div class="row-label">{{ rowLabelPrefix }}{{ row }}{{ rowLabelSuffix }}</div>
        <div class="seat-items">
          <div
            v-for="seat in seats"
            :key="seat.id || `seat-${row}-${seat.col || seat.name}`"
            :class="['seat-item', getSeatClass(seat)]"
            @click="handleSeatClick(seat)"
            @mouseenter="handleSeatHover(seat)"
            @mouseleave="handleSeatLeave"
          >
            <span class="seat-number">{{ seat.name || `${row}-${seat.col || ''}` }}</span>
            <div v-if="hoveredSeat && hoveredSeat.id === seat.id" class="seat-tooltip">
              {{ seat.name || `${rowLabelPrefix}${row}${rowLabelSuffix} 第${seat.col || ''}个` }}
            </div>
          </div>
        </div>
      </div>
      <div v-if="Object.keys(normalizedSeatsByRow).length === 0" class="empty-seats">
        暂无座位数据
      </div>
    </div>
    
    <!-- 图例说明 -->
    <div class="seat-legend" v-if="legends && legends.length > 0">
      <div class="legend-item" v-for="legend in legends" :key="legend.type">
        <span :class="['legend-seat', `seat-${legend.type}`]"></span>
        <span>{{ legend.label }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SeatPicker',
  props: {
    // 上香位置数据，格式：{ row1: [position1, position2, ...], row2: [...] }
    seatsByRow: {
      type: Object,
      required: true,
      default: () => ({})
    },
    // 已选中的上香位置ID
    selectedSeatId: {
      type: [Number, String],
      default: null
    },
    // 不可用的上香位置ID列表
    disabledSeatIds: {
      type: Array,
      default: () => []
    },
    // 已占用的上香位置ID列表
    occupiedSeatIds: {
      type: Array,
      default: () => []
    },
    // 舞台/屏幕标签文字
    stageLabel: {
      type: String,
      default: '供奉台'
    },
    // 行号前缀
    rowLabelPrefix: {
      type: String,
      default: '第'
    },
    // 行号后缀
    rowLabelSuffix: {
      type: String,
      default: '排'
    },
    // 自定义图例
    legends: {
      type: Array,
      default: () => [
        { type: 'available', label: '可选' },
        { type: 'selected', label: '已选' },
        { type: 'occupied', label: '已占用' },
        { type: 'disabled', label: '不可用' }
      ]
    },
    // 是否显示工具提示
    showTooltip: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      hoveredSeat: null,
      zoomLevel: 1,
      minZoom: 0.5,
      maxZoom: 2,
      zoomStep: 0.1
    }
  },
  computed: {
    // 规范化 seatsByRow，确保行号是字符串格式
    normalizedSeatsByRow() {
      if (!this.seatsByRow || typeof this.seatsByRow !== 'object') {
        return {}
      }
      const normalized = {}
      Object.keys(this.seatsByRow).forEach(key => {
        const rowKey = String(key)
        const seats = this.seatsByRow[key]
        if (Array.isArray(seats) && seats.length > 0) {
          normalized[rowKey] = seats
        }
      })
      return normalized
    }
  },
  methods: {
    getSeatClass(seat) {
      // 不可用状态
      if (seat.status !== 1 || this.disabledSeatIds.includes(seat.id)) {
        return 'seat-disabled'
      }
      // 已选中状态
      if (this.selectedSeatId === seat.id) {
        return 'seat-selected'
      }
      // 已占用状态
      if (this.occupiedSeatIds.includes(seat.id)) {
        return 'seat-occupied'
      }
      // 可用状态
      return 'seat-available'
    },
    handleSeatClick(seat) {
      // 如果上香位置不可用，不触发点击事件
      if (seat.status !== 1 || this.disabledSeatIds.includes(seat.id)) {
        this.$emit('seat-disabled-click', seat)
        return
      }
      // 如果上香位置已占用，不触发点击事件
      if (this.occupiedSeatIds.includes(seat.id)) {
        this.$emit('seat-occupied-click', seat)
        return
      }
      // 触发上香位置选择事件
      this.$emit('seat-selected', seat)
    },
    handleSeatHover(seat) {
      if (this.showTooltip) {
        this.hoveredSeat = seat
      }
    },
    handleSeatLeave() {
      this.hoveredSeat = null
    },
    zoomIn() {
      if (this.zoomLevel < this.maxZoom) {
        this.zoomLevel = Math.min(this.zoomLevel + this.zoomStep, this.maxZoom)
      }
    },
    zoomOut() {
      if (this.zoomLevel > this.minZoom) {
        this.zoomLevel = Math.max(this.zoomLevel - this.zoomStep, this.minZoom)
      }
    },
    resetZoom() {
      this.zoomLevel = 1
    }
  }
}
</script>

<style scoped>
.seat-picker-container {
  max-width: 1000px;
  margin: 0 auto;
  /* padding: 20px; */
  position: relative;
}

.zoom-controls {
  margin-bottom: 10px;
}

/* 舞台/屏幕区域 */
.stage-area {
  background: linear-gradient(180deg, #409EFF 0%, #66b1ff 100%);
  height: 80px;
  border-radius: 8px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  position: relative;
}

.stage-area::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 20px;
  background: rgba(64, 158, 255, 0.2);
  border-radius: 50%;
}

.stage-label {
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: 2px;
}

/* 上香位置布局容器 */
.seat-layout-container {
  background: #f5f7fa;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  padding: 30px 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: auto;
  min-height: 200px;
  transition: transform 0.3s ease;
  position: relative;
}

.empty-seats {
  text-align: center;
  padding: 40px;
  color: #909399;
  font-size: 14px;
}

.seat-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  justify-content: center;
  min-width: fit-content;
}

.row-label {
  width: 60px;
  font-weight: bold;
  text-align: center;
  color: #606266;
  font-size: 14px;
  flex-shrink: 0;
}

.seat-items {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  flex: 1;
  justify-content: flex-start;
  min-width: 0;
}

.seat-item {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  z-index: 1;
}

.seat-item:hover {
  z-index: 100;
}

.seat-item:hover {
  transform: scale(1.15);
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.seat-number {
  font-size: 12px;
  color: inherit;
  z-index: 1;
}

.seat-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.seat-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.8);
}

/* 可选上香位置 */
.seat-available {
  background: #67C23A;
  color: #fff;
  border-color: #67C23A;
}

.seat-available:hover {
  background: #85ce61;
  border-color: #85ce61;
}

/* 已选上香位置 */
.seat-selected {
  background: #409EFF;
  color: #fff;
  border-color: #409EFF;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.3);
}

.seat-selected:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}

/* 已占用上香位置 */
.seat-occupied {
  background: #F56C6C;
  color: #fff;
  border-color: #F56C6C;
  cursor: not-allowed;
}

.seat-occupied:hover {
  background: #f78989;
  border-color: #f78989;
  transform: scale(1.05);
}

/* 不可用上香位置 */
.seat-disabled {
  background: #C0C4CC;
  color: #fff;
  border-color: #C0C4CC;
  cursor: not-allowed;
  opacity: 0.6;
}

.seat-disabled:hover {
  transform: none;
}

/* 图例说明 */
.seat-legend {
  display: flex;
  justify-content: center;
  gap: 30px;
  padding: 15px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.legend-seat {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  border: 2px solid;
  display: inline-block;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .seat-picker-container {
    padding: 1rem; /* 16px */
    padding-top:0;
  }

  .zoom-controls {
    margin-bottom: 0.625rem; /* 10px */
  }

  .zoom-controls .el-button-group {
    width: 100%;
    display: flex;
  }

  .zoom-controls .el-button {
    flex: 1;
  }

  .seat-item {
    width: 2.5rem; /* 40px */
    height: 2.5rem; /* 40px */
  }
  
  .seat-number {
    font-size: 0.6875rem; /* 11px */
  }
  
  .stage-label {
    font-size: 1.25rem; /* 20px */
  }
  
  .stage-area {
    height: 3.75rem; /* 60px */
    margin-bottom: 1.25rem; /* 20px */
  }
  
  .seat-legend {
    flex-direction: column;
    gap: 0.9375rem; /* 15px */
    align-items: center;
    padding: 0.75rem; /* 12px */
  }
  
  .seat-layout-container {
    margin-bottom: 0;
  }

  .row-label {
    width: 3rem; /* 48px */
    font-size: 0.8125rem; /* 13px */
  }

  .seat-tooltip {
    font-size: 0.6875rem; /* 11px */
    padding: 0.25rem 0.5rem; /* 4px 8px */
    bottom: calc(100% + 0.5rem); /* 8px */
  }
}
</style>

