// Ստեղծում է մեկ ինքնաբավ HTML ֆայլ (../../outputs/English-Garden.html) ընթացիկ dist/-ից։
// Բոլոր CSS/JS-ը ներդրվում են index.html-ի նույն հերթականությամբ, իսկ նկարները՝ data: URI-ներով։
// Ֆայլը աշխատում է սկավառակից (file://)՝ որպես այս սարքի հյուր (հաշիվներն ու Google մուտքը միայն առցանց են),
// իսկ հասցեները #/ուղի ձևով են (տես routes.js)։
// Օգտագործում՝ node worker/single-file.mjs [ելքային_ֆայլ]
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const output = path.resolve(process.argv[2] || path.join(root, '..', '..', 'outputs', 'English-Garden.html'));
const mime = { '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' };
const dataUri = async file => 'data:' + mime[path.extname(file)] + ';base64,' + (await readFile(path.join(dist, file))).toString('base64');
// </script> ներսում կփակեր թեգը, ուստի այն էսկեյփ ենք անում (JS-ի համար անվտանգ է)։
const inlineScript = code => '<script>' + code.replace(/<\/(script)/gi, '<\\/$1') + '</script>';
const inlineStyle = css => '<style>' + css.replace(/<\/(style)/gi, '<\\/$1') + '</style>';

let html = await readFile(path.join(dist, 'index.html'), 'utf8');

// Բառերի նկարներ (/word-*.webp)՝ մեկ քարտեզում, որը կարդում է pictures.js-ի wordImageUrl()-ը
const assets = {};
for (const file of (await readdir(dist)).filter(name => /^word-[a-z0-9-]+\.webp$/.test(name)).sort()) {
  assets['/' + file] = await dataUri(file);
}

// Մանիֆեստը (PWA) file://-ից չի բեռնվում, ուստի հանում ենք։ Պատկերակը՝ data: URI։
html = html.replace(/<link rel="manifest"[^>]*>/, '<link rel="icon" href="' + await dataUri('garden-192.png') + '">');

const parts = [];
const pattern = /<link rel="stylesheet" href="\/?([\w.-]+\.css)(?:\?[^"]*)?">|<script src="\/?([\w.-]+\.js)(?:\?[^"]*)?"><\/script>/g;
let missing = [];
html = await (async () => {
  let result = '';
  let last = 0;
  for (const match of html.matchAll(pattern)) {
    result += html.slice(last, match.index);
    last = match.index + match[0].length;
    const [, css, js] = match;
    try {
      if (css) result += inlineStyle(await readFile(path.join(dist, css), 'utf8'));
      else {
        if (js === 'word-images.js') result += inlineScript('const EMBEDDED_ASSETS = ' + JSON.stringify(assets) + ';');
        result += inlineScript(await readFile(path.join(dist, js), 'utf8'));
      }
      parts.push(css || js);
    } catch {
      missing.push(css || js);
    }
  }
  return result + html.slice(last);
})();
if (missing.length) throw new Error('Missing files: ' + missing.join(', '));
// /auth/... հղումները JS-ում են և file://-ում չեն ցուցադրվում (հաշիվները միայն առցանց են)
const leftover = html.match(/(?:src|href)="\/(?!\/|auth\/)[^"]*"/g);
if (leftover) console.warn('Warning: some root-relative URLs remain:', leftover.slice(0, 5));

await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, html);
console.log('single file ready:', output, '(' + Math.round(html.length / 1024) + ' KB, ' + parts.length + ' files, ' +
  Object.keys(assets).length + ' images)');
