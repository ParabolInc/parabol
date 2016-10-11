import getWeekOfYear from 'universal/utils/getWeekOfYear';

const now = new Date();
const week = getWeekOfYear(now);

const expressions = [
  'Great job',
  'High five',
  'Wowza',
  'Boom',
  'Woot, woot',
  'Yaaasss'
];

const statements = [
  'You are on a roll!',
  'One step closer to world domination!',
  'Looks like things are moving along!',
  'Making progress, little by little!',
  'You are unstoppable!'
];

export const makeSuccessExpression = (number = week) => {
  return expressions[number % expressions.length];
};

export const makeSuccessStatement = (number = week) => {
  return statements[number % statements.length];
};
