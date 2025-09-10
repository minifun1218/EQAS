# 用户模块API接口文档

本文档记录了用户模块中所有页面使用的后台API接口地址和期望返回的数据格式。

## 基础配置

### API基础地址
```
const BASE_URL = 'https://api.eqas.com'
```

### 通用响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

## 用户相关接口 (userApi)

### 1. 获取用户信息
**接口地址：** `GET /api/user/profile`

**请求参数：** 无

**返回数据格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "张三",
    "avatar": "https://example.com/avatar.jpg",
    "email": "zhangsan@example.com",
    "phone": "13800138000",
    "gender": "男",
    "birthday": "1990-01-01",
    "location": "北京市朝阳区",
    "signature": "努力学习，天天向上",
    "joinDate": "2023-01-01",
    "level": 5,
    "exp": 2580,
    "nextLevelExp": 3000
  }
}
```

### 2. 更新用户信息
**接口地址：** `PUT /api/user/profile`

**请求参数：**
```json
{
  "username": "张三",
  "email": "zhangsan@example.com",
  "phone": "13800138000",
  "gender": "男",
  "birthday": "1990-01-01",
  "location": "北京市朝阳区",
  "signature": "努力学习，天天向上"
}
```

**返回数据格式：**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

### 3. 上传头像
**接口地址：** `POST /api/user/avatar`

**请求参数：** FormData (file)

**返回数据格式：**
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "avatar": "https://example.com/new-avatar.jpg"
  }
}
```

### 4. 获取用户设置
**接口地址：** `GET /api/user/settings`

**请求参数：** 无

**返回数据格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "study": {
      "dailyGoal": 30,
      "studyReminder": true,
      "reminderTime": "20:00",
      "autoSave": true
    },
    "system": {
      "pushNotification": true,
      "soundEffect": true,
      "vibration": false,
      "language": "中文",
      "theme": "浅色模式"
    },
    "privacy": {
      "dataAnalytics": true,
      "personalization": true
    }
  }
}
```

### 5. 更新用户设置
**接口地址：** `PUT /api/user/settings`

**请求参数：**
```json
{
  "study": {
    "dailyGoal": 30,
    "studyReminder": true,
    "reminderTime": "20:00",
    "autoSave": true
  },
  "system": {
    "pushNotification": true,
    "soundEffect": true,
    "vibration": false,
    "language": "中文",
    "theme": "浅色模式"
  },
  "privacy": {
    "dataAnalytics": true,
    "personalization": true
  }
}
```

**返回数据格式：**
```json
{
  "code": 200,
  "message": "设置已保存",
  "data": null
}
```

## 学习进度相关接口 (progressApi)

### 1. 获取学习概览统计
**接口地址：** `GET /api/progress/overview`

**请求参数：** 无

**返回数据格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalStudyTime": 1250,
    "todayStudyTime": 45,
    "weekStudyTime": 320,
    "totalQuestions": 2580,
    "correctRate": 85.6,
    "streak": 15,
    "rank": 128
  }
}
```

### 2. 获取课程进度
**接口地址：** `GET /api/progress/courses`

**请求参数：** 无

**返回数据格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "数学基础",
      "progress": 75,
      "totalLessons": 20,
      "completedLessons": 15,
      "lastStudyTime": "2024-01-15 14:30:00"
    },
    {
      "id": 2,
      "name": "英语语法",
      "progress": 60,
      "totalLessons": 25,
      "completedLessons": 15,
      "lastStudyTime": "2024-01-14 16:20:00"
    }
  ]
}
```

### 3. 获取成就列表
**接口地址：** `GET /api/progress/achievements`

**请求参数：** 无

**返回数据格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "初学者",
      "description": "完成第一次练习",
      "icon": "🎯",
      "unlocked": true,
      "unlockedAt": "2024-01-01 10:00:00"
    },
    {
      "id": 2,
      "name": "坚持者",
      "description": "连续学习7天",
      "icon": "🔥",
      "unlocked": true,
      "unlockedAt": "2024-01-08 20:00:00"
    }
  ]
}
```

