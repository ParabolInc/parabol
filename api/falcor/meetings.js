import Meeting from '../models/meeting';
import { createRoutes } from './falcor-saddle';

export default [
  ...createRoutes({
    routeBasename: 'meetings',
    acceptedKeys: ['id', 'createdAt', 'content'],
    getLengthModelPromise: async () => Meeting.count().execute(),
    getRangeModelPromise: async (from, to) =>
      Meeting.orderBy('createdAt').slice(from, to + 1).run(),
    getByIdsModelPromise: async (ids) => Meeting.getAll(...ids).run(),
    callCreateModelPromise: async (params) => {
      let newMeeting = new Meeting(params);
      newMeeting = await newMeeting.save();
      const newLength = await Meeting.count().execute();

      return [newMeeting, newLength];
    }
  }),
];
