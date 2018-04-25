import {EventTypes} from 'redux-segment';
import ensureDate from 'universal/utils/ensureDate';

/**
 * Sometimes, we just want to track events in segment.
 */

const SEGMENT_EVENT = '@@segment/EVENT';

// we need this because segmentEventPage does not always have access to the full traits
let traits = {
  avatar: null,
  createdAt: null,
  email: null,
  id: null,
  name: null
};

export function selectSegmentTraits(viewer) {
  const {picture, createdAt, email, viewerId, preferredName} = viewer;
  traits = {
    avatar: picture,
    createdAt: ensureDate(createdAt),
    email,
    id: viewerId,
    name: preferredName
  };
  return traits;
}

// eslint-disable-next-line
export function segmentEventIdentify(user) {
  // mutative!
  selectSegmentTraits(user);
  return {
    type: SEGMENT_EVENT,
    meta: {
      analytics: {
        eventType: EventTypes.identify,
        eventPayload: {
          userId: traits.id,
          traits
        }
      }
    }
  };
}

export function segmentEventPage(name, category, properties, options) {
  const propertiesOut = Object.assign({}, {traits}, properties);
  const optionsOut = Object.assign({}, {context: {traits}}, options);
  return {
    type: SEGMENT_EVENT,
    meta: {
      analytics: {
        eventType: EventTypes.page,
        eventPayload: {
          name,
          category,
          properties: propertiesOut,
          options: optionsOut
        }
      }
    }
  };
}

export function segmentEventReset() {
  return ({
    type: SEGMENT_EVENT,
    meta: {
      analytics: {
        eventType: EventTypes.reset
      }
    }
  });
}
