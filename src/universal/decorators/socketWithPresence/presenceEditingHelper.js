
/**
 * Transforms from:
 *
 *   presence = [
 *     0: {
 *       id: 'socketIdabc123'
 *       editing: 'Obj::id0',
 *       userId: 'auth0|moe'
 *     },
 *     1: {
 *       id: 'socketIdpqr456',
 *       editing: 'Obj::id1',
 *       userId: 'auth0|larry'
 *     }
 *   ];
 *
 * To:
 *
 *   editing = {
 *     'Obj::id0' = ['auth0|moe'],
 *     'Obj::id1' = ['auth0|larry']
 *   }
 */

export default function (presence) {
  const editing = {};
  if (!(presence && presence.length > 0)) { return editing; }

  presence.forEach(connection => {
    if (!connection.editing) { return; }
    if (!editing[connection.editing]) {
      editing[connection.editing] = [];
    }
    editing[connection.editing].push(connection.userId);
  });
  return editing;
}
