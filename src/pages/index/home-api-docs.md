# 首页模块 API 接口文档

## 概述

本文档描述了首页模块所需的后台API接口，包括学习统计数据和轮播图数据的获取。

## 接口列表

### 1. 获取首页学习统计数据

**接口地址：** `GET /api/home/study-stats`

**请求方式：** GET

**请求头：**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**请求参数：** 无

**返回数据格式：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "studyDays": 15,
    "studyHours": "25h",
    "completedExams": 3,
    "averageScore": "85分"
  }
}
```

**字段说明：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| studyDays | number | 累计学习天数 |
| studyHours | string | 累计学习时长，格式："数字h" |
| completedExams | number | 完成考试次数 |
| averageScore | string | 平均分数，格式："数字分" |

**错误响应：**
```json
{
  "code": 500,
  "message": "服务器内部错误",
  "data": null
}
```

---

### 2. 获取首页轮播图数据

**接口地址：** `GET /api/home/banners`

**请求方式：** GET

**请求头：**
```
Content-Type: application/json
```

**请求参数：** 无

**返回数据格式：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "banners": [
      {
        "id": 1,
        "title": "ICAO4英语考试系统",
        "subtitle": "专业的航空英语学习与考试平台",
        "tips": "全面提升航空英语水平，助力职业发展",
        "image": "https://example.com/images/banner1.jpg",
        "link": "/pages/study/index",
        "sort": 1,
        "status": 1
      },
      {
        "id": 2,
        "title": "智能学习系统",
        "subtitle": "个性化学习路径规划",
        "tips": "根据学习进度智能推荐学习内容",
        "image": "https://example.com/images/banner2.jpg",
        "link": "/pages/training/simulated-call",
        "sort": 2,
        "status": 1
      },
      {
        "id": 3,
        "title": "专业考试训练",
        "subtitle": "真实考试环境模拟",
        "tips": "听力、口语、阅读全方位训练",
        "image": "https://example.com/images/banner3.jpg",
        "link": "/pages/exams/index",
        "sort": 3,
        "status": 1
      }
    ]
  }
}
```

**字段说明：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | number | 轮播图唯一标识 |
| title | string | 轮播图主标题 |
| subtitle | string | 轮播图副标题 |
| tips | string | 提示文字 |
| image | string | 图片URL地址 |
| link | string | 点击跳转链接（可选，支持tabBar页面和普通页面） |
| sort | number | 排序权重，数字越小越靠前 |
| status | number | 状态：1-启用，0-禁用 |

**错误响应：**
```json
{
  "code": 500,
  "message": "服务器内部错误",
  "data": null
}
```

---

## 数据库表结构建议

### 1. 用户学习统计表 (user_study_stats)

该表用于存储用户的学习统计数据，与数据库设计文档中的表结构保持一致。

### 2. 系统轮播图表 (system_banners)

```sql
CREATE TABLE system_banners (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL COMMENT '主标题',
    subtitle VARCHAR(200) COMMENT '副标题',
    tips VARCHAR(300) COMMENT '提示文字',
    image_url VARCHAR(500) NOT NULL COMMENT '图片URL',
    link_url VARCHAR(500) COMMENT '跳转链接',
    sort_order INT DEFAULT 0 COMMENT '排序权重',
    status TINYINT DEFAULT 1 COMMENT '状态 1-启用 0-禁用',
    start_time TIMESTAMP COMMENT '开始显示时间',
    end_time TIMESTAMP COMMENT '结束显示时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 业务逻辑说明

### 学习统计数据计算

1. **学习天数 (studyDays)**：统计用户有学习记录的天数
2. **学习时长 (studyHours)**：累计所有学习活动的时长
3. **完成考试 (completedExams)**：统计状态为"已完成"的考试次数
4. **平均分数 (averageScore)**：计算所有已完成考试的平均分数

### 轮播图显示规则

1. 只显示状态为启用(status=1)的轮播图
2. 按照sort_order字段升序排列
3. 如果设置了时间范围，只显示在有效时间内的轮播图
4. 建议最多显示3-5张轮播图，避免影响用户体验
5. 点击跳转逻辑：
   - 如果link为tabBar页面（/pages/index/index, /pages/study/index, /pages/training/index, /pages/exams/index, /pages/user/index），使用uni.switchTab跳转
   - 其他页面使用uni.navigateTo跳转
   - 如果link为空，则不响应点击事件

## 缓存策略建议

### 学习统计数据
- 缓存时间：5分钟
- 缓存键：`home:stats:user:{userId}`
- 更新时机：用户完成学习活动时清除缓存

### 轮播图数据
- 缓存时间：30分钟
- 缓存键：`home:banners`
- 更新时机：管理员修改轮播图配置时清除缓存

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 401 | 未授权，需要登录 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 注意事项

1. 学习统计数据需要用户登录后才能获取，需要在请求头中携带有效的token
2. 轮播图数据为公开数据，无需登录即可获取
3. 图片URL建议使用CDN地址，提高加载速度
4. 前端需要处理网络异常情况，提供默认数据保证页面正常显示
5. 建议实现数据预加载和缓存机制，提升用户体验