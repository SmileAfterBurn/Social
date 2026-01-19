import React from 'react';

/**
 * PublicLicense Component
 * 
 * Converting the markdown-style text into a valid React component to fix 
 * TypeScript compilation errors caused by the .tsx file extension.
 */
const PublicLicense: React.FC = () => {
  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 prose prose-slate">
      <h1 className="text-2xl font-black mb-8 text-slate-900 uppercase tracking-tight">
        ЛІЦЕНЗІЙНА УГОДА (PUBLIC LICENSE UA)
      </h1>

      <p className="text-slate-700 leading-relaxed mb-8">
        Цей програмний продукт, веб-застосунок, дизайн, база даних, програмний код, структура, тексти, алгоритми, графічні елементи та пов’язані матеріали (далі — <strong>«Продукт»</strong>) охороняються законодавством України та міжнародними договорами у сфері інтелектуальної власності.
      </p>

      <section className="mb-8">
        <h2 className="text-lg font-black mb-4 text-slate-800 uppercase tracking-wide">1. Власник прав</h2>
        <p className="mb-2"><strong>Власник та засновник Продукту:</strong></p>
        <p className="font-bold text-slate-900 mb-1">Чернов Ілля Володимирович</p>
        <p className="text-sm text-slate-600 mb-4">РНОКПП (податковий номер): <strong>3272112876</strong></p>
        <p>Усі виключні майнові та немайнові права інтелектуальної власності на Продукт належать Власнику, якщо інше прямо не зазначено в цій Ліцензії або окремих письмових угодах.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-black mb-4 text-slate-800 uppercase tracking-wide">2. Правова база</h2>
        <p className="mb-4">Ця Ліцензія укладена відповідно до:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Цивільного кодексу України (книги IV, V);</li>
          <li>Закону України «Про авторське право і суміжні права»;</li>
          <li>Закону України «Про захист від недобросовісної конкуренції»;</li>
          <li>інших нормативно-правових актів України та міжнародних договорів.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-black mb-4 text-slate-800 uppercase tracking-wide">3. Надання ліцензії</h2>
        <p className="mb-4">
          Власник надає користувачеві <strong>невиключну, відкличну, без права передачі третім особам ліцензію</strong> на використання Продукту <strong>виключно з некомерційною, соціальною або інформаційною метою</strong>, якщо інше не погоджено письмово.
        </p>
        <p className="mb-2 font-bold">Дозволяється:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>перегляд і використання функціоналу Продукту за його прямим призначенням;</li>
          <li>використання результатів роботи Продукту для особистих або соціальних потреб;</li>
          <li>посилання на Продукт із зазначенням джерела.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-black mb-4 text-slate-800 uppercase tracking-wide">4. Заборонене використання</h2>
        <p className="mb-4 font-bold text-rose-700">Категорично забороняється без письмової згоди Власника:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>копіювання, модифікація, декомпіляція, реверс-інжиніринг коду;</li>
          <li>створення похідних продуктів;</li>
          <li>комерційне використання, перепродаж або монетизація;</li>
          <li>масове збирання або експорт даних;</li>
          <li>видалення або приховування інформації про авторство;</li>
          <li>використання Продукту з метою, що порушує законодавство України.</li>
        </ul>
        <p className="mt-4">Будь-яке незаконне використання вважається <strong>порушенням прав інтелектуальної власності</strong> та тягне за собою цивільну, адміністративну або кримінальну відповідальність.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-black mb-4 text-slate-800 uppercase tracking-wide">5. Дані та база організацій</h2>
        <p className="mb-4">Інформація про організації, сервіси, прихистки та інші суб’єкти:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>формується на основі відкритих джерел, публічної інформації та аналітичної обробки;</li>
          <li>не є офіційним реєстром державних органів;</li>
          <li>надається «як є» без гарантій повноти або актуальності.</li>
        </ul>
        <p className="mt-4">Власник не несе відповідальності за дії третіх осіб, інформація про яких може бути відображена в Продукті.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-black mb-4 text-slate-800 uppercase tracking-wide">6. Права третіх сторін</h2>
        <p className="mb-4">У Продукті можуть використовуватись:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>торговельні марки, логотипи, назви організацій;</li>
          <li>API, карти, сервіси та бібліотеки третіх сторін (зокрема Google, OpenStreetMap, інші).</li>
        </ul>
        <p className="mt-4">Усі такі елементи залишаються власністю відповідних правовласників і використовуються відповідно до їхніх ліцензійних умов. Ця Ліцензія <strong>не передає жодних прав</strong> на об’єкти третіх сторін.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-black mb-4 text-slate-800 uppercase tracking-wide">7. Відповідальність і обмеження гарантій</h2>
        <p className="mb-4 font-black text-slate-900">Продукт надається «AS IS / ЯК Є».</p>
        <p className="mb-2">Власник не гарантує безперервну або безпомилкову роботу Продукту та не несе відповідальності за:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>прямі або непрямі збитки;</li>
          <li>втрату даних;</li>
          <li>рішення, прийняті на основі інформації з Продукту.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-black mb-4 text-slate-800 uppercase tracking-wide">8. Припинення дії ліцензії</h2>
        <p>У разі порушення умов цієї Ліцензії право користування Продуктом <strong>припиняється автоматично</strong>, без попереднього повідомлення.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-black mb-4 text-slate-800 uppercase tracking-wide">9. Юрисдикція</h2>
        <p>Ця Ліцензія регулюється правом України. Усі спори вирішуються відповідно до чинного законодавства України.</p>
      </section>

      <footer className="mt-12 pt-8 border-t border-slate-100 text-center text-slate-500 text-xs">
        <p><strong>© Чернов Ілля Володимирович. Усі права захищено.</strong></p>
      </footer>
    </div>
  );
};

export default PublicLicense;