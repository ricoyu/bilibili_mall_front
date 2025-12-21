<template>
  <div class="attr-group-management">
    <div class="content-wrapper">
      <!-- 左侧分类树 -->
      <div class="category-tree-container">
        <el-scrollbar>
          <el-tree
            :data="categoryTree"
            :props="{ label: 'name', children: 'children' }"
            :default-expand-all="false"
            :highlight-current="true"
            :indent="20"
            node-key="catId"
            @node-click="handleCategoryClick"
            v-loading="categoryLoading"
            class="category-tree"
          >
            <template #default="{ node, data }">
              <span class="tree-node-label">{{ node.label }}</span>
            </template>
          </el-tree>
        </el-scrollbar>
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-area">
        <div class="page-header">
          <div class="header-info">
            <span v-if="selectedCategory" class="category-name">
              当前分类：{{ selectedCategory.name }}
            </span>
            <span v-else class="category-name">请选择分类</span>
          </div>
          <el-button type="primary" @click="handleAdd" :disabled="!selectedCategory">
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
          >
            <el-table-column prop="attrGroupId" label="分组id" width="100" align="center" />
            <el-table-column prop="attrGroupName" label="组名" width="200" show-overflow-tooltip />
            <el-table-column prop="sort" label="排序" width="100" align="center" />
            <el-table-column prop="descript" label="描述" min-width="200" show-overflow-tooltip />
            <el-table-column prop="icon" label="图标" width="100" align="center" />
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
        </div>
      </div>
    </div>

    <!-- 新增/修改对话框 -->
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
        label-width="100px"
      >
        <el-form-item label="组名" prop="attrGroupName">
          <el-input v-model="formData.attrGroupName" placeholder="请输入组名" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" placeholder="排序" style="width: 100%" />
        </el-form-item>
        <el-form-item label="描述" prop="descript">
          <el-input
            v-model="formData.descript"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="formData.icon" placeholder="请输入图标" />
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
import { getCategoryTree } from '../utils/api'

const loading = ref(false)
const categoryLoading = ref(false)
const tableData = ref([])
const categoryTree = ref([])
const selectedCategory = ref(null)
const dialogVisible = ref(false)
const dialogTitle = ref('新增')
const formRef = ref(null)
const isEdit = ref(false)
const currentEditId = ref(null)

// 表单数据
const formData = ref({
  attrGroupName: '',
  sort: 0,
  descript: '',
  icon: ''
})

// 表单验证规则
const formRules = {
  attrGroupName: [{ required: true, message: '请输入组名', trigger: 'blur' }]
}

// 加载分类树数据
const loadCategoryTree = async () => {
  categoryLoading.value = true
  try {
    const data = await getCategoryTree()
    categoryTree.value = data
  } catch (error) {
    ElMessage.error('加载分类数据失败：' + error.message)
  } finally {
    categoryLoading.value = false
  }
}

// 处理分类点击
const handleCategoryClick = (data) => {
  selectedCategory.value = data
  // TODO: 加载该分类下的属性分组数据
  loadAttrGroupData(data.catId)
}

// 加载属性分组数据
const loadAttrGroupData = async (catId) => {
  loading.value = true
  try {
    // TODO: 调用接口获取属性分组数据
    tableData.value = []
  } catch (error) {
    ElMessage.error('加载属性分组数据失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 新增
const handleAdd = () => {
  if (!selectedCategory.value) {
    ElMessage.warning('请先选择分类')
    return
  }
  isEdit.value = false
  dialogTitle.value = '新增'
  currentEditId.value = null
  formData.value = {
    attrGroupName: '',
    sort: 0,
    descript: '',
    icon: ''
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '修改'
  currentEditId.value = row.attrGroupId
  formData.value = {
    attrGroupName: row.attrGroupName || '',
    sort: row.sort || 0,
    descript: row.descript || '',
    icon: row.icon || ''
  }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // TODO: 调用接口保存数据
        ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
        dialogVisible.value = false
        if (selectedCategory.value) {
          loadAttrGroupData(selectedCategory.value.catId)
        }
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

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除属性分组"${row.attrGroupName}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // TODO: 调用接口删除数据
    ElMessage.info('删除功能待实现')
  }).catch(() => {
    // 取消删除
  })
}

onMounted(() => {
  loadCategoryTree()
})
</script>

<style scoped>
.attr-group-management {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.content-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.category-tree-container {
  width: 250px;
  border-right: 1px solid #e4e7ed;
  background-color: #fff;
  height: 100%;
  overflow: hidden;
}

.category-tree-container :deep(.el-scrollbar) {
  height: 100%;
}

.category-tree-container :deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

.category-tree {
  background-color: transparent;
  padding: 10px 0;
}

.category-tree :deep(.el-tree-node__content) {
  height: 32px;
  line-height: 32px;
}

.category-tree :deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

.category-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #ecf5ff;
  color: #409eff;
}

.tree-node-label {
  font-size: 14px;
  color: #606266;
}

.category-tree :deep(.el-tree-node.is-current > .el-tree-node__content .tree-node-label) {
  color: #409eff;
  font-weight: 500;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.header-info {
  display: flex;
  align-items: center;
}

.category-name {
  font-size: 14px;
  color: #606266;
}

.table-container {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
}
</style>

