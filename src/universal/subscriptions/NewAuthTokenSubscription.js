const subscription = graphql`
  subscription NewAuthTokenSubscription {
    newAuthToken
  }
`;


const NewAuthTokenSubscription = (environment) => {
  const {ensureSubscription} = environment;
  return {
    subscription
  };
};

export default NewAuthTokenSubscription;
