import React from 'react';
import theme from 'universal/styles/theme';

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

const style = {
  color: theme.palette.warm
};

export default function makeRandomCheckInQuestion(preferredName, hasStyle = false) {
  const greeting = greetings[1];
  const question = questions[0];
  // const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  // const question = questions[Math.floor(Math.random() * questions.length)];
  return <span>{greeting}, <span style={hasStyle ? style : null}>{preferredName}</span>—{question}?</span>;
}
