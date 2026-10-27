# Hebrew Support Implementation Plan — תמיכה בעברית ב־Pointsy

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** לאפשר למשפחות להשתמש בכל מסכי Pointsy בעברית טבעית ובממשק RTL מלא, לצד האנגלית הקיימת.

**Architecture:** מילונים טיפוסיים משותפים לשרת וללקוח, פתרון שפה לכל בקשה וספק שפה לרכיבי לקוח. בחירת השפה נשמרת בעוגיית מכשיר, ללא קידומות לכתובות וללא שינוי בהרשאות; שפת התראות Push נשמרת בנפרד לכל מנוי.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, CSS Modules, Intl, Zod, Drizzle/PostgreSQL, Serwist, Vitest/PGlite, Playwright/axe. ההצעה אינה מוסיפה ספריית i18n.

**Spec:** דרישת המשתמש מ־2026-10-27 להוספת עברית, UI מתאים ותרגום; החלטות המוצר המוצעות מפורטות במסמך זה. יש לקרוא גם את [SPEC.md](../../../SPEC.md), [AGENTS.md](../../../AGENTS.md) ואת [הנחיות הנגישות](../../accessibility.md). המסמך מרחיב את הסעיף שבו i18n הוגדר כמועמד עתידי.

**Status:** תוכנית מוצעת לסקירה. PR זה מוסיף רק את הקובץ הזה; הוא אינו מממש תמיכה בעברית. החלטות המסומנות כהצעה אינן החלטות שהמשתמש כבר אישר.

## Global Constraints

- Node 22.x; בניית Production נשארת `next build --webpack` דרך `npm run build`; משמרים את שלב המיגרציות ב־`vercel.json`.
- CSS Modules וטוקנים קיימים, סמלי lucide-react, עיצוב Emerald Noir כהה בלבד.
- WCAG 2.1 AA, יעדי לחיצה של לפחות 44px, ניגודיות טקסט רגיל 4.5:1, כיבוד reduced motion.
- גישה למסד בשרת בלבד; משפחה והרשאות נגזרות מה־session. שפה אינה מקור זהות או הרשאה.
- אין שינוי בחישוב נקודות, יתרות שליליות, ledger append-only, שמירת snapshots או אישור פרסים.
- ממשיכים לאכוף תפקיד גם ב־proxy וגם בעמוד; שומרים את התנהגות הבית למכשיר מוכר ול־session בלי עוגיית משפחה.
- טקסט חופשי, שמות משתמשים, משימות ופרסים שכבר נשמרו לא מתורגמים אוטומטית ולא נכתבים מחדש.
- לפני מימוש יש להתקין את גרסאות הריפו ולקרוא את מדריכי Next המקומיים ב־`node_modules/next/dist/docs/`, בפרט cookies, caching ו־metadata; אין להניח APIs לפי גרסה קודמת.

## Review Focus

1. החלפת שפה בזמן שטופס פתוח: אין איבוד נתונים בשקט; משימה 2 בודקת את מדיניות היציאה.
2. עברית עם אימייל, שם באנגלית ויתרה שלילית: בידוד bidi שומר על הסדר ועל סימן המינוס; משימות 1 ו־4.
3. אותו משתמש בשני מכשירים בשפות שונות: כל מנוי Push מקבל את שפת המכשיר שלו; משימה 6.
4. שפה אינה אזור זמן או הגדרת שבוע: אותה פעולה נשארת באותו חלון זכאות ובאותה יתרה בשתי השפות; משימה 1.
5. פתיחת PWA לאחר החלפת פרופיל או שפה: אין HTML/RSC אישי שמוגש ממטמון; משימות 6 ו־7.

## מצב קיים שנבדק

