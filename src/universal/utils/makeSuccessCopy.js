import getWeekOfYear from 'universal/utils/getWeekOfYear';

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

export const makeSuccessExpression = (number = getWeekOfYear()) => {
  return expressions[number % expressions.length];
};

export const makeSuccessStatement = (number = getWeekOfYear()) => {
  return statements[number % statements.length];
};
