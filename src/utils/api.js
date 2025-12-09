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

