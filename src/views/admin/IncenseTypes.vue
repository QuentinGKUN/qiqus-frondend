<template>
  <div class="page-container">
    <div class="card-container">
      <div class="table-header">
        <h3>香品管理</h3>
        <el-button-group class="header-actions">
          <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
            创建香品
          </el-button>
          <el-button type="info" icon="el-icon-data-analysis" @click="handleStatistics">
            使用统计
          </el-button>
        </el-button-group>
      </div>

      <el-table :data="tableData" border style="width: 100%" v-loading="tableLoading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="香品名称" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="usage_count" label="使用次数" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right">
          <template slot-scope="scope">
            <div class="table-actions">
              <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="香品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入香品名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>

    <!-- 统计对话框 -->
    <el-dialog
      title="香品使用统计"
      :visible.sync="statisticsDialogVisible"
      width="800px"
    >
      <el-table
        :data="statisticsData"
        border
        style="width: 100%"
        v-loading="statisticsLoading"
      >
        <el-table-column prop="name" label="香品名称" />
        <el-table-column prop="usage_count" label="使用次数" width="150" align="right">
          <template slot-scope="scope">
            {{ formatNumber(scope.row.usage_count || 0) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { adminApi } from '@/api'

export default {
  name: 'AdminIncenseTypes',
  data() {
    return {
      tableData: [],
      dialogVisible: false,
      statisticsDialogVisible: false,
      dialogTitle: '创建香品',
      statisticsData: [],
      statisticsLoading: false,
      form: {
        id: null,
        name: '',
        description: '',
        status: 1
      },
      rules: {
        name: [{ required: true, message: '请输入香品名称', trigger: 'blur' }]
      },
      tableLoading: false
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.tableLoading = true
      try {
        const res = await adminApi.incenseTypes.list()
        if (res.code === 200) {
          this.tableData = res.data.list || []
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        this.tableLoading = false
      }
    },
    handleCreate() {
      this.dialogTitle = '创建香品'
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑香品'
      this.form = { ...row }
      this.dialogVisible = true
    },
    async handleStatistics() {
      this.statisticsDialogVisible = true
      this.statisticsLoading = true
      try {
        const res = await adminApi.incenseTypes.statistics()
        if (res.code === 200) {
          // 处理数据格式，确保是数组
          let data = res.data
          if (!Array.isArray(data)) {
            if (data && data.list) {
              data = data.list
            } else if (data && Array.isArray(data.data)) {
              data = data.data
            } else {
              data = []
            }
          }
          this.statisticsData = data || []
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
        this.statisticsData = []
      } finally {
        this.statisticsLoading = false
      }
    },
    formatNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    async handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            if (this.form.id) {
              await adminApi.incenseTypes.update(this.form.id, this.form)
              this.$message.success('更新成功')
            } else {
              await adminApi.incenseTypes.create(this.form)
              this.$message.success('创建成功')
            }
            this.dialogVisible = false
            this.loadData()
          } catch (error) {
            console.error('操作失败:', error)
          }
        }
      })
    },
    async handleDelete(row) {
      this.$confirm('确定要删除该香品吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await adminApi.incenseTypes.delete(row.id)
          this.$message.success('删除成功')
          this.loadData()
        } catch (error) {
          console.error('删除失败:', error)
        }
      }).catch(() => {
        // 用户取消操作，无需处理
      })
    },
    resetForm() {
      this.$refs.form?.resetFields()
      this.form = {
        id: null,
        name: '',
        description: '',
        status: 1
      }
    }
  }
}
</script>

<style scoped>
.header-actions {
  display: inline-flex;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .header-actions {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .header-actions .el-button {
    width: 100%;
    border-radius: 4px !important;
  }

  .header-actions .el-button:first-child {
    margin-bottom: 0.5rem;
  }
}
</style>


