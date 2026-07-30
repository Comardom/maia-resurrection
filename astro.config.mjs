// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
    //告诉 Astro 用 SSR 模式，每次请求在服务端渲染 HTML。如果不设，默认是 static
    output: 'server',
    // 默认 Astro dev 只监听 localhost（127.0.0.1），只有本机能访问。
    // 设成 true 后，局域网内其他设备（手机测试、同事电脑）也能通过你的 IP 访问开发服务器。
    server: {
        host: true,
        port: 4321,
    },
    //adapter指的是使用SSR，node()指的是生成node代码
    // standalone模式指的是用Node.js内置的http模块，不需要Express或其他框架，entry.mjs 启动时自动监听端口
    adapter: node({ mode: 'standalone' }),
    //注册 Vue 集成，这样 .vue 文件才能在 Astro 中被识别和编译
    integrations: [
        vue()
    ],
    //设置vite行为
    vite: {
        plugins: [
            //暂时还没有vite插件
        ],
        server: {
            fs: {
                //禁止访问项目目录之外的文件
                strict: true,
                //显式允许 src/，是默认配置
                allow: ['src/', 'node_modules/']
            }
        },
        resolve: {
            //设置 @ 为 /src 的别名
            alias: { '@': '/src' },
        },
    },
});
