<template>
  <div class="attr-management">
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
              placeholder="参数名"
              style="width: 200px"
              clearable
              @keyup.enter="handleSearch"
              @clear="handleSearchClear"
            />
            <el-button type="primary" style="margin-left: 10px" @click="handleSearch">
              查询
            </el-button>
            <el-button type="success" style="margin-left: 10px" @click="handleQueryAll">
              查询全部
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
            <el-table-column prop="attrId" label="id" width="90" align="center" />
            <el-table-column prop="attrName" label="属性名" width="130" show-overflow-tooltip />
            <el-table-column prop="searchType" label="可检索" width="85" align="center">
              <template #default="{ row }">
                <el-icon v-if="row.searchType === true" :size="18" color="#67c23a">
                  <CircleCheck />
                </el-icon>
                <el-icon v-else :size="18" color="#f56c6c">
                  <Close />
                </el-icon>
              </template>
            </el-table-column>
            <el-table-column prop="valueType" label="值类型" width="85" align="center">
              <template #default="{ row }">
                <span>{{ row.valueType || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="icon" label="图标" width="85" align="center">
              <template #default="{ row }">
                <el-icon v-if="row.icon" :size="20">
                  <component :is="getIconComponent(row.icon)" />
                </el-icon>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="valueSelect" label="可选值" width="130" show-overflow-tooltip>
              <template #default="{ row }">
                <el-tag v-if="row.valueSelect" type="primary" size="small">
                  {{ row.valueSelect.length > 18 ? row.valueSelect.substring(0, 18) + '...' : row.valueSelect }}
                </el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="enable" label="启用" width="85" align="center">
              <template #default="{ row }">
                <el-icon v-if="row.enable === true" :size="18" color="#67c23a">
                  <CircleCheck />
                </el-icon>
                <el-icon v-else :size="18" color="#f56c6c">
                  <Close />
                </el-icon>
              </template>
            </el-table-column>
            <el-table-column prop="catelogName" label="所属分类" width="125" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.catelogName || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="attrGroupName" label="所属分组" width="125" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.attrGroupName || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="showDesc" label="快速展示" width="95" align="center">
              <template #default="{ row }">
                <el-icon v-if="row.showDesc === true" :size="18" color="#67c23a">
                  <CircleCheck />
                </el-icon>
                <el-icon v-else :size="18" color="#f56c6c">
                  <Close />
                </el-icon>
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
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="110px"
      >
        <el-form-item label="属性名" prop="attrName">
          <el-input v-model="formData.attrName" placeholder="请输入属性名" />
        </el-form-item>
        <el-form-item label="属性类型" prop="attrType">
          <el-input :value="'规格参数'" disabled style="width: 100%" />
        </el-form-item>
        <el-form-item label="值类型" prop="valueType">
          <el-radio-group v-model="formData.valueType" @change="handleValueTypeChange">
            <el-radio :label="0">只能单个值</el-radio>
            <el-radio :label="1">允许多个值</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="可选值" prop="valueSelect">
          <!-- 允许多个值时，使用自定义标签输入 -->
          <div v-if="formData.valueType === 1" class="tag-input-wrapper">
            <div class="tag-input-container">
              <el-tag
                v-for="(tag, index) in valueSelectArray"
                :key="index"
                closable
                @close="removeTag(index)"
                style="margin-right: 8px; margin-bottom: 8px;"
              >
                {{ tag }}
              </el-tag>
              <el-input
                v-model="tagInputValue"
                placeholder="请输入可选值，按回车或逗号添加"
                style="flex: 1; min-width: 150px;"
                @keydown.enter.prevent="addTag"
                @keydown="handleTagInputKeydown"
                @blur="addTag"
              />
            </div>
          </div>
          <!-- 只能单个值时，使用普通输入框 -->
          <el-input
            v-if="formData.valueType === 0"
            :key="`single-value-input-${currentEditId || 'new'}-${dialogVisible}`"
            v-model="formData.valueSelect"
            placeholder="请输入可选值"
          />
          <div v-if="formData.valueType === 1" style="color: #909399; font-size: 12px; margin-top: 5px;">
            提示：输入值后按回车或逗号键添加，多个值用逗号分隔
          </div>
        </el-form-item>
        <el-form-item label="属性图标" prop="icon">
          <el-input
            v-model="formData.icon"
            placeholder="请选择图标"
            readonly
            @click="openIconDialog"
          >
            <template #prefix>
              <el-icon v-if="formData.icon">
                <component :is="getIconComponent(formData.icon)" />
              </el-icon>
            </template>
            <template #suffix>
              <el-icon class="category-selector-trigger"><ArrowDown /></el-icon>
            </template>
          </el-input>
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
        <el-form-item label="所属分组" prop="attrGroupId">
          <el-select
            v-model="formData.attrGroupId"
            placeholder="请选择所属分组"
            style="width: 100%"
            filterable
            clearable
            :loading="attrGroupLoading"
          >
            <el-option
              v-for="group in attrGroupList"
              :key="group.attrGroupId"
              :label="group.attrGroupName"
              :value="group.attrGroupId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="可检索" prop="searchType">
          <el-switch v-model="formData.searchType" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="快速展示" prop="showDesc">
          <el-switch v-model="formData.showDesc" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="启用状态" prop="enable">
          <el-switch v-model="formData.enable" :active-value="1" :inactive-value="0" />
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, CircleCheck, Close, ArrowDown, ArrowRight, Search } from '@element-plus/icons-vue'
import { getCategoryTree, searchAttrs, createAttr, updateAttr, deleteAttr, getAttrGroupList } from '../utils/api'
import { ClickOutside as vClickOutside } from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const loading = ref(false)
const categoryLoading = ref(false)
const tableData = ref([])
const categoryTree = ref([])
const selectedCategory = ref(null)
const searchKeyword = ref('')
const selectedRows = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增')
const formRef = ref(null)
const isEdit = ref(false)
const currentEditId = ref(null)

// 分类选择器相关
const categoryPickerVisible = ref(false)
const selectedLevel1 = ref(null)
const selectedLevel2 = ref(null)
const selectedLevel3 = ref(null)
const selectedCategoryPath = ref('')

// 属性分组相关
const attrGroupList = ref([])
const attrGroupLoading = ref(false)

// 图标选择器相关
const iconDialogVisible = ref(false)
const iconSearchKeyword = ref('')

// 可选值数组（用于标签显示）
const valueSelectArray = ref([])
// 标签输入框的值
const tagInputValue = ref('')

// 分页信息
const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})

