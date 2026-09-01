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
        slogan: '专业影像制作 · 校园传媒核心团队',
        introduction:
            '河南大学视频部是校内专业的视频制作与传媒团队，致力于校园活动记录、宣传片制作与媒体内容创作。我们拥有专业的设备与培训体系，为校园文化传播提供有力支持。',
    },

    capabilities: {
        title: '主要职能',
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

    join: {
        title: '加入我们',
        paragraphs: [
            '来视频部吧，学长学姐将与你们分享所学，带你们从 0 到 1 学习视频剪辑、特效制作、摄影录像。',
            '在这里，街头采访，趣味团建，精彩不断！',
            '不用担心零基础，视频部大家庭带你从零起步，来吧！我们一同启程！',
        ],
    },
} as const
