import { cleanPlantName } from '../utils.js';

/* =========================================
   ۱. دیکشنری اصلاح نام‌ها (Mapping)
   این لیست نام گیاه در دیتابیس را به عنوان دقیق
   صفحه در ویکی‌پدیای فارسی متصل می‌کند.
   ========================================= */
const manualMapping = {
    // --- گروه ۱: مقاوم‌ها ---
    "سانسوریا (شمشیری)": "سانسوریا",
    "زاموفیلیا (زامیفولیا)": "زامیفولیا",
    "پتوس (عشقه)": "پتوس (گیاه)",
    "آگلونما (نخودی)": "آگلونما",
    "گندمی (عنکبوتی)": "گندمی",
    "اسپاتی فیلوم (گل صلح)": "اسپاتی فیلوم",
    "قاشقی (پپرومیا)": "پپرومیا", // ارجاع به سرده

    // --- گروه ۲: کاکتوس و ساکولنت ---
    "کاکتوس (انواع تیغ‌دار)": "کاکتوس",
    "کراسولا (یشم/خرفه)": "کراسولا اوواتا",
    "آلوئه‌ورا": "آلوئه ورا",
    "افوربیا (تیروکالی/تریگونا)": "فرفیون",
    "کالانکوئه": "کالانکوئه",

    // --- گروه ۳: درختچه‌ها ---
    "یوکا": "یوکا",
    "دیفن‌باخیا": "دیفنباخیا",
    "کروتون (کرچک هندی)": "کرچک هندی",
    "شفلرا (چتری)": "شفلرا_آربوریکلا",
    "دراسینا کامپکت": "دراسینا_کامپکت",
    "فیکوس آمبلتا": "انجیر (سرده)",
    "کاج مطبق": "کاج مطبق",
    "پاچیرا (درخت پول)": "پاچیرا",
    "بونسای (فیکوس جینسینگ)": "بونسای",
    "نخل کنتیا": "هووآ (گیاه)",
    "نخل سیکاس": "سیکاس",
    "فیکوس لیراتا (برگ ویلونی)": "فیکوس لیراتا",
    "بنجامین (فیکوس)": "انجیر مجنون",
    "لیندا (نخل دم‌اسبی)": "لیندا (گیاه)",
    "شامادورا (نخل پارلور)": "شامادورا",
    "فیکوس الاستیکا (فیکوس آفریقایی)": "فیکوس الاستیکا",

    // --- گروه ۴: گلدار ---
    "شمعدانی": "شمعدانی (سرده)",
    "ارکیده (فالانوپسیس)": "فالانوپسیس",
    "بنفشه آفریقایی": "بنفشه آفریقایی",
    "حسن یوسف": "حسن‌یوسف",
    "آنتوریوم": "آنتوریوم",

    // --- گروه ۵: خاص و حساس ---
    "ونوس حشره‌خوار": "ونوس مگس‌خوار",
    "بامبو (لاکی بامبو)": "دراسینا ساندریانا",
    "سرخس بوستون": "سرخس (گیاه)",
    "نخل مرداب (پنجه کلاغی)": "نخل مرداب",

    // --- گروه ۶: رونده و رطوبت دوست ---
    "سینگونیوم (پنجه کلاغی)": "سینگونیوم",
    "تردسکانتیا (برگ بیدی)": "برگ‌بیدی (سرده)",
    "فیلودندرون (سبز/ایمپریال)": "فیلودندرون",
    "کالاتیا (گیاه دعاگو)": "کالاتیا",
    "آلوکازیا (بابا آدم)": "باباآدم (سرده)",
    "برگ انجیری (مونسترا)": "برگ‌انجیری",
    "پاپیتال (عشقه معمولی)": "پاپیتال"
};

/* =========================================
   ۲. توابع کمکی (Reset UI & Search API)
   ========================================= */

// ریست کردن مودال قبل از جستجوی جدید
function resetUI() {
    const els = {
        loading: document.getElementById('wiki-loading'),
        result: document.getElementById('wiki-result'),
        error: document.getElementById('wiki-error'),
        image: document.getElementById('wiki-image'),
        extract: document.getElementById('wiki-extract'),
        title: document.getElementById('wiki-title-modal')
    };

    els.loading.style.display = 'block';
    els.result.style.display = 'none';
    els.error.style.display = 'none';
    els.image.style.display = 'none';
    els.image.src = '';
    els.extract.innerText = '';
    els.title.innerHTML = '<i class="fab fa-wikipedia-w"></i> دانشنامه آنلاین';
}

