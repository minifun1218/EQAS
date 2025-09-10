# 初级英语考试API接口文档

## 概述

本文档描述初级英语考试相关的API接口，包括考试数据获取、答案提交、录音上传等功能。

## 接口列表

### 1. 获取初级考试数据

**接口地址：** `GET /api/exams/primary/data`

**请求方式：** GET

**请求参数：** 无

#### 返回格式

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "examData": {
      "examInfo": {
        "title": "初级英语考试",
        "duration": 2700,
        "totalSteps": 5,
        "description": "航空英语初级水平考试"
      },
      "listeningComprehension": {
        "title": "听力理解",
        "description": "航空相关对话、指令、信息",
        "duration": 1200,
        "questionCount": 15,
        "timePerQuestion": 15,
        "playCount": 1,
        "speechRate": "100-120词/分钟",
        "questions": [
          {
            "id": 1,
            "question": "根据对话内容，飞行员请求的是什么？",
            "audioUrl": "https://example.com/audio/listening_1.mp3",
            "audioDuration": 45,
            "options": [
              "请求起飞许可",
              "请求降落许可",
              "请求改变航向",
              "请求高度调整"
            ],
            "correctAnswer": 0,
            "difficulty": "easy",
            "category": "通信对话"
          },
          {
            "id": 2,
            "question": "管制员指示的跑道号是多少？",
            "audioUrl": "https://example.com/audio/listening_2.mp3",
            "audioDuration": 38,
            "options": [
              "跑道06",
              "跑道24",
              "跑道18",
              "跑道36"
            ],
            "correctAnswer": 1,
            "difficulty": "medium",
            "category": "指令理解"
          }
        ]
      },
      "storyRetelling": {
        "title": "故事复述",
        "description": "听取航空特情/事故短文并复述大意",
        "duration": 300,
        "playCount": 2,
        "story": {
          "id": 1,
          "title": "紧急迫降事件",
          "content": "2023年3月15日，一架从北京飞往上海的航班在飞行过程中遭遇严重气流...",
          "audioUrl": "https://example.com/audio/story_1.mp3",
          "audioDuration": 60,
          "wordCount": 115,
          "keyPoints": [
            "时间地点",
            "事件经过",
            "处理结果"
          ]
        }
      },
      "listeningQA": {
        "title": "听力简答",
        "description": "听两段对话并口头回答问题",
        "duration": 600,
        "dialogueCount": 2,
        "questions": [
          {
            "dialogueId": 1,
            "title": "塔台与飞行员对话",
            "audioUrl": "https://example.com/audio/dialogue_1.mp3",
            "audioDuration": 90,
            "playCount": 1,
            "questions": [
              "飞行员报告了什么问题？",
              "管制员给出了什么建议？",
              "最终采取了什么措施？"
            ]
          },
          {
            "dialogueId": 2,
            "title": "机组内部沟通",
            "audioUrl": "https://example.com/audio/dialogue_2.mp3",
            "audioDuration": 85,
            "playCount": 1,
            "questions": [
              "机长做出了什么决定？",
              "副驾驶提出了什么建议？",
              "乘务长报告了什么情况？"
            ]
          }
        ]
      },
      "simulatedCall": {
        "title": "模拟通话",
        "description": "模拟管制情景中的陆空通话",
        "duration": 1200,
        "totalRounds": 30,
        "responseTime": 17,
        "airport": {
          "name": "武汉天河国际机场",
          "icao": "ZHHH",
          "runways": ["04L/22R", "04R/22L"],
          "frequency": {
            "tower": "118.1",
            "ground": "121.6",
            "approach": "119.2"
          },
          "elevation": "113米",
          "coordinates": "30°47'N 114°12'E"
        },
        "scenario": {
          "id": 1,
          "title": "武汉天河机场塔台管制",
          "description": "作为塔台管制员，负责机场塔台区域内的航空器起降和地面滑行管制",
          "background": "当前天气：晴，能见度10公里，风向040度，风速8节，QNH 1013",
          "roleDescription": "您是武汉天河机场塔台管制员，负责与飞行员进行陆空通话，确保航班安全有序运行",
          "evaluationCriteria": [
            "通话用语的标准性和准确性",
            "指令的清晰度和完整性",
            "应急情况的处理能力",
            "专业术语的正确使用",
            "语音语调的专业性"
          ]
        },
        "rounds": [
          {
            "round": 1,
            "pilotMessage": {
              "audioUrl": "https://example.com/audio/communication/round_1_pilot.mp3",
              "transcript": "武汉塔台，国航1234，请求起飞许可，跑道04L",
              "callsign": "CCA1234",
              "aircraftType": "A320"
            },
            "expectedResponse": "国航1234，武汉塔台，跑道04L可以起飞，风向040度8节，联系离场119.2，再见",
            "scenario": "常规起飞许可"
          }
        ]
      },
      "oralInterview": {
        "title": "口语面试 (OPI)",
        "description": "航空专业相关的英语交谈",
        "duration": 600,
        "questions": [
          {
            "id": 1,
            "text": "请介绍一下您的航空工作经历和专业背景",
            "preparationTime": 30,
            "responseTime": 120,
            "category": "个人背景"
          },
          {
            "id": 2,
            "text": "描述一次您处理过的紧急情况，包括当时的情况和您的应对措施",
            "preparationTime": 60,
            "responseTime": 180,
            "category": "专业经验"
          },
          {
            "id": 3,
            "text": "您认为航空英语在日常工作中的重要性如何？请举例说明",
            "preparationTime": 45,
            "responseTime": 150,
            "category": "专业观点"
          }
        ]
      },
      "audioDuration": {
        "listening": 45,
        "story": 60,
        "dialogue1": 90,
        "dialogue2": 85
      }
    }
  }
}
```

#### 字段说明

**考试基本信息 (examInfo)**
| 字段 | 类型 | 说明 |
|------|------|------|
| title | string | 考试标题 |
| duration | number | 考试总时长(秒) |
| totalSteps | number | 考试步骤数 |
| description | string | 考试描述 |

**听力理解 (listeningComprehension)**
| 字段 | 类型 | 说明 |
|------|------|------|
| title | string | 模块标题 |
| description | string | 模块描述 |
| duration | number | 模块时长(秒) |
| questionCount | number | 题目数量(固定15题) |
| timePerQuestion | number | 每题作答时间(秒) |
| playCount | number | 音频播放次数(固定1次) |
| speechRate | string | 语速说明 |
| questions | array | 题目列表 |

**听力题目 (questions[i])**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 题目ID |
| question | string | 题目内容 |
| audioUrl | string | 音频文件URL |
| audioDuration | number | 音频时长(秒) |
| options | array | 选项列表(4个选项) |
| correctAnswer | number | 正确答案索引(0-3) |
| difficulty | string | 难度等级(easy/medium/hard) |
| category | string | 题目分类 |

### 2. 提交考试答案

**接口地址：** `POST /api/exams/primary/submit`

**请求方式：** POST

#### 请求参数

```json
{
  "examId": "exam_20241201_001",
  "userId": "user_123",
  "startTime": "2024-12-01 10:00:00",
  "endTime": "2024-12-01 10:45:00",
  "answers": {
    "listeningComprehension": [
      {
        "questionId": 1,
        "selectedAnswer": 0,
        "timeSpent": 12
      },
      {
        "questionId": 2,
        "selectedAnswer": 1,
        "timeSpent": 15
      }
    ],
    "storyRetelling": {
      "playCount": 2,
      "recordingUrl": "https://example.com/recordings/story_user123.mp3",
      "recordingDuration": 85
    },
    "listeningQA": [
      {
        "dialogueId": 1,
        "answers": [
          {
            "questionIndex": 0,
            "recordingUrl": "https://example.com/recordings/qa1_1_user123.mp3",
            "recordingDuration": 25
          }
        ]
      }
    ],
    "simulatedCall": {
      "completedRounds": 20,
      "recordings": [
        {
          "round": 1,
          "recordingUrl": "https://example.com/recordings/call_1_user123.mp3",
          "recordingDuration": 15
        }
      ]
    },
    "oralInterview": [
      {
        "questionId": 1,
        "recordingUrl": "https://example.com/recordings/interview_1_user123.mp3",
        "recordingDuration": 120
      }
    ]
  }
}
```

#### 返回格式

```json
{
  "code": 200,
  "message": "考试提交成功",
  "data": {
    "examId": "exam_20241201_001",
    "submitTime": "2024-12-01 10:45:30",
    "status": "submitted",
    "estimatedResultTime": "2024-12-01 12:00:00"
  }
}
```

### 3. 上传录音文件

**接口地址：** `POST /api/exams/upload/recording`

**请求方式：** POST (multipart/form-data)

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | file | 是 | 录音文件 |
| examType | string | 是 | 考试类型(primary/secondary) |
| moduleType | string | 是 | 模块类型(story/qa/call/interview) |
| questionId | string | 否 | 题目ID |
| userId | string | 是 | 用户ID |

#### 返回格式

```json
{
  "code": 200,
  "message": "录音上传成功",
  "data": {
    "fileUrl": "https://example.com/recordings/user123_story_20241201.mp3",
    "fileName": "user123_story_20241201.mp3",
    "fileSize": 1024000,
    "duration": 85,
    "uploadTime": "2024-12-01 10:30:15"
  }
}
```

## 业务规则

### 听力理解部分

1. **题目数量**：固定15道题目
2. **考试时间**：约20分钟
3. **语速控制**：每分钟100-120词
4. **题目形式**：多项选择题，四个选项选一
5. **播放次数**：每段对话仅播放一遍
6. **作答时间**：每题预留15秒作答时间
7. **浏览限制**：录音播放时只能浏览当前题目选项
8. **自动评分**：系统自动完成评分

### 故事复述部分

#### 考试要求
- 考试时间：约5分钟
- 录音材料：100-120词的航空相关短文
- 播放次数：2次，间隔5秒
- 准备时间：300秒（5分钟）
- 自动跳转：时间结束后自动进入下一题

#### 考试流程
1. **听取阶段**：播放故事录音（最多2次，间隔5秒）
2. **准备阶段**：300秒内完成故事复述录音
3. **完成阶段**：自动跳转到下一题

#### 接口说明

**获取故事音频**
- **接口地址**：`/api/exams/primary/story-audio`
- **请求方式**：GET
- **返回格式**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "audioUrl": "https://example.com/audio/story1.mp3",
    "duration": 60,
    "transcript": "故事文本内容...",
    "wordCount": 115
  }
}
```

