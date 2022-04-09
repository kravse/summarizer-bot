require('dotenv').config();
const cohere = require('cohere-ai')
const request = require('request');
const { parse } = require('node-html-parser');
const sanitize = require('sanitize-html')
const key = process.env.COHERE_API_KEY

let elToCleanText = (el) => {
  let clean = sanitize(el, {
    allowedTags: [],
    allowedAttributes: {}
  })
  if (clean.length > 3500) {
    clean = clean.slice(500, 3500)
  }
  return clean.replace(/\s+/g, ' ').replace('"', '').trim()
}

let getSummaryFromLink = async (link) => {
  cohere.init(key);
  request(link, async (err, resp, body) => {
    let root = parse(body)
    let title = root.querySelector('title').innerHTML;
    const generateResp = await cohere.generate("large", {
      prompt: `${sample}
        "${elToCleanText(root.querySelector('body'))}"
        In summary:"`.replace(/\n+/g, ' '),
      max_tokens: 175,
      num_generations: 3,
      temperature: 0.9,
      k: 0,
      p: 0.75,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop_sequences: ['--BREAK--'],
      return_likelihoods: 'NONE'
    });
    const classifyResp = await cohere.classify("medium", {
      taskDescription: 'Classify the best Title and Summary Combination',
      outputIndicator: 'Classify this article summary',
      inputs: generateResp.body?.generations.map(gen => `
        Title: ${title}
        Summary: "${gen.text.replace('BREAK', '').replace(/\s+/g, ' ')}
      `),
      examples: classifyExamples
    })
    let bestConfidence = 0
    let winningClass;
    classifyResp.body.classifications.forEach(val => {
      val.confidences.forEach(c => {
        if (c.option === 'Good' && c.confidence > bestConfidence) {
          bestConfidence = c.confidence
          winningClass = val;
        }
      })
    })
    console.log('-------')
    console.log(winningClass.input)
  })
}

let init = async () => {
  var arguments = process.argv;
  let link = arguments.find(a => a.startsWith('--link='));
  getSummaryFromLink(link.slice(7, link.length))
}

(async () => {
  init();
})();



