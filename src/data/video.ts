export interface VideoCapability {
    label: string
    title: string
    description: string
    scope?: string
}

export const videoPage = {
    seo: {
        title: '视频部 | 河南大学网站工作室',
        description:
            '河南大学网站工作室视频部开展 AI 视频生成、视频剪辑、视频号运营与工作室内部影像记录。',
    },

    hero: {
        title: '视频部',
        slogan: '练啥不如练技术，学啥不如学技能。同学，技多不压身哦！',
        introduction:
            '视频化时代，掌握视频剪辑技能不仅能增强就业竞争力，更能利用剪辑副业多一份外快收入。',
    },

    capabilities: {
        title: '我们的工作',
        items: [
            {
                label: '01',
                title: 'AI 视频生成',
                description: '借助 AI 工具探索视频内容生成',
            },
            {
                label: '02',
                title: '视频剪辑',
                description: '从 0 到 1 学习视频剪辑与特效制作',
            },
            {
                label: '03',
                title: '视频号运营',
                description: '参与视频号内容策划与日常运营',
            },
            {
                label: '04',
                title: '视频录像',
                description: '为工作室内部活动提供录像支持',
                scope: '内部支持',
            },
        ] satisfies VideoCapability[],
    },

    epilogue: {
        paragraphs: [
            '来视频部吧，学长学姐将与你们分享所学，带你们从 0 到 1 学习视频剪辑、特效制作、摄影录像。',
            '在这里，街头采访，趣味团建，精彩不断！',
            '不用担心零基础，视频部大家庭带你从零起步，来吧！我们一同启程！',
        ],
    },
} as const