- `app/layout.tsx` מקבע `lang="en"`, טוען Inter/Sora עם latin בלבד, ומכיל metadata באנגלית.
- אין שכבת תרגום מרכזית. מחרוזות נמצאות בעמודים, ב־`components/**`, ב־`app/actions/**` ובסכמות אימות.
- `components/auth/PinPad.tsx` כולל טקסט לקורא מסך באנגלית. `BottomNav.tsx` כולל גם תווית ניווט ברירת מחדל באנגלית.
- `lib/validation/form.ts` ו־`app/actions/auth.ts` מחזירים הודעות טקסט ולא מזהי שגיאה יציבים.
- `lib/timezone.ts` משתמש ב־Intl גם למפתחות תאריכים ולחישובי זמן עסקיים. אין להחליף שם locale באופן גורף.
- `lib/categories/service.ts` יוצר קטגוריות ברירת מחדל בהרשמה; זו כתיבת נתונים, לא רק תצוגה.
- `lib/push/service.ts` אינו שומר locale במנוי; `app/sw.ts` מציג את טקסט ה־payload כפי שהגיע.
- ה־service worker מונע מטמון same-origin של HTML/RSC/API. שומרים זאת גם לאחר הוספת עברית.
- `proxy.ts` מסתמך על כתובות קיימות כדוגמת `/dashboard` ו־`/me`. אין צורך לפרק את האבטחה לצורך תרגום.

## היקף והחלטות מוצעות

### בחירת שפה

- תומכים ב־`en` ו־`he`; תצוגה דרך `en-US` ו־`he-IL`.
- סדר בחירה: עוגייה תקינה `pointsy_locale` → התאמה משוקללת של `Accept-Language` → אנגלית. מזהים גם תגיות אזוריות ואת הכינוי הוותיק `iw`; ערך לא נתמך בעוגייה אינו עוקף שפת דפדפן נתמכת.
- בוחר שפה מציג `עברית` ו־`English`, ללא דגלי מדינות, וזמין לפני ואחרי התחברות וגם במסכי הילדים.
- העדפה היא למכשיר משותף, נשמרת לאחר יציאה והחלפת פרופיל, ואינה מסתנכרנת למכשיר אחר. אין בשלב זה העדפה לחשבון/משפחה.
- אותה כתובת תעבוד בשתי השפות. לא מוסיפים `/he` ולא `/en`.
- החלפה מחילה גם SSR וגם client באותה שפה. בטעינה הראשונה אין הבהוב אנגלית/RTL ואין hydration mismatch.
- אם יש טופס עם שינויים שלא נשמרו, מציגים אישור מקומי מתורגם לפני רענון. ביטול שומר טופס ושפה; אישור מסביר שהטיוטה תימחק. רענון מתבצע רק לאחר אישור.

### תרגום וחוויית שימוש

- תרגום מלא של כניסה והרשמה, בורר פרופילים, PIN, לוח הורה, הענקת/הפחתת נקודות, קטלוגים, ילדים והורים, קטגוריות, אתגרים, הגדרות משפחה, מחיקה וייצוא, מסכי ילד, בקשות משימות, מימוש ושיתוף פרסים.
- כולל loading/empty/error/success, טולטיפים, placeholders, אישורים, aria-label, קורא מסך, הודעות PWA ו־Push.
- כולל דפי השיווק, אודות, השוואות, מדריכים ומחשבונים; פרטיות ותנאים מתורגמים עם בדיקת התאמה למקור. עד הסקירה אין להציג מסמך משפטי חלקי כתרגום מלא; גרסת עברית מוכנה היא תנאי לשחרור הכולל.
- שפת ילדים: משפטים קצרים וברורים, ניסוח ניטרלי כשאפשר, בלי הצפת לוכסנים ומגדרים.
- מילון התחלתי: Chores = משימות; Points = נקודות; Rewards = פרסים; Redeem = מימוש פרס; Available = נקודות זמינות; Reserved = נקודות שמורות; Challenges = אתגרים; Approve = אישור; Fulfilled = הפרס נמסר.
- שומרים את המותג Pointsy. קטגוריות חדשות יקבלו שמות בשפת ההרשמה; מכאן והלאה הן תוכן של המשפחה ואינן משתנות עם שפת המכשיר.
- אין תרגום מכונה בזמן ריצה, אין API חיצוני לתרגום, ואין שינוי במחרוזות מזהים, קודי משפחה או קבצי ייצוא מובנים.
- אין שינוי אזור זמן, תחילת שבוע עסקית, לוח שנה או מטבע עקב מעבר לעברית. המחשבונים משמרים את משמעות המטבע הקיים.

