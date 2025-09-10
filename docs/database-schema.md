# EQAS 后端数据库表结构设计

## 1. 用户管理模块

### 1.1 用户表 (users)
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    email VARCHAR(100) UNIQUE NOT NULL COMMENT '邮箱',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    phone VARCHAR(20) COMMENT '手机号',
    avatar_url VARCHAR(500) COMMENT '头像URL',
    real_name VARCHAR(50) COMMENT '真实姓名',
    gender TINYINT COMMENT '性别 1-男 2-女',
    birth_date DATE COMMENT '出生日期',
    profession VARCHAR(100) COMMENT '职业',
    company VARCHAR(200) COMMENT '公司/机构',
    status TINYINT DEFAULT 1 COMMENT '状态 1-正常 2-禁用',
    last_login_at TIMESTAMP COMMENT '最后登录时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 1.2 用户设置表 (user_settings)
```sql
CREATE TABLE user_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    daily_goal INT DEFAULT 30 COMMENT '每日学习目标(分钟)',
    study_reminder BOOLEAN DEFAULT TRUE COMMENT '学习提醒开关',
    reminder_time TIME DEFAULT '20:00:00' COMMENT '提醒时间',
    auto_save BOOLEAN DEFAULT TRUE COMMENT '自动保存进度',
    theme VARCHAR(20) DEFAULT 'light' COMMENT '主题设置',
    language VARCHAR(10) DEFAULT 'zh-CN' COMMENT '语言设置',
    notification_enabled BOOLEAN DEFAULT TRUE COMMENT '通知开关',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 1.3 用户学习统计表 (user_study_stats)
```sql
CREATE TABLE user_study_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    total_study_time INT DEFAULT 0 COMMENT '总学习时长(分钟)',
    study_days INT DEFAULT 0 COMMENT '学习天数',
    completed_courses INT DEFAULT 0 COMMENT '完成课程数',
    total_progress DECIMAL(5,2) DEFAULT 0.00 COMMENT '总体进度百分比',
    average_score DECIMAL(5,2) DEFAULT 0.00 COMMENT '平均分数',
    current_streak INT DEFAULT 0 COMMENT '当前连续学习天数',
    max_streak INT DEFAULT 0 COMMENT '最大连续学习天数',
    last_study_date DATE COMMENT '最后学习日期',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 2. 学习模块

