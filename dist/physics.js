// Ֆիզիկա 7. ուսուցման ճանապարհի էջը (/physics). գլուխները՝ բաժիններ, §-ները՝ կլոր հանգույցներ։
// Խիստ հերթականություն. current է միայն առաջին չավարտված §-ը (եթե պատրաստ է), մնացածը կողպված են։
// Եթե առաջին չավարտվածը դեռ պատրաստ չէ, նրա հանգույցի վրա «Շուտով» պիտակ է, և դրանից հետո ոչինչ չի բացվում։
function physicsStatus(section, next) {
  if (physicsDone(section.id)) return 'done';
  return section === next && physicsReady(section.id) ? 'current' : 'locked';
}

// «7 | 8» ընտրիչ. դասարանը փոխելիս նկարվում է այդ դասընթացի ճանապարհը (/physics կամ /physics/8)
function physGradeTabs() {
  return '<div class="phys-grades" role="group" aria-label="Դասարան">' + [7, 8].map(grade => '<button type="button" class="secondary" aria-pressed="' + (grade === physGrade) +
    '" onclick="openPhysicsGrade(' + grade + ')">Ֆիզիկա ' + grade + '</button>').join('') + '</div>';
}

function openPhysicsGrade(grade) {
  if (grade === physGrade) return;
  physSetGrade(grade);
  physics();
}

function physics() {
  physicsCloseTool();
  physNodesReset();
  const next = physicsNext();
  const course = physCourse();
  const units = course.chapters.map((chapter, index) => {
    const n = index + 1;
    const stops = chapter.sections.map((section, offset) => physNodeStopHtml(n, section, physicsStatus(section, next), [0, 1, 2, 2, 1, 0, 0, 1, 2, 1][offset % 10])).join('');
    const done = chapter.sections.filter(section => physicsDone(section.id)).length;
    const cover = physImageReady(chapter.cover) ? physImageTag(chapter.cover, 'phys-chapter-img') : '';
    return '<section class="path-unit phys-chapter ch' + n + '" data-color="' + chapter.color % 7 + '"><div class="path-unit-heading phys-heading" style="--pc:' + PHYS_NODE_META[n].color + ';--ps:' + PHYS_NODE_META[n].shadow + '">' + cover + '<div><h3>Գլուխ ' + chapter.n +
      ' · ' + esc(chapter.title) + '</h3><small>' + done + ' / ' + chapter.sections.length + ' դաս</small></div></div><ol>' + stops + '</ol>' +
      courseMilestone(done === chapter.sections.length) + '</section>';
  }).join('');
  const progress = physicsProgress();
  app.innerHTML = courseLayout('<div class="learning-path phys-path"><h1>Ֆիզիկա ' + physGrade + '</h1>' + physGradeTabs() + '<div class="path-intro"><p>' +
    progress.done + ' / ' + progress.total + ' դաս ավարտված</p></div>' + units + '</div>', 'physics');
  const path = app.querySelector('.phys-path');
  physNodeBind(path);
  physNodeTrack(path);
  physNodeBubbles(path);
  updatePathArrow();
}
