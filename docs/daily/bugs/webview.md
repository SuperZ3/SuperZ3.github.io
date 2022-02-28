# 前端配置 webview 调试

> 配置简单的 android webview 代码，在 android studio 内调试页面，降低与客户端同学沟通成本。

1. [官网](https://developer.android.com/guide/webapps/webview) 下载 android studio，并使用 kotlin 初始项目

2. 在 /MyFirstApp/app/src/main/AndroidManifest.xml 文件下，添加如下代码
`<uses-permission android:name="android.permission.INTERNET" />`

3. 在 activity_main.xml 下添加
```kotlin
<WebView
    android:id="@+id/webview"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
/>
```

4. 在 MainActivity.kt 文件下添加初始化 webview 类代码 `package com.example.myfirstapp`

```kotlin
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        val myWebView: WebView = findViewById(R.id.webview)
        myWebView.loadUrl(“webview-url")
        myWebView.getSettings().setJavaScriptEnabled(true);
        myWebView.getSettings().setAllowContentAccess(true);
        myWebView.getSettings().setLoadWithOverviewMode(true);
        myWebView.getSettings().setUseWideViewPort(true);
        myWebView.getSettings().setDomStorageEnabled(true)
    }
}
```

以上是简单的 webview 配置，可显示页面，但没有配置与 js 通信功能，可按官网自行配置。

实际客户端页面，可能会在 `<WebView/>` 外边套 `<view/>` 或 `<scroll-view/>` 等，从而导致一些其它的显示问题：

+ 滚动问题：在采用 Swiperjs 实现内容超出滚动的效果时，会给一个定高的父元素，通过计算每个子元素高度来计算每次轮播子元素走的距离，这在手机网页内是可行的，但是当 android 使用 `<scroll-view/>` 展示页面时，由于无法计算我们给的父元素高度，所以滚动效果会不生效。这时可以考虑两种办法：
    - CSS 变量接收 Android 获取的视口高度，通过 JSBridge 传递给我们
    - 将滚动改为平铺

对于这些问题，可按照官网修改上面代码，以简单模仿客户端的实现。