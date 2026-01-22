<template>
  <div class="page-container">
    <div class="card-container">
      <div class="table-header">
        <h3>位置配置管理</h3>
        <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
          创建位置配置
        </el-button>
      </div>

      <el-table :data="tableData" border style="width: 100%" v-loading="tableLoading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="配置名称" />
        <el-table-column prop="type" label="类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.type === 'grid' ? 'success' : 'warning'">
              {{ scope.row.type === 'grid' ? '网格' : '自定义' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column label="操作"  fixed="right">
          <template slot-scope="scope">
            <div class="table-actions">
              <el-button size="mini" @click="handleView(scope.row)">查看</el-button>
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
      width="800px"
      @close="resetForm"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="配置名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入配置名称" />
        </el-form-item>
        <el-form-item label="布局配置" prop="layout_config">
          <div class="layout-toolbar">
            <div class="layout-quick-settings">
              <span>共有</span>
              <el-input-number
                v-model="quickRows"
                :min="1"
                :max="100"
                size="small"
                :controls="false"
                class="layout-quick-input"
              />
              <span>排，每排</span>
              <el-input-number
                v-model="quickCols"
                :min="1"
                :max="100"
                size="small"
                :controls="false"
                class="layout-quick-input"
              />
              <span>个座位</span>
              <el-button size="small" type="primary" @click="applyQuickLayout" style="margin-left: 8px;">
                一键生成
              </el-button>
            </div>
            <div class="layout-row-buttons">
              <el-button size="small" @click="handleAddRow">添加行</el-button>
              <el-button size="small" type="danger" @click="handleClearRows">清空</el-button>
            </div>
          </div>
          <!-- 图形化布局编辑 -->
          <div class="layout-visual">
            <div
              v-for="(row, index) in layoutRows"
              :key="row.row"
              class="layout-row"
            >
              <div class="layout-row-label">第{{ row.row }}排</div>
              <div class="layout-row-seats">
                <div
                  v-for="n in row.cols"
                  :key="n"
                  class="layout-seat-dot"
                ></div>
              </div>
              <div class="layout-row-actions">
                <el-button-group size="mini">
                  <el-button
                    icon="el-icon-minus"
                    @click="decreaseCols(index)"
                    :disabled="row.cols <= 1"
                  />
                  <el-button
                    icon="el-icon-plus"
                    @click="increaseCols(index)"
                  />
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    @click="handleRemoveRow(index)"
                  />
                </el-button-group>
              </div>
            </div>
            <div v-if="layoutRows.length === 0" class="layout-empty">
              请先点击「添加行」配置座位排布
            </div>
          </div>
        </el-form-item>
        <el-form-item label="配置图片" prop="image_url">
          <el-upload
            class="image-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeImageUpload"
            :http-request="handleImageUpload"
            accept="image/*"
          >
            <img v-if="form.image_url" :src="form.image_url" class="uploaded-image" />
            <i v-else class="el-icon-plus image-uploader-icon"></i>
          </el-upload>
          <div v-if="form.image_url" style="margin-top: 10px;">
            <el-button size="small" type="danger" @click="handleRemoveImage">删除图片</el-button>
          </div>
          <div style="margin-top: 5px; color: #909399; font-size: 12px;">
            支持 JPG、PNG 格式，建议尺寸不超过 2MB
          </div>
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

    <!-- 查看详情对话框（包含预览） -->
    <el-dialog
      title="位置配置详情"
      :visible.sync="viewDialogVisible"
      width="1000px"
      :close-on-click-modal="false"
    >
      <!-- 上方：查看信息 -->
      <div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ viewData.id }}</el-descriptions-item>
          <el-descriptions-item label="配置名称">{{ viewData.name }}</el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag :type="viewData.type === 'grid' ? 'success' : 'warning'">
              {{ viewData.type === 'grid' ? '网格' : '自定义' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="viewData.status === 1 ? 'success' : 'info'">
              {{ viewData.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ viewData.description || '-' }}</el-descriptions-item>
        </el-descriptions>
        <div v-if="viewData.image_url" style="margin-top: 20px;">
          <div style="margin-bottom: 10px; font-weight: 600;">配置图片：</div>
          <img :src="viewData.image_url" style="max-width: 100%; max-height: 400px; border-radius: 4px;" />
        </div>
      </div>

      <!-- 下方：预览 -->
      <el-divider content-position="left">位置预览</el-divider>
      <div v-if="viewLoading" style="text-align: center; padding: 40px; color: #999;">
        加载预览中...
      </div>
      <div v-else-if="previewSeatsByRow && Object.keys(previewSeatsByRow).length > 0">
        <SeatPicker
          :seats-by-row="previewSeatsByRow"
          :selected-seat-id="null"
          :disabled-seat-ids="previewDisabledSeatIds"
          :occupied-seat-ids="previewOccupiedSeatIds"
          stage-label="供奉台"
          row-label-prefix="第"
          row-label-suffix="排"
          :show-tooltip="true"
          :legends="[]"
        />
      </div>
      <div v-else style="text-align: center; padding: 40px; color: #999;">
        <p>暂无预览数据</p>
        <p style="font-size: 12px; color: #909399; margin-top: 10px;">
          提示：如果该配置还没有创建对应的座位，请先在"座位管理"中创建座位
        </p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { adminApi, commonApi } from '@/api'
import SeatPicker from '@/components/SeatPicker.vue'

export default {
  name: 'AdminPositionConfigs',
  components: {
    SeatPicker
  },
  data() {
    return {
      tableData: [],
      dialogVisible: false,
      viewDialogVisible: false,
      viewConfigId: null,
      viewLoading: false,
      previewSeatsByRow: null,
      previewDisabledSeatIds: [],
      previewOccupiedSeatIds: [],
      dialogTitle: '创建位置配置',
      uploading: false,
      form: {
        id: null,
        name: '',
        type: 'grid',
        layout_config: [],
        image_url: '',
        description: '',
        status: 1
      },
      layoutRows: [],
      // 自定义布局快捷配置：有多少行、每行多少个
      quickRows: 3,
      quickCols: 8,
      viewData: {},
      rules: {
        name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }]
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
        const res = await adminApi.positionConfigs.list()
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
      this.dialogTitle = '创建位置配置'
      this.layoutRows = [{ row: 1, cols: 8 }]
      this.dialogVisible = true
    },
    async handleView(row) {
      if (!row || !row.id) {
        this.$message.warning('未找到位置配置')
        return
      }
      
      // 打开对话框
      this.viewDialogVisible = true
      this.viewConfigId = row.id
      this.viewLoading = true
      
      // 重置预览数据
      this.previewSeatsByRow = null
      this.previewDisabledSeatIds = []
      this.previewOccupiedSeatIds = []
      
      try {
        // 同时加载详情和预览数据
        const [detailRes, previewRes] = await Promise.all([
          adminApi.positionConfigs.detail(row.id),
          adminApi.positions.getByConfig(row.id)
        ])
        
        if (detailRes.code === 200) {
          this.viewData = detailRes.data
        }
        
        if (previewRes.code === 200) {
          const seatsByRow = previewRes.data.seats_by_row || {}
          // 确保行号是字符串格式（SeatPicker 组件需要字符串键）
          const normalizedSeatsByRow = {}
          Object.keys(seatsByRow).forEach(key => {
            // 将行号转换为字符串，确保格式一致
            const rowKey = String(key)
            normalizedSeatsByRow[rowKey] = seatsByRow[key] || []
          })
          this.previewSeatsByRow = normalizedSeatsByRow
          
          // 提取不可用的上香位置ID
          Object.values(this.previewSeatsByRow).forEach(seats => {
            if (Array.isArray(seats)) {
              seats.forEach(seat => {
                if (seat && seat.status !== 1) {
                  this.previewDisabledSeatIds.push(seat.id)
                }
              })
            }
          })
          
          // 调试信息
          console.log('预览数据加载成功:', {
            configId: row.id,
            rowsCount: Object.keys(this.previewSeatsByRow).length,
            seatsByRow: this.previewSeatsByRow
          })
        } else {
          console.warn('预览数据加载失败:', previewRes.message)
          this.previewSeatsByRow = {}
        }
      } catch (error) {
        console.error('加载数据失败:', error)
        // 即使预览失败，也显示详情
        try {
          const detailRes = await adminApi.positionConfigs.detail(row.id)
          if (detailRes.code === 200) {
            this.viewData = detailRes.data
          }
        } catch (detailError) {
          console.error('加载详情失败:', detailError)
        }
        
        // 如果预览接口失败，尝试从配置的 layout_config 生成预览
        if (this.viewData && this.viewData.layout_config) {
          try {
            const layoutConfig = typeof this.viewData.layout_config === 'string' 
              ? JSON.parse(this.viewData.layout_config) 
              : this.viewData.layout_config
            
            if (Array.isArray(layoutConfig) && layoutConfig.length > 0) {
              // 根据 layout_config 生成模拟预览数据
              const mockSeatsByRow = {}
              layoutConfig.forEach((rowConfig, index) => {
                const rowNum = String(rowConfig.row || (index + 1))
                mockSeatsByRow[rowNum] = []
                for (let col = 1; col <= rowConfig.cols; col++) {
                  mockSeatsByRow[rowNum].push({
                    id: `mock-${rowNum}-${col}`,
                    name: `${String.fromCharCode(64 + parseInt(rowNum))}${col}`,
                    row: parseInt(rowNum),
                    col: col,
                    status: 1
                  })
                }
              })
              this.previewSeatsByRow = mockSeatsByRow
              console.log('使用 layout_config 生成预览数据:', mockSeatsByRow)
            }
          } catch (parseError) {
            console.error('解析 layout_config 失败:', parseError)
          }
        }
        
        this.$message.warning('预览数据加载失败，但已显示基本信息')
      } finally {
        this.viewLoading = false
      }
    },
    handleEdit(row) {
      this.dialogTitle = '编辑位置配置'
      this.form = { ...row }
      try {
        this.layoutRows = JSON.parse(row.layout_config || '[]')
      } catch (e) {
        this.layoutRows = []
      }
      this.dialogVisible = true
    },
    // 一键根据“多少行，每行多少个”生成布局
    applyQuickLayout() {
      if (!this.quickRows || !this.quickCols) {
        this.$message.warning('请先填写行数和每行座位数')
        return
      }
      const rows = []
      for (let i = 1; i <= this.quickRows; i++) {
        rows.push({ row: i, cols: this.quickCols })
      }
      this.layoutRows = rows
    },
    handleAddRow() {
      const maxRow = this.layoutRows.length > 0
        ? Math.max(...this.layoutRows.map(r => r.row))
        : 0
      this.layoutRows.push({ row: maxRow + 1, cols: 8 })
    },
    handleRemoveRow(index) {
      this.layoutRows.splice(index, 1)
    },
    handleClearRows() {
      this.$confirm('确定要清空所有行吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.layoutRows = []
      }).catch(() => {
        // 用户取消操作，无需处理
      })
    },
    increaseCols(index) {
      const row = this.layoutRows[index]
      if (!row) return
      row.cols += 1
    },
    decreaseCols(index) {
      const row = this.layoutRows[index]
      if (!row) return
      if (row.cols > 1) {
        row.cols -= 1
      }
    },
    async handleSubmit() {
      if (this.layoutRows.length === 0) {
        this.$message.warning('请至少添加一行布局配置')
        return
      }
      
      // 验证行号是否连续
      const rows = this.layoutRows.map(r => r.row).sort((a, b) => a - b)
      for (let i = 0; i < rows.length; i++) {
        if (rows[i] !== i + 1) {
          this.$message.warning('行号必须从1开始连续')
          return
        }
      }

      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            const formData = {
              ...this.form,
              layout_config: this.layoutRows
            }
            if (this.form.id) {
              await adminApi.positionConfigs.update(this.form.id, formData)
              this.$message.success('更新成功')
            } else {
              await adminApi.positionConfigs.create(formData)
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
      this.$confirm('确定要删除该位置配置吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await adminApi.positionConfigs.delete(row.id)
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
        type: 'grid',
        layout_config: [],
        image_url: '',
        description: '',
        status: 1
      }
      this.layoutRows = []
    },
    beforeImageUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB!')
        return false
      }
      return true
    },
    async handleImageUpload(options) {
      const file = options.file
      this.uploading = true
      try {
        const res = await commonApi.uploadImage(file)
        if (res.code === 200) {
          // 兼容不同的响应格式：res.data.url, res.data.path, res.data, res.url
          this.form.image_url = res.data?.url || res.data?.path || res.data || res.url || ''
          if (this.form.image_url) {
            this.$message.success('图片上传成功')
          } else {
            this.$message.warning('上传成功但未获取到图片地址，请检查后端响应格式')
            console.warn('上传响应:', res)
          }
        } else {
          this.$message.error(res.message || '图片上传失败')
        }
      } catch (error) {
        console.error('图片上传失败:', error)
        if (error.response) {
          this.$message.error(error.response.data?.message || '图片上传失败，请重试')
        } else {
          this.$message.error('图片上传失败，请检查网络连接或后端接口')
        }
      } finally {
        this.uploading = false
      }
    },
    handleRemoveImage() {
      this.form.image_url = ''
    }
  }
}
</script>

<style scoped>
.image-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}

.image-uploader:hover {
  border-color: #409EFF;
}

.image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.layout-visual {
  border: 1px solid #e6e0d8;
  border-radius: 8px;
  padding: 12px 12px 4px;
  background: #f9f6f0;
}

.layout-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.layout-row-label {
  width: 70px;
  text-align: center;
  font-weight: 600;
  color: var(--color-text);
}

.layout-row-seats {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 8px;
}

.layout-seat-dot {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: #fff;
  border: 1px solid #d9cbb8;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.layout-row-actions {
  width: 120px;
  text-align: right;
}

.layout-empty {
  padding: 16px;
  text-align: center;
  color: #b0a99f;
  font-size: 13px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .layout-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem; /* 8px */
  }

  .layout-row-label {
    width: 100%;
    text-align: left;
  }

  .layout-row-seats {
    width: 100%;
    padding: 0;
  }

  .layout-row-actions {
    width: 100%;
    text-align: left;
  }

  .image-uploader {
    width: 100%;
    max-width: 178px;
  }
}
</style>


