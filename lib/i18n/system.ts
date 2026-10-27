import type { Locale } from "./locale";

const en = {
  notifications: "Notifications",
  parentHint: "Get a heads-up the moment your child requests a reward.",
  kidHint: "Get a heads-up when you earn points or a reward is approved.",
  blocked: "Notifications are blocked in your browser settings.",
  saveFailed: "Could not save the subscription.",
  enableFailed: "Could not enable notifications.",
  disableFailed: "Could not turn off notifications.",
  on: "On",
  working: "Working…",
  turnOff: "Turn off",
  enable: "Enable",
  enableLabel: "Enable notifications",
  installTitle: "Add Pointsy to your home screen",
  installIntro: "It works just like an app — no App Store, no download.",
  shareStep: "Tap the Share button in the toolbar",
  homeStep: "Choose Add to Home Screen",
  homeTip: "Don’t see it? Tap Show More or scroll the list.",
  addStep: "Tap Add — you’re done! 🎉",
  close: "Close",
  install: "Install",
  installApp: "Install app",
  installBanner: "Install Pointsy for one-tap access on your home screen.",
  dismissInstall: "Dismiss install prompt",
};
const he: Record<keyof typeof en, string> = {
  notifications: "התראות",
  parentHint: "קבלת התראה כשמוגשת בקשה לפרס.",
  kidHint: "קבלת התראה על נקודות חדשות ועל אישור פרסים.",
  blocked: "ההתראות חסומות בהגדרות הדפדפן שלך.",
  saveFailed: "לא ניתן לשמור את ההרשמה להתראות.",
  enableFailed: "לא ניתן להפעיל התראות.",
  disableFailed: "לא ניתן לכבות התראות.",
  on: "פעיל",
  working: "רק רגע…",
  turnOff: "כיבוי",
  enable: "הפעלה",
  enableLabel: "הפעלת התראות",
  installTitle: "הוספת Pointsy למסך הבית",
  installIntro: "עובד כמו אפליקציה — בלי חנות אפליקציות ובלי הורדה.",
  shareStep: "לחיצה על כפתור השיתוף בסרגל הכלים",
  homeStep: "בחירה באפשרות הוספה למסך הבית",
  homeTip: "האפשרות לא מופיעה? אפשר לבחור בהצג עוד או לגלול ברשימה.",
  addStep: "לחיצה על הוספה — וזה הכול! 🎉",
  close: "סגירה",
  install: "התקנה",
  installApp: "התקנת האפליקציה",
  installBanner: "התקנת Pointsy מאפשרת כניסה מהירה ממסך הבית.",
  dismissInstall: "סגירת הצעת ההתקנה",
};

/** Small shared system catalog; no marketing/legal prose in application bundles. */
export function systemCopy(locale: Locale): Record<keyof typeof en, string> {
  return locale === "he" ? he : en;
}
