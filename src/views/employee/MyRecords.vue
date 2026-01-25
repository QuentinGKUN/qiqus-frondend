<template>
  <div class="page-container">
    <div class="card-container">
      <div class="table-header">
        <h3>我的记录</h3>
        <el-button type="warning" size="small" @click="handleViewExpired">查看到期记录</el-button>
      </div>

      <el-table :data="tableData" border style="width: 100%" v-loading="tableLoading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="tourist.name" label="游客姓名" />
        <el-table-column prop="tourist.phone" label="游客手机" />
          <el-table-column label="位置/图片" width="200">
            <template slot-scope="scope">
              <div v-if="scope.row.incense_type?.type === 'banner'">
                <img v-if="scope.row.image_url" :src="scope.row.image_url" style="max-width: 150px; max-height: 100px; border-radius: 4px;" />
                <span v-else>-</span>
              </div>
              <span v-else>{{ scope.row.position_path || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="incense_type.name" label="香品" />
        <el-table-column label="开始时间" width="220">
          <template slot-scope="scope">
            {{ formatDateTimeCN(scope.row.start_time) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="结束时间" width="220">
          <template slot-scope="scope">
            {{ formatDateTimeCN(scope.row.end_time) || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="blessing" label="祝福语" />
        <el-table-column label="操作" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleView(scope.row)">查看</el-button>
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
            <el-descriptions-item label="记录编号">{{ currentRecord.record.id }}</el-descriptions-item>
          <el-descriptions-item label="香品">{{ currentRecord.record.incense_type?.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="游客姓名">{{ currentRecord.record.tourist?.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="游客手机">{{ currentRecord.record.tourist?.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="祝福语">{{ currentRecord.record.blessing || '-' }}</el-descriptions-item>
            <el-descriptions-item v-if="currentRecord.record.incense_type?.type === 'banner'" label="锦旗图片" :span="2">
              <img v-if="currentRecord.record.image_url" :src="currentRecord.record.image_url" style="max-width: 300px; max-height: 200px; border-radius: 4px;" />
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item v-if="currentRecord.record.incense_type?.type !== 'banner'" label="位置">{{ currentRecord.record.position_path || '-' }}</el-descriptions-item>
            <el-descriptions-item v-if="currentRecord.record.incense_type?.type !== 'banner'" label="座位号">
              {{ currentRecord.record.position?.name || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ formatDateTimeCN(currentRecord.record.start_time) || '-' }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ formatDateTimeCN(currentRecord.record.end_time) || '-' }}</el-descriptions-item>
            <el-descriptions-item label="剩余时间" :span="2">
              {{ currentRecord.remaining_time || '—' }}
            </el-descriptions-item>
          </el-descriptions>

          <el-divider />

          <el-descriptions :column="2" border size="small" title="办理信息" style="margin-top: 8px;">
            <el-descriptions-item label="经办人">{{ currentRecord.record.employee_name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="工号">{{ currentRecord.record.employee_username || '-' }}</el-descriptions-item>
            <el-descriptions-item label="岗位">{{ currentRecord.record.post_name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDateTimeCN(currentRecord.record.created_at) || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div v-else style="text-align: center; padding: 40px; color: #999;">
          加载中...
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="detailDialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 到期记录弹窗 -->
      <el-dialog
        title="到期记录查询"
        :visible.sync="expiredDialogVisible"
        width="1200px"
        :close-on-click-modal="false"
      >
        <div style="margin-bottom: 20px;">
          <el-date-picker
            v-model="expiredDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            @change="handleExpiredDateChange"
            style="width: 300px;"
          />
          <span style="color: #909399; font-size: 12px; margin-left: 10px;">
            不选择日期则查询最近30天到期的记录
          </span>
        </div>

        <el-table :data="expiredData" border style="width: 100%" v-loading="expiredLoading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="tourist.name" label="游客姓名" />
          <el-table-column prop="tourist.phone" label="游客手机" />
          <el-table-column label="位置/图片" width="200">
            <template slot-scope="scope">
              <div v-if="scope.row.incense_type?.type === 'banner'">
                <img v-if="scope.row.image_url" :src="scope.row.image_url" style="max-width: 150px; max-height: 100px; border-radius: 4px;" />
                <span v-else>-</span>
              </div>
              <span v-else>{{ scope.row.position_path || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="incense_type.name" label="香品" />
          <el-table-column label="开始时间" width="180">
            <template slot-scope="scope">
              {{ formatDateTimeCN(scope.row.start_time) || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="结束时间" width="180">
            <template slot-scope="scope">
              {{ formatDateTimeCN(scope.row.end_time) || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="blessing" label="祝福语" />
        </el-table>

        <el-pagination
          style="margin-top: 20px; text-align: right;"
          :current-page="expiredPagination.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="expiredPagination.page_size"
          :total="expiredPagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleExpiredSizeChange"
          @current-change="handleExpiredPageChange"
        />

        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="expiredDialogVisible = false">关 闭</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { employeeApi, commonApi } from '@/api'
import dayjs from 'dayjs'

export default {
  name: 'EmployeeMyRecords',
  data() {
    return {
      tableData: [],
      pagination: {
        page: 1,
        page_size: 10,
        total: 0
      },
      detailDialogVisible: false,
      currentRecord: null,
      tableLoading: false,
      expiredDialogVisible: false,
      expiredData: [],
      expiredPagination: {
        page: 1,
        page_size: 10,
        total: 0
      },
      expiredLoading: false,
      expiredDateRange: []
    }
  },
  mounted() {
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
    async loadData() {
      this.tableLoading = true
      try {
        const params = {
          page: this.pagination.page,
          page_size: this.pagination.page_size
        }
        const res = await employeeApi.incenseRecords.myList(params)
        if (res.code === 200) {
          this.tableData = res.data?.list || []
          this.pagination.total = res.data?.total || 0
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        this.tableLoading = false
      }
    },
    handleView(row) {
      commonApi.incenseRecordDetail(row.id).then(res => {
        if (res.code === 200) {
          this.currentRecord = res.data || null
          this.detailDialogVisible = true
        }
      })
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
    // 查看到期记录
    handleViewExpired() {
      this.expiredDialogVisible = true
      this.expiredDateRange = []
      this.expiredPagination.page = 1
      this.loadExpiredData()
    },
    async loadExpiredData() {
      this.expiredLoading = true
      try {
        const params = {
          page: this.expiredPagination.page,
          page_size: this.expiredPagination.page_size
        }
        
        // 如果选择了日期范围，添加到参数中
        if (this.expiredDateRange && this.expiredDateRange.length === 2) {
          params.start_date = this.expiredDateRange[0]
          params.end_date = this.expiredDateRange[1]
        }
        
        const res = await employeeApi.incenseRecords.myExpired(params)
        if (res.code === 200) {
          this.expiredData = res.data?.list || []
          this.expiredPagination.total = res.data?.total || 0
        }
      } catch (error) {
        console.error('加载到期记录失败:', error)
      } finally {
        this.expiredLoading = false
      }
    },
    handleExpiredDateChange() {
      this.expiredPagination.page = 1
      this.loadExpiredData()
    },
    handleExpiredSizeChange(val) {
      this.expiredPagination.page_size = val
      this.expiredPagination.page = 1
      this.loadExpiredData()
    },
    handleExpiredPageChange(val) {
      this.expiredPagination.page = val
      this.loadExpiredData()
    }
  }
}
</script>