**提交故事复述录音**
- **接口地址**：`/api/exams/primary/story-recording`
- **请求方式**：POST
- **请求参数**：
```json
{
  "examId": "exam_123",
  "audioFile": "base64编码的音频文件",
  "duration": 180,
  "recordingTime": "2024-01-01 10:30:00"
}
```

## 3. 听力简答部分

### 考试要求
- 考试时间：约5分钟
- 对话数量：2段对话
- 问题数量：每段对话3个问题，总共6道题
- 对话长度：每段100-120词
- 播放次数：每段对话仅播放一遍
- 作答时间：每题20秒，超时自动跳转
- 问题字数：每个问题限制在15词以内

### 考试流程
1. **播放对话**：播放第一段对话（仅一遍）
2. **依次答题**：回答该对话的3个问题（每题20秒）
3. **播放对话**：播放第二段对话（仅一遍）
4. **依次答题**：回答该对话的3个问题（每题20秒）
5. **完成跳转**：自动跳转到下一题

### 接口说明

#### 获取对话数据
- **接口地址**：`/api/exams/primary/dialogues`
- **请求方式**：GET
- **返回格式**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "dialogues": [
      {
        "id": 1,
        "audioUrl": "https://example.com/audio/dialogue1.mp3",
        "duration": 60,
        "wordCount": 115,
        "transcript": "对话文本内容...",
        "questions": [
          {
            "id": 1,
            "text": "What is the main topic?",
            "wordCount": 5
          },
          {
            "id": 2,
            "text": "When did the event happen?",
            "wordCount": 6
          },
          {
            "id": 3,
            "text": "What was the result?",
            "wordCount": 4
          }
        ]
      },
      {
        "id": 2,
        "audioUrl": "https://example.com/audio/dialogue2.mp3",
        "duration": 65,
        "wordCount": 108,
        "transcript": "对话文本内容...",
        "questions": [
          {
            "id": 4,
            "text": "Who are the speakers?",
            "wordCount": 4
          },
          {
            "id": 5,
            "text": "What is the problem?",
            "wordCount": 4
          },
          {
            "id": 6,
            "text": "How was it solved?",
            "wordCount": 4
          }
        ]
      }
    ]
  }
}
```

#### 提交问题答案录音
- **接口地址**：`/api/exams/primary/dialogue-answers`
- **请求方式**：POST
- **请求参数**：
```json
{
  "examId": "exam_123",
  "dialogueId": 1,
  "questionId": 1,
  "audioFile": "base64编码的音频文件",
  "duration": 15,
  "recordingTime": "2024-01-01 10:30:00",
  "answerText": "可选的答案文本"
}
```

## 4. 模拟通话部分

### 考试要求
- 考试时间：约20分钟
- 通话轮次：30个对话回合
- 场景原型：武汉天河机场 (ZHHH)
- 作答时间：每回合17秒，超时自动跳转
- 作答方式：口头录音回答
- 角色设置：飞行员（预录语音）、第三者/提示者（预录提示语）、管制员（考生实时作答）

### 场景描述
该题以武汉天河机场为原型构建虚拟机场作为考试场景。武汉天河机场（ICAO代码：ZHHH）是中国中部地区重要的航空枢纽，拥有两条平行跑道（04L/22R和04R/22L）。考试过程中，相关情景背景信息及模拟雷达屏幕画面均显示于考生系统屏幕上，为考生提供真实的管制工作环境。

### 考试流程
1. **场景介绍**：显示武汉天河机场背景信息和雷达屏幕
2. **开始通话**：系统播放飞行员发言或第三方提示语
3. **管制员回复**：考生以管制员身份在17秒内录音回复
4. **下一回合**：自动进入下一个对话回合
5. **完成跳转**：完成30个回合后自动跳转到下一题

### 评分标准
- 每发出1条指令计为1个回合
- 考生须完成30条指令才视为完成该题
- 评分考虑指令的准确性、专业性和时效性

### 接口说明

#### 获取模拟通话数据
- **接口地址**：`/api/exams/primary/simulated-call`
- **请求方式**：GET
- **返回格式**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "scenario": {
      "id": 1,
      "title": "武汉天河机场塔台管制",
      "description": "作为塔台管制员，负责机场塔台区域内的航空器起降和地面滑行管制",
      "background": "当前天气：晴，能见度10公里，风向040度，风速8节，QNH 1013",
      "roleDescription": "您是武汉天河机场塔台管制员，负责与飞行员进行陆空通话，确保航班安全有序运行",
      "airport": {
        "name": "武汉天河国际机场",
        "icao": "ZHHH",
        "elevation": "113米",
        "coordinates": "30°47'N 114°12'E",
        "runways": ["04L/22R", "04R/22L"],
        "frequency": {
          "tower": "118.1",
          "ground": "121.6",
          "approach": "119.2"
        }
      },
      "evaluationCriteria": [
        "通话用语的标准性和准确性",
        "指令的清晰度和完整性",
        "应急情况的处理能力",
        "专业术语的正确使用",
        "语音语调的专业性"
      ]
    },
    "rounds": [
      {
        "roundId": 1,
        "audioUrl": "https://example.com/audio/communication/round_1_pilot.mp3",
        "duration": 8,
        "transcript": "武汉塔台，国航1234，请求起飞许可，跑道04L",
        "responseTime": 17,
        "expectedResponse": "国航1234，武汉塔台，跑道04L可以起飞，风向040度8节，联系离场119.2，再见",
        "pilotCallsign": "CCA1234",
        "aircraftType": "A320",
        "scenario": "常规起飞许可"
      },
      {
        "roundId": 2,
        "audioUrl": "https://example.com/audio/communication/round_2_pilot.mp3",
        "duration": 9,
        "transcript": "武汉塔台，南航5678，请求滑行到跑道04R",
        "responseTime": 17,
        "expectedResponse": "南航5678，武汉塔台，滑行到跑道04R，经由滑行道A、B，注意前方有飞机",
        "pilotCallsign": "CSN5678",
        "aircraftType": "B737",
        "scenario": "地面滑行指令"
      }
    ],
    "totalRounds": 30,
    "totalDuration": 1200,
    "radarData": {
      "aircrafts": [
        {
          "callsign": "CCA1234",
          "altitude": 8000,
          "heading": 40,
          "speed": 250,
          "x": 120,
          "y": 80,
          "status": "approaching"
        },
        {
          "callsign": "CSN5678",
          "altitude": 6000,
          "heading": 220,
          "speed": 180,
          "x": 200,
          "y": 150,
          "status": "taxiing"
        }
      ]
    }
  }
}
```

