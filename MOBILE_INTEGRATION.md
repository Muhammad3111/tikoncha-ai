# Mobile App Integration Guide

Bu chatbot web view sifatida mobile ilovada ishlatilishi uchun mo'ljallangan.

## Mobile appdan yuborilishi kerak bo'lgan ma'lumotlar

### PostMessage orqali (asosiy usul)

Mobile app WebView ga quyidagi formatda xabar yuborishi mumkin:

```javascript
// React Native WebView
webViewRef.current.postMessage(
    JSON.stringify({
        type: "init",
        token: "Bearer YOUR_TOKEN",
        chatId: "chat-id-here",
        chatTitle: "Chat Title",
        theme: "dark",
        fontSize: 14,
    })
);
```

**Yoki alohida-alohida:**

```javascript
// Token yuborish
webViewRef.current.postMessage(
    JSON.stringify({
        token: "Bearer YOUR_TOKEN",
    })
);

// Theme o'zgartirish
webViewRef.current.postMessage(
    JSON.stringify({
        theme: "light",
    })
);

// Font size o'zgartirish
webViewRef.current.postMessage(
    JSON.stringify({
        fontSize: 16,
    })
);
```

## WebView dan Mobile App ga xabarlar

WebView tayyor bo'lganda quyidagi xabarni yuboradi:

```javascript
{
    type: 'ready',
    message: 'WebView is ready'
}
```

## React Native WebView misoli

```jsx
import React, { useRef, useEffect } from "react";
import { WebView } from "react-native-webview";

const ChatWebView = ({ token, chatId, chatTitle, theme, fontSize }) => {
    const webViewRef = useRef(null);

    useEffect(() => {
        // WebView tayyor bo'lganda ma'lumotlarni yuborish
        if (webViewRef.current) {
            webViewRef.current.postMessage(
                JSON.stringify({
                    type: "init",
                    token: `Bearer ${token}`,
                    chatId: chatId,
                    chatTitle: chatTitle,
                    theme: theme,
                    fontSize: fontSize,
                })
            );
        }
    }, [token, chatId, chatTitle, theme, fontSize]);

    const handleMessage = (event) => {
        const data = JSON.parse(event.nativeEvent.data);

        if (data.type === "ready") {
            // Ma'lumotlarni yuborish
            webViewRef.current.postMessage(
                JSON.stringify({
                    type: "init",
                    token: `Bearer ${token}`,
                    chatId: chatId,
                    chatTitle: chatTitle,
                    theme: theme,
                    fontSize: fontSize,
                })
            );
        }
    };

    return (
        <WebView
            ref={webViewRef}
            source={{ uri: "https://your-domain.com" }}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
        />
    );
};

export default ChatWebView;
```

## Android Kotlin WebView misoli

### 1. Activity yoki Fragment

```kotlin
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.JavascriptInterface
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONObject

class ChatActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private var token: String = ""
    private var chatId: String = ""
    private var chatTitle: String = ""
    private var theme: String = "dark"
    private var fontSize: Int = 14

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat)

        // Intent dan ma'lumotlarni olish
        token = intent.getStringExtra("token") ?: ""
        chatId = intent.getStringExtra("chatId") ?: ""
        chatTitle = intent.getStringExtra("chatTitle") ?: "Chat"
        theme = intent.getStringExtra("theme") ?: "dark"
        fontSize = intent.getIntExtra("fontSize", 14)

        setupWebView()
    }

    private fun setupWebView() {
        webView = findViewById(R.id.webView)

        // WebView sozlamalari
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            loadWithOverviewMode = true
            useWideViewPort = true
        }

        // JavaScript interface qo'shish
        webView.addJavascriptInterface(WebAppInterface(), "ReactNativeWebView")

        // WebView client
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                // Sahifa yuklangandan keyin ma'lumotlarni yuborish
                sendDataToWebView()
            }
        }

        // WebView ni yuklash
        webView.loadUrl("https://your-domain.com")
    }

    private fun sendDataToWebView() {
        val jsonData = JSONObject().apply {
            put("type", "init")
            put("token", "Bearer $token")
            put("chatId", chatId)
            put("chatTitle", chatTitle)
            put("theme", theme)
            put("fontSize", fontSize)
        }

        val jsCode = """
            window.postMessage(${jsonData}, '*');
        """.trimIndent()

        webView.evaluateJavascript(jsCode, null)
    }

    // WebView dan xabarlarni qabul qilish uchun interface
    inner class WebAppInterface {
        @JavascriptInterface
        fun postMessage(message: String) {
            runOnUiThread {
                try {
                    val json = JSONObject(message)
                    val type = json.optString("type")

                    when (type) {
                        "ready" -> {
                            // WebView tayyor bo'lganda ma'lumotlarni yuborish
                            sendDataToWebView()
                        }
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
```

### 2. Layout fayli (activity_chat.xml)

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <WebView
        android:id="@+id/webView"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

### 3. AndroidManifest.xml ga ruxsat qo'shish

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

### 4. Activity ni ishga tushirish

```kotlin
val intent = Intent(this, ChatActivity::class.java).apply {
    putExtra("token", "your-jwt-token")
    putExtra("chatId", "chat-id-here")
    putExtra("chatTitle", "Chat Title")
    putExtra("theme", "dark")
    putExtra("fontSize", 14)
}
startActivity(intent)
```

## Flutter WebView misoli

```dart
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'dart:convert';

class ChatWebView extends StatefulWidget {
  final String token;
  final String chatId;
  final String chatTitle;
  final String theme;
  final int fontSize;

  const ChatWebView({
    required this.token,
    required this.chatId,
    required this.chatTitle,
    this.theme = 'dark',
    this.fontSize = 14,
  });

  @override
  _ChatWebViewState createState() => _ChatWebViewState();
}

class _ChatWebViewState extends State<ChatWebView> {
  late WebViewController _controller;

  @override
  Widget build(BuildContext context) {
    return WebView(
      initialUrl: 'https://your-domain.com',
      javascriptMode: JavascriptMode.unrestricted,
      onWebViewCreated: (WebViewController controller) {
        _controller = controller;
      },
      onPageFinished: (String url) {
        // WebView yuklanganda ma'lumotlarni yuborish
        final initData = jsonEncode({
          'type': 'init',
          'token': 'Bearer ${widget.token}',
          'chatId': widget.chatId,
          'chatTitle': widget.chatTitle,
          'theme': widget.theme,
          'fontSize': widget.fontSize,
        });

        _controller.runJavascript(
          "window.postMessage($initData, '*');"
        );
      },
      javascriptChannels: {
        JavascriptChannel(
          name: 'ReactNativeWebView',
          onMessageReceived: (JavascriptMessage message) {
            final data = jsonDecode(message.message);
            if (data['type'] == 'ready') {
              print('WebView is ready');
            }
          },
        ),
      },
    );
  }
}
```

## Test qilish (Web browserda)

Web browserda test qilish uchun browser console da:

```javascript
// Barcha ma'lumotlarni yuborish
window.postMessage(
    {
        type: "init",
        token: "Bearer YOUR_TOKEN",
        chatId: "test-chat-id",
        chatTitle: "Test Chat",
        theme: "dark",
        fontSize: 14,
    },
    "*"
);

// Yoki alohida-alohida:

// Theme o'zgartirish
window.postMessage({ theme: "light" }, "*");

// Font size o'zgartirish
window.postMessage({ fontSize: 16 }, "*");
```
