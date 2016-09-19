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
  'what’s something you’re worried about',
  'what’s something you’ve learned recently',
  'anything inspire you recently',
  'what’s the weirdest thing in your fridge right now',
  'how are your hobbies doing',
  'what are you cooking next',
  'learn any new slang lately',
  'heard any good advice lately'
];

export const makeCheckinGreeting = (week) => {
  return greetings[week % greetings.length];
};

export const makeCheckinQuestion = (week) => {
  return questions[week % questions.length];
};
