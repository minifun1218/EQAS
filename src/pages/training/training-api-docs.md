# Training 模块 API 接口文档

本文档记录了训练模块中所有页面使用的后台API接口地址和期望返回的数据格式。

## 1. 训练首页 (index.vue)

### 1.1 获取训练模块列表
- **接口地址**: `GET /api/training/modules`
- **描述**: 获取所有可用的训练模块信息
- **请求参数**: 无
- **返回数据格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "modules": [
      {
        "id": 1,
        "name": "听力理解训练",
        "description": "提升英语听力理解能力",
        "icon": "/static/icons/listening.png",
        "route": "/pages/training/listening-comprehension",
        "difficulty": "中级",
        "duration": "30分钟",
        "completed": false
      }
    ]
  }
}
```

## 2. 听力理解训练 (listening-comprehension.vue)

### 2.1 获取听力理解题目
- **接口地址**: `GET /api/training/listening-comprehension/questions`
- **描述**: 获取听力理解训练的题目列表
- **请求参数**: 无
- **返回数据格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "questions": [
      {
        "id": 1,
        "audioUrl": "/static/audio/listening1.mp3",
        "duration": 120,
        "question": "What is the main topic of the conversation?",
        "options": [
          "Flight safety procedures",
          "Weather conditions",
          "Airport operations",
          "Passenger services"
        ],
        "correctAnswer": 0
      }
    ]
  }
}
```

### 2.2 提交听力理解答案
- **接口地址**: `POST /api/training/listening-comprehension/submit`
- **描述**: 提交单题答案并获取评分
- **请求参数**:
```json
{
  "questionId": 1,
  "selectedAnswer": 0,
  "timeSpent": 45
}
```
- **返回数据格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "correct": true,
    "score": 10,
    "explanation": "正确答案解析..."
  }
}
```

### 2.3 提交训练结果
- **接口地址**: `POST /api/training/listening-comprehension/result`
- **描述**: 提交整个训练的结果
- **请求参数**:
```json
{
  "totalScore": 85,
  "correctAnswers": 17,
  "totalQuestions": 20,
  "timeSpent": 1800
}
```
- **返回数据格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "saved": true
  }
}
```

## 3. 口语面试训练 (oral-interview.vue)

### 3.1 获取面试场景
- **接口地址**: `GET /api/training/oral-interview/scenarios`
- **描述**: 获取口语面试的场景列表
- **请求参数**: 无
- **返回数据格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "scenarios": [
      {
        "id": 1,
        "name": "紧急情况处理",
        "description": "模拟处理飞行中的紧急情况",
        "difficulty": "高级",
        "estimatedTime": "15分钟"
      }
    ]
  }
}
```

### 3.2 获取训练题目
- **接口地址**: `GET /api/training/oral-interview/questions`
- **描述**: 根据场景获取面试题目
- **请求参数**: `?scenarioId=1`
- **返回数据格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "questions": [
      {
        "id": 1,
        "question": "请描述在遇到发动机故障时的处理程序",
        "timeLimit": 120,
        "tips": "请按照标准操作程序回答"
      }
    ]
  }
}
```

### 3.3 提交面试答案
- **接口地址**: `POST /api/training/oral-interview/submit`
- **描述**: 提交录音答案并获取评分
- **请求参数**:
```json
{
  "questionId": 1,
  "audioData": "base64_encoded_audio",
  "duration": 95
}
```
- **返回数据格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "fluency": 8.5,
    "accuracy": 7.8,
    "completeness": 9.0,
    "totalScore": 25.3,
    "feedback": "回答流利，内容完整..."
  }
}
```

## 4. 简单听力训练 (simple-listening.vue)

### 4.1 获取听力练习
- **接口地址**: `GET /api/training/simple-listening/exercises`
- **描述**: 获取简单听力练习题目
- **请求参数**: 无
- **返回数据格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "exercises": [
      {
        "id": 1,
        "type": "fill-blank",
        "audioUrl": "/static/audio/simple1.mp3",
        "transcript": "The flight will depart at _____ from gate _____",
        "blanks": ["3:30 PM", "B12"],
        "options": [
          ["3:30 PM", "4:30 PM", "5:30 PM"],
          ["A10", "B12", "C15"]
        ]
      }
    ]
  }
}
```

### 4.2 提交练习答案
- **接口地址**: `POST /api/training/simple-listening/submit`
- **描述**: 提交练习答案
- **请求参数**:
```json
{
  "exerciseId": 1,
  "answers": ["3:30 PM", "B12"],
  "timeSpent": 30
}
```
- **返回数据格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "correct": true,
    "score": 10,
    "correctAnswers": ["3:30 PM", "B12"]
  }
}
```

## 5. 模拟通话训练 (simulated-call.vue)

### 5.1 获取通话场景
- **接口地址**: `GET /api/training/simulated-call/scenarios`
- **描述**: 获取模拟通话的场景列表
- **请求参数**: 无
- **返回数据格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "scenarios": [
      {
        "id": 1,
        "title": "紧急情况处理",
        "description": "模拟处理飞行紧急情况的通话",
        "difficulty": "高级",
        "steps": [
          {
            "id": 1,
            "instruction": "报告发动机故障情况",
            "responseType": "choice",
            "options": [
              "Mayday, Mayday, engine failure",
              "Pan Pan, engine problem",
              "Request priority landing"
            ]
          }
        ]
      }
    ]
  }
}
```

### 5.2 提交通话响应
- **接口地址**: `POST /api/training/simulated-call/submit`
- **描述**: 提交通话响应并获取评分
- **请求参数**:
```json
{
  "scenarioId": 1,
  "stepId": 1,
  "response": "Mayday, Mayday, engine failure",
  "responseTime": 5.2
}
```
- **返回数据格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "accuracy": 9.5,
    "fluency": 8.8,
    "score": 18.3,
    "feedback": "响应准确，用词恰当"
  }
}
```

## 6. 故事复述训练 (story-retelling.vue)

### 6.1 获取故事列表
- **接口地址**: `GET /api/training/story-retelling/stories`
- **描述**: 获取故事复述训练的故事列表
- **请求参数**: 无
- **返回数据格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "stories": [
      {
        "id": 1,
        "title": "紧急迫降程序",
        "difficulty": "中级",
        "audioUrl": "/static/audio/story1.mp3",
        "suggestedDuration": 90,
        "content": "昨天下午，一架从北京飞往上海的航班..."
      }
    ]
  }
}
```

### 6.2 提交复述结果
- **接口地址**: `POST /api/training/story-retelling/submit`
- **描述**: 提交故事复述录音并获取评分
- **请求参数**:
```json
{
  "storyId": 1,
  "recordingData": "base64_audio_data",
  "recordingDuration": 85
}
```
- **返回数据格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "fluency": 8.5,
    "accuracy": 7.8,
    "completeness": 9.0,
    "totalScore": 25.3,
    "feedback": "复述流利，内容完整度高..."
  }
}
```

## 通用错误响应格式

所有接口在出现错误时，都会返回以下格式的响应：

```json
{
  "code": 400,
  "message": "错误描述",
  "data": null
}
```

常见错误码：
- `400`: 请求参数错误
- `401`: 未授权访问
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

## 注意事项

1. 所有接口都需要在请求头中携带认证信息
2. 音频数据建议使用Base64编码传输
3. 时间相关字段统一使用秒为单位
4. 分数字段支持小数点后一位
5. 所有接口都支持CORS跨域请求