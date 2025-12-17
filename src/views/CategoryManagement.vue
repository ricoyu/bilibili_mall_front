<template>
  <div class="category-management">
    <div class="page-header">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增
      </el-button>
    </div>

    <div class="table-container">
      <el-table
        :data="tableData"
        style="width: 100%"
        row-key="catId"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        border
        v-loading="loading"
        :lazy="false"
        :default-expand-all="false"
        :indent="20"
      >
        <el-table-column prop="name" label="分类名称" width="200" show-overflow-tooltip />

        <el-table-column prop="catLevel" label="分类级别" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.catLevel === 1" type="primary">一级</el-tag>
            <el-tag v-else-if="row.catLevel === 2" type="success">二级</el-tag>
            <el-tag v-else-if="row.catLevel === 3" type="warning">三级</el-tag>
            <el-tag v-else type="info">{{ row.catLevel }}级</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="icon" label="图标" width="100" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.icon" :size="20">
              <component :is="getIconComponent(row.icon)" />
            </el-icon>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column prop="productCount" label="商品数量" width="120" align="center" />

        <el-table-column prop="productUnit" label="数量单位" width="120" align="center">
          <template #default="{ row }">
            {{ row.productUnit || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="showStatus" label="显示状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.showStatus === 1" type="success">显示</el-tag>
            <el-tag v-else type="info">隐藏</el-tag>
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
    </div>

    <!-- 新增/修改分类对话框 -->
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
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="上级分类" prop="parentCid">
          <el-tree-select
            v-model="formData.parentCid"
            :data="categoryTreeOptions"
            :props="{ label: 'name', value: 'catId' }"
            placeholder="请选择上级分类"
            check-strictly
            style="width: 100%"
            @change="watchParentCid"
          />
        </el-form-item>
        <el-form-item label="分类级别" prop="catLevel">
          <el-input-number v-model="formData.catLevel" :min="1" :max="3" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" />
        </el-form-item>
        <el-form-item label="图标地址" prop="icon">
          <el-input v-model="formData.icon" placeholder="请输入图标地址" />
        </el-form-item>
        <el-form-item label="计量单位" prop="productUnit">
          <el-input v-model="formData.productUnit" placeholder="请输入计量单位" />
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
import { ref, onMounted, computed, shallowRef, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getCategoryTree, createCategory, updateCategory, deleteCategory } from '../utils/api'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const loading = ref(false)
// 使用 shallowRef 减少深度响应式开销，提升大数据量时的性能
const tableData = shallowRef([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增分类')
const formRef = ref(null)
const isEdit = ref(false)
const currentEditId = ref(null)

// 图标组件缓存
const iconComponentCache = new Map()

// 表单数据
const formData = ref({
  catId: null,
  name: '',
  parentCid: 0,
  catLevel: 1,
  sort: 0,
  icon: '',
  productUnit: ''
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  parentCid: [{ required: true, message: '请选择上级分类', trigger: 'change' }]
}

// 分类树选项（用于上级分类选择）- 使用缓存优化性能
let categoryTreeCache = null
let categoryTreeCacheExcludeId = null

const categoryTreeOptions = computed(() => {
  // 如果排除的ID没变，直接返回缓存
  if (categoryTreeCache && categoryTreeCacheExcludeId === currentEditId.value) {
    return categoryTreeCache
  }
  
  // 递归构建树形结构
  const buildTreeFromTree = (categories, excludeId = null) => {
    const result = []
    for (const category of categories) {
      // 排除当前编辑的分类及其子分类
      if (category.catId === excludeId) {
        continue
      }
      const node = {
        catId: category.catId,
        name: category.name,
        children: category.children && category.children.length > 0 
          ? buildTreeFromTree(category.children, excludeId) 
          : []
      }
      result.push(node)
    }
    return result
  }
  // 添加顶级分类选项
  const tree = buildTreeFromTree(tableData.value, currentEditId.value)
  const result = [
    {
      catId: 0,
      name: '顶级分类',
      children: tree
    }
  ]
  
  // 更新缓存
  categoryTreeCache = result
  categoryTreeCacheExcludeId = currentEditId.value
  
  return result
})

// 图标映射
const iconMap = {
  system: 'Setting',
  admin: 'User',
  role: 'UserFilled',
  menu: 'Menu',
  sql: 'Document',
  job: 'Timer',
  config: 'Tools',
  oss: 'Upload',
  log: 'Document',
  editor: 'Edit'
}

// 获取图标组件 - 使用缓存优化性能
const getIconComponent = (iconName) => {
  if (!iconName) return ElementPlusIconsVue['Menu']
  
  // 检查缓存
  if (iconComponentCache.has(iconName)) {
    return iconComponentCache.get(iconName)
  }
  
  let component = ElementPlusIconsVue['Menu']
  const mappedIcon = iconMap[iconName]
  if (mappedIcon && ElementPlusIconsVue[mappedIcon]) {
    component = ElementPlusIconsVue[mappedIcon]
  } else {
    const capitalizedIcon = iconName.charAt(0).toUpperCase() + iconName.slice(1)
    if (ElementPlusIconsVue[capitalizedIcon]) {
      component = ElementPlusIconsVue[capitalizedIcon]
    }
  }
  
  // 存入缓存
  iconComponentCache.set(iconName, component)
  return component
}

// 加载分类数据
const loadCategoryData = async () => {
  loading.value = true
  try {
    const data = await getCategoryTree()
    // 使用 nextTick 延迟更新，避免阻塞UI
    await nextTick()
    tableData.value = data
    // 清除缓存，强制重新计算
    categoryTreeCache = null
    categoryTreeCacheExcludeId = null
  } catch (error) {
    ElMessage.error('加载分类数据失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 更新单个分类数据（优化：只更新变化的部分，而不是重新加载全部）
const updateCategoryInTree = (updatedCategory) => {
  const updateNode = (nodes) => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].catId === updatedCategory.catId) {
        // 更新节点数据，保留children
        nodes[i] = {
          ...updatedCategory,
          children: nodes[i].children || []
        }
        return true
      }
      if (nodes[i].children && nodes[i].children.length > 0) {
        if (updateNode(nodes[i].children)) {
          return true
        }
      }
    }
    return false
  }
  
  const newData = [...tableData.value]
  updateNode(newData)
  tableData.value = newData
  // 清除缓存
  categoryTreeCache = null
  categoryTreeCacheExcludeId = null
}

// 根据parentCid计算catLevel
const calculateCatLevel = (parentCid) => {
  if (!parentCid || parentCid === 0) {
    return 1
  }
  
  // 在树中查找父分类的级别
  const findParentLevel = (nodes, targetId, currentLevel = 1) => {
    for (const node of nodes) {
      if (node.catId === targetId) {
        return currentLevel
      }
      if (node.children && node.children.length > 0) {
        const found = findParentLevel(node.children, targetId, currentLevel + 1)
        if (found) return found
      }
    }
    return null
  }
  
  const parentLevel = findParentLevel(tableData.value, parentCid)
  return parentLevel ? parentLevel + 1 : 1
}

// 监听parentCid变化，自动计算catLevel（仅在新增模式下）
const watchParentCid = () => {
  if (!isEdit.value && formData.value.parentCid !== undefined) {
    formData.value.catLevel = calculateCatLevel(formData.value.parentCid)
  }
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增分类'
  currentEditId.value = null
  formData.value = {
    catId: null,
    name: '',
    parentCid: 0,
    catLevel: 1,
    sort: 0,
    icon: '',
    productUnit: ''
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '修改分类'
  currentEditId.value = row.catId
  formData.value = {
    catId: row.catId,
    name: row.name,
    parentCid: row.parentCid || 0,
    catLevel: row.catLevel,
    sort: row.sort || 0,
    icon: row.icon || '',
    productUnit: row.productUnit || ''
  }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 如果是新增，计算catLevel
        if (!isEdit.value) {
          formData.value.catLevel = calculateCatLevel(formData.value.parentCid)
        }
        
        // 准备提交的数据（新增时不需要catId）
        const submitData = {
          name: formData.value.name,
          parentCid: formData.value.parentCid || 0,
          catLevel: formData.value.catLevel,
          sort: formData.value.sort || 0,
          icon: formData.value.icon || '',
          productUnit: formData.value.productUnit || ''
        }
        
        if (isEdit.value) {
          // 修改分类
          submitData.catId = formData.value.catId
          await updateCategory(submitData)
          ElMessage.success('修改成功')
          
          // 优化：只更新变化的部分，而不是重新加载全部数据
          try {
            updateCategoryInTree(submitData)
          } catch (e) {
            // 如果局部更新失败，回退到全量刷新
            await loadCategoryData()
          }
        } else {
          // 新增分类
          await createCategory(submitData)
          ElMessage.success('新增成功')
          // 新增后需要全量刷新，因为不知道新增的分类会插入到哪个位置
          await loadCategoryData()
        }
        
        dialogVisible.value = false
      } catch (error) {
        ElMessage.error(error.message || (isEdit.value ? '修改失败' : '新增失败'))
      }
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
  currentEditId.value = null
  isEdit.value = false
  // 清除缓存
  categoryTreeCache = null
  categoryTreeCacheExcludeId = null
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除分类"${row.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteCategory(row.catId)
      ElMessage.success('删除成功')
      // 删除后刷新数据
      await loadCategoryData()
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

onMounted(() => {
  loadCategoryData()
})
</script>

<style scoped>
.category-management {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.page-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
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

