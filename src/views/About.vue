<template>
  <div class="about">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>关于项目</span>
        </div>
      </template>
      <div class="content">
        <el-descriptions title="项目信息" :column="2" border>
          <el-descriptions-item label="项目名称">Vue + Element UI 项目</el-descriptions-item>
          <el-descriptions-item label="框架版本">Vue 3.3.4</el-descriptions-item>
          <el-descriptions-item label="UI框架">Element Plus 2.4.4</el-descriptions-item>
          <el-descriptions-item label="构建工具">Vite 4.5.0</el-descriptions-item>
          <el-descriptions-item label="路由">Vue Router 4.2.5</el-descriptions-item>
          <el-descriptions-item label="开发语言">JavaScript</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-timeline>
          <el-timeline-item timestamp="2024-01-01" placement="top">
            <el-card>
              <h4>项目初始化</h4>
              <p>创建Vue 3项目并集成Element Plus UI框架</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2024-01-02" placement="top">
            <el-card>
              <h4>路由配置</h4>
              <p>配置Vue Router实现页面路由功能</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2024-01-03" placement="top">
            <el-card>
              <h4>组件开发</h4>
              <p>开发示例页面展示Element Plus组件使用</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>

        <el-divider />

        <el-alert
          title="提示"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <p>这是一个基于 Vue 3 + Element Plus 的前端项目模板。</p>
            <p>你可以在此基础上开发你的业务功能。</p>
          </template>
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script setup>
// About页面组件
</script>

<style scoped>
.about {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.content {
  padding: 20px 0;
}

.el-descriptions {
  margin-bottom: 20px;
}

.el-timeline {
  margin: 20px 0;
}

.el-alert {
  margin-top: 20px;
}
</style>

