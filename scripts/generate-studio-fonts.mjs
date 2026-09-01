import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

/*
 * 字体子集生成器
 *
 * 这个脚本运行在构建前，而不是浏览器运行时。它把项目中的原始 TTF
 * 字体按照“实际使用位置”拆成若干份 woff2，并生成运行时需要的 CSS
 * 和 manifest。
 *
 * 整个流程可以概括为：
 *
 *   字体使用映射
 *       ↓
 *   每个字体使用点的独立字符集合
 *       ↓
 *   glyphhanger / fonttools 子集化
 *       ↓
 *   带内容 hash 的 woff2 文件
 *       ↓
 *   @font-face CSS + 运行时 manifest
 *
 * 这里最重要的设计约束是：不能把一个 section 的全部文字复制给该
 * section 的每一种字体。比如 Prologue 的诗歌使用 PMingLiU，而标题
 * 的某个状态使用 PangMenZhengDao，那么诗歌字符不能因此进入
 * PangMenZhengDao 的子集。
 */

// 所有输入和输出路径都以脚本所在位置为基准，而不是依赖 shell 当前目录。
// 这样在 CI 和 IDE 中执行命令时也能保持一致。
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicFontDir = join(root, 'public/font')
const wordDir = join(root, 'font/sections')
const generatedDir = join(root, 'src/data/generated')
const generatedCssPath = join(root, 'src/css/generated-studio-fonts.css')
const generatedHeaderCssPath = join(root, 'src/css/generated-header-font.css')

// 每项配置将脚本内部使用的短名称映射到：
// 1. 原始 TTF 文件；
// 2. 原字体的逻辑 family 名称；
// 3. 生成出来的 CSS alias。
//
// family 是源字体的身份记录，alias 才是运行时实际使用的 CSS family。
// 同一份源字体可能同时生成 Header、Prologue、Symphony 等多个子集，
// 因此必须让不同使用位置拥有不同 alias，避免浏览器把它们混为同一字体。
const fonts = {
    pmingliu: {
        source: 'font/臺灣新細明體.ttf',
        family: 'PMingLiU-TW',
        alias: (section) => `PMingLiU-TW-${section}`,
    },
    hkhei: {
        source: 'font/汇文港黑.ttf',
        family: 'Huiwen-HKHei',
        alias: (section) => `Huiwen-HKHei-${section}`,
    },
    pmzd: {
        source: 'font/庞门正道标题体2.0增强版.ttf',
        family: 'PangMenZhengDao',
        alias: (section) => `PangMenZhengDao-${section}`,
    },
    cwtex: {
        source: 'font/cwTeXMing.ttf',
        family: 'cwTeXMing',
        alias: (section) => `cwTeXMing-${section}`,
    },
    unifont: {
        source: 'font/Unifont.ttf',
        family: 'Unifont',
        alias: (section) => `Unifont-${section}`,
    },
}

// 重要：这里是“字体使用点映射”，不是“整个区域的文字映射”。
//
// 结构含义：
//   section
//     → 原字体短名
//       → 该字体实际要渲染的文字数组
//
// 例如：
//   Prologue.pmzd 只有标题第三态的文字；
//   Prologue.pmingliu 才包含诗歌和 PMingLiU 标题首态。
//
// 以后修改页面文案或 CSS 字体归属时，必须同步检查这里。生成器不会
// 自动推断某段文字应该使用哪种字体，因为那属于设计语义，而不是
// 字符串扫描可以可靠判断的事情。
const sections = {
    Prologue: {
        fonts: {
            pmingliu: [
                '河南大学网站工作室',
                '于是那几束开天的丝，便得寸进尺般的摇曳，反复闪动。每一次那样的闪动，天都会不可抗的，增加一丝光亮，划破一点凝固的气流。',
                '在无风的夜晚默默挠一根弦，击打着水波越过倒映的月，萦绕在池塘的轮廓边，连水痕也不曾留下过，只是悄悄地靠在月边，默默看着那静止的粼粼。',
                '在凝雾中偷偷地伸手触，将次移离的恒星。',
                '在极光间紧紧地拥抱着，淋漓无着的天明。',
            ],
            unifont: ['河南大学网站工作室'],
            pmzd: ['河南大学网站工作室'],
            cwtex: ['河南大學網站工作室'],
        },
    },
    Symphony: {
        fonts: {
            hkhei: ['办公室', '网页部', '设计部', '维修部', '新传部', '视频部'],
            pmingliu: [
                '排定每一次活动的时间与场地，让散落的计划，一件件归位成序。',
                '用代码搭起网站与系统，从零开始，一步步长成你喜欢的样子。',
                '一笔一画，反复雕琢，把理想的模样，慢慢请到纸上。',
                '上手即是实操，从第一颗螺丝开始，亲手修好你的第一台电脑。',
                '抢先一步，把新闻送到你眼前，让每一次发声，都走在时间前面。',
                '用镜头讲述校园的故事，把我们的文化，传到更远的地方。',
            ],
            pmzd: ["Let's Rock!", "此页面正在制作中…"],
        },
    },
    Epilogue: {
        fonts: {
            hkhei: ['河南大学官网', '河南大学党委办公室', '河南大学新闻网', '河大在线', 'BiliBili'],
            pmingliu: [
                '由', '制作并维护', '今日总访问量', '今日总访客数',
                '本站总访问量次', '本站总访客数人', '加载中', '河南大学网站工作室',
                'HENU Web Studio', 'All rights reserved.',
            ],
        },
    },
}

