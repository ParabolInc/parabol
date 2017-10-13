const subscription = graphql`
  subscription NewAuthTokenSubscription {
    newAuthToken
  }
`;


const NewAuthTokenSubscription = (environment) => {
  const {ensureSubscription} = environment;
  return ensureSubscription({
    subscription
  });
};

export default NewAuthTokenSubscription;
