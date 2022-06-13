import {R} from 'rethinkdb-ts'
import {PALETTE} from '../../../client/styles/paletteV3'

type PromptInput = {
  question: string
  description: string
  templateId: string
  sortOrder: number
  promptColor?: string
  promptId?: string
}

const promptColors = [
  PALETTE.JADE_400,
  PALETTE.TOMATO_500,
  PALETTE.GOLD_300,
  PALETTE.LILAC_500,
  PALETTE.SKY_300,
  PALETTE.TERRA_300,
  PALETTE.FUSCIA_400,
  PALETTE.SLATE_700
]

const nameToId = (name: string, isTemplate: boolean) => {
  const cleanedName = name
    .replace(/[^0-9a-z-A-Z ]/g, '') // remove emojis and apostrophes
    .split(' ')
    .map(
      (name, idx) =>
        (idx === 0 ? name.charAt(0).toLowerCase() : name.charAt(0).toUpperCase()) + name.slice(1)
    )
    .join('')
    .trim()
  return `${cleanedName}${isTemplate ? 'Template' : 'Prompt'}`
}

const templateNames = [
  'Speed Car 🏎️',
  'WRAP 🧞',
  'Marie Kondo Retrospective 😌',
  'Original 4',
  'Rose, Thorn, Bud 🌹',
  'Hopes and Fears 🎭',
  'Surprised, Worried, Inspired 😯',
  'Superhero Retrospective 🦸',
  'Six Thinking Hats 🎩',
  'Hot Air Balloon 🎈',
  'Hero’s Journey 👑',
  'Keep, Problem, Try 🤔',
  'SaMoLo ⚖️',
  'SWOT Analysis 🎯',
  'Hands on Deck Activity 🚢',
  'Highlights & Lowlights 🎢',
  'New Year Retrospective 🗓️',
  'A Christmas Carol Retrospective 🎅🏼',
  'Always Be Learning Retrospective 🌱',
  'Dream Team Retrospective 🦄',
  'Thanksgiving Retrospective 🥧',
  'Diwali Retrospective 🪔',
  'Halloween Retrospective 🎃',
  'Questions, Comments, Concerns❓',
  'Team Retreat Planning 🌴'
]

