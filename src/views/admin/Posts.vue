<template>
  <div class="page-container">
    <div class="card-container">
      <div class="table-header">
        <h3>岗位管理</h3>
        <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
          创建岗位
        </el-button>
      </div>
      
      <el-table :data="tableData" border style="width: 100%" v-loading="tableLoading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="岗位名称" />
        <el-table-column prop="code" label="岗位代码" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="sort_order" label="排序" width="100" />
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
              <el-button size="mini" type="primary" @click="handleAssignAreas(scope.row)">分配区域</el-button>
              <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分配区域对话框 -->
    <el-dialog
      title="为岗位分配区域"
      :visible.sync="assignAreasDialogVisible"
      width="600px"
      :close-on-click-modal="false"
      @close="resetAssignAreasForm"
    >
      <div v-if="currentPost">
        <p style="margin-bottom: 15px;">
          <strong>岗位：</strong>{{ currentPost.name }}
        </p>
        <el-form label-width="120px">
          <el-form-item label="选择区域">
            <el-select
              v-model="assignAreasForm.position_config_ids"
              multiple
              placeholder="请选择区域（可多选）"
              style="width: 100%"
            >
              <el-option
                v-for="config in allPositionConfigs"
                :key="config.id"
                :label="config.name"
                :value="config.id"
              />
            </el-select>
            <div style="color: #909399; font-size: 12px; margin-top: 5px;">
              提示：选择区域后，将替换岗位原有的区域关联
            </div>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="assignAreasDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitAssignAreas" :loading="assignAreasSubmitting">确定</el-button>
      </div>
    </el-dialog>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
      @close="resetForm"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="岗位名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="岗位代码" prop="code">
          <el-input v-model="form.code" placeholder="请输入岗位代码" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="form.sort_order" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="关联区域">
          <el-select
            v-model="form.position_config_ids"
            multiple
            placeholder="请选择区域（可多选，可选）"
            style="width: 100%"
          >
            <el-option
              v-for="config in allPositionConfigs"
              :key="config.id"
              :label="config.name"
              :value="config.id"
            />
          </el-select>
          <div style="color: #909399; font-size: 12px; margin-top: 5px;">
            提示：创建时可选择区域，也可创建后通过"分配区域"功能来分配
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { adminApi } from '@/api'

export default {
  name: 'AdminPosts',
  data() {
    return {
      tableData: [],
      dialogVisible: false,
      dialogTitle: '创建岗位',
      form: {
        id: null,
        name: '',
        code: '',
        description: '',
        sort_order: 0,
        status: 1,
        position_config_ids: []
      },
      rules: {
        name: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
        code: [{ required: true, message: '请输入岗位代码', trigger: 'blur' }]
      },
      // 分配区域相关
      assignAreasDialogVisible: false,
      assignAreasSubmitting: false,
      currentPost: null,
      allPositionConfigs: [],
      assignAreasForm: {
        position_config_ids: []
      },
      tableLoading: false
    }
  },
  mounted() {
    this.loadData()
    this.loadAllPositionConfigs()
  },
  methods: {
    async loadData() {
      this.tableLoading = true
      try {
        const res = await adminApi.posts.list()
        if (res.code === 200) {
          this.tableData = res.data || []
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        this.tableLoading = false
      }
    },
    handleCreate() {
      this.dialogTitle = '创建岗位'
      this.dialogVisible = true
    },
    async handleEdit(row) {
      this.dialogTitle = '编辑岗位'
      // 加载岗位详情，获取关联的区域
      try {
        const res = await adminApi.posts.detail(row.id)
        if (res.code === 200 && res.data) {
          const post = res.data
          this.form = {
            id: post.id,
            name: post.name,
            code: post.code,
            description: post.description || '',
            sort_order: post.sort_order || 0,
            status: post.status,
            position_config_ids: post.position_configs 
              ? post.position_configs.filter(config => config.status === 1).map(config => config.id)
              : []
          }
        } else {
          this.form = { ...row, position_config_ids: [] }
        }
      } catch (error) {
        console.error('获取岗位详情失败:', error)
        this.form = { ...row, position_config_ids: [] }
      }
      this.dialogVisible = true
    },
    async handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            if (this.form.id) {
              await adminApi.posts.update(this.form.id, this.form)
              this.$message.success('更新成功')
            } else {
              await adminApi.posts.create(this.form)
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
      this.$confirm('确定要删除该岗位吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await adminApi.posts.delete(row.id)
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
        code: '',
        description: '',
        sort_order: 0,
        status: 1,
        position_config_ids: []
      }
    },
    // 加载所有位置配置（用于分配区域）
    async loadAllPositionConfigs() {
      try {
        const res = await adminApi.positionConfigs.list({ status: 1 })
        if (res.code === 200) {
          this.allPositionConfigs = res.data || []
        }
      } catch (error) {
        console.error('加载位置配置失败:', error)
      }
    },
    // 打开分配区域对话框
    async handleAssignAreas(row) {
      this.currentPost = row
      this.assignAreasDialogVisible = true
      
      // 加载岗位详情，获取当前已分配的区域
      try {
        const res = await adminApi.posts.detail(row.id)
        if (res.code === 200 && res.data) {
          const post = res.data
          if (post.position_configs && post.position_configs.length > 0) {
            // 预填充已分配的区域ID
            this.assignAreasForm.position_config_ids = post.position_configs
              .filter(config => config.status === 1)
              .map(config => config.id)
          } else {
            this.assignAreasForm.position_config_ids = []
          }
        }
      } catch (error) {
        console.error('获取岗位详情失败:', error)
        this.assignAreasForm.position_config_ids = []
      }
    },
    // 提交分配区域
    async handleSubmitAssignAreas() {
      if (!this.assignAreasForm.position_config_ids || this.assignAreasForm.position_config_ids.length === 0) {
        this.$message.warning('请至少选择一个区域')
        return
      }
      
      this.assignAreasSubmitting = true
      try {
        await adminApi.posts.assignAreas(this.currentPost.id, {
          position_config_ids: this.assignAreasForm.position_config_ids
        })
        this.$message.success('分配区域成功')
        this.assignAreasDialogVisible = false
        this.loadData() // 重新加载数据
      } catch (error) {
        console.error('分配区域失败:', error)
      } finally {
        this.assignAreasSubmitting = false
      }
    },
    // 重置分配区域表单
    resetAssignAreasForm() {
      this.currentPost = null
      this.assignAreasForm = {
        position_config_ids: []
      }
    }
  }
}
</script>