### חלופות

1. החלפת אנגלית בעברית בלבד: פשוטה, אבל מסירה את האנגלית ולא מאפשרת בחירה.
2. מילונים טיפוסיים ללא שינוי כתובות — **ההצעה המומלצת**: מעט תלות נוספת, משמרת את ה־proxy והקישורים הקיימים, ומתאימה לשתי שפות.
3. ספריית i18n עם נתיבים לפי שפה: מתאימה אם נדרשת אסטרטגיית SEO רב־לשונית, אך מוסיפה שינויים בנתיבים, redirects, manifest וקישורי Push.

SEO רב־לשוני עם כתובות נפרדות, העדפות מסונכרנות לחשבון ותרגום תוכן משפחתי אינם חלק מהשלב הזה. לא מוסיפים hreflang שמפנה לאותה כתובת כאילו היו שתי גרסאות נפרדות.

## מפת קבצים

קבצים שמסומנים כחדשים הם הצעות; יתר הנתיבים נבדקו בריפו.

| אחריות | קבצים |
| --- | --- |
| locale, מילונים, plural/format, שגיאות | חדשים: `lib/i18n/{locale,messages,format,errors,server}.ts`, `lib/i18n/messages/{en,he}.ts` |
| הקשר לקוח ובחירה | חדשים: `components/i18n/{LocaleProvider,LanguageSwitcher}.tsx`, `components/i18n/language-switcher.module.css`, `app/actions/locale.ts` |
| SSR, גופנים, תצוגה משותפת | `app/layout.tsx`, `app/globals.css`, `components/ui/**`, `components/brand/**` |
| הורים, ילדים וכניסה | `app/(auth)/**`, `app/enter/**`, `app/dashboard/**`, `app/award/**`, `app/manage/**`, `app/me/**`, `app/redeem/**`, `app/submit/**`, רכיבי התכונות המקבילים |
| שגיאות, ערכי קטלוג וברירות מחדל | `app/actions/**`, `lib/validation/{form,schemas}.ts`, `lib/auth/register.ts`, `lib/categories/service.ts`, `lib/catalog/category.ts`, `components/manage/options.ts` |
| שיווק ומסמכי מוצר | `app/page.tsx`, `app/(marketing)/**`, `app/(legal)/**`, `components/marketing/**` |
| Push ו־PWA | `lib/push/{service,send}.ts`, `app/actions/push.ts`, `lib/db/schema.ts`, `app/sw.ts`, `app/manifest.ts`, `components/push/**`, `components/pwa/**`, מיגרציה חדשה ב־`drizzle/` |
| בדיקות ותיעוד | חדשים: `tests/unit/i18n.test.ts`, `tests/unit/i18n-messages.test.ts`, `tests/integration/i18n.test.ts`, `tests/e2e/i18n.spec.ts`, `docs/i18n-coverage.md`; הרחבת בדיקות קיימות |

## Task 1: תשתית מילונים ופורמט

**Files:** קבצי `lib/i18n/` החדשים; `tests/unit/i18n.test.ts`, `tests/unit/i18n-messages.test.ts`.

**Interfaces:**
- `type Locale = "en" | "he"`; `resolveLocale(cookie: string | undefined, acceptLanguage: string | null): Locale`; `direction(locale: Locale): "ltr" | "rtl"`.
- `MessageKey` נגזר ממילון אנגלי; מילון עברי מחויב לאותם מפתחות ולאותם פרמטרים.
- `translate(locale, key, params?)` עם overloads טיפוסיים לפרמטרים; הודעות ספירה מכילות ענפי plural מלאים ומוכרעות באמצעות `Intl.PluralRules`.
- `formatNumber(locale, value)`, `formatDateTime(locale, value, timeZone)`, `formatRelativeTime(locale, value, unit)`; אין בהם I/O.

