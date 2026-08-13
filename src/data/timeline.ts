export interface TimelineEvent {
    year: string
    title: string
    description: string
    /** 封面图（可选）：放 public/ 下的路径；dark 为深色模式版本（无则用 src） */
    image?: {
        src: string
        alt: string
        dark?: string
    }
    /** 外链（可选）：Web Archive 存档 / 源码 / 相关资料 */
    links?: {
        label: string
        href: string
    }[]
}

export const timelineEvents: TimelineEvent[] = [
    {
        year: '2001',
        title: '网站工作室成立',
        description:
            '河南大学网站工作室成立，开始搭建学校网络宣传与信息化平台。2001 年至 2007 年上半年，网页的重构与更新维护均以河南大学宣传部名义进行。',
    },
    {
        year: '2002',
        title: '制作校主页与新闻网',
        description: '负责设计和制作河南大学主页、新闻网等一系列官方网站，并进行后续改版，填补学校网络建设空白。',
        image: {
            src: '/studio-history/2016-河南大学.webp',
            alt: '河南大学官网截图（2016 年）',
        },
    },
    {
        year: '2003',
        title: '《校园文化网》上线',
        description: '《校园文化网》制作完毕，以展现校园生活与学生风采为主，偏文学性质。',
    },
    {
        year: '2004',
        title: 'CUBA 西北赛区拍摄报道',
        description: '负责第六届 CUBA 西北赛区的比赛拍摄与网络新闻报道工作。',
        image: {
            src: '/studio-history/2004-第六届CUBA西北赛区.webp',
            alt: '第六届 CUBA 西北赛区报道截图',
        },
        links: [
            { label: 'CUBA 赛事报道', href: 'https://news.henu.edu.cn/info/1083/82000.htm' },
        ],
    },
    {
        year: '2005',
        title: '首部 DV 剧策划与制作',
        description:
            '由党委宣传部支持，网站工作室成员组织、策划、拍摄、剪辑、合成河南大学首部 DV 剧《一刹那的灿烂碰撞》。筹备至完成历时半年，原素材 700 分钟，成品约 100 分钟，后期制作长达两个月。',
        image: {
            src: '/studio-history/2005-一刹那的灿烂碰撞.webp',
            alt: '《一刹那的灿烂碰撞》宣传图',
        },
        links: [
            { label: 'DV 剧新闻报道', href: 'https://news.henu.edu.cn/info/1005/46886.htm' },
        ],
    },
    {
        year: '2005',
        title: 'DV 剧校内公映',
        description:
            '《一刹那的灿烂碰撞》在校内多个校区公映，观众逾万人次，反响强烈。',
        image: {
            src: '/studio-history/2005-一刹那的灿烂碰撞-新浪微博.webp',
            alt: '《一刹那的灿烂碰撞》新浪微博报道截图',
        },
        links: [
            { label: 'DV 剧视频', href: 'https://video.sina.com.cn/dv/2005-08-31/143710442.html' },
        ],
    },
    {
        year: '2007',
        title: '网站工作室名义登上主页',
        description:
            '2007 年 8 月起，网站工作室名义正式登上河南大学主页，此前的重构与维护均以宣传部名义进行；同年网站工作室 logo 首次出现。',
        image: {
            src: '/studio-history/weblogo.webp',
            alt: '2007 年首次出现的网站工作室 logo',
        },
    },
    {
        year: '2007',
        title: '《校园文化网》全面改版',
        description: '对《校园文化网》进行全面改版，定位为高校门户，为后续过渡至"河大在线"做准备。',
        image: {
            src: '/studio-history/2007-校园文化网改版公告.webp',
            alt: '校园文化网改版完成公告截图',
        },
        links: [
            { label: '改版完成通知', href: 'https://w2022.henu.edu.cn/info/1009/45949.htm' },
        ],
    },
    {
        year: '2008',
        title: '《河大在线》上线',
        description: '《河大在线》正式上线，理念与技术都有显著飞跃。',
        image: {
            src: '/studio-history/2008-河大在线.webp',
            alt: '河大在线网站截图',
        },
        links: [
            { label: '河大在线', href: 'https://i.henu.edu.cn/index.htm' },
        ],
    },
    {
        year: '2009',
        title: '新闻网网站',
        description: '制作新闻网网站。',
        image: {
            src: '/studio-history/2009-新闻网.webp',
            alt: '新闻网网站（2022版本）截图',
        },
        links: [
            { label: '新闻网', href: 'https://news.henu.edu.cn/?ID=www.i-n.cc' },
        ],
    },
    {
        year: '2010',
        title: '历史文化学院网站',
        description: '制作历史文化学院网站。',
        image: {
            src: '/studio-history/2010-历史文化学院.webp',
            alt: '历史文化学院网站历史截图',
        },
        links: [
            { label: '历史文化学院官网', href: 'https://lsxy.henu.edu.cn/' },
        ],
    },
    {
        year: '2010',
        title: '电子杂志《Share》创刊',
        description: '2010 年 4 月 21 日创刊，从 3 月 17 日首次策划到最终完成历时两个月，含"触角""浓墨重彩""事儿""shining u""玩味无限"五大板块，填补我校校园电子杂志空白。',
        image: {
            src: '/studio-history/2010-Share.webp',
            alt: 'Share创刊报道截图',
        },
        links: [
            { label: '创刊报道', href: 'https://news.henu.edu.cn/info/1083/79012.htm' },
        ],
    },
    {
        year: '2012',
        title: '化学化工学院网站',
        description: '制作化学院网站。',
        image: {
            src: '/studio-history/2012-化学化工学院.webp',
            alt: '化学院网站历史截图',
        },
        links: [
            { label: '化学与分子科学学院官网', href: 'https://ccce.henu.edu.cn/' },
        ],
    },
    {
        year: '2014',
        title: '多酸化学研究中心网站',
        description: '制作多酸化学研究中心网站。',
        image: {
            src: '/studio-history/2014-多酸化学.webp',
            alt: '多酸化学网站历史截图',
        },
        links: [
            { label: '河南省多酸制备与应用重点实验室', href: 'https://pom.henu.edu.cn/' },
            { label: '实验室简介', href: 'https://pom.henu.edu.cn/index_2025/sysgk_new/sysjj.htm' },
        ],
    },
    {
        year: '2015',
        title: '纳米材料工程研究中心网站',
        description: '制作纳米材料工程研究中心网站。',
        image: {
            src: '/studio-history/2015-纳米中心.webp',
            alt: '纳米材料工程研究中心网站历史截图',
        },
        links: [
            { label: '纳米科学与工程研究院', href: 'https://ercn.henu.edu.cn/index.htm' },
        ],
    },
    {
        year: '2018',
        title: '开封北大培文网站',
        description: '为开封北大培文制作网站。',
        image: {
            src: '/studio-history/2018-开封北大培文.webp',
            alt: '开封北大培文网站历史截图',
        },
    },
    {
        year: '2018',
        title: '河南大学官网新版',
        description: '河南大学官网新版上线。',
        image: {
            src: '/studio-history/2018-河南大学官网.webp',
            alt: '河南大学官网新版历史截图',
        },
    },
    {
        year: '2018',
        title: '音乐学院网站上线',
        description: '制作河南大学音乐学院官网。',
        image: {
            src: '/studio-history/2018-音乐学院.webp',
            alt: '音乐学院截图',
        },
        links: [
            { label: '音乐学院官网', href: 'https://cm.henu.edu.cn/' },
        ],
    },
    {
        year: '2025',
        title: '网站工作室全新网站上线',
        description: '崭新的工作室与部门网页，即将迎来的论坛，都在指引着更好的未来。',
        image: {
            src: '/studio-history/2025-工作室-black.webp',
            dark: '/studio-history/2025-工作室-white.webp',
            alt: '网站工作室全新网站宣传图',
        },
    },
    {
        year: '2026',
        title: '低空学院网站上线',
        description: '河南大学低空学院网站上线。',
        image: {
            src: '/studio-history/2026-低空学院.webp',
            alt: '低空学院官网截图',
        },
        links: [
            { label: '低空学院', href: 'https://latai.henu.edu.cn/' },
        ],
    },
    {
        year: '2026',
        title: '工作室管理系统上线',
        description: '工作室管理系统正式上线，工作室管理走向规范化。',
        image: {
            src: '/studio-history/2026-工作室管理.webp',
            alt: '管理界面截图',
        },
        links: [
            { label: '工作室管理系统', href: 'https://erp.xn--2qqp2vw2b55cnt3a7mt1eh.cn/' },
        ],
    },
]
