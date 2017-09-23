import legitify from 'universal/validation/legitify';
import {orgRejectionReason, requiredId} from 'universal/validation/templates';

export default function rejectOrgApprovalValidation() {
  return legitify({
    dbNotificationId: requiredId,
    reason: orgRejectionReason
  });
}
