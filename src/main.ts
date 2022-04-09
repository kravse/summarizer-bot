require('dotenv').config();
const cohere = require('cohere-ai')
const request = require('request');
const { parse } = require('node-html-parser');
const sanitize = require('sanitize-html')
const key = process.env.COHERE_API_KEY

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
  "Figure caption, Warning: Third party content may contain advertsWork on the song began a couple of weeks ago, when Gilmour was shown Khlyvnyuk's Instagram feed. The singer had posted footage of himself in in Kyiv's Sofiyskaya Square, fully armed and ready to fight the Russian invasion.Facing the camera, Khlyvnyuk sang The Red Viburnum In The Meadow, a protest song written during the first world war, which has become a rallying cry in Ukraine over last six weeks."It just struck me that, as it is a capella, one could turn this into a beautiful song," Gilmour told BBC 6 Music's Matt Everitt.Image source, Pink FloydBy coincidence, Gilmour had performed live with BoomBox in 2015, at a London benefit gig for the Belarus Free Theatre - and he contacted Khlyvnyuk to seek permission."I spoke to him, actually, from his hospital bed, where he had a pretty minor injury from a mortar," the star said. "So he's right there on the front line."I played him a little bit of the song down the phone line and he gave me his blessing."The song was released at midnight on Friday, with proceeds going to humanitarian relief.View this post on Instagram"
  In summary: "Music news, Pink Floyd's having a reunion show. They've come back together in support of Ukrain to release their first new material in 28 years!
  --BREAK--
  "April 8A fox walks on the grounds of the U.S. Capitol on April 5, 2022 in Washington, D.C. Several individuals reported being approached and bitten by the fox, which has since been captured and euthanized. (Kevin Dietsch/Getty Images) commentsAs It Happens6:17Wild rabid fox bites U.S. congressman on Capitol HillA wild fox chase ensued on Capitol Hill earlier this week after the rabid animal bit nine people in Washington, D.C. Over on the Senate side … I felt something lunge at the back of my left calf and I thought it was going to be a small dog. And fortunately, I had my umbrella with me, spun around and [was] like, that's not a dog. That's a fox," Democratic Congressman Ami Bera, who was bit by the fox on Monday, told As It Happens guest host Dave Seglins. "It was crouched down, looking at me. I was looking at it," he recalled. "I kept it at bay and then someone saw what was happening and they yelled…. The Capitol police started to come out and then the fox ran off." Animal control officers captured and euthanized the female fox on Wednesday. The DC Public Health Lab confirmed that the vixen tested positive for rabies in a statement to the New York Times. A Humane Rescue Alliance Animal Care and Control officer attempts to trap a fox on the grounds of the U.S. Capitol on April 5. (Kevin Dietsch/Getty Images) Bera, who is also a physician, didn't see any blood when he examined his leg, which would have indicated whether the fox bit down hard enough to "
  In summary: "This is a story about a fox that bit at least 9 people in washington D.C., one of which was a congressman."
  --BREAK--
`

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
      temperature: 1,
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
        Summary: ${gen.text.replace('BREAK', '').replace(/\s+/g, ' ')}
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

