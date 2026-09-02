export const maintenancePage = {
    seo: {
        title: '维修部 | 河南大学网站工作室',
        description: '河南大学网站工作室维修部培养电脑维修技能，提供硬件维修、系统维护与实践学习。',
    },
    hero: {
        title: '维修部',
        slogan: '专业电脑维修团队',
        introduction:
            '还在为电脑故障而烦恼吗？还在考虑他人求助电脑维修时无能为力吗？同学，身怀绝技，走遍天下都不怕，来维修部学习电脑维修知识吧！',
    },
    about: {
        title: '关于维修部',
        mission: {
            title: '我们的使命',
            text: '维修部致力于培养学生的电脑维修技能，帮助同学们解决各种电脑故障问题。我们相信掌握实用技能的重要性，让你从菜鸟蜕变为维修高手。',
        },
        environment: {
            title: '学习环境',
            text: '拥有专业的维修工具和设备，资深学长学姐手把手教学，常备各种维修教学资料，让你在轻松愉悦的氛围中掌握电脑维修技术。',
        },
        stats: [
            { number: '100+', label: '成功维修案例' },
            { number: '20+', label: '活跃成员' },
            { number: '20+', label: '年历史传承' },
        ],
    },
    services: [
        { title: '硬件维修', description: '主板、显卡、内存条等硬件故障诊断与维修，让你的电脑重获新生', image: '/displayMaintenance/services/hardware-repair.jpeg' },
        { title: '系统重装', description: 'Windows、Linux系统安装与优化，解决各种系统问题', image: '/displayMaintenance/services/system-reinstall.jpeg' },
        { title: '病毒清理', description: '专业杀毒软件使用，彻底清除恶意软件和病毒', image: '/displayMaintenance/services/virus-cleanup.png' },
        { title: '技能培训', description: '从基础到进阶的维修技能教学，让你成为维修高手', image: '/displayMaintenance/services/skill-training.png' },
        { title: '故障诊断', description: '快速准确定位电脑问题，提供专业解决方案', image: '/displayMaintenance/services/fault-diagnosis.jpeg' },
        { title: '性能优化', description: '提升电脑运行速度，优化系统性能表现', image: '/displayMaintenance/services/performance-optimization.png' },
    ],
    join: {
        title: '加入维修部',
        reasons: [
            '学长学姐手把手教学，从零基础到维修高手',
            '玩转各种维修工具，成就实用技能',
            '在实践中学习，在学习中成长',
            '结识志同道合的朋友，共同进步',
            '提升技术能力，为未来职业发展添砖加瓦',
        ],
    },
} as const
