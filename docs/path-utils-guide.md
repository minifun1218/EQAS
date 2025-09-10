# 路径处理工具使用指南

## 概述

本项目提供了一套完整的路径处理工具，用于将后端传来的非完整路径拼接成完整的后端路径。这些工具位于 `src/utils/pathUtils.js` 文件中。

## 主要功能

### 1. buildFullPath(path, options)

将后端传来的非完整路径拼接成完整的后端路径。

**参数：**
- `path` (string): 后端传来的路径，可能是相对路径或不完整路径
- `options` (object): 配置选项
  - `baseUrl` (string): 自定义基础URL，默认使用配置中的BASE_URL
  - `forceHttps` (boolean): 是否强制使用HTTPS，默认false
  - `removeApiPrefix` (boolean): 是否移除路径中的/api前缀，默认false

**返回值：** 完整的后端路径

**示例：**
```javascript
import { buildFullPath } from '@/utils/pathUtils'

// 基础使用
buildFullPath('/user/profile')
// 输出: http://localhost:8080/user/profile (开发环境)

buildFullPath('user/avatar')
// 输出: http://localhost:8080/user/avatar

// 自定义配置
buildFullPath('/api/data', {
  baseUrl: 'https://custom-api.com',
  forceHttps: true
})
// 输出: https://custom-api.com/api/data
```

### 2. buildApiPath(path, options)

构建API路径，自动添加/api前缀。

**参数：**
- `path` (string): API路径
- `options` (object): 配置选项

**返回值：** 完整的API路径

**示例：**
```javascript
import { buildApiPath } from '@/utils/pathUtils'

buildApiPath('/user/info')
// 输出: http://localhost:8080/api/user/info

buildApiPath('study/progress')
// 输出: http://localhost:8080/api/study/progress
```

### 3. buildStaticPath(path, options)

构建静态资源路径。

**参数：**
- `path` (string): 资源路径
- `options` (object): 配置选项
  - `staticBaseUrl` (string): 静态资源基础URL

**返回值：** 完整的静态资源路径

**示例：**
```javascript
import { buildStaticPath } from '@/utils/pathUtils'

buildStaticPath('/images/avatar.jpg')
// 输出: http://localhost:8080/images/avatar.jpg

buildStaticPath('/uploads/file.pdf', {
  staticBaseUrl: 'https://cdn.example.com'
})
// 输出: https://cdn.example.com/uploads/file.pdf
```

### 4. buildFullPaths(paths, options)

批量处理路径数组。

**参数：**
- `paths` (string[]): 路径数组
- `options` (object): 配置选项

**返回值：** 完整路径数组

**示例：**
```javascript
import { buildFullPaths } from '@/utils/pathUtils'

const paths = ['/user/info', 'study/stats', '/training/list']
const fullPaths = buildFullPaths(paths)
// 输出: [
//   'http://localhost:8080/user/info',
//   'http://localhost:8080/study/stats',
//   'http://localhost:8080/training/list'
// ]
```

### 5. normalizePath(path)

规范化路径格式。

**参数：**
- `path` (string): 原始路径

**返回值：** 规范化后的路径

**示例：**
```javascript
import { normalizePath } from '@/utils/pathUtils'

normalizePath('//user//profile/')
// 输出: /user/profile

normalizePath('study///stats')
// 输出: /study/stats
```

### 6. isFullUrl(path)

检查路径是否为完整URL。

**参数：**
- `path` (string): 要检查的路径

**返回值：** 是否为完整URL

**示例：**
```javascript
import { isFullUrl } from '@/utils/pathUtils'

isFullUrl('http://example.com/api')
// 输出: true

isFullUrl('/api/user')
// 输出: false
```

### 7. extractPath(fullUrl)

从完整URL中提取路径部分。

**参数：**
- `fullUrl` (string): 完整的URL

**返回值：** 路径部分

**示例：**
```javascript
import { extractPath } from '@/utils/pathUtils'

extractPath('http://example.com/api/user?id=123')
// 输出: /api/user?id=123
```

## 在项目中的集成

### 1. 网络请求集成

路径处理工具已经集成到 `src/utils/request.js` 中，所有网络请求都会自动使用路径处理功能：

```javascript
// 在 request.js 中
import { buildFullPath, isFullUrl } from '@/utils/pathUtils'

function requestInterceptor(options) {
  // 使用路径处理工具构建完整URL
  if (!isFullUrl(options.url)) {
    options.url = buildFullPath(options.url, { baseUrl: BASE_URL })
  }
  // ... 其他处理
}
```

### 2. API配置集成

在 `src/api/index.js` 中提供了便捷的路径处理函数：

```javascript
import { pathUtils } from '@/api/index'

// 构建API路径
const apiUrl = pathUtils.buildApiUrl('/user/profile')

// 构建自定义路径
const customUrl = pathUtils.buildUrl('/static/image.jpg', {
  baseUrl: 'https://cdn.example.com'
})
```

## 实际使用场景

### 场景1: 处理后端返回的用户头像路径

```javascript
// 后端返回的数据
const userInfo = {
  name: '张三',
  avatar: '/uploads/avatars/user123.jpg' // 非完整路径
}

// 处理头像路径
const fullAvatarUrl = buildStaticPath(userInfo.avatar)
// 结果: http://localhost:8080/uploads/avatars/user123.jpg
```

### 场景2: 批量处理API端点

```javascript
// 后端返回的API端点列表
const apiEndpoints = [
  '/user/profile',
  'study/progress',
  '/training/history',
  'exam/results'
]

// 批量处理成完整URL
const fullApiUrls = buildFullPaths(apiEndpoints)
```

### 场景3: 动态API调用

```javascript
// 根据用户权限动态构建API路径
function getUserData(userId, dataType) {
  const path = `/user/${userId}/${dataType}`
  const fullUrl = buildApiPath(path)
  return Request.get(fullUrl)
}
```

## 配置说明

路径处理工具使用项目配置文件 `src/config/index.js` 中的 `API_CONFIG.BASE_URL` 作为默认基础URL：

```javascript
// 开发环境: http://localhost:8080
// 生产环境: https://api.icao4.com
```

## 错误处理

工具函数包含完善的错误处理机制：

1. **无效参数处理**: 当传入无效参数时，会输出警告并返回安全的默认值
2. **URL格式验证**: 自动检测和处理各种URL格式
3. **路径规范化**: 自动处理重复斜杠、缺失斜杠等问题

## 调试和日志

工具函数会在控制台输出详细的调试信息，包括：
- 输入参数
- 处理选项
- 输出结果

这有助于开发过程中的调试和问题排查。

## 最佳实践

1. **统一使用**: 在项目中统一使用路径处理工具，避免手动拼接URL
2. **配置管理**: 将不同环境的基础URL配置在配置文件中
3. **错误处理**: 始终检查路径处理的结果，确保URL的正确性
4. **性能考虑**: 对于大量路径处理，使用批量处理函数
5. **类型检查**: 在TypeScript项目中，为路径参数添加类型检查

## 扩展功能

如需添加新的路径处理功能，可以在 `pathUtils.js` 中扩展：

```javascript
// 示例: 添加查询参数处理
export function buildUrlWithParams(path, params, options = {}) {
  const fullPath = buildFullPath(path, options)
  const url = new URL(fullPath)
  
  Object.keys(params).forEach(key => {
    url.searchParams.set(key, params[key])
  })
  
  return url.toString()
}
```

## 总结

路径处理工具提供了完整的解决方案，用于处理后端传来的非完整路径。通过统一的API和灵活的配置选项，可以轻松应对各种路径处理需求，提高代码的可维护性和可靠性。