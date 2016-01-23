import Meeting from '../models/meeting';
import { createRoutes } from './falcor-saddle';

export default [
  ...createRoutes({
    routeBasename: 'meetings',
    acceptedKeys: ['id', 'createdAt', 'content'],
    getLength: async () => Meeting.count().execute(),
    getRange: async (from, to) =>
      Meeting.orderBy('createdAt').slice(from, to + 1).run(),
    getById: async (id) => Meeting.get(id).run(),
    update: async (oldObj, newObj) => oldObj.merge(newObj).save(),
    create: async (params) => {
      let newMeeting = new Meeting(params);
      newMeeting = await newMeeting.save();
      const newLength = await Meeting.count().execute();

      return [newMeeting, newLength];
    },
    delete: async (id) => Meeting.get(id).delete()
  }),
  /*
  {
    route: 'objsById[{keys:ids}]["id", "createdAt", "content"]',
    async set(jsonGraphArg) {
      console.error('set: ' + JSON.stringify(jsonGraphArg));
      const fields = ['id', 'createdAt', 'content'];
      const objsById = jsonGraphArg.objsById;
      const ids = Object.keys(objsById);

      const responses = [ ];

      const getter = (id) => Meeting.get(id).run();
      const updater = (oldObj, newObj) => oldObj.merge(newObj).save();

      // iterate on ids, getting, updating, and creating responses.
      for (const id of ids) {
        let oldObj = null;
        let newObj = null;

        try {
          oldObj = await getter(id);
        } catch (err) {
          // TODO error for this path
          console.error('TODO: un-gettable obj ', id, '(', err, ')');
          continue;
        }
        try {
          newObj = await updater(oldObj, objsById[id]);
        } catch (err) {
          // TODO error for this path
          console.error('TODO: un-updatable obj ', JSON.stringify(newObj), '(', err, ')');
          continue;
        }
        for (const field of fields) {
          if (!newObj[field] || !newObj.id) {
            continue;
          }
          responses.push({
            path: ['objsById', newObj.id, field],
            // TODO: different serialization
            value: JSON.stringify(newObj[field])
          });
        }
      }

      return responses;
    }
  }
  */
];
