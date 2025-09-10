# 考试模块 API 接口文档

## 概述

本文档描述了考试模块的所有API接口，包括考试列表、考试配置、考试数据获取、答案提交、结果查询等功能。

## 基础信息

- **基础URL**: `/api/exams`
- **认证方式**: Bearer Token
- **数据格式**: JSON

## 接口列表

### 1. 获取考试列表

**接口地址**: `GET /api/exams/list`

**功能描述**: 获取用户可参加的考试列表

**请求参数**: 无

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "exam_001",
      "title": "英语能力评估测试",
      "type": "primary",
      "duration": 120,
      "description": "综合评估英语听说读写能力",
      "status": "available",
      "startTime": "2024-01-15T09:00:00Z",
      "endTime": "2024-01-15T11:00:00Z"
    }
  ]
}
```

### 2. 获取考试配置

**接口地址**: `GET /api/exams/config/{examType}`

**功能描述**: 获取指定类型考试的配置信息

**路径参数**:
- `examType`: 考试类型 (primary/secondary)

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "examType": "primary",
    "duration": 120,
    "modules": [
      {
        "name": "listening",
        "title": "听力理解",
        "duration": 30,
        "questionCount": 20
      },
      {
        "name": "reading",
        "title": "阅读理解",
        "duration": 45,
        "questionCount": 25
      },
      {
        "name": "writing",
        "title": "写作表达",
        "duration": 45,
        "questionCount": 2
      }
    ],
    "instructions": "请仔细阅读考试说明..."
  }
}
```

### 3. 获取初试考试数据

**接口地址**: `GET /api/exams/primary/data`

**功能描述**: 获取初试考试的题目和相关数据

**请求参数**: 无

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "examId": "primary_001",
    "modules": {
      "listening": {
        "questions": [
          {
            "id": "q1",
            "type": "single_choice",
            "audio": "/audio/listening_q1.mp3",
            "question": "What is the main topic?",
            "options": ["A", "B", "C", "D"]
          }
        ]
      },
      "reading": {
        "passages": [
          {
            "id": "p1",
            "title": "Climate Change",
            "content": "...",
            "questions": [
              {
                "id": "q1",
                "type": "single_choice",
                "question": "According to the passage...",
                "options": ["A", "B", "C", "D"]
              }
            ]
          }
        ]
      },
      "writing": {
        "tasks": [
          {
            "id": "w1",
            "type": "essay",
            "prompt": "Write an essay about...",
            "wordLimit": 300
          }
        ]
      }
    }
  }
}
```

### 4. 获取复试考试数据

**接口地址**: `GET /api/exams/secondary/data`

**功能描述**: 获取复试考试的题目和相关数据

**请求参数**: 无

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "examId": "secondary_001",
    "modules": {
      "simulation": {
        "scenarios": [
          {
            "id": "s1",
            "title": "商务会议",
            "description": "模拟商务会议场景",
            "duration": 300,
            "instructions": "请根据以下情况进行对话..."
          }
        ]
      },
      "interview": {
        "questions": [
          {
            "id": "i1",
            "category": "personal",
            "question": "请介绍一下你自己",
            "timeLimit": 120
          }
        ]
      }
    }
  }
}
```

### 5. 提交考试答案

**接口地址**: `POST /api/exams/{examType}/submit`

**功能描述**: 提交考试答案

**路径参数**:
- `examType`: 考试类型 (primary/secondary)

**请求体示例**:
```json
{
  "examId": "primary_001",
  "answers": {
    "listening": {
      "q1": "A",
      "q2": "B"
    },
    "reading": {
      "q1": "C",
      "q2": "D"
    },
    "writing": {
      "w1": "Essay content here..."
    }
  },
  "recordings": {
    "simulation": "/recordings/sim_001.wav",
    "interview": "/recordings/int_001.wav"
  }
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "答案提交成功",
  "data": {
    "submissionId": "sub_001",
    "examId": "primary_001",
    "submitTime": "2024-01-15T11:00:00Z",
    "status": "submitted"
  }
}
```

### 6. 获取考试结果

**接口地址**: `GET /api/exams/result/{examId}`

**功能描述**: 获取考试结果详情

**路径参数**:
- `examId`: 考试ID

**查询参数**:
- `examType`: 考试类型 (primary/secondary)

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "examId": "primary_001",
    "examType": "primary",
    "totalScore": 85,
    "examDate": "2024-01-15",
    "moduleScores": {
      "listening": {
        "score": 88,
        "maxScore": 100,
        "level": "良好",
        "feedback": "听力理解能力较强"
      },
      "reading": {
        "score": 82,
        "maxScore": 100,
        "level": "良好",
        "feedback": "阅读理解准确度有待提高"
      },
      "writing": {
        "score": 85,
        "maxScore": 100,
        "level": "良好",
        "feedback": "写作表达清晰，语法基本正确"
      }
    },
    "abilityAnalysis": {
      "strengths": ["听力理解", "词汇运用"],
      "improvements": ["语法准确性", "写作逻辑"]
    },
    "suggestions": [
      "加强语法练习",
      "多做阅读理解训练"
    ],
    "resources": [
      {
        "title": "语法强化训练",
        "type": "course",
        "url": "/courses/grammar"
      }
    ],
    "historyScores": [
      {
        "date": "2024-01-01",
        "score": 78
      },
      {
        "date": "2024-01-15",
        "score": 85
      }
    ]
  }
}
```

### 7. 上传录音文件

**接口地址**: `POST /api/exams/upload/recording`

**功能描述**: 上传考试录音文件

**请求参数**:
- `file`: 录音文件 (multipart/form-data)
- `examType`: 考试类型
- `moduleType`: 模块类型 (simulation/interview)

**响应示例**:
```json
{
  "code": 200,
  "message": "录音上传成功",
  "data": {
    "fileId": "rec_001",
    "filePath": "/recordings/rec_001.wav",
    "uploadTime": "2024-01-15T10:30:00Z"
  }
}
```

### 8. 获取历史考试记录

**接口地址**: `GET /api/exams/history`

**功能描述**: 获取用户的历史考试记录

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "records": [
      {
        "examId": "primary_001",
        "examType": "primary",
        "title": "英语能力评估测试",
        "score": 85,
        "level": "良好",
        "examDate": "2024-01-15",
        "status": "completed"
      }
    ]
  }
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 注意事项

1. 所有接口都需要在请求头中携带有效的认证token
2. 录音文件格式支持: WAV, MP3, M4A
3. 录音文件大小限制: 最大50MB
4. 考试时间限制严格，超时将自动提交
5. 答案提交后不可修改
6. 考试结果将在提交后24小时内生成