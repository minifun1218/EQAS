// 学习统计数据管理

// 默认统计数据
export const defaultStats = {
  learnedTerms: 0,
  learnedWords: 0,
  favoriteCount: 0,
  studyDays: 0,
  totalStudyTime: 0, // 分钟
  lastStudyDate: null,
  weeklyGoal: 20, // 每周学习目标
  dailyGoal: 5, // 每日学习目标
  streak: 0, // 连续学习天数
  achievements: []
}

// 成就系统
export const achievements = [
  {
    id: 'first_term',
    name: '初学者',
    description: '学习第一个术语',
    icon: '🎯',
    condition: (stats) => stats.learnedTerms >= 1,
    unlocked: false
  },
  {
    id: 'first_word',
    name: '词汇新手',
    description: '学习第一个词汇',
    icon: '📚',
    condition: (stats) => stats.learnedWords >= 1,
    unlocked: false
  },
  {
    id: 'ten_terms',
    name: '术语达人',
    description: '学习10个术语',
    icon: '🏆',
    condition: (stats) => stats.learnedTerms >= 10,
    unlocked: false
  },
  {
    id: 'ten_words',
    name: '词汇专家',
    description: '学习10个词汇',
    icon: '🎓',
    condition: (stats) => stats.learnedWords >= 10,
    unlocked: false
  },
  {
    id: 'first_favorite',
    name: '收藏家',
    description: '收藏第一个内容',
    icon: '💝',
    condition: (stats) => stats.favoriteCount >= 1,
    unlocked: false
  },
  {
    id: 'week_streak',
    name: '坚持不懈',
    description: '连续学习7天',
    icon: '🔥',
    condition: (stats) => stats.streak >= 7,
    unlocked: false
  },
  {
    id: 'study_hour',
    name: '时间管理者',
    description: '累计学习1小时',
    icon: '⏰',
    condition: (stats) => stats.totalStudyTime >= 60,
    unlocked: false
  },
  {
    id: 'fifty_learned',
    name: '学习大师',
    description: '学习50个内容',
    icon: '👑',
    condition: (stats) => (stats.learnedTerms + stats.learnedWords) >= 50,
    unlocked: false
  }
]

// 学习统计工具类
export class StudyStatsManager {
  // 获取统计数据
  static getStats() {
    const stats = uni.getStorageSync('studyStats') || { ...defaultStats }
    return { ...defaultStats, ...stats }
  }
  
  // 保存统计数据
  static saveStats(stats) {
    uni.setStorageSync('studyStats', stats)
  }
  
  // 更新学习统计
  static updateLearningStats() {
    const stats = this.getStats()
    
    // 获取已学习的术语和词汇数量
    const learnedTerms = uni.getStorageSync('learnedTerms') || []
    const learnedWords = uni.getStorageSync('learnedWords') || []
    const favoriteTerms = uni.getStorageSync('favoriteTerms') || []
    const favoriteWords = uni.getStorageSync('favoriteWords') || []
    
    stats.learnedTerms = learnedTerms.length
    stats.learnedWords = learnedWords.length
    stats.favoriteCount = favoriteTerms.length + favoriteWords.length
    
    // 更新学习天数和连续天数
    const today = new Date().toDateString()
    const lastStudyDate = stats.lastStudyDate
    
    if (lastStudyDate !== today) {
      if (lastStudyDate) {
        const lastDate = new Date(lastStudyDate)
        const currentDate = new Date(today)
        const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === 1) {
          // 连续学习
          stats.streak += 1
        } else if (daysDiff > 1) {
          // 中断学习
          stats.streak = 1
        }
      } else {
        // 第一次学习
        stats.streak = 1
      }
      
      stats.studyDays += 1
      stats.lastStudyDate = today
    }
    
    this.saveStats(stats)
    this.checkAchievements(stats)
    
    return stats
  }
  
  // 添加学习时间
  static addStudyTime(minutes) {
    const stats = this.getStats()
    stats.totalStudyTime += minutes
    this.saveStats(stats)
    this.checkAchievements(stats)
  }
  
  // 检查成就
  static checkAchievements(stats) {
    const unlockedAchievements = uni.getStorageSync('unlockedAchievements') || []
    const newAchievements = []
    
    achievements.forEach(achievement => {
      if (!unlockedAchievements.includes(achievement.id) && achievement.condition(stats)) {
        unlockedAchievements.push(achievement.id)
        newAchievements.push(achievement)
      }
    })
    
    if (newAchievements.length > 0) {
      uni.setStorageSync('unlockedAchievements', unlockedAchievements)
      
      // 显示成就通知
      newAchievements.forEach(achievement => {
        uni.showToast({
          title: `🎉 解锁成就：${achievement.name}`,
          icon: 'none',
          duration: 3000
        })
      })
    }
    
    return newAchievements
  }
  
  // 获取已解锁的成就
  static getUnlockedAchievements() {
    const unlockedIds = uni.getStorageSync('unlockedAchievements') || []
    return achievements.filter(achievement => unlockedIds.includes(achievement.id))
  }
  
  // 获取学习进度
  static getLearningProgress() {
    const stats = this.getStats()
    const totalContent = 25 // 假设总共有25个学习内容
    const learnedContent = stats.learnedTerms + stats.learnedWords
    
    return {
      percentage: Math.min(Math.round((learnedContent / totalContent) * 100), 100),
      learned: learnedContent,
      total: totalContent,
      remaining: Math.max(totalContent - learnedContent, 0)
    }
  }
  
  // 获取本周学习进度
  static getWeeklyProgress() {
    const stats = this.getStats()
    const progress = Math.min(Math.round((stats.learnedTerms + stats.learnedWords) / stats.weeklyGoal * 100), 100)
    
    return {
      percentage: progress,
      completed: stats.learnedTerms + stats.learnedWords,
      goal: stats.weeklyGoal
    }
  }
  
  // 获取今日学习进度
  static getDailyProgress() {
    // 这里简化处理，实际应该记录每日学习数量
    const stats = this.getStats()
    const today = new Date().toDateString()
    
    if (stats.lastStudyDate === today) {
      // 今天已经学习过
      const progress = Math.min(Math.round(1 / stats.dailyGoal * 100), 100)
      return {
        percentage: progress,
        completed: 1,
        goal: stats.dailyGoal
      }
    } else {
      return {
        percentage: 0,
        completed: 0,
        goal: stats.dailyGoal
      }
    }
  }
  
  // 重置统计数据
  static resetStats() {
    uni.removeStorageSync('studyStats')
    uni.removeStorageSync('unlockedAchievements')
    uni.removeStorageSync('learnedTerms')
    uni.removeStorageSync('learnedWords')
    uni.removeStorageSync('favoriteTerms')
    uni.removeStorageSync('favoriteWords')
    uni.removeStorageSync('favoriteTimestamps')
    uni.removeStorageSync('wordNotes')
    uni.removeStorageSync('termNotes')
  }
}

// 学习提醒配置
export const studyReminders = {
  enabled: true,
  time: '20:00', // 默认提醒时间
  frequency: 'daily', // daily, weekly
  message: '该学习航空术语了！坚持每天学习，提升专业技能。'
}