const { query } = require('../db');

const ADJECTIVES = [
  'Agile','Azure','Brave','Bright','Brisk','Calm','Clear','Crisp','Daily','Deep',
  'Eager','Early','Fair','Firm','Fresh','Gentle','Grand','Happy','Ideal','Jolly',
  'Keen','Kind','Light','Loyal','Lucid','Merry','Mild','Noble','Open','Prime',
  'Pure','Quick','Quiet','Ready','Real','Rich','Safe','Sharp','Shy','Silent',
  'Smart','Soft','Solar','Solid','Sound','Still','Sunny','Swift','Tough','True',
  'Valid','Vivid','Warm','Whole','Wise','Young','Zonal','Bold','Cool','Free',
];

const ANIMALS = [
  'Alpaca','Badger','Bison','Condor','Crane','Deer','Dingo','Eagle','Egret',
  'Falcon','Ferret','Finch','Fox','Gazelle','Gecko','Heron','Hyena','Ibis',
  'Impala','Jackal','Jaguar','Kestrel','Koala','Lark','Lemur','Lynx','Meerkat',
  'Nuthatch','Osprey','Otter','Panda','Penguin','Puffin','Quail','Rabbit','Raven',
  'Robin','Seal','Stork','Swan','Tiger','Toucan','Urial','Viper','Walrus','Wolf',
  'Wren','Xenops','Yaffle','Zebra',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomNumber() {
  return Math.floor(Math.random() * 90) + 10; // 10–99
}

async function generateAlias() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `${pick(ADJECTIVES)}${pick(ANIMALS)}${randomNumber()}`;
    const { rows } = await query('SELECT 1 FROM users WHERE alias = $1', [candidate]);
    if (rows.length === 0) return candidate;
  }
  // Extremely unlikely — widen number range as fallback
  return `${pick(ADJECTIVES)}${pick(ANIMALS)}${Math.floor(Math.random() * 900) + 100}`;
}

module.exports = { generateAlias };
