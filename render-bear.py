from pathlib import Path
import base64, cv2, numpy as np
from PIL import Image
from io import BytesIO
source=Path(r'C:/Users/User/AppData/Local/Packages/Microsoft.ScreenSketch_8wekyb3d8bbwe/TempState/Recordings/20261111-1307-32.8758232.mp4')
capture=cv2.VideoCapture(str(source))
capture.set(cv2.CAP_PROP_POS_FRAMES,161)
frames=[]
for number in range(69):
    ok,frame=capture.read()
    assert ok
    if number%2: continue
    rgb=cv2.cvtColor(frame[16:221,4:139],cv2.COLOR_BGR2RGB)
    neutral=(rgb.max(axis=2)-rgb.min(axis=2)<8)&(rgb.min(axis=2)>242)
    rgb[neutral]=255
    frames.append(Image.fromarray(rgb))
capture.release()
loop=BytesIO()
frames[0].save(loop,format='WEBP',save_all=True,append_images=frames[1:],duration=67,loop=0,quality=86,method=6)
still=BytesIO()
frames[0].save(still,format='WEBP',quality=88)
assert Image.open(loop).n_frames > 8
def uri(image):
    return 'data:image/webp;base64,'+base64.b64encode(image.getvalue()).decode()
p=Path('work/english-garden/dist/bear-art.js')
p.write_text('''function lessonBear() {
  return '<picture class="lesson-bear"><source media="(prefers-reduced-motion: reduce)" srcset="'''+uri(still)+'''">' +
    '<img src="'''+uri(loop)+'''" width="135" height="205" alt="" draggable="false"></picture>';
}
''',encoding='utf8')
print('Loop:',len(loop.getvalue()),'bytes;',Image.open(loop).n_frames,'encoded frames')
