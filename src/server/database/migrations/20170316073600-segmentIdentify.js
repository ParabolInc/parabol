import segmentIo from '../../segmentIo';

/*
 * We weren't always calling segment.io's identify call when new users were
 * created. The call used to be made from the client. We removed it. Now it's
 * in userMutation, as it should be.
 *
 * This migration ensures all users exist up on segment.io.
 */

exports.up = async (r) => {
  if (!process.env.SEGMENT_WRITE_KEY) {
    console.warn('no segment.io configuration, skipping this migration.');
    return;
  }
  const users = await r.table('User')
    .pluck('createdAt', 'email', 'id', 'picture', 'preferredName');
  users.forEach((u) => {
    const {createdAt, email, id: userId, picture: avatar, preferredName: name} = u;
    segmentIo.identify({
      userId,
      traits: {
        avatar,
        createdAt,
        email,
        name
      }
    });
  });
};

exports.down = async () => {
  // NO-OP
};
