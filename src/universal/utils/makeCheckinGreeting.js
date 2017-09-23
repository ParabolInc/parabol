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
  'What’s your spirit animal today',
  'What’s something you’re looking forward to',
  'What’s something you’re worried about',
  'What’s something you’ve learned recently',
  'Anything inspire you recently',
  'What’s the weirdest thing in your fridge right now',
  'What’s got your attention today',
  'How are your hobbies doing',
  'What are you cooking next',
  'Heard any good advice lately',
  'If you could have one superpower today, what would it be',
  'What’s got your attention this week'
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
