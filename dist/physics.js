// Ֆիզիկա 7. ուսուցման ճանապարհի էջը (/physics). գլուխները՝ բաժիններ, §-ները՝ կլոր հանգույցներ։
// Խիստ հերթականություն. current է միայն առաջին չավարտված §-ը (եթե պատրաստ է), մնացածը կողպված են։
// Եթե առաջին չավարտվածը դեռ պատրաստ չէ, նրա հանգույցի վրա «Շուտով» պիտակ է, և դրանից հետո ոչինչ չի բացվում։
function physicsStatus(section, next) {
  if (physicsDone(section.id)) return 'done';
  return section === next && physicsReady(section.id) ? 'current' : 'locked';
}

function physics() {
  physicsCloseTool();
  physNodesReset();
  const next = physicsNext();
  const units = PHYSICS_COURSE.chapters.map((chapter, index) => {
    const n = index + 1;
    const stops = chapter.sections.map((section, offset) => physNodeStopHtml(n, section, physicsStatus(section, next), [0, 1, 2, 2, 1, 0, 0, 1, 2, 1][offset % 10])).join('');
    const done = chapter.sections.filter(section => physicsDone(section.id)).length;
    const cover = physImageReady(chapter.cover) ? physImageTag(chapter.cover, 'phys-chapter-img') : '';
    return '<section class="path-unit phys-chapter ch' + n + '" data-color="' + chapter.color % 7 + '"><div class="path-unit-heading phys-heading">' + cover + '<div><h3>Գլուխ ' + chapter.n +
      ' · ' + esc(chapter.title) + '</h3><small>' + done + ' / ' + chapter.sections.length + ' դաս</small></div></div><ol>' + stops + '</ol>' +
      courseMilestone(done === chapter.sections.length) + '</section>';
  }).join('');
  const progress = physicsProgress();
  app.innerHTML = courseLayout('<div class="learning-path phys-path"><h1>Ֆիզիկա 7</h1><div class="path-intro"><p>' +
    progress.done + ' / ' + progress.total + ' դաս ավարտված</p></div>' + units + '</div>', 'physics');
  const path = app.querySelector('.phys-path');
  physNodeBind(path);
  physNodeTrack(path);
  physNodeBubbles(path);
  updatePathArrow();
}
