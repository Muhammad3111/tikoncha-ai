# Build va Deploy qo'llanmasi

## 🏗️ Production build qilish

### 1. Dependencies o'rnatish

```bash
npm install
```

### 2. Build qilish

```bash
npm run build
```

Bu `dist` papkasini yaratadi - barcha optimizatsiya qilingan fayllar shu yerda bo'ladi.

### 3. Build natijasini tekshirish

```bash
npm run preview
```

Bu local serverda build qilingan versiyani ko'rsatadi.

## 📦 Build natijasi

Build qilingandan keyin `dist` papkasida quyidagi fayllar bo'ladi:

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
└── [other files]
```

## 🚀 Deploy qilish

### Nginx bilan deploy

1. **Nginx o'rnatish** (agar o'rnatilmagan bo'lsa)

```bash
sudo apt update
sudo apt install nginx
```

2. **Build fayllarini server ga ko'chirish**

```bash
# Local mashinada
scp -r dist/* user@your-server:/var/www/chatbot/
```

3. **Nginx konfiguratsiyasi**

`/etc/nginx/sites-available/chatbot` faylini yarating:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/chatbot;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;

        # CORS headers (agar kerak bo'lsa)
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

4. **Nginx ni qayta yuklash**

```bash
sudo ln -s /etc/nginx/sites-available/chatbot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL (HTTPS) qo'shish

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🔧 Environment o'zgaruvchilari

Agar turli muhitlar uchun turli sozlamalar kerak bo'lsa, `.env` fayllaridan foydalaning:

### `.env.production`

```env
VITE_WS_URL=wss://api.tikoncha.uz/chat/ws
VITE_API_URL=https://api.tikoncha.uz
```

### `vite.config.js` da ishlatish

```javascript
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [react()],
        define: {
            "process.env.VITE_WS_URL": JSON.stringify(env.VITE_WS_URL),
            "process.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL),
        },
    };
});
```

## 📱 Android app bilan integratsiya

Build qilingandan keyin, Android app quyidagi URL ni yuklashi kerak:

```
https://your-domain.com
```

**Muhim:** URL parametrlar kerak emas! Barcha ma'lumotlar postMessage orqali yuboriladi.

### Android app dan test qilish

1. Build qilingan saytni browserda oching
2. Browser console da quyidagi kodni bajaring:

```javascript
window.postMessage(
    {
        type: "init",
        token: "Bearer YOUR_TEST_TOKEN",
        chatId: "test-chat-id",
        chatTitle: "Test Chat",
        theme: "dark",
        fontSize: 14,
    },
    "*"
);
```

Agar hammasi to'g'ri ishlasa, chat ochilishi kerak.

## 🐛 Debug qilish

### Console loglarni tekshirish

Build qilingan versiyada ham console loglar ishlaydi:

```javascript
// AppContext dan

// useWebSocket dan
```

### Agar ma'lumotlar kelmasa

2 soniya ichida ma'lumotlar kelmasa, quyidagi xabar ko'rinadi:

```
⚠️ Ready timeout reached without receiving data from mobile app
```

Va loading ekrani quyidagi xabarni ko'rsatadi:

```
Token kutilmoqda
Chat ID kutilmoqda
```

## 📊 Build hajmini kichraytirish

### 1. Vite konfiguratsiyasida optimizatsiya

`vite.config.js`:

```javascript
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    "react-vendor": ["react", "react-dom"],
                    markdown: [
                        "react-markdown",
                        "remark-gfm",
                        "rehype-highlight",
                    ],
                },
            },
        },
        minify: "terser",
        terserOptions: {
            compress: {
                drop_console: true, // Console loglarni olib tashlash
            },
        },
    },
});
```

### 2. Lazy loading

Katta komponentlarni lazy load qilish:

```javascript
const MarkdownRenderer = lazy(() => import("./components/MarkdownRenderer"));
```

## ✅ Checklist

Deploy qilishdan oldin:

-   [ ] `npm run build` muvaffaqiyatli ishladi
-   [ ] `npm run preview` da test qilindi
-   [ ] Browser console da xatolar yo'q
-   [ ] Mobile app dan postMessage test qilindi
-   [ ] WebSocket ulanishi ishlayapti
-   [ ] Theme (dark/light) to'g'ri ishlayapti
-   [ ] Font size o'zgarishi ishlayapti
-   [ ] Message yuborish va qabul qilish ishlayapti

## 🎉 Tayyor!

Build qilingan `dist` papkasini serverga joylashtiring va Android app dan test qiling!
