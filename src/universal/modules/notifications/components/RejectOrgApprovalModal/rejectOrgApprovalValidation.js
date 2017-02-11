import legitify from 'universal/validation/legitify';
import {orgRejectionReason} from 'universal/validation/templates';

export default function rejectOrgApprovalValidation() {
  return legitify({
    reason: orgRejectionReason
  });
}
