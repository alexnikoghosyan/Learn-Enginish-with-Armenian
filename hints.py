import json,re,urllib.request,zipfile,io,pathlib
p=pathlib.Path(__file__).parent/'dist'
with urllib.request.urlopen('https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/corpora/wordnet.zip',timeout=20) as r:
    z=zipfile.ZipFile(io.BytesIO(r.read()))
data={}
for file in ('noun','verb','adj','adv'):
    for line in z.read('wordnet/data.'+file).decode().splitlines():
        if not line or not line[0].isdigit(): continue
        body,_,gloss=line.partition('|')
        fields=body.split()
        count=int(fields[3],16)
        aliases=fields[4:4+count*2:2]
        index=4+count*2
        parents=[]
        for start in range(index+1,index+1+int(fields[index])*4,4):
            if fields[start] in ('@','@i'):
                parents.append((fields[start+2],fields[start+1]))
        pos=fields[2].replace('s','a')
        data[pos,fields[0]]=aliases,parents,gloss.strip()
icons={
'animal':'🐾','mammal':'🐾','bird':'🐦','fish':'🐟','insect':'🐝','reptile':'🦎','plant':'🌱','flower':'🌷','tree':'🌳','fruit':'🍎','vegetable':'🥕','food':'🍽️','beverage':'🥤','meal':'🍽️','person':'👤','worker':'🧑‍🔧','professional':'🧑‍💼','relative':'👨‍👩‍👧','human_body':'🧍','body_part':'🧍','organ':'🫀','location':'📍','city':'🏙️','country':'🗺️','building':'🏠','vehicle':'🚗','aircraft':'✈️','ship':'🚢','clothing':'👕','tool':'🛠️','device':'⚙️','instrument':'🎛️','furniture':'🪑','container':'📦','equipment':'🛠️','computer':'💻','writing':'📝','publication':'📚','communication':'💬','language':'🔤','music':'🎵','sound':'🔊','color':'🎨','time':'🕒','weather':'🌦️','water':'💧','material':'🧱','chemical':'🧪','substance':'🧪','disease':'🩺','medicine':'🩺','sport':'🏅','money':'💰','organization':'🏢','group':'👥','number':'🔢','quantity':'🔢','shape':'🔶','movement':'➡️','travel':'🧭','activity':'🏃','cognition':'💭','feeling':'💛','emotion':'💛','change':'🔄','transfer':'🤝','motion':'➡️','perception':'👁️','contact':'🤝','creation':'🛠️','possession':'🎒','consumption':'🍴'}
def icon(start):
    queue=[start]; seen=set()
    while queue:
        key=queue.pop(0)
        if key in seen or key not in data: continue
        seen.add(key)
        names,parents,gloss=data[key]
        for name in names:
            if name in icons: return icons[name],name.replace('_',' ')
        queue.extend(parents)
    return None
index={}
for file in ('noun','verb','adj','adv'):
    for line in z.read('wordnet/index.'+file).decode().splitlines():
        if line.startswith(' ') or not line: continue
        row=line.split()
        index.setdefault(row[0],[]).append((row[1],row[6+int(row[3])]))
for file in ('noun','verb','adj','adv'):
    for line in z.read('wordnet/'+file+'.exc').decode().splitlines():
        row=line.split()
        for lemma in row[1:]:
            if lemma in index: index.setdefault(row[0],index[lemma]); break
words=json.loads((p/'words.js').read_text(encoding='utf8').removeprefix('const WORDS=').rstrip(';'))
result={}
for word in words:
    en=word['en']
    keys=index.get(en.lower().replace(' ','_'),[])
    for key in keys:
        if key not in data: continue
        _,_,gloss=data[key]
        definition=gloss.split('; "')[0].strip()
        examples=re.findall(r'"([^"]+)"',gloss)
        art=icon(key) or ('','')
        result[en]=[definition,examples[0] if examples else '',*art]
        break
(p/'hints.js').write_text('const WORD_HINTS='+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';',encoding='utf8')
(p/'wordnet-license.txt').write_bytes(z.read('wordnet/LICENSE'))
print('Dictionary hints:',len(result))
