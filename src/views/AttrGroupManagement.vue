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
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              placeholder="组名"
              style="width: 200px"
              clearable
              @keyup.enter="handleSearch"
              @clear="handleSearchClear"
            />
            <el-button type="primary" style="margin-left: 10px" @click="handleSearch">
              查询
            </el-button>
          </div>
          <div class="action-buttons">
            <el-button type="primary" @click="handleAdd" :disabled="!selectedCategory">
              <el-icon><Plus /></el-icon>
              新增
            </el-button>
            <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">
              批量删除
            </el-button>
          </div>
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
            <el-table-column prop="attrGroupId" label="分组id" width="100" align="center" />
            <el-table-column prop="attrGroupName" label="组名" width="200" show-overflow-tooltip />
            <el-table-column prop="sort" label="排序" width="100" align="center" />
            <el-table-column prop="descript" label="描述" min-width="200" show-overflow-tooltip />
            <el-table-column prop="icon" label="组图标" width="100" align="center">
              <template #default="{ row }">
                <el-icon v-if="row.icon" :size="20">
                  <component :is="getIconComponent(row.icon)" />
                </el-icon>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="catelogId" label="所属分类id" width="120" align="center" />
            <el-table-column label="操作" width="250" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="handleRelation(row)"
                >
                  关联
                </el-button>
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
          <div class="icon-picker-wrapper">
            <el-input
              v-model="formData.icon"
              placeholder="请选择图标"
              readonly
              @click="openIconDialog"
            >
              <template #prepend>
                <el-icon v-if="formData.icon" :size="18">
                  <component :is="getIconComponent(formData.icon)" />
                </el-icon>
                <span v-else style="color: #c0c4cc">图标</span>
              </template>
              <template #suffix>
                <el-icon class="icon-selector-trigger"><Search /></el-icon>
              </template>
            </el-input>
            <el-button
              v-if="formData.icon"
              type="danger"
              link
              size="small"
              style="margin-left: 8px"
              @click="clearIcon"
            >
              清除
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="所属分类" prop="catelogId">
          <div class="category-picker-wrapper" v-click-outside="closeCategoryPicker">
            <el-popover
              placement="bottom-start"
              width="600"
              trigger="manual"
              v-model:visible="categoryPickerVisible"
            >
              <template #reference>
                <el-input
                  v-model="selectedCategoryPath"
                  placeholder="请选择"
                  readonly
                  @click.stop="openCategoryPicker"
                >
                  <template #suffix>
                    <el-icon class="category-selector-trigger"><ArrowDown /></el-icon>
                  </template>
                </el-input>
              </template>
              <div class="category-picker-content" @mousedown.stop>
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
            </el-popover>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 图标选择对话框 -->
    <el-dialog
      v-model="iconDialogVisible"
      title="选择图标"
      width="600px"
    >
      <div class="icon-selector-container">
        <el-input
          v-model="iconSearchKeyword"
          placeholder="搜索图标..."
          clearable
          style="margin-bottom: 16px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <div class="icon-selector-grid">
          <div
            v-for="icon in filteredIconOptions"
            :key="icon"
            class="icon-selector-item"
            :class="{ 'icon-selected': formData.icon === icon }"
            @click="selectIcon(icon)"
            title="点击选择此图标"
          >
            <el-icon :size="24">
              <component :is="getIconComponent(icon)" />
            </el-icon>
            <span class="icon-name">{{ icon }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="iconDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 关联规格参数对话框 -->
    <el-dialog
      v-model="relationDialogVisible"
      :title="`属性分组『${currentAttrGroupName}』关联的规格参数`"
      width="800px"
      @close="handleRelationDialogClose"
    >
      <div class="relation-dialog-header">
        <el-button type="primary" @click="handleNewRelation">
          新建关联
        </el-button>
        <el-button type="danger" @click="handleBatchDeleteRelation" :disabled="selectedRelationRows.length === 0">
          批量删除
        </el-button>
      </div>
      <el-table
        :data="relationTableData"
        style="width: 100%"
        border
        v-loading="relationLoading"
        @selection-change="handleRelationSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="attrName" label="属性名" width="200" show-overflow-tooltip />
        <el-table-column prop="valueSelect" label="可选值" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tag v-if="row.valueSelect" type="primary" size="small" style="margin-right: 4px">
              {{ row.valueSelect }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button
              type="danger"
              link
              size="small"
              @click="handleDeleteRelation(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="relationDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 选择属性对话框 -->
    <el-dialog
      v-model="selectAttrDialogVisible"
      title="选择属性"
      width="800px"
      @close="handleSelectAttrDialogClose"
    >
      <div class="select-attr-dialog-content">
        <div class="select-attr-search-box">
          <el-input
            v-model="selectAttrSearchKeyword"
            placeholder="参数名"
            style="width: 200px"
            clearable
            @keyup.enter="handleSelectAttrSearch"
            @clear="handleSelectAttrSearchClear"
          />
          <el-button type="primary" style="margin-left: 10px" @click="handleSelectAttrSearch">
            查询
          </el-button>
        </div>
        <el-table
          :data="selectAttrTableData"
          style="width: 100%"
          border
          v-loading="selectAttrLoading"
          @selection-change="handleSelectAttrSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column prop="attrId" label="属性Id" width="100" align="center" />
          <el-table-column prop="attrName" label="属性名" width="200" show-overflow-tooltip />
          <el-table-column prop="icon" label="属性图标" width="120" align="center">
            <template #default="{ row }">
              <el-icon v-if="row.icon" :size="20">
                <component :is="getIconComponent(row.icon)" />
              </el-icon>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="valueSelect" label="可选值列表" min-width="300" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tag v-if="row.valueSelect" type="primary" size="small" style="margin-right: 4px">
                {{ row.valueSelect }}
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
        <div class="select-attr-pagination">
          <el-pagination
            v-model:current-page="selectAttrPagination.current"
            v-model:page-size="selectAttrPagination.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="selectAttrPagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSelectAttrSizeChange"
            @current-change="handleSelectAttrCurrentChange"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="selectAttrDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAddRelation" :disabled="selectedAttrRows.length === 0">
          确认新增
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, ArrowDown, ArrowRight } from '@element-plus/icons-vue'
import { getCategoryTree, getAttrGroupList, createAttrGroup, updateAttrGroup, searchAttrGroup, deleteAttrGroup, getAttrGroupRelations, deleteAttrGroupRelation, getAttrGroupNoRelationAttrs, createAttrGroupRelations } from '../utils/api'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { ClickOutside as vClickOutside } from 'element-plus'

const loading = ref(false)
const categoryLoading = ref(false)
const tableData = ref([])
const categoryTree = ref([])
const selectedCategory = ref(null)
const searchKeyword = ref('')
const selectedRows = ref([])
const isSearchMode = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增')
const formRef = ref(null)
const isEdit = ref(false)
const currentEditId = ref(null)
const iconDialogVisible = ref(false)
const iconSearchKeyword = ref('')
const categoryPickerVisible = ref(false)
const selectedLevel1 = ref(null)
const selectedLevel2 = ref(null)
const selectedLevel3 = ref(null)
const selectedCategoryPath = ref('')

// 关联规格参数相关
const relationDialogVisible = ref(false)
const relationTableData = ref([])
const relationLoading = ref(false)
const selectedRelationRows = ref([])
const currentAttrGroupId = ref(null)
const currentAttrGroupName = ref('')
const currentAttrGroupCatelogId = ref(null)

// 选择属性对话框相关
const selectAttrDialogVisible = ref(false)
const selectAttrTableData = ref([])
const selectAttrLoading = ref(false)
const selectedAttrRows = ref([])
const selectAttrSearchKeyword = ref('')
const selectAttrPagination = ref({
  current: 1,
  size: 10,
  total: 0
})

// 分页信息
const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})