// 表单数据
const formData = ref({
  attrName: '',
  attrType: 1, // 固定为1-规格参数
  valueType: 0, // 0-只能单个值, 1-允许多个值
  valueSelect: '',
  icon: '',
  catelogId: null,
  attrGroupId: null,
  searchType: 0, // 0-不可检索, 1-可检索
  showDesc: 0, // 0-不快速展示, 1-快速展示
  enable: 1 // 0-不启用, 1-启用
})

// 表单验证规则
const formRules = {
  attrName: [{ required: true, message: '请输入属性名', trigger: 'blur' }],
  valueType: [{ required: true, message: '请选择值类型', trigger: 'change' }],
  icon: [{ required: true, message: '请输入属性图标', trigger: 'blur' }],
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
  // 加载该分类下的规格参数数据
  const catId = data?.catId
  loadAttrData(catId)
}

// 加载规格参数数据
const loadAttrData = async (catelogId = null) => {
  loading.value = true
  try {
    const searchParams = {
      pageNum: pagination.value.current,
      pageSize: pagination.value.size,
      attrType: 1 // 固定为1，表示搜索的是规格参数
    }
    if (catelogId) {
      searchParams.catelogId = catelogId
    }
    if (searchKeyword.value) {
      searchParams.key = searchKeyword.value.trim()
    }
    
    const result = await searchAttrs(searchParams)
    tableData.value = result.list || []
    // 更新分页信息
    if (result.page) {
      pagination.value.current = result.page.pageNum || 1
      pagination.value.size = result.page.pageSize || 10
      pagination.value.total = result.page.total || 0
    }
  } catch (error) {
    ElMessage.error('加载规格参数数据失败：' + error.message)
    tableData.value = []
    pagination.value.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = async () => {
  pagination.value.current = 1
  const catId = selectedCategory.value ? selectedCategory.value.catId : null
  await loadAttrData(catId)
}

// 查询全部
const handleQueryAll = async () => {
  selectedCategory.value = null
  searchKeyword.value = ''
  pagination.value.current = 1
  await loadAttrData(null)
}

// 清除搜索
const handleSearchClear = () => {
  pagination.value.current = 1
  const catId = selectedCategory.value ? selectedCategory.value.catId : null
  loadAttrData(catId)
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.value.size = size
  pagination.value.current = 1
  const catId = selectedCategory.value ? selectedCategory.value.catId : null
  loadAttrData(catId)
}

// 当前页改变
const handleCurrentChange = (page) => {
  pagination.value.current = page
  const catId = selectedCategory.value ? selectedCategory.value.catId : null
  loadAttrData(catId)
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
      // 提取所有选中行的 attrId
      const ids = selectedRows.value.map(row => row.attrId)
      await deleteAttr(ids)
      ElMessage.success('删除成功')
      // 清空选中行
      selectedRows.value = []
      // 刷新列表数据
      const catId = selectedCategory.value ? selectedCategory.value.catId : null
      loadAttrData(catId)
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 处理标签输入框按键
const handleTagInputKeydown = (event) => {
  // 检测逗号键（188 是逗号的键码）
  if (event.keyCode === 188 || event.key === ',') {
    event.preventDefault()
    addTag()
  }
}

// 添加标签
const addTag = () => {
  const value = tagInputValue.value.trim()
  if (!value) {
    tagInputValue.value = ''
    return
  }
  // 检查是否已存在
  if (!valueSelectArray.value.includes(value)) {
    valueSelectArray.value.push(value)
    // 更新字符串
    formData.value.valueSelect = valueSelectArray.value.join(',')
  }
  // 清空输入框
  tagInputValue.value = ''
}

// 移除标签
const removeTag = (index) => {
  valueSelectArray.value.splice(index, 1)
  // 更新字符串
  formData.value.valueSelect = valueSelectArray.value.join(',')
}

// 监听 valueSelectArray 变化，同步更新字符串
watch(valueSelectArray, (newVal) => {
  formData.value.valueSelect = newVal.length > 0 ? newVal.join(',') : ''
}, { deep: true })

// 处理值类型变化
const handleValueTypeChange = (valueType) => {
  // 切换值类型时，清空可选值
  formData.value.valueSelect = ''
  valueSelectArray.value = []
  tagInputValue.value = ''
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增'
  isEdit.value = false
  currentEditId.value = null
  // 重置表单数据
  formData.value = {
    attrName: '',
    attrType: 1, // 固定为1-规格参数
    valueType: 0,
    valueSelect: '',
    icon: '',
    catelogId: null,
    attrGroupId: null,
    searchType: 0,
    showDesc: 0,
    enable: 1
  }
  // 重置可选值数组
  valueSelectArray.value = []
  tagInputValue.value = ''
  // 如果左侧已选择分类，自动设置
  if (selectedCategory.value) {
    const path = findCategoryPath(selectedCategory.value.catId)
    if (path) {
      selectedLevel1.value = path[0] || null
      selectedLevel2.value = path[1] || null
      selectedLevel3.value = path[2] || null
      if (selectedLevel3.value) {
        formData.value.catelogId = selectedLevel3.value.catId
        updateCategoryPath()
        loadAttrGroupList(selectedLevel3.value.catId)
      }
    }
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row) => {
  dialogTitle.value = '修改'
  isEdit.value = true
  currentEditId.value = row.attrId
  
  // 查找分类路径
  if (row.catelogId) {
    const path = findCategoryPath(row.catelogId)
    if (path) {
      selectedLevel1.value = path[0] || null
      selectedLevel2.value = path[1] || null
      selectedLevel3.value = path[2] || null
      updateCategoryPath()
      // 先加载属性分组列表，等待加载完成
      await loadAttrGroupList(row.catelogId)
      
      // 如果后端返回了 attrGroupName，但分组列表中还没有该分组，手动添加
      if (row.attrGroupId && row.attrGroupName) {
        const exists = attrGroupList.value.some(g => g.attrGroupId === row.attrGroupId)
        if (!exists) {
          attrGroupList.value.push({
            attrGroupId: row.attrGroupId,
            attrGroupName: row.attrGroupName
          })
        }
      }
    }
  }
  
  // 填充表单数据
  formData.value = {
    attrName: row.attrName || '',
    attrType: row.attrType !== undefined ? row.attrType : 0,
    valueType: row.valueType === '多选' ? 1 : 0, // 后端返回的是"单选"或"多选"字符串
    valueSelect: row.valueSelect || '',
    icon: row.icon || '',
    catelogId: row.catelogId || null,
    attrGroupId: row.attrGroupId || null,
    searchType: row.searchType === true ? 1 : 0,
    showDesc: row.showDesc === true ? 1 : 0,
    enable: row.enable === true ? 1 : 0
  }
  
  // 处理可选值数组（如果是多选且有值，转换为数组）
  if (formData.value.valueType === 1 && formData.value.valueSelect) {
    valueSelectArray.value = formData.value.valueSelect.split(',').filter(v => v.trim())
  } else {
    valueSelectArray.value = []
  }
  tagInputValue.value = ''
  
  dialogVisible.value = true
  
  // 等待DOM更新后，再次确认 valueSelect 的值（解决 v-if 切换时的绑定问题）
  await nextTick()
  
  // 如果 valueType 是 0（单选），确保 valueSelect 有值
  if (formData.value.valueType === 0 && row.valueSelect) {
    formData.value.valueSelect = String(row.valueSelect)
  }
  
  // 再次等待 DOM 更新
  await nextTick()
  formRef.value?.clearValidate()
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除规格参数"${row.attrName}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteAttr(row.attrId)
      ElMessage.success('删除成功')
      // 刷新列表数据
      const catId = selectedCategory.value ? selectedCategory.value.catId : null
      loadAttrData(catId)
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 加载属性分组列表
const loadAttrGroupList = async (catelogId) => {
  if (!catelogId) {
    attrGroupList.value = []
    return
  }
  attrGroupLoading.value = true
  try {
    const result = await getAttrGroupList(catelogId)
    attrGroupList.value = result.list || []
  } catch (error) {
    ElMessage.error('加载属性分组列表失败：' + error.message)
    attrGroupList.value = []
  } finally {
    attrGroupLoading.value = false
  }
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
  // 加载该分类下的属性分组列表
  loadAttrGroupList(cat.catId)
}

// 更新分类路径显示
const updateCategoryPath = () => {
  const path = []
  if (selectedLevel1.value) path.push(selectedLevel1.value.name)
  if (selectedLevel2.value) path.push(selectedLevel2.value.name)
  if (selectedLevel3.value) path.push(selectedLevel3.value.name)
  selectedCategoryPath.value = path.join(' / ')
}

// 属性分组相关的图标选项（与属性分组管理相同）
const attrIconOptions = [
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
    return attrIconOptions
  }
  const keyword = iconSearchKeyword.value.toLowerCase()
  return attrIconOptions.filter(icon => 
    icon.toLowerCase().includes(keyword)
  )
})

// 获取图标组件
const getIconComponent = (iconName) => {
  if (!iconName) return ElementPlusIconsVue['Goods']
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

// 选择图标
const selectIcon = (icon) => {
  formData.value.icon = icon
  iconDialogVisible.value = false
  iconSearchKeyword.value = ''
  // 清除图标字段的验证错误
  nextTick(() => {
    formRef.value?.clearValidate('icon')
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
  isEdit.value = false
  currentEditId.value = null
  categoryPickerVisible.value = false
  selectedLevel1.value = null
  selectedLevel2.value = null
  selectedLevel3.value = null
  selectedCategoryPath.value = ''
  attrGroupList.value = []
  iconDialogVisible.value = false
  iconSearchKeyword.value = ''
  valueSelectArray.value = []
  formData.value = {
    attrName: '',
    attrType: 1, // 固定为1-规格参数
    valueType: 0,
    valueSelect: '',
    icon: '',
    catelogId: null,
    attrGroupId: null,
    searchType: 0,
    showDesc: 0,
    enable: 1
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 构建提交数据
        const submitData = {
          attrName: formData.value.attrName,
          attrType: formData.value.attrType,
          valueType: formData.value.valueType,
          valueSelect: formData.value.valueSelect || '',
          icon: formData.value.icon,
          catelogId: formData.value.catelogId,
          attrGroupId: formData.value.attrGroupId || null,
          searchType: formData.value.searchType,
          showDesc: formData.value.showDesc,
          enable: formData.value.enable
        }
        
        // 如果是编辑模式，添加 attrId 并调用更新接口
        if (isEdit.value && currentEditId.value) {
          submitData.attrId = currentEditId.value
          await updateAttr(submitData)
        } else {
          // 新增模式，调用创建接口
          await createAttr(submitData)
        }
        ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
        dialogVisible.value = false
        // 刷新列表数据
        const catId = selectedCategory.value ? selectedCategory.value.catId : null
        loadAttrData(catId)
      } catch (error) {
        ElMessage.error(error.message || (isEdit.value ? '修改失败' : '新增失败'))
      }
    }
  })
}

onMounted(() => {
  console.log('AttrManagement 组件已挂载')
  loadCategoryTree()
  // 页面加载时调用接口
  loadAttrData(null)
})
</script>

<style scoped>
.attr-management {
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

.category-picker-wrapper {
  width: 100%;
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

.category-selector-trigger {
  cursor: pointer;
  color: #909399;
  transition: color 0.2s;
}

.category-selector-trigger:hover {
  color: #409eff;
}

.icon-selector-container {
  padding: 0;
}

.icon-selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;
}

.icon-selector-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #fff;
}

.icon-selector-item:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
  color: #409eff;
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

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
}

.tag-input-wrapper {
  width: 100%;
}

.tag-input-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  min-height: 32px;
  padding: 4px 11px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.tag-input-container:hover {
  border-color: #c0c4cc;
}

.tag-input-container:focus-within {
  border-color: #409eff;
  outline: none;
}

.tag-input-container .el-input {
  border: none;
  box-shadow: none;
}

.tag-input-container .el-input :deep(.el-input__wrapper) {
  box-shadow: none;
  padding: 0;
}

.tag-input-container .el-input :deep(.el-input__inner) {
  height: 24px;
  line-height: 24px;
}
</style>


