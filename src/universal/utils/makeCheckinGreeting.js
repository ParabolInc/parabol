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
    content: 'Namaste',
    language: 'Hindi'
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
];

// The trailing question mark “?” is added in the presentation component.
const questions = [
  'What animal best represents you today?',
  'What’s something you’re looking forward to?',
  'What’s something you’re worried about?',
  'What’s something new or interesting you’ve learned recently?',
  'What’s the weirdest thing in your fridge right now?',
  'What was your favorite recent meal?',
  'If you could have one superpower today, what would it be?',
  'What are you grateful for today?',
  'What would you do if you had an extra day off tomorrow?',
  'If you could change one thing about this week, what would it be?',
  'If you could invite anyone in the world to dinner tonight, who would it be?',
  'What was the last song you listened to?',
  'What’s your favorite recent accomplishment?',
  'If you could get advice from anyone in the world today, who would you ask?',
  'If you had an expert personal assistant today, what would you have them do?',
  'What’s something about the next teammate that you appreciate?',
  '"Show & Tell" something in the room that you really like.',
  'What’s got your attention today?'
];

export const makeCheckinGreeting = (week, seedId = '') => {
  const seed = seedId.charCodeAt(0);
  const idx = (seed + week) % greetings.length;
  return greetings[idx];
};

export const makeCheckinQuestion = (week, seedId = '') => {
  const seed = seedId.charCodeAt(0);
  const idx = (seed + week) % questions.length;
  return questions[idx];
};
