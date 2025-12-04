export const iconMap = {
    آبیاری: "fa-tint", نور: "fa-sun", کوددهی: "fa-flask",
    قلمه: "fa-cut", آفات: "fa-bug", دما: "fa-temperature-high",
    خاستگاه: "fa-globe-americas", خاک_ایده‌آل: "fa-layer-group",
    نام_علمی: "fa-dna", سمی_بودن: "fa-skull-crossbones",
    رطوبت: "fa-cloud-showers-heavy"
};

export async function fetchJson(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`خطا در دریافت ${url}`);
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}

export function cleanPlantName(name) {
    return name.split('(')[0].trim();
}