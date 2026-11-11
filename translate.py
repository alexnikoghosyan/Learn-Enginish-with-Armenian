import json, re, urllib.request, urllib.parse, concurrent.futures, pathlib
p=pathlib.Path('work/english-garden/dist')
words=json.loads((p/'words.js').read_text(encoding='utf8').removeprefix('const WORDS=').rstrip(';'))
todo=[w for w in words if not w['hy']]
def batch(group):
    text='\n'.join(f'{i+1}. {w["en"]}' for i,w in enumerate(group))
    url='https://translate.googleapis.com/translate_a/single?'+urllib.parse.urlencode(dict(client='gtx',sl='en',tl='hy',dt='t',q=text))
    try:
        with urllib.request.urlopen(url,timeout=14) as r: result=json.load(r)
        out=''.join(x[0] or '' for x in result[0])
        rows=re.findall(r'(?m)^\s*(\d+)\s*[.)։:]\s*([^\n]+)',out)
        for i,hy in rows:
            if 0<int(i)<=len(group) and re.search('[ա-ֆԱ-Ֆ]',hy):
                group[int(i)-1]['mt']=hy.strip()
    except Exception as e: print(type(e).__name__, str(e)[:120],flush=True)
with concurrent.futures.ThreadPoolExecutor(8) as pool:
    list(pool.map(batch,[todo[i:i+55] for i in range(0,len(todo),55)]))
(p/'words.js').write_text('const WORDS='+json.dumps(words,ensure_ascii=False,separators=(',',':'))+';',encoding='utf8')
print('machine translations:',sum('mt' in w for w in words))