### 2.1 课程表 (courses)
```sql
CREATE TABLE courses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '课程名称',
    description TEXT COMMENT '课程描述',
    type VARCHAR(50) NOT NULL COMMENT '课程类型 exam-intro/standard-terms/vocabulary',
    level VARCHAR(20) COMMENT '难度等级',
    icon VARCHAR(50) COMMENT '图标',
    color VARCHAR(20) COMMENT '主题色',
    estimated_time INT COMMENT '预计学习时长(分钟)',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态 1-启用 2-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2.2 课程章节表 (course_chapters)
```sql
CREATE TABLE course_chapters (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL COMMENT '章节标题',
    content LONGTEXT COMMENT '章节内容',
    video_url VARCHAR(500) COMMENT '视频URL',
    audio_url VARCHAR(500) COMMENT '音频URL',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

### 2.3 词汇表 (vocabulary)
```sql
CREATE TABLE vocabulary (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    word VARCHAR(100) NOT NULL COMMENT '单词',
    pronunciation VARCHAR(200) COMMENT '音标',
    definition TEXT COMMENT '定义',
    chinese_meaning VARCHAR(500) COMMENT '中文释义',
    example_sentence TEXT COMMENT '例句',
    audio_url VARCHAR(500) COMMENT '发音音频URL',
    category VARCHAR(50) COMMENT '分类',
    difficulty_level TINYINT COMMENT '难度等级 1-5',
    frequency_rank INT COMMENT '词频排名',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2.4 用户课程进度表 (user_course_progress)
```sql
CREATE TABLE user_course_progress (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    completed_chapters INT DEFAULT 0 COMMENT '完成章节数',
    total_chapters INT DEFAULT 0 COMMENT '总章节数',
    progress DECIMAL(5,2) DEFAULT 0.00 COMMENT '进度百分比',
    study_time INT DEFAULT 0 COMMENT '学习时长(分钟)',
    last_study_at TIMESTAMP COMMENT '最后学习时间',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_course (user_id, course_id)
);
```

## 3. 训练模块

### 3.1 训练场景表 (training_scenarios)
```sql
CREATE TABLE training_scenarios (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '场景名称',
    description TEXT COMMENT '场景描述',
    type VARCHAR(50) NOT NULL COMMENT '训练类型 simulated-call/story-retelling',
    level VARCHAR(20) COMMENT '难度等级',
    icon VARCHAR(50) COMMENT '图标',
    user_role VARCHAR(50) COMMENT '用户角色',
    partner_role VARCHAR(50) COMMENT '对话伙伴角色',
    estimated_time INT COMMENT '预计训练时长(分钟)',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3.2 训练步骤表 (training_steps)
```sql
CREATE TABLE training_steps (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    scenario_id BIGINT NOT NULL,
    step_order INT NOT NULL COMMENT '步骤顺序',
    instruction TEXT NOT NULL COMMENT '指令说明',
    system_message TEXT COMMENT '系统消息',
    response_type VARCHAR(20) NOT NULL COMMENT '回答类型 choice/input/record',
    placeholder VARCHAR(200) COMMENT '输入提示',
    hint TEXT COMMENT '提示信息',
    max_score INT DEFAULT 10 COMMENT '最高分数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (scenario_id) REFERENCES training_scenarios(id) ON DELETE CASCADE
);
```

### 3.3 训练选择题表 (training_choices)
```sql
CREATE TABLE training_choices (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    step_id BIGINT NOT NULL,
    choice_text TEXT NOT NULL COMMENT '选项文本',
    score INT DEFAULT 0 COMMENT '得分',
    is_correct BOOLEAN DEFAULT FALSE COMMENT '是否正确答案',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (step_id) REFERENCES training_steps(id) ON DELETE CASCADE
);
```

### 3.4 用户训练记录表 (user_training_records)
```sql
CREATE TABLE user_training_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    scenario_id BIGINT NOT NULL,
    total_score INT DEFAULT 0 COMMENT '总分',
    max_score INT DEFAULT 0 COMMENT '满分',
    accuracy_rate DECIMAL(5,2) DEFAULT 0.00 COMMENT '准确率',
    fluency_score DECIMAL(5,2) DEFAULT 0.00 COMMENT '流利度分数',
    completion_time INT COMMENT '完成时长(秒)',
    status VARCHAR(20) DEFAULT 'completed' COMMENT '状态',
    feedback JSON COMMENT '反馈信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (scenario_id) REFERENCES training_scenarios(id) ON DELETE CASCADE
);
```

### 3.5 用户训练步骤记录表 (user_training_step_records)
```sql
CREATE TABLE user_training_step_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    training_record_id BIGINT NOT NULL,
    step_id BIGINT NOT NULL,
    user_response TEXT COMMENT '用户回答',
    selected_choice_id BIGINT COMMENT '选择的选项ID',
    audio_url VARCHAR(500) COMMENT '录音文件URL',
    score INT DEFAULT 0 COMMENT '得分',
    feedback JSON COMMENT '步骤反馈',
    response_time INT COMMENT '回答时长(秒)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (training_record_id) REFERENCES user_training_records(id) ON DELETE CASCADE,
    FOREIGN KEY (step_id) REFERENCES training_steps(id) ON DELETE CASCADE,
    FOREIGN KEY (selected_choice_id) REFERENCES training_choices(id) ON DELETE SET NULL
);
```

## 4. 考试模块

### 4.1 考试表 (exams)
```sql
CREATE TABLE exams (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL COMMENT '考试标题',
    description TEXT COMMENT '考试描述',
    type VARCHAR(50) NOT NULL COMMENT '考试类型 primary/secondary',
    duration INT NOT NULL COMMENT '考试时长(分钟)',
    question_count INT COMMENT '题目数量',
    difficulty VARCHAR(20) COMMENT '难度等级',
    passing_score INT DEFAULT 60 COMMENT '及格分数',
    max_attempts INT DEFAULT 3 COMMENT '最大尝试次数',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 4.2 考试题目表 (exam_questions)
```sql
CREATE TABLE exam_questions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    exam_id BIGINT NOT NULL,
    question_type VARCHAR(20) NOT NULL COMMENT '题目类型 choice/listening/speaking',
    question_text TEXT NOT NULL COMMENT '题目内容',
    audio_url VARCHAR(500) COMMENT '音频URL',
    image_url VARCHAR(500) COMMENT '图片URL',
    correct_answer TEXT COMMENT '正确答案',
    score INT DEFAULT 1 COMMENT '分值',
    difficulty TINYINT DEFAULT 1 COMMENT '难度 1-5',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);
```

### 4.3 考试选项表 (exam_question_options)
```sql
CREATE TABLE exam_question_options (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    question_id BIGINT NOT NULL,
    option_text TEXT NOT NULL COMMENT '选项内容',
    option_key VARCHAR(10) NOT NULL COMMENT '选项标识 A/B/C/D',
    is_correct BOOLEAN DEFAULT FALSE COMMENT '是否正确答案',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES exam_questions(id) ON DELETE CASCADE
);
```

### 4.4 用户考试记录表 (user_exam_records)
```sql
CREATE TABLE user_exam_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    exam_id BIGINT NOT NULL,
    attempt_number INT DEFAULT 1 COMMENT '尝试次数',
    total_score INT DEFAULT 0 COMMENT '总分',
    max_score INT DEFAULT 0 COMMENT '满分',
    percentage DECIMAL(5,2) DEFAULT 0.00 COMMENT '得分率',
    is_passed BOOLEAN DEFAULT FALSE COMMENT '是否通过',
    start_time TIMESTAMP COMMENT '开始时间',
    end_time TIMESTAMP COMMENT '结束时间',
    duration INT COMMENT '实际用时(分钟)',
    status VARCHAR(20) DEFAULT 'completed' COMMENT '状态 in_progress/completed/timeout',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);
