import {idRegex} from 'universal/validation/regex';

export const id = (value) => value.matches(idRegex);
export const fullName = (value) => value
  .trim()
  .min(1, 'It looks like you wanted to include a name')
  .max(200, 'That name looks too long!');
export const task = (value) => value
  .trim()
  .min(2, 'That doesn\'t seem like much of a task')
  .max(100, 'Try shortening down the task name');
