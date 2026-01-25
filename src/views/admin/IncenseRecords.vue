<template>
  <div class="page-container">
    <div class="card-container">
      <div class="table-header">
        <h3>上香记录查询</h3>
        <el-button type="success" size="small" @click="exportToCSV">导出CSV</el-button>
      </div>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form" label-width="5em">
        <div class="search-form-row">
          <el-form-item label="员工" class="search-form-item">
            <el-select v-model="searchForm.employee_id" placeholder="请选择员工" clearable filterable style="width: 100%;">
              <el-option
                v-for="employee in employees"
                :key="employee.id"
                :label="`${employee.name} (${employee.username})`"
                :value="employee.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="座位" class="search-form-item">
            <el-select v-model="searchForm.position_id" placeholder="请选择座位" clearable filterable style="width: 100%;">
              <el-option
                v-for="position in positions"
                :key="position.id"
                :label="position.name"
                :value="position.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="开始日期" class="search-form-item">
            <el-date-picker
              v-model="searchForm.start_date"
              type="date"
              placeholder="选择开始日期"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              clearable
              style="width: 100%;"
            />
          </el-form-item>
          <el-form-item label="结束日期" class="search-form-item">
            <el-date-picker
              v-model="searchForm.end_date"
              type="date"
              placeholder="选择结束日期"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              clearable
              style="width: 100%;"
            />
          </el-form-item>
          <el-form-item label="位置配置" class="search-form-item">
            <el-select v-model="searchForm.position_config_id" placeholder="全部位置" clearable filterable style="width: 100%;">
              <el-option
                v-for="config in positionConfigs"
                :key="config.id"
                :label="config.name"
                :value="config.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item class="search-form-item search-form-actions">
            <el-button type="primary" :loading="searchLoading" @click="loadData">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </div>
      </el-form>

      <el-table :data="tableData" border style="width: 100%" v-loading="tableLoading" class="records-table">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="tourist.name" label="游客姓名" min-width="100" show-overflow-tooltip />
        <el-table-column prop="tourist.phone" label="游客手机" width="120" />
          <el-table-column label="位置/图片" min-width="150" show-overflow-tooltip>
            <template slot-scope="scope">
              <div v-if="scope.row.incense_type?.type === 'banner'">
                <img v-if="scope.row.image_url" :src="scope.row.image_url" style="max-width: 120px; max-height: 80px; border-radius: 4px;" />
                <span v-else>-</span>
              </div>
              <span v-else style="word-break: break-word;">{{ scope.row.position_path || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="incense_type.name" label="香品" width="90" />
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
        <el-table-column prop="employee_name" label="办理员工" min-width="100" show-overflow-tooltip />
        <el-table-column label="操作" width="80" fixed="right">
          <template slot-scope="scope">
            <div class="table-actions">
              <el-button size="mini" @click="handleView(scope.row)">查看</el-button>
            </div>
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
        title="记录详情"
        :visible.sync="detailDialogVisible"
        width="640px"
      >
        <div v-if="currentRecord">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="记录编号">{{ currentRecord.record?.id || '-' }}</el-descriptions-item>
            <el-descriptions-item label="香品">{{ currentRecord.record?.incense_type?.name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="游客姓名">{{ currentRecord.record?.tourist?.name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="游客手机">{{ currentRecord.record?.tourist?.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="祝福语">{{ currentRecord.record?.blessing || '-' }}</el-descriptions-item>
            <el-descriptions-item label="位置">{{ currentRecord.record?.position_path || '-' }}</el-descriptions-item>
            <el-descriptions-item label="座位号">
              {{ currentRecord.record?.position?.name || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ formatDateTimeCN(currentRecord.record?.start_time) || '-' }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ formatDateTimeCN(currentRecord.record?.end_time) || '-' }}</el-descriptions-item>
            <el-descriptions-item label="剩余时间" :span="2">
              {{ currentRecord.remaining_time || '—' }}
            </el-descriptions-item>
          </el-descriptions>

          <el-divider />

          <el-descriptions :column="2" border size="small" title="办理信息" style="margin-top: 8px;">
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
import { adminApi, commonApi } from '@/api'
import dayjs from 'dayjs'

export default {
  name: 'AdminIncenseRecords',
  data() {
    return {
      tableData: [],
      employees: [],
      positions: [],
      positionConfigs: [],
      searchForm: {
        employee_id: null,
        position_id: null,
        start_date: null,
        end_date: null,
        position_config_id: null
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
    this.loadEmployees()
    this.loadPositions()
    this.loadPositionConfigs()
    this.loadData()
  },
  methods: {
    // 统一时间展示格式：YYYY年MM月DD日HH时
    formatDateTimeCN(datetime) {
      if (!datetime) return ''
      const d = dayjs(datetime)
      if (!d.isValid()) return ''
      return d.format('YYYY年MM月DD日HH时')
    },
    async loadEmployees() {
      try {
        const res = await adminApi.employees.list({ page_size: 1000 })
        if (res.code === 200) {
          this.employees = res.data?.list || []
        }
      } catch (error) {
        console.error('加载员工列表失败:', error)
      }
    },
    async loadPositions() {
      try {
        const res = await adminApi.positions.list({ page_size: 1000 })
        if (res.code === 200) {
          this.positions = res.data || []
        }
      } catch (error) {
        console.error('加载座位列表失败:', error)
      }
    },
    async loadPositionConfigs() {
      try {
        const res = await adminApi.positionConfigs.list({ status: 1 })
        if (res.code === 200) {
          this.positionConfigs = res.data || []
        }
      } catch (error) {
        console.error('加载位置配置列表失败:', error)
      }
    },
    async loadData() {
      this.searchLoading = true
      this.tableLoading = true
      try {
        const params = {
          page: this.pagination.page,
          page_size: this.pagination.page_size,
          ...this.searchForm
        }
        const res = await adminApi.incenseRecords.list(params)
        if (res.code === 200) {
          this.tableData = res.data?.list || []
          this.pagination.total = res.data?.total || 0
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        this.searchLoading = false
        this.tableLoading = false
      }
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
        employee_id: null,
        position_id: null,
        start_date: null,
        end_date: null,
        position_config_id: null
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
    async exportToCSV() {
      if (!this.searchForm.start_date || !this.searchForm.end_date) {
        this.$message.warning('请先选择开始日期和结束日期')
        return
      }

      try {
        const loading = this.$loading({
          lock: true,
          text: '正在导出数据...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })

        const params = {
          start_date: this.searchForm.start_date,
          end_date: this.searchForm.end_date,
          position_config_id: this.searchForm.position_config_id || undefined
        }

        const res = await adminApi.incenseRecords.exportCSV(params)

        // 处理blob响应
        const blob = res instanceof Blob ? res : new Blob([res], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)

        link.setAttribute('href', url)
        link.setAttribute('download', `incense_records_${this.searchForm.start_date}_${this.searchForm.end_date}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        loading.close()
        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败，请稍后重试')
      }
    }
  }
}
</script>

<style scoped>
.search-form {
  width: 100%;
}

.search-form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
}

.search-form-item {
  flex: 1;
  min-width: 180px;
  margin-bottom: 0;
}

.search-form-actions {
  flex: 0 0 auto;
  min-width: auto;
  display: flex;
  gap: 0.5rem;
  white-space: nowrap;
}

.records-table {
  width: 100%;
}

.table-actions {
  white-space: nowrap;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .search-form-row {
    flex-wrap: wrap;
  }

  .search-form-item {
    min-width: calc(50% - 0.5rem);
  }

  .search-form-actions {
    width: 100%;
    justify-content: stretch;
  }

  .search-form-actions .el-button {
    flex: 1;
  }
  
  .records-table {
    font-size: 12px;
  }
}
</style>

