<template>
  <div class="page-container">
    <div class="card-container">
      <div class="table-header">
        <h3>办理上香业务</h3>
      </div>

      <el-steps :active="activeStep" finish-status="success" style="margin-bottom: 30px;">
        <el-step title="选择时间段、香品和区域" />
        <el-step title="选择具体位置" />
        <el-step title="游客信息" />
        <el-step title="确认信息" />
      </el-steps>

      <!-- 步骤1: 选择时间段、香品类型、区域 -->
      <div v-if="activeStep === 0" class="step-content">
        <el-form
          ref="step1Form"
          :model="step1Form"
          :rules="step1Rules"
          label-width="120px"
          class="step1-form"
        >
          <el-form-item label="时间段" prop="timeRange">
            <div class="time-range-container">
              <div class="quick-time-buttons">
                <el-button size="small" @click="setQuickTime('1hour')">1小时</el-button>
                <el-button size="small" @click="setQuickTime('1day')">1天</el-button>
                <el-button size="small" @click="setQuickTime('1week')">1周</el-button>
                <el-button size="small" @click="setQuickTime('1year')">1年</el-button>
              </div>
              <div class="time-picker-container">
                <el-date-picker
                  v-model="step1Form.start_time"
                  type="datetime"
                  placeholder="选择开始时间"
                  format="yyyy-MM-dd HH:mm"
                  value-format="yyyy-MM-dd HH:mm"
                  :picker-options="startTimePickerOptions"
                  @change="handleStartTimeChange"
                  class="time-picker"
                />
                <span class="time-separator">至</span>
                <el-date-picker
                  v-model="step1Form.end_time"
                  type="datetime"
                  placeholder="选择结束时间"
                  format="yyyy-MM-dd HH:mm"
                  value-format="yyyy-MM-dd HH:mm"
                  :picker-options="endTimePickerOptions"
                  @change="handleEndTimeChange"
                  class="time-picker"
                />
              </div>
            </div>
          </el-form-item>
          
          <el-form-item label="香品类型" prop="incense_type_id">
            <el-select v-model="step1Form.incense_type_id" placeholder="请选择香品类型" style="width: 100%">
              <el-option
                v-for="type in incenseTypes"
                :key="type.id"
                :label="type.name"
                :value="type.id"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="区域" prop="position_config_id">
            <el-select 
              v-model="step1Form.position_config_id" 
              placeholder="请选择区域" 
              style="width: 100%"
              :disabled="positionConfigs.length === 0"
              @change="handlePositionConfigChange"
            >
              <el-option
                v-for="config in positionConfigs"
                :key="config.id"
                :label="config.name"
                :value="config.id"
              />
            </el-select>
            <div v-if="positionConfigs.length === 0" style="color: #909399; font-size: 12px; margin-top: 5px;">
              当前岗位未分配区域，请联系管理员
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              :loading="step1Loading"
              :disabled="step1Loading"
              @click="handleStep1Next"
            >
              下一步
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤2: 选择具体位置 -->
      <div v-if="activeStep === 1" class="step-content">
        <div v-if="loadingSeats" style="text-align: center; padding: 40px;">
          <i class="el-icon-loading" style="font-size: 24px;"></i>
          <p style="margin-top: 10px; color: #909399;">加载位置数据中...</p>
        </div>
        <div v-else-if="seatsByRow && Object.keys(seatsByRow).length > 0">
          <!-- 使用上香位置选择组件 -->
          <SeatPicker
            :seats-by-row="seatsByRow"
            :selected-seat-id="selectedSeat ? selectedSeat.id : null"
            :disabled-seat-ids="disabledSeatIds"
            :occupied-seat-ids="occupiedSeatIds"
            stage-label="供奉台"
            row-label-prefix="第"
            row-label-suffix="排"
            @seat-selected="handleSelectSeat"
            @seat-disabled-click="handleDisabledSeatClick"
            @seat-occupied-click="handleOccupiedSeatClick"
          />
        </div>
        <div v-else style="text-align: center; padding: 40px; color: #999;">
          <p>暂无可用位置</p>
          <p style="font-size: 12px; margin-top: 10px;">请检查时间段和区域选择</p>
        </div>
        
        <div style="margin-top: 20px;">
          <el-button @click="handlePrevStep">上一步</el-button>
          <el-button type="primary" @click="handleStep2Next" :disabled="!selectedSeat">下一步</el-button>
        </div>
      </div>
      
      <!-- 位置信息弹出窗 -->
      <el-dialog
        title="供奉位置信息"
        :visible.sync="seatDialogVisible"
        width="500px"
        :close-on-click-modal="false"
        @close="handleDialogClose"
      >
        <div v-if="tempSelectedSeat" class="seat-info-dialog">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="位置名称">
              {{ tempSelectedSeat.name }}
            </el-descriptions-item>
            <el-descriptions-item label="位置路径">
              {{ tempSelectedSeat.position_path || tempSelectedSeat.name }}
            </el-descriptions-item>
            <el-descriptions-item label="行号">
              第{{ tempSelectedSeat.row }}行
            </el-descriptions-item>
            <el-descriptions-item label="列号">
              第{{ tempSelectedSeat.col }}列
            </el-descriptions-item>
            <el-descriptions-item label="容量">
              {{ tempSelectedSeat.capacity || '1' }}个香品
            </el-descriptions-item>
            <el-descriptions-item label="描述" v-if="tempSelectedSeat.description">
              {{ tempSelectedSeat.description }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="tempSelectedSeat.status === 1 ? 'success' : 'info'">
                {{ tempSelectedSeat.status === 1 ? '可用' : '停用' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="handleCancelSelection">取消</el-button>
          <el-button type="primary" @click="confirmSeatSelection">确认选择</el-button>
        </div>
      </el-dialog>

      <!-- 步骤3: 游客信息 -->
      <div v-if="activeStep === 2" class="step-content">
        <el-form
          ref="touristForm"
          :model="touristForm"
          :rules="touristRules"
          label-width="120px"
          style="max-width: 600px;"
        >
          <el-form-item label="游客姓名" prop="name">
            <el-input v-model="touristForm.name"  placeholder="请输入游客姓名（可选）" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="touristForm.phone" placeholder="请输入手机号（可选）" />
          </el-form-item>
          <el-form-item label="身份证号" prop="id_card">
            <el-input v-model="touristForm.id_card" placeholder="请输入身份证号（可选）" />
          </el-form-item>
          <el-form-item label="祝福语" prop="blessing">
            <el-input
              v-model="touristForm.blessing"
              type="textarea"
              :rows="3"
              placeholder="请输入游客祝福语（可选）"
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="handlePrevStep">上一步</el-button>
            <el-button type="primary" @click="handleStep3Next">下一步</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤4: 确认信息 -->
      <div v-if="activeStep === 3" class="step-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="游客姓名">{{ touristForm.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ touristForm.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="身份证号">{{ touristForm.id_card || '-' }}</el-descriptions-item>
          <el-descriptions-item label="祝福语">{{ touristForm.blessing || '-' }}</el-descriptions-item>
          <el-descriptions-item label="区域">{{ getPositionConfigName(step1Form.position_config_id) }}</el-descriptions-item>
          <el-descriptions-item label="位置">{{ selectedSeat?.position_path || selectedSeat?.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="香品">{{ getIncenseTypeName(step1Form.incense_type_id) }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ formatDateTimeCN(isoStartTime) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ formatDateTimeCN(isoEndTime) || '-' }}</el-descriptions-item>
        </el-descriptions>
        <div style="margin-top: 20px; text-align: center;">
          <el-button @click="handlePrevStep">上一步</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { employeeApi, adminApi } from '@/api'
import SeatPicker from '@/components/SeatPicker.vue'
import { isLocalAccount } from '@/config/local'
import dayjs from 'dayjs'

export default {
  name: 'EmployeeIncenseRecords',
  components: {
    SeatPicker
  },
  data() {
    // 自定义手机号校验规则
    const validatePhone = (rule, value, callback) => {
      if (!value) {
        // 如果为空，不校验（因为不必填）
        callback()
        return
      }
      // 如果填写了，则校验格式
      if (!/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }
    
    return {
      activeStep: 0,
      submitting: false,
      loadingSeats: false,
      step1Loading: false,
      positionConfigs: [],
      incenseTypes: [],
      seatsByRow: null,
      selectedSeat: null,
      seatDialogVisible: false,
      tempSelectedSeat: null,
      disabledSeatIds: [],
      occupiedSeatIds: [],
      step1Form: {
        start_time: '',
        end_time: '',
        incense_type_id: null,
        position_config_id: null
      },
      // 存储ISO格式的时间（用于API调用）
      isoStartTime: '',
      isoEndTime: '',
        step1Rules: {
        timeRange: [
          { 
            validator: (rule, value, callback) => {
              if (!this.step1Form.start_time || !this.step1Form.end_time) {
                callback(new Error('请选择时间段'))
              } else {
                const startTime = dayjs(this.step1Form.start_time)
                const endTime = dayjs(this.step1Form.end_time)
                if (!startTime.isValid() || !endTime.isValid()) {
                  callback(new Error('时间格式不正确'))
                } else if (startTime.isAfter(endTime) || startTime.isSame(endTime)) {
                  callback(new Error('结束时间必须晚于开始时间'))
                } else {
                  callback()
                }
              }
            }, 
            trigger: 'change' 
          }
        ],
        incense_type_id: [{ required: true, message: '请选择香品类型', trigger: 'change' }],
        position_config_id: [{ required: true, message: '请选择区域', trigger: 'change' }]
      },
      touristForm: {
        name: '',
        phone: '',
        id_card: '',
        blessing: ''
      },
      touristRules: {
        name: [{ required: true, message: '请输入游客姓名', trigger: 'blur' }],
        phone: [{ validator: validatePhone, trigger: 'blur' }]
      },
      startTimePickerOptions: {
        disabledDate: (time) => {
          // 不能选择今天之前的日期
          return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
        }
      },
      endTimePickerOptions: {
        disabledDate: (time) => {
          // 不能选择开始时间之前的日期
          if (this.step1Form.start_time) {
            const startTime = new Date(this.step1Form.start_time)
            return time.getTime() < startTime.getTime()
          }
          return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
        }
      }
    }
  },
  mounted() {
    this.loadPositionConfigs()
    this.loadIncenseTypes()
  },
  methods: {
        // 统一时间展示格式：YYYY年MM月DD日HH时
        formatDateTimeCN(datetime) {
          if (!datetime) return ''
          const d = dayjs(datetime)
          if (!d.isValid()) return ''
          return d.format('YYYY年MM月DD日HH时')
        },
    // 加载区域列表（根据员工岗位）- 直接从登录数据中获取
    loadPositionConfigs() {
      try {
        const userInfo = this.$store.getters['user/userInfo']
        const username = userInfo?.username
        
        // 检查是否为本地开发账号
        if (username && isLocalAccount(username)) {
          // 本地开发账号使用模拟数据
          this.positionConfigs = [
            {
              id: 1,
              name: '大殿',
              type: 'grid',
              status: 1
            },
            {
              id: 2,
              name: '偏殿',
              type: 'custom',
              status: 1
            }
          ]
          // 默认选择第一个区域
          if (this.positionConfigs.length > 0) {
            this.step1Form.position_config_id = this.positionConfigs[0].id
          }
          return
        }
        
        // 正常账号：直接从登录数据中获取区域信息
        if (userInfo && userInfo.position_configs && Array.isArray(userInfo.position_configs)) {
          // 只显示启用状态的位置配置
          this.positionConfigs = userInfo.position_configs.filter(config => config.status === 1)
          
          // 默认选择第一个区域
          if (this.positionConfigs.length > 0) {
            this.step1Form.position_config_id = this.positionConfigs[0].id
          } else {
            this.$message.warning('当前岗位未分配区域，请联系管理员')
          }
        } else {
          // 如果登录数据中没有区域信息
          this.positionConfigs = []
          this.$message.warning('当前岗位未分配区域，请联系管理员')
        }
      } catch (error) {
        console.error('加载位置配置失败:', error)
        this.positionConfigs = []
        this.$message.error('加载区域信息失败')
      }
    },
    // 加载香品类型
    async loadIncenseTypes() {
      try {
        const userInfo = this.$store.getters['user/userInfo']
        const username = userInfo?.username
        
        if (username && isLocalAccount(username)) {
          this.incenseTypes = [
            {
              id: 1,
              name: '高香',
              status: 1
            },
            {
              id: 2,
              name: '中香',
              status: 1
            },
            {
              id: 3,
              name: '普通香',
              status: 1
            }
          ]
          return
        }
        
        const res = await adminApi.incenseTypes.list({ status: 1 })
        if (res.code === 200) {
          this.incenseTypes = res.data.list || res.data || []
        }
      } catch (error) {
        console.error('加载香品类型失败:', error)
        const userInfo = this.$store.getters['user/userInfo']
        const username = userInfo?.username
        if (username && isLocalAccount(username)) {
          this.incenseTypes = [
            {
              id: 1,
              name: '高香',
              status: 1
            }
          ]
        }
      }
    },
        // 设置快捷时间段（基于当前已选择的开始时间计算）
    setQuickTime(type) {
          const base = this.step1Form.start_time
            ? dayjs(this.step1Form.start_time)
            : dayjs()
          let startTime = base
          // 开始时间分钟按小时取整：如 01:30 -> 02:00
          if (startTime.minute() > 0) {
            startTime = startTime.startOf('hour').add(1, 'hour')
          } else {
            startTime = startTime.startOf('hour')
          }
          let endTime
      
      switch (type) {
        case '1hour':
          endTime = startTime.add(1, 'hour')
          break
        case '1day':
          endTime = startTime.add(1, 'day')
          break
        case '1week':
          endTime = startTime.add(1, 'week')
          break
        case '1year':
          endTime = startTime.add(1, 'year')
          break
        default:
          return
      }
      
      // 设置显示格式
      this.step1Form.start_time = startTime.format('YYYY-MM-DD HH:mm')
      this.step1Form.end_time = endTime.format('YYYY-MM-DD HH:mm')
      
      // 设置ISO格式（用于API调用）
      this.isoStartTime = startTime.format('YYYY-MM-DDTHH:mm:00Z')
      this.isoEndTime = endTime.format('YYYY-MM-DDTHH:mm:00Z')
      
      // 触发验证
      this.$nextTick(() => {
        if (this.$refs.step1Form) {
          this.$refs.step1Form.validateField('timeRange')
        }
      })
    },
        // 开始时间变化时转换格式，并将分钟按小时取整
    handleStartTimeChange(value) {
      if (value) {
            let d = dayjs(value)
            if (d.minute() > 0) {
              d = d.startOf('hour').add(1, 'hour')
            } else {
              d = d.startOf('hour')
            }
            // 更新展示用时间（不带秒）
            this.step1Form.start_time = d.format('YYYY-MM-DD HH:mm')
            // 转换为ISO格式（秒固定为00）
            this.isoStartTime = d.format('YYYY-MM-DDTHH:mm:00Z')
      } else {
        this.isoStartTime = ''
      }
      this.handleTimeChange()
    },
    // 结束时间变化时转换格式
    handleEndTimeChange(value) {
      if (value) {
        // 转换为ISO格式
        this.isoEndTime = dayjs(value).format('YYYY-MM-DDTHH:mm:00Z')
      } else {
        this.isoEndTime = ''
      }
      this.handleTimeChange()
    },
    // 时间变化时触发验证
    handleTimeChange() {
      this.$nextTick(() => {
        if (this.$refs.step1Form) {
          this.$refs.step1Form.validateField('timeRange')
        }
      })
    },
    // 区域变化时清空已选择的位置
    handlePositionConfigChange() {
      this.selectedSeat = null
      this.seatsByRow = null
    },
        // 步骤1下一步：加载位置数据
    async handleStep1Next() {
      this.$refs.step1Form.validate(async (valid) => {
        if (valid) {
              this.step1Loading = true
              try {
                // 加载位置数据（包括占用情况）
                await this.loadSeats()
                this.activeStep = 1
              } finally {
                this.step1Loading = false
              }
        }
      })
    },
    // 加载位置数据（根据时间段和区域）
    async loadSeats() {
      if (!this.step1Form.position_config_id || !this.isoStartTime || !this.isoEndTime) {
        return
      }
      
      this.loadingSeats = true
      this.seatsByRow = null
      this.selectedSeat = null
      this.disabledSeatIds = []
      this.occupiedSeatIds = []
      
      try {
        const userInfo = this.$store.getters['user/userInfo']
        const username = userInfo?.username
        
        if (username && isLocalAccount(username)) {
          // 本地开发账号使用模拟数据
          this.seatsByRow = {
            '1': [
              { id: 1, name: 'A1', row: 1, col: 1, status: 1, capacity: 1 },
              { id: 2, name: 'A2', row: 1, col: 2, status: 1, capacity: 1 },
              { id: 3, name: 'A3', row: 1, col: 3, status: 0, capacity: 1 }
            ],
            '2': [
              { id: 4, name: 'B1', row: 2, col: 1, status: 1, capacity: 1 },
              { id: 5, name: 'B2', row: 2, col: 2, status: 1, capacity: 1 }
            ]
          }
          this.disabledSeatIds = [3]
          this.loadingSeats = false
          return
        }
        
        // 正常账号调用后端接口，传入时间段参数（ISO格式）
        const res = await adminApi.positions.getByConfig(this.step1Form.position_config_id, {
          start_time: this.isoStartTime,
          end_time: this.isoEndTime
        })
        
        if (res.code === 200) {
          const seatsByRow = res.data.seats_by_row || {}
          // 规范化行号为字符串
          const normalizedSeatsByRow = {}
          Object.keys(seatsByRow).forEach(key => {
            normalizedSeatsByRow[String(key)] = seatsByRow[key] || []
          })
          this.seatsByRow = normalizedSeatsByRow
          
          // 提取不可用和已占用的上香位置ID
          this.disabledSeatIds = []
          this.occupiedSeatIds = []
          Object.values(this.seatsByRow).forEach(seats => {
            if (Array.isArray(seats)) {
              seats.forEach(seat => {
                if (seat.status !== 1) {
                  this.disabledSeatIds.push(seat.id)
                }
                // 如果capacity为0，说明已被占用
                if (seat.capacity === 0) {
                  this.occupiedSeatIds.push(seat.id)
                }
              })
            }
          })
        }
      } catch (error) {
        console.error('加载位置数据失败:', error)
        this.$message.error('加载位置数据失败，请重试')
      } finally {
        this.loadingSeats = false
      }
    },
    handleSelectSeat(seat) {
      this.tempSelectedSeat = seat
      this.seatDialogVisible = true
    },
    handleDisabledSeatClick(seat) {
      this.$message.warning('该位置已停用，无法选择')
    },
    handleOccupiedSeatClick(seat) {
      this.$message.warning('该位置在此时间段已被占用，请选择其他位置')
    },
    confirmSeatSelection() {
      this.selectedSeat = this.tempSelectedSeat
      this.seatDialogVisible = false
      this.tempSelectedSeat = null
      this.$message.success('已选择供奉位置：' + this.selectedSeat.name)
    },
    handleCancelSelection() {
      this.seatDialogVisible = false
      this.tempSelectedSeat = null
    },
    handleDialogClose() {
      this.tempSelectedSeat = null
    },
    // 步骤2下一步
    handleStep2Next() {
      if (!this.selectedSeat) {
        this.$message.warning('请先选择供奉位置')
        return
      }
      this.activeStep = 2
    },
    // 步骤3下一步
    handleStep3Next() {
      this.$refs.touristForm.validate((valid) => {
        if (valid) {
          this.activeStep = 3
        }
      })
    },
    handlePrevStep() {
      if (this.activeStep > 0) {
        this.activeStep--
      }
    },
    getIncenseTypeName(id) {
      const type = this.incenseTypes.find(t => t.id === id)
      return type ? type.name : ''
    },
    getPositionConfigName(id) {
      const config = this.positionConfigs.find(c => c.id === id)
      return config ? config.name : ''
    },
        async handleSubmit() {
      this.submitting = true
      try {
        // 使用ISO格式的时间
        const formData = {
          tourist_name: this.touristForm.name || '',
          tourist_phone: this.touristForm.phone || '',
          tourist_id_card: this.touristForm.id_card || '',
              blessing: this.touristForm.blessing || '',
          position_id: this.selectedSeat.id,
          incense_type_id: this.step1Form.incense_type_id,
          start_time: this.isoStartTime,
          end_time: this.isoEndTime
        }
        
        const res = await employeeApi.incenseRecords.create(formData)
        if (res.code === 200) {
          this.$message.success('创建成功')
          this.$router.push('/employee/my-records')
        }
      } catch (error) {
        console.error('提交失败:', error)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.step-content {
  min-height: 400px;
  padding: 1.25rem; /* 20px */
  width: 100%;
  box-sizing: border-box;
}

.step1-form {
  max-width: 50rem; /* 800px */
  width: 100%;
}

.time-range-container {
  display: flex;
  flex-direction: column;
  gap: 0.9375rem; /* 15px */
  width: 100%;
}

.quick-time-buttons {
  display: flex;
  gap: 0.625rem; /* 10px */
  flex-wrap: wrap;
  width: 100%;
}

.quick-time-buttons .el-button {
  flex: 1;
  min-width: calc(50% - 0.313rem); /* 50% - 10px gap / 2 */
  max-width: calc(50% - 0.313rem);
}

.time-picker-container {
  display: flex;
  gap: 0.9375rem; /* 15px */
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
}

.time-picker {
  flex: 1;
  min-width: 12.5rem; /* 200px */
}

.time-separator {
  flex-shrink: 0;
  color: var(--color-muted);
  font-size: 0.875rem; /* 14px */
}

.seat-info-dialog {
  padding: 0.625rem 0; /* 10px 0 */
}

.seat-info-dialog .el-descriptions {
  margin-top: 0.625rem; /* 10px */
}

/* 移动端适配 */
@media (max-width: 768px) {
  .step-content {
    padding: 1rem; /* 16px */
    min-height: auto;
  }

  .step1-form {
    max-width: 100%;
  }

  .step1-form /deep/ .el-form-item__label {
    width: 100% !important;
    text-align: left;
    margin-bottom: 0.5rem; /* 8px */
  }

  .step1-form /deep/ .el-form-item__content {
    margin-left: 0 !important;
    width: 100%;
  }

  .quick-time-buttons {
    flex-direction: column;
  }

  .quick-time-buttons .el-button {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    margin: 0.25rem 0; /* 4px */
  }

  .time-picker-container {
    flex-direction: column;
    align-items: stretch;
  }

  .time-picker {
    width: 100%;
    min-width: 100%;
  }

  .time-separator {
    text-align: center;
    padding: 0.5rem 0; /* 8px 0 */
  }
}
</style>
