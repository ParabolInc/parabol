import r from 'server/database/rethinkDriver';

export default function acceptInviteDB(email, time) {
  r.table('Invitation').getAll(email, {index: 'email'}).update({
    acceptedAt: time,
    isAccepted: true
  });
}
