import { createRoutes } from 'falcor-saddle';

import Meeting from '../models/meeting';


export default [
  ...createRoutes({
    routeBasename: 'meetings',
    acceptedKeys: ['id', 'createdAt', 'content', 'editing', 'updatedBy'],
    getLength: async () => Meeting.count().execute(),
    getRange: async (from, to) =>
      Meeting.orderBy('createdAt').slice(from, to + 1).run(),
    getById: async (id) => Meeting.get(id).run(),
    update: async (oldObj, newObj) => oldObj.merge(newObj).save(),
    create: async (params) => (new Meeting(params)).save(),
    delete: async (id) => Meeting.get(id).delete()
  }),
  {
    route: 'meetingsById.subscribe',
    call: function call(callPath, args) {
      const { app } = this.req;
      const io = app.get('io');
      const [ params, room ] = args;

      // TODO: catch exceptions
      Meeting.subscribe(io, room, params, 'meetingsById');

      return [
        {
          path: ['meetingsById.subscribe'],
          value: 'success'
        }
      ];
    }
  },
  {
    route: 'meetingsById.unsubscribe',
    call: function call(callPath, args) {
      const [ params, room ] = args;

      // TODO: catch exceptions
      Meeting.unsubscribe(room, params, 'meetingsById');

      return [
        {
          path: ['meetingsById.unsubscribe'],
          value: 'success'
        }
      ];
    }
  }
];