```

### 4.5 用户考试答题记录表 (user_exam_answers)
```sql
CREATE TABLE user_exam_answers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    exam_record_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    user_answer TEXT COMMENT '用户答案',
    selected_option_id BIGINT COMMENT '选择的选项ID',
    audio_url VARCHAR(500) COMMENT '录音答案URL',
    is_correct BOOLEAN DEFAULT FALSE COMMENT '是否正确',
    score INT DEFAULT 0 COMMENT '得分',
    answer_time INT COMMENT '答题时长(秒)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_record_id) REFERENCES user_exam_records(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES exam_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (selected_option_id) REFERENCES exam_question_options(id) ON DELETE SET NULL
);
```

## 5. 错题本模块

### 5.1 错题记录表 (mistake_records)
```sql
CREATE TABLE mistake_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    source_type VARCHAR(20) NOT NULL COMMENT '来源类型 exam/training',
    source_id BIGINT NOT NULL COMMENT '来源ID',
    question_id BIGINT COMMENT '题目ID',
    question_text TEXT NOT NULL COMMENT '题目内容',
    correct_answer TEXT NOT NULL COMMENT '正确答案',
    user_answer TEXT NOT NULL COMMENT '用户错误答案',
    mistake_type VARCHAR(50) COMMENT '错误类型',
    explanation TEXT COMMENT '解析说明',
    status VARCHAR(20) DEFAULT 'new' COMMENT '状态 new/reviewed/mastered',
    review_count INT DEFAULT 0 COMMENT '复习次数',
    last_review_at TIMESTAMP COMMENT '最后复习时间',
    mastered_at TIMESTAMP NULL COMMENT '掌握时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 5.2 错题复习记录表 (mistake_review_records)
```sql
CREATE TABLE mistake_review_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    mistake_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    review_answer TEXT COMMENT '复习答案',
    is_correct BOOLEAN DEFAULT FALSE COMMENT '是否正确',
    review_time INT COMMENT '复习用时(秒)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mistake_id) REFERENCES mistake_records(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 6. 学习日历和成就系统

### 6.1 学习日历表 (study_calendar)
```sql
CREATE TABLE study_calendar (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    study_date DATE NOT NULL COMMENT '学习日期',
    study_time INT DEFAULT 0 COMMENT '学习时长(分钟)',
    completed_lessons INT DEFAULT 0 COMMENT '完成课程数',
    training_sessions INT DEFAULT 0 COMMENT '训练次数',
    exam_attempts INT DEFAULT 0 COMMENT '考试次数',
    is_goal_achieved BOOLEAN DEFAULT FALSE COMMENT '是否达成目标',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_date (user_id, study_date)
);
```

### 6.2 成就表 (achievements)
```sql
CREATE TABLE achievements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '成就名称',
    description TEXT COMMENT '成就描述',
    icon VARCHAR(50) COMMENT '成就图标',
    type VARCHAR(50) NOT NULL COMMENT '成就类型 study_time/streak/score/completion',
    condition_type VARCHAR(50) COMMENT '条件类型',
    condition_value INT COMMENT '条件值',
    points INT DEFAULT 0 COMMENT '奖励积分',
    rarity VARCHAR(20) DEFAULT 'common' COMMENT '稀有度 common/rare/epic/legendary',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6.3 用户成就表 (user_achievements)
