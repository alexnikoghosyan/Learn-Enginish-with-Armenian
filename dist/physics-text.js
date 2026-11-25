// Տեքստի և բացատրության էկրանի օգնականներ (մաքուր տողեր, վերին մակարդակում DOM չկա)։
// given: [[նշան, թիվ, միավոր], …] · find: 'ρ' · steps: ['ρ = m / V', …] · lines: [տող, …]
// hint/why/lines կարող են լինել տող կամ զանգված (ամեն տարր՝ առանձին տող)։ **թավ** նշագրությունը՝ physRich-ով։
const physEsc = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const physNum = value => String(value).replace('.', ',');
const PHYS_SUB = { '₀': 0, '₁': 1, '₂': 2, '₃': 3, '₄': 4, '₅': 5, '₆': 6, '₇': 7, '₈': 8, '₉': 9 };

function physRich(text) {
  return physEsc(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

// Բանաձևի նշանները թեք են (<i>), ինդեքսները՝ <sub>. միայն առանձին լատինատառ/հունատառ նշանները
function physFormula(text) {
  return physRich(text)
    .replace(/ \/ /g, ' : ') // բաժանումը՝ «:», որ թեք l-ի հետ չշփոթվի
    .replace(/(?<![A-Za-z])[A-Za-z](?![A-Za-z])|[ρΔ]/g, symbol => '<i>' + (symbol === 'l' ? 'ℓ' : symbol) + '</i>')
    .replace(/_(միջ)/g, '<sub>$1</sub>')
    .replace(/[₀-₉]+/g, digits => '<sub>' + [...digits].map(char => PHYS_SUB[char]).join('') + '</sub>');
}

function physLinesHtml(value) {
  return Array.isArray(value) ? '<ul class="phys-lines">' + value.map(line => '<li>' + physFormula(line) + '</li>').join('') + '</ul>' : physRich(value);
}

// «Տրված է / Գտնել» և «Լուծում» բլոկները
function physGivenHtml(step) {
  let out = '';
  if (step.given) {
    out += '<dl class="phys-given"><dt>Տրված է՝</dt><dd><ul class="phys-lines">' +
      step.given.map(([symbol, value, unit]) => '<li>' + physFormula(symbol) + ' = ' + physNum(value) + ' ' + physEsc(unit) + '</li>').join('') + '</ul></dd>' +
      (step.find ? '<dt>Գտնել՝</dt><dd>' + physFormula(step.find) + '</dd>' : '') + '</dl>';
  }
  if (step.steps) out += '<p class="phys-label">Լուծում՝</p><ol class="phys-solution">' + step.steps.map(line => '<li>' + physFormula(line) + '</li>').join('') + '</ol>';
  if (step.lines) out += physLinesHtml(step.lines);
  return out;
}

const physFileMode = () => typeof location !== 'undefined' && location.protocol === 'file:';
const physImageReady = id => typeof PHYSICS_IMAGES !== 'undefined' && Boolean(PHYSICS_IMAGES[id]) && !physFileMode();

// Բացատրության էկրանի նկարը. img (Flow) → ֆայլի բացակայության դեպքում hero-ն չի ցուցադրվում. fig (SVG սխեմա), anim (անիմացիա)
// Flow նկարի <img>-ը. հայերեն alt (PHYSICS_IMAGES-ից), width/height՝ առանց դասավորության թռիչքի,
// onerror՝ նկարը հանվում է (wrapper-ը՝ եթե դատարկ է մնում)։ Արտաքին հարցումներ չկան
function physImageTag(id, className, wrapper = '') {
  const image = PHYSICS_IMAGES[id];
  const cleanup = wrapper ? "var h=this.closest('" + wrapper + "');this.remove();if(h&&!h.querySelector('img'))h.remove()" : 'this.remove()';
  return '<img class="' + className + '" src="' + image.src + '" alt="' + physEsc(image.alt) + '" width="512" height="512" decoding="async" onerror="' + cleanup + '">';
}

// img-ը՝ Flow նկար (տող կամ երկու նկարի զանգված). ֆայլի բացակայության դեպքում hero-ն չի ցուցադրվում
function physHeroHtml(step) {
  let media = '';
  if (step.anim) media = '<div class="phys-anim"></div>';
  else if (step.fig && PHYS_FIGS[step.fig]) media = '<div class="phys-fig" role="img" aria-label="' + physEsc(PHYS_FIGS[step.fig].label) + '">' + PHYS_FIGS[step.fig].svg(step.figParams || {}) + '</div>';
  else if (step.img) {
    const ids = [].concat(step.img).filter(physImageReady);
    if (ids.length) media = '<div class="phys-imgs' + (ids.length > 1 ? ' is-pair' : '') + '">' + ids.map(id => physImageTag(id, 'phys-img', '.phys-hero')).join('') + '</div>';
  }
  if (!media) return '';
  const labels = (step.labels || []).map(label => '<span class="phys-hero-label" style="left:' + label.x + '%;top:' + label.y + '%">' + physFormula(label.text) + '</span>').join('');
  return '<figure class="phys-hero">' + media + labels + '</figure>';
}