- [ ] להוסיף בדיקות כושלות: cookie תקין מנצח; cookie לא תקין נופל לדפדפן; `he-IL` ו־`iw` מזוהים; q=0 אינו נבחר; כותרת חסרה/פגומה נותנת אנגלית.
- [ ] להריץ `npm test -- tests/unit/i18n.test.ts`; לוודא כישלון בגלל היעדר התשתית.
- [ ] לממש פתרון שפה ומילונים שטוחים במפתחות סמנטיים. לא לבנות משפטים מחיבור מקטעים; לא להשתמש ב־HTML גולמי בתרגום.
- [ ] לבדוק counts של 0, 1, 2, 3, 10, 11, 20 ו־101 בעברית; `other` קיים תמיד. היעדר מפתח נכשל ב־CI; fallback לאנגלית בריצה הוא רשת ביטחון בלבד.
- [ ] לבדוק פורמט יתרה `-12`, תאריך סמוך לחצות ו־DST ב־Asia/Jerusalem; שפה לא משנה את תוצאות `localDate`, `weekStart`, `localParts` או זכאות משימה.
- [ ] להריץ בדיקות ו־typecheck; לוודא פרמטרים חסרים/שגויים נדחים בטיפוסים. Commit: `feat: add typed English and Hebrew messages`.

## Task 2: פתרון שפה בשרת ובוחר שפה

**Files:** `app/layout.tsx`, קבצי `components/i18n/`, `app/actions/locale.ts`, `lib/i18n/server.ts`, `lib/validation/schemas.ts`, כותרות/ניווט קיימים; `tests/e2e/i18n.spec.ts`.

**Interfaces:**
- `getRequestLocale(): Promise<Locale>` הוא server-only ומקבל cookies/headers לפי API הגרסה המותקנת; לעולם לא מאחסן locale גלובלי משותף לבקשות.
- `LocaleProvider({locale, children})`; `useLocale()`, `useTranslations()` משתמשים באותו ערך SSR.
- `setLocaleAction(input: unknown): Promise<{ok: boolean}>` מאמת enum עם Zod וכותב cookie לשנה, path=/, SameSite=Lax ו־Secure ב־Production.

- [ ] לכתוב E2E כושל: דפדפן עברי מקבל כבר בתשובת HTML `lang=he`, `dir=rtl`; אנגלי מקבל `en/ltr`.
- [ ] לבדוק פריסת cookie ושמירה אחרי reload, sign-out והחלפת פרופיל; cookie פגום אינו שובר כניסה.
- [ ] לחבר בוחר שפה נגיש למסכים הציבוריים, כניסה, בורר פרופילים ומסכי הורים/ילדים, בלי כפילות כפתורים ובלי שליחת טופס בטעות.
- [ ] לממש מדיניות טופס לא שמור: cancel שומר שפה וערכים; confirm מחיל שפה ומודיע על אובדן הטיוטה. לבדוק גם client navigation ו־refresh.
- [ ] לעדכן HTML ו־provider יחד; להתאים cache של תצוגות לפי שפה או להפוך אותן לתלויות בקשה, בלי לשמור תשובה אישית במטמון משותף.
- [ ] להריץ `npm run test:e2e -- tests/e2e/i18n.spec.ts` ובדיקות auth/home קיימות; אין שינוי נתיבים או הרשאות. Commit: `feat: add persistent language selection`.

## Task 3: תרגום מסכי הליבה ושגיאות

**Files:** מסכי auth/parent/kid ורכיביהם ממפת הקבצים; `app/actions/**`, `lib/validation/**`, `lib/i18n/errors.ts`, ברירות מחדל בהרשמה; `tests/integration/i18n.test.ts`.

