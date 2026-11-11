import re,json,pathlib
root=pathlib.Path(__file__).parent
raw=pathlib.Path(r'C:/Users/User/.codex/attachments/6cff1ca1-72c0-4611-8536-efe51f15cb86/Pasted text.txt').read_text(encoding='utf-8-sig')
words=list(dict.fromkeys(w.strip() for w in re.split(r',|\r?\n',raw) if w.strip() and not re.fullmatch('[A-Z]',w.strip())))
pairs='''a|մի (անորոշ հոդ)
about|մասին, մոտավորապես
above|վերևում
absence|բացակայություն
absolute|բացարձակ
absolutely|բացարձակապես
abstract|վերացական
abstraction|վերացարկում
access|մուտք, հասանելիություն
accident|դժբախտ պատահար
accidental|պատահական
accidentally|պատահաբար
account|հաշիվ
achieve|հասնել, նվաճել
acid|թթու
acknowledge|ընդունել, ճանաչել
across|մյուս կողմում, միջով
act|գործել
action|գործողություն
activity|գործունեություն
actual|իրական
actually|իրականում
adapt|հարմարվել
add|ավելացնել
addition|ավելացում
address|հասցե, դիմել
advice|խորհուրդ
advise|խորհուրդ տալ
affect|ազդել
afford|իրեն թույլ տալ
afraid|վախեցած
after|հետո
afternoon|կեսօրից հետո
again|կրկին
against|դեմ
age|տարիք
ago|առաջ (ժամանակի մասին)
agree|համաձայնել
ahead|առջևում
air|օդ
airport|օդանավակայան
all|բոլորը, ամբողջ
allow|թույլ տալ
almost|գրեթե
alone|մենակ
along|երկայնքով
already|արդեն
also|նաև
always|միշտ
among|միջև (խմբի մեջ)
amount|քանակ
and|և
animal|կենդանի
another|մեկ այլ
answer|պատասխան, պատասխանել
any|որևէ, ցանկացած
anybody|որևէ մեկը
anyone|որևէ մեկը
anything|որևէ բան
anywhere|որևէ տեղ
appear|հայտնվել, թվալ
apple|խնձոր
apply|դիմել, կիրառել
approach|մոտեցում, մոտենալ
are|ես, ենք, եք, են (to be)
area|տարածք
argue|վիճել
arm|բազուկ
around|շուրջը
arrive|ժամանել
art|արվեստ
article|հոդված, հոդ
ask|հարցնել, խնդրել
at|մոտ, ժամը, մեջ (ըստ համատեքստի)
attempt|փորձ
attend|հաճախել, ներկա լինել
available|հասանելի
avoid|խուսափել
away|հեռու
baby|մանուկ
back|հետ, մեջք
bad|վատ
bag|պայուսակ
bank|բանկ, գետի ափ
be|լինել
beautiful|գեղեցիկ
because|որովհետև
become|դառնալ
bed|մահճակալ
before|նախքան
begin|սկսել
behind|հետևում
believe|հավատալ
below|ներքևում
best|լավագույն
better|ավելի լավ
between|միջև
big|մեծ
black|սև
blue|կապույտ
body|մարմին
book|գիրք, ամրագրել
both|երկուսն էլ
boy|տղա
bread|հաց
break|կոտրել, ընդմիջում
breakfast|նախաճաշ
bring|բերել
brother|եղբայր
build|կառուցել
business|բիզնես, գործ
busy|զբաղված
but|բայց
buy|գնել
call|զանգել, կոչել
can|կարողանալ
car|մեքենա
care|խնամք, հոգ տանել
carry|կրել, տանել
cat|կատու
change|փոփոխություն, փոխել
child|երեխա
children|երեխաներ
choose|ընտրել
city|քաղաք
class|դասարան, դաս
clean|մաքուր, մաքրել
close|փակել, մոտ
cold|ցուրտ, սառը
come|գալ
common|տարածված, ընդհանուր
company|ընկերություն
computer|համակարգիչ
country|երկիր
create|ստեղծել
day|օր
different|տարբեր
do|անել
dog|շուն
door|դուռ
drink|խմել, խմիչք
eat|ուտել
easy|հեշտ
English|անգլերեն, անգլիական
every|յուրաքանչյուր
example|օրինակ
family|ընտանիք
father|հայր
feel|զգալ
find|գտնել
first|առաջին
food|սնունդ
friend|ընկեր
from|ից, ից սկսած
get|ստանալ, ձեռք բերել
give|տալ
go|գնալ
good|լավ
great|հիանալի, մեծ
happy|ուրախ
have|ունենալ
he|նա (արական)
help|օգնել, օգնություն
here|այստեղ
home|տուն
house|տուն (շենք)
how|ինչպես
I|ես
in|մեջ
is|է
it|այն, դա
know|իմանալ, ճանաչել
language|լեզու
learn|սովորել
like|հավանել, նման
listen|լսել (ուշադրությամբ)
little|փոքր, քիչ
live|ապրել
look|նայել
love|սիրել, սեր
make|պատրաստել, ստեղծել
man|տղամարդ
many|շատ (հաշվելի)
money|փող
mother|մայր
much|շատ (անհաշվելի)
my|իմ
name|անուն
need|կարիք ունենալ
new|նոր
night|գիշեր
no|ոչ
not|չ-, ոչ
now|հիմա
of|ի, ից (պատկանելություն և այլ կապեր)
old|հին, տարեց
on|վրա
one|մեկ
open|բաց, բացել
or|կամ
other|այլ
our|մեր
people|մարդիկ
place|տեղ
play|խաղալ, նվագել
read|կարդալ
red|կարմիր
right|ճիշտ, աջ
room|սենյակ
say|ասել
school|դպրոց
see|տեսնել
she|նա (իգական)
small|փոքր
some|որոշ, մի քիչ
speak|խոսել
student|ուսանող, աշակերտ
study|ուսումնասիրել
take|վերցնել
teacher|ուսուցիչ
tell|ասել, պատմել
that|այն, որ
the|որոշյալ հոդ
their|նրանց
there|այնտեղ
they|նրանք
thing|բան
think|մտածել
this|այս
time|ժամանակ
to|դեպի, բայի անորոշ ձևի մասնիկ
today|այսօր
tomorrow|վաղը
two|երկու
under|տակ
understand|հասկանալ
use|օգտագործել
very|շատ
want|ուզել
water|ջուր
we|մենք
week|շաբաթ
well|լավ (մակբայ)
what|ինչ
when|երբ
where|որտեղ
which|որը
white|սպիտակ
who|ով
why|ինչու
will|ապառնիի օժանդակ բայ
with|հետ
woman|կին
word|բառ
work|աշխատանք, աշխատել
world|աշխարհ
write|գրել
year|տարի
yes|այո
yesterday|երեկ
you|դու, դուք
your|քո, ձեր
zero|զրո'''
translations=dict(line.split('|',1) for line in pairs.splitlines())
data=[{'en':w,'hy':translations.get(w,translations.get(w.lower(),''))} for w in words]
(root/'dist/words.js').write_text('const WORDS='+json.dumps(data,ensure_ascii=False)+';',encoding='utf-8')
print(json.dumps({'unique_words':len(data),'translated':sum(bool(x['hy']) for x in data)}))
