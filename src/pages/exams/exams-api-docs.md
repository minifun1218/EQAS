# 考试模块 API 接口文档

## 概述
本文档记录了考试模块所有后台API接口的地址、请求方式、参数和期望返回的数据格式。

## 接口列表

### 1. 获取考试列表
**接口地址：** `GET /api/exams/list`

**请求参数：** 无

**返回数据格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "exams": [
      {
        "id": "exam_001",
        "title": "英语口语能力评估",
        "subtitle": "全面评估您的英语口语水平",
        "type": "primary",
        "duration": 45,
        "difficulty": "中级",
        "status": "available",
        "description": "通过多种题型全面评估口语能力",
        "modules": ["听力理解", "故事复述", "听力简答", "模拟通话", "口语面试"]
      }
    ]
  }
}
```

### 2. 获取考试配置
**接口地址：** `GET /api/exams/config/{examType}`

**请求参数：**
- `examType`: 考试类型 (primary/secondary)

**返回数据格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "examConfig": {
      "difficultyOptions": [
        { "text": "初级", "value": "beginner" },
        { "text": "中级", "value": "intermediate" },
        { "text": "高级", "value": "advanced" }
      ],
      "durationOptions": [
        { "text": "30分钟", "value": 30 },
        { "text": "45分钟", "value": 45 },
        { "text": "60分钟", "value": 60 }
      ],
      "defaultDifficulty": "intermediate",
      "defaultDuration": 45
    }
  }
}
```

### 3. 获取初试考试数据
**接口地址：** `GET /api/exams/primary/data`

**请求参数：** 无

**返回数据格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "examData": {
      "listeningComprehension": {
        "title": "听力理解",
        "duration": 10,
        "questions": [
          {
            "id": "lc_001",
            "audioUrl": "/audio/listening/lc_001.mp3",
            "question": "What is the main topic of the conversation?",
            "options": ["A. Travel plans", "B. Work schedule", "C. Weather forecast"],
            "correctAnswer": "A"
          }
        ]
      },
      "storyRetelling": {
        "title": "故事复述",
        "duration": 8,
        "story": {
          "title": "The Lost Key",
          "content": "Yesterday morning, Sarah was rushing to work...",
          "audioUrl": "/audio/stories/lost_key.mp3"
        }
      },
      "listeningQA": {
        "title": "听力简答",
        "duration": 7,
        "questions": [
          {
            "id": "qa_001",
            "audioUrl": "/audio/qa/qa_001.mp3",
            "question": "What time does the library close on weekends?"
          }
        ]
      },
      "simulatedCall": {
        "title": "模拟通话",
        "duration": 10,
        "scenario": {
          "title": "预订餐厅",
          "description": "您需要为今晚预订一家餐厅",
          "context": "您想为4个人预订今晚7点的餐桌",
          "prompts": ["询问是否有空桌", "确认预订时间", "询问特殊要求"]
        }
      },
      "oralInterview": {
        "title": "口语面试",
        "duration": 10,
        "questions": [
          {
            "id": "oi_001",
            "question": "Please describe your favorite hobby and explain why you enjoy it.",
            "preparationTime": 30,
            "responseTime": 120
          }
        ]
      }
    }
  }
}
```

### 4. 获取复试考试数据
**接口地址：** `GET /api/exams/secondary/data`

**请求参数：** 无

**返回数据格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "examData": {
      "simulatedCall": {
        "title": "模拟通话",
        "duration": 15,
        "scenario": {
          "title": "商务会议安排",
          "description": "您需要与客户安排一次重要的商务会议",
          "context": "讨论新项目合作事宜",
          "prompts": ["确认会议时间", "讨论会议议程", "确认参会人员"]
        }
      },
      "oralInterview": {
        "title": "口语面试",
        "duration": 20,
        "questions": [
          {
            "id": "oi_sec_001",
            "question": "Discuss the impact of technology on modern communication.",
            "preparationTime": 60,
            "responseTime": 180
          }
        ]
      }
    }
  }
}
```

### 5. 提交考试答案
**接口地址：** `POST /api/exams/{examType}/submit`

