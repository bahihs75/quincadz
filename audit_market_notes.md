# Market context notes

- News Tunisia article, “Why e-commerce is booming in Algeria” (2025), reports that Algeria's online retail market exceeded $1.5bn in 2024 and could surpass $2bn in 2025, citing Mezdad.com and UNCTAD. It also reports that roughly 75% of online purchases are made via smartphones, about 95% of transactions remain cash-on-delivery, internet penetration exceeded 72% by end-2023, and UNCTAD estimated B2C e-commerce at 0.8% of GDP in 2023. These figures are secondary reporting and should be framed as directional rather than audited facts.
- World Bank feature, “How Women Entrepreneurs in Algeria Are Going Digital” (2025), was opened as a second source for ecosystem context. The page did not render readable content in the sandbox browser, so no specific claim from it is used.
- Product implication: QuincaDZ should treat mobile-first UX, COD trust, delivery transparency, and merchant enablement as core product strategy rather than optional add-ons.
- No public QuincaDZ domain or stock ticker was identified in the repository; SimilarWeb and stock-analysis data are therefore not applicable without a live domain or company symbol.

Sources:
- https://news-tunisia.tunisienumerique.com/ecommerce-in-algeria-booming/
- https://www.worldbank.org/en/news/feature/2025/12/09/we-fi-feature-story-how-women-entrepreneurs-in-algeria-are-going-digital

## Runtime validation note

The public root route raised a server-side exception when local Supabase environment variables were absent, because it attempted to create a Supabase client before rendering anonymous content. The root route should tolerate missing auth configuration for local preview and render the public landing page; protected routes may still require configured Supabase credentials.

## ملاحظات إطلاق المرحلة الأولى

- موقع Yalidine الرسمي يذكر خدمات توصيل التجارة الإلكترونية، خدمة التحصيل عند الاستلام، التتبع في الوقت الحقيقي، وتغطية وطنية عبر مكاتب محلية. لذلك يجب أن يتضمن نموذج QuincaDZ منذ البداية عقد خدمة أو آلية تشغيل واضحة مع ناقل، مع حساب الرسوم، التحصيل، المرتجعات، ورقم التتبع.
- موقع الديوان الوطني للإحصائيات ONS يوفر جداول السكان حسب الولاية، لكن الصفحة المفتوحة تعرض جداول قديمة مرتبطة بـ RGPH 1998. لا ينبغي استخدام أرقام سكانية حديثة من هذه الصفحة دون تنزيل الجدول والتحقق من سنة البيانات.
- اقتراح أولي للولايات الثلاث: الجزائر، البليدة، ووهران. الجزائر والبليدة مناسبتان كعنقود افتتاحي قريب نسبياً من مركز التشغيل، بينما وهران تختبر قابلية التوسع إلى قطب غربي مستقل. يجب اعتمادها نهائياً بعد مقابلات التجار والتحقق من عروض التوصيل الفعلية.

Sources:
- https://yalidine-express.com.dz/
- https://www.ons.dz/spip.php?article15

## تشخيص شاشة تسجيل الدخول المنشورة — 22 أغسطس 2026

- الصور المرسلة تطابق النسخة المنشورة القديمة على https://quincadz.vercel.app/auth/login.
- الفحص البصري والموارد في المتصفح أظهرا أن النطاق المنشور ما زال يطلب `/logo.png` ويعرض النص الإنجليزي والأزرار البرتقالية، بينما فرع الإصلاح المحلي يستخدم `/logo.svg` والواجهة العربية ولوحة `#F5C400`.
- لم تظهر أخطاء JavaScript في console عند فتح الصفحة دون إرسال بيانات. لذلك مشكلة الشعار مؤكدة كخطأ أصل ثابت، أما `Load failed` فيحتاج إلى اختبار مصادقة فعلي أو مراجعة متغيرات Supabase المضافة في Vercel؛ الكود المحلي أصبح يلتقط أخطاء الشبكة ويعرض رسالة عربية بدلاً من ترك الحالة عالقة.
- آخر commit للفرع هو `96debc6` بعد إصلاح المصادقة والشعار، لكن النطاق العام ما زال يعرض deployment قديماً حتى وقت الفحص.
