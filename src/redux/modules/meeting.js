const CREATE = 'action/meeting/CREATE';
const CREATE_SUCCESS = 'action/meeting/CREATE_SUCCESS';
const CREATE_FAIL = 'action/meeting/CREATE_FAIL';
const LOAD = 'action/meeting/LOAD';
const LOAD_SUCCESS = 'action/meeting/LOAD_SUCCESS';
const LOAD_FAIL = 'action/meeting/LOAD_FAIL';

const initialState = {
  loaded: false,
  instance: null,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case CREATE:
      return {
        ...state,
        loaded: false,
        instance: null
      };
    case CREATE_SUCCESS:
      return {
        ...state,
        loaded: false,
        loading: false,
        instance: {
          id: action.result
        },
        error: null
      };
    case CREATE_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        instance: null,
        error: action.error
      };
    case LOAD:
      return {
        ...state,
        loaded: false,
        loading: true,
        instance: null
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loaded: true,
        loading: false,
        instance: action.result,
        error: null
      };
    case LOAD_FAIL:
      return {
        ...state,
        loaded: false,
        loading: false,
        instance: null,
        error: action.error
      };
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.meeting && globalState.meeting.loaded;
}

export function load(meetingId) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.falcor
      .get(['meetingsById', [meetingId], ['id', 'content']])
      .then( (response) => response.json.meetingsById[meetingId] )
  };
}

export function create() {
  return {
    types: [CREATE, CREATE_SUCCESS, CREATE_FAIL],
    promise: (client) => client.falcor
      .call('meetings.create',
        [ ], // no params
        ['id'], // what to fetch for any refs created
      )
      .then( (response) => response.json
        .meetings[Object.keys(response.json.meetings)[0]].id
      )
  };
}

/*
 * This here code is going to hangout as a reference until these patterns
 * are used elsewhere...
 *
  const model = new falcor.Model({source: new HttpDataSource('/api/model.json') });

  model.
    getValue('meetings.length')
    .then((response) => {
      console.log('meetings.length: ' + JSON.stringify(response));
    });

  model.
    get('meetings[0..1]["id", "content"]')
    .then((response) => {
      console.log('meetings[0..1]: ' + JSON.stringify(response));
      const setReq = {
        json: {
          meetingsById: {
            'bd8d468d-a330-4a13-b916-9ff46be54f3e': {
              content: 'this is some new content'
            }
          }
        }
      };
      setReq.json.meetingsById[response.json.meetings['0'].id] = {
        'content': 'whoa!'
      };
      model.
        set(setReq)
        .then((setResponse) => {
          console.log('set(meetings[0]):' + JSON.stringify(setResponse));
        });
    });
  model.
    getValue('meetings.length')
    .then((length) => {
      const rando = Math.floor(Math.random() * (length + 1));
      model.getValue(['meetings', rando, 'id']).then((id) => {
        console.log('meeting[', rando, ']["id"] = ', id);
        model.call('meetingsById.delete', [id]).then((response) => {
          console.log('delete suceeded: ', response);
        })
        .catch( (error) => console.log(error));
      });
    });

  model.
    call('meetings.create', [{
      content: 'snow day today' }],
      ['id', 'content', 'createdAt']
    )
    .then((response) => {
      console.log('meetings.create: ' + JSON.stringify(response));
    })
    .catch((response) => {
      console.log('meetings.create (error): ' + JSON.stringify(response));
    });
*/
