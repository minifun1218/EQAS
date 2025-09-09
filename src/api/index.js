// API接口配置
import Request from '@/utils/request'

// 用户相关API
export const userApi = {
  // 用户登录
  login: (data) => Request.post('/api/auth/login', data),
  
  // 用户注册
  register: (data) => Request.post('/api/auth/register', data),
  
  // 获取用户信息
  getUserInfo: () => Request.get('/api/user/info'),
  
  // 更新用户信息
  updateUserInfo: (data) => Request.put('/api/user/info', data),
  
  // 修改密码
  changePassword: (data) => Request.post('/api/user/change-password', data),
  
  // 上传头像
  uploadAvatar: (filePath) => Request.upload('/api/user/avatar', filePath),
  
  // 退出登录
  logout: () => Request.post('/api/auth/logout'),
  
  // 刷新token
  refreshToken: () => Request.post('/api/auth/refresh-token')
}

// 学习相关API
export const studyApi = {
  // 获取学习统计
  getStudyStats: () => Request.get('/api/study/stats'),
  
  // 获取学习进度
  getStudyProgress: () => Request.get('/api/study/progress'),
  
  // 更新学习进度
  updateStudyProgress: (data) => Request.post('/api/study/progress', data),
  
  // 获取词汇列表
  getVocabulary: (params) => Request.get('/api/study/vocabulary', params),
  
  // 获取标准术语
  getStandardTerms: (params) => Request.get('/api/study/terms', params),
  
  // 标记已学习
  markAsLearned: (data) => Request.post('/api/study/mark-learned', data)
}

// 训练相关API
export const trainingApi = {
  // 获取训练列表
  getTrainingList: () => Request.get('/api/training/list'),
  
  // 开始训练
  startTraining: (data) => Request.post('/api/training/start', data),
  
  // 提交训练结果
  submitTrainingResult: (data) => Request.post('/api/training/submit', data),
  
  // 获取训练历史
  getTrainingHistory: (params) => Request.get('/api/training/history', params),
  
  // 获取听力训练题目
  getListeningQuestions: (params) => Request.get('/api/training/listening', params),
  
  // 获取口语训练题目
  getSpeakingQuestions: (params) => Request.get('/api/training/speaking', params),
  
  // 上传语音文件
  uploadAudio: (filePath, data) => Request.upload('/api/training/upload-audio', filePath, data)
}

// 考试相关API
export const examApi = {
  // 获取考试列表
  getExamList: () => Request.get('/api/exam/list'),
  
  // 开始考试
  startExam: (data) => Request.post('/api/exam/start', data),
  
  // 提交考试答案
  submitExamAnswer: (data) => Request.post('/api/exam/submit-answer', data),
  
  // 完成考试
  finishExam: (data) => Request.post('/api/exam/finish', data),
  
  // 获取考试结果
  getExamResult: (examId) => Request.get(`/api/exam/result/${examId}`),
  
  // 获取考试历史
  getExamHistory: (params) => Request.get('/api/exam/history', params)
}

// 文件相关API
export const fileApi = {
  // 上传文件
  uploadFile: (filePath, data) => Request.upload('/api/file/upload', filePath, data),
  
  // 下载文件
  downloadFile: (fileId) => Request.download(`/api/file/download/${fileId}`),
  
  // 删除文件
  deleteFile: (fileId) => Request.delete(`/api/file/${fileId}`)
}

// 系统相关API
export const systemApi = {
  // 获取系统配置
  getSystemConfig: () => Request.get('/api/system/config'),
  
  // 获取版本信息
  getVersionInfo: () => Request.get('/api/system/version'),
  
  // 反馈建议
  submitFeedback: (data) => Request.post('/api/system/feedback', data),
  
  // 检查更新
  checkUpdate: () => Request.get('/api/system/check-update')
}

// 统计相关API
export const analyticsApi = {
  // 上报用户行为
  reportUserAction: (data) => Request.post('/api/analytics/user-action', data),
  
  // 上报错误信息
  reportError: (data) => Request.post('/api/analytics/error', data),
  
  // 获取使用统计
  getUsageStats: () => Request.get('/api/analytics/usage')
}

// 导出所有API
export default {
  user: userApi,
  study: studyApi,
  training: trainingApi,
  exam: examApi,
  file: fileApi,
  system: systemApi,
  analytics: analyticsApi
}