import Database from './database';
import { subscriptions } from './helpers/subscriptions';
import { publish } from '../socketio/index';

const type = Database.type;

export const Meeting = Database.createModel('Meeting', {
  id: type.string(),
  createdAt: type.date().default(Database.r.now()),
  updatedAt: type.date(),
  updatedBy: type.string().default(''),
  content: type.string().default(''),
  editing: type.boolean().default(false)
});

function preHook(next) {
  this.updatedAt = Database.r.now();
  next();
}

Meeting.pre('save', preHook);

function subscribe(io, room, params, modelPath) {
  if (subscriptions.exists(modelPath, params)) {
    subscriptions.addRoomTo(modelPath, params, room);
    return;
  }
  const { id } = params;
  this.get(id).changes().then( (cursor) => {
    subscriptions.add(modelPath, params, cursor);
    cursor.on('change', (doc) => {
      const rooms = subscriptions.getRoomsFor(modelPath, params);
      publish(io, rooms, modelPath, doc, doc.updatedBy);
    });
  });
}

Meeting.defineStatic('subscribe', subscribe);

function unsubscribe(room, params, modelPath) {
  if (!subscriptions.exists(modelPath, params)) {
    return;
  }

  // Unsubscribe the room:
  const remainingRooms = subscriptions.removeRoomFrom(modelPath, params, room);

  if (remainingRooms.length === 0) {
    const cursor = subscriptions.lookup(modelPath, params).cursor;
    // Turn off the model subscription:
    subscriptions.remove(modelPath, params);
    // Stop the database change feed:
    cursor.close();
  }
}

Meeting.defineStatic('unsubscribe', unsubscribe);

export default Meeting;
