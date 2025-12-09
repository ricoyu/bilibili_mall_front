<template>
  <div class="home">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>欢迎使用 Vue + Element UI</span>
        </div>
      </template>
      <div class="content">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card shadow="hover">
              <el-icon :size="40" color="#409eff"><User /></el-icon>
              <h3>用户管理</h3>
              <p>管理系统用户信息</p>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover">
              <el-icon :size="40" color="#67c23a"><Document /></el-icon>
              <h3>文档管理</h3>
              <p>查看和管理文档</p>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover">
              <el-icon :size="40" color="#e6a23c"><Setting /></el-icon>
              <h3>系统设置</h3>
              <p>配置系统参数</p>
            </el-card>
          </el-col>
        </el-row>

        <el-divider />

        <el-form :model="form" label-width="100px" style="max-width: 500px">
          <el-form-item label="用户名">
            <el-input v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
          <el-form-item label="记住我">
            <el-switch v-model="form.remember" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSubmit">提交</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>

        <el-divider />

        <el-table :data="tableData" style="width: 100%">
          <el-table-column prop="date" label="日期" width="180" />
          <el-table-column prop="name" label="姓名" width="180" />
          <el-table-column prop="address" label="地址" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Document, Setting } from '@element-plus/icons-vue'

const form = ref({
  username: '',
  password: '',
  remember: false
})

const tableData = ref([
  {
    date: '2024-01-01',
    name: '张三',
    address: '北京市朝阳区'
  },
  {
    date: '2024-01-02',
    name: '李四',
    address: '上海市浦东新区'
  },
  {
    date: '2024-01-03',
    name: '王五',
    address: '广州市天河区'
  }
])

const handleSubmit = () => {
  ElMessage.success('提交成功！')
  console.log('表单数据:', form.value)
}

const handleReset = () => {
  form.value = {
    username: '',
    password: '',
    remember: false
  }
  ElMessage.info('表单已重置')
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.content {
  padding: 20px 0;
}

.el-card {
  text-align: center;
  margin-bottom: 20px;
}

.el-card h3 {
  margin: 10px 0;
  color: #303133;
}

.el-card p {
  color: #909399;
  font-size: 14px;
}
</style>

