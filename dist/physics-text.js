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
    .replace(/(?<![A-Za-z])[A-Za-z](?![A-Za-z])|[ρΔ]/g, symbol => '<i>' + symbol + '</i>')
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
function physHeroHtml(step) {
  let media = '';
  if (step.anim) media = '<div class="phys-anim"></div>';
  else if (step.fig && PHYS_FIGS[step.fig]) media = '<div class="phys-fig" role="img" aria-label="' + physEsc(PHYS_FIGS[step.fig].label) + '">' + PHYS_FIGS[step.fig].svg(step.figParams || {}) + '</div>';
  else if (step.img && physImageReady(step.img)) {
    media = '<img class="phys-img" src="' + PHYSICS_IMAGES[step.img].src + '" alt="' + physEsc(PHYSICS_IMAGES[step.img].alt) + '" onerror="this.closest(\'.phys-hero\').remove()">';
  }
  if (!media) return '';
  const labels = (step.labels || []).map(label => '<span class="phys-hero-label" style="left:' + label.x + '%;top:' + label.y + '%">' + physFormula(label.text) + '</span>').join('');
  return '<figure class="phys-hero">' + media + labels + '</figure>';
}
