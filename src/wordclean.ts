const fs = require('fs')
let article = fs.readFileSync(`./final-clean-list.txt`, 'utf8').split('\n')
// let badWords = fs.readFileSync(`./negative-words.txt`, 'utf8').split('\n')
// badWords = badWords.map(v => v.replace(/[^a-z0-9]/gi, ''))
// console.log(article);
// article = article.filter((val, i) => val.length > 4 && val.length < 8)
article = article.filter((word, i) => word.length > 4 && word.length < 9);


// article = article.filter((word, i) => article.indexOf(word) === i);
fs.writeFileSync('./animals.txt', article.sort().join("\n"), {
  flag: 'w'
})
// for (let folder of ['business', 'entertainment', 'politics', 'sport', 'tech']) {
//   for (let i = 1; i < 100; i++) {
//     try {
//       let zeros = i < 10 ? '00' : i > 9 && i < 100 ? "0" : "";
//       let summary = fs.readFileSync(`data/summaries/${folder}/${zeros}${i}.txt`, 'utf8')
//       fs.writeFileSync('data/finetune3.txt', `Content: "${article.replace(/\s+/g, ' ').trim()}"\n\nSummary: "${summary.replace(/\s+/g, ' ').trim()}" \n\n--SEPARATOR-- \n\n`, {
//         flag: 'a'
//       })
//     } catch (err) {
//       console.error(err)
//     }
//   }
// }