```sql
CREATE TABLE user_achievements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    achievement_id BIGINT NOT NULL,
    progress INT DEFAULT 0 COMMENT '当前进度',
    target INT DEFAULT 0 COMMENT '目标值',
    is_unlocked BOOLEAN DEFAULT FALSE COMMENT '是否解锁',
    unlocked_at TIMESTAMP NULL COMMENT '解锁时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_achievement (user_id, achievement_id)
);
```

## 7. 系统配置和日志

### 7.1 系统配置表 (system_configs)
```sql
CREATE TABLE system_configs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    description TEXT COMMENT '配置描述',
    type VARCHAR(20) DEFAULT 'string' COMMENT '值类型',
    is_public BOOLEAN DEFAULT FALSE COMMENT '是否公开',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 7.2 用户操作日志表 (user_activity_logs)
```sql
CREATE TABLE user_activity_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL COMMENT '操作类型',
    resource_type VARCHAR(50) COMMENT '资源类型',
    resource_id BIGINT COMMENT '资源ID',
    details JSON COMMENT '详细信息',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 8. 索引建议

```sql
-- 用户相关索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_last_login ON users(last_login_at);

-- 学习进度索引
CREATE INDEX idx_user_course_progress_user ON user_course_progress(user_id);
CREATE INDEX idx_user_course_progress_course ON user_course_progress(course_id);

-- 训练记录索引
CREATE INDEX idx_training_records_user ON user_training_records(user_id);
CREATE INDEX idx_training_records_scenario ON user_training_records(scenario_id);
CREATE INDEX idx_training_records_created ON user_training_records(created_at);

-- 考试记录索引
CREATE INDEX idx_exam_records_user ON user_exam_records(user_id);
CREATE INDEX idx_exam_records_exam ON user_exam_records(exam_id);
CREATE INDEX idx_exam_records_created ON user_exam_records(created_at);

-- 错题记录索引
CREATE INDEX idx_mistake_records_user ON mistake_records(user_id);
CREATE INDEX idx_mistake_records_status ON mistake_records(status);
CREATE INDEX idx_mistake_records_type ON mistake_records(mistake_type);

-- 学习日历索引
CREATE INDEX idx_study_calendar_user_date ON study_calendar(user_id, study_date);

-- 活动日志索引
CREATE INDEX idx_activity_logs_user ON user_activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON user_activity_logs(action);
CREATE INDEX idx_activity_logs_created ON user_activity_logs(created_at);
```

## 9. 数据字典说明

### 状态码定义
- **用户状态**: 1-正常, 2-禁用
- **课程状态**: 1-启用, 2-禁用
- **考试状态**: in_progress-进行中, completed-已完成, timeout-超时
- **错题状态**: new-新错题, reviewed-已复习, mastered-已掌握
- **成就稀有度**: common-普通, rare-稀有, epic-史诗, legendary-传说

### 业务规则
1. 用户每日学习目标默认30分钟
2. 考试默认最多尝试3次
3. 连续学习天数超过7天可获得成就
4. 错题复习3次且正确率达到80%可标记为已掌握
5. 课程进度达到100%才算完成

### 扩展性考虑
1. 所有表都预留了JSON字段用于存储扩展信息
2. 支持多语言的配置表设计
3. 灵活的成就系统支持各种条件组合
4. 完整的日志记录便于数据分析和问题排查

这个数据库设计涵盖了EQAS项目的所有核心功能模块，支持用户管理、学习进度跟踪、训练记录、考试系统、错题本、成就系统等完整的业务流程。