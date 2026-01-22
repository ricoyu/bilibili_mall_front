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
        <el-table-column label="操作" width="220" align="center" fixed="right">
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
              type="success"
              link
              size="small"
              @click="handleAssociateCategory(row)"
            >
              关联分类
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
          <el-input
            v-model="formData.descript"
            type="textarea"
            :rows="4"
            placeholder="请输入品牌介绍"
            maxlength="500"
            show-word-limit
          />
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

    <!-- 关联分类对话框 -->
    <el-dialog
      v-model="categoryDialogVisible"
      title="关联分类"
      width="600px"
      @close="handleCategoryDialogClose"
    >
      <div class="category-association-header">
        <el-button type="primary" @click="openCategoryPicker">
          <el-icon><Plus /></el-icon>
          新增关联
        </el-button>
      </div>
      <el-table
        :data="associatedCategories"
        style="width: 100%"
        border
        v-loading="categoryLoading"
      >
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="brandName" label="品牌名" width="150" />
        <el-table-column prop="catelogName" label="分类名" min-width="200" />
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button
              type="danger"
              link
              size="small"
              @click="handleRemoveCategory(row)"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="categoryDialogVisible = false">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分类选择对话框 -->
    <el-dialog
      v-model="categoryPickerDialogVisible"
      title="选择分类"
      width="600px"
      @close="handleCategoryPickerClose"
    >
      <div class="category-picker-wrapper-dialog">
        <el-input
          v-model="selectedCategoryPath"
          placeholder="请选择"
          readonly
          style="margin-bottom: 16px"
        >
          <template #suffix>
            <el-icon><ArrowDown /></el-icon>
          </template>
        </el-input>
        <div class="category-picker-content">
          <div class="category-picker-columns">
            <!-- 一级分类 -->
            <div class="category-column">
              <div
                v-for="cat1 in categoryTree"
                :key="cat1.catId"
                class="category-item"
                :class="{ 'category-selected': selectedLevel1?.catId === cat1.catId }"
                @click="selectLevel1(cat1)"
              >
                <span>{{ cat1.name }}</span>
                <el-icon v-if="cat1.children && cat1.children.length > 0" class="arrow-right">
                  <ArrowRight />
                </el-icon>
              </div>
            </div>
            <!-- 二级分类 -->
            <div v-if="selectedLevel1" class="category-column">
              <div
                v-for="cat2 in selectedLevel1.children || []"
                :key="cat2.catId"
                class="category-item"
                :class="{ 'category-selected': selectedLevel2?.catId === cat2.catId }"
                @click="selectLevel2(cat2)"
              >
                <span>{{ cat2.name }}</span>
                <el-icon v-if="cat2.children && cat2.children.length > 0" class="arrow-right">
                  <ArrowRight />
                </el-icon>
              </div>
            </div>
            <!-- 三级分类 -->
            <div v-if="selectedLevel2" class="category-column">
              <div
                v-for="cat3 in selectedLevel2.children || []"
                :key="cat3.catId"
                class="category-item"
                :class="{ 'category-selected': selectedLevel3?.catId === cat3.catId }"
                @click="selectLevel3(cat3)"
              >
                <span>{{ cat3.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="categoryPickerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCategorySelection">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowDown, ArrowRight } from '@element-plus/icons-vue'
import { getBrandList, createBrand, updateBrand, uploadCeph, switchBrandShowStatus, searchBrand, getBrandCategoryList, saveBrandCategory, deleteBrandCategory, getCategoryTree } from '../utils/api'

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
const categoryDialogVisible = ref(false)
const categoryPickerDialogVisible = ref(false)
const categoryLoading = ref(false)
const associatedCategories = ref([])
const currentBrandId = ref(null)
const categoryTree = ref([])
const selectedLevel1 = ref(null)
const selectedLevel2 = ref(null)
const selectedLevel3 = ref(null)
const selectedCategoryPath = ref('')

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
  total: 0,
  totalPages: 0
})

