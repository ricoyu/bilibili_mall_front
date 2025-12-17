<template>
  <div class="menu-management">
    <div class="page-header">
      <div class="search-box">
        <el-select
          v-model="searchCondition"
          placeholder="选择搜索条件"
          style="width: 150px"
        >
          <el-option label="上级菜单" value="parentName" />
          <el-option label="菜单名称" value="name" />
          <el-option label="类型" value="type" />
        </el-select>
        <el-input
          v-if="searchCondition === 'name' || searchCondition === 'parentName'"
          v-model="searchValue"
          :placeholder="searchCondition === 'name' ? '请输入菜单名称' : '请输入上级菜单名称'"
          style="width: 300px; margin-left: 10px"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-select
          v-else-if="searchCondition === 'type'"
          v-model="searchValue"
          placeholder="请选择类型"
          style="width: 300px; margin-left: 10px"
          clearable
        >
          <el-option label="目录" :value="0" />
          <el-option label="菜单" :value="1" />
          <el-option label="按钮" :value="2" />
        </el-select>
        <el-button
          type="primary"
          style="margin-left: 10px"
          @click="handleSearch"
        >
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button
          v-if="hasSearch"
          style="margin-left: 10px"
          @click="handleReset"
        >
          重置
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
        row-key="menuId"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        border
        v-loading="loading"
      >
        <el-table-column prop="name" label="名称" width="200" show-overflow-tooltip />

        <el-table-column prop="parentName" label="上级菜单" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.parentName || '顶级菜单' }}
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

        <el-table-column prop="type" label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.type === 0" type="primary">目录</el-tag>
            <el-tag v-else-if="row.type === 1" type="success">菜单</el-tag>
            <el-tag v-else type="info">按钮</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="orderNum" label="排序号" width="100" align="center" />

        <el-table-column prop="url" label="菜单URL" min-width="200" show-overflow-tooltip />

        <el-table-column prop="perms" label="授权标识" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.perms || '-' }}
          </template>
        </el-table-column>

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

    <!-- 新增/编辑对话框 -->
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
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="上级菜单" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :data="menuTreeOptions"
            :props="{ label: 'name', value: 'menuId' }"
            placeholder="请选择上级菜单"
            check-strictly
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="formData.type" @change="handleTypeChange">
            <el-radio :label="0">目录</el-radio>
            <el-radio :label="1">菜单</el-radio>
            <el-radio :label="2">按钮</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="!isButton"
          label="菜单图标"
          prop="icon"
        >
          <div class="icon-picker" v-click-outside="closeIconPopover">
            <el-popover
              placement="bottom"
              width="460"
              trigger="manual"
              v-model:visible="iconPopoverVisible"
            >
              <template #reference>
                <el-input
                  v-model="formData.icon"
                  placeholder="请选择或输入图标名称"
                  readonly
                  @click.stop="openIconPopover"
                  suffix-icon="ArrowDown"
                >
                  <template #prepend>
                    <el-icon v-if="formData.icon">
                      <component :is="getIconComponent(formData.icon)" />
                    </el-icon>
                  </template>
                </el-input>
              </template>
              <div class="icon-grid" @mousedown.stop>
                <div
                  v-for="icon in iconOptions"
                  :key="icon"
                  class="icon-item"
                  @click="selectIcon(icon)"
                >
                  <el-icon><component :is="getIconComponent(icon)" /></el-icon>
                </div>
              </div>
            </el-popover>
          </div>
        </el-form-item>

        <el-form-item label="排序号" prop="orderNum">
          <el-input-number v-model="formData.orderNum" :min="0" />
        </el-form-item>

        <el-form-item
          v-if="isMenu"
          label="菜单URL"
          prop="url"
        >
          <el-input v-model="formData.url" placeholder="请输入菜单URL" />
        </el-form-item>

        <el-form-item
          v-if="isMenu || isButton"
          label="授权标识"
          prop="perms"
        >
          <el-input
            v-model="formData.perms"
            placeholder="多个权限用逗号分隔，例如：user:list,user:create"
          />
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
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { getMenuTree, searchMenu, createMenu, updateMenu, deleteMenu } from '../utils/api'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { ClickOutside as vClickOutside } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增菜单')
const formRef = ref(null)
const isEdit = ref(false)
const currentEditId = ref(null)

