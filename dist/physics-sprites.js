// Flow նկարները որպես SVG «սպրայթներ» գործիքներում (կշեռք, քանոն, չափագլան, զսպանակ) + կիսված խորանարդի SVG։
// PHYSICS_IMAGES[id].box = [x0, y0, x1, y1]՝ առարկայի սահմանները 512×512 կտավում (physics-media.py)։
// Եթե նկար չկա (file:, ֆայլ չկա) → null, և գործիքները նկարում են հին ձևը (physBlock/physDisc)։

// Նկարը՝ կենտրոնը (0, 0), առարկայի լայնությունը objW (svg-ի միավոր). { w, h, svg }
function physSprite(id, objW) {
  if (!physImageReady(id) || !PHYSICS_IMAGES[id].box) return null;
  const image = PHYSICS_IMAGES[id];
  const [x0, y0, x1, y1] = image.box;
  const k = objW / (x1 - x0);
  const svg = '<image href="' + image.src + '" x="' + (-(x0 + x1) / 2 * k) + '" y="' + (-(y0 + y1) / 2 * k) + '" width="' + 512 * k + '" height="' + 512 * k + '" aria-hidden="true"/>';
  return { w: objW, h: (y1 - y0) * k, svg };
}

// Մատիտը՝ 3 մաս (ռետին, ձգվող մարմին, սուր ծայր) նույն նկարից. ծայրերը ճշգրիտ են ցանկացած երկարության դեպքում։
// Բաժանումները՝ առարկայի լայնության մասնաբաժինով (չափված նկարում)։ Վերադարձնում է null, եթե նկար չկա
const PHYS_PENCIL_CUTS = [0.1, 0.86];
function physPencilHtml(id) {
  if (!physImageReady(id) || !PHYSICS_IMAGES[id].box) return '';
  const { src, box } = PHYSICS_IMAGES[id];
  const part = name => '<svg class="r-' + name + '" overflow="hidden" preserveAspectRatio="none" aria-hidden="true"><image href="' + src + '" width="512" height="512"/></svg>';
  return part('pe') + part('pb') + part('pt');
}

// Մատիտի երեք մասերի դիրքը. left, right՝ svg-ի x, top, height՝ y-ով
function physPencilLayout(root, id, left, right, top, height) {
  const [x0, y0, x1, y1] = PHYSICS_IMAGES[id].box;
  const total = x1 - x0;
  const k = height / (y1 - y0);
  const eraser = total * PHYS_PENCIL_CUTS[0] * k;
  const tip = total * (1 - PHYS_PENCIL_CUTS[1]) * k;
  const body = Math.max(1, right - left - eraser - tip);
  const slices = [['pe', left, eraser, x0, total * PHYS_PENCIL_CUTS[0]], ['pb', left + eraser, body, x0 + total * PHYS_PENCIL_CUTS[0], total * (PHYS_PENCIL_CUTS[1] - PHYS_PENCIL_CUTS[0])],
    ['pt', right - tip, tip, x0 + total * PHYS_PENCIL_CUTS[1], total * (1 - PHYS_PENCIL_CUTS[1])]];
  for (const [name, x, width, sx, sw] of slices) {
    const node = root.querySelector('.r-' + name);
    node.setAttribute('x', x);
    node.setAttribute('y', top);
    node.setAttribute('width', width);
    node.setAttribute('height', height);
    node.setAttribute('viewBox', sx + ' ' + y0 + ' ' + sw + ' ' + (y1 - y0));
  }
}

// Կիսված ալյումինե խորանարդ (cube-aluminium-ի ոճով). երկու հավասար կես a × a × a/2, ուղիղ ուղղահայաց կտրվածք, փոքր բացվածք։
// Սկզբնակետը՝ ներքևի կենտրոնում. a՝ կողի երկարությունը
function physCubeHalvesSvg(a = 70) {
  const c = { top: '#D4D4D4', left: '#BDBDBD', right: '#9F9F9F', base: '#566B76' };
  const ex = [0.866, -0.5], ey = [-0.866, -0.5];
  const pt = (b, i, j, z) => (b[0] + ex[0] * i + ey[0] * j) + ',' + (b[1] + ex[1] * i + ey[1] * j - z);
  const poly = (points, fill) => '<polygon points="' + points.join(' ') + '" fill="' + fill + '" stroke="' + fill + '" stroke-width="1.5" stroke-linejoin="round"/>';
  const slab = (b, dx, dy, h) => {
    const bottom = (dz, fill) => poly([pt(b, 0, 0, dz), pt(b, dx, 0, dz), pt(b, dx, 0, h + dz), pt(b, 0, 0, h + dz)], fill) + poly([pt(b, 0, 0, dz), pt(b, 0, dy, dz), pt(b, 0, dy, h + dz), pt(b, 0, 0, h + dz)], fill);
    return bottom(-7, c.base) + poly([pt(b, 0, 0, 0), pt(b, 0, dy, 0), pt(b, 0, dy, h), pt(b, 0, 0, h)], c.left) +
      poly([pt(b, 0, 0, 0), pt(b, dx, 0, 0), pt(b, dx, 0, h), pt(b, 0, 0, h)], c.right) +
      poly([pt(b, 0, 0, h), pt(b, dx, 0, h), pt(b, dx, dy, h), pt(b, 0, dy, h)], c.top);
  };
  const half = a / 2, gap = a * 0.12;
  // Երկու կիսերը ex առանցքով. հետևինը (ավելի հեռու) նկարվում է առաջինը։ Կենտրոնացում՝ x-ով, ներքևը՝ y = 0
  const backB = [ex[0] * (half + gap), ex[1] * (half + gap)];
  return '<g transform="translate(' + (-0.433 * gap) + ' -7)">' + slab(backB, half, a, a) + slab([0, 0], half, a, a) + '</g>';
}
