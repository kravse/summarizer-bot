const fs = require('fs')
for (let folder of ['business', 'entertainment', 'politics', 'sport', 'tech']) {
  for (let i = 1; i < 100; i++) {
    try {
      let zeros = i < 10 ? '00' : i > 9 && i < 100 ? "0" : "";
      let article = fs.readFileSync(`data/news/${folder}/${zeros}${i}.txt`, 'utf8')
      let summary = fs.readFileSync(`data/summaries/${folder}/${zeros}${i}.txt`, 'utf8')
      fs.writeFileSync('data/finetune3.txt', `Content: "${article.replace(/\s+/g, ' ').trim()}"\n\nSummary: "${summary.replace(/\s+/g, ' ').trim()}" \n\n--SEPARATOR-- \n\n`, {
        flag: 'a'
      })
    } catch (err) {
      console.error(err)
    }
  }
}