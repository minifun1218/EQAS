# Study模块API接口文档

本文档记录了学习模块所有后台API接口的地址和期望返回格式。

## 1. 学习概览接口

### 接口地址
```
GET /api/study/overview
```

### 期望返回格式
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "progress": {
      "totalProgress": 75,
      "completedCourses": 8
    },
    "modules": [
      {
        "id": "exam-intro",
        "name": "考试介绍",
        "description": "了解ICAO4考试内容和要求",
        "status": "available"
      }
    ]
  }
}
```

## 2. 考试介绍数据接口

### 接口地址
```
GET /api/study/exam-intro
```

### 期望返回格式
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "video": {
      "url": "https://example.com/video.mp4",
      "poster": "https://example.com/poster.jpg",
      "title": "ICAO4考试介绍",
      "duration": "15:30"
    },
    "examContent": [
      {
        "id": 1,
        "title": "听力理解",
        "description": "测试对航空英语听力的理解能力",
        "icon": "🎧"
      }
    ],
    "scoringCriteria": [
      {
        "id": 1,
        "level": "Level 4",
        "description": "能够理解基本的航空通信内容",
        "requirements": ["词汇量达到1000+", "语法基础扎实"]
      }
    ],
    "studyTips": [
      {
        "id": 1,
        "title": "词汇积累",
        "content": "重点掌握航空专业术语和标准通话用语",
        "priority": "high"
      }
    ]
  }
}
```

## 3. 标准术语接口

### 接口地址
```
GET /api/study/terms
```

### 期望返回格式
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "terms": [
      {
        "id": 1,
        "chinese": "跑道",
        "english": "Runway",
        "phonetic": "/ˈrʌnweɪ/",
        "definition": "供飞机起飞和降落的跑道",
        "category": "airport",
        "difficulty": "basic",
        "isLearned": false,
        "isFavorite": false
      }
    ],
    "categories": [
      {
        "id": "airport",
        "name": "机场设施",
        "count": 25
      }
    ]
  }
}
```

## 4. 词汇列表接口

### 接口地址
```
GET /api/study/vocabulary
```

### 期望返回格式
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "vocabulary": [
      {
        "id": 1,
        "chinese": "飞行员",
        "english": "Pilot",
        "phonetic": "/ˈpaɪlət/",
        "definition": "驾驶飞机的人员",
        "topicId": "personnel",
        "difficulty": "basic",
        "isLearned": false,
        "isFavorite": false,
        "examples": [
          {
            "english": "The pilot is ready for takeoff.",
            "chinese": "飞行员准备起飞。"
          }
        ]
      }
    ],
    "topics": [
      {
        "id": "personnel",
        "name": "航空人员",
        "count": 30
      }
    ]
  }
}
```

## 5. 术语学习数据接口

### 接口地址
```
GET /api/study/terms/{studyId}
```

### 请求参数
- `studyId`: 学习ID（可选，用于特定学习内容）

### 期望返回格式
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "chinese": "塔台",
        "english": "Control Tower",
        "phonetic": "/kənˈtroʊl ˈtaʊər/",
        "definition": "机场的空中交通管制中心",
        "category": "airport",
        "difficulty": "intermediate",
        "isLearned": false,
        "isFavorite": false
      }
    ]
  }
}
```

## 6. 词汇学习数据接口

### 接口地址
```
GET /api/study/vocabulary/{studyId}
```

### 请求参数
- `studyId`: 学习ID（可选，用于特定学习内容）

### 期望返回格式
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "chinese": "航班",
        "english": "Flight",
        "phonetic": "/flaɪt/",
        "definition": "飞机的一次飞行行程",
        "topicId": "operations",
        "difficulty": "basic",
        "isLearned": false,
        "isFavorite": false,
        "examples": [
          {
            "english": "Flight CA123 is now boarding.",
            "chinese": "CA123航班现在开始登机。"
          }
        ]
      }
    ]
  }
}
```

## 通用响应格式说明

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误信息描述",
  "data": null
}
```

## 数据字段说明

### 难度等级 (difficulty)
- `basic`: 基础
- `intermediate`: 中级
- `advanced`: 高级

### 学习状态
- `isLearned`: 是否已学习
- `isFavorite`: 是否已收藏

### 分类/主题
- 术语使用 `category` 字段
- 词汇使用 `topicId` 字段

## 注意事项

1. 所有接口都需要在请求头中包含认证信息
2. 分页参数可通过查询参数传递：`?page=1&limit=20`
3. 搜索功能可通过查询参数实现：`?keyword=runway`
4. 所有时间字段使用ISO 8601格式
5. 图片和音频URL需要是完整的可访问地址