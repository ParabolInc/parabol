import Meeting from '../models/meeting';
import { getRoutes } from './falcor-saddle';

export default [
  ...getRoutes('meetings', ['createdAt', 'content'],
       async () => Meeting.count().execute(),
       async (from, to) => Meeting.orderBy('createdAt').slice(from, to + 1).run(),
       async (ids) => Meeting.getAll(...ids).run()
  )
];
