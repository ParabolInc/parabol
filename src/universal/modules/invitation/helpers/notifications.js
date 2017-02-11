export const invalidInvitation = {
  title: 'Invitation invalid',
  message: `
              We had difficulty with that link. Did you paste it correctly?
            `,
  action: {
    label: 'Ok',
  },
  autoDismiss: 10
};

export const inviteNotFound = {
  title: 'Invitation not found, but don\'t worry',
  message: `
              Hey we couldn't find that invitation. If you'd like to
              create your own team, you can start that process here.
            `,
  action: {
    label: 'Got it',
  },
  autoDismiss: 0
};

export const teamAlreadyJoined = {
  title: 'Team already joined',
  message: `
              Hey, we think you already belong to this team.
            `,
  action: {
    label: 'Ok',
  },
  autoDismiss: 0
};

export const successfulJoin = {
  title: 'You\'re in!',
  message: `
            Welcome to Action. Let's get you set up.
          `
};

export const successfulExistingJoin = {
  title: 'You\'re in!',
  message: `
            Welcome to the new team. 
          `
};

export const inviteExpired = {
  title: 'Invitation has expired',
  message: `
              Hey, your invitation expired. Maybe someone already used it or
              it was sitting in your inbox too long.
              Ask your friend for a new one.
            `,
  action: {
    label: 'Got it',
  },
  autoDismiss: 0
};