// 加载品牌数据
const loadBrandData = async () => {
  loading.value = true
  try {
    let result
    if (searchKeyword.value) {
      // 有搜索关键词时，使用搜索接口
      const searchParams = {
        name: searchKeyword.value,
        pageNum: pagination.value.current,
        pageSize: pagination.value.size
      }
      result = await searchBrand(searchParams)
    } else {
      // 没有搜索关键词时，使用列表接口（后台已写死分页参数）
      result = await getBrandList()
    }
    tableData.value = result.list || []
    // 使用返回的page属性更新分页信息
    if (result.page) {
      pagination.value.total = result.page.total || 0
      pagination.value.totalPages = result.page.totalPages || 0
      // 如果返回了当前页码和每页大小，也更新（虽然后台写死了，但保持同步）
      if (result.page.pageNum) {
        pagination.value.current = result.page.pageNum
      }
      if (result.page.pageSize) {
        pagination.value.size = result.page.pageSize
      }
    }
  } catch (error) {
    ElMessage.error('加载品牌数据失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 分页切换时调用搜索接口
const handlePageChange = async () => {
  loading.value = true
  try {
    const searchParams = {
      name: searchKeyword.value || null,
      pageNum: pagination.value.current,
      pageSize: pagination.value.size
    }
    const result = await searchBrand(searchParams)
    tableData.value = result.list || []
    // 使用返回的page属性更新分页信息
    if (result.page) {
      pagination.value.total = result.page.total || 0
      pagination.value.totalPages = result.page.totalPages || 0
      if (result.page.pageNum) {
        pagination.value.current = result.page.pageNum
      }
      if (result.page.pageSize) {
        pagination.value.size = result.page.pageSize
      }
    }
  } catch (error) {
    ElMessage.error('加载品牌数据失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = async () => {
  pagination.value.current = 1
  loading.value = true
  try {
    const searchParams = {
      name: searchKeyword.value || null,
      pageNum: pagination.value.current,
      pageSize: pagination.value.size
    }
    const result = await searchBrand(searchParams)
    tableData.value = result.list || []
    // 使用返回的page属性更新分页信息
    if (result.page) {
      pagination.value.total = result.page.total || 0
      pagination.value.totalPages = result.page.totalPages || 0
      if (result.page.pageNum) {
        pagination.value.current = result.page.pageNum
      }
      if (result.page.pageSize) {
        pagination.value.size = result.page.pageSize
      }
    }
  } catch (error) {
    ElMessage.error('搜索品牌数据失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.value.size = size
  pagination.value.current = 1
  handlePageChange()
}

// 当前页改变
const handleCurrentChange = (page) => {
  pagination.value.current = page
  handlePageChange()
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

// 关联分类
const handleAssociateCategory = async (row) => {
  currentBrandId.value = row.brandId
  categoryDialogVisible.value = true
  await loadAssociatedCategories(row.brandId)
}

// 加载关联的分类列表
const loadAssociatedCategories = async (brandId) => {
  categoryLoading.value = true
  try {
    const data = await getBrandCategoryList(brandId)
    associatedCategories.value = data || []
  } catch (error) {
    ElMessage.error('加载关联分类列表失败：' + error.message)
    associatedCategories.value = []
  } finally {
    categoryLoading.value = false
  }
}

// 加载分类树数据
const loadCategoryTree = async () => {
  try {
    const data = await getCategoryTree()
    categoryTree.value = data || []
  } catch (error) {
    ElMessage.error('加载分类数据失败：' + error.message)
    categoryTree.value = []
  }
}

// 打开分类选择对话框
const openCategoryPicker = async () => {
  if (categoryTree.value.length === 0) {
    await loadCategoryTree()
  }
  categoryPickerDialogVisible.value = true
  selectedLevel1.value = null
  selectedLevel2.value = null
  selectedLevel3.value = null
  selectedCategoryPath.value = ''
}

// 关闭分类选择对话框
const handleCategoryPickerClose = () => {
  selectedLevel1.value = null
  selectedLevel2.value = null
  selectedLevel3.value = null
  selectedCategoryPath.value = ''
}

// 查找分类的完整路径
const findCategoryPath = (catId, categories = categoryTree.value, path = []) => {
  for (const cat of categories) {
    const currentPath = [...path, cat]
    if (cat.catId === catId) {
      return currentPath
    }
    if (cat.children && cat.children.length > 0) {
      const found = findCategoryPath(catId, cat.children, currentPath)
      if (found) return found
    }
  }
  return null
}

// 选择一级分类
const selectLevel1 = (cat) => {
  selectedLevel1.value = cat
  selectedLevel2.value = null
  selectedLevel3.value = null
}

// 选择二级分类
const selectLevel2 = (cat) => {
  selectedLevel2.value = cat
  selectedLevel3.value = null
}

// 选择三级分类
const selectLevel3 = (cat) => {
  selectedLevel3.value = cat
  updateCategoryPath()
}

// 更新分类路径显示
const updateCategoryPath = () => {
  const path = []
  if (selectedLevel1.value) path.push(selectedLevel1.value.name)
  if (selectedLevel2.value) path.push(selectedLevel2.value.name)
  if (selectedLevel3.value) path.push(selectedLevel3.value.name)
  selectedCategoryPath.value = path.join(' / ')
}

// 确认分类选择
const confirmCategorySelection = async () => {
  if (!selectedLevel3.value) {
    ElMessage.warning('请选择三级分类')
    return
  }
  
  try {
    await saveBrandCategory({
      id: null,
      brandId: currentBrandId.value,
      catelogId: selectedLevel3.value.catId
    })
    ElMessage.success('关联成功')
    categoryPickerDialogVisible.value = false
    selectedLevel1.value = null
    selectedLevel2.value = null
    selectedLevel3.value = null
    selectedCategoryPath.value = ''
    // 刷新关联分类列表
    await loadAssociatedCategories(currentBrandId.value)
  } catch (error) {
    ElMessage.error(error.message || '关联失败')
  }
}

// 移除关联分类
const handleRemoveCategory = async (row) => {
  ElMessageBox.confirm(
    `确定要移除关联分类"${row.catelogName}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteBrandCategory(row.catelogId, row.id)
      ElMessage.success('移除成功')
      // 刷新关联分类列表
      await loadAssociatedCategories(currentBrandId.value)
    } catch (error) {
      ElMessage.error(error.message || '移除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 关联分类对话框关闭
const handleCategoryDialogClose = () => {
  currentBrandId.value = null
  associatedCategories.value = []
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

.category-association-header {
  margin-bottom: 16px;
}

.category-picker-wrapper-dialog {
  width: 100%;
}

.category-selector-trigger {
  cursor: pointer;
  color: #909399;
  transition: color 0.2s;
}

.category-selector-trigger:hover {
  color: #409eff;
}

.category-picker-content {
  padding: 8px 0;
}

.category-picker-columns {
  display: flex;
  height: 300px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.category-column {
  flex: 1;
  overflow-y: auto;
  border-right: 1px solid #e4e7ed;
  background-color: #fff;
}

.category-column:last-child {
  border-right: none;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f5f7fa;
}

.category-item:hover {
  background-color: #f5f7fa;
}

.category-item.category-selected {
  background-color: #ecf5ff;
  color: #409eff;
  font-weight: 500;
}

.category-item .arrow-right {
  color: #c0c4cc;
  font-size: 14px;
  margin-left: 8px;
}

.category-item.category-selected .arrow-right {
  color: #409eff;
}

.category-column::-webkit-scrollbar {
  width: 6px;
}

.category-column::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.category-column::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.category-column::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>

