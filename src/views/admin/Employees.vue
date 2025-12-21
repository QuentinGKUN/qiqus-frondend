<template>
  <div class="page-container">
    <div class="card-container">
      <div class="table-header">
        <h3>员工管理</h3>
        <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
          创建员工
        </el-button>
      </div>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <div class="search-form-row">
          <el-form-item label="岗位" class="search-form-item">
            <el-select v-model="searchForm.post_id" placeholder="请选择岗位" clearable style="width: 100%;">
              <el-option
                v-for="post in posts"
                :key="post.id"
                :label="post.name"
                :value="post.id"
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
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="post.name" label="岗位" />
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
              <el-button size="mini" @click="handleChangePassword(scope.row)">改密</el-button>
              <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="岗位" prop="post_id">
          <el-select v-model="form.post_id" placeholder="请选择岗位" style="width: 100%">
            <el-option
              v-for="post in posts"
              :key="post.id"
              :label="post.name"
              :value="post.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!form.id">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <!-- <el-form-item label="短信验证码" prop="sms_code" v-if="!form.id">
          <el-input v-model="form.sms_code" placeholder="请输入短信验证码" style="width: 60%">
            <el-button slot="append" @click="handleSendSms" :disabled="smsLoading">
              {{ smsLoading ? '发送中...' : '发送验证码' }}
            </el-button>
          </el-input>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      title="修改密码"
      :visible.sync="passwordDialogVisible"
      width="400px"
    >
      <el-form
        ref="passwordForm"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="新密码" prop="password">
          <el-input v-model="passwordForm.password" type="password" placeholder="请输入新密码" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePasswordSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { adminApi, authApi } from '@/api'

export default {
  name: 'AdminEmployees',
  data() {
    return {
      tableData: [],
      posts: [],
      searchForm: {
        post_id: null,
        status: null
      },
      pagination: {
        page: 1,
        page_size: 10,
        total: 0
      },
      dialogVisible: false,
      passwordDialogVisible: false,
      dialogTitle: '创建员工',
      smsLoading: false,
      form: {
        id: null,
        name: '',
        phone: '',
        post_id: null,
        password: '',
        sms_code: ''
      },
      passwordForm: {
        id: null,
        password: ''
      },
      rules: {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        post_id: [{ required: true, message: '请选择岗位', trigger: 'change' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        sms_code: [{ required: true, message: '请输入短信验证码', trigger: 'blur' }]
      },
      passwordRules: {
        password: [{ required: true, message: '请输入新密码', trigger: 'blur' }]
      },
      tableLoading: false,
      searchLoading: false
    }
  },
  mounted() {
    this.loadPosts()
    this.loadData()
  },
  methods: {
    async loadPosts() {
      try {
        const res = await adminApi.posts.list()
        if (res.code === 200) {
          this.posts = res.data || []
        }
      } catch (error) {
        console.error('加载岗位列表失败:', error)
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
        const res = await adminApi.employees.list(params)
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
    handleCreate() {
      this.dialogTitle = '创建员工'
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑员工'
      this.form = {
        id: row.id,
        name: row.name,
        phone: row.phone,
        post_id: row.post_id
      }
      this.dialogVisible = true
    },
    async handleSendSms() {
      if (!this.form.phone) {
        this.$message.warning('请先输入手机号')
        return
      }
      if (!/^1[3-9]\d{9}$/.test(this.form.phone)) {
        this.$message.warning('请输入正确的手机号')
        return
      }
      this.smsLoading = true
      try {
        await authApi.sendSms({ phone: this.form.phone })
        this.$message.success('验证码已发送')
      } catch (error) {
        console.error('发送验证码失败:', error)
      } finally {
        this.smsLoading = false
      }
    },
    async handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            if (this.form.id) {
              await adminApi.employees.update(this.form.id, this.form)
              this.$message.success('更新成功')
            } else {
              await adminApi.employees.create(this.form)
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
    handleChangePassword(row) {
      this.passwordForm.id = row.id
      this.passwordForm.password = ''
      this.passwordDialogVisible = true
    },
    async handlePasswordSubmit() {
      this.$refs.passwordForm.validate(async (valid) => {
        if (valid) {
          try {
            await adminApi.employees.updatePassword(this.passwordForm.id, {
              password: this.passwordForm.password
            })
            this.$message.success('密码修改成功')
            this.passwordDialogVisible = false
          } catch (error) {
            console.error('修改密码失败:', error)
          }
        }
      })
    },
    async handleDelete(row) {
      this.$confirm('确定要删除该员工吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await adminApi.employees.delete(row.id)
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
        post_id: null,
        status: null
      }
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
    resetForm() {
      this.$refs.form?.resetFields()
      this.form = {
        id: null,
        name: '',
        phone: '',
        post_id: null,
        password: '',
        sms_code: ''
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


