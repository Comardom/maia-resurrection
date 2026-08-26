export interface NewMediaOperation {
    label: string
    title: string
    description: string
}

export interface NewMediaLeader {
    name: string
    grade: string
    major: string
    qq?: string
}

export const newMediaPage = {
    seo: {
        title: '新传部 | 河南大学网站工作室',
        description:
            '河南大学网站工作室新传部负责新闻稿件校对审核、工作室公众号策划运营与校园内容传播。',
    },

    hero: {
        title: '新传部',
        slogan: '融媒筑窗口，笔墨著新章',
        keywords: ['新闻审核', '账号运营', '内容把关', '校园传播'],
        front: '火车划过黄昏与黎明，\n影子轻轻点在你的脸上。',
        back: '不要因为走得太远，\n就忘了当初为什么出发。',
    },

    about: {
        title: '关于新传部',
        paragraphs: [
            '新传部是投身于新闻事业的小分队，也是工作室新媒体账号运营的主平台。',
            '不需要你有多么优秀的文笔与账号运营的基础，只需要有一颗热爱新闻、愿意学习的心，我们就能通过实践工作帮助成员培养起新闻编辑能力与新媒体平台的运营思维。',
        ],
    },

    operations: {
        title: '我们的工作',
        description:
            '新传部立足校园宣传阵地，以文字记录校园生活，用新媒体技术传递网站理念，主要负责网站新闻稿件的校对审核与工作室公众号的策划运营。我们坚守内容质量关口，细致打磨内容，把控输出规范，传递河大声音，讲好校园故事。',
        items: [
            {
                label: '01',
                title: '新闻审核',
                description: '网站新闻稿件的校对审核',
            },
            {
                label: '02',
                title: '账号运营',
                description: '工作室公众号的策划运营',
            },
            {
                label: '03',
                title: '内容把关',
                description: '细致打磨内容，把控输出规范',
            },
            {
                label: '04',
                title: '校园传播',
                description: '传递河大声音，讲好校园故事',
            },
        ] satisfies NewMediaOperation[],
    },

    leaders: {
        title: '部门负责人',
        items: [
            {
                name: '张祖毓',
                grade: '24级',
                major: '新闻学',
            },
            {
                name: '魏鑫',
                grade: '25级',
                major: '编辑出版系',
                qq: '3031451699',
            },
            {
                name: '林丹芝',
                grade: '25级',
                major: '编辑出版系',
                qq: '1400236501',
            },
        ] satisfies NewMediaLeader[],
    },
} as const
