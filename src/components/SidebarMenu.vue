<template>
  <div class="sidebar-menu">
    <el-menu
      :default-active="activeMenu"
      class="el-menu-vertical"
      :collapse="isCollapse"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
      @select="handleMenuSelect"
    >
      <template v-for="menu in menuList" :key="menu.menuId">
        <!-- 有子菜单的情况 -->
        <el-sub-menu
          v-if="menu.children && menu.children.length > 0"
          :index="String(menu.menuId)"
        >
          <template #title>
            <el-icon v-if="menu.icon">
              <component :is="getIconComponent(menu.icon)" />
            </el-icon>
            <span>{{ menu.name }}</span>
          </template>
          <template v-for="child in menu.children" :key="child.menuId">
            <!-- 二级菜单有子菜单 -->
            <el-sub-menu
              v-if="child.children && child.children.length > 0"
              :index="String(child.menuId)"
            >
              <template #title>
                <el-icon v-if="child.icon">
                  <component :is="getIconComponent(child.icon)" />
                </el-icon>
                <span>{{ child.name }}</span>
              </template>
              <el-menu-item
                v-for="subChild in child.children"
                :key="subChild.menuId"
                :index="subChild.url || String(subChild.menuId)"
                @click="handleMenuItemClick(subChild)"
              >
                <el-icon v-if="subChild.icon">
                  <component :is="getIconComponent(subChild.icon)" />
                </el-icon>
                <span>{{ subChild.name }}</span>
              </el-menu-item>
            </el-sub-menu>
            <!-- 二级菜单无子菜单 -->
            <el-menu-item
              v-else
              :index="child.url || String(child.menuId)"
              @click="handleMenuItemClick(child)"
            >
              <el-icon v-if="child.icon">
                <component :is="getIconComponent(child.icon)" />
              </el-icon>
              <span>{{ child.name }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>
        <!-- 无子菜单的情况 -->
        <el-menu-item
          v-else
          :index="menu.url || String(menu.menuId)"
          @click="handleMenuItemClick(menu)"
        >
          <el-icon v-if="menu.icon">
            <component :is="getIconComponent(menu.icon)" />
          </el-icon>
          <span>{{ menu.name }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getMenuTree } from '../utils/api'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const props = defineProps({
  isCollapse: {
    type: Boolean,
    default: false
  },
  clearActive: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['menu-select'])

const menuList = ref([])
const activeMenu = ref('')

// 监听 clearActive 变化，清除激活状态
watch(() => props.clearActive, (newValue) => {
  if (newValue && activeMenu.value === newValue) {
    activeMenu.value = ''
  }
})

// 图标映射（将后端返回的图标名映射到Element Plus图标组件名）
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
  
  // 先尝试从映射表获取
  const mappedIcon = iconMap[iconName]
  if (mappedIcon && ElementPlusIconsVue[mappedIcon]) {
    return ElementPlusIconsVue[mappedIcon]
  }
  
  // 尝试直接使用图标名（首字母大写）
  const capitalizedIcon = iconName.charAt(0).toUpperCase() + iconName.slice(1)
  if (ElementPlusIconsVue[capitalizedIcon]) {
    return ElementPlusIconsVue[capitalizedIcon]
  }
  
  // 默认返回Menu图标
  return ElementPlusIconsVue['Menu']
}

// 加载菜单数据
const loadMenuData = async () => {
  try {
    const data = await getMenuTree()
    menuList.value = data
  } catch (error) {
    console.error('加载菜单失败:', error)
    // 如果接口失败，可以设置默认菜单
    menuList.value = []
  }
}

// 处理菜单项点击（用于支持重复点击已激活的菜单项）
const handleMenuItemClick = (menu) => {
  if (menu && menu.url && menu.type === 1) {
    // 更新激活状态
    activeMenu.value = menu.url
    // 始终触发事件，即使菜单项已经激活
    emit('menu-select', menu)
  }
}

// 处理菜单选择
const handleMenuSelect = (index) => {
  // 查找选中的菜单项
  const findMenuByUrl = (menus, url) => {
    for (const menu of menus) {
      // 匹配url或menuId
      if (menu.url === url || String(menu.menuId) === url) {
        // 只返回有url的菜单项（type为1的菜单项）
        if (menu.url && menu.type === 1) {
          return menu
        }
      }
      if (menu.children && menu.children.length > 0) {
        const found = findMenuByUrl(menu.children, url)
        if (found) return found
      }
    }
    return null
  }
  
  const selectedMenu = findMenuByUrl(menuList.value, index)
  if (selectedMenu && selectedMenu.url) {
    // 更新激活状态
    activeMenu.value = index
    // 始终触发事件，即使菜单项已经激活
    emit('menu-select', selectedMenu)
  }
}

onMounted(() => {
  loadMenuData()
})
</script>

<style scoped>
.sidebar-menu {
  height: 100%;
  overflow-y: auto;
}

.el-menu-vertical {
  border-right: none;
  height: 100%;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 200px;
}

/* 滚动条样式 */
.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>

