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
        <el-form-item>
          <el-button type="primary" style="width: 100%;" :loading="loading" @click="handleQuery">
            查询
          </el-button>
        </el-form-item>
      </el-form>

      <div v-if="records.length > 0" style="margin-top: 30px;">
        <h4>查询结果：</h4>
        <el-table :data="records" border style="width: 100%">
          <el-table-column prop="position_path" label="位置" />
          <el-table-column prop="incense_type_name" label="香品" />
          <el-table-column prop="start_time" label="开始时间" width="180" />
          <el-table-column prop="end_time" label="结束时间" width="180" />
          <el-table-column prop="remaining_time" label="剩余时间" />
        </el-table>
      </div>
      <div v-else-if="searched" style="text-align: center; padding: 40px; color: #999;">
        未找到相关记录
      </div>
    </div>
  </div>
</template>

<script>
import { publicApi } from '@/api'

export default {
  name: 'PublicRecords',
  data() {
    return {
      loading: false,
      searched: false,
      form: {
        name: '',
        phone: ''
      },
      records: [],
      rules: {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async handleQuery() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.loading = true
          this.searched = false
          try {
            const res = await publicApi.touristRecords(this.form)
            if (res.code === 200) {
              this.records = res.data || []
              this.searched = true
            }
          } catch (error) {
            console.error('查询失败:', error)
            this.searched = true
          } finally {
            this.loading = false
          }
        }
      })
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
</style>


