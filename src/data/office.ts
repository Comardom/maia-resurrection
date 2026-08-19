export interface OfficeActivity {
  date: string
  title: string
  description: string
}

export interface OfficeHistoryItem {
  year: string
  description: string
}

export interface OfficeMember {
  name: string
  description: string
}

export interface OfficeJoinCategory {
  title: string
  titleEn: string
  items: string[]
}

export const officePage = {
  hero: {
    nameEn: 'Henan University Website Studio',
    nameZh: '河南大学网站工作室',
    title: '办公室',
    titleEn: 'Office Department',
  },

  navigation: [
    { id: 'home', label: '首页' },
    { id: 'about', label: '关于我们' },
    { id: 'activities', label: '活动与历程' },
    { id: 'members', label: '部长介绍' },
  ],

  about: {
    title: '关于办公室',
    description:
      '办公室是一个温暖和谐的大家庭，主要负责活动策划、值班安排、场地申请等工作，能极大锻炼个人沟通交流能力与组织协调能力。',
    featuresTitle: '我们的特色',
    features: [
      '这里有帅气开朗的学长，也有美丽大方的学姐，没有部长与部员的距离感，大家都是彼此的好朋友',
      '可以自由自在地做想做的事情，创造属于自己的精彩',
      '如果你是社恐星人，我们致力于将社恐锻炼为社牛',
      '如果你是社牛星人，我们也是社牛星球的常驻民',
    ],
    responsibilitiesTitle: '主要工作职责',
    responsibilities: [
      '负责工作室各类活动的策划与组织实施',
      '安排和协调各部门的值班工作',
      '处理场地申请和使用协调工作',
      '负责内部沟通协调和团队建设工作',
    ],
  },

  activities: {
    title: '近期活动与发展历程',
    description: '记录我们的精彩活动与成长足迹，见证每一次突破与进步',
    recentTitle: '近期活动',
    recent: [
      {
        date: '2025-03-15',
        title: '网络文化节',
        description: '申请场地并策划文化节活动内容。',
      },
      {
        date: '2025-04-02',
        title: '活动策划模拟',
        description: '面向新成员，想象并实现心中的文化节策划。',
      },
      {
        date: '2025-05-20',
        title: '换届选举',
        description: '公平透明的换届流程，选出新一届核心成员。',
      },
    ] satisfies OfficeActivity[],
    historyTitle: '发展历程',
    history: [
      {
        year: '2022 年',
        description: '完善活动流程与制度，建立跨部门协作规范。',
      },
      {
        year: '2023 年',
        description: '推出品牌化活动，成员规模与影响力显著提升。',
      },
      {
        year: '2024 年',
        description: '完善培训体系，建立活动知识库与复盘体系。',
      },
    ] satisfies OfficeHistoryItem[],
  },

  members: {
    title: '部长介绍',
    description: '认识两位部长，了解他们的职责与寄语',
    items: [
      {
        name: '陈昊喆 · 新区部长',
        description:
          '一个积极向上、充满热情且富有responsibility的人。在工作中，尊重团队成员的个性和特长，能够充分发挥自己的优势，在沟通能力方面，也能较好地理解他人的需求和意见。',
      },
      {
        name: '毛誉涵 · 老区部长',
        description:
          '我的工作很简单：做好服务，保障大家。我会管好物资、理顺流程，做团队最可靠的后盾。需要任何支持，随时找我。together with the studio.',
      },
    ] satisfies OfficeMember[],
  },

  join: {
    title: 'JOIN US',
    description: '在这里，你将获得全方位的成长体验，与志同道合的伙伴一起创造精彩。',
    categories: [
      {
        title: '能力提升',
        titleEn: 'SKILL DEVELOPMENT',
        items: [
          '沟通协调能力的全面锻炼',
          '活动策划与执行经验积累',
          '团队协作与领导力培养',
          '问题解决与应变能力',
        ],
      },
      {
        title: '收获体验',
        titleEn: 'EXPERIENCE GAINED',
        items: [
          '丰富的实践项目经验',
          '珍贵的团队友谊建立',
          '综合素质的显著提升',
          '职业规划的清晰认知',
        ],
      },
      {
        title: '团队文化',
        titleEn: 'TEAM CULTURE',
        items: [
          '开放包容的工作氛围',
          '学长学姐的悉心指导',
          '创新思维的鼓励支持',
          '个人成长的全力助力',
        ],
      },
    ] satisfies OfficeJoinCategory[],
    action: '加入我们，开启你的精彩旅程',
  },

  joinModal: {
    image: '/img/number.jpg',
    imageAlt: '迎新群二维码',
    description: '长按或扫描二维码加入办公室迎新群',
  },

  footer: {
    department: 'Office Department — 办公室部门',
    navigationTitle: '快速导航',
    navigation: [
      { label: '首页', href: '#' },
      { label: '关于我们', href: '#about' },
    ],
    contactTitle: '联系我们',
    contacts: [
      'QQ 群：814040015',
      '地址：河南大学',
    ],
    copyright: 'Henan University Website Studio. All rights reserved.',
  },
} as const
