# Vercel — підключення домену та деплой

Цей файл показує кроки підключення домену до Vercel (корисно при використанні платного акаунту Vercel).

## 1) Додавання домену в Vercel
1. Увійдіть у Vercel Dashboard → виберіть потрібний проект → Settings → Domains → Add.
2. Додайте домен: `соціальна-мапа-турботи.in.ua` (або punycode: `xn-----6kcabai0duamijkkre2adp2c4htj.in.ua`).
3. Vercel покаже потрібні DNS-записи (зазвичай A для apex і CNAME для subdomain). Скопіюйте їх.

## 2) Типові DNS-записи для Vercel (приклад)
(Перед застосуванням **завжди** використовуйте записи, які згенерував ваш Vercel Dashboard)

```
# приклад Vercel — для apex + www + wildcard
@   IN  A       76.76.21.21
www IN  CNAME   cname.vercel-dns.com.
*   IN  CNAME   cname.vercel-dns.com.   ; опціонально (wildcard)
@   IN  TXT     "v=spf1 include:_spf.ukraine.com.ua ~all"  ; збережіть існуючий SPF
```

- Зазвичай Vercel використовує A-record `76.76.21.21` для apex і `cname.vercel-dns.com` для CNAME.
- Якщо ваш реєстратор підтримує ALIAS/ANAME для apex → можна напряму вказати `cname.vercel-dns.com` через ALIAS.

## 3) Перевірка і SSL
- Після додавання записів у реєстратор дочекайтесь, поки Vercel підтвердить їх у Dashboard (стація `Verified`).
- Vercel автоматично випустить SSL сертифікат (Let's Encrypt) після верифікації.

## 4) Автоматичний деплой
- Рекомендація: підключити GitHub репозиторій у Vercel (Git Integration). Vercel буде автоматично деплоїти при пуші у гілку (наприклад, `main` або `production`).
- Альтернатива: використовувати GitHub Action з VERCEL_TOKEN (згенерувати в Vercel → Account → Tokens) і додати як GitHub Secret.

## 5) Приклад GitHub Action (шаблон)
- Додайте Secret `VERCEL_TOKEN` у Settings → Secrets.
- Приклад workflow (див. `.github/workflows/deploy-vercel.yml` в репозиторії):

```yaml
name: CI / Build and Deploy (Vercel)

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          npx vercel --prod --token "$VERCEL_TOKEN" --confirm
```

## 6) Перевірки (корисні команди)
- `dig +short A соціальна-мапа-турботи.in.ua`
- `dig +short CNAME www.соціальна-мапа-турботи.in.ua`
- `dig +short TXT соціальна-мапа-турботи.in.ua`
- `curl -I https://соціальна-мапа-турботи.in.ua` — перевірка заголовків і SSL

---

Якщо хочете, я можу:
- згенерувати файл із готовими записами для вставки в панель реєстратора (A), або
- самостійно внести записи (потрібен тимчасовий доступ), або
- допомогти підключити репозиторій у Vercel і налаштувати Secrets для автоматичного деплою.