### 4. 获取学习日历数据
**接口地址：** `GET /api/progress/calendar`

**请求参数：**
- `year`: 年份 (number)
- `month`: 月份 (number, 1-12)

**返回数据格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "year": 2024,
    "month": 1,
    "days": [
      {
        "date": "2024-01-01",
        "studyTime": 45,
        "questionsCount": 20,
        "hasStudy": true
      },
      {
        "date": "2024-01-02",
        "studyTime": 0,
        "questionsCount": 0,
        "hasStudy": false
      }
    ]
  }
}
```

### 5. 获取学习目标
**接口地址：** `GET /api/progress/goals`

**请求参数：** 无

**返回数据格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "dailyTime": 60,
    "dailyQuestions": 50,
    "weeklyTime": 420,
    "monthlyTime": 1800,
    "currentProgress": {
      "dailyTime": 45,
      "dailyQuestions": 35,
      "weeklyTime": 320,
      "monthlyTime": 1250
    }
  }
}
```

## 练习历史相关接口 (historyApi)

### 1. 获取练习历史
**接口地址：** `GET /api/history/practice`

**请求参数：**
- `timeFilter`: 时间筛选 (string: 'all', 'today', 'week', 'month')
- `typeFilter`: 类型筛选 (string: 'all', 'choice', 'fill', 'judge', 'essay')
- `scoreRange`: 分数范围 (array: [min, max])
- `page`: 页码 (number, 默认1)
- `pageSize`: 每页数量 (number, 默认20)

**返回数据格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 156,
    "page": 1,
    "pageSize": 20,
    "list": [
      {
        "id": 1,
        "subject": "数学",
        "type": "选择题",
        "score": 85,
        "totalQuestions": 20,
        "correctCount": 17,
        "duration": 1800,
        "startTime": "2024-01-15 14:00:00",
        "endTime": "2024-01-15 14:30:00",
        "difficulty": "中等"
      }
    ]
  }
}
```

### 2. 获取练习详情
**接口地址：** `GET /api/history/practice/{id}`

**请求参数：**
- `id`: 练习记录ID (path参数)

**返回数据格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "subject": "数学",
    "type": "选择题",
    "score": 85,
    "totalQuestions": 20,
    "correctCount": 17,
    "wrongCount": 3,
    "duration": 1800,
    "startTime": "2024-01-15 14:00:00",
    "endTime": "2024-01-15 14:30:00",
    "difficulty": "中等",
    "questions": [
      {
        "id": 1,
        "content": "1+1等于多少？",
        "userAnswer": "A",
        "correctAnswer": "A",
        "isCorrect": true,
        "timeSpent": 30
      }
    ]
  }
}
```

## 错题相关接口 (mistakeApi)

### 1. 获取错题列表
**接口地址：** `GET /api/mistakes`

**请求参数：**
- `subject`: 科目筛选 (string: 'all', '数学', '英语', '语文')
- `type`: 题型筛选 (string: 'all', 'choice', 'fill', 'judge', 'essay')
- `difficulty`: 难度筛选 (string: 'all', 'easy', 'medium', 'hard')
- `sortBy`: 排序方式 (string: 'time', 'subject', 'difficulty')
- `page`: 页码 (number, 默认1)
- `pageSize`: 每页数量 (number, 默认20)

**返回数据格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 45,
    "page": 1,
    "pageSize": 20,
    "list": [
      {
        "id": 1,
        "subject": "数学",
        "type": "选择题",
        "difficulty": "中等",
        "content": "求解方程 x² + 2x - 3 = 0",
        "userAnswer": "x = 1, x = 3",
        "correctAnswer": "x = 1, x = -3",
        "analysis": "使用因式分解法：(x-1)(x+3)=0",
        "wrongTime": "2024-01-15 14:20:00",
        "reviewCount": 2,
        "masteryLevel": "需要练习"
      }
    ]
  }
}
```

### 2. 获取错题详情
**接口地址：** `GET /api/mistakes/{id}`

**请求参数：**
- `id`: 错题ID (path参数)

**返回数据格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "subject": "数学",
    "type": "选择题",
    "difficulty": "中等",
    "content": "求解方程 x² + 2x - 3 = 0",
    "options": ["A. x = 1, x = 3", "B. x = 1, x = -3", "C. x = -1, x = 3", "D. x = -1, x = -3"],
    "userAnswer": "A",
    "correctAnswer": "B",
    "analysis": "使用因式分解法：(x-1)(x+3)=0，所以x=1或x=-3",
    "wrongTime": "2024-01-15 14:20:00",
    "reviewCount": 2,
    "masteryLevel": "需要练习",
    "relatedKnowledge": ["二次方程", "因式分解"]
  }
}
```

