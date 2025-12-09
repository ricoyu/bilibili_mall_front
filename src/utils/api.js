// API请求工具
export const API_BASE_URL = 'http://localhost:8070'

export async function getMenuTree() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/menu/tree`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    if (data.code === '0' || data.status === 'success') {
      return data.data || []
    }
    throw new Error(data.message || '获取菜单失败')
  } catch (error) {
    console.error('获取菜单失败:', error)
    throw error
  }
}

// 创建菜单
export async function createMenu(menuData) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/menu/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(menuData)
    })
    const data = await response.json()
    if (data.code === '0' || data.status === 'success') {
      return data
    }
    throw new Error(data.message || '创建菜单失败')
  } catch (error) {
    console.error('创建菜单失败:', error)
    throw error
  }
}

// 更新菜单
export async function updateMenu(menuData) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/menu/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(menuData)
    })
    const data = await response.json()
    if (data.code === '0' || data.status === 'success') {
      return data
    }
    throw new Error(data.message || '更新菜单失败')
  } catch (error) {
    console.error('更新菜单失败:', error)
    throw error
  }
}

// 删除菜单
export async function deleteMenu(menuId) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/menu/${menuId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    if (data.code === '0' || data.status === 'success') {
      return data
    }
    throw new Error(data.message || '删除菜单失败')
  } catch (error) {
    console.error('删除菜单失败:', error)
    throw error
  }
}

