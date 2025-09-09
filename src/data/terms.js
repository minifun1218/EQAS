// 标准陆空通话术语数据
export const termsData = [
  {
    id: 1,
    chinese: '起飞许可',
    english: 'Takeoff Clearance',
    phonetic: 'ˈteɪkɔːf ˈklɪərəns',
    category: 'takeoff',
    difficulty: 'basic',
    isFavorite: false,
    isLearned: false,
    definition: '塔台或地面管制员向飞行员发出的允许飞机起飞的正式授权指令。',
    dialogues: [
      {
        speaker: 'Tower',
        message: 'CCA123, runway 36L, cleared for takeoff.',
        translation: 'CCA123，跑道36L，允许起飞。'
      },
      {
        speaker: 'Pilot',
        message: 'Cleared for takeoff, runway 36L, CCA123.',
        translation: '允许起飞，跑道36L，CCA123。'
      }
    ],
    relatedTerms: [2, 3, 4]
  },
  {
    id: 2,
    chinese: '着陆许可',
    english: 'Landing Clearance',
    phonetic: 'ˈlændɪŋ ˈklɪərəns',
    category: 'landing',
    difficulty: 'basic',
    isFavorite: false,
    isLearned: false,
    definition: '塔台管制员向飞行员发出的允许飞机在指定跑道着陆的正式授权。',
    dialogues: [
      {
        speaker: 'Tower',
        message: 'CCA456, runway 18R, cleared to land.',
        translation: 'CCA456，跑道18R，允许着陆。'
      },
      {
        speaker: 'Pilot',
        message: 'Cleared to land, runway 18R, CCA456.',
        translation: '允许着陆，跑道18R，CCA456。'
      }
    ],
    relatedTerms: [1, 5, 6]
  },
  {
    id: 3,
    chinese: '等待指令',
    english: 'Hold Instructions',
    phonetic: 'hoʊld ɪnˈstrʌkʃənz',
    category: 'navigation',
    difficulty: 'intermediate',
    isFavorite: false,
    isLearned: false,
    definition: '管制员要求飞机在指定位置或高度保持等待的指令，通常用于交通管制。',
    dialogues: [
      {
        speaker: 'Tower',
        message: 'CCA789, hold short of runway 09L.',
        translation: 'CCA789，在跑道09L前等待。'
      },
      {
        speaker: 'Pilot',
        message: 'Holding short of runway 09L, CCA789.',
        translation: '在跑道09L前等待，CCA789。'
      }
    ],
    relatedTerms: [7, 8, 9]
  },
  {
    id: 4,
    chinese: '滑行许可',
    english: 'Taxi Clearance',
    phonetic: 'ˈtæksi ˈklɪərəns',
    category: 'ground',
    difficulty: 'basic',
    isFavorite: false,
    isLearned: false,
    definition: '地面管制员向飞行员发出的允许飞机在机场地面滑行的指令。',
    dialogues: [
      {
        speaker: 'Ground',
        message: 'CCA321, taxi to runway 27 via taxiway Alpha.',
        translation: 'CCA321，经滑行道Alpha滑行至跑道27。'
      },
      {
        speaker: 'Pilot',
        message: 'Taxi to runway 27 via Alpha, CCA321.',
        translation: '经Alpha滑行至跑道27，CCA321。'
      }
    ],
    relatedTerms: [1, 10, 11]
  },
  {
    id: 5,
    chinese: '进近许可',
    english: 'Approach Clearance',
    phonetic: 'əˈproʊtʃ ˈklɪərəns',
    category: 'approach',
    difficulty: 'intermediate',
    isFavorite: false,
    isLearned: false,
    definition: '管制员向飞行员发出的允许飞机按照指定程序进行进近的授权。',
    dialogues: [
      {
        speaker: 'Approach',
        message: 'CCA654, cleared ILS approach runway 06.',
        translation: 'CCA654，允许ILS进近跑道06。'
      },
      {
        speaker: 'Pilot',
        message: 'Cleared ILS approach runway 06, CCA654.',
        translation: '允许ILS进近跑道06，CCA654。'
      }
    ],
    relatedTerms: [2, 12, 13]
  },
  {
    id: 6,
    chinese: '复飞指令',
    english: 'Go Around',
    phonetic: 'ɡoʊ əˈraʊnd',
    category: 'landing',
    difficulty: 'intermediate',
    isFavorite: false,
    isLearned: false,
    definition: '管制员或飞行员决定中止着陆并重新进行进近的指令。',
    dialogues: [
      {
        speaker: 'Tower',
        message: 'CCA987, go around, traffic on runway.',
        translation: 'CCA987，复飞，跑道有飞机。'
      },
      {
        speaker: 'Pilot',
        message: 'Going around, CCA987.',
        translation: '正在复飞，CCA987。'
      }
    ],
    relatedTerms: [2, 5, 14]
  },
  {
    id: 7,
    chinese: '高度指令',
    english: 'Altitude Assignment',
    phonetic: 'ˈæltɪtuːd əˈsaɪnmənt',
    category: 'navigation',
    difficulty: 'basic',
    isFavorite: false,
    isLearned: false,
    definition: '管制员向飞行员指定飞行高度的指令。',
    dialogues: [
      {
        speaker: 'Control',
        message: 'CCA111, climb and maintain flight level 350.',
        translation: 'CCA111，爬升并保持飞行高度层350。'
      },
      {
        speaker: 'Pilot',
        message: 'Climb and maintain FL350, CCA111.',
        translation: '爬升并保持FL350，CCA111。'
      }
    ],
    relatedTerms: [8, 15, 16]
  },
  {
    id: 8,
    chinese: '航向指令',
    english: 'Heading Assignment',
    phonetic: 'ˈhedɪŋ əˈsaɪnmənt',
    category: 'navigation',
    difficulty: 'basic',
    isFavorite: false,
    isLearned: false,
    definition: '管制员向飞行员指定飞行方向的指令。',
    dialogues: [
      {
        speaker: 'Control',
        message: 'CCA222, turn left heading 270.',
        translation: 'CCA222，左转航向270。'
      },
      {
        speaker: 'Pilot',
        message: 'Turn left heading 270, CCA222.',
        translation: '左转航向270，CCA222。'
      }
    ],
    relatedTerms: [7, 17, 18]
  },
  {
    id: 9,
    chinese: '速度指令',
    english: 'Speed Assignment',
    phonetic: 'spiːd əˈsaɪnmənt',
    category: 'navigation',
    difficulty: 'basic',
    isFavorite: false,
    isLearned: false,
    definition: '管制员向飞行员指定飞行速度的指令。',
    dialogues: [
      {
        speaker: 'Control',
        message: 'CCA333, reduce speed to 250 knots.',
        translation: 'CCA333，减速至250节。'
      },
      {
        speaker: 'Pilot',
        message: 'Reduce speed to 250 knots, CCA333.',
        translation: '减速至250节，CCA333。'
      }
    ],
    relatedTerms: [7, 8, 19]
  },
  {
    id: 10,
    chinese: '频率转换',
    english: 'Frequency Change',
    phonetic: 'ˈfriːkwənsi tʃeɪndʒ',
    category: 'communication',
    difficulty: 'basic',
    isFavorite: false,
    isLearned: false,
    definition: '管制员指示飞行员转换到另一个通信频率的指令。',
    dialogues: [
      {
        speaker: 'Control',
        message: 'CCA444, contact approach 119.1.',
        translation: 'CCA444，联系进近119.1。'
      },
      {
        speaker: 'Pilot',
        message: 'Contact approach 119.1, CCA444.',
        translation: '联系进近119.1，CCA444。'
      }
    ],
    relatedTerms: [20, 21, 22]
  }
]

// 术语分类
export const termCategories = [
  { id: 'all', name: '全部', count: 0 },
  { id: 'takeoff', name: '起飞', count: 0 },
  { id: 'landing', name: '着陆', count: 0 },
  { id: 'navigation', name: '导航', count: 0 },
  { id: 'ground', name: '地面', count: 0 },
  { id: 'approach', name: '进近', count: 0 },
  { id: 'communication', name: '通信', count: 0 }
]

// 更新分类计数
termCategories.forEach(category => {
  if (category.id === 'all') {
    category.count = termsData.length
  } else {
    category.count = termsData.filter(term => term.category === category.id).length
  }
})