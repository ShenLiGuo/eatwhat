const fs = require('fs');

// ========= 1. Update index.html =========
let html = fs.readFileSync('index.html', 'utf8');

const DIET_DISHES = [
  {n:'西兰花炒鸡胸',c:'减脂',cs:'减脂',f:['清淡'],r:true,e:'🥦',en:'broccoli chicken breast'},
  {n:'蒜蓉蒸鸡胸',c:'减脂',cs:'减脂',f:['蒜香','清淡'],r:true,e:'🍗',en:'garlic steamed chicken breast'},
  {n:'彩椒炒牛肉',c:'减脂',cs:'减脂',f:['香辣'],r:true,e:'🫑',en:'bell pepper beef stir fry lean'},
  {n:'番茄煮鱼片',c:'减脂',cs:'减脂',f:['酸甜','清淡'],r:true,e:'🐟',en:'tomato fish fillet light'},
  {n:'葱姜蒸鸡腿',c:'减脂',cs:'减脂',f:['蒜香','清淡'],r:true,e:'🍗',en:'ginger scallion steamed chicken'},
  {n:'芹菜炒牛肉',c:'减脂',cs:'减脂',f:['香辣'],r:true,e:'🥩',en:'celery beef stir fry lean'},
  {n:'香菇蒸鸡胸',c:'减脂',cs:'减脂',f:['清淡','酱香'],r:true,e:'🍄',en:'mushroom steamed chicken breast'},
  {n:'黑椒煎鸡胸',c:'减脂',cs:'减脂',f:['酱香'],r:true,e:'🍗',en:'black pepper chicken breast pan'},
  {n:'冬瓜炖鸡胸',c:'减脂',cs:'减脂',f:['清淡'],r:true,e:'🍲',en:'winter melon chicken breast stew'},
  {n:'秋葵炒牛肉',c:'减脂',cs:'减脂',f:['蒜香','清淡'],r:true,e:'🌿',en:'okra beef stir fry lean'},
  {n:'菌菇鸡胸煲',c:'减脂',cs:'减脂',f:['清淡','酱香'],r:true,e:'🍄',en:'mushroom chicken breast pot'},
  {n:'番茄炖鱼块',c:'减脂',cs:'减脂',f:['酸甜','清淡'],r:true,e:'🐟',en:'tomato fish stew light'},
  {n:'豆腐蒸鸡胸',c:'减脂',cs:'减脂',f:['清淡','蒜香'],r:true,e:'🫘',en:'tofu steamed chicken breast'},
  {n:'芦笋炒牛肉',c:'减脂',cs:'减脂',f:['清淡','蒜香'],r:true,e:'🌿',en:'asparagus beef stir fry lean'},
  {n:'菠菜拌鸡丝',c:'减脂',cs:'减脂',f:['清淡','蒜香'],r:false,e:'🥬',en:'spinach shredded chicken salad'},
  {n:'蒜蓉娃娃菜',c:'减脂',cs:'减脂',f:['蒜香','清淡'],r:false,e:'🥬',en:'garlic baby cabbage steamed'},
  {n:'清炒芥蓝',c:'减脂',cs:'减脂',f:['蒜香','清淡'],r:false,e:'🥬',en:'stir fried Chinese broccoli'},
  {n:'蒸南瓜',c:'减脂',cs:'减脂',f:['清淡','酸甜'],r:true,e:'🎃',en:'steamed pumpkin'},
  {n:'番茄炒菜花',c:'减脂',cs:'减脂',f:['清淡','酸甜'],r:true,e:'🥦',en:'tomato cauliflower stir fry'},
  {n:'菌菇炒时蔬',c:'减脂',cs:'减脂',f:['清淡'],r:false,e:'🍄',en:'mushroom mixed vegetables'},
  {n:'白灼秋葵',c:'减脂',cs:'减脂',f:['清淡','蒜香'],r:false,e:'🌿',en:'blanched okra light'},
  {n:'凉拌芹菜',c:'减脂',cs:'减脂',f:['清淡','蒜香'],r:false,e:'🥬',en:'celery salad cold'},
  {n:'蒸山药',c:'减脂',cs:'减脂',f:['清淡'],r:true,e:'🥔',en:'steamed Chinese yam'},
  {n:'蒜蓉蒸金针菇',c:'减脂',cs:'减脂',f:['蒜香','清淡'],r:false,e:'🍄',en:'garlic steamed enoki'},
  {n:'番茄炖豆腐',c:'减脂',cs:'减脂',f:['清淡','酸甜'],r:true,e:'🫘',en:'tomato tofu stew light'},
  {n:'凉拌菠菜',c:'减脂',cs:'减脂',f:['蒜香','清淡'],r:false,e:'🥬',en:'spinach salad cold'},
  {n:'黄瓜炒木耳',c:'减脂',cs:'减脂',f:['清淡'],r:false,e:'🥒',en:'cucumber wood ear stir fry'},
  {n:'蒸玉米',c:'减脂',cs:'减脂',f:['清淡','酸甜'],r:true,e:'🌽',en:'steamed corn'},
  {n:'西兰花炒口蘑',c:'减脂',cs:'减脂',f:['清淡','蒜香'],r:true,e:'🥦',en:'broccoli mushroom stir fry'},
  {n:'番茄菌菇汤',c:'减脂',cs:'减脂',f:['清淡','酸甜'],r:true,e:'🍲',en:'tomato mushroom soup light'},
  {n:'冬瓜海带汤',c:'减脂',cs:'减脂',f:['清淡'],r:true,e:'🍲',en:'winter melon seaweed soup'},
  {n:'豆腐青菜汤',c:'减脂',cs:'减脂',f:['清淡'],r:false,e:'🍲',en:'tofu greens soup light'},
  {n:'萝卜丝虾仁汤',c:'减脂',cs:'减脂',f:['清淡'],r:false,e:'🍲',en:'radish shrimp soup light'},
  {n:'丝瓜蛋花汤',c:'减脂',cs:'减脂',f:['清淡'],r:false,e:'🍲',en:'loofah egg drop soup'},
  {n:'菌菇豆腐汤',c:'减脂',cs:'减脂',f:['清淡'],r:true,e:'🍲',en:'mushroom tofu soup light'},
  {n:'番茄豆腐汤',c:'减脂',cs:'减脂',f:['清淡','酸甜'],r:true,e:'🍲',en:'tomato tofu soup light'},
  {n:'紫菜虾皮汤',c:'减脂',cs:'减脂',f:['清淡'],r:false,e:'🍲',en:'seaweed dried shrimp soup'},
  {n:'白菜豆腐汤',c:'减脂',cs:'减脂',f:['清淡'],r:true,e:'🍲',en:'napa tofu soup light'},
  {n:'冬瓜虾仁汤',c:'减脂',cs:'减脂',f:['清淡'],r:false,e:'🍲',en:'winter melon shrimp soup'},
  {n:'清蒸鳕鱼',c:'减脂',cs:'减脂',f:['清淡'],r:false,e:'🐟',en:'steamed cod fish light'},
  {n:'柠檬蒸虾',c:'减脂',cs:'减脂',f:['清淡','酸甜'],r:false,e:'🦐',en:'lemon steamed shrimp light'},
  {n:'白灼鱿鱼',c:'减脂',cs:'减脂',f:['清淡'],r:false,e:'🦑',en:'blanched squid light'},
  {n:'葱油蒸带子',c:'减脂',cs:'减脂',f:['蒜香','清淡'],r:false,e:'🦪',en:'scallion steamed scallops'},
  {n:'清蒸鲷鱼',c:'减脂',cs:'减脂',f:['清淡','蒜香'],r:false,e:'🐟',en:'steamed sea bream light'},
  {n:'凉拌鸡丝',c:'减脂',cs:'减脂',f:['蒜香','酱香'],r:false,e:'🍗',en:'shredded chicken salad cold'},
  {n:'醋拌海带',c:'减脂',cs:'减脂',f:['酸甜','蒜香'],r:false,e:'🥬',en:'vinegar kelp salad cold'},
  {n:'凉拌魔芋丝',c:'减脂',cs:'减脂',f:['酸辣','蒜香'],r:false,e:'🍜',en:'konjac noodle salad cold'},
  {n:'剁椒蒸金针菇',c:'减脂',cs:'减脂',f:['香辣','蒜香'],r:false,e:'🍄',en:'chopped chili steamed enoki'},
  {n:'柠檬手撕鸡',c:'减脂',cs:'减脂',f:['酸甜','蒜香'],r:false,e:'🍗',en:'lemon shredded chicken cold'},
];