#### 提交通话回复录音
- **接口地址**：`/api/exams/primary/call-response`
- **请求方式**：POST
- **请求参数**：
```json
{
  "examId": "exam_123",
  "roundId": 1,
  "audioFile": "base64编码的音频文件",
  "duration": 25,
  "recordingTime": "2024-01-01 10:30:00"
}
```

## 5. 口语面试部分

### 考试要求
- 考试时间：15-20分钟
- 话题数量：3-4个话题
- 问题数量：每个话题3-4个问题
- 作答时间：每题60秒，超时自动跳转
- 作答方式：口头录音回答

### 考试流程
1. **播放问题**：播放预录制的问题音频
2. **开始作答**：60秒内进行录音回答
3. **自动跳转**：时间到或手动跳转下一题
4. **话题切换**：完成当前话题所有问题后进入下一话题
5. **考试结束**：完成所有话题后自动提交

### 接口说明

#### 获取面试问题数据
- **接口地址**：`/api/exams/primary/interview-questions`
- **请求方式**：GET
- **返回格式**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "topics": [
      {
        "id": 1,
        "topic": "个人背景介绍",
        "description": "请介绍您的航空工作经历和专业背景",
        "questions": [
          {
            "id": "q1_1",
            "text": "请简单介绍一下您自己",
            "audioUrl": "https://example.com/audio/q1_1.mp3",
            "duration": 5,
            "responseTime": 60
          }
        ]
      }
    ],
    "totalTopics": 4,
    "questionsPerTopic": 4,
    "totalDuration": 1200
  }
}
```

#### 提交面试回答录音
- **接口地址**：`/api/exams/primary/interview-answer`
- **请求方式**：POST
- **请求参数**：
```json
{
  "examId": "exam_123",
  "topicId": 1,
  "questionId": "q1_1",
  "audioFile": "base64编码的音频文件",
  "duration": 45,
  "recordingTime": "2024-01-01 10:30:00"
}
```

## 6. 辅助接口

### 获取音频文件
- **接口地址**：`/api/exams/audio/{audioId}`
- **请求方式**：GET
- **返回格式**：音频文件流 (audio/mpeg)
- **说明**：用于获取考试中的音频文件，支持流式传输

### 获取考试状态
- **接口地址**：`/api/exams/primary/status/{examId}`
- **请求方式**：GET
- **返回格式**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "examId": "exam_123",
    "status": "in_progress",
    "currentStep": 3,
    "startTime": "2024-01-01 10:00:00",
    "remainingTime": 1800,
    "progress": {
      "listening": "completed",
      "story": "completed",
      "dialogue": "in_progress",
      "communication": "pending",
      "interview": "pending"
    }
  }
}
```

