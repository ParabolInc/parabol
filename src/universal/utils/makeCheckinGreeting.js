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
  'What’s your spirit animal today',
  'What’s something you’re looking forward to',
  'What’s something you’re worried about',
  'What’s something you’ve learned recently',
  'Anything inspire you recently',
  'What’s the weirdest thing in your fridge right now',
  'How are your hobbies doing',
  'What are you cooking next',
  'Learn any new slang lately',
  'Heard any good advice lately',
  'If you could have one superpower today, what would it be'
];

export const makeCheckinGreeting = (week) => {
  return greetings[week % greetings.length];
};

export const makeCheckinQuestion = (week) => {
  return questions[week % questions.length];
};