const promptsInfo = [
  {
    templateId: nameToId('Speed Car 🏎️', true),
    question: 'Engine',
    description: 'What’s helping us move faster?',
    sortOrder: 0
  },
  {
    templateId: nameToId('Speed Car 🏎️', true),
    question: 'Parachute',
    description: 'What’s slowing us down?',
    sortOrder: 1
  },
  {
    templateId: nameToId('WRAP 🧞', true),
    question: 'Wishes',
    description: 'What are your wishes for the team or your work? What would make work better?',
    sortOrder: 0
  },
  {
    templateId: nameToId('WRAP 🧞', true),
    question: 'Risks',
    description:
      'What risks or challenges lie ahead? What was risky about our work in the last period?',
    sortOrder: 1
  },
  {
    templateId: nameToId('WRAP 🧞', true),
    question: 'Appreciation',
    description: 'Who made this sprint special or did exceptional work?',
    sortOrder: 2
  },
  {
    templateId: nameToId('WRAP 🧞', true),
    question: 'Puzzles',
    description: 'What unresolved questions do you have?',
    sortOrder: 3
  },
  {
    templateId: nameToId('Marie Kondo Retrospective 😌', true),
    question: 'What Sparks Joy?',
    description: 'What processes, tools, and skills are serving you well?',
    sortOrder: 0
  },
  {
    templateId: nameToId('Marie Kondo Retrospective 😌', true),
    question: 'Thank you and Goodbye',
    description: 'What do you want to stop doing, having, or using, or just stop from happening?',
    sortOrder: 1
  },
  {
    templateId: nameToId('Marie Kondo Retrospective 😌', true),
    question: 'Things to Upcycle',
    description: 'What could serve you well if it was changed or improved?',
    sortOrder: 2
  },
  {
    templateId: nameToId('Original 4', true),
    question: 'Wins 🏆',
    description: 'What did we do well, that we should discuss so we don’t forget?',
    sortOrder: 0
  },
  {
    templateId: nameToId('Original 4', true),
    question: 'Learnings 🎓 ',
    description: 'What did we learn?',
    sortOrder: 1
  },
  {
    templateId: nameToId('Original 4', true),
    question: 'Improvements ♻️ ',
    description: 'What should we do differently next time?',
    sortOrder: 2
  },
  {
    templateId: nameToId('Original 4', true),
    question: 'Questions ❓',
    description: 'What still puzzles us?',
    sortOrder: 3
  },
  {
    templateId: nameToId('Rose, Thorn, Bud 🌹', true),
    question: 'Rose',
    description: 'What went well? Which of our current practices or skills are strong?',
    sortOrder: 0
  },
  {
    templateId: nameToId('Rose, Thorn, Bud 🌹', true),
    question: 'Thorn',
    description: 'What challenges or difficulties did we run into?',
    sortOrder: 1
  },
  {
    templateId: nameToId('Rose, Thorn, Bud 🌹', true),
    question: 'Bud',
    description: 'What are our opportunities for growth and improvement?',
    sortOrder: 2
  },
  {
    templateId: nameToId('Hopes and Fears 🎭', true),
    question: 'Hopes 🙏',
    promptId: 'hopesPrompt-2',
    description: 'What do you hope for in the next period?',
    sortOrder: 0
  },
  {
    templateId: nameToId('Hopes and Fears 🎭', true),
    question: 'Fears 🧟 ',
    description: 'What are you worried about for the next period?',
    sortOrder: 1
  },
  {
    templateId: nameToId('Surprised, Worried, Inspired 😯', true),
    question: 'Surprised',
    description: 'What caught you off guard, positively or negatively?',
    sortOrder: 0
  },
  {
    templateId: nameToId('Surprised, Worried, Inspired 😯', true),
    question: 'Worried',
    description: 'What are you anxious about?',
    sortOrder: 1
  },
  {
    templateId: nameToId('Surprised, Worried, Inspired 😯', true),
    question: 'Inspired',
    description: 'What has you energized for the future?',
    sortOrder: 2
  },
  {
    templateId: nameToId('Superhero Retrospective 🦸', true),
    question: 'Superpower',
    description: 'What are your strongest skills?',
    sortOrder: 0
  },
  {
    templateId: nameToId('Superhero Retrospective 🦸', true),
    question: 'Gadgets',
    description: 'What people, tools, or processes are most helpful?',
    sortOrder: 1
  },
  {
    templateId: nameToId('Superhero Retrospective 🦸', true),
    question: 'Nemesis',
    description: 'What makes your role more difficult?',
    sortOrder: 2
  },
  {
    templateId: nameToId('Superhero Retrospective 🦸', true),
    question: 'Role',
    description:
      'Where do you fit into the team? How do you see your role interacting with others?',
    sortOrder: 3
  },
  {
    templateId: nameToId('Six Thinking Hats 🎩', true),
    question: 'Blue Hat',
    promptColor: PALETTE.SKY_400,
    description: 'What do we want to achieve in this session?',
    sortOrder: 0
  },
  {
    templateId: nameToId('Six Thinking Hats 🎩', true),
    question: 'White Hat',
    promptColor: PALETTE.SLATE_100,
    description: 'What are the facts or information we have about the last sprint?',
    sortOrder: 1
  },
  {
    templateId: nameToId('Six Thinking Hats 🎩', true),
    question: 'Yellow Hat',
    promptColor: PALETTE.GOLD_300,
    description: 'What was good about the last sprint?',
    sortOrder: 2
  },
  {
    templateId: nameToId('Six Thinking Hats 🎩', true),
    question: 'Black Hat',
    promptColor: PALETTE.SLATE_900_32,
    description: 'What was bad about the last sprint?',
    sortOrder: 3
  },
  {
    templateId: nameToId('Six Thinking Hats 🎩', true),
    question: 'Green Hat',
    promptColor: PALETTE.JADE_400,
    description: 'What things could improve for our next sprint?',
    sortOrder: 4
  },
  {
    templateId: nameToId('Six Thinking Hats 🎩', true),
    question: 'Red Hat',
    promptColor: PALETTE.TOMATO_700,
    description: 'What’s your overall feeling about the previous sprint?',
    sortOrder: 5
  },
  {
    templateId: nameToId('Hot Air Balloon 🎈', true),
    question: 'Hot Air',
    description:
      'Looking back, what practices or processes elevate our team and help us reach great new heights?',
    sortOrder: 0
  },
  {
    templateId: nameToId('Hot Air Balloon 🎈', true),
    question: 'Sandbags',
    description:
      'Looking back, what practices or processes are dragging us down, making us slow, or demoralizing us?',
    sortOrder: 1
  },
  {
    templateId: nameToId('Hot Air Balloon 🎈', true),
    question: 'Storm Clouds',
    description:
      'Looking ahead, what difficult or tricky things are in store for our team? What things could throw us off course or be dangerous?',
    sortOrder: 2
  },
  {
    templateId: nameToId('Hot Air Balloon 🎈', true),
    question: 'Clear Skies',
    description:
      'Looking ahead, how could we avoid or manage threats and challenges? How could we push through them to reach clearer skies?',
    sortOrder: 3
  },
  {
    templateId: nameToId('Hero’s Journey 👑', true),
    question: 'Hero',
    description: 'What are the attitudes and characteristics that make our team heroic?',
    sortOrder: 0
  },
  {
    templateId: nameToId('Hero’s Journey 👑', true),
    question: 'Guide',
    description: 'What guidance or help do you need to be successful?',
    sortOrder: 1
  },
  {
    templateId: nameToId('Hero’s Journey 👑', true),
    question: 'Treasure',
    description: 'What’s your team’s end goal? What does success look like?',
    sortOrder: 2
  },
  {
    templateId: nameToId('Hero’s Journey 👑', true),
    question: 'Cavern',
    description: 'What challenges lie ahead?',
    sortOrder: 3
  },
  {
    templateId: nameToId('Keep, Problem, Try 🤔', true),
    question: 'Keep',
    description: 'What should we continue doing?',
    sortOrder: 0
  },
  {
    templateId: nameToId('Keep, Problem, Try 🤔', true),
    question: 'Problem',
    description: 'What’s not going well?',
    sortOrder: 1
  },
  {
    templateId: nameToId('Keep, Problem, Try 🤔', true),
    question: 'Try',
    description: 'What’s the smallest next step we could take to resolve our problems?',
    sortOrder: 2
  },
  {
    templateId: nameToId('SaMoLo ⚖️', true),
    question: 'Same of',
    description: 'What do we want to keep doing?',
    sortOrder: 0
  },
  {
    templateId: nameToId('SaMoLo ⚖️', true),
    question: 'More of',
    description: 'What do we want to do more of?',
    sortOrder: 1
  },
  {
    templateId: nameToId('SaMoLo ⚖️', true),
    question: 'Less of',
    description: 'What do we want to do less of?',
    sortOrder: 2
  },
  {
    templateId: nameToId('SWOT Analysis 🎯', true),
    question: 'Stengths',
    description: 'What are we good at?',
    sortOrder: 0
  },
  {
    templateId: nameToId('SWOT Analysis 🎯', true),
    question: 'Weaknesses',
    description: 'What needs more work?',
    sortOrder: 1
  },
  {
    templateId: nameToId('SWOT Analysis 🎯', true),
    question: 'Opportunities',
    description: 'Where can we improve or what can we take advantage of?',
    sortOrder: 2
  },
  {
    templateId: nameToId('SWOT Analysis 🎯', true),
    question: 'Threats',
    description: 'What could be negative or dangerous to us?',
    sortOrder: 3
  },
  {
    templateId: nameToId('Hands on Deck Activity 🚢', true),
    question: 'Captain 🧑‍✈️',
    description:
      'What things do you see yourself leading on? What things do you want to lead the team on? What do you want to take responsibility for?',
    sortOrder: 0
  },
  {
    templateId: nameToId('Hands on Deck Activity 🚢', true),
    question: 'First Mate ✋',
    description:
      'What do you want to support closely? What work do you want to have a clear say in?',
    sortOrder: 1
  },
  {
    templateId: nameToId('Hands on Deck Activity 🚢', true),
    question: 'Navigator 🧭',
    description:
      'What are the things you want to avoid, either as a team or in your specific role?',
    sortOrder: 2
  },
  {
    templateId: nameToId('Hands on Deck Activity 🚢', true),
    question: 'Deck Scrubber 🧼',
    description: 'What are you happy to help out with, but would rather take a back seat on?',
    sortOrder: 3
  },
  {
    templateId: nameToId('Highlights & Lowlights 🎢', true),
    question: 'Highlights 🙌 ',
    description: 'What was great or exceeded expectations?',
    sortOrder: 0
  },
  {
    templateId: nameToId('Highlights & Lowlights 🎢', true),
    question: 'Lowlights 😫 ',
    description: 'What didn’t go well or made us feel down?',
    sortOrder: 1
  },
  {
    templateId: nameToId('Highlights & Lowlights 🎢', true),
    question: 'Kudos ❤️',
    description: 'Who helped you or deserves some appreciation?',
    sortOrder: 2
  },
  {
    templateId: nameToId('New Year Retrospective 🗓️', true),
    question: 'Growth & Wisdom 🌱 ',
    description:
      'Looking back, how did you grow and what did you learn as an individual or as a team?',
    sortOrder: 0
  },
  {
    templateId: nameToId('New Year Retrospective 🗓️', true),
    question: 'Greatest Hits 🏆',
    description: 'Looking back, what were your or the team’s greatest accomplishments',
    sortOrder: 1
  },
  {
    templateId: nameToId('New Year Retrospective 🗓️', true),
    question: 'Resolutions 🗓️',
    description:
      'Looking ahead, how can we improve? What things can we work on or commit to for the future.',
    sortOrder: 2
  },
  {
    templateId: nameToId('A Christmas Carol Retrospective 🎅🏼', true),
    question: 'Christmas Past 👻',
    description:
      'What’s your biggest regret about the year? What do you wish you could have changed?',
    sortOrder: 0
  },
  {
    templateId: nameToId('A Christmas Carol Retrospective 🎅🏼', true),
    question: 'Christmas Present 🎄',
    description:
      'What are you grateful for? Who has helped you? What processes, skills, or tools make work better? Share some kudos!',
    sortOrder: 1
  },
  {
    templateId: nameToId('A Christmas Carol Retrospective 🎅🏼', true),
    question: 'Christmas Future ⭐ ',
    description: 'What are your personal or team aspirations for the year ahead?',
    sortOrder: 2
  },
  {
    templateId: nameToId('A Christmas Carol Retrospective 🎅🏼', true),
    question: 'All I want for Christmas is… 🎁',
    description:
      'What’s your Christmas wish for the team? What would make your work easier or relieve a burden?',
    sortOrder: 3
  },
  {
    templateId: nameToId('Always Be Learning Retrospective 🌱', true),
    question: 'Things I learned 🎓',
    description: 'What have you learned as an individual or a team in the last period?',
    sortOrder: 0
  },
  {
    templateId: nameToId('Always Be Learning Retrospective 🌱', true),
    question: 'Things I want to learn 🧠',
    description:
      'What are the priority things you want to learn as an individual or as a team in the next period?',
    sortOrder: 1
  },
  {
    templateId: nameToId('Dream Team Retrospective 🦄', true),
    question: 'Practices ⚙️',
    description: 'What habits, practises, or processes helped the team work well together?',
    sortOrder: 0
  },
  {
    templateId: nameToId('Dream Team Retrospective 🦄', true),
    question: 'Values 💜',
    description: 'What values and teamwork principles make us successful',
    sortOrder: 1
  },
  {
    templateId: nameToId('Dream Team Retrospective 🦄', true),
    question: 'Absence 🤔',
    description: 'What practices, processes or skills weren’t present in the team?',
    sortOrder: 2
  },
  {
    templateId: nameToId('Thanksgiving Retrospective 🥧', true),
    question: 'Old Favorites 🦃',
    description: 'What tried-and-true practices or habits are serving us well?',
    sortOrder: 0
  },
  {
    templateId: nameToId('Thanksgiving Retrospective 🥧', true),
    question: 'New Traditions 🍟',
    description: 'What new things did we try or learn?',
    sortOrder: 1
  },
  {
    templateId: nameToId('Thanksgiving Retrospective 🥧', true),
    question: 'Left on the Table 🐌',
    description: 'What do we wish we’d left behind, or should leave behind from now on?',
    sortOrder: 2
  },
  {
    templateId: nameToId('Thanksgiving Retrospective 🥧', true),
    question: 'Gratitude 🍰',
    description: 'What are you thankful for?',
    sortOrder: 3
  },
  {
    templateId: nameToId('Diwali Retrospective 🪔', true),
    question: 'Diyas',
    description: 'What do we need to guide us forward or help us find our way?',
    sortOrder: 0
  },
  {
    templateId: nameToId('Diwali Retrospective 🪔', true),
    question: 'Rangoli',
    description: 'What practices or processes are bringing positivity?',
    sortOrder: 1
  },
  {
    templateId: nameToId('Diwali Retrospective 🪔', true),
    question: 'Lakshmi',
    description:
      'What do we need to tidy or clean up? What processes or backlog items need purifying?',
    sortOrder: 2
  },
  {
    templateId: nameToId('Diwali Retrospective 🪔', true),
    question: 'Ravana',
    description: 'What demons, projects, or problems are cursing us?',
    sortOrder: 3
  },
  {
    templateId: nameToId('Halloween Retrospective 🎃', true),
    question: 'Ghosts 👻',
    description: 'Boo! What projects or issues caught us by surprise?',
    sortOrder: 0
  },
  {
    templateId: nameToId('Halloween Retrospective 🎃', true),
    question: 'Zombies 🧟',
    description: 'What feels slow? What are we dragging our feet on?',
    sortOrder: 1
  },
  {
    templateId: nameToId('Halloween Retrospective 🎃', true),
    question: 'Brains 🧠',
    description: 'What did we learn? What do we need to learn?',
    sortOrder: 2
  },
  {
    templateId: nameToId('Halloween Retrospective 🎃', true),
    question: 'Candy 🍬',
    description: 'Who deserves candy? What went well? Who do you want to give kudos to?',
    sortOrder: 3
  },
  {
    templateId: nameToId('Questions, Comments, Concerns❓', true),
    question: 'Questions ❓',
    promptId: 'questionsPrompt-2',
    description:
      'What isn’t clear about this proposal, decision, or idea? What needs further explanation?',
    sortOrder: 0
  },
  {
    templateId: nameToId('Questions, Comments, Concerns❓', true),
    question: 'Comments 💬',
    description: 'What reactions do you have to this proposal, decision, or idea?',
    sortOrder: 1
  },
  {
    templateId: nameToId('Questions, Comments, Concerns❓', true),
    question: 'Concerns 🧐',
    description: 'What worries do you have about this proposal, decision, or idea?',
    sortOrder: 2
  },
  {
    templateId: nameToId('Team Retreat Planning 🌴', true),
    question: 'Hopes 🙏',
    description:
      'What do you hope we will do together? What do you hope will come from our time together?',
    sortOrder: 0
  },
  {
    promptId: 'fearsPrompt-2',
    templateId: nameToId('Team Retreat Planning 🌴', true),
    question: 'Fears 🧟',
    description: 'What concerns do you have about the retreat? What are you worried about?',
    sortOrder: 1
  },
  {
    templateId: nameToId('Team Retreat Planning 🌴', true),
    question: 'Project/Problem 💡',
    description: 'What project should we explore? What problem should we tackle together?',
    sortOrder: 2
  }
] as const

