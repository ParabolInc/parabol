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
  })
});

