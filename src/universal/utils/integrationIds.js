import {GITHUB, SLACK} from 'universal/utils/constants';
import shortid from 'shortid';

const lookup = [
  {
    prefix: 'sla',
    service: SLACK
  },
  {
    prefix: 'git',
    service: GITHUB
  }
];

export const makeIntegrationId = (service) => {
  const item = lookup.find((i) => i.service === service);
  if (!item) throw new Error(`${service} not a valid service`);
  return `${item.prefix}::${shortid.generate()}`;
};

export const getServiceFromId = (id) => {
  const [prefix] = id.split('::');
  const item = lookup.find((i) => i.prefix === prefix);
  if (!item) throw new Error(`${prefix} not a valid prefix`);
  return item.service;
};