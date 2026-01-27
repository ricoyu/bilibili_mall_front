<template>
  <div class="member-level-management">
    <div class="page-header">
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="参数名"
          style="width: 200px"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" style="margin-left: 10px" @click="handleSearch">
          查询
        </el-button>
      </div>
      <div class="action-buttons">
        <el-button type="success" @click="handleAdd">
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
        <el-table-column prop="id" label="id" width="80" align="center" />
        <el-table-column prop="name" label="等级名称" width="150" show-overflow-tooltip />
        <el-table-column prop="growthPoint" label="所需成长值" width="120" align="center" />
        <el-table-column prop="defaultStatus" label="默认等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.defaultStatus === true || row.defaultStatus === 1" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="freeFreightPoint" label="免运费标准" width="120" align="center" />
        <el-table-column prop="commentGrowthPoint" label="每次评价获取的成长值" width="180" align="center" />
        <el-table-column label="特权" align="center">
          <el-table-column prop="priviledgeFreeFreight" label="免邮特权" width="100" align="center">
            <template #default="{ row }">
              <el-icon v-if="row.priviledgeFreeFreight === true || row.priviledgeFreeFreight === 1" :size="18" color="#67c23a">
                <CircleCheck />
              </el-icon>
              <el-icon v-else :size="18" color="#f56c6c">
                <Close />
              </el-icon>
            </template>
          </el-table-column>
          <el-table-column prop="priviledgeMemberPrice" label="会员价格特权" width="120" align="center">
            <template #default="{ row }">
              <el-icon v-if="row.priviledgeMemberPrice === true || row.priviledgeMemberPrice === 1" :size="18" color="#67c23a">
                <CircleCheck />
              </el-icon>
              <el-icon v-else :size="18" color="#f56c6c">
                <Close />
              </el-icon>
            </template>
          </el-table-column>
          <el-table-column prop="priviledgeBirthday" label="生日特权" width="100" align="center">
            <template #default="{ row }">
              <el-icon v-if="row.priviledgeBirthday === true || row.priviledgeBirthday === 1" :size="18" color="#67c23a">
                <CircleCheck />
              </el-icon>
              <el-icon v-else :size="18" color="#f56c6c">
                <Close />
              </el-icon>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column prop="note" label="备注" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.note || '-' }}
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
        label-width="150px"
      >
        <el-form-item label="等级名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入等级名称" />
        </el-form-item>
        <el-form-item label="所需成长值" prop="growthPoint">
          <el-input-number
            v-model="formData.growthPoint"
            :min="0"
            placeholder="所需成长值"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="默认等级" prop="defaultStatus">
          <el-radio-group v-model="formData.defaultStatus">
            <el-radio :label="0">否</el-radio>
            <el-radio :label="1">是</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="免运费标准" prop="freeFreightPoint">
          <el-input-number
            v-model="formData.freeFreightPoint"
            :min="0"
            placeholder="免运费标准"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="每次评价获取的成长值" prop="commentGrowthPoint">
          <el-input-number
            v-model="formData.commentGrowthPoint"
            :min="0"
            placeholder="每次评价获取的成长值"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="免邮特权" prop="priviledgeFreeFreight">
          <el-switch
            v-model="formData.priviledgeFreeFreight"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="会员价格特权" prop="priviledgeMemberPrice">
          <el-switch
            v-model="formData.priviledgeMemberPrice"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="生日特权" prop="priviledgeBirthday">
          <el-switch
            v-model="formData.priviledgeBirthday"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="备注" prop="note">
          <el-input
            v-model="formData.note"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
            maxlength="500"
            show-word-limit
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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, CircleCheck, Close } from '@element-plus/icons-vue'
import { searchMemberLevel, createMemberLevel, deleteMemberLevel } from '../utils/api'

const loading = ref(false)
const tableData = ref([])
const searchKeyword = ref('')
const selectedRows = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增')
const formRef = ref(null)
const isEdit = ref(false)
const currentEditId = ref(null)

// 分页信息
const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})

// 表单数据
const formData = ref({
  name: '',
  growthPoint: 0,
  defaultStatus: 0,
  freeFreightPoint: 0,
  commentGrowthPoint: 0,
  priviledgeFreeFreight: 0,
  priviledgeMemberPrice: 0,
  priviledgeBirthday: 0,
  note: ''
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入等级名称', trigger: 'blur' }],
  growthPoint: [{ required: true, message: '请输入所需成长值', trigger: 'blur' }]
}

// 加载会员等级列表数据
const loadMemberLevelData = async () => {
  loading.value = true
  try {
    const result = await searchMemberLevel({
      pageNum: pagination.value.current,
      pageSize: pagination.value.size,
      key: searchKeyword.value || ''
    })
    tableData.value = result || []
    // 注意：接口只返回 list，没有分页信息，这里需要根据实际情况调整
    // 如果后端返回了分页信息，可以从 result 中提取
    // 目前假设返回的是完整列表，需要前端分页或后端返回分页信息
    pagination.value.total = result?.length || 0
  } catch (error) {
    ElMessage.error('加载会员等级列表失败：' + error.message)
    tableData.value = []
    pagination.value.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.current = 1
  loadMemberLevelData()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.value.size = size
  pagination.value.current = 1
  loadMemberLevelData()
}

// 当前页改变
const handleCurrentChange = (page) => {
  pagination.value.current = page
  loadMemberLevelData()
}

// 选择改变
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 批量删除
const handleBatchDelete = () => {
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
      const ids = selectedRows.value.map(row => row.id)
      await deleteMemberLevel(ids)
      ElMessage.success('批量删除成功')
      selectedRows.value = []
      loadMemberLevelData()
    } catch (error) {
      ElMessage.error(error.message || '批量删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增'
  currentEditId.value = null
  formData.value = {
    name: '',
    growthPoint: 0,
    defaultStatus: 0,
    freeFreightPoint: 0,
    commentGrowthPoint: 0,
    priviledgeFreeFreight: 0,
    priviledgeMemberPrice: 0,
    priviledgeBirthday: 0,
    note: ''
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '修改'
  currentEditId.value = row.id
  formData.value = {
    name: row.name || '',
    growthPoint: row.growthPoint || 0,
    defaultStatus: row.defaultStatus === true || row.defaultStatus === 1 ? 1 : 0,
    freeFreightPoint: row.freeFreightPoint || 0,
    commentGrowthPoint: row.commentGrowthPoint || 0,
    priviledgeFreeFreight: row.priviledgeFreeFreight === true || row.priviledgeFreeFreight === 1 ? 1 : 0,
    priviledgeMemberPrice: row.priviledgeMemberPrice === true || row.priviledgeMemberPrice === 1 ? 1 : 0,
    priviledgeBirthday: row.priviledgeBirthday === true || row.priviledgeBirthday === 1 ? 1 : 0,
    note: row.note || ''
  }
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除会员等级"${row.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteMemberLevel(row.id)
      ElMessage.success('删除成功')
      loadMemberLevelData()
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
        // 构建提交数据
        const submitData = { ...formData.value }
        
        // 如果是修改模式，添加 id 字段
        if (isEdit.value && currentEditId.value) {
          submitData.id = currentEditId.value
        }
        
        // 新增和修改都调用同一个接口
        await createMemberLevel(submitData)
        ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
        dialogVisible.value = false
        loadMemberLevelData()
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

onMounted(() => {
  loadMemberLevelData()
})
</script>

<style scoped>
.member-level-management {
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
</style>
