// import r from '../../../database/rethinkDriver';
import mailgun from '../../../email/mailgunDriver';

// export const getUserByUserId = async userId => {
//   const users = await r.table('CachedUser').getAll(userId, {index: 'userId'}).limit(1);
//   return users[0];
// };

export const triggerNewUserEmail = async cachedUser => {
  const emailConfig = {
    from: 'Action Hero <action@mail.parabol.co>',
    to: `"${cachedUser.name}" <${cachedUser.email}>`,
    subject: 'Welcome friend!',
    text:
`
Thank you for signing up for Action!

Greater team momentum is only a few clicks away. Can you feel it? It's
like a refreshing breeze through your hair.

Your pal,

--
Action Hero
`
  };

  try {
    await mailgun.messages().send(emailConfig);
  } catch (e) {
    console.warn(`mailgun: unable to send welcome message ${e}`);
  }

  return true;
};