// 表单数据
const formData = ref({
  attrGroupName: '',
  sort: 0,
  descript: '',
  icon: '',
  catelogId: null
})

// 表单验证规则
const formRules = {
  attrGroupName: [{ required: true, message: '请输入组名', trigger: 'blur' }],
  catelogId: [{ required: true, message: '请选择所属分类', trigger: 'change' }]
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
  // 加载该分类下的属性分组数据，传递分类ID
  const catId = data?.catId
  loadAttrGroupData(catId)
}

// 加载属性分组数据
const loadAttrGroupData = async (catId = null) => {
  loading.value = true
  try {
    const result = await getAttrGroupList(catId)
    tableData.value = result.list || []
    // 更新分页信息
    if (result.page) {
      pagination.value.current = result.page.pageNum || 1
      pagination.value.size = result.page.pageSize || 10
      pagination.value.total = result.page.total || 0
    }
  } catch (error) {
    ElMessage.error('加载属性分组数据失败：' + error.message)
    tableData.value = []
    pagination.value.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = async () => {
  // 点击查询按钮时，总是调用搜索接口
  isSearchMode.value = true
  pagination.value.current = 1
  await loadSearchData()
}

// 加载搜索数据
const loadSearchData = async () => {
  loading.value = true
  try {
    const keyword = searchKeyword.value ? searchKeyword.value.trim() : ''
    
    const result = await searchAttrGroup({
      attrGroupName: keyword || '',
      pageNum: pagination.value.current,
      pageSize: pagination.value.size
    })
    tableData.value = result.list || []
    // 更新分页信息
    if (result.page) {
      pagination.value.current = result.page.pageNum || 1
      pagination.value.size = result.page.pageSize || 10
      pagination.value.total = result.page.total || 0
    }
  } catch (error) {
    ElMessage.error('搜索属性分组数据失败：' + error.message)
    tableData.value = []
    pagination.value.total = 0
  } finally {
    loading.value = false
  }
}

// 清除搜索
const handleSearchClear = () => {
  isSearchMode.value = false
  searchKeyword.value = ''
  pagination.value.current = 1
  const catId = selectedCategory.value ? selectedCategory.value.catId : null
  loadAttrGroupData(catId)
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.value.size = size
  pagination.value.current = 1
  if (isSearchMode.value) {
    loadSearchData()
  } else {
    const catId = selectedCategory.value ? selectedCategory.value.catId : null
    loadAttrGroupData(catId)
  }
}

// 当前页改变
const handleCurrentChange = (page) => {
  pagination.value.current = page
  if (isSearchMode.value) {
    loadSearchData()
  } else {
    const catId = selectedCategory.value ? selectedCategory.value.catId : null
    loadAttrGroupData(catId)
  }
}

// 选择改变
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 条数据吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const attrGroupIds = selectedRows.value.map(row => row.attrGroupId)
      await deleteAttrGroup(attrGroupIds)
      ElMessage.success('批量删除成功')
      selectedRows.value = []
      // 刷新列表数据
      if (isSearchMode.value) {
        await loadSearchData()
      } else {
        const catId = selectedCategory.value ? selectedCategory.value.catId : null
        loadAttrGroupData(catId)
      }
    } catch (error) {
      ElMessage.error(error.message || '批量删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
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
  
  // 查找选中分类的完整路径
  const path = findCategoryPath(selectedCategory.value.catId)
  if (path) {
    selectedLevel1.value = path[0] || null
    selectedLevel2.value = path[1] || null
    selectedLevel3.value = path[2] || null
    updateCategoryPath()
  }
  
  formData.value = {
    attrGroupName: '',
    sort: 0,
    descript: '',
    icon: '',
    catelogId: selectedCategory.value.catId
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '修改'
  currentEditId.value = row.attrGroupId
  
  // 查找分类路径
  if (row.catelogId) {
    const path = findCategoryPath(row.catelogId)
    if (path) {
      selectedLevel1.value = path[0] || null
      selectedLevel2.value = path[1] || null
      selectedLevel3.value = path[2] || null
      updateCategoryPath()
    }
  }
  
  formData.value = {
    attrGroupName: row.attrGroupName || '',
    sort: row.sort || 0,
    descript: row.descript || '',
    icon: row.icon || '',
    catelogId: row.catelogId || null
  }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          // 调用接口更新属性分组
          await updateAttrGroup({
            attrGroupId: currentEditId.value,
            attrGroupName: formData.value.attrGroupName,
            sort: formData.value.sort,
            descript: formData.value.descript,
            icon: formData.value.icon,
            catelogId: formData.value.catelogId
          })
          ElMessage.success('修改成功')
        } else {
          // 调用接口创建属性分组
          await createAttrGroup({
            attrGroupName: formData.value.attrGroupName,
            sort: formData.value.sort,
            descript: formData.value.descript,
            icon: formData.value.icon,
            catelogId: formData.value.catelogId
          })
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        // 刷新列表数据
        const catId = selectedCategory.value ? selectedCategory.value.catId : null
        loadAttrGroupData(catId)
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
  iconDialogVisible.value = false
  iconSearchKeyword.value = ''
  categoryPickerVisible.value = false
  selectedLevel1.value = null
  selectedLevel2.value = null
  selectedLevel3.value = null
  selectedCategoryPath.value = ''
}

// 属性分组相关的图标选项（与菜单管理不同，包含更多商品相关图标）
const attrGroupIconOptions = [
  // 商品相关
  'Goods', 'ShoppingBag', 'ShoppingCart', 'ShoppingCartFull',
  'Box', 'Collection', 'CollectionTag', 'PriceTag',
  'Tickets', 'Ticket', 'Discount', 'Promotion',
  // 电子产品
  'Monitor', 'Laptop', 'Phone', 'Iphone', 'Cellphone',
  'VideoCamera', 'VideoPlay', 'Headset', 'Microphone',
  // 图书文具
  'Reading', 'Notebook', 'Document', 'DocumentCopy', 'Files', 'Folder',
  'EditPen', 'Pen', 'Pencil', 'Brush',
  // 服装配饰
  'Avatar', 'User', 'UserFilled', 'Present',
  // 家居用品
  'HomeFilled', 'House', 'OfficeBuilding', 'Shop',
  // 食品
  'Food', 'Coffee', 'IceCream', 'IceDrink',
  // 运动户外
  'Basketball', 'Football', 'Trophy', 'Medal',
  // 美妆个护
  'BrushFilled', 'MagicStick',
  // 汽车用品
  'Van', 'Truck',
  // 其他商品
  'Watch', 'Clock', 'Timer', 'Calendar',
  'Picture', 'PictureRounded', 'Camera', 'CameraFilled',
  'Star', 'StarFilled', 'Flag', 'Aim',
  'Location', 'Place', 'MapLocation',
  // 功能图标
  'Grid', 'Menu', 'List', 'Operation',
  'Setting', 'Tools', 'Management',
  'DataLine', 'Histogram', 'TrendCharts', 'PieChart',
  'Edit', 'Check', 'CircleCheck',
  'Warning', 'InfoFilled', 'QuestionFilled', 'SuccessFilled',
  'Lock', 'Unlock', 'Key', 'Connection',
  'Refresh', 'RefreshRight', 'RefreshLeft', 'Loading',
  'Search', 'ZoomIn', 'ZoomOut', 'FullScreen',
  'Upload', 'Download', 'Share', 'Link',
  'More', 'MoreFilled', 'Plus', 'Minus'
]

// 过滤后的图标选项
const filteredIconOptions = computed(() => {
  if (!iconSearchKeyword.value) {
    return attrGroupIconOptions
  }
  const keyword = iconSearchKeyword.value.toLowerCase()
  return attrGroupIconOptions.filter(icon => 
    icon.toLowerCase().includes(keyword)
  )
})

// 获取图标组件
const getIconComponent = (iconName) => {
  if (!iconName) return ElementPlusIconsVue['Goods']
  const capitalizedIcon = iconName.charAt(0).toUpperCase() + iconName.slice(1)
  if (ElementPlusIconsVue[capitalizedIcon]) {
    return ElementPlusIconsVue[capitalizedIcon]
  }
  // 尝试直接使用原名称
  if (ElementPlusIconsVue[iconName]) {
    return ElementPlusIconsVue[iconName]
  }
  return ElementPlusIconsVue['Goods']
}

// 打开图标选择对话框
const openIconDialog = () => {
  iconSearchKeyword.value = ''
  iconDialogVisible.value = true
}

// 选择图标（直接选中并关闭）
const selectIcon = (icon) => {
  formData.value.icon = icon
  iconDialogVisible.value = false
  iconSearchKeyword.value = ''
}

// 清除图标
const clearIcon = () => {
  formData.value.icon = ''
}

// 查找分类的完整路径（一级、二级、三级）
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

// 打开分类选择器
const openCategoryPicker = () => {
  categoryPickerVisible.value = true
  // 如果已有选中的分类，设置路径
  if (formData.value.catelogId) {
    const path = findCategoryPath(formData.value.catelogId)
    if (path) {
      selectedLevel1.value = path[0] || null
      selectedLevel2.value = path[1] || null
      selectedLevel3.value = path[2] || null
      updateCategoryPath()
    }
  } else if (selectedCategory.value) {
    // 如果左侧已选中分类，自动设置
    const path = findCategoryPath(selectedCategory.value.catId)
    if (path) {
      selectedLevel1.value = path[0] || null
      selectedLevel2.value = path[1] || null
      selectedLevel3.value = path[2] || null
      updateCategoryPath()
    }
  }
}

// 关闭分类选择器
const closeCategoryPicker = () => {
  categoryPickerVisible.value = false
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
  formData.value.catelogId = cat.catId
  updateCategoryPath()
  categoryPickerVisible.value = false
}

// 更新分类路径显示
const updateCategoryPath = () => {
  const path = []
  if (selectedLevel1.value) path.push(selectedLevel1.value.name)
  if (selectedLevel2.value) path.push(selectedLevel2.value.name)
  if (selectedLevel3.value) path.push(selectedLevel3.value.name)
  selectedCategoryPath.value = path.join(' / ')
}

// 删除
const handleDelete = async (row) => {
  ElMessageBox.confirm(
    `确定要删除属性分组"${row.attrGroupName}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteAttrGroup([row.attrGroupId])
      ElMessage.success('删除成功')
      // 刷新列表数据
      if (isSearchMode.value) {
        await loadSearchData()
      } else {
        const catId = selectedCategory.value ? selectedCategory.value.catId : null
        loadAttrGroupData(catId)
      }
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 处理关联按钮点击
const handleRelation = async (row) => {
  currentAttrGroupId.value = row.attrGroupId
  currentAttrGroupName.value = row.attrGroupName
  currentAttrGroupCatelogId.value = row.catelogId
  relationDialogVisible.value = true
  await loadRelationData()
}

// 加载关联的规格参数数据
const loadRelationData = async () => {
  if (!currentAttrGroupId.value) return
  relationLoading.value = true
  try {
    const data = await getAttrGroupRelations(currentAttrGroupId.value)
    relationTableData.value = data || []
  } catch (error) {
    ElMessage.error('加载关联规格参数失败：' + error.message)
    relationTableData.value = []
  } finally {
    relationLoading.value = false
  }
}

// 关联对话框关闭
const handleRelationDialogClose = () => {
  relationTableData.value = []
  selectedRelationRows.value = []
  currentAttrGroupId.value = null
  currentAttrGroupName.value = ''
  currentAttrGroupCatelogId.value = null
}

// 关联表格选择改变
const handleRelationSelectionChange = (selection) => {
  selectedRelationRows.value = selection
}

// 新建关联
const handleNewRelation = () => {
  if (!currentAttrGroupCatelogId.value) {
    ElMessage.warning('属性分组未设置分类，无法获取未关联属性')
    return
  }
  selectAttrDialogVisible.value = true
  selectAttrSearchKeyword.value = ''
  selectAttrPagination.value.current = 1
  loadSelectAttrData()
}

// 加载未关联的属性数据
const loadSelectAttrData = async () => {
  if (!currentAttrGroupCatelogId.value) return
  selectAttrLoading.value = true
  try {
    const searchParams = {
      pageNum: selectAttrPagination.value.current,
      pageSize: selectAttrPagination.value.size
    }
    if (selectAttrSearchKeyword.value) {
      searchParams.key = selectAttrSearchKeyword.value.trim()
    }
    
    const result = await getAttrGroupNoRelationAttrs(currentAttrGroupCatelogId.value, searchParams)
    selectAttrTableData.value = result.list || []
    if (result.page) {
      selectAttrPagination.value.current = result.page.pageNum || 1
      selectAttrPagination.value.size = result.page.pageSize || 10
      selectAttrPagination.value.total = result.page.total || 0
    }
  } catch (error) {
    ElMessage.error('加载未关联属性失败：' + error.message)
    selectAttrTableData.value = []
    selectAttrPagination.value.total = 0
  } finally {
    selectAttrLoading.value = false
  }
}

// 选择属性对话框关闭
const handleSelectAttrDialogClose = () => {
  selectAttrTableData.value = []
  selectedAttrRows.value = []
  selectAttrSearchKeyword.value = ''
  selectAttrPagination.value = {
    current: 1,
    size: 10,
    total: 0
  }
}

// 选择属性表格选择改变
const handleSelectAttrSelectionChange = (selection) => {
  selectedAttrRows.value = selection
}

// 搜索未关联属性
const handleSelectAttrSearch = () => {
  selectAttrPagination.value.current = 1
  loadSelectAttrData()
}

// 清除搜索
const handleSelectAttrSearchClear = () => {
  selectAttrPagination.value.current = 1
  loadSelectAttrData()
}

// 分页大小改变
const handleSelectAttrSizeChange = (size) => {
  selectAttrPagination.value.size = size
  selectAttrPagination.value.current = 1
  loadSelectAttrData()
}

// 当前页改变
const handleSelectAttrCurrentChange = (page) => {
  selectAttrPagination.value.current = page
  loadSelectAttrData()
}

// 确认新增关联
const handleConfirmAddRelation = () => {
  if (selectedAttrRows.value.length === 0) {
    ElMessage.warning('请选择要关联的属性')
    return
  }
  ElMessageBox.confirm(
    `确定要关联选中的 ${selectedAttrRows.value.length} 个属性吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const attrIds = selectedAttrRows.value.map(row => row.attrId)
      await createAttrGroupRelations(currentAttrGroupId.value, attrIds)
      ElMessage.success('关联成功')
      selectAttrDialogVisible.value = false
      // 刷新关联列表
      await loadRelationData()
    } catch (error) {
      ElMessage.error('关联失败：' + error.message)
    }
  }).catch(() => {
    // 取消
  })
}

// 批量删除关联
const handleBatchDeleteRelation = () => {
  if (selectedRelationRows.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRelationRows.value.length} 条关联吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 批量删除关联关系
      const ids = selectedRelationRows.value.map(row => row.id)
      await deleteAttrGroupRelation(ids)
      ElMessage.success('批量删除成功')
      selectedRelationRows.value = []
      await loadRelationData()
    } catch (error) {
      ElMessage.error('批量删除失败：' + error.message)
    }
  }).catch(() => {
    // 取消删除
  })
}

