exports.up = (r) => {
  return r.table('Team')
    .update((team) => ({
      tier: r.table('Organization')
        .get(team('orgId'))('tier')
    }), {nonAtomic: true});
};

exports.down = () => {
  // noop
};
