from pathlib import Path
import re,io,base64
from PIL import Image, ImageDraw
d=Path('dist')
def edit(f,fn):
 p=d/f
 p.write_text(fn(p.read_text(encoding='utf8')),encoding='utf8')
def cut(m):
 im=Image.open(io.BytesIO(base64.b64decode(m[2]))).convert('RGBA')
 mask=im.convert('RGB').point(lambda x:x)
 mask=Image.frombytes('L', im.size, bytes(255 if min(r,g,b)>224 and max(r,g,b)-min(r,g,b)<20 else 0 for r,g,b,a in im.getdata()))
 for x,y in [(x,y) for x in range(im.width) for y in (0,im.height-1)]+[(x,y) for y in range(im.height) for x in (0,im.width-1)]:
  if mask.getpixel((x,y))==255: ImageDraw.floodfill(mask,(x,y),128)
 im.putalpha(Image.frombytes('L',im.size,bytes(0 if edge==128 else a for edge,a in zip(mask.getdata(),im.getchannel('A').getdata()))))
 out=io.BytesIO()
 im.save(out,format='WEBP',lossless=True)
 return m[1]+base64.b64encode(out.getvalue()).decode()
edit('illustrations.js',lambda s:re.sub(r'(\b(?:mouth|pencil|cat|bearAvatar|cottage|owlAvatar|fox|frog|rabbit|chest|lightning|tiles): "data:image/webp;base64,)([^"]+)',cut,s))
edit('course-layout.js',lambda s:s.replace('<progress value="\' + fill +\n    \'" max="\' + total + \'" aria-label="Դասի առաջընթաց"></progress>', '<div class="lesson-meter" role="progressbar" aria-label="Դասի առաջընթաց" aria-valuemin="0" aria-valuenow="\' + fill + \'" aria-valuemax="\' + total + \'"><span style="width:\' + (100 * fill / total) + \'%"></span></div>')+'''
let lessonTransitionRunning = false;

function setLessonProgress(value) {
  const meter = app.querySelector('.lesson-meter');
  if (!meter) return;
  meter.setAttribute('aria-valuenow', value);
  meter.firstElementChild.style.width = (100 * value / Number(meter.getAttribute('aria-valuemax'))) + '%';
}

async function transitionLesson(render, direction = 1) {
  if (lessonTransitionRunning) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    render();
    return;
  }
  lessonTransitionRunning = true;
  const previousMeter = app.querySelector('.lesson-meter span');
  const previousWidth = previousMeter && previousMeter.getBoundingClientRect().width;
  const oldContent = app.firstElementChild;
  const animatedContent = () => [...app.children].flatMap(element =>
    element.matches('.focus-lesson-header') ? [] :
      element.querySelector(':scope > .focus-lesson-header') ?
        [...element.children].filter(child => !child.matches('.focus-lesson-header')) : [element]);
  const animate = (frames, duration) => Promise.all(animatedContent().map(element =>
    element.animate(frames, { duration, easing: 'ease-out', fill: 'backwards' }).finished.catch(() => {})));
  try {
    const outgoing = animatedContent().map(element => element.animate([
      { opacity: 1, transform: 'translateX(0)' },
      { opacity: 0, transform: 'translateX(' + (-direction * 24) + 'px)' }
    ], { duration: 140, easing: 'ease-in', fill: 'forwards' }));
    await Promise.all(outgoing.map(animation => animation.finished.catch(() => {})));
    if (oldContent !== app.firstElementChild) return;
    render();
    const next = app.querySelector('.lesson-meter span');
    if (next && previousMeter) {
      next.animate([{ width: previousWidth + 'px' }, { width: next.style.width }],
        { duration: 360, easing: 'ease-out' });
    }
    await animate([
      { opacity: 0, transform: 'translateX(' + (direction * 24) + 'px)' },
      { opacity: 1, transform: 'translateX(0)' }
    ], 220);
  } finally {
    lessonTransitionRunning = false;
  }
}
''')
edit('word-lessons.js',lambda s:s.replace('function moveWordLesson(direction) {','function moveWordLesson(direction) {\n  if (lessonTransitionRunning) return;').replace('      drawWordLesson(true);','      transitionLesson(() => drawWordLesson(true));').replace('  save();\n  drawWordLesson();\n}', '  save();\n  transitionLesson(drawWordLesson, direction);\n}'))
edit('grammar-path.js',lambda s:s.replace('function checkGrammarPractice() {','function checkGrammarPractice() {\n  if (lessonTransitionRunning) return;').replace('    drawGrammarPractice();\n    return;', '    transitionLesson(drawGrammarPractice);\n    return;'))
edit('cumulative-review.js',lambda s:s.replace('function checkReviewAnswer() {','function checkReviewAnswer() {\n  if (lessonTransitionRunning) return;').replace('    drawReviewQuestion();\n    return;', '    transitionLesson(drawReviewQuestion);\n    return;'))
edit('sounds.js',lambda s:s.replace("app.querySelector('.focus-lesson-header progress').value = soundCursor + 1;",'setLessonProgress(soundCursor + 1);').replace('function advanceSoundRound() {','function advanceSoundRound() {\n  if (lessonTransitionRunning) return;').replace('{ drawSoundQuestion(); return; }','{ transitionLesson(drawSoundQuestion); return; }'))
edit('interface.css',lambda s:s+'''
aside nav button:active i { transform: none; }
:is(.avatar-options button, .review-bank button, .review-grid .picture-tile, .sound-tile, .sound-options .option)[aria-pressed="true"]:not(.correct),
aside nav button.active {
  background: #ddf4ff;
  border-color: #8ad8ff;
  box-shadow: 0 4px #84d8ff;
}
:is(.avatar-options button, .review-bank button, .review-grid .picture-tile, .sound-tile, .sound-options .option)[aria-pressed="true"]:not(:disabled):active {
  box-shadow: 0 1px #84d8ff;
}
@media (hover: hover) {
  :is(.avatar-options button, .review-bank button, .review-grid .picture-tile, .sound-tile, .sound-options .option)[aria-pressed="false"]:not(:disabled):hover,
  aside nav button:not(.active):hover {
    background: #f5f5f5;
    border-color: #e2e2e2;
    color: var(--ink);
  }
}
.lesson-meter { width: 100%; height: 16px; background: #e3e3e3; border-radius: 999px; overflow: hidden; }
.lesson-meter > span {
  display: block;
  position: relative;
  height: 100%;
  background: #58cc02;
  border-radius: inherit;
  transition: width .36s ease-out;
  overflow: hidden;
}
.lesson-meter > span::before {
  content: "";
  position: absolute;
  inset: 4px 5px auto;
  height: 4px;
  background: #83dd30;
  border-radius: 999px;
}
@media (prefers-reduced-motion: reduce) {
  .lesson-meter > span { transition: none; }
}
''')