const classifyExamples = [
  {
    text: `
      Title: We need to invest in health maintenance over treatment of disease, argues scientist | CBC Radio
      Summary: --BREAK--
    `,
    label: 'Bad'
  },
  {
    text: `
      Title: Six ways the federal budget on housing could affect the GTA | The Star
      Summary: This is a story about a fox that bit at least 9 people in washington D.C., one of which was a congressman. If you liked that, you can read this other one: A chicken soup a day, may prevent colds, flu and viruses. Just saying.By Sangeeta Mehta, Globe and Mail
    `,
    label: 'Bad'
  },
  {
    text: `
      Title: Oslo - Wikipedia
      Summary: e songs, now stands a terrorist cell that might be carrying out the next bombing." -UNI10:38Two Unrestricted Warzone to Bring Winter Warfare to CONFIG_USE_ASIATIContinue Reading From Dispatches\n' +
      'Tag: 上海夜网PL\n' +
      'Its Time To Face The Music On Solstice\n' +
      "It's Time To Face The Music On Solstice. Go beyond the little joys of summer
      `,
    label: 'Bad'
  },
  {
    text: `
      Title: Zelenskyy Says EU Politician Told Him to Prove 'All This Was Not Staged
      Summary: Justin Bieber confirms wife Hailey's pregnancy and offers first glimpse of baby bumpA peek at Bieber's family photo shoot revealed his wife Hailey Bieber has given birth, according to TMZ.Sources tell TMZ that Bieber and his wife, who recently married, are in Miami, where she is set to give birth in the next couple of weeks.
    `,
    label: 'Bad'
  },
  {
    text: `
      Title: Ukraine chess sisters refuse to sign anti-Russian letter - The Press United | International News Analysis, Viewpoint Summary: 'Man found guilty of concealing links to China in work with two firms prosecuted over business links with state-owned company in US`,
    label: 'Bad'
  },
  {
    text: `
      Title: Video of Democratic Senator Blasting Josh Hawley Garners 3.2 Million Views
      Summary: A video of Senator Brian Schatz, a Hawaii Democrat, blasting GOP Senator Josh Hawley over his efforts to block President Joe Biden's Defense Department nominations has been viewed more than 3 million times on Twitter.
    `,
    label: 'Good'
  },
  {
    text: `
      Title: China’s Economy Needs Helping Hand to Reach 5.5% Growth Target, Chief Economists Say
      Summary: China’s economy needs further policy support to achieve the targeted 5.5 percent expansion this year, according to chief economists at major Chinese financial institutions polled by Yicai Global. Ten of the 17 economists surveyed said that in the current economic environment the government must increase support for the economy to hit the annual growth target. Their average estimate was for a 5.19 percent increase in gross domestic product.
    `,
    label: 'Good'
  },
  {
    text: `
      Title: How old cooking oil helped power Airbus's biggest plane | Popular Science
      Summary: Airbus may have decided to stop producing its double-decker A380 aircraft more than three years ago, but the company is now using one of those giant planes as a testbed to experiment with technology that could play a role in the future of aviation. Last Friday, an A380 test aircraft flew for some three hours with one of its four engines powered by 100-percent sustainable aviation fuel.
    `,
    label: 'Good'
  },
  {
    text: `
      Title: Most managers say they would cut pay or even fire workers who refuse to come back to the office | Fortune
      Summary: About 77% of managers said they’d be willing to implement “severe consequences”—including firing workers or cutting pay and benefits—on those who refuse to return to the office, according to a recent survey by employment background check company GoodHire of 3,500 American managers.
    `,
    label: 'Good'
  },
  {
    text: `
      Title: Singh wants to see Trudeau go harder on the wealthy | CTV News
      Summary:  The 2022 federal budget includes a pair of tax increases for big banks and insurance companies that will bring in more than $6 billion in revenue and put high income earners on notice that they could be next. But NDP Leader Jagmeet Singh says he thinks Prime Minister Justin Trudeau should have gone further.
    `,
    label: 'Good'
  }
]
const sample = `
  "orts Science &amp; Tech Science &amp; Tech …… The Canadian PressCanada's premiers disappointed in lack of federal funds for struggling health systemsRead full articleApril 8, 2022, 5:03 p.m.·1 min readOTTAWA — Canada's premiers say they're disappointed the federal government didn't put forward a sustainable plan to financially shore up the country's ailing health systems in its newly tabled budget.Premiers have been calling for the health minister to negotiate a new deal for how much the federal government will pay into health care in Canada, with an immediate increase of about $28 billion.The federal budget included $12 billion more than expected over five years for provincial health transfers, but only because the economic outlook is better than expected."
  In summary: "Premiers have been calling for the health minister to negotiate a new deal for how much the federal government will pay into health care in Canada, with an immediate increase of about $28 billion. The federal budget included $12 billion more than expected over five years for provincial health transfers, but only because the economic outlook is better than expected."
  --BREAK--
  "HOT TOPICS Science Technology DIY Reviews Health Animals Space Environment Gadgets Goods EXPLORE Subscriber Login Newsletters Podcasts Video Merch PopSci Shop FIND US ON Facebook Twitter LinkedIn Instagram Pinterest Youtube Flipboard Apple News+ RSS SOCIAL Newsletter Sign-up Airbus just flew its biggest plane yet using sustainable aviation fuel Derived in part from old cooking oil, the special fuel powered one of the A380's four engines. By Rob Verger | Published Mar 29, 2022 7:00 PM Technology Aviation The Airbus A380 used in the tests. Airbus SHARE Airbus may have decided to stop producing its double-decker A380 aircraft more than three years ago, but the company is now using one of those giant planes as a testbed to experiment with technology that could play a role in the future of aviation."
  In summary: "Airbus may have decided to stop producing its double-decker A380 aircraft more than three years ago, but the company is now using one of those giant planes as a testbed to experiment with technology that could play a role in the future of aviation. Last Friday, an A380 test aircraft flew for some three hours with one of its four engines powered by 100-percent sustainable aviation fuel."
  --BREAK--
  "s: C. whiteheadi Binomial name Calyptomena whiteheadiSharpe, 1888 Whitehead's broadbill (Calyptomena whiteheadi) is a species of bird in the family Calyptomenidae. It is endemic to mountain ranges of north-central Borneo, where it mainly inhabits montane forests and forest edges at elevations of 900–1,700 m (3,000–5,600 ft). It is 24–27 cm (9.4–10.6 in) long, with males weighing 142–171 g (5.0–6.0 oz) and females weighing 150–163 g (5.3–5.7 oz). Males are vivid green and have a black throat patch, black spots on the ear-coverts and back of the neck, and black markings and streaking all over the body. The tails and flight feathers are also blackish. Females are smaller and lack the black markings on the head and underparts."
  In summary: "Whitehead's broadbill is a species of bird in the family Calyptomenidae. It is endemic to mountain ranges of north-central Borneo, where it mainly inhabits montane forests and forest edges at elevations of 900–1,700 m (3,000–5,600 ft). Males are vivid green and have a black throat patch, black spots on the ear-coverts and back of the neck, and black markings and streaking all over the body. The tails and flight feathers are also blackish."
  --BREAK--
`