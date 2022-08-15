const fs = require('fs')
let article = fs.readFileSync(`./final-clean-list.txt`, 'utf8').split('\n')
for (let j = 0; j < 25; j++) {
  let words = [];
  for (let i = 0; i < 3; i++) {
    let rand = Math.floor(Math.floor(Math.random() * article.length) + 1);
    words.push(article[rand]);
  }
  console.log(words.join('-') + '\n');
}