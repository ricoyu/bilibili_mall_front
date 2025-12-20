<template>
  <div class="brand-management">
    <div class="page-header">
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="品牌名"
          style="width: 200px"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" style="margin-left: 10px" @click="handleSearch">
          查询
        </el-button>
      </div>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增
      </el-button>
    </div>

    <div class="table-container">
      <el-table
        :data="tableData"
        style="width: 100%"
        border
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="brandId" label="品牌id" width="100" align="center" />
        <el-table-column prop="name" label="品牌名" width="150" show-overflow-tooltip />
        <el-table-column prop="logo" label="品牌logo" width="120" align="center">
          <template #default="{ row }">
            <img
              v-if="row.logo"
              :src="row.logo"
              alt="品牌logo"
              class="brand-logo-img"
            />
            <span v-else class="no-logo">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="descript" label="介绍" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.descript || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="showStatus" label="显示状态" width="120" align="center">
          <template #default="{ row }">
            <div class="toggle-switch-wrapper">
              <div
                class="toggle-switch"
                :class="{ 'toggle-switch-on': row.showStatus === 1 }"
                @click="handleToggleShowStatus(row)"
              >
                <div class="toggle-handle"></div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="firstLetter" label="检索首字母" width="120" align="center">
          <template #default="{ row }">
            {{ row.firstLetter || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="100" align="center" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="handleEdit(row)"
            >
              修改
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 新增/修改品牌对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="110px"
      >
        <el-form-item label="品牌名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入品牌名" />
        </el-form-item>
        <el-form-item label="品牌logo" prop="logo">
          <div class="logo-uploader-wrapper">
            <el-upload
              class="logo-uploader"
              :show-file-list="false"
              :auto-upload="true"
              :before-upload="beforeLogoUpload"
              :http-request="handleLogoUpload"
              accept="image/*"
            >
              <img v-if="formData.logo" :src="formData.logo" class="logo-preview" />
              <div v-else class="logo-placeholder">
                <el-icon class="logo-uploader-icon" :class="{ 'is-loading': logoUploading }">
                  <Plus />
                </el-icon>
                <div class="logo-text">{{ logoUploading ? '上传中...' : '点击上传' }}</div>
              </div>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="介绍" prop="descript">
          <el-input v-model="formData.descript" placeholder="介绍" />
        </el-form-item>
        <el-form-item label="显示状态" prop="showStatus">
          <el-select v-model="formData.showStatus" placeholder="请选择显示状态" style="width: 100%">
            <el-option label="不显示" :value="0" />
            <el-option label="显示" :value="1" />
          </el-select>
          <div style="color: #909399; font-size: 12px; margin-top: 5px;">
            [0-不显示; 1-显示]
          </div>
        </el-form-item>
        <el-form-item label="检索首字母" prop="firstLetter">
          <el-input v-model="formData.firstLetter" placeholder="检索首字母" maxlength="1" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" placeholder="排序" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getBrandList, createBrand, updateBrand, uploadCeph, switchBrandShowStatus, searchBrand } from '../utils/api'

const loading = ref(false)
const tableData = ref([])
const searchKeyword = ref('')
const selectedRows = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增')
const formRef = ref(null)
const isEdit = ref(false)
const currentEditId = ref(null)
const logoUploading = ref(false)

// 表单数据
const formData = ref({
  name: '',
  logo: '',
  descript: '',
  showStatus: null,
  firstLetter: '',
  sort: 0
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入品牌名', trigger: 'blur' }],
  logo: [
    {
      required: true,
      message: '请上传品牌logo',
      trigger: 'change'
    }
  ],
  descript: [{ required: true, message: '请输入介绍', trigger: 'blur' }],
  showStatus: [{ required: true, message: '请选择显示状态', trigger: 'blur' }],
  firstLetter: [{ required: true, message: '请输入检索首字母', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}

const beforeLogoUpload = (file) => {
  const isImage = file.type?.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  // 可按需限制大小，例如 5MB
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }
  return true
}

const handleLogoUpload = async (options) => {
  const { file } = options
  logoUploading.value = true
  try {
    const url = await uploadCeph(file)
    formData.value.logo = url
    ElMessage.success('上传成功')
    // 触发校验
    await formRef.value?.validateField?.('logo')
  } catch (e) {
    ElMessage.error(e.message || '上传失败')
  } finally {
    logoUploading.value = false
  }
}

// 分页信息
const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})

// 加载品牌数据
const loadBrandData = async () => {
  loading.value = true
  try {
    // 使用搜索接口，默认按品牌名模糊搜索
    const searchParams = {
      name: searchKeyword.value || '',
      pageNum: pagination.value.current,
      pageSize: pagination.value.size
    }
    const result = await searchBrand(searchParams)
    tableData.value = result.list || []
    // 使用返回的page属性更新分页信息
    if (result.page) {
      pagination.value.total = result.page.total || 0
    }
  } catch (error) {
    ElMessage.error('加载品牌数据失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.current = 1
  loadBrandData()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.value.size = size
  pagination.value.current = 1
  loadBrandData()
}

// 当前页改变
const handleCurrentChange = (page) => {
  pagination.value.current = page
  loadBrandData()
}

// 选择改变
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增'
  currentEditId.value = null
  formData.value = {
    name: '',
    logo: '',
    descript: '',
    showStatus: null,
    firstLetter: '',
    sort: 0
  }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  if (logoUploading.value) {
    ElMessage.warning('品牌logo正在上传中，请稍后再提交')
    return
  }
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 准备提交的数据
        const submitData = {
          name: formData.value.name,
          logo: formData.value.logo,
          descript: formData.value.descript,
          showStatus: formData.value.showStatus === 1 || formData.value.showStatus === true,
          firstLetter: formData.value.firstLetter,
          sort: formData.value.sort ?? 0
        }
        
        if (isEdit.value) {
          // 修改品牌，需要传递brandId
          submitData.brandId = currentEditId.value
          await updateBrand(submitData)
          ElMessage.success('修改成功')
        } else {
          // 新增品牌
          await createBrand(submitData)
          ElMessage.success('新增成功')
        }
        
        dialogVisible.value = false
        loadBrandData()
      } catch (error) {
        ElMessage.error(error.message || (isEdit.value ? '修改失败' : '新增失败'))
      }
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
  isEdit.value = false
  currentEditId.value = null
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '修改'
  currentEditId.value = row.brandId
  formData.value = {
    name: row.name,
    logo: row.logo || '',
    descript: row.descript || '',
    showStatus: row.showStatus === 1 || row.showStatus === true ? 1 : 0,
    firstLetter: row.firstLetter || '',
    sort: row.sort ?? 0
  }
  dialogVisible.value = true
}

// 切换显示状态
const handleToggleShowStatus = async (row) => {
  try {
    const newStatus = row.showStatus === 1 ? 0 : 1
    await switchBrandShowStatus(row.brandId, newStatus)
    // 更新本地数据
    row.showStatus = newStatus
    ElMessage.success('切换成功')
  } catch (error) {
    ElMessage.error(error.message || '切换失败')
  }
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除品牌"${row.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.info('删除功能待实现')
  }).catch(() => {
    // 取消删除
  })
}

onMounted(() => {
  loadBrandData()
})
</script>

<style scoped>
.brand-management {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.search-box {
  display: flex;
  align-items: center;
}

.table-container {
  flex: 1;
  padding: 20px;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.logo-uploader-wrapper {
  width: 100%;
}

.logo-uploader {
  display: inline-block;
}

.logo-preview {
  width: 96px;
  height: 96px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.logo-placeholder {
  width: 96px;
  height: 96px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  cursor: pointer;
}

.logo-uploader-icon {
  font-size: 26px;
}

.logo-text {
  margin-top: 6px;
  font-size: 12px;
}

.logo-hint {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

:deep(.el-table) {
  font-size: 14px;
  width: 100%;
}

:deep(.el-table__body-wrapper) {
  width: 100%;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
}

.toggle-switch-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.toggle-switch {
  position: relative;
  width: 36px;
  height: 18px;
  background-color: #dc3545;
  border-radius: 9px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.toggle-switch-on {
  background-color: #28a745;
}

.toggle-handle {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  background-color: #fff;
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.toggle-switch-on .toggle-handle {
  transform: translateX(18px);
}

.brand-logo-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  display: block;
  margin: 0 auto;
}

.no-logo {
  color: #909399;
}
</style>

