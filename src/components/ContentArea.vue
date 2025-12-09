<template>
  <div class="content-area">
    <el-tabs
      v-model="activeTab"
      type="card"
      closable
      @tab-remove="removeTab"
      @tab-click="handleTabClick"
    >
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.name"
        :label="tab.title"
        :name="tab.name"
      >
        <div class="tab-content">
          <!-- 动态组件 -->
          <component
            v-if="tab.component"
            :is="tab.component"
          />
          <!-- iframe -->
          <iframe
            v-else-if="tab.url && tab.isExternal"
            :src="tab.fullUrl"
            frameborder="0"
            class="content-iframe"
          ></iframe>
          <!-- 占位符 -->
          <div v-else class="content-placeholder">
            <el-empty description="请选择菜单项" />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { API_BASE_URL } from '../utils/api'
import MenuManagement from '../views/MenuManagement.vue'

// URL到组件的映射
const urlComponentMap = {
  'sys/menu': MenuManagement
  // 可以在这里添加更多URL到组件的映射
}

const props = defineProps({
  currentMenu: {
    type: Object,
    default: null
  }
})

const tabs = ref([])
const activeTab = ref('')

// 判断URL是否为外部链接
const isExternalUrl = (url) => {
  return url && (url.startsWith('http://') || url.startsWith('https://'))
}

// 处理URL，将相对路径转换为完整URL
const getFullUrl = (url) => {
  if (!url) return ''
  if (isExternalUrl(url)) {
    return url
  }
  // 相对路径，拼接基础URL
  // 如果url以/开头，直接拼接；否则需要根据实际情况处理
  if (url.startsWith('/')) {
    return `${API_BASE_URL}${url}`
  }
  return `${API_BASE_URL}/${url}`
}

// 添加标签页
const addTab = (menu) => {
  if (!menu || !menu.url) return

  const tabName = menu.url
  const existingTab = tabs.value.find(tab => tab.name === tabName)

  if (existingTab) {
    activeTab.value = tabName
    return
  }

  // 检查是否有对应的组件
  const component = urlComponentMap[menu.url] || null
  const isExternal = isExternalUrl(menu.url)

  const newTab = {
    name: tabName,
    title: menu.name,
    url: menu.url,
    fullUrl: getFullUrl(menu.url),
    isExternal: isExternal,
    component: component
  }

  tabs.value.push(newTab)
  activeTab.value = tabName
}

// 移除标签页
const removeTab = (targetName) => {
  const tabsList = tabs.value
  let activeName = activeTab.value

  if (activeName === targetName) {
    tabsList.forEach((tab, index) => {
      if (tab.name === targetName) {
        const nextTab = tabsList[index + 1] || tabsList[index - 1]
        if (nextTab) {
          activeName = nextTab.name
        }
      }
    })
  }

  activeTab.value = activeName
  tabs.value = tabsList.filter(tab => tab.name !== targetName)
}

// 处理标签页点击
const handleTabClick = (tab) => {
  activeTab.value = tab.paneName
}

// 监听当前菜单变化
watch(() => props.currentMenu, (newMenu) => {
  if (newMenu) {
    addTab(newMenu)
  }
}, { immediate: true })
</script>

<style scoped>
.content-area {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
}

:deep(.el-tab-pane) {
  height: 100%;
}

.tab-content {
  height: 100%;
  padding: 0;
}

.content-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.content-placeholder {
  padding: 40px;
  text-align: center;
}

.content-placeholder h3 {
  margin-bottom: 20px;
  color: #303133;
}

.content-placeholder p {
  color: #909399;
  margin: 10px 0;
}
</style>