/*
 * 上面的字体分配是有意设计的：每种字体只接收实际使用它的文字。
 * 不要把它改回按整个 section 收集字符串。
 */
function charactersFrom(text) {
    // 去掉空白，因为 glyphhanger/fonttools 会处理字体所需的元数据。保留标点、
    // 拉丁字母和实际文字中的所有可见中日韩字符。
    const characters = [...text].filter((char) => !/\s/.test(char))
    return [...new Set(characters)].sort().join('')
}

function hashFile(path) {
    // 内容 hash 就是文件的缓存版本。字形数据不变时重新生成仍会保留原 URL，
    // 浏览器可以继续命中缓存；子集发生变化时会自动产生新 URL。
    return createHash('sha256').update(readFileSync(path)).digest('hex').slice(0, 8)
}

function removeGeneratedFiles() {
    // 只删除本生成器负责的文件。原始 TTF、旧全局子集和无关的 public 资源都
    // 刻意保留，不在这里处理。
    for (const name of readdirSync(publicFontDir)) {
        if (/^(pmingliu|hkhei|pmzd|cwtex|unifont)-(header|prologue|symphony|timeline|epilogue)-[0-9a-f]{8}\.woff2$/.test(name)) {
            rmSync(join(publicFontDir, name))
        }
    }
    for (const name of readdirSync(wordDir)) {
        if (/^(Header|Prologue|Symphony|Timeline|Epilogue)-[a-z]+\.txt$/.test(name)) {
            rmSync(join(wordDir, name))
        }
    }
}

// 先确保输出目录存在，再删除本脚本上一次生成的文件。
// 清理必须发生在生成之前，否则旧 hash 文件会继续留在 public/font，
// 让人误以为它们仍被当前代码使用，也可能被错误的缓存或手工引用命中。
mkdirSync(publicFontDir, { recursive: true })
mkdirSync(wordDir, { recursive: true })
mkdirSync(generatedDir, { recursive: true })
removeGeneratedFiles()

const manifest = {}
const css = [
    '/* 由 scripts/generate-studio-fonts.mjs 自动生成，请勿手动修改。 */',
]
const headerCss = [
    '/* 由 scripts/generate-studio-fonts.mjs 自动生成，请勿手动修改。 */',
]

