import Database from './database';

const type = Database.type;

const Meeting = Database.createModel('Meeting', {
  id: type.string(),
  createdAt: type.date().default(Database.r.now()),
  updatedAt: type.date(),
  content: type.string().default(''),
});

function preHook(next) {
  this.updatedAt = Database.r.now();
  next();
}

Meeting.pre('save', preHook);

export default Meeting;
