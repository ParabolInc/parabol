import Meeting from '../models/meeting';
import { createRoutes } from 'falcor-saddle';

export default [
  ...createRoutes({
    routeBasename: 'meetings',
    acceptedKeys: ['id', 'createdAt', 'content'],
    getLength: async () => Meeting.count().execute(),
    getRange: async (from, to) =>
      Meeting.orderBy('createdAt').slice(from, to + 1).run(),
    getById: async (id) => Meeting.get(id).run(),
    update: async (oldObj, newObj) => oldObj.merge(newObj).save(),
    create: async (params) => (new Meeting(params)).save(),
    delete: async (id) => Meeting.get(id).delete()
  }),
];
