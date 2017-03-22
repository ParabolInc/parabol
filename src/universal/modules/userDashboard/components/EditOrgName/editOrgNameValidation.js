import legitify from 'universal/validation/legitify';

export default function editOrgNameValidation() {
  return legitify({
    orgName: (value) => value
      .trim()
      .required('"The nameless wonder" is better than nothing')
      .min(2, 'The "A Team" had a longer name than that')
      .max(50, 'That isn\'t very memorable. Maybe shorten it up?')
  });
}
