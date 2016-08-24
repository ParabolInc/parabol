const greetings = [
  'Hola',
  'Bonjour',
  'Guten tag',
  'Ciao',
  'Namaste',
  'Jambo',
  'Oi',
  'Salut',
  'Hallo',
  'Hej',
  'Nǐ hǎo',
  'Yeoboseyo',
  'Shalom',
  'Merhaba',
  'Zdravo'
];

const questions = [
  'what’s your spirit animal today',
  'what’s something you’re looking forward to',
  'what’s something you’re worried about'
];

export const makeCheckinGreeting = (week) => {
  return greetings[week % greetings.length];
};

export const makeCheckinQuestion = (week) => {
  return questions[week % questions.length];
};
