import getRethink from 'server/database/rethinkDriver';

export default function getInviterInfoAndTeamName(teamId, userId) {
  const r = getRethink();
  /**
   * (1) Fetch user email and picture link from User.
   * (2) Rename fields to match TeamInvite email props
   * (3) Join Team.name by using teamId as teamName
   */
  return r.table('User').get(userId)
    .pluck('id', 'email', 'picture', 'preferredName')
    .merge((doc) => ({
      inviterAvatar: doc('picture'),
      inviterEmail: doc('email'),
      inviterName: doc('preferredName'),
      teamName: r.table('Team').get(teamId)('name')
    }))
    .run();
}
