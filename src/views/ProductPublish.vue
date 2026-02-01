<template>
  <div class="product-publish">
    <div class="publish-container">
      <!-- 步骤条 -->
      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step title="基本信息" />
        <el-step title="规格参数" />
        <el-step title="销售属性" />
        <el-step title="SKU信息" />
        <el-step title="保存完成" />
      </el-steps>

      <!-- 步骤内容 -->
      <div class="step-content">
        <!-- 步骤1: 基本信息 -->
        <div v-if="currentStep === 0" class="step-panel">
          <el-form
            ref="basicInfoFormRef"
            :model="basicInfoForm"
            :rules="basicInfoRules"
            label-width="120px"
          >
            <el-form-item label="商品名称" prop="spuName">
              <el-input v-model="basicInfoForm.spuName" placeholder="请输入商品名称" />
            </el-form-item>
            <el-form-item label="商品描述" prop="spuDescription">
              <el-input v-model="basicInfoForm.spuDescription" placeholder="请输入商品描述" />
            </el-form-item>
            <el-form-item label="选择分类" prop="catelogId">
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
                      placeholder="请选择分类"
                      readonly
                      @click.stop="openCategoryPicker"
                      class="form-input-medium"
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
            <el-form-item label="选择品牌" prop="brandId">
              <el-select
                v-model="basicInfoForm.brandId"
                placeholder="请选择品牌"
                class="form-input-medium"
                filterable
                :loading="brandLoading"
                :disabled="!basicInfoForm.catelogId"
              >
                <el-option
                  v-for="brand in brandList"
                  :key="brand.brandId"
                  :label="brand.brandName"
                  :value="brand.brandId"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="商品重量(Kg)" prop="weight">
              <el-input-number
                v-model="basicInfoForm.weight"
                :min="0"
                :precision="3"
                placeholder="商品重量"
                class="form-input-small"
              />
            </el-form-item>
            <el-form-item label="设置积分">
              <div class="points-row">
                <div class="points-item">
                  <span class="points-label">金币</span>
                  <el-input-number
                    v-model="basicInfoForm.bounds.buyBounds"
                    :min="0"
                    placeholder="购买积分"
                    class="form-input-small"
                  />
                </div>
                <div class="points-item">
                  <span class="points-label">成长值</span>
                  <el-input-number
                    v-model="basicInfoForm.bounds.growBounds"
                    :min="0"
                    placeholder="成长值"
                    class="form-input-small"
                  />
                </div>
              </div>
            </el-form-item>
            <el-form-item label="商品介绍" prop="decript">
              <div class="upload-area upload-area-medium">
                <el-upload
                  class="upload-demo"
                  action="#"
                  :auto-upload="true"
                  :http-request="handleDetailImagesUpload"
                  :before-upload="beforeImageUpload"
                  :show-file-list="false"
                  multiple
                >
                  <div v-if="detailImages.length === 0" class="upload-placeholder">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                    <div class="upload-text">请上传商品详情图集</div>
                  </div>
                  <div v-else class="image-preview-list">
                    <div
                      v-for="(url, index) in detailImages"
                      :key="index"
                      class="image-preview-item"
                    >
                      <img :src="url" alt="详情图" />
                      <div class="image-actions">
                        <el-icon class="delete-icon" @click.stop="removeDetailImage(index)">
                          <Close />
                        </el-icon>
                      </div>
                    </div>
                    <div class="image-preview-item add-more">
                      <el-icon class="upload-icon"><Plus /></el-icon>
                    </div>
                  </div>
                </el-upload>
              </div>
            </el-form-item>
            <el-form-item label="商品图集" prop="images">
              <div class="upload-area upload-area-medium">
                <el-upload
                  class="upload-demo"
                  action="#"
                  :auto-upload="true"
                  :http-request="handleProductImagesUpload"
                  :before-upload="beforeImageUpload"
                  :show-file-list="false"
                  multiple
                >
                  <div v-if="productImages.length === 0" class="upload-placeholder">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                    <div class="upload-text">请上传商品图片集</div>
                  </div>
                  <div v-else class="image-preview-list">
                    <div
                      v-for="(url, index) in productImages"
                      :key="index"
                      class="image-preview-item"
                    >
                      <img :src="url" alt="商品图" />
                      <div class="image-actions">
                        <el-icon class="delete-icon" @click.stop="removeProductImage(index)">
                          <Close />
                        </el-icon>
                      </div>
                    </div>
                    <div class="image-preview-item add-more">
                      <el-icon class="upload-icon"><Plus /></el-icon>
                    </div>
                  </div>
                </el-upload>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤2: 规格参数 -->
        <div v-if="currentStep === 1" class="step-panel">
          <div v-loading="attrGroupsLoading" class="spec-params-container">
            <div v-if="attrGroups.length === 0 && !attrGroupsLoading" class="empty-state">
              <el-empty description="该分类暂无规格参数" />
            </div>
            <div v-else class="spec-params-layout">
              <!-- 左侧：属性组列表 -->
              <div class="attr-groups-sidebar">
                <div
                  v-for="group in attrGroups"
                  :key="group.attrGroupId"
                  class="attr-group-item"
                  :class="{ 'attr-group-active': selectedAttrGroupId === group.attrGroupId }"
                  @click="selectAttrGroup(group.attrGroupId)"
                >
                  {{ group.attrGroupName }}
                </div>
              </div>
              <!-- 右侧：属性输入区域 -->
              <div class="attr-inputs-area">
                <div v-if="selectedAttrGroup" class="attr-inputs-content">
                  <div
                    v-for="attr in selectedAttrGroup.attrs || []"
                    :key="attr.attrId"
                    class="attr-input-row"
                  >
                    <div class="attr-label">{{ attr.attrName }}</div>
                    <div class="attr-input-wrapper">
                      <!-- valueType为"多选"时：使用valueSelect按逗号拆分后的下拉选择 -->
                      <el-select
                        v-if="isMultiSelect(attr)"
                        v-model="attrValues[attr.attrId]"
                        :placeholder="`请选择${attr.attrName}`"
                        class="attr-input"
                        clearable
                      >
                        <el-option
                          v-for="option in getSelectOptions(attr)"
                          :key="option"
                          :label="option"
                          :value="option"
                        />
                      </el-select>
                      <!-- valueType为"单选"时：下拉框展示整个valueSelect作为唯一选项，不按逗号拆分 -->
                      <el-select
                        v-else-if="isSingleSelect(attr)"
                        v-model="attrValues[attr.attrId]"
                        :placeholder="`请选择${attr.attrName}`"
                        class="attr-input"
                        clearable
                      >
                        <el-option
                          v-for="option in getSelectOptions(attr)"
                          :key="option"
                          :label="option"
                          :value="option"
                        />
                      </el-select>
                      <!-- 上市月份：下拉选择（仅当不是多选/单选类型时使用硬编码的月份选项） -->
                      <el-select
                        v-else-if="attr.attrName === '上市月份'"
                        v-model="attrValues[attr.attrId]"
                        placeholder="请选择月份"
                        class="attr-input"
                        clearable
                      >
                        <el-option
                          v-for="month in monthOptions"
                          :key="month.value"
                          :label="month.label"
                          :value="month.value"
                        />
                      </el-select>
                      <!-- 上市年份：下拉选择（仅当不是多选类型时使用硬编码的年份选项） -->
                      <el-select
                        v-else-if="attr.attrName === '上市年份'"
                        v-model="attrValues[attr.attrId]"
                        placeholder="请选择年份"
                        class="attr-input"
                        clearable
                      >
                        <el-option
                          v-for="year in yearOptions"
                          :key="year.value"
                          :label="year.label"
                          :value="year.value"
                        />
                      </el-select>
                      <!-- 其他属性：普通输入框 -->
                      <el-input
                        v-else
                        v-model="attrValues[attr.attrId]"
                        placeholder="请选择或输入值"
                        class="attr-input"
                        clearable
                      >
                        <template #suffix>
                          <el-icon><ArrowDown /></el-icon>
                        </template>
                      </el-input>
                      <el-checkbox
                        v-model="quickShowAttrs[attr.attrId]"
                        class="quick-show-checkbox"
                      >
                        快速展示
                      </el-checkbox>
                    </div>
                  </div>
                  <div v-if="!selectedAttrGroup.attrs || selectedAttrGroup.attrs.length === 0" class="empty-attrs">
                    <el-empty description="该属性组暂无属性" :image-size="80" />
                  </div>
                </div>
                <div v-else class="no-selection">
                  <el-empty description="请选择属性组" :image-size="80" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤3: 销售属性 -->
        <div v-if="currentStep === 2" class="step-panel">
          <div v-loading="saleAttrsLoading" class="sale-attrs-container">
            <div class="sale-attrs-title">选择销售属性</div>
            <div v-if="saleAttrs.length === 0 && !saleAttrsLoading" class="empty-state">
              <el-empty description="该分类暂无销售属性" />
            </div>
            <div v-else class="sale-attrs-list">
              <div
                v-for="attr in saleAttrs"
                :key="attr.attrId"
                class="sale-attr-row"
              >
                <span class="sale-attr-label">{{ attr.attrName }}</span>
                <div class="sale-attr-values">
                  <el-checkbox-group v-model="saleAttrSelectedValues[attr.attrId]" class="sale-attr-checkbox-group">
                    <el-checkbox
                      v-for="opt in getSaleAttrOptions(attr)"
                      :key="opt"
                      :label="opt"
                      class="sale-attr-checkbox"
                    />
                  </el-checkbox-group>
                  <el-input
                    v-if="saleAttrCustomInputVisible[attr.attrId]"
                    v-model="saleAttrCustomInputValue[attr.attrId]"
                    class="sale-attr-custom-input"
                    placeholder="输入后按回车添加"
                    clearable
                    @keyup.enter="addSaleAttrCustomValue(attr)"
                  />
                  <el-button
                    type="primary"
                    link
                    class="sale-attr-custom-btn"
                    @click="toggleSaleAttrCustomInput(attr)"
                  >
                    +自定义
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤4: SKU信息 -->
        <div v-if="currentStep === 3" class="step-panel">
          <div class="sku-container">
            <div class="sku-title">属性组合</div>
            <div v-if="skuList.length === 0" class="empty-state">
              <el-empty description="请先在销售属性步骤勾选至少一个属性值" />
            </div>
            <el-table v-else :data="skuList" border class="sku-table">
              <el-table-column
                v-for="col in skuAttrColumns"
                :key="col.attrId"
                :label="col.attrName"
                :prop="col.attrId"
                width="85"
              >
                <template #default="{ row }">
                  {{ row.attrValues[col.attrId] }}
                </template>
              </el-table-column>
              <el-table-column label="商品名称" min-width="220">
                <template #default="{ row }">
                  <el-input v-model="row.skuName" placeholder="商品名称" clearable />
                </template>
              </el-table-column>
              <el-table-column label="标题" min-width="220">
                <template #default="{ row }">
                  <el-input v-model="row.title" placeholder="标题" clearable />
                </template>
              </el-table-column>
              <el-table-column label="副标题" width="120">
                <template #default="{ row }">
                  <el-input v-model="row.subtitle" placeholder="副标题（可选）" clearable />
                </template>
              </el-table-column>
              <el-table-column label="价格" min-width="130">
                <template #default="{ row }">
                  <el-input-number v-model="row.price" :min="0" :precision="2" placeholder="0" class="sku-price-input" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 步骤5: 保存完成 -->
        <div v-if="currentStep === 4" class="step-panel">
          <div class="step-placeholder">
            <el-result icon="success" title="保存成功" sub-title="商品已成功发布">
              <template #extra>
                <el-button type="primary" @click="handleFinish">完成</el-button>
              </template>
            </el-result>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="step-actions" v-if="currentStep < 4">
        <el-button v-if="currentStep > 0" @click="handlePrevStep">上一步</el-button>
        <el-button type="primary" @click="handleNextStep">
          {{ currentStep === 0 ? '下一步:设置基本参数' : currentStep === 1 ? '下一步:设置销售属性' : currentStep === 2 ? '下一步:设置SKU信息' : '保存' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, ArrowDown, ArrowRight, Close } from '@element-plus/icons-vue'
import { getCategoryTree, getCategoryBrands, uploadCeph, getCategoryAttrGroupsWithAttrs, getCategorySaleAttrs } from '../utils/api'
import { ClickOutside as vClickOutside } from 'element-plus'

const currentStep = ref(0)
const categoryTree = ref([])
const categoryPickerVisible = ref(false)
const selectedLevel1 = ref(null)
const selectedLevel2 = ref(null)
const selectedLevel3 = ref(null)
const selectedCategoryPath = ref('')
const brandList = ref([])
const brandLoading = ref(false)
const basicInfoFormRef = ref(null)
const detailImages = ref([]) // 商品详情图集
const productImages = ref([]) // 商品图集
const detailImagesUploading = ref(false)
const productImagesUploading = ref(false)
const attrGroups = ref([]) // 属性组列表
const attrGroupsLoading = ref(false)
const selectedAttrGroupId = ref(null)
const selectedAttrGroup = ref(null)
const attrValues = ref({}) // 属性值 { attrId: value }
const quickShowAttrs = ref({}) // 快速展示属性 { attrId: boolean }

// 销售属性
const saleAttrs = ref([])
const saleAttrsLoading = ref(false)
const saleAttrSelectedValues = ref({}) // { attrId: string[] }
const saleAttrCustomValues = ref({}) // { attrId: string[] }
const saleAttrCustomInputVisible = ref({}) // { attrId: boolean }
const saleAttrCustomInputValue = ref({}) // { attrId: string }

// 记录已加载的分类ID，用于返回后再次进入时保留选择（不重复加载清空）
const lastAttrGroupsCatelogId = ref(null)
const lastSaleAttrsCatelogId = ref(null)

// SKU 信息列表（笛卡尔积生成）
const skuList = ref([])
// 生成 SKU 时使用的销售属性列（用于表头）
const skuAttrColumns = ref([])
// 上次生成 SKU 的选中值签名，用于判断返回再进入时是否需要重新生成
const lastSkuSelectionSignature = ref('')

// 月份选项（1-12月）
const monthOptions = ref(
  Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1}月`
  }))
)

// 年份选项（当前年份前后10年）
const currentYear = new Date().getFullYear()
const yearOptions = ref(
  Array.from({ length: 21 }, (_, i) => {
    const year = currentYear - 10 + i
    return {
      value: String(year),
      label: `${year}年`
    }
  })
)

// 基本信息表单数据
const basicInfoForm = ref({
  spuName: '',
  spuDescription: '',
  catelogId: null,
  brandId: null,
  weight: 0,
  bounds: {
    buyBounds: 0,
    growBounds: 0
  },
  decript: '', // 商品介绍图片URL，多个用逗号分隔
  images: [] // 商品图集URL数组
})

// 表单验证规则
const basicInfoRules = {
  spuName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  spuDescription: [{ required: true, message: '请输入商品描述', trigger: 'blur' }],
  catelogId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  brandId: [{ required: true, message: '请选择品牌', trigger: 'change' }]
}

// 加载分类树数据
const loadCategoryTree = async () => {
  try {
    const data = await getCategoryTree()
    categoryTree.value = data
  } catch (error) {
    ElMessage.error('加载分类数据失败：' + error.message)
  }
}

// 加载分类下的品牌列表
const loadBrandList = async (catelogId) => {
  if (!catelogId) {
    brandList.value = []
    basicInfoForm.value.brandId = null
    return
  }
  brandLoading.value = true
  try {
    const data = await getCategoryBrands(catelogId)
    brandList.value = data || []
  } catch (error) {
    ElMessage.error('加载品牌列表失败：' + error.message)
    brandList.value = []
  } finally {
    brandLoading.value = false
  }
}

// 监听分类变化，加载品牌列表
watch(() => basicInfoForm.value.catelogId, (newVal) => {
  if (newVal) {
    loadBrandList(newVal)
  } else {
    brandList.value = []
    basicInfoForm.value.brandId = null
  }
})

// 打开分类选择器
const openCategoryPicker = () => {
  categoryPickerVisible.value = true
  if (basicInfoForm.value.catelogId) {
    const path = findCategoryPath(basicInfoForm.value.catelogId)
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
  basicInfoForm.value.catelogId = cat.catId
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

// 上传前验证
const beforeImageUpload = (file) => {
  const isImage = file.type?.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  // 文件大小限制：10MB (10 * 1024 * 1024 字节)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过 10MB')
    return false
  }
  return true
}

// 上传商品详情图
const handleDetailImagesUpload = async (options) => {
  const { file } = options
  detailImagesUploading.value = true
  try {
    const url = await uploadCeph(file)
    detailImages.value.push(url)
    // 更新表单数据，多个URL用逗号分隔
    basicInfoForm.value.decript = detailImages.value.join(',')
    ElMessage.success('上传成功')
  } catch (error) {
    ElMessage.error(error.message || '上传失败')
  } finally {
    detailImagesUploading.value = false
  }
}

// 上传商品图集
const handleProductImagesUpload = async (options) => {
  const { file } = options
  productImagesUploading.value = true
  try {
    const url = await uploadCeph(file)
    productImages.value.push(url)
    // 更新表单数据
    basicInfoForm.value.images = [...productImages.value]
    ElMessage.success('上传成功')
  } catch (error) {
    ElMessage.error(error.message || '上传失败')
  } finally {
    productImagesUploading.value = false
  }
}

// 删除商品详情图
const removeDetailImage = (index) => {
  detailImages.value.splice(index, 1)
  basicInfoForm.value.decript = detailImages.value.join(',')
}

// 删除商品图
const removeProductImage = (index) => {
  productImages.value.splice(index, 1)
  basicInfoForm.value.images = [...productImages.value]
}

// 上一步
const handlePrevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 加载分类属性组和属性
const loadAttrGroups = async (catelogId) => {
  if (!catelogId) {
    attrGroups.value = []
    selectedAttrGroupId.value = null
    selectedAttrGroup.value = null
    lastAttrGroupsCatelogId.value = null
    return
  }
  attrGroupsLoading.value = true
  try {
    const data = await getCategoryAttrGroupsWithAttrs(catelogId)
    attrGroups.value = data || []
    if (attrGroups.value.length > 0) {
      selectedAttrGroupId.value = attrGroups.value[0].attrGroupId
      selectedAttrGroup.value = attrGroups.value[0]
    } else {
      selectedAttrGroupId.value = null
      selectedAttrGroup.value = null
    }
    attrValues.value = {}
    quickShowAttrs.value = {}
    lastAttrGroupsCatelogId.value = catelogId
  } catch (error) {
    ElMessage.error('加载属性组失败：' + error.message)
    attrGroups.value = []
    selectedAttrGroupId.value = null
    selectedAttrGroup.value = null
    lastAttrGroupsCatelogId.value = null
  } finally {
    attrGroupsLoading.value = false
  }
}

// 选择属性组
const selectAttrGroup = (attrGroupId) => {
  selectedAttrGroupId.value = attrGroupId
  selectedAttrGroup.value = attrGroups.value.find(g => g.attrGroupId === attrGroupId) || null
}

// 判断属性是否为多选类型
const isMultiSelect = (attr) => {
  if (!attr) return false
  const valueType = attr.valueType
  // 支持字符串"多选"或数字1表示多选
  if (typeof valueType === 'string') {
    return valueType === '多选'
  } else if (typeof valueType === 'number') {
    return valueType === 1
  }
  return false
}

// 判断属性是否为单选类型
const isSingleSelect = (attr) => {
  if (!attr) return false
  const valueType = attr.valueType
  if (typeof valueType === 'string') {
    return valueType === '单选'
  } else if (typeof valueType === 'number') {
    return valueType === 0
  }
  return false
}

// 从valueSelect中解析出选项列表
// 多选：按逗号拆分为多个选项；单选：整个valueSelect作为一个选项，不拆分
const getSelectOptions = (attr) => {
  if (!attr || !attr.valueSelect) return []
  if (isSingleSelect(attr)) {
    const single = String(attr.valueSelect).trim()
    return single ? [single] : []
  }
  // 多选：valueSelect是用逗号分隔的字符串
  return attr.valueSelect.split(',').map(v => v.trim()).filter(v => v.length > 0)
}

// 销售属性：可选值列表（接口 valueSelect 逗号拆分 + 用户自定义添加的值）
const getSaleAttrOptions = (attr) => {
  const base = attr?.valueSelect
    ? attr.valueSelect.split(',').map(v => v.trim()).filter(v => v.length > 0)
    : []
  const custom = saleAttrCustomValues.value[attr.attrId] || []
  return [...base, ...custom]
}

// 加载销售属性列表
const loadSaleAttrs = async (catelogId) => {
  if (!catelogId) {
    saleAttrs.value = []
    lastSaleAttrsCatelogId.value = null
    return
  }
  saleAttrsLoading.value = true
  try {
    const data = await getCategorySaleAttrs(catelogId)
    saleAttrs.value = data || []
    saleAttrSelectedValues.value = {}
    saleAttrCustomValues.value = {}
    saleAttrCustomInputVisible.value = {}
    saleAttrCustomInputValue.value = {}
    saleAttrs.value.forEach((attr) => {
      saleAttrSelectedValues.value[attr.attrId] = []
    })
    lastSaleAttrsCatelogId.value = catelogId
  } catch (error) {
    ElMessage.error('加载销售属性失败：' + error.message)
    saleAttrs.value = []
    lastSaleAttrsCatelogId.value = null
  } finally {
    saleAttrsLoading.value = false
  }
}

// 点击 +自定义：在最后显示输入框
const toggleSaleAttrCustomInput = (attr) => {
  const id = attr.attrId
  saleAttrCustomInputVisible.value = { ...saleAttrCustomInputVisible.value, [id]: !saleAttrCustomInputVisible.value[id] }
  if (!saleAttrCustomInputVisible.value[id]) {
    saleAttrCustomInputValue.value = { ...saleAttrCustomInputValue.value, [id]: '' }
  }
}

// 添加自定义销售属性值（输入框回车时调用）
const addSaleAttrCustomValue = (attr) => {
  const id = attr.attrId
  const val = (saleAttrCustomInputValue.value[id] || '').trim()
  if (!val) return
  const custom = saleAttrCustomValues.value[id] || []
  if (custom.includes(val)) {
    ElMessage.warning('该值已存在')
    return
  }
  saleAttrCustomValues.value = { ...saleAttrCustomValues.value, [id]: [...custom, val] }
  const selected = saleAttrSelectedValues.value[id] || []
  saleAttrSelectedValues.value = { ...saleAttrSelectedValues.value, [id]: [...selected, val] }
  saleAttrCustomInputValue.value = { ...saleAttrCustomInputValue.value, [id]: '' }
  saleAttrCustomInputVisible.value = { ...saleAttrCustomInputVisible.value, [id]: false }
}

// 根据已选销售属性笛卡尔积生成 SKU 列表
const generateSkuList = () => {
  const attrsWithValues = saleAttrs.value
    .map((attr) => ({
      attrId: attr.attrId,
      attrName: attr.attrName,
      values: saleAttrSelectedValues.value[attr.attrId] || []
    }))
    .filter((a) => a.values.length > 0)

  if (attrsWithValues.length === 0) {
    skuList.value = []
    skuAttrColumns.value = []
    lastSkuSelectionSignature.value = ''
    return
  }

  // 选中值签名，用于判断返回再进入时是否需重新生成（保留用户对商品名称、价格等的编辑）
  const signature = attrsWithValues.map((a) => `${a.attrId}:${[...a.values].sort().join(',')}`).join('|')
  if (signature === lastSkuSelectionSignature.value && skuList.value.length > 0) {
    return
  }
  lastSkuSelectionSignature.value = signature
  skuAttrColumns.value = attrsWithValues

  // 笛卡尔积
  const cartesian = (arrays) => {
    if (arrays.length === 0) return [[]]
    const [first, ...rest] = arrays
    const restProduct = cartesian(rest)
    return first.flatMap((v) => restProduct.map((r) => [v, ...r]))
  }

  const valueArrays = attrsWithValues.map((a) => a.values)
  const combinations = cartesian(valueArrays)
  const spuName = basicInfoForm.value.spuName || ''

  skuList.value = combinations.map((combo) => {
    const attrValues = {}
    let nameParts = []
    attrsWithValues.forEach((a, i) => {
      attrValues[a.attrId] = combo[i]
      nameParts.push(combo[i])
    })
    const skuNameStr = [spuName, ...nameParts].filter(Boolean).join(' ')
    return {
      attrValues,
      skuName: skuNameStr,
      title: skuNameStr,
      subtitle: '',
      price: 0
    }
  })
}

// 下一步
const handleNextStep = async () => {
  const catelogId = basicInfoForm.value.catelogId
  if (currentStep.value === 0) {
    // 验证基本信息表单
    if (!basicInfoFormRef.value) return
    await basicInfoFormRef.value.validate((valid) => {
      if (valid) {
        // 首次进入或分类变更时才加载，返回再进入时直接保留之前的规格参数选择
        const needLoad = lastAttrGroupsCatelogId.value !== catelogId || attrGroups.value.length === 0
        if (needLoad) {
          loadAttrGroups(catelogId).then(() => {
            currentStep.value++
          })
        } else {
          currentStep.value++
        }
      }
    })
  } else if (currentStep.value === 1) {
    // 首次进入或分类变更时才加载，返回再进入时直接保留之前的销售属性选择
    const needLoad = lastSaleAttrsCatelogId.value !== catelogId || saleAttrs.value.length === 0
    if (needLoad) {
      await loadSaleAttrs(catelogId)
    }
    currentStep.value++
  } else if (currentStep.value === 2) {
    // 进入 SKU 步骤时根据已选销售属性笛卡尔积生成 SKU 列表；返回再进入时重新生成以保持一致
    generateSkuList()
    currentStep.value++
  } else if (currentStep.value < 3) {
    currentStep.value++
  } else {
    // 最后一步，保存商品
    ElMessage.info('保存功能待实现')
  }
}

// 完成
const handleFinish = () => {
  // 返回商品列表或关闭页面
  ElMessage.success('商品发布完成')
}

onMounted(() => {
  loadCategoryTree()
})
</script>

<style scoped>
.product-publish {
  height: 100%;
  padding: 20px;
  background-color: #f5f7fa;
  overflow: auto;
}

.publish-container {
  max-width: 1400px;
  margin: 0 auto;
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.step-content {
  margin-top: 40px;
  min-height: 400px;
}

.step-panel {
  padding: 20px 0;
}

.step-placeholder {
  text-align: center;
  padding: 100px 0;
  color: #909399;
  font-size: 16px;
}

.step-actions {
  margin-top: 40px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
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

.upload-area {
  width: 100%;
  min-height: 200px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  cursor: pointer;
  transition: border-color 0.2s;
}

.upload-area:hover {
  border-color: #409eff;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 10px;
}

.upload-text {
  color: #909399;
  font-size: 14px;
}

/* 表单输入框宽度控制 */
.form-input-medium {
  width: 400px;
}

.form-input-small {
  width: 200px;
}

/* 积分和成长值行布局 */
.points-row {
  display: flex;
  align-items: center;
  gap: 30px;
}

.points-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.points-label {
  min-width: 50px;
  color: #606266;
}

/* 上传区域宽度控制 */
.upload-area-medium {
  width: 400px;
}

/* 上传占位符 */
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* 图片预览列表 */
.image-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
  width: 100%;
  min-height: 200px;
}

.image-preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;
}

.image-preview-item:hover {
  border-color: #409eff;
}

.image-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-preview-item.add-more {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  border: 1px dashed #dcdfe6;
}

.image-preview-item.add-more:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.image-actions {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-preview-item:hover .image-actions {
  opacity: 1;
}

.delete-icon {
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  transition: color 0.2s;
}

.delete-icon:hover {
  color: #f56c6c;
}

/* 规格参数页面样式 */
.spec-params-container {
  min-height: 400px;
}

.empty-state {
  padding: 100px 0;
  text-align: center;
}

.spec-params-layout {
  display: flex;
  gap: 20px;
  min-height: 400px;
}

.attr-groups-sidebar {
  width: 200px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
  padding: 8px 0;
  max-height: 600px;
  overflow-y: auto;
}

.attr-group-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #606266;
  font-size: 14px;
}

.attr-group-item:hover {
  background-color: #f5f7fa;
}

.attr-group-item.attr-group-active {
  background-color: #ecf5ff;
  color: #409eff;
  font-weight: 500;
  border-right: 2px solid #409eff;
}

.attr-inputs-area {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
  padding: 20px;
  min-height: 400px;
}

.attr-inputs-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.attr-input-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.attr-label {
  width: 120px;
  color: #606266;
  font-size: 14px;
  flex-shrink: 0;
}

.attr-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
}

.attr-input {
  flex: 1;
  max-width: 400px;
}

.quick-show-checkbox {
  flex-shrink: 0;
}

.empty-attrs,
.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.attr-groups-sidebar::-webkit-scrollbar {
  width: 6px;
}

.attr-groups-sidebar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.attr-groups-sidebar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.attr-groups-sidebar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 销售属性页面样式 */
.sale-attrs-container {
  min-height: 400px;
}

.sale-attrs-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 20px;
}

.sale-attrs-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sale-attr-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.sale-attr-label {
  width: 120px;
  flex-shrink: 0;
  color: #606266;
  font-size: 14px;
  line-height: 32px;
}

.sale-attr-values {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.sale-attr-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.sale-attr-checkbox {
  margin-right: 0;
}

.sale-attr-custom-input {
  width: 160px;
}

.sale-attr-custom-btn {
  padding-left: 8px;
}

/* SKU 信息页面样式 */
.sku-container {
  min-height: 400px;
}

.sku-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 20px;
}

.sku-table {
  width: 100%;
}

.sku-price-input {
  width: 100%;
  min-width: 100px;
}

.sku-action-icon {
  color: #909399;
  cursor: pointer;
  font-size: 14px;
}
</style>
