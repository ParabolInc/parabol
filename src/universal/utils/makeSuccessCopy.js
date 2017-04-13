import getWeekOfYear from 'universal/utils/getWeekOfYear';

const expressions = [
  'Great job',
  'High five',
  'Nice work',
  'Excellent'
];

const statements = [
  'Iteration is the trick!',
  'Moving forward, one step at a time!',
  'Looks like things are moving along!',
  'Making progress, little by little!'
];

export const makeSuccessExpression = (number = getWeekOfYear()) => {
  return expressions[number % expressions.length];
};

export const makeSuccessStatement = (number = getWeekOfYear()) => {
  return statements[number % statements.length];
};
