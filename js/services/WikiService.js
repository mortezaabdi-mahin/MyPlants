import { cleanPlantName } from '../utils.js';

export async function fetchWiki(name) {
    const clean = cleanPlantName(name);
    const modal = document.getElementById('wiki-modal');
    modal.style.display = 'flex';
    document.getElementById('wiki-loading').style.display = 'block';
    document.getElementById('wiki-result').style.display = 'none';

    try {
        const url = `https://fa.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&titles=${clean}&pithumbsize=500&exintro&explaintext&origin=*`;
        const res = await fetch(url);
        const data = await res.json();
        const page = Object.values(data.query.pages)[0];

        if(page.pageid === -1) throw new Error('Not found');

        document.getElementById('wiki-title-modal').innerText = page.title;
        document.getElementById('wiki-extract').innerText = page.extract.substring(0, 400) + '...';
        
        const img = document.getElementById('wiki-image');
        if(page.thumbnail) { img.src = page.thumbnail.source; img.style.display='block'; }
        
        document.getElementById('wiki-link').href = `https://fa.wikipedia.org/wiki/${clean}`;
        
        document.getElementById('wiki-loading').style.display = 'none';
        document.getElementById('wiki-result').style.display = 'block';
    } catch (e) {
        document.getElementById('wiki-loading').style.display = 'none';
        document.getElementById('wiki-error').style.display = 'block';
    }
}