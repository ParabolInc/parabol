const greetings = [
  {
    content: 'Hola',
    language: 'Spanish'
  },
  {
    content: 'Bonjour',
    language: 'French'
  },
  {
    content: 'Guten tag',
    language: 'German'
  },
  {
    content: 'Ciao',
    language: 'Italian'
  },
  {
    content: 'Jambo',
    language: 'Swahili'
  },
  {
    content: 'Oi',
    language: 'Portuguese'
  },
  {
    content: 'Salut',
    language: 'Catalan'
  },
  {
    content: 'Hallo',
    language: 'German'
  },
  {
    content: 'Hej',
    language: 'Swedish'
  },
  {
    content: 'Nǐ hǎo',
    language: 'Chinese'
  },
  {
    content: 'Yeoboseyo',
    language: 'Korean'
  },
  {
    content: 'Shalom',
    language: 'Hebrew'
  },
  {
    content: 'Merhaba',
    language: 'Turkish'
  },
  {
    content: 'Zdravo',
    language: 'Slovenian'
  }
]

// The trailing question mark “?” is added in the presentation component.
const questions = [
  'What animal best represents you today, and why?',
  'What’s something you’re looking forward to, and why?',
  'What’s something you’re worried about, and what are you doing?',
  'What’s something new or interesting you’ve learned recently?',
  'What’s the weirdest thing in your fridge right now?',
  'What was your favorite recent meal, and why?',
  'If you could have one superpower today, what would it be, and for what purpose?',
  'What are you grateful for today, and why?',
  'What would you do if you had an extra day off tomorrow?',
  'If you could change one thing about this week, what would it be, and how?',
  'If you could invite anyone to dinner tonight, who would it be and what would you eat?',
  'What was the last song you listened to, and where?',
  'What’s your favorite recent accomplishment, and why?',
  'If you could get advice from anyone in the world today, whom would you ask, and what?',
  'If you had an expert personal assistant today, what would you have them do?',
  'What’s something about the next teammate that you appreciate?',
  'Show us something in your space that you really like!',
  'What’s got your attention today, and why?',
  'What was your favorite recent book or article, and what did it inspire?',
  'Heard any good tips lately?'
]

export const makeCheckinGreeting = (meetingCount, seedId = '') => {
  const seed = seedId.charCodeAt(0)
  const idx = (seed + meetingCount) % greetings.length
  return greetings[idx]
}

export const makeCheckinQuestion = (meetingCount, seedId = '') => {
  const seed = seedId.charCodeAt(0)
  const idx = (seed + meetingCount) % questions.length
  return questions[idx]
}
