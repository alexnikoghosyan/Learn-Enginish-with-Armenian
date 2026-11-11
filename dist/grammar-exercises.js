// Armenian meaning | sentence to write | optional base → answer | sentence to arrange
const grammarExerciseRows = [
  'Նրանք պատրաստ են։|They are ready.|be>are|We are at home.',
  'Նա հոգնա՞ծ է։|Is she tired?|be>is|Are you ready?',
  'Ես մի նարինջ ունեմ։|I have an orange.| |The door is open.',
  'Սրանք իմ գրքերն են։|These are my books.|book>books|Those are her keys.',
  'Նա թեյ է խմում։|She drinks tea.|drink>drinks|He goes to school.',
  'Նա այստեղ աշխատո՞ւմ է։|Does he work here?|do>does|Do you like coffee?',
  'Նա գիրք է կարդում այս պահին։|She is reading a book.|read>reading|They are playing outside.',
  'Մենք երեկ տուն գնացինք։|We went home yesterday.|go>went|She bought a new bag.',
  'Ես քեզ կզանգեմ։|I will call you.| |She is going to study.',
  'Նա կարող է լողալ։|He can swim.| |You should ask for help.',
  'Հանդիպումը ժամը իննին է։|The meeting is at nine.| |The book is on the table.',
  'Այս պայուսակն ավելի փոքր է, քան քոնը։|This bag is smaller than yours.|small>smaller|How much water do you drink?',
  'Սեղանին երկու գիրք կա։|There are two books on the table.|be>are|There is a shop nearby.',
  'Նա ինձ ճանաչում է։|She knows me.|I>me|I often work with them.',
  'Այս գիրքն իմն է։|This book is mine.|my>mine|That blue bag is hers.',
  'Նա հաճախ ուշանում է։|She is often late.| |He usually walks to work.',
  'Նրանք ընթրում էին։|They were eating dinner.|eat>eating|I was reading when you called.',
  'Նա կորցրել է իր բանալիները։|She has lost her keys.|lose>lost|I have finished my homework.',
  'Ես երեկ տեսա նրան։|I saw him yesterday.|see>saw|Have you ever seen this film?',
  'Ես մայիսից այստեղ եմ աշխատում։|I have worked here since May.| |She has lived here for years.',
  'Նա սիրում է կարդալ։|She enjoys reading.|read>reading|I want to learn English.',
  'Եթե անձրև գա, ես կմնամ տանը։|If it rains, I will stay home.|rain>rains|I will call you if I have time.',
  'Սա այն ուսուցիչն է, որն ինձ օգնեց։|This is the teacher who helped me.| |I know a woman who speaks French.',
  'Դուռը երեկ ներկվեց։|The door was painted yesterday.|paint>painted|English is spoken in many countries.',
  'Որտե՞ղ է քո պայուսակը։|Where is your bag?| |Why are you tired?',
  'Ո՞վ կոտրեց պատուհանը։|Who broke the window?|break>broke|Who opened the door?',
  'Այս թեյը չափազանց տաք է։|This tea is too hot.| |The room is big enough.',
  'Նա նույնքան բարձրահասակ է, որքան ես։|She is as tall as I am.| |This bag is as heavy as yours.',
  'Նախկինում ես այստեղ էի ապրում։|I used to live here.| |Did you use to walk to school?',
  'Դու պետք է ցույց տաս տոմսդ։|You have to show your ticket.| |You must not touch that wire.',
  'Նա գուցե ուշանա։|She might be late.| |It may rain later.',
  'Եթե սառույցը տաքացնես, այն հալվում է։|If you heat ice, it melts.|melt>melts|If I sleep badly, I feel tired.',
  'Եթե մեքենա ունենայի, ավելի շատ կճանապարհորդեի։|If I had a car, I would travel more.|have>had|If I were you, I would ask for help.',
  'Նա արդեն մեկնել էր։|He had already left.|leave>left|The train had left before we arrived.',
  'Մայան ասաց, որ հոգնած էր։|Maya said that she was tired.|am>was|Ben said that he was ready.',
  'Խնդրում եմ՝ անջատիր այն։|Please turn it off.| |Please turn the light off.'
];

const grammarExercises = grammarExerciseRows.map(row => {
  const [meaning, sentence, change, arrangement] = row.split('|');
  const [base, form] = change.trim().split('>');
  return { meaning, sentence, base, form, arrangement };
});
