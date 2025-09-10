// API接口配置
import Request from '../utils/request'
import { buildFullPath, buildApiPath } from '@/utils/pathUtils'

// 路径处理示例函数
export const pathUtils = {
    // 构建完整API路径
    buildApiUrl: (path) => buildApiPath(path),
    // 构建完整路径
    buildUrl: (path, options) => buildFullPath(path, options)
}

// 用户相关API
export const userApi = {
    login: (data) => Request.post('/api/auth/login', data),
    wxLogin: (data) => Request.post('/api/auth/wx-login', data),
    register: (data) => Request.post('/api/auth/register', data),
    getUserInfo: () => Request.get('/api/user/info'),
    updateUserInfo: (data) => Request.put('/api/user/info', data),
    changePassword: (data) => Request.post('/api/user/change-password', data),
    uploadAvatar: (filePath) => Request.upload('/api/user/avatar', filePath),
    logout: () => Request.post('/api/auth/logout'),
    refreshToken: () => Request.post('/api/auth/refresh-token')
}

// 学习相关API
export const studyApi = {
    getHomeStats: () => Request.get('/api/home/study-stats'),
    getStudyStats: () => Request.get('/api/study/stats'),
    getStudyProgress: () => Request.get('/api/study/progress'),
    updateStudyProgress: (data) => Request.post('/api/study/progress', data),
    getVocabulary: (params) => Request.get('/api/study/vocabulary', params),
    getStandardTerms: (params) => Request.get('/api/study/terms', params),
    markAsLearned: (data) => Request.post('/api/study/mark-learned', data),
    getStudyOverview: () => Request.get('/api/study/overview'),
    getExamIntroData: () => Request.get('/api/study/exam-intro'),
    getTermsData: (studyId) => Request.get(`/api/study/terms/${studyId}`),
    getVocabularyData: (studyId) => Request.get(`/api/study/vocabulary/${studyId}`)
}

// 训练相关API
export const trainingApi = {
    getTrainingList: () => Request.get('/api/training/list'),
    startTraining: (data) => Request.post('/api/training/start', data),
    submitTrainingResult: (data) => Request.post('/api/training/submit', data),
    getTrainingHistory: (params) => Request.get('/api/training/history', params),
    getListeningQuestions: (params) => Request.get('/api/training/listening', params),
    getSpeakingQuestions: (params) => Request.get('/api/training/speaking', params),
    uploadAudio: (filePath, data) => Request.upload('/api/training/upload-audio', filePath, data)
}

// 文件相关API
export const fileApi = {
    uploadFile: (filePath, data) => Request.upload('/api/file/upload', filePath, data),
    downloadFile: (fileId) => Request.download(`/api/file/download/${fileId}`),
    deleteFile: (fileId) => Request.delete(`/api/file/${fileId}`)
}

// 系统相关API
export const systemApi = {
    getHomeBanners: () => Request.get('/api/home/banners'),
    getSystemConfig: () => Request.get('/api/system/config'),
    getVersionInfo: () => Request.get('/api/system/version'),
    submitFeedback: (data) => Request.post('/api/system/feedback', data),
    checkUpdate: () => Request.get('/api/system/check-update')
}

// 统计相关API
export const analyticsApi = {
    reportUserAction: (data) => Request.post('/api/analytics/user-action', data),
    reportError: (data) => Request.post('/api/analytics/error', data),
    getUsageStats: () => Request.get('/api/analytics/usage')
}

// 考试模块API
export const examsApi = {
    getExamList: () => Request.get('/api/exams/list'),
    getExamConfig: (examType) => Request.get(`/api/exams/config/${examType}`),
    getPrimaryExamData: () => Request.get('/api/exams/primary/data'),
    getSecondaryExamData: () => Request.get('/api/exams/secondary/data'),
    submitExamAnswers: (examType, answers) => Request.post(`/api/exams/${examType}/submit`, answers),
    getExamResult: (examId, examType) => Request.get(`/api/exams/result/${examId}`, { examType }),
    uploadRecording: (filePath, examType, moduleType) =>
        Request.upload('/api/exams/upload/recording', filePath, { examType, moduleType }),
    getExamHistory: (page = 1, limit = 10) => Request.get('/api/exams/history', { page, limit }),
    startExam: (data) => Request.post('/api/exam/start', data),
    submitExamAnswer: (data) => Request.post('/api/exam/submit-answer', data),
    finishExam: (data) => Request.post('/api/exam/finish', data),
    getCommunicationData: () => Request.get('/api/exams/communication-data'),
    getAudioFile: (audioId) => Request.get(`/api/exams/audio/${audioId}`),
    getExamStatus: (examId) => Request.get(`/api/exams/status/${examId}`),
    updateExamProgress: (examId, progress) => Request.post(`/api/exams/progress/${examId}`, progress),
    getRadarData: (examId) => Request.get(`/api/exams/radar-data/${examId}`)
}

// 导出所有API模块（去掉 examsApi）
export {

}

// 默认导出
export default {
    user: userApi,
    study: studyApi,
    training: trainingApi,
    file: fileApi,
    system: systemApi,
    analytics: analyticsApi,
    exams: examsApi
}
