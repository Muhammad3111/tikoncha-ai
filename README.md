# Yordamchi Tikoratikon - Realtime Chat

WebSocket asosida ishlagan real-time AI chat ilovasi.

## Xususiyatlar

-   ✅ WebSocket real-time ulanish
-   ✅ Ping/Pong connection monitoring
-   ✅ Message streaming (bot javoblari)
-   ✅ Markdown formatting (kod, jadval, matematik misollar)
-   ✅ Loading states (xabar va send button)
-   ✅ Responsive dizayn (mobile-first)
-   ✅ File upload support

## O'rnatish

```bash
npm install
```

## Ishga tushirish

```bash
npm run dev
```

## Konfiguratsiya

`src/config.js` faylida JWT tokenni o'zgartiring:

```javascript
export const JWT_TOKEN = "your-jwt-token-here";
```

## Texnologiyalar

-   React 18
-   Vite
-   TailwindCSS
-   WebSocket
-   React Markdown
-   KaTeX (matematik formulalar)
-   Highlight.js (kod highlighting)