// Header 被所有页面共享，但不是 studio 的分页区域，因此不放入 section
// manifest，也不由 studioFontPrefetch 按分页状态处理。
//
// 当前约定是只有站名使用 Huiwen，Header 中的应用中心、按钮、磁贴等
// 其他文字使用系统字体，所以 Header 的字表只包含站名。若以后 Header
// 新增了使用 Huiwen 的文字，必须同时修改 headerText。
const headerFont = fonts.hkhei
const headerText = '河南大学网站工作室'
const headerChars = charactersFrom(headerText)
const headerWordPath = join(wordDir, 'Header-hkhei.txt')
writeFileSync(headerWordPath, headerChars + '\n')
execFileSync('pnpm', [
    'exec', 'glyphhanger',
    `--whitelist=${headerChars}`,
    `--subset=${join(root, headerFont.source)}`,
    '--formats=woff2',
    `--output=${publicFontDir}`,
], { cwd: root, stdio: 'inherit' })
const headerGlyphhangerOutput = join(publicFontDir, `${headerFont.source.split('/').at(-1).replace(/\.ttf$/i, '')}-subset.woff2`)
const headerHash = hashFile(headerGlyphhangerOutput)
const headerFilename = `hkhei-header-${headerHash}.woff2`
const headerOutputPath = join(publicFontDir, headerFilename)
rmSync(headerOutputPath, { force: true })
writeFileSync(headerOutputPath, readFileSync(headerGlyphhangerOutput))
rmSync(headerGlyphhangerOutput)
headerCss.push(`@font-face {\n    font-family: 'Huiwen-HKHei-Header';\n    src: url('/font/${headerFilename}') format('woff2');\n    font-weight: normal;\n    font-style: normal;\n    font-display: swap;\n}`)

for (const [section, config] of Object.entries(sections)) {
    manifest[section] = []
    for (const [fontName, literals] of Object.entries(config.fonts)) {
        // 每个 section/font 使用点生成一份独立子集。
        //
        // 生成顺序不能简化为“先合并 section 文字，再遍历字体”，因为那样
        // 会让每个字体都得到同一份过大的字符集合。这里每次循环只处理
        // 当前 fontName 对应的 literals。
        const font = fonts[fontName]
        const chars = charactersFrom(literals.join(''))
        const wordPath = join(wordDir, `${section}-${fontName}.txt`)
        writeFileSync(wordPath, chars + '\n')

        // glyphhanger 的第一个位置参数通常是网页 URL。这里处理的是本地
        // 字符集合，因此不能把 wordPath 当作普通位置参数传入；否则工具
        // 可能把本地路径编码成 URL 并尝试通过 HTTP 访问，最终没有把预期
        // 的中文字符加入子集。
        //
        // --whitelist 接收实际字符字符串，后面的 --subset 指向源 TTF。
        execFileSync('pnpm', [
            'exec', 'glyphhanger',
            `--whitelist=${chars}`,
            `--subset=${join(root, font.source)}`,
            '--formats=woff2',
            `--output=${publicFontDir}`,
        ], { cwd: root, stdio: 'inherit' })

        const glyphhangerOutput = join(publicFontDir, `${font.source.split('/').at(-1).replace(/\.ttf$/i, '')}-subset.woff2`)
        const hash = hashFile(glyphhangerOutput)
        const filename = `${fontName}-${section.toLowerCase()}-${hash}.woff2`
        const outputPath = join(publicFontDir, filename)
        rmSync(outputPath, { force: true })
        writeFileSync(outputPath, readFileSync(glyphhangerOutput))
        rmSync(glyphhangerOutput)

        const url = `/font/${filename}`
        // sample 供 document.fonts.load 使用。它不是生成字表的来源，而是
        // 运行时触发该 alias 加载时使用的代表性文字。这里保留原 literals
        // 的合并结果，便于浏览器按正确的 family 和字符匹配字体。
        manifest[section].push({
            alias: font.alias(section),
            family: font.family,
            url,
            sample: literals.join(''),
        })
        css.push(`@font-face {\n    font-family: '${font.alias(section)}';\n    src: url('${url}') format('woff2');\n    font-weight: normal;\n    font-style: normal;\n    font-display: swap;\n}`)

        const bytes = readFileSync(outputPath).byteLength
        console.log(`${section.padEnd(9)} ${fontName.padEnd(9)} ${String(chars.length).padStart(5)} chars ${String(bytes).padStart(7)} bytes ${relative(root, outputPath)}`)
    }
}

writeFileSync(generatedCssPath, css.join('\n\n') + '\n')
writeFileSync(generatedHeaderCssPath, headerCss.join('\n\n') + '\n')
writeFileSync(
    join(generatedDir, 'studioFontManifest.ts'),
    `// 由 scripts/generate-studio-fonts.mjs 自动生成，请勿手动修改。\nexport const studioFontManifest = ${JSON.stringify(manifest, null, 4)} as const\n`,
)

console.log(`Generated ${Object.values(manifest).flat().length} studio font subsets.`)
console.log(`Generated Header font subset: ${relative(root, headerOutputPath)} (${headerChars.length} chars).`)