**请求参数：**
- `examType`: 考试类型 (primary/secondary)

**请求体：**
```json
{
  "answers": {
    "listeningComprehension": [
      {
        "questionId": "lc_001",
        "answer": "A",
        "timeSpent": 45
      }
    ],
    "storyRetelling": {
      "recordingUrl": "/recordings/story_retelling_001.wav",
      "duration": 120
    },
    "listeningQA": [
      {
        "questionId": "qa_001",
        "recordingUrl": "/recordings/qa_001.wav",
        "duration": 30
      }
    ],
    "simulatedCall": {
      "recordingUrl": "/recordings/simulated_call_001.wav",
      "duration": 300
    },
    "oralInterview": [
      {
        "questionId": "oi_001",
        "recordingUrl": "/recordings/oral_interview_001.wav",
        "duration": 120
      }
    ]
  },
  "examStartTime": "2024-01-15T10:00:00Z",
  "examEndTime": "2024-01-15T10:45:00Z"
}
```

**返回数据格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "examId": "exam_result_001",
    "status": "submitted",
    "message": "考试答案提交成功，正在评分中"
  }
}
```

### 6. 获取考试结果
**接口地址：** `GET /api/exams/result/{examId}`

**请求参数：**
- `examId`: 考试结果ID
- `examType`: 考试类型 (query parameter)

**返回数据格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "examResult": {
      "examLevel": "primary",
      "totalScore": 85,
      "examDate": "2024-01-15",
      "moduleScores": {
        "listeningComprehension": { "score": 88, "maxScore": 100 },
        "storyRetelling": { "score": 82, "maxScore": 100 },
        "listeningQA": { "score": 85, "maxScore": 100 },
        "simulatedCall": { "score": 87, "maxScore": 100 },
        "oralInterview": { "score": 83, "maxScore": 100 }
      },
      "abilityAnalysis": {
        "pronunciation": 85,
        "fluency": 82,
        "vocabulary": 88,
        "grammar": 84,
        "comprehension": 87
      },
      "strengths": [
        "词汇量丰富，能够准确使用各种词汇",
        "语音清晰，发音准确度较高"
      ],
      "improvements": [
        "建议加强语法结构的练习",
        "提高口语流利度，减少停顿"
      ],
      "resources": [
        {
          "title": "英语语法强化训练",
          "type": "course",
          "url": "/courses/grammar-intensive"
        },
        {
          "title": "口语流利度提升",
          "type": "practice",
          "url": "/practice/fluency-boost"
        }
      ],
      "historyScores": [
        { "date": "2024-01-01", "score": 78 },
        { "date": "2024-01-08", "score": 82 },
        { "date": "2024-01-15", "score": 85 }
      ]
    }
  }
}
```

### 7. 上传录音文件
**接口地址：** `POST /api/exams/upload/recording`

**请求参数：**
```json
{
  "file": "(录音文件二进制数据)",
  "examType": "primary",
  "moduleType": "storyRetelling"
}
```

**返回数据格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "recordingUrl": "/recordings/story_retelling_001.wav",
    "fileId": "recording_001",
    "uploadTime": "2024-01-15T10:30:00Z"
  }
}
```

### 8. 获取历史考试记录
**接口地址：** `GET /api/exams/history`

**请求参数：**
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)

**返回数据格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "examHistory": [
      {
        "examId": "exam_001",
        "examType": "primary",
        "examDate": "2024-01-15",
        "totalScore": 85,
        "status": "completed",
        "duration": 45
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 48,
      "limit": 10
    }
  }
}
```

## 错误响应格式
所有接口在出现错误时，都会返回以下格式的响应：

```json
{
  "code": 400,
  "message": "错误描述信息",
  "data": null
}
```

## 状态码说明
- `200`: 请求成功
- `400`: 请求参数错误
- `401`: 未授权访问
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

## 注意事项
1. 所有接口都需要在请求头中包含有效的认证token
2. 录音文件上传支持WAV、MP3格式，文件大小不超过50MB
3. 考试答案提交后不可修改
4. 考试结果会在提交后5-10分钟内生成
5. 所有时间格式均为ISO 8601标准格式