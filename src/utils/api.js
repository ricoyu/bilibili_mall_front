// API请求工具
export const API_BASE_URL = 'http://localhost:8070'

// 上传文件到 Ceph，返回 url
export async function uploadCeph(file) {
  try {
    const formData = new FormData()
    // 约定后端接收字段名为 file
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/file/ceph/upload`, {
      method: 'POST',
      body: formData
    })
    const data = await response.json()
    if (data.code === '0' || data.status === 'success') {
      const url = data?.data?.url
      if (!url) throw new Error('上传成功但未返回url')
      return url
    }
    throw new Error(data.message || '上传失败')
  } catch (error) {
    console.error('上传失败:', error)
    throw error
  }
}

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

// 搜索菜单
export async function searchMenu(searchParams) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/menu/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchParams)
    })
    const data = await response.json()
    if (data.code === '0' || data.status === 'success') {
      return data.data || []
    }
    throw new Error(data.message || '搜索菜单失败')
  } catch (error) {
    console.error('搜索菜单失败:', error)
    throw error
  }
}

// 获取品牌列表
export async function getBrandList() {
  try {
    // 后台已写死分页参数，使用 POST 方法调用接口
    const response = await fetch(`${API_BASE_URL}/product/brand/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    if (data.code === '0' || data.status === 'success') {
      // 返回格式：{ list, page }
      return {
        list: data.data || [],
        page: data.page || {}
      }
    }
    throw new Error(data.message || '获取品牌列表失败')
  } catch (error) {
    console.error('获取品牌列表失败:', error)
    throw error
  }
}

// 创建品牌
export async function createBrand(brandData) {
  try {
    const response = await fetch(`${API_BASE_URL}/product/brand/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(brandData)
    })
    const data = await response.json()
    if (data.code === '0' || data.status === 'success') {
      return data
    }
    throw new Error(data.message || '创建品牌失败')
  } catch (error) {
    console.error('创建品牌失败:', error)
    throw error
  }
}

// 更新品牌
export async function updateBrand(brandData) {
  try {
    const response = await fetch(`${API_BASE_URL}/product/brand/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(brandData)
    })
    const data = await response.json()
    if (data.code === '0' || data.status === 'success') {
      return data
    }
    throw new Error(data.message || '更新品牌失败')
  } catch (error) {
    console.error('更新品牌失败:', error)
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

// 获取商品分类树
export async function getCategoryTree() {
  try {
    const response = await fetch(`${API_BASE_URL}/product/category/list-tree`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    if (data.code === '0' || data.status === 'success') {
      return data.data || []
    }
    throw new Error(data.message || '获取分类数据失败')
  } catch (error) {
    console.error('获取分类数据失败:', error)
    throw error
  }
}

// 创建分类
export async function createCategory(categoryData) {
  try {
    const response = await fetch(`${API_BASE_URL}/product/category/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(categoryData)
    })
    const data = await response.json()
    if (data.code === '0' || data.status === 'success') {
      return data
    }
    throw new Error(data.message || '创建分类失败')
  } catch (error) {
    console.error('创建分类失败:', error)
    throw error
  }
}

// 更新分类
export async function updateCategory(categoryData) {
  try {
    const response = await fetch(`${API_BASE_URL}/product/category/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(categoryData)
    })
    const data = await response.json()
    if (data.code === '0' || data.status === 'success') {
      return data
    }
    throw new Error(data.message || '更新分类失败')
  } catch (error) {
    console.error('更新分类失败:', error)
    throw error
  }
}

// 删除分类
export async function deleteCategory(catId) {
  try {
    const response = await fetch(`${API_BASE_URL}/product/category/${catId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    if (data.code === '0' || data.status === 'success') {
      return data
    }
    throw new Error(data.message || '删除分类失败')
  } catch (error) {
    console.error('删除分类失败:', error)
    throw error
  }
}

// 切换品牌显示状态
export async function switchBrandShowStatus(brandId, showStatus) {
  try {
    const response = await fetch(`${API_BASE_URL}/product/brand/switchshow/${brandId}/${showStatus}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    if (data.code === '0' || data.status === 'success') {
      return data
    }
    throw new Error(data.message || '切换显示状态失败')
  } catch (error) {
    console.error('切换显示状态失败:', error)
    throw error
  }
}

// 搜索品牌
export async function searchBrand(searchParams) {
  try {
    const response = await fetch(`${API_BASE_URL}/product/brand/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchParams)
    })
    const data = await response.json()
    if (data.code === '0' || data.status === 'success') {
      return {
        list: data.data || [],
        page: data.page || {}
      }
    }
    throw new Error(data.message || '搜索品牌失败')
  } catch (error) {
    console.error('搜索品牌失败:', error)
    throw error
  }
}

