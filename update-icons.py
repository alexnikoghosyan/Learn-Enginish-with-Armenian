from pathlib import Path
from PIL import Image
import io,base64,re
d=Path('dist')
def edit(file,fn):
 p=d/file
 p.write_text(fn(p.read_text(encoding='utf8')),encoding='utf8')
sources=dict(tiles='4e5767df',pencil='4c57e0a9',chest='e62657ff',dumbbell='f03c5a12',mouth='fcbb982d',cottage='70847e58',lightning='c31584b9',owlAvatar='9b12052c',bearAvatar='37531e88')
images={key:next(Path('C:/Users/User/Downloads').glob('*'+val+'*')) for key,val in sources.items()}
images['flame']=next(Path('C:/Users/User/.codex/generated_images').rglob('exec-e4b17429-3d20-4b0d-ba8c-0d98cb7243c2.png'))
assets={}
for key,path in images.items():
 im=Image.open(path).convert('RGBA')
 if key!='flame':
  im.thumbnail((384,384))
  pixels=[]
  for r,g,b,a in im.getdata():
   alpha=max(0,min(255,(max(r,g,b)-238)*20 + (b-r-4)*28)) if key=='dumbbell' else max(0,min(255,(max(r,g,b)-min(r,g,b)-5)*24+(247-min(r,g,b))*3))
   pixels.append((r,g,b,alpha))
  mask=Image.new('RGBA',im.size)
  mask.putdata(pixels)
  if key=='dumbbell': im=mask
  else: im=im.crop(mask.getbbox())
  if key!='dumbbell': pass
 else:
  im=im.crop(im.getbbox())
 im.thumbnail((144,144))
 out=io.BytesIO()
 im.save(out,format='WEBP',quality=89)
 assets[key]='data:image/webp;base64,'+base64.b64encode(out.getvalue()).decode()
edit('illustrations.js',lambda s:s.replace('function gardenIllustration', 'Object.assign(gardenIllustrations, {\n'+''.join(f'  {k}: "{v}",\n' for k,v in assets.items())+'});\n\nfunction gardenIllustration'))
def account(s):
 s=s.replace("bear: '🐻'", "bear: gardenIllustration('bearAvatar')").replace("owl: '🦉'", "owl: gardenIllustration('owlAvatar')")
 s=s.replace('  if (value && !warning) {','  if (warning) {\n    mark.className = "username-taken";\n    mark.textContent = "×";\n    mark.hidden = false;\n  }\n  if (value && !warning) {',1)
 return re.sub(r"const (flame|lightning) = '<svg[^\n]+",lambda m:f"const {m[1]} = gardenIllustration('{m[1]}');",s)
edit('account.js',account)
edit('reference-art.js',lambda s:s.replace('referenceArt[name]',"(gardenIllustrations[{ home: 'cottage', sounds: 'mouth', chest: 'chest', practice: 'pencil' }[name]] || referenceArt[name])"))
edit('word-lessons.js',lambda s:re.sub(r"const reviewPathIcon = .*?;</svg>.*?;|const reviewPathIcon = .*?'</svg>';", "const reviewPathIcon = gardenIllustration('dumbbell');",s,flags=re.S) if False else s[:s.index('const reviewPathIcon =')]+ "const reviewPathIcon = gardenIllustration('dumbbell');"+s[s.index(';',s.index('const reviewPathIcon ='))+1:])
edit('cumulative-review.js',lambda s:s.replace("question.sentence ? 'Դժվարացնել առաջադրանքը' : 'Օգտագործել բառերի բանկը'", "question.sentence ? 'Դժվարացնել առաջադրանքը' : gardenIllustration('tiles') + 'Օգտագործել բառերի բանկը'"))
edit('interface.css',lambda s:s+'''
.profile-stat-box .garden-illustration { width: 26px; height: 26px; flex: none; }
.profile-stat-box:not(.has-streak):not(.profile-xp) .garden-illustration { filter: grayscale(1); opacity: .45; }
.path-node .garden-illustration { width: 35px; height: 35px; mix-blend-mode: normal; }
.path-node:disabled .garden-illustration { filter: brightness(.7); }
#review-mode .garden-illustration { width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin-right: 6px; }
''')
