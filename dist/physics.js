// Ֆիզիկա 7. ուսուցման ճանապարհի էջը (/physics). գլուխները՝ բաժիններ, §-ները՝ կլոր հանգույցներ։
// Պատրաստ են միայն PHYSICS_LESSONS-ում գրառված դասերը, մնացածը կողպված են։
const physicsIcons = {
  lesson: '★',
  lab: '<svg viewBox="0 0 32 32" width="28" height="28" focusable="false"><path d="M12 4h8m-6 0v8L6 25a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L18 12V4" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  problems: '<svg viewBox="0 0 32 32" width="28" height="28" focusable="false"><path d="m6 26 1.5-6L21 6.5a2.8 2.8 0 0 1 4 4L11.5 24z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>'
};

function physicsStatus(section, current) {
  if (state.physics.done[section.id]) return 'done';
  return section === current ? 'current' : 'locked';
}

function physics() {
  physicsCloseTool();
  const units = PHYSICS_COURSE.chapters.map(chapter => {
    const current = physicsNextInChapter(chapter);
    const stops = chapter.sections.map((section, offset) => {
      const status = physicsStatus(section, current);
      return renderPathStop('§' + section.n + '. ' + section.title, offset, status,
        status === 'locked' ? '' : 'openPhysicsLesson(\'' + section.id + '\')', physicsIcons[section.kind]);
    }).join('');
    const complete = chapter.sections.every(section => state.physics.done[section.id]);
    return '<section class="path-unit" data-color="' + chapter.color % 7 + '"><div class="path-unit-heading"><h3>Գլուխ ' + chapter.n +
      ' · ' + esc(chapter.title) + '</h3></div><ol>' + stops + '</ol>' + courseMilestone(complete) + '</section>';
  }).join('');
  const progress = physicsProgress();
  app.innerHTML = courseLayout('<div class="learning-path phys-path"><h1>Ֆիզիկա 7</h1><div class="path-intro"><p>' +
    progress.done + ' / ' + progress.total + ' դաս ավարտված. մյուսները շուտով</p></div>' + units + '</div>', 'physics');
  updatePathArrow();
}
