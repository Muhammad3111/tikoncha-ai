# Foydalanish Yo'riqnomasi

## JWT Token sozlash

1. `src/config.js` faylini oching
2. `JWT_TOKEN` o'zgaruvchisiga o'z tokeningizni kiriting:

```javascript
export const JWT_TOKEN = "sizning-jwt-tokeningiz";
```

## Chat ID sozlash

`src/App.jsx` faylida `chatId` o'zgaruvchisini o'zgartiring:

```javascript
const [chatId] = useState("sizning-chat-id");
```

## Xususiyatlar

### 1. WebSocket Ulanish

-   Avtomatik ulanish JWT token bilan
-   Ping/Pong monitoring (har 30 soniyada)
-   Avtomatik qayta ulanish (5 marta urinish)

### 2. Xabar Yuborish

-   Matn xabarlari
-   Shift+Enter - yangi qator
-   Enter - yuborish
-   Xabar ostida loading spinner

### 3. Bot Javoblari (Streaming)

-   Real-time keluvchi javoblar
-   Har bir so'z alohida ko'rsatiladi
-   Send button loading spinner stream tugaguncha

### 4. Markdown Formatlash

#### Kod bloklari

\`\`\`python
def hello():
print("Hello World")
\`\`\`

#### Inline kod

`const x = 10;`

#### Matematik formulalar

LaTeX: $E = mc^2$

Blok formula:

$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$

#### Jadvallar

| Ism  | Yosh | Shahar    |
| ---- | ---- | --------- |
| Ali  | 25   | Toshkent  |
| Vali | 30   | Samarqand |

#### Ro'yxatlar

-   Element 1
-   Element 2
    -   Sub-element

1. Birinchi
2. Ikkinchi

### 5. Responsive Dizayn

-   Mobile: 85% kenglik
-   Tablet: 75% kenglik
-   Desktop: 65% kenglik
-   Textarea auto-resize (max 150px)

### 6. Loading States

**Xabar yuborilayotganda:**

-   Xabar ostida "Sending..." spinner
-   Send button loading spinner

**Bot javob berayotganda:**

-   Streaming text cursor animatsiyasi
-   Send button loading spinner

**Stream tugagach:**

-   Barcha spinnerlar o'chadi
-   Send button yana faol

## WebSocket Events

### Client -> Server

```javascript
// Xabar yuborish
{
  type: 'send_message',
  payload: {
    chat_id: 'uuid',
    type: 'TEXT',
    text: 'salom',
    attachment_url: null,
    client_msg_id: 'client_123'
  }
}

// Ping
{
  type: 'ping',
  payload: {}
}
```

### Server -> Client

```javascript
// Pong
{ type: 'pong' }

// Xabar yaratildi
{
  type: 'message_created',
  data: { message: {...} }
}

// Streaming (bot)
{
  type: 'message_stream',
  data: { delta: 'salom' }
}

// Xato
{
  type: 'error',
  error: 'xato matni'
}
```

## Muammolarni Hal Qilish

### "Please set your JWT token" xatosi

-   `src/config.js` da JWT_TOKEN ni to'g'ri kiriting

### WebSocket ulanmayapti

-   Internet ulanishini tekshiring
-   JWT token amal qilish muddatini tekshiring
-   Browser console da xatolarni ko'ring

### Xabarlar ko'rinmayapti

-   Chat ID to'g'riligini tekshiring
-   WebSocket ulanganligini tekshiring (header da yashil nuqta)

## Texnik Ma'lumotlar

**Stack:**

-   React 18
-   Vite
-   TailwindCSS
-   WebSocket (native)
-   React Markdown
-   KaTeX (math)
-   Highlight.js (code)

**Portlar:**

-   Development: http://localhost:3000
-   WebSocket: wss://api.tikoncha.uz/chat/ws

**Browser Support:**

-   Chrome/Edge: ✅
-   Firefox: ✅
-   Safari: ✅
-   Mobile browsers: ✅
