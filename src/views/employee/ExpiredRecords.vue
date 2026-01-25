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
        title="记录详情"
        :visible.sync="detailDialogVisible"
        width="700px"
      >
        <div v-if="currentRecord">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="记录编号">{{ currentRecord.record?.id || '-' }}</el-descriptions-item>
            <el-descriptions-item label="香品">{{ currentRecord.record?.incense_type?.name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="游客姓名">{{ currentRecord.record?.tourist?.name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="游客手机">{{ currentRecord.record?.tourist?.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="身份证号" :span="2">
              {{ currentRecord.record?.tourist?.id_card || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="祝福语" :span="2">
              {{ currentRecord.record?.blessing || '-' }}
            </el-descriptions-item>
            <el-descriptions-item v-if="currentRecord.record?.incense_type?.type === 'banner'" label="锦旗图片" :span="2">
              <img v-if="currentRecord.record.image_url" :src="currentRecord.record.image_url" style="max-width: 300px; max-height: 200px; border-radius: 4px;" />
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item v-if="currentRecord.record?.incense_type?.type !== 'banner'" label="位置" :span="2">
              {{ currentRecord.record?.position_path || '-' }}
            </el-descriptions-item>
            <el-descriptions-item v-if="currentRecord.record?.incense_type?.type !== 'banner'" label="座位号">
              {{ currentRecord.record?.position?.name || '-' }}
            </el-descriptions-item>
            <el-descriptions-item v-if="currentRecord.record?.incense_type?.type !== 'banner'" label="区域">
              {{ currentRecord.record?.position_config_name || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ formatDateTimeCN(currentRecord.record?.start_time) || '-' }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ formatDateTimeCN(currentRecord.record?.end_time) || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态" :span="2">
              <el-tag type="danger">已到期</el-tag>
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
import { employeeApi, commonApi } from '@/api'
import dayjs from 'dayjs'

export default {
  name: 'EmployeeExpiredRecords',
  data() {
    return {
      tableData: [],
      searchForm: {
        start_date: null,
        end_date: null
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
      this.handleView({ id: parseInt(this.$route.query.id) })
    } else {
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
        const params = {
          page: this.pagination.page,
          page_size: this.pagination.page_size,
          ...this.searchForm
        }
        const res = await employeeApi.incenseRecords.myExpired(params)
        if (res.code === 200) {
          this.tableData = res.data?.list || []
          this.pagination.total = res.data?.total || 0
        }
      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error('加载数据失败，请重试')
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
        start_date: null,
        end_date: null
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
    }
  }
}
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
}
</style>

