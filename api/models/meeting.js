import Database from './database';

const type = Database.type;

const Meeting = Database.createModel('Meeting', {
  id: type.string(),
  createdAt: Date,
  content: type.string(),
});

Meeting.save([
  { createdAt: Date.now(), content: 'this is a new test' }
]);

export default Meeting;
