<template>
  <div class="page-container">
    <div class="card-container">
      <div class="table-header">
        <h3>座位管理</h3>
        <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
          创建座位
        </el-button>
      </div>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form" label-width="5em">
        <div class="search-form-row">
          <el-form-item label="位置配置" class="search-form-item">
            <el-select v-model="searchForm.position_config_id" placeholder="请选择位置配置" clearable style="width: 100%;">
              <el-option
                v-for="config in configs"
                :key="config.id"
                :label="config.name"
                :value="config.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" class="search-form-item">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 100%;">
              <el-option label="启用" :value="1" />
              <el-option label="停用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item class="search-form-item search-form-actions">
            <el-button type="primary" :loading="searchLoading" @click="loadData">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </div>
      </el-form>

      <el-table :data="tableData" border style="width: 100%" v-loading="tableLoading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="position_config.name" label="位置配置" />
        <el-table-column prop="row" label="行号" width="80" />
        <el-table-column prop="col" label="列号" width="80" />
        <el-table-column prop="name" label="座位名称" />
        <el-table-column prop="capacity" label="容量" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column label="操作" fixed="right">
          <template slot-scope="scope">
            <div class="table-actions">
              <el-button size="mini" @click="handleView(scope.row)">查看</el-button>
              <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="mini" @click="handleHistory(scope.row)">历史</el-button>
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
        <el-form-item label="位置配置" prop="position_config_id">
          <el-select v-model="form.position_config_id" placeholder="请选择位置配置" style="width: 100%">
            <el-option
              v-for="config in configs"
              :key="config.id"
              :label="config.name"
              :value="config.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="行号" prop="row">
          <el-input-number v-model="form.row" :min="1" />
        </el-form-item>
        <el-form-item label="列号" prop="col">
          <el-input-number v-model="form.col" :min="1" />
        </el-form-item>
        <el-form-item label="座位名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入座位名称" />
        </el-form-item>
        <el-form-item label="容量" prop="capacity">
          <el-input-number v-model="form.capacity" :min="1" />
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

    <!-- 座位详情对话框 -->
    <el-dialog
      title="座位详情"
      :visible.sync="viewDialogVisible"
      width="640px"
    >
      <div v-if="viewData">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="座位ID">{{ viewData.id || '-' }}</el-descriptions-item>
          <el-descriptions-item label="座位名称">{{ viewData.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="位置配置">{{ viewData.position_config?.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="viewData.status === 1 ? 'success' : 'info'">
              {{ viewData.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="行号">{{ viewData.row || '-' }}</el-descriptions-item>
          <el-descriptions-item label="列号">{{ viewData.col || '-' }}</el-descriptions-item>
          <el-descriptions-item label="容量">{{ viewData.capacity || '-' }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ viewData.description || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <div v-else style="text-align: center; padding: 40px; color: #999;">
        加载中...
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="viewDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 历史记录对话框 -->
    <el-dialog
      title="座位占用历史"
      :visible.sync="historyDialogVisible"
      width="800px"
    >
      <el-table :data="historyData" border>
        <el-table-column prop="tourist.name" label="游客姓名" />
        <el-table-column prop="incense_type.name" label="香品" />
        <el-table-column prop="start_time" label="开始时间" />
        <el-table-column prop="end_time" label="结束时间" />
        <el-table-column prop="employee_name" label="办理员工" />
      </el-table>
    </el-dialog>

  </div>
</template>

<script>
import { adminApi } from '@/api'

export default {
  name: 'AdminPositions',
  data() {
    return {
      tableData: [],
      configs: [],
      searchForm: {
        position_config_id: null,
        status: null
      },
      dialogVisible: false,
      historyDialogVisible: false,
      viewDialogVisible: false,
      viewData: null,
      dialogTitle: '创建座位',
      form: {
        id: null,
        position_config_id: null,
        row: 1,
        col: 1,
        name: '',
        capacity: 1,
        description: '',
        status: 1
      },
      historyData: [],
      rules: {
        position_config_id: [{ required: true, message: '请选择位置配置', trigger: 'change' }],
        row: [{ required: true, message: '请输入行号', trigger: 'blur' }],
        col: [{ required: true, message: '请输入列号', trigger: 'blur' }],
        name: [{ required: true, message: '请输入座位名称', trigger: 'blur' }]
      },
      tableLoading: false,
      searchLoading: false
    }
  },
  mounted() {
    this.loadConfigs()
    this.loadData()
  },
  methods: {
    async loadConfigs() {
      try {
        const res = await adminApi.positionConfigs.list()
        if (res.code === 200) {
          this.configs = res.data || []
        }
      } catch (error) {
        console.error('加载位置配置列表失败:', error)
      }
    },
    async loadData() {
      this.searchLoading = true
      this.tableLoading = true
      try {
        const params = { ...this.searchForm }
        const res = await adminApi.positions.list(params)
        if (res.code === 200) {
          this.tableData = res.data || []
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        this.searchLoading = false
        this.tableLoading = false
      }
    },
    handleCreate() {
      this.dialogTitle = '创建座位'
      this.dialogVisible = true
    },
    handleView(row) {
      adminApi.positions.detail(row.id).then(res => {
        if (res.code === 200) {
          this.viewData = res.data
          this.viewDialogVisible = true
        }
      }).catch(error => {
        console.error('获取座位详情失败:', error)
        this.$message.error('获取座位详情失败')
      })
    },
    handleEdit(row) {
      this.dialogTitle = '编辑座位'
      this.form = { ...row }
      this.dialogVisible = true
    },
    async handleHistory(row) {
      try {
        const res = await adminApi.positions.getHistory(row.id)
        if (res.code === 200) {
          this.historyData = res.data || []
          this.historyDialogVisible = true
        }
      } catch (error) {
        console.error('加载历史记录失败:', error)
      }
    },
    async handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            if (this.form.id) {
              await adminApi.positions.update(this.form.id, this.form)
              this.$message.success('更新成功')
            } else {
              await adminApi.positions.create(this.form)
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
      this.$confirm('确定要删除该座位吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await adminApi.positions.delete(row.id)
          this.$message.success('删除成功')
          this.loadData()
        } catch (error) {
          console.error('删除失败:', error)
        }
      }).catch(() => {
        // 用户取消操作，无需处理
      })
    },
    resetSearch() {
      this.searchForm = {
        position_config_id: null,
        status: null
      }
      this.loadData()
    },
    resetForm() {
      this.$refs.form?.resetFields()
      this.form = {
        id: null,
        position_config_id: null,
        row: 1,
        col: 1,
        name: '',
        capacity: 1,
        description: '',
        status: 1
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
  gap: 1rem; /* 16px */
  width: 100%;
}

.search-form-item {
  flex: 1;
  min-width: calc(33.333% - 0.667rem); /* 33.333% - 16px gap / 3 */
  max-width: calc(33.333% - 0.667rem);
  margin-bottom: 0;
}

.search-form-actions {
  flex: 0 0 auto;
  min-width: auto;
  max-width: none;
  display: flex;
  gap: 0.5rem; /* 8px */
}

/* 移动端适配 */
@media (max-width: 768px) {
  .search-form-row {
    flex-direction: column;
    gap: 0.75rem; /* 12px */
  }

  .search-form-item {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    margin-bottom: 0.75rem; /* 12px */
  }

  .search-form-actions {
    width: 100%;
    justify-content: stretch;
  }

  .search-form-actions .el-button {
    flex: 1;
  }
}

/* 平板适配 */
@media (min-width: 769px) and (max-width: 992px) {
  .search-form-item {
    min-width: calc(50% - 0.5rem); /* 50% - 16px gap / 2 */
    max-width: calc(50% - 0.5rem);
  }

  .search-form-item:last-child {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
  }
}
</style>