**Interfaces:**
- `UiError = {key: MessageKey; params?: Record<string, string | number>}`, כאשר מפתחות השגיאה מוגבלים לתת־קבוצה ייעודית.
- להרחיב `FormState` ו־`AuthState` ב־`errorCode?: UiError` ו־`fieldErrorCodes?: Record<string, UiError>`. לשמר שדות טקסט קיימים בזמן מעבר בלבד; להסירם לאחר שכל הצרכנים הוסבו.
- `registerFamily` מקבל `locale?: Locale` עם ברירת מחדל `en`; `seedDefaultCategories(db, familyId, locale = "en")` מייצר שמות מקומיים בלי לשנות IDs.

- [ ] ליצור מלאי `docs/i18n-coverage.md`: כל route, רכיב, הודעת action, תווית אייקון, מצב מסך ומפתח תרגום. לסרוק טקסט JSX, aria/title/placeholder, הודעות Zod ו־Intl קשיח; לבדוק ידנית ולא להסתמך על regex בלבד.
- [ ] לכתוב בדיקות כושלות להודעת סיסמה שגויה, PIN שגוי/נעילה, שגיאת שדה, יתרה לא מספקת, שמירה והסרת פרס; UI מציג עברית ואינו חושף exception פנימי.
- [ ] למפות שגיאות צפויות למזהים יציבים ולתרגם בצרכן, כך שהודעה שכבר מוצגת תתחלף גם עם השפה. לא לשנות `name`, ערכי enum או חוזי נתונים עסקיים.
- [ ] להמיר את כל מסכי הליבה וצרכניהם, כולל ניווט, אייקון picker, יחידות ספירה, countdown, מצבי ריק/טעינה ואישורי מחיקה.
- [ ] לבחון הרשמה עברית שיוצרת קטגוריות בעברית; החלפת שפה לא משנה קטגוריות קיימות, טקסטים חופשיים, snapshots או ייצוא. פעולה ממשפחה A אינה יכולה לגעת ב־B.
- [ ] להריץ בדיקות i18n/integration ובדיקות auth/catalog/points/redemptions קיימות. Commit: `feat: translate parent and kid flows into Hebrew`.

## Task 4: RTL, גופנים ותוכן מעורב

**Files:** `app/layout.tsx`, `app/globals.css`, CSS Modules ורכיבי UI/תכונות, במיוחד `PinPad.tsx`, `BottomNav.tsx`, `ScreenHeader.tsx`; `tests/e2e/i18n.spec.ts`.

- [ ] להוסיף בדיקות וצילומי baseline שמדגימים ניווט, טופס, כרטיסי פרסים, modal, PIN ויתרה שלילית בעברית.
- [ ] להוסיף גופן עברי עם `next/font` (הצעה: Heebo), fallback מתאים וללא ריווח אותיות שלילי לכותרות עבריות; לשמר את גופני האנגלית ואת טוקני הצבע.
- [ ] להחליף תכונות כיווניות פיזיות ב־logical properties כשמשמעותן סמנטית: margin/padding/inset-inline, text-align:start ו־border-inline. לא להחליף מכנית מיקומים דקורטיביים.
- [ ] לתת ל־RTL לסדר flex/grid באופן טבעי; להימנע מ־row-reverse כפול. למראה חיצים של חזרה/המשך בלבד להשתמש ב־:dir(rtl); לא להפוך לוגו, סימני אישור, ספרות, שעון או אייקון לא כיווני.
- [ ] לשמור לוח ספרות וסדר PIN כ־LTR; אימייל, URL וקוד הזמנה LTR בתוך ממשק RTL. טקסט משתמש עם `dir=auto` ובידוד `bdi`; סכומים, כולל מינוס, בתוך מעטפת LTR מבודדת.
- [ ] לבדוק ב־320px, 390px ו־1280px וכן zoom של 200%: אין חיתוך, גלילה אופקית, תוויות דחוסות או שינוי סדר מקלדת. לבדוק שמות כמו `נועה Alex 12` וטקסט ארוך.
- [ ] לתעד בדיקת מסך ו־axe בשתי השפות; כפתורי ניווט נשארים מזוהים וקריאים. Commit: `feat: adapt Pointsy layouts and typography for RTL`.

