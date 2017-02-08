import legitify from 'universal/validation/legitify';
export default function rejectOrgApprovalValidation() {
  return legitify({
    reason: (value) => value
      .trim()
      .min(2, 'Maybe a couple more words?')
      .max(255, 'That seems like a good enough reason')
  });
}