// 删除单个关联
const handleDeleteRelation = (row) => {
  ElMessageBox.confirm(
    `确定要删除关联的规格参数"${row.attrName}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteAttrGroupRelation(row.id)
      ElMessage.success('删除成功')
      await loadRelationData()
    } catch (error) {
      ElMessage.error('删除失败：' + error.message)
    }
  }).catch(() => {
    // 取消删除
  })
}

onMounted(() => {
  loadCategoryTree()
  // 页面加载时调用接口，不传 catelogId
  loadAttrGroupData(null)
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
  width: 350px;
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

.search-box {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
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

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
}

.icon-picker-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
}

.icon-selector-trigger {
  cursor: pointer;
  color: #909399;
  transition: color 0.2s;
}

.icon-selector-trigger:hover {
  color: #409eff;
}

.icon-selector-container {
  max-height: 500px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.icon-selector-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.icon-selector-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #fff;
  min-height: 80px;
}

.icon-selector-item:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.icon-selector-item.icon-selected {
  border-color: #409eff;
  background-color: #ecf5ff;
  color: #409eff;
}

.icon-selector-item .icon-name {
  margin-top: 8px;
  font-size: 12px;
  color: #606266;
  text-align: center;
  word-break: break-all;
  line-height: 1.2;
}

.icon-selector-item.icon-selected .icon-name {
  color: #409eff;
  font-weight: 500;
}

.icon-selector-grid::-webkit-scrollbar {
  width: 6px;
}

.icon-selector-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.icon-selector-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.icon-selector-grid::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.category-picker-wrapper {
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

.relation-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.select-attr-dialog-content {
  display: flex;
  flex-direction: column;
}

.select-attr-search-box {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.select-attr-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>