### 更新考试进度
- **接口地址**：`/api/exams/primary/progress`
- **请求方式**：POST
- **请求参数**：
```json
{
  "examId": "exam_123",
  "step": 3,
  "action": "step_completed",
  "timestamp": "2024-01-01 10:30:00",
  "data": {
    "timeSpent": 300,
    "questionsCompleted": 6
  }
}
```

### 获取雷达数据
- **接口地址**：`/api/exams/primary/radar-data`
- **请求方式**：GET
- **返回格式**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "aircrafts": [
      {
        "callsign": "CCA1234",
        "altitude": 8000,
        "heading": 40,
        "speed": 250,
        "x": 120,
        "y": 80,
        "status": "approaching",
        "aircraftType": "A320"
      }
    ],
    "updateTime": "2024-01-01 10:30:00"
  }
}
```

### 错误处理

所有接口在出现错误时返回统一格式：

```json
{
  "code": 400,
  "message": "错误描述",
  "data": null,
  "error": {
    "type": "validation_error",
    "details": "具体错误信息"
  }
}
```

常见错误码：
- 200: 成功
- 400: 请求参数错误
- 401: 未授权
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器内部错误

### 数据格式说明

1. **时间格式**：统一使用 `YYYY-MM-DD HH:mm:ss` 格式
2. **音频格式**：支持 MP3、WAV 格式，建议使用 MP3
3. **文件上传**：音频文件使用 base64 编码传输
4. **字符编码**：统一使用 UTF-8 编码
5. **数据大小限制**：单个音频文件不超过 10MB

### 音频文件要求

1. **格式**：MP3或WAV格式
2. **质量**：采样率不低于16kHz，比特率不低于128kbps
3. **时长**：单个音频文件不超过5分钟
4. **大小**：单个文件不超过10MB
5. **编码**：Base64编码传输

### 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 1001 | 考试数据加载失败 |
| 1002 | 音频文件不存在 |
| 1003 | 录音上传失败 |
| 1004 | 考试时间已过期 |
| 1005 | 答案提交失败 |

## 缓存策略

1. **考试数据**：缓存30分钟，减少重复请求
2. **音频文件**：CDN缓存24小时，提高加载速度
3. **用户答案**：本地存储，防止意外丢失

## 安全考虑

1. **身份验证**：所有接口需要有效的用户token
2. **权限控制**：只能访问自己的考试数据
3. **文件安全**：录音文件加密存储
4. **防作弊**：记录考试过程中的异常行为