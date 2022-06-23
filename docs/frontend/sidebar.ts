module.exports = [
    {
        text: 'JavaScript 基础',
        collapsible: false,
        sidebarDepth: 1,
        children: [
            './promise.md',
            './generator.md',
            './prototype.md',
            './fetch.md',
            './test.md',
            './practicejs.md',
        ]
    },
    {
        text: 'Vue 3',
        collapsible: false,
        sidebarDepth: 1,
        children: [
            './reactive.md',
            './create.md',
        ]
    },
    {
        text: 'CSS',
        collapsible: false,
        sidebarDepth: 1,
        children: [
            './sass.md',
        ]
    },
    {
        text: '打包工具',
        collapsible: false,
        sidebarDepth: 1,
        children: [
            './webpack.md',
        ]
    },
    {
        text: '浏览器',
        collapsible: false,
        sidebarDepth: 1,
        children: [
            './runjs.md',
            './eventloop_b.md',
            './net.md',
            './cache.md'
        ]
    },
    {
        text: 'Node',
        collapsible: false,
        sidebarDepth: 1,
        children: [
            './eventloop_n.md',
            './module.md',
            './event.md',
            './stream.md',
            './koa.md',
        ]
    }
]