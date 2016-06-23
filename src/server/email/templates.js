export default ({
  newUser: variables => ({
    from: 'Action Hero <action@mail.parabol.co>',
    to: `"${variables.name}" <${variables.email}>`,
    subject: 'Welcome friend!',
    text: `
    Thank you for signing up for Action!
    
    Greater team momentum is only a few clicks away. Can you feel it? It's
    like a refreshing breeze through your hair.
    
    Your pal,
    
    --
    Action Hero
    `
  }),
  inviteTeamMember: variables => ({
    from: 'Action Hero <action@mail.parabol.co>',
    to: `<${variables.email}>`,
    subject: 'You\'ve been invited! (i swear this isn\'t spam)',
    text: `
    Someone invited your to Action.
    
    Specifically, the ${variables.teamName} team.
    
    They say you're working on ${variables.task}. But we think you're busy drinking on the job. Amirite?!
    
    Accept their invite by using your invite ID: ${variables.inviteId}
    
    Your pal,
    
    --
    Action Hero
    `
  })
});

