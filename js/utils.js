export const iconMap = {
    آبیاری: "fa-tint", النور: "fa-sun", کوددهی: "fa-flask",
    قلمه: "fa-cut", آفات: "fa-bug", دما: "fa-temperature-high",
    خاستگاه: "fa-globe-americas", خاک_ایده‌آل: "fa-layer-group",
    نام_علمی: "fa-dna", سمی_بودن: "fa-skull-crossbones",
    رطوبت: "fa-cloud-showers-heavy"
};

export async function fetchJson(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${url}`);
        }
        const data = await res.json();
        console.log(`✅ بارگذاری: ${url}`);
        return data;
    } catch (err) {
        console.error(`❌ خطا در ${url}:`, err.message);
        return null;
    }
}

export function cleanPlantName(name) {
    return name.split('(')[0].trim();
}