const dishLines = DIET_DISHES.map(d => {
  const parts = Object.entries(d).map(([k,v]) =>
    k + ':' + (typeof v === 'string' ? "'" + v + "'" : JSON.stringify(v))
  );
  return '  {' + parts.join(',') + '}';
}).join(',\n');

// Insert before the last ]; of DEFAULT_DISHES
const marker = html.lastIndexOf('\n];');
html = html.slice(0, marker) + ',\n' + dishLines + '\n];' + html.slice(marker + 3);

// Update CAT_ORDER
html = html.replace(
  "const CAT_ORDER = ['荤菜', '素菜', '海鲜', '凉菜', '汤煲']",
  "const CAT_ORDER = ['荤菜', '素菜', '海鲜', '凉菜', '汤煲', '减脂']"
);

// Add 减脂 filter chip
html = html.replace(
  '<span class="filter-chip" data-filter="canton" onclick="setFilter(\'canton\')">粤菜</span>',
  '<span class="filter-chip" data-filter="canton" onclick="setFilter(\'canton\')">粤菜</span> <span class="filter-chip" data-filter="diet" onclick="setFilter(\'diet\')">🥗减脂</span>'
);

// Update activeFilter comment
html = html.replace(
  "let activeFilter = 'all'; // all | reheat | sichuan | canton",
  "let activeFilter = 'all'; // all | reheat | sichuan | canton | diet"
);