const createdAt = new Date()
const makeTemplate = (name: string) => ({
  createdAt,
  id: nameToId(name, true),
  isActive: true,
  name,
  orgId: 'aGhostOrg',
  scope: 'PUBLIC',
  teamId: 'aGhostTeam',
  type: 'retrospective',
  updatedAt: createdAt,
  isStarter: true
})

const makePrompt = (promptInfo: PromptInput, idx: number) => {
  const {question, description, promptColor, promptId, templateId, sortOrder} = promptInfo
  const paletteIdx = idx > promptColors.length - 1 ? idx % promptColors.length : idx
  const groupColor = promptColor ? promptColor : promptColors[paletteIdx]
  // FIXME this creates duplicated ids
  const id = promptId ? promptId : nameToId(question, false)
  return {
    createdAt,
    description,
    groupColor,
    id,
    isActive: true,
    question,
    sortOrder,
    teamId: 'aGhostTeam',
    templateId,
    title: question,
    updatedAt: createdAt
  }
}

export const templates = templateNames.map((templateName) => makeTemplate(templateName))
export const reflectPrompts = promptsInfo.map((promptInfo, idx) => makePrompt(promptInfo, idx))

export const up = async function (r: R) {
  try {
    await Promise.all([
      r.table('MeetingTemplate').insert(templates).run(),
      r.table('ReflectPrompt').insert(reflectPrompts).run()
    ])
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  const templateIds = templates.map(({id}) => id)
  const promptIds = reflectPrompts.map(({id}) => id)
  try {
    await Promise.all([
      r.table('MeetingTemplate').getAll(r.args(templateIds)).delete().run(),
      r.table('ReflectPrompt').getAll(r.args(promptIds)).delete().run()
    ])
  } catch (e) {
    console.log(e)
  }
}
