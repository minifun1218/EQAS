# 全局拦截器和CORS配置指南

本文档介绍了项目中全局拦截器和CORS配置的实现和使用方法。

## 目录结构

```
src/
├── api/
│   └── index.js          # API接口配置
├── config/
│   └── index.js          # 全局配置文件
├── mixins/
│   └── global.js         # 全局混入
├── store/
│   └── user.js           # 用户状态管理
├── utils/
│   ├── request.js        # HTTP请求拦截器
│   ├── errorHandler.js   # 全局错误处理
│   ├── permission.js     # 权限管理
│   └── index.js          # 工具函数
└── main.js               # 应用入口
```

## 功能特性

### 1. 全局拦截器

#### 请求拦截器
- 自动添加认证token
- 统一请求头配置
- 请求参数预处理
- 加载状态管理

#### 响应拦截器
- 统一响应数据格式处理
- 自动错误处理
- 业务状态码处理
- 登录状态检查

#### 错误拦截器
- 网络错误处理
- HTTP状态码错误处理
- 业务错误处理
- 错误日志记录

### 2. CORS配置

#### 开发环境
- 启用CORS支持
- 配置代理服务器
- 支持跨域请求

#### 生产环境
- 服务器端CORS配置
- 安全策略设置

## 配置说明

### 1. 基础配置 (src/config/index.js)

```javascript
// API配置
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8080/api' 
    : 'https://api.example.com',
  TIMEOUT: 10000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000
}

// 环境配置
export const ENV_CONFIG = {
  NODE_ENV: process.env.NODE_ENV,
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production'
}
```

### 2. Vite配置 (vite.config.js)

```javascript
export default defineConfig({
  server: {
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### 3. 请求拦截器配置 (src/utils/request.js)

```javascript
// 请求拦截器
uni.addInterceptor('request', {
  invoke(options) {
    // 添加认证token
    const token = uni.getStorageSync('token')
    if (token) {
      options.header = {
        ...options.header,
        'Authorization': `Bearer ${token}`
      }
    }
    
    // 设置基础URL
    if (!options.url.startsWith('http')) {
      options.url = API_CONFIG.BASE_URL + options.url
    }
    
    return options
  }
})
```

## 使用方法

### 1. API调用

```javascript
import { userApi, examApi } from '@/api/index'

// 用户登录
const loginResult = await userApi.login({
  username: 'admin',
  password: '123456'
})

// 获取考试列表
const examList = await examApi.getExamList({
  page: 1,
  size: 10
})
```

### 2. 错误处理

```javascript
try {
  const result = await userApi.getUserInfo()
  console.log('用户信息:', result.data)
} catch (error) {
  // 错误会被全局错误处理器自动处理
  console.error('获取用户信息失败:', error)
}
```

### 3. 权限检查

```javascript
// 在组件中使用
export default {
  methods: {
    handleEdit() {
      if (!this.$hasPermission('user:edit')) {
        this.$toast('没有编辑权限')
        return
      }
      // 执行编辑操作
    }
  }
}
```

### 4. 路由守卫

```javascript
import { routeGuard } from '@/utils/permission'

// 在页面onLoad中使用
export default {
  async onLoad() {
    const canAccess = await routeGuard('/pages/admin/users', {
      requireAuth: true,
      requiredPermissions: ['user:view']
    })
    
    if (!canAccess) {
      return // 权限不足，已自动处理
    }
    
    // 继续页面逻辑
  }
}
```

## 全局混入使用

项目已注册全局混入，所有组件都可以直接使用以下方法：

### 1. 格式化方法

```javascript
// 格式化日期
this.$formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')

// 格式化文件大小
this.$formatFileSize(1024) // '1.00 KB'

// 格式化时长
this.$formatDuration(3661) // '01:01:01'
```

### 2. UI交互方法

```javascript
// 显示提示
this.$toast('操作成功', 'success')

// 显示确认对话框
const confirmed = await this.$confirm('确定要删除吗？')
if (confirmed) {
  // 执行删除操作
}

