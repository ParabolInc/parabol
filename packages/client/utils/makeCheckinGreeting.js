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
  'What’s something you’re worried about?',
  'What’s something new or interesting you’ve learned recently?',
  'What’s the weirdest thing in your fridge right now?',
  'What was your favorite recent meal, and why?',
  'If you could have one superpower today, what would it be, and for what purpose?',
  'What are you grateful for today, and why?',
  'What would you do if you had an extra day off tomorrow?',
  'If you could invite anyone to dinner tonight, who would it be and what would you eat?',
  'What was the last song you listened to, and where?',
  'What’s your favorite recent accomplishment, and why?',
  'If you could get advice from anyone in the world today, whom would you ask, and what?',
  'If you had an expert personal assistant today, what would you have them do?',
  'What’s something about the next teammate that you appreciate?',
  'Show us something in your space that you really like!',
  'What’s got your attention today, and why?',
  'What was your favorite recent book or article, and what did it inspire?',
  'Heard any good tips lately?',
  'What emoji best represents you today, and why?',
  'If you were going to be frozen tomorrow for a one-way 1000-year interstellar voyage, what would you most want to communicate (and to whom) before you leave?',
  'What’s the most important thing to remember daily that you haven’t been able to?',
  'What help could you most use that you haven’t asked for?',
  'What is your one piece of advice to everyone here?',
  'What was the last thing you fell in love with?',
  'When was the last time you felt unbounded optimism?',
  'Who was the last person you felt inspired by?',
  'What simple thing still blows your mind?',
  'What sparked your curiosity in whatever you’re most curious about now?',
  'If you could know the absolute and total truth to one question, what question would you ask?',
  'Which question can you ask to find out the most about a person?',
  'What color best describes your personality today?'
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