### 3. 删除错题
**接口地址：** `DELETE /api/mistakes/{id}`

**请求参数：**
- `id`: 错题ID (path参数)

**返回数据格式：**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

### 4. 批量删除错题
**接口地址：** `DELETE /api/mistakes/batch`

**请求参数：**
```json
{
  "ids": [1, 2, 3, 4, 5]
}
```

**返回数据格式：**
```json
{
  "code": 200,
  "message": "批量删除成功",
  "data": {
    "deletedCount": 5
  }
}
```

### 5. 标记错题为已复习
**接口地址：** `PUT /api/mistakes/{id}/review`

**请求参数：**
- `id`: 错题ID (path参数)

**返回数据格式：**
```json
{
  "code": 200,
  "message": "标记成功",
  "data": null
}
```

### 6. 批量标记错题为已复习
**接口地址：** `PUT /api/mistakes/batch/review`

**请求参数：**
```json
{
  "ids": [1, 2, 3, 4, 5]
}
```

**返回数据格式：**
```json
{
  "code": 200,
  "message": "批量标记成功",
  "data": {
    "reviewedCount": 5
  }
}
```

### 7. 清空所有错题
**接口地址：** `DELETE /api/mistakes/all`

**请求参数：** 无

**返回数据格式：**
```json
{
  "code": 200,
  "message": "清空成功",
  "data": {
    "deletedCount": 45
  }
}
```

## 系统相关接口 (systemApi)

### 1. 获取存储信息
**接口地址：** `GET /api/system/storage`

**请求参数：** 无

**返回数据格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "used": "128MB",
    "total": "1GB",
    "usedBytes": 134217728,
    "totalBytes": 1073741824,
    "usagePercent": 12.5
  }
}
```

### 2. 获取缓存大小
**接口地址：** `GET /api/system/cache/size`

**请求参数：** 无

**返回数据格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "size": "45MB",
    "sizeBytes": 47185920
  }
}
```

### 3. 清除缓存
**接口地址：** `DELETE /api/system/cache`

**请求参数：** 无

**返回数据格式：**
```json
{
  "code": 200,
  "message": "缓存清除成功",
  "data": {
    "clearedSize": "45MB",
    "clearedBytes": 47185920
  }
}
```

### 4. 检查更新
**接口地址：** `GET /api/system/update/check`

**请求参数：** 无

**返回数据格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "hasUpdate": true,
    "version": "2.1.0",
    "description": "修复了一些已知问题，优化了用户体验",
    "downloadUrl": "https://example.com/download/v2.1.0",
    "releaseDate": "2024-01-20",
    "forceUpdate": false
  }
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 1001 | 用户不存在 |
| 1002 | 密码错误 |
| 1003 | 账号已被禁用 |
| 2001 | 文件上传失败 |
| 2002 | 文件格式不支持 |
| 2003 | 文件大小超限 |

## 注意事项

1. 所有接口都需要在请求头中携带认证token：`Authorization: Bearer {token}`
2. 请求和响应的Content-Type均为：`application/json`
3. 时间格式统一使用：`YYYY-MM-DD HH:mm:ss`
4. 分页参数：page从1开始，pageSize默认为20，最大100
5. 所有删除操作都是软删除，可以通过管理后台恢复
6. 文件上传大小限制：头像文件不超过2MB
7. API请求频率限制：每分钟最多100次请求