// 显示加载
this.$loading('加载中...')
this.$hideLoading()
```

### 3. 导航方法

```javascript
// 安全导航（带权限检查）
this.$navigateTo('/pages/admin/users', {
  requireAuth: true,
  requiredPermissions: ['user:view']
})

// 返回上一页
this.$goBack()

// 复制文本
this.$copyText('要复制的内容')
```

### 4. 系统信息

```javascript
// 获取系统信息
console.log(this.$systemInfo)

// 获取状态栏高度
console.log(this.$statusBarHeight)

// 获取安全区域
console.log(this.$safeArea)
```

## 错误处理

### 1. API错误

系统会自动处理以下类型的错误：

- **网络错误**: 显示"网络连接失败"提示
- **401未授权**: 自动跳转到登录页
- **403禁止访问**: 显示"没有权限"提示
- **404资源不存在**: 显示"资源不存在"提示
- **500服务器错误**: 显示"服务器错误"提示

### 2. 业务错误

```javascript
// API返回业务错误时
{
  "code": 1001,
  "message": "用户名或密码错误",
  "data": null
}

// 系统会自动显示错误消息
```

### 3. 自定义错误处理

```javascript
import { handleApiError } from '@/utils/errorHandler'

try {
  const result = await api.someMethod()
} catch (error) {
  // 自定义错误处理
  handleApiError(error, {
    showMessage: false, // 不显示默认错误消息
    customHandler: (err) => {
      // 自定义处理逻辑
      console.log('自定义错误处理:', err)
    }
  })
}
```

## 最佳实践

### 1. API接口定义

```javascript
// 推荐的API接口定义方式
export const userApi = {
  // 用户登录
  login: (data) => Request.post('/auth/login', data),
  
  // 获取用户信息
  getUserInfo: () => Request.get('/user/info'),
  
  // 更新用户信息
  updateUserInfo: (data) => Request.put('/user/info', data),
  
  // 删除用户
  deleteUser: (id) => Request.delete(`/user/${id}`)
}
```

### 2. 错误处理

```javascript
// 推荐的错误处理方式
export default {
  methods: {
    async loadData() {
      try {
        this.$loading('加载中...')
        const result = await userApi.getUserList()
        this.userList = result.data
      } catch (error) {
        // 错误已被全局处理，这里只需要处理特殊逻辑
        this.userList = []
      } finally {
        this.$hideLoading()
      }
    }
  }
}
```

### 3. 权限控制

```javascript
// 推荐的权限控制方式
export default {
  computed: {
    canEdit() {
      return this.$hasPermission('user:edit')
    },
    
    canDelete() {
      return this.$hasRole(['admin', 'super_admin'])
    }
  },
  
  methods: {
    handleEdit() {
      if (!this.canEdit) {
        this.$toast('没有编辑权限')
        return
      }
      // 执行编辑操作
    }
  }
}
```

## 注意事项

1. **Token管理**: Token会自动添加到请求头，无需手动处理
2. **错误处理**: 大部分错误会被自动处理，特殊情况可自定义处理
3. **权限检查**: 使用混入提供的权限方法进行权限检查
4. **CORS配置**: 开发环境已配置代理，生产环境需要服务器端配置
5. **请求重试**: 网络错误时会自动重试，可在配置中调整重试次数

## 常见问题

### 1. 跨域问题

**问题**: 开发环境出现跨域错误

**解决**: 检查vite.config.js中的代理配置是否正确

### 2. Token失效

**问题**: Token过期后没有自动跳转登录页

**解决**: 检查响应拦截器中的401处理逻辑

### 3. 权限检查失效

**问题**: 权限检查方法返回错误结果

**解决**: 检查用户信息中的权限数据格式是否正确

### 4. 请求超时

**问题**: 请求经常超时

**解决**: 调整config/index.js中的TIMEOUT配置

## 更新日志

- **v1.0.0**: 初始版本，包含基础拦截器和CORS配置
- **v1.1.0**: 添加错误处理和权限管理
- **v1.2.0**: 添加全局混入和工具函数

---

如有问题，请联系开发团队或查看项目文档。