<template>
  <div class="page-container" style="width: 100%;padding: 0;">
    <div class="card-container" style="width: 100%;max-width: 800px;margin: 0 auto;">
      <div class="table-header" style="text-align: center;">
        <h3>查询上香记录</h3>
      </div>

      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="100px"
        style="max-width: 500px; margin: 0 auto;"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="验证码" prop="smsCode">
          <div class="sms-code-wrapper">
            <el-input
              v-model="form.smsCode"
              placeholder="请输入验证码（1234）"
              prefix-icon="el-icon-message"
              class="sms-code-input"
              maxlength="4"
              @keyup.enter.native="handleQuery"
            />
            <el-button
              :disabled="countdown > 0 || sending"
              :loading="sending"
              @click="sendSmsCode"
              class="sms-code-btn"
            >
              {{ countdown > 0 ? `${countdown}秒后重发` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%;" :loading="loading" @click="handleQuery">
            查询
          </el-button>
        </el-form-item>
      </el-form>

      <div v-if="records.length > 0" style="margin-top: 30px;">
        <h4>查询结果：</h4>
        <el-table :data="records" border style="width: 100%;">
          <el-table-column label="位置/图片" width="200">
            <template slot-scope="scope">
              <div v-if="scope.row.incense_type === 'banner'">
                <img v-if="scope.row.image_url" :src="scope.row.image_url" style="max-width: 150px; max-height: 100px; border-radius: 4px;" />
                <span v-else>-</span>
              </div>
              <span v-else>{{ scope.row.position_path || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="incense_type_name" label="香品" />
          <el-table-column prop="start_time" label="开始时间" width="180" />
          <el-table-column prop="end_time" label="结束时间" width="180" />
          <el-table-column prop="remaining_time" label="剩余时间" />
          <el-table-column label="操作" width="120">
            <template slot-scope="scope">
              <el-button type="text" size="mini" @click="handleView(scope.row)" :disabled="scope.row.incense_type === 'banner'">
                {{ scope.row.incense_type === 'banner' ? '查看' : '查看位置' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-else-if="searched" style="text-align: center; padding: 40px; color: #999;">
        未找到相关记录
      </div>
    </div>

    <!-- 位置预览弹窗 -->
    <el-dialog
      title="上香位置预览"
      :visible.sync="previewDialogVisible"
      width="900px"
      :close-on-click-modal="false"
    >
      <div class="preview-dialog-content">
        <div v-if="currentRecord" style="margin-bottom: 16px;">
          <el-descriptions :column="2" size="small" border>
            <el-descriptions-item v-if="currentRecord.incense_type === 'banner'" label="锦旗图片" :span="2">
              <img v-if="currentRecord.image_url" :src="currentRecord.image_url" style="max-width: 300px; max-height: 200px; border-radius: 4px;" />
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item v-if="currentRecord.incense_type !== 'banner'" label="位置路径">
              {{ currentRecord.position_path || '-' }}
            </el-descriptions-item>
            <el-descriptions-item v-if="currentRecord.incense_type !== 'banner'" label="座位号">
              {{ currentRecord.position?.name || currentRecord.seat_name || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="香品">
              {{ currentRecord.incense_type_name || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="香品类型">
              {{ currentRecord.incense_type === 'banner' ? '锦旗' : '普通香品' }}
            </el-descriptions-item>
            <el-descriptions-item label="开始时间">
              {{ currentRecord.start_time || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 预览标题 -->
        <el-divider content-position="left">位置预览</el-divider>

        <div v-if="previewLoading" style="text-align: center; padding: 40px; color: #999;">
          加载预览中...
        </div>
        <div v-else-if="currentRecord && currentRecord.incense_type === 'banner'" style="text-align: center; padding: 40px; color: #999;">
          锦旗类型无需预览位置
        </div>
        <div v-else-if="previewSeatsByRow && Object.keys(previewSeatsByRow).length > 0" class="preview-seat-container">
          <SeatPicker
            :seats-by-row="previewSeatsByRow"
            :selected-seat-id="previewSelectedSeatId"
            :disabled-seat-ids="previewDisabledSeatIds"
            :occupied-seat-ids="[]"
            stage-label="供奉台"
            row-label-prefix="第"
            row-label-suffix="排"
            :show-tooltip="true"
            :auto-scroll-to-selected="true"
            :legends="[]"
          />
        </div>
        <div v-else style="text-align: center; padding: 40px; color: #999;">
          暂无预览数据
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="previewDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { publicApi, adminApi } from '@/api'
import SeatPicker from '@/components/SeatPicker.vue'

export default {
  name: 'PublicRecords',
  components: {
    SeatPicker
  },
  data() {
    return {
      loading: false,
      searched: false,
      sending: false,
      countdown: 0,
      countdownTimer: null,
      form: {
        name: '',
        phone: '',
        smsCode: ''
      },
      records: [],
      // 预览弹窗
      previewDialogVisible: false,
      previewLoading: false,
      currentRecord: null,
      previewSeatsByRow: null,
      previewDisabledSeatIds: [],
      previewSelectedSeatId: null
    }
  },
  computed: {
    rules() {
      return {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        smsCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { validator: this.validateSmsCode, trigger: 'blur' }
        ]
      }
    }
  },
  beforeDestroy() {
    // 组件销毁前清除定时器
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }
  },
  methods: {
    buildTooltipText(record) {
      if (!record) return ''
      const lines = []
      if (record.position_path) lines.push(`位置：${record.position_path}`)
      if (record.position_config_name) lines.push(`区域：${record.position_config_name}`)
      if (record.position_name) lines.push(`座位：${record.position_name}`)
      if (record.incense_type_name) lines.push(`香品：${record.incense_type_name}`)
      if (record.blessing) lines.push(`祈福：${record.blessing}`)
      if (record.remaining_time) lines.push(`剩余：${record.remaining_time}`)
      if (record.start_time) lines.push(`开始：${record.start_time}`)
      if (record.end_time) lines.push(`结束：${record.end_time}`)
      return lines.join('\n')
    },
    buildGridSeatsByRow(rows, cols, selectedRow, selectedCol, record) {
      const r = Number(rows)
      const c = Number(cols)
      const sr = Number(selectedRow)
      const sc = Number(selectedCol)
      if (!Number.isFinite(r) || !Number.isFinite(c) || r <= 0 || c <= 0) return {}
      const seatsByRow = {}
      const tooltip = this.buildTooltipText(record)
      for (let row = 1; row <= r; row++) {
        const seats = []
        for (let col = 1; col <= c; col++) {
          const id = `r${row}c${col}`
          const isSelected = row === sr && col === sc
          seats.push({
            id,
            row,
            col,
            status: 1,
            name: isSelected ? (record?.position_name || `${row}-${col}`) : '',
            tooltip: isSelected ? tooltip : ''
          })
        }
        seatsByRow[String(row)] = seats
      }
      return seatsByRow
    },
    // 验证码校验
    validateSmsCode(rule, value, callback) {
      if (!value) {
        callback(new Error('请输入验证码'))
      } else if (value !== '1234') {
        callback(new Error('验证码错误，请输入1234'))
      } else {
        callback()
      }
    },
    // 发送短信验证码（模拟）
    async sendSmsCode() {
      // 先验证手机号格式
      if (!this.form.phone) {
        this.$message.warning('请先输入手机号')
        return
      }
      const phonePattern = /^1[3-9]\d{9}$/
      if (!phonePattern.test(this.form.phone)) {
        this.$message.warning('请输入正确的手机号')
        return
      }
      
      this.sending = true
      // 模拟API调用延迟
      setTimeout(() => {
        this.$message.success('验证码已发送，请输入1234')
        // 开始倒计时
        this.startCountdown()
        this.sending = false
      }, 500)
    },
    // 开始倒计时
    startCountdown() {
      this.countdown = 60
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
      }
      this.countdownTimer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(this.countdownTimer)
          this.countdownTimer = null
        }
      }, 1000)
    },
    async handleQuery() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          // 验证验证码（本地验证，输入1234即可）
          if (this.form.smsCode !== '1234') {
            this.$message.error('验证码错误，请输入1234')
            this.form.smsCode = ''
            return
          }

          this.loading = true
          this.searched = false
          try {
            // 查询时不需要发送验证码到后端
            const { smsCode, ...queryData } = this.form
            const res = await publicApi.touristRecords(queryData)
            if (res.code === 200) {
              this.records = res.data || []
              this.searched = true
              // 查询成功后清空验证码
              this.form.smsCode = ''
            }
          } catch (error) {
            console.error('查询失败:', error)
            this.searched = true
          } finally {
            this.loading = false
          }
        }
      })
    },
    // 查看单条记录的上香位置预览（参考位置配置详情预览的实现）
    async handleView(row) {
      if (!row) {
        this.$message.warning('未找到记录信息，无法预览位置')
        return
      }
      
      // 新接口：优先使用行列直接定位
      const positionRow = row.position_row
      const positionCol = row.position_col
      const configRows = row.position_config_rows
      const configCols = row.position_config_cols
      // 旧数据兼容：仍可通过 position_id + config_id 拉布局
      const positionId = row.position_id
      const positionConfigId = row.position_config_id
      
      // 打开对话框
      this.previewDialogVisible = true
      this.previewLoading = true
      this.currentRecord = row
      
      // 重置预览数据
      this.previewSeatsByRow = null
      this.previewDisabledSeatIds = []
      this.previewSelectedSeatId = null

      try {
        // 1) 新接口路径：有行列 + 总行列 => 前端直接生成布局并高亮
        if (positionRow && positionCol && configRows && configCols) {
          const selectedId = `r${Number(positionRow)}c${Number(positionCol)}`
          const grid = this.buildGridSeatsByRow(configRows, configCols, positionRow, positionCol, row)
          this.previewSeatsByRow = grid
          this.previewSelectedSeatId = selectedId

          // 除选中座位外，其它全部做“禁用/昏暗”效果，突出目标
          const disabledIds = []
          Object.values(grid).forEach(seats => {
            if (Array.isArray(seats)) {
              seats.forEach(seat => {
                if (seat && seat.id !== selectedId) disabledIds.push(seat.id)
              })
            }
          })
          this.previewDisabledSeatIds = disabledIds
          return
        }

        // 2) 旧逻辑兼容：缺少行列/总行列时，仍走后台布局
        if (!positionConfigId) {
          this.$message.warning('该记录缺少位置配置信息，暂无法预览')
          this.previewSeatsByRow = {}
          return
        }

        const previewRes = await adminApi.positions.getByConfig(positionConfigId)
        if (previewRes.code === 200) {
          const seatsByRow = previewRes.data.seats_by_row || {}
          // 确保行号是字符串格式（SeatPicker 组件需要字符串键）
          const normalizedSeatsByRow = {}
          Object.keys(seatsByRow).forEach(key => {
            const rowKey = String(key)
            normalizedSeatsByRow[rowKey] = seatsByRow[key] || []
          })
          this.previewSeatsByRow = normalizedSeatsByRow

          const disabledIds = []
          Object.values(this.previewSeatsByRow).forEach(seats => {
            if (Array.isArray(seats)) {
              seats.forEach(seat => {
                if (seat && (seat.status !== 1 || (positionId && seat.id !== positionId))) {
                  disabledIds.push(seat.id)
                }
              })
            }
          })
          this.previewDisabledSeatIds = disabledIds
          this.previewSelectedSeatId = positionId
        } else {
          console.warn('预览数据加载失败:', previewRes.message)
          this.$message.warning('加载位置布局失败，暂无法预览')
          this.previewSeatsByRow = {}
        }
      } catch (error) {
        console.error('加载位置预览失败:', error)
        this.$message.error('加载位置预览失败，请稍后重试')
      } finally {
        this.previewLoading = false
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
}

.sms-code-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.sms-code-input {
  flex: 1;
}

.sms-code-btn {
  white-space: nowrap;
  min-width: 120px;
}

@media (max-width: 480px) {
  .sms-code-wrapper {
    flex-direction: column;
    gap: 8px;
  }
  
  .sms-code-btn {
    width: 100%;
  }
}

.preview-dialog-content {
  margin-top: 10px;
}

/* 预览样式：选中座位高亮，其他座位昏暗 */
.preview-seat-container ::v-deep .seat-layout-container {
  background: rgba(0, 0, 0, 0.3);
  filter: brightness(0.6);
}

.preview-seat-container ::v-deep .seat-disabled {
  background: rgba(192, 196, 204, 0.3) !important;
  color: rgba(255, 255, 255, 0.3) !important;
  border-color: rgba(192, 196, 204, 0.3) !important;
  opacity: 0.3;
}

.preview-seat-container ::v-deep .seat-selected {
  background: #409EFF !important;
  color: #fff !important;
  border-color: #409EFF !important;
  box-shadow: 0 0 20px rgba(64, 158, 255, 0.8), 0 0 40px rgba(64, 158, 255, 0.4) !important;
  filter: brightness(1.2);
  z-index: 100;
  position: relative;
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(64, 158, 255, 0.8), 0 0 40px rgba(64, 158, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(64, 158, 255, 1), 0 0 60px rgba(64, 158, 255, 0.6);
  }
}

.preview-seat-container ::v-deep .row-label {
  color: rgba(255, 255, 255, 0.4);
}

.preview-seat-container ::v-deep .stage-area {
  background: rgba(64, 158, 255, 0.3);
  filter: brightness(0.5);
}
</style>