## Task 5: שיווק, משפטי ו־metadata

**Files:** `app/page.tsx`, `app/(marketing)/**`, `app/(legal)/**`, `components/marketing/**`, `components/ui/Site{Header,Footer}.tsx`, `app/layout.tsx`, `app/opengraph-image.tsx`.

- [ ] להוסיף בדיקות כושלות לכותרת/תיאור עבריים ולניווט ציבורי; המשתמש המחובר עדיין מקבל את הבית המתאים ולא את דף השיווק.
- [ ] לתרגם מדריכים, השוואות, מחשבונים, עמוד אודות, footer וקריאות לפעולה, בלי לשנות יחידות/מטבע או עובדות מוצר.
- [ ] להכין תרגום עברי מלא לפרטיות ולתנאים מול המקור; לתעד סקירת בעל הפרויקט לפני שחרור. אין להמציא התחייבויות או לשנות את `CONSENT_VERSION` רק בשל שינוי שפה ללא בדיקת משמעות.
- [ ] להפיק metadata בהתאם לשפת הבקשה ולהחליט במפורש כיצד תמונת OG משותפת תישאר קריאה בשתי השפות; לא לפרסם כתובות שפה שאינן קיימות. טיפול במיתוג/דומיין של ה־fork הוא עבודה נפרדת.
- [ ] להריץ בדיקות ציבוריות/marketing קיימות ו־axe בשתי השפות; לעדכן את מטריצת הכיסוי. Commit: `feat: localize public pages and metadata`.

## Task 6: Push ו־PWA

**Files:** `lib/db/schema.ts`, מיגרציית Drizzle חדשה, `lib/push/{service,send}.ts`, `app/actions/push.ts`, קריאות notify ב־`app/actions/**`, `app/sw.ts`, `app/manifest.ts`, `components/push/**`, `components/pwa/**`; בדיקות push/integration/e2e.

**Interfaces:**
- עמודת `locale` במנוי Push, `NOT NULL DEFAULT 'en'` עם הגבלה ל־`en/he`; נתונים קיימים נשארים תקינים.
- `SendableSubscription` כולל `locale: Locale`. שמירת מנוי קוראת locale מאומת מהבקשה ולא מקבלת family/person מהלקוח.
- `LocalizedPushPayload` מחזיק מפתחות הודעה ופרמטרים שאינם סודות; התרגום מתבצע לכל מנוי בשרת. payload לדפדפן כולל `lang` ו־`dir`.

- [ ] לכתוב בדיקות כושלות לשני מנויים של אותו אדם ב־en/he, עדכון שפה, מנוי ישן ומשפחה אחרת שאינה מקבלת התראה.
- [ ] ליצור מיגרציה additive, לעדכן שירות/שאילתות/validation, ולתרגם כל קריאות notify לפני שליחה. שינוי שפה במכשיר מעדכן את המנוי הקיים שלו בלבד; בלי הרשאה להתראות הוא אינו יוצר מנוי.
- [ ] לבדוק שעדכון endpoint דורש בעלות באמצעות session ו־familyId; הוא אינו יכול להעביר בעלות או לשנות locale של מנוי אדם אחר. להוסיף בדיקת ניסיון כזה.
- [ ] להעביר `lang/dir` ל־showNotification, עם fallback en/ltr למטענים ישנים, ולתרגם מסכי אישור Push והוראות התקנה.
- [ ] לקבע manifest משותף ושם המותג Pointsy בשלב זה, עם תיאור קצר דו־לשוני. תוכן הוראות ההתקנה בתוך האפליקציה מקומי; לא מבטיחים שמערכת ההפעלה תעדכן שם של התקנה קיימת.
- [ ] לשמר NetworkOnly ל־HTML/RSC/API. לבדוק PWA production: החלפת שפה, סגירה/פתיחה, יציאה והחלפת ילד, וכשל רשת ללא הצגת מסך פרטי קודם.
- [ ] להריץ מיגרציה ובדיקות על DB זמני; בעת מימוש ובהרשאה המתאימה להחיל גם על DB האפליקציה ולבדוק נגדה, כנדרש ב־AGENTS. אין לגשת ל־DB במסגרת PR התוכנית.
- [ ] Commit: `feat: localize push notifications and PWA guidance`.

