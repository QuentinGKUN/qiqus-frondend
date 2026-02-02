<template>
  <div class="page-container">
    <div class="card-container">
      <div class="table-header">
        <h3>到期记录查询</h3>
      </div>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form" label-width="100px">
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="searchForm.start_date"
            type="date"
            placeholder="选择开始日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            clearable
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker
            v-model="searchForm.end_date"
            type="date"
            placeholder="选择结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            clearable
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 150px;">
            <el-option label="全部" value="" />
            <el-option label="已到期" value="expired" />
            <el-option label="即将到期" value="upcoming" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="searchLoading" @click="loadData">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border style="width: 100%" v-loading="tableLoading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="tourist.name" label="游客姓名" width="120" show-overflow-tooltip />
        <el-table-column prop="tourist.phone" label="游客手机" width="130" />
        <el-table-column label="位置/图片" min-width="150">
          <template slot-scope="scope">
            <div v-if="scope.row.incense_type?.type === 'banner'">
              <img v-if="scope.row.image_url" :src="scope.row.image_url" style="max-width: 120px; max-height: 80px; border-radius: 4px;" />
              <span v-else>-</span>
            </div>
            <span v-else style="word-break: break-word;">{{ scope.row.position_path || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="incense_type.name" label="香品" width="90" />
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <el-tag v-if="isExpired(scope.row.end_time)" type="danger" size="small">已到期</el-tag>
            <el-tag v-else type="warning" size="small">即将到期</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" width="160">
          <template slot-scope="scope">
            {{ formatDateTimeCN(scope.row.start_time) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="结束时间" width="160">
          <template slot-scope="scope">
            {{ formatDateTimeCN(scope.row.end_time) || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="blessing" label="祝福语" min-width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="100" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleView(scope.row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 20px; text-align: right;"
        :current-page="pagination.page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.page_size"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />

      <!-- 记录详情弹窗 -->
      <el-dialog
        title="到期记录详情"
        :visible.sync="detailDialogVisible"
        width="800px"
        :close-on-click-modal="false"
      >
        <div v-if="currentRecord">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="记录编号" :span="1">{{ currentRecord.record?.id || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态" :span="1">
              <el-tag v-if="isExpired(currentRecord.record?.end_time)" type="danger" size="small">已到期</el-tag>
              <el-tag v-else type="warning" size="small">即将到期</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="香品类型" :span="1">{{ currentRecord.record?.incense_type?.name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="香品类型" :span="1">
              <el-tag v-if="currentRecord.record?.incense_type?.type === 'banner'" type="info" size="small">锦旗</el-tag>
              <el-tag v-else type="success" size="small">普通香品</el-tag>
            </el-descriptions-item>
          </el-descriptions>

          <el-divider />

          <el-descriptions :column="2" border title="游客信息">
            <el-descriptions-item label="游客姓名">{{ currentRecord.record?.tourist?.name || '未填写' }}</el-descriptions-item>
            <el-descriptions-item label="游客手机">{{ currentRecord.record?.tourist?.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="身份证号" :span="2">
              {{ currentRecord.record?.tourist?.id_card || '未填写' }}
            </el-descriptions-item>
            <el-descriptions-item label="祝福语" :span="2">
              <div style="max-width: 100%; word-break: break-word;">{{ currentRecord.record?.blessing || '未填写' }}</div>
            </el-descriptions-item>
          </el-descriptions>

          <el-divider />

          <el-descriptions :column="2" border title="上香信息">
            <el-descriptions-item v-if="currentRecord.record?.incense_type?.type === 'banner'" label="锦旗图片" :span="2">
              <img v-if="currentRecord.record.image_url" :src="currentRecord.record.image_url" style="max-width: 400px; max-height: 250px; border-radius: 4px; cursor: pointer;" @click="previewImage(currentRecord.record.image_url)" />
              <span v-else>-</span>
            </el-descriptions-item>
            <template v-else>
              <el-descriptions-item label="位置路径" :span="2">
                {{ currentRecord.record?.position_path || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="座位号">{{ currentRecord.record?.position?.name || '-' }}</el-descriptions-item>
              <el-descriptions-item label="所属区域">{{ currentRecord.record?.position_config_name || '-' }}</el-descriptions-item>
            </template>
            <el-descriptions-item label="开始时间">{{ formatDateTimeCN(currentRecord.record?.start_time) || '-' }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ formatDateTimeCN(currentRecord.record?.end_time) || '-' }}</el-descriptions-item>
            <el-descriptions-item label="剩余时间" :span="2">
              <span style="color: #f56c6c; font-weight: 500;">{{ currentRecord.remaining_time || '已到期' }}</span>
            </el-descriptions-item>
          </el-descriptions>

          <el-divider />

          <el-descriptions :column="2" border title="办理信息">
            <el-descriptions-item label="经办人">{{ currentRecord.record?.employee_name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="工号">{{ currentRecord.record?.employee_username || '-' }}</el-descriptions-item>
            <el-descriptions-item label="岗位">{{ currentRecord.record?.post_name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDateTimeCN(currentRecord.record?.created_at) || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div v-else style="text-align: center; padding: 40px; color: #999;">
          加载中...
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="detailDialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { employeeApi, commonApi } from '@/api'
import dayjs from 'dayjs'

export default {
  name: 'EmployeeExpiredRecords',
  data() {
    return {
      tableData: [],
      searchForm: {
        start_date: null,
        end_date: null,
        status: '' // 状态：expired-已到期, upcoming-即将到期, ''-全部
      },
      pagination: {
        page: 1,
        page_size: 10,
        total: 0
      },
      tableLoading: false,
      searchLoading: false,
      detailDialogVisible: false,
      currentRecord: null
    }
  },
  mounted() {
    // 如果有查询参数id，直接查看详情
    if (this.$route.query.id) {
      this.$nextTick(() => {
        this.handleView({ id: parseInt(this.$route.query.id) })
      })
    } else {
      // 默认加载最近30天的数据（不传日期参数）
      this.loadData()
    }
  },
  methods: {
    // 统一时间展示格式：YYYY年MM月DD日HH时
    formatDateTimeCN(datetime) {
      if (!datetime) return ''
      const d = dayjs(datetime)
      if (!d.isValid()) return ''
      return d.format('YYYY年MM月DD日HH时')
    },
    async loadData() {
      this.searchLoading = true
      this.tableLoading = true
      try {
        // 根据状态筛选，需要获取所有记录然后过滤
        const now = dayjs()
        const future30Days = now.add(30, 'day')
        
        // 获取所有记录
        const res = await employeeApi.incenseRecords.myList({
          page: 1,
          page_size: 1000
        })
        
        if (res.code === 200) {
          let allRecords = res.data?.list || []
          
          // 根据日期范围过滤
          if (this.searchForm.start_date || this.searchForm.end_date) {
            const startDate = this.searchForm.start_date ? dayjs(this.searchForm.start_date).startOf('day') : null
            const endDate = this.searchForm.end_date ? dayjs(this.searchForm.end_date).endOf('day') : null
            
            allRecords = allRecords.filter(record => {
              if (!record.end_time) return false
              const endTime = dayjs(record.end_time)
              if (startDate && endTime.isBefore(startDate)) return false
              if (endDate && endTime.isAfter(endDate)) return false
              return true
            })
          } else {
            // 默认查询最近30天到期的记录（包括已到期和即将到期）
            allRecords = allRecords.filter(record => {
              if (!record.end_time) return false
              const endTime = dayjs(record.end_time)
              // 30天内到期（包括已到期和即将到期）
              return (endTime.isBefore(now) || endTime.isSame(now) || (endTime.isAfter(now) && (endTime.isBefore(future30Days) || endTime.isSame(future30Days))))
            })
          }
          
          // 根据状态过滤
          if (this.searchForm.status === 'expired') {
            // 只显示已到期
            allRecords = allRecords.filter(record => {
              if (!record.end_time) return false
              return dayjs(record.end_time).isBefore(now)
            })
          } else if (this.searchForm.status === 'upcoming') {
            // 只显示即将到期（未到期且在30天内）
            allRecords = allRecords.filter(record => {
              if (!record.end_time) return false
              const endTime = dayjs(record.end_time)
              return endTime.isAfter(now) && (endTime.isBefore(future30Days) || endTime.isSame(future30Days))
            })
          }
          
          // 按结束时间升序排列
          allRecords.sort((a, b) => {
            return dayjs(a.end_time).valueOf() - dayjs(b.end_time).valueOf()
          })
          
          // 分页处理
          const total = allRecords.length
          const start = (this.pagination.page - 1) * this.pagination.page_size
          const end = start + this.pagination.page_size
          
          this.tableData = allRecords.slice(start, end)
          this.pagination.total = total
        }
      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error('加载数据失败，请重试')
      } finally {
        this.searchLoading = false
        this.tableLoading = false
      }
    },
    // 判断是否已到期
    isExpired(endTime) {
      if (!endTime) return false
      return dayjs(endTime).isBefore(dayjs())
    },
    handleView(row) {
      commonApi.incenseRecordDetail(row.id).then(res => {
        if (res.code === 200) {
          this.currentRecord = res.data || null
          this.detailDialogVisible = true
        }
      }).catch(error => {
        console.error('获取记录详情失败:', error)
        this.$message.error('获取记录详情失败')
      })
    },
    resetSearch() {
      this.searchForm = {
        start_date: null,
        end_date: null,
        status: ''
      }
      this.pagination.page = 1
      this.loadData()
    },
    handleSizeChange(val) {
      this.pagination.page_size = val
      this.pagination.page = 1
      this.loadData()
    },
    handlePageChange(val) {
      this.pagination.page = val
      this.loadData()
    },
    // 预览图片
    previewImage(url) {
      if (!url) return
      window.open(url, '_blank')
    }
  }
}
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
}
</style>

