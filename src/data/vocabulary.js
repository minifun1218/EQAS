// 航空高频词汇数据
export const vocabularyData = [
  {
    id: 1,
    chinese: '跑道',
    english: 'Runway',
    phonetic: 'ˈrʌnweɪ',
    topicId: 'takeoff-landing',
    difficulty: 'basic',
    isFavorite: false,
    isLearned: false,
    definition: '供飞机起飞和着陆使用的长条形地面区域，通常由混凝土或沥青铺设，具有特定的长度和宽度标准。',
    examples: [
      {
        english: 'The aircraft is cleared to land on runway 36L.',
        chinese: '飞机获准在36L跑道着陆。'
      },
      {
        english: 'Runway conditions are dry with good braking action.',
        chinese: '跑道条件干燥，制动效果良好。'
      },
      {
        english: 'Please taxi to the active runway for departure.',
        chinese: '请滑行至活跃跑道准备起飞。'
      }
    ],
    variations: [
      { type: '复数', word: 'runways' },
      { type: '形容词', word: 'runway-related' }
    ]
  },
  {
    id: 2,
    chinese: '滑行道',
    english: 'Taxiway',
    phonetic: 'ˈtæksiweɪ',
    topicId: 'takeoff-landing',
    difficulty: 'basic',
    isFavorite: false,
    isLearned: false,
    definition: '连接跑道与停机坪、候机楼的通道，供飞机在地面滑行使用，通常标有黄色标线。',
    examples: [
      {
        english: 'Follow the taxiway to gate A12.',
        chinese: '沿滑行道前往A12登机口。'
      },
      {
        english: 'Taxiway Alpha is closed for maintenance.',
        chinese: 'Alpha滑行道因维护关闭。'
      },
      {
        english: 'Use taxiway Bravo to reach the terminal.',
        chinese: '使用Bravo滑行道到达航站楼。'
      }
    ],
    variations: [
      { type: '复数', word: 'taxiways' }
    ]
  },
  {
    id: 3,
    chinese: '航向',
    english: 'Heading',
    phonetic: 'ˈhedɪŋ',
    topicId: 'navigation',
    difficulty: 'intermediate',
    isFavorite: false,
    isLearned: false,
    definition: '飞机机头指向的方向，以度数表示（0-360度），是导航的基本要素之一。',
    examples: [
      {
        english: 'Turn left heading 270 degrees.',
        chinese: '左转航向270度。'
      },
      {
        english: 'Maintain present heading until further notice.',
        chinese: '保持当前航向直到进一步通知。'
      },
      {
        english: 'Change heading to 090 for traffic separation.',
        chinese: '改变航向至090度以进行交通分离。'
      }
    ],
    variations: [
      { type: '复数', word: 'headings' },
      { type: '动词', word: 'head' }
    ]
  },
  {
    id: 4,
    chinese: '高度',
    english: 'Altitude',
    phonetic: 'ˈæltɪtuːd',
    topicId: 'navigation',
    difficulty: 'basic',
    isFavorite: false,
    isLearned: false,
    definition: '飞机相对于海平面的垂直距离，通常以英尺为单位测量。',
    examples: [
      {
        english: 'Maintain altitude 10,000 feet.',
        chinese: '保持高度10,000英尺。'
      },
      {
        english: 'Climb to flight level 350.',
        chinese: '爬升至飞行高度层350。'
      },
      {
        english: 'Descend and maintain 5,000 feet.',
        chinese: '下降并保持5,000英尺。'
      }
    ],
    variations: [
      { type: '复数', word: 'altitudes' },
      { type: '形容词', word: 'altitudinal' }
    ]
  },
  {
    id: 5,
    chinese: '速度',
    english: 'Speed',
    phonetic: 'spiːd',
    topicId: 'navigation',
    difficulty: 'basic',
    isFavorite: false,
    isLearned: false,
    definition: '飞机的飞行速度，通常以节（knots）或马赫数（Mach）表示。',
    examples: [
      {
        english: 'Reduce speed to 250 knots.',
        chinese: '减速至250节。'
      },
      {
        english: 'Increase speed to Mach 0.78.',
        chinese: '增速至马赫0.78。'
      },
      {
        english: 'Maintain current speed for approach.',
        chinese: '保持当前速度进行进近。'
      }
    ],
    variations: [
      { type: '复数', word: 'speeds' },
      { type: '形容词', word: 'speedy' }
    ]
  },
  {
    id: 6,
    chinese: '能见度',
    english: 'Visibility',
    phonetic: 'ˌvɪzəˈbɪləti',
    topicId: 'weather',
    difficulty: 'intermediate',
    isFavorite: false,
    isLearned: false,
    definition: '大气中水平能见的最大距离，是影响飞行安全的重要天气因素。',
    examples: [
      {
        english: 'Visibility is 10 kilometers in clear conditions.',
        chinese: '晴朗条件下能见度为10公里。'
      },
      {
        english: 'Reduced visibility due to fog.',
        chinese: '由于雾天能见度降低。'
      },
      {
        english: 'Minimum visibility for landing is 800 meters.',
        chinese: '着陆最低能见度为800米。'
      }
    ],
    variations: [
      { type: '形容词', word: 'visible' },
      { type: '副词', word: 'visibly' }
    ]
  },
  {
    id: 7,
    chinese: '风向',
    english: 'Wind Direction',
    phonetic: 'wɪnd dəˈrekʃən',
    topicId: 'weather',
    difficulty: 'basic',
    isFavorite: false,
    isLearned: false,
    definition: '风吹来的方向，以度数表示，对飞机起降有重要影响。',
    examples: [
      {
        english: 'Wind direction is 270 degrees at 15 knots.',
        chinese: '风向270度，风速15节。'
      },
      {
        english: 'Crosswind from the south affects landing.',
        chinese: '来自南方的侧风影响着陆。'
      },
      {
        english: 'Wind direction has shifted to the northeast.',
        chinese: '风向已转至东北方。'
      }
    ],
    variations: [
      { type: '复数', word: 'wind directions' }
    ]
  },
  {
    id: 8,
    chinese: '风速',
    english: 'Wind Speed',
    phonetic: 'wɪnd spiːd',
    topicId: 'weather',
    difficulty: 'basic',
    isFavorite: false,
    isLearned: false,
    definition: '风的速度，通常以节（knots）为单位，是飞行计划的重要参数。',
    examples: [
      {
        english: 'Wind speed is 20 knots, gusting to 35.',
        chinese: '风速20节，阵风35节。'
      },
      {
        english: 'Light wind speed favors smooth landing.',
        chinese: '轻风有利于平稳着陆。'
      },
      {
        english: 'High wind speed may delay departure.',
        chinese: '强风可能延误起飞。'
      }
    ],
    variations: [
      { type: '复数', word: 'wind speeds' }
    ]
  },
  {
    id: 9,
    chinese: '紧急情况',
    english: 'Emergency',
    phonetic: 'ɪˈmɜːrdʒənsi',
    topicId: 'emergency',
    difficulty: 'intermediate',
    isFavorite: false,
    isLearned: false,
    definition: '需要立即采取行动的危险或异常情况，可能威胁飞行安全。',
    examples: [
      {
        english: 'Declare emergency due to engine failure.',
        chinese: '因发动机故障宣布紧急情况。'
      },
      {
        english: 'Emergency landing procedures are in effect.',
        chinese: '紧急着陆程序生效。'
      },
      {
        english: 'Request emergency assistance immediately.',
        chinese: '立即请求紧急援助。'
      }
    ],
    variations: [
      { type: '复数', word: 'emergencies' },
      { type: '形容词', word: 'emergency' }
    ]
  },
  {
    id: 10,
    chinese: '发动机',
    english: 'Engine',
    phonetic: 'ˈendʒɪn',
    topicId: 'aircraft',
    difficulty: 'basic',
    isFavorite: false,
    isLearned: false,
    definition: '为飞机提供推力的动力装置，是飞机的核心部件之一。',
    examples: [
      {
        english: 'Engine number two is showing abnormal readings.',
        chinese: '二号发动机显示异常读数。'
      },
      {
        english: 'Start engines for departure preparation.',
        chinese: '启动发动机准备起飞。'
      },
      {
        english: 'Engine maintenance is scheduled for tonight.',
        chinese: '发动机维护安排在今晚。'
      }
    ],
    variations: [
      { type: '复数', word: 'engines' },
      { type: '形容词', word: 'engine-related' }
    ]
  },
  {
    id: 11,
    chinese: '起落架',
    english: 'Landing Gear',
    phonetic: 'ˈlændɪŋ ɡɪr',
    topicId: 'aircraft',
    difficulty: 'intermediate',
    isFavorite: false,
    isLearned: false,
    definition: '飞机用于地面滑行、起飞和着陆的轮子装置系统。',
    examples: [
      {
        english: 'Landing gear is down and locked.',
        chinese: '起落架已放下并锁定。'
      },
      {
        english: 'Retract landing gear after takeoff.',
        chinese: '起飞后收起起落架。'
      },
      {
        english: 'Landing gear malfunction reported.',
        chinese: '报告起落架故障。'
      }
    ],
    variations: [
      { type: '同义词', word: 'undercarriage' }
    ]
  },
  {
    id: 12,
    chinese: '襟翼',
    english: 'Flaps',
    phonetic: 'flæps',
    topicId: 'aircraft',
    difficulty: 'intermediate',
    isFavorite: false,
    isLearned: false,
    definition: '机翼后缘的可动控制面，用于增加升力和阻力，主要在起降时使用。',
    examples: [
      {
        english: 'Set flaps to 30 degrees for landing.',
        chinese: '设置襟翼30度准备着陆。'
      },
      {
        english: 'Flaps are extended for approach.',
        chinese: '襟翼已展开进行进近。'
      },
      {
        english: 'Retract flaps after reaching cruise altitude.',
        chinese: '到达巡航高度后收回襟翼。'
      }
    ],
    variations: [
      { type: '单数', word: 'flap' }
    ]
  },
  {
    id: 13,
    chinese: '塔台',
    english: 'Control Tower',
    phonetic: 'kənˈtroʊl ˈtaʊər',
    topicId: 'airport',
    difficulty: 'basic',
    isFavorite: false,
    isLearned: false,
    definition: '机场的控制中心，负责指挥飞机的起降和地面滑行。',
    examples: [
      {
        english: 'Contact tower on frequency 118.1.',
        chinese: '在频率118.1联系塔台。'
      },
      {
        english: 'Tower cleared us for immediate takeoff.',
        chinese: '塔台批准我们立即起飞。'
      },
      {
        english: 'Tower visibility is excellent today.',
        chinese: '今天塔台能见度极佳。'
      }
    ],
    variations: [
      { type: '复数', word: 'control towers' },
      { type: '简称', word: 'tower' }
    ]
  },
  {
    id: 14,
    chinese: '停机坪',
    english: 'Apron',
    phonetic: 'ˈeɪprən',
    topicId: 'airport',
    difficulty: 'basic',
    isFavorite: false,
    isLearned: false,
    definition: '机场内供飞机停放、装卸货物和乘客上下的区域。',
    examples: [
      {
        english: 'Aircraft is parked on the apron.',
        chinese: '飞机停在停机坪上。'
      },
      {
        english: 'Pushback from apron is approved.',
        chinese: '批准从停机坪推出。'
      },
      {
        english: 'Apron control manages ground traffic.',
        chinese: '停机坪管制负责地面交通。'
      }
    ],
    variations: [
      { type: '复数', word: 'aprons' },
      { type: '同义词', word: 'ramp' }
    ]
  },
  {
    id: 15,
    chinese: '登机口',
    english: 'Gate',
    phonetic: 'ɡeɪt',
    topicId: 'airport',
    difficulty: 'basic',
    isFavorite: false,
    isLearned: false,
    definition: '航站楼内供乘客登机和下机的指定位置。',
    examples: [
      {
        english: 'Proceed to gate B15 for boarding.',
        chinese: '前往B15登机口登机。'
      },
      {
        english: 'Gate assignment has been changed.',
        chinese: '登机口安排已更改。'
      },
      {
        english: 'Aircraft is approaching the gate.',
        chinese: '飞机正在接近登机口。'
      }
    ],
    variations: [
      { type: '复数', word: 'gates' }
    ]
  }
]

// 词汇主题分类
export const vocabularyTopics = [
  { id: 'takeoff-landing', name: '起降', icon: '🛫', count: 0 },
  { id: 'navigation', name: '导航', icon: '🧭', count: 0 },
  { id: 'weather', name: '天气', icon: '🌤️', count: 0 },
  { id: 'emergency', name: '故障处理', icon: '🚨', count: 0 },
  { id: 'aircraft', name: '飞机部件', icon: '✈️', count: 0 },
  { id: 'airport', name: '机场设施', icon: '🏢', count: 0 }
]

// 更新主题计数
vocabularyTopics.forEach(topic => {
  topic.count = vocabularyData.filter(word => word.topicId === topic.id).length
})

// 难度级别
export const difficultyLevels = [
  { id: 'basic', name: '基础', color: '#52c41a' },
  { id: 'intermediate', name: '中级', color: '#fa8c16' },
  { id: 'advanced', name: '高级', color: '#f5222d' }
]