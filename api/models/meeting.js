import Database from './database';

const type = Database.type;

const Meeting = Database.createModel('Meeting', {
  id: type.string(),
  content: type.string(),
});

export default Meeting;
