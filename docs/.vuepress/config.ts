import { defineUserConfig } from 'vuepress'
import type { DefaultThemeOptions } from 'vuepress'

export default defineUserConfig<DefaultThemeOptions>({
    // 站点配置
    lang: 'zh-CN',
    title: '大地',
    description: '大地的个人博客',
    base: '/',
    head: [
        ['link', { rel: 'icon' }],
        ['meta', { name: 'description', content: '前端学习, frontend learning, 教程,  Vue, React, JavaScript, Node, 博客' }],
        ['meta', { name: 'keywords', content: 'sdf' }],
        ['meta', { name: 'author', content: '大地' }],
        ['meta', { chartset: 'UTF-8' }],
        ['meta', { name: "viewport", content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" }]
    ],

    theme: '@vuepress/theme-default',
    themeConfig: {
        navbar: require('./nav'),
        sidebar: require('./sidebar'),
        lastUpdated: true
    }
})