// 搜索相关
const searchCondition = ref('name')
const searchValue = ref('')
const hasSearch = ref(false)

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

// 获取图标组件
const getIconComponent = (iconName) => {
  if (!iconName) return ElementPlusIconsVue['Menu']
  const mappedIcon = iconMap[iconName]
  if (mappedIcon && ElementPlusIconsVue[mappedIcon]) {
    return ElementPlusIconsVue[mappedIcon]
  }
  const capitalizedIcon = iconName.charAt(0).toUpperCase() + iconName.slice(1)
  if (ElementPlusIconsVue[capitalizedIcon]) {
    return ElementPlusIconsVue[capitalizedIcon]
  }
  return ElementPlusIconsVue['Menu']
}

// 表单数据
const formData = ref({
  parentId: 0,
  name: '',
  icon: '',
  type: 0,
  orderNum: 0,
  url: '',
  perms: ''
})

const iconPopoverVisible = ref(false)

const openIconPopover = () => {
  iconPopoverVisible.value = true
}

const closeIconPopover = () => {
  iconPopoverVisible.value = false
}

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
  url: [
    {
      validator: (_, value, callback) => {
        if (formData.value.type === 1 && !value) {
          callback(new Error('请输入菜单URL'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  perms: [
    {
      validator: (_, value, callback) => {
        if (formData.value.type === 2 && !value) {
          callback(new Error('请输入授权标识'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 菜单树选项（用于上级菜单选择）
const menuTreeOptions = computed(() => {
  // 递归构建树形结构（从树形数据构建）
  const buildTreeFromTree = (menus) => {
    const result = []
    for (const menu of menus) {
      const node = {
        menuId: menu.menuId,
        name: menu.name,
        children: menu.children && menu.children.length > 0 ? buildTreeFromTree(menu.children) : []
      }
      result.push(node)
    }
    return result
  }
  // 添加顶级菜单选项
  const tree = buildTreeFromTree(tableData.value)
  return [
    {
      menuId: 0,
      name: '顶级菜单',
      children: tree
    }
  ]
})

// 获取所有菜单的扁平列表（用于查找父菜单名称）
const allMenus = ref([])
// 保留完整的菜单数据，用于查找父菜单名称（即使搜索后也能找到）
const fullMenuData = ref([])

// 扁平化菜单数据
const flattenMenus = (menus) => {
  const result = []
  for (const menu of menus) {
    result.push(menu)
    if (menu.children && menu.children.length > 0) {
      result.push(...flattenMenus(menu.children))
    }
  }
  return result
}

// 根据parentId获取父菜单名称
const getParentName = (parentId) => {
  if (!parentId || parentId === 0) return ''
  // 优先从完整菜单数据中查找，如果找不到再从当前菜单数据中查找
  const fullMenus = flattenMenus(fullMenuData.value)
  const parent = fullMenus.find(m => m.menuId === parentId) || allMenus.value.find(m => m.menuId === parentId)
  return parent ? parent.name : ''
}

// 计算当前类型
const isCatalog = computed(() => formData.value.type === 0)
const isMenu = computed(() => formData.value.type === 1)
const isButton = computed(() => formData.value.type === 2)

// 可选图标列表
const iconOptions = [
  'HomeFilled', 'Menu', 'Setting', 'User', 'UserFilled', 'Avatar',
  'Goods', 'ShoppingCartFull', 'CollectionTag', 'Tickets',
  'Document', 'DocumentCopy', 'DocumentChecked', 'Finished',
  'Monitor', 'DataLine', 'Histogram', 'TrendCharts',
  'ChatDotRound', 'Message', 'BellFilled', 'ChatLineRound',
  'StarFilled', 'Star', 'Heart', 'Place', 'Location',
  'Lock', 'Unlock', 'Key', 'CopyDocument', 'Edit',
  'Folder', 'FolderOpened', 'Picture', 'CameraFilled',
  'Promotion', 'Upload', 'Download', 'Share', 'Search',
  'Notification', 'PieChart', 'Odometer', 'Grid',
  'Aim', 'Flag', 'Refresh', 'Printer', 'More'
]

const selectIcon = (icon) => {
  formData.value.icon = icon
  iconPopoverVisible.value = false
}

const handleTypeChange = () => {
  // 切换类型时，清理与类型不符的字段
  if (isCatalog.value) {
    formData.value.url = ''
    formData.value.perms = ''
  } else if (isMenu.value) {
    formData.value.perms = ''
  } else if (isButton.value) {
    formData.value.icon = ''
    formData.value.url = ''
  }
}

// 加载菜单数据
const loadMenuData = async () => {
  loading.value = true
  try {
    const data = await getMenuTree()
    // 保存完整的菜单数据，用于查找父菜单名称
    fullMenuData.value = data
    // 保存树形数据用于表格展示
    tableData.value = data
    // 扁平化数据用于查找父菜单名称
    allMenus.value = flattenMenus(data)
  } catch (error) {
    ElMessage.error('加载菜单数据失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 搜索菜单数据
const searchMenuData = async (searchParams) => {
  loading.value = true
  try {
    // 如果还没有加载完整数据，先加载一次（用于查找父菜单名称）
    if (fullMenuData.value.length === 0) {
      const fullData = await getMenuTree()
      fullMenuData.value = fullData
    }
    
    const data = await searchMenu(searchParams)
    // 保存树形数据用于表格展示
    tableData.value = data
    // 扁平化数据用于查找父菜单名称（搜索结果的扁平化）
    allMenus.value = flattenMenus(data)
  } catch (error) {
    ElMessage.error('搜索菜单数据失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  if (!searchCondition.value) {
    ElMessage.warning('请选择搜索条件')
    return
  }
  
  if (searchCondition.value === 'type') {
    if (searchValue.value === '' && searchValue.value !== 0) {
      ElMessage.warning('请选择类型')
      return
    }
  } else {
    if (!searchValue.value || searchValue.value.trim() === '') {
      ElMessage.warning('请输入搜索值')
      return
    }
  }
  
  hasSearch.value = true
  const searchParams = {}
  
  if (searchCondition.value === 'parentName') {
    // 上级菜单：直接传递菜单名称
    searchParams.parentName = searchValue.value.trim()
  } else if (searchCondition.value === 'name') {
    // 菜单名称
    searchParams.name = searchValue.value.trim()
  } else if (searchCondition.value === 'type') {
    // 类型
    searchParams.type = searchValue.value
  }
  
  searchMenuData(searchParams)
}

// 重置搜索
const handleReset = () => {
  searchCondition.value = 'name'
  searchValue.value = ''
  hasSearch.value = false
  loadMenuData()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增菜单'
  formData.value = {
    parentId: 0,
    name: '',
    icon: '',
    type: 0,
    orderNum: 0,
    url: '',
    perms: ''
  }
  iconPopoverVisible.value = false
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  currentEditId.value = row.menuId
  dialogTitle.value = '修改菜单'
  formData.value = {
    parentId: row.parentId || 0,
    name: row.name,
    icon: row.icon || '',
    type: row.type,
    orderNum: row.orderNum,
    url: row.url || '',
    perms: row.perms || ''
  }
  iconPopoverVisible.value = false
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除菜单"${row.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteMenu(row.menuId)
      ElMessage.success('删除成功')
      loadMenuData()
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 准备提交的数据
        const submitData = {
          parentId: formData.value.parentId || 0,
          name: formData.value.name,
          type: formData.value.type,
          orderNum: formData.value.orderNum || 0,
          icon: formData.value.icon || '',
          url: formData.value.url || '',
          perms: formData.value.perms || ''
        }

        if (isEdit.value) {
          // 更新菜单，需要传递 menuId
          submitData.menuId = currentEditId.value
          await updateMenu(submitData)
          ElMessage.success('修改成功')
        } else {
          // 创建菜单，不需要传递 menuId
          await createMenu(submitData)
          ElMessage.success('新增成功')
        }
        
        // 先刷新数据，再关闭对话框，确保上级菜单选择器能显示最新数据
        await loadMenuData()
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
}

onMounted(() => {
  loadMenuData()
})
</script>

<style scoped>
.menu-management {
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
  flex: 1;
  margin-right: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  flex: 1;
  margin-right: 20px;
}

.table-container {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.icon-picker {
  width: 100%;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  max-height: 260px;
  overflow: auto;
}

.icon-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #606266;
  font-size: 16px;
}

.icon-item:hover {
  border-color: #409eff;
  color: #409eff;
  background-color: #ecf5ff;
}

.icon-item .el-icon {
  margin-bottom: 4px;
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

