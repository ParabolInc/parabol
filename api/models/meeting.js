import Database from './database';

const type = Database.type;

const Meeting = Database.createModel('Meeting', {
  id: type.string(),
  createdAt: Date,
  updatedAt: Date,
  content: type.string(),
});

function preHook(next) {
  if (typeof this.createdAt === 'undefined') {
    this.createdAt = Date.now();
  }
  this.updatedAt = Date.now();
  next();
}

Meeting.pre('save', preHook);

export default Meeting;