## Task 7: בדיקה כוללת ושחרור

**Files:** `tests/e2e/i18n.spec.ts`, בדיקות קיימות, `docs/i18n-coverage.md`, `README.md`, `SPEC.md`, changeset חדש.

- [ ] להריץ תרחיש בשתי השפות: הרשמה → ילד → משימה → הענקת נקודות → כניסת ילד → בקשת פרס → אישור הורה → בדיקת יתרה. להוסיף תרחיש משימה שנשלחת לאישור, אתגר ופרס משותף.
- [ ] לבדוק session בלי family cookie, מכשיר מוכר אחרי יציאה, גישה ישירה בתפקיד שגוי, העדפות דפדפן שונות ושינוי שפה לפני/אחרי התחברות.
- [ ] לוודא ש־0/יתרה שלילית, שמות מעורבים, תאריכים סביב DST ושגיאות ארוכות אינם שוברים תצוגה או משמעות.
- [ ] סקירת עברית אנושית: טבעיות, אחידות מונחים, ניסוח לילדים, ספירות ונגישות; להשלים שורות כיסוי ללא מפתחות חסרים או אנגלית לא מכוונת.
- [ ] להריץ `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`, `npm run build`, `npm run test:e2e`. לצרף צילומי מסכים מרכזיים בעברית/אנגלית במובייל ובדסקטופ; לבדוק Safari/iOS ו־Chrome/Android בפועל, לתעד מה לא נבדק.
- [ ] לוודא שאין עלייה לא מוסברת ב־client bundle; מילוני שיווק/משפטי אינם נשלחים אוטומטית לכל מסך ילד. להריץ budgets של Lighthouse כפי שהוגדרו בריפו.
- [ ] לעדכן תיעוד לבחירת שפה, ברירות מחדל, הוספת מפתחות, Push ו־RTL; להוסיף changeset לשינוי המשתמש בפועל. Commit: `test: verify Hebrew and English experiences`.
- [ ] לפתוח PRי מימוש עם עדויות ו־CI, לפרוס Preview מול DB נפרד, ולהשלים בדיקת smoke לאחר Production כולל מיגרציה והתראות.

## קריטריוני קבלה

- עברית ואנגלית זמינות בכל המסכים והמצבים שבמטריצת הכיסוי, כולל שגיאות, נגישות והתראות כאשר Push מופעל.
- הבחירה נשמרת במכשיר, מוצגת כבר ב־SSR, ואין שגיאת hydration או דליפת locale בין בקשות.
- RTL תקין לעין ובמקלדת, טקסטים מעורבים קריאים, PIN וקודים אינם מתהפכים, וכל המסכים שימושיים ב־320px.
- השפה אינה משנה נתונים קיימים, הרשאות, חלונות משימה, חישוב נקודות או יתרות.
- כל בדיקות האיכות עוברות; סקירת עברית ומסמכי הפרטיות/התנאים מתועדות לפני שחרור כולל.
- המימוש יוצא לסקירה בנפרד. אישור או מיזוג PR התוכנית אינם כשלעצמם אישור לפריסה או למיגרציה למסד Production.

## פריסה וחזרה לאחור

להוציא בשכבות לפי המשימות, אך לא להכריז על תמיכה מלאה עד השלמת מטריצת הכיסוי. מיגרציית שפת Push תואמת לגרסה קודמת; rollback של קוד אינו מוחק את העמודה או משכתב נתונים. קוד ישן מתעלם מעוגיית השפה. במקרה של תקלה ב־RTL/תרגום אפשר להחזיר גרסה קודמת תוך שמירת נתוני המשפחות; אין להשתמש ב־rollback הרסני למסד.