// Add diet filter logic
html = html.replace(
  "if(activeFilter==='canton'){ list = list.filter(d=>d.cs==='粤菜'); }",
  "if(activeFilter==='canton'){ list = list.filter(d=>d.cs==='粤菜'); } if(activeFilter==='diet'){ list = list.filter(d=>d.c==='减脂'); }"
);

// Add 减脂 to blind box flavors
html = html.replace(
  "{k:'孜然',e:'✨'}",
  "{k:'孜然',e:'✨'},{k:'减脂',e:'🥗'}"
);

// Add 减脂 gradient
html = html.replace(
  "--soup-grad:linear-gradient(135deg,#FFF3E0,#FFE4C4);",
  "--soup-grad:linear-gradient(135deg,#FFF3E0,#FFE4C4);--diet-grad:linear-gradient(135deg,#E8F5E9,#C8E6C9);"
);

// Add 减脂 to CAT_GRADS
html = html.replace(
  "'汤煲':'linear-gradient(135deg,#FFF3E0,#FFE4C4)'",
  "'汤煲':'linear-gradient(135deg,#FFF3E0,#FFE4C4)','减脂':'linear-gradient(135deg,#E8F5E9,#C8E6C9)'"
);

fs.writeFileSync('index.html', html, 'utf8');

// ========= 2. Rebuild dishes.js =========
let dishJs = fs.readFileSync('miniprogram/utils/dishes.js', 'utf8');
const ds = html.indexOf('const DEFAULT_DISHES = [');
const de = html.indexOf('\n];', html.indexOf('柠檬手撕鸡')) + 3;
const dishBlock = html.slice(ds, de);
let funcBlock = dishJs.slice(dishJs.indexOf('\nconst CAT_ORDER'));
funcBlock = funcBlock.replace(/CAT_ORDER = \[[^\]]+\]/, "CAT_ORDER = ['荤菜', '素菜', '海鲜', '凉菜', '汤煲', '减脂']");
funcBlock = funcBlock.replace(/\}\]/, "},{k:'减脂',e:'🥗'}]");
dishJs = dishJs.slice(0, dishJs.indexOf('const DEFAULT_DISHES = [')) + dishBlock + funcBlock;
fs.writeFileSync('miniprogram/utils/dishes.js', dishJs, 'utf8');

// ========= 3. Regenerate dishes.json =========
const d = require('./miniprogram/utils/dishes.js');
const data = { version: 4, updated: '2026-06-24', dishes: d.DEFAULT_DISHES.map(x=>({...x})) };
fs.writeFileSync('dishes.json', JSON.stringify(data, null, 2));

console.log('All done! ' + d.DEFAULT_DISHES.length + ' dishes');
console.log('CAT_ORDER: ' + d.CAT_ORDER.join(', '));
