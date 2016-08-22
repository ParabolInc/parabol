
/**
 * Transforms from:
 *
 *   presence = [
 *     {
 *       id: 'socketIdabc123'
 *       editing: 'Obj::id0',
 *       userId: 'auth0|moe'
 *     },
 *     {
 *       id: 'socketIdpqr456',
 *       editing: 'Obj::id1',
 *       userId: 'auth0|larry'
 *     }
 *   ];
 *
 * To:
 *
 *  editsByObj = {
 *     'Obj::id0' = ['auth0|moe'],
 *     'Obj::id1' = ['auth0|larry']
 *   }
 */

export default function (presence) {
  const editsByObj = {};
  for (let i = 0; i < presence.length; i++) {
    const {editing, userId} = presence[i];
    // use a set in case Matt from 2 computers is editing the same thing. don't wanna say matt, matt
    editsByObj[editing] = editsByObj[editing] || new Set();
    editsByObj[editing].add(userId);
  }
  return editsByObj;
}