// تابع اصلی درخواست به API
async function searchWikipedia(term) {
    if (!term) return null;
    try {
        const cleanTerm = term.trim();
        // پارامترهای مهم:
        // redirects=1: دنبال کردن تغییر مسیرها
        // pithumbsize=600: دریافت عکس با کیفیت مناسب
        const url = `https://fa.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&titles=${cleanTerm}&pithumbsize=600&exintro&explaintext&redirects=1&origin=*`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (!data.query || !data.query.pages) return null;

        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        
        // اگر pageId منفی باشد یعنی پیدا نشده
        if (pageId === "-1") return null;

        return pages[pageId]; 

    } catch (e) {
        console.error("Wiki Network Error:", e);
        return null;
    }
}

/* =========================================
   ۳. تابع اصلی (Exported Function)
   ========================================= */
export async function fetchWiki(persianName, scientificName) {
    const modal = document.getElementById('wiki-modal');
    modal.style.display = 'flex';
    
    // ۱. پاکسازی رابط کاربری
    resetUI();

    let pageData = null;

    try {
        console.log("🔍 Start Wiki Search for:", persianName);

        // --- استراتژی ۱: دیکشنری دستی (اولویت مطلق) ---
        if (manualMapping[persianName]) {
            console.log("🎯 Strategy 1: Manual Mapping ->", manualMapping[persianName]);
            pageData = await searchWikipedia(manualMapping[persianName]);
        }

        // --- استراتژی ۲: نام علمی (دقیق‌ترین روش علمی) ---
        if (!pageData && scientificName) {
            console.log("🎯 Strategy 2: Scientific Name ->", scientificName);
            pageData = await searchWikipedia(scientificName);
        }

        // --- استراتژی ۳: نام فارسی تمیز شده ---
        if (!pageData) {
            const cleanName = cleanPlantName(persianName);
            console.log("🎯 Strategy 3: Clean Name ->", cleanName);
            pageData = await searchWikipedia(cleanName);
        }

        // --- استراتژی ۴: افزودن پسوند (گیاه) برای رفع ابهام ---
        if (!pageData) {
            const cleanName = cleanPlantName(persianName);
            const plantTerm = cleanName + " (گیاه)";
            console.log("🎯 Strategy 4: Suffix ->", plantTerm);
            pageData = await searchWikipedia(plantTerm);
        }

        // اگر بعد از ۴ مرحله پیدا نشد، خطا بده
        if (!pageData) throw new Error("Not Found");

        // === نمایش اطلاعات روی صفحه ===
        
        // مخفی کردن لودینگ و نمایش نتیجه
        document.getElementById('wiki-loading').style.display = 'none';
        document.getElementById('wiki-result').style.display = 'block';

        // تنظیم عنوان
        document.getElementById('wiki-title-modal').innerHTML = `<i class="fab fa-wikipedia-w"></i> ${pageData.title}`;
        
        // تنظیم متن خلاصه (محدود کردن طول متن)
        let extract = pageData.extract || "توضیحات متنی در دسترس نیست.";
        if(extract.length > 500) extract = extract.substring(0, 500) + "...";
        document.getElementById('wiki-extract').innerText = extract;
        
        // تنظیم عکس
        const imgEl = document.getElementById('wiki-image');
        if (pageData.thumbnail && pageData.thumbnail.source) {
            imgEl.src = pageData.thumbnail.source;
            imgEl.style.display = 'block';
        } else {
            // اگر عکس نداشت، مخفی بماند
            imgEl.style.display = 'none';
        }

        // تنظیم لینک دکمه
        const wikiLink = `https://fa.wikipedia.org/wiki/${encodeURIComponent(pageData.title)}`;
        document.getElementById('wiki-link').href = wikiLink;

    } catch (error) {
        console.warn("❌ Wiki Search Failed:", error);
        document.getElementById('wiki-loading').style.display = 'none';
        document.getElementById('wiki-error').style.display = 'block';
    }
}