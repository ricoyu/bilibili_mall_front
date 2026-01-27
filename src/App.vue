<template>
  <div id="app">
    <el-container class="app-container">
      <!-- 左侧菜单栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'" class="app-aside">
        <div class="menu-header">
          <span v-if="!isCollapse" class="logo-text">哔哩哔哩商城后台系统</span>
          <el-button
            :icon="isCollapse ? Expand : Fold"
            circle
            size="small"
            @click="toggleCollapse"
            class="collapse-btn"
          />
        </div>
        <SidebarMenu
          :is-collapse="isCollapse"
          :clear-active="clearActiveMenu"
          @menu-select="handleMenuSelect"
        />
      </el-aside>
      <!-- 右侧内容区 -->
      <el-container class="app-main-container">
        <el-header class="app-header">
          <div class="header-content">
            <span class="header-title">后台管理系统</span>
          </div>
        </el-header>
        <el-main class="app-main">
          <ContentArea 
            :current-menu="currentMenu" 
            @tab-remove="handleTabRemove"
          />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SidebarMenu from './components/SidebarMenu.vue'
import ContentArea from './components/ContentArea.vue'
import { Fold, Expand } from '@element-plus/icons-vue'

const router = useRouter()
const isCollapse = ref(false)
const currentMenu = ref(null)
const clearActiveMenu = ref('')

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleMenuSelect = (menu) => {
  currentMenu.value = menu
  // 更新浏览器 URL，使用 hash 模式
  if (menu && menu.url) {
    router.push(`/${menu.url}`)
  }
}

const handleTabRemove = (tabName) => {
  // 如果关闭的标签页对应的菜单是当前激活的菜单，清除激活状态
  if (currentMenu.value && currentMenu.value.url === tabName) {
    currentMenu.value = null
    // 通知 SidebarMenu 清除激活状态
    clearActiveMenu.value = tabName
    // 重置 clearActiveMenu，以便下次可以再次触发
    setTimeout(() => {
      clearActiveMenu.value = ''
    }, 0)
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  overflow: hidden;
}

.app-container {
  height: 100vh;
}

.app-aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.menu-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  background-color: #2b3a4a;
  border-bottom: 1px solid #1f2d3d;
}

.logo-text {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.collapse-btn {
  background-color: transparent;
  border-color: #409eff;
  color: #409eff;
}

.collapse-btn:hover {
  background-color: rgba(64, 158, 255, 0.1);
}

.app-main-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
  height: 60px;
  line-height: 60px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.app-main {
  padding: 0;
  background-color: #f0f2f5;
  overflow: hidden;
  height: calc(100vh - 60px);
}
</style>

