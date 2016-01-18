import Meeting from '../models/meeting';

export default [
  {
    route: 'greeting',
    get: () => {
      return {path: ['greeting'], value: 'Hello World'};
    }
  },
  {
    route: 'meetings.length',
    async get(pathSet) {
      console.error('meetings.length');
      const length = await Meeting.count().execute();
      return {
        path: pathSet,
        value: length
      };
    }
  },
  {
    route: 'meetings[{ranges:indexRanges}]',
    async get(pathSet) {
      console.error('meetings[{ranges:indexRanges}]');
      const responses = [ ];
      for (const {from, to} of pathSet.indexRanges) {
        const meetings = await Meeting.orderBy('createdAt')
                                       .slice(from, to + 1)
                                       .run();
        for (let idx = 0; idx < meetings.length; idx++) {
          const response = {
            path: ['meetings', from + idx ],
            value: {
              $type: 'ref',
              value: ['meetingsById', meetings[idx].id ]
            }
          };
          responses.push(response);
        }
      }

      return responses;
    }
  },
  {
    route: 'meetingsById[{keys:ids}]["createdAt", "content"]',
    async get(pathSet) {
      console.error('meetingsById[{keys:ids}]["createdAt", "content"]');
      const attributes = pathSet[2];
      const meetings = await Meeting.getAll(...pathSet[1]).run();
      const responses = [ ];
      for (const meeting of meetings) {
        for (const attribute of attributes) {
          const response = {
            path: ['meetingsById', meeting.id, attribute],
            value: meeting[attribute]
          };
          responses.push(response);
        }
      }

      return responses;
    }
  }
];
