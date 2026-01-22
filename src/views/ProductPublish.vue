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
                  :auto-upload="false"
                  :show-file-list="false"
                >
                  <el-icon class="upload-icon"><Plus /></el-icon>
                  <div class="upload-text">请上传商品详情图集</div>
                </el-upload>
              </div>
            </el-form-item>
            <el-form-item label="商品图集" prop="images">
              <div class="upload-area upload-area-medium">
                <el-upload
                  class="upload-demo"
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                >
                  <el-icon class="upload-icon"><Plus /></el-icon>
                  <div class="upload-text">请上传商品图片集</div>
                </el-upload>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤2: 规格参数 -->
        <div v-if="currentStep === 1" class="step-panel">
          <div class="step-placeholder">规格参数设置（待实现）</div>
        </div>

        <!-- 步骤3: 销售属性 -->
        <div v-if="currentStep === 2" class="step-panel">
          <div class="step-placeholder">销售属性设置（待实现）</div>
        </div>

        <!-- 步骤4: SKU信息 -->
        <div v-if="currentStep === 3" class="step-panel">
          <div class="step-placeholder">SKU信息设置（待实现）</div>
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
import { Plus, ArrowDown, ArrowRight } from '@element-plus/icons-vue'
import { getCategoryTree, getCategoryBrands } from '../utils/api'
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
  decript: '',
  images: []
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

// 上一步
const handlePrevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 下一步
const handleNextStep = async () => {
  if (currentStep.value === 0) {
    // 验证基本信息表单
    if (!basicInfoFormRef.value) return
    await basicInfoFormRef.value.validate((valid) => {
      if (valid) {
        currentStep.value++
      }
    })
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
  max-width: 1200px;
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
</style>
