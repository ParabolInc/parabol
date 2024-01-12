# Code review policy

The goal is to help reviewers to make their intentions clear to the author and for the author to know exactly what is expected of them to pass the next review round.

## Submitting a PR

- Once you're assigned to a task, it's your responsibility to split it the way you can submit reasonably sized PRs. It’s ok to have multiple PRs for a single issue.
- Use draft PRs to ask for early feedback.
- When submitting a PR, provide context. What's the task? What's changed? Why? If you can, record a Loom to share why things are done that way. It'll be easier for a reviewer to understand what decision you've made and why.

## Requesting Code Reviews

- Self-assess which domains are involved in the changes made by your PR, find a reviewer from among the folks who are in the reviewers or maintainer [groups](/.github/reviewers.yml), paying specific attention to who GitHub suggests, who has indicated expertise within a domain (e.g. backend, front-end, etc.), and who has capacity to review within 24 hours.
  - If you feel that maintainer review isn't necessary, add the label: https://github.com/ParabolInc/parabol/labels/Skip%20Maintainer%20Review. Use the label for PRs of any size and complexity if you are confident enough, and it feels safe. One exception: we should be extremely careful with DB migrations as they might break the application in the way that is hard to restore.
  - Otherwise request a review directly from a maintainer.
- If the PR has not been reviewed within 24 hours, ping the reviewer on Slack and ask when they'll be able to review. If they don't have capacity for review, reassign to a different reviewer. If you're still blocked at the next check-in meeting, add an agenda item.

## Performing Code Reviews

- Performing code reviews and unblocking others is also important part of your job. It is totally fine that sometimes you may do more PR reviews than coding.
- Prioritize unblocking others by performing [code reviews](https://github.com/pulls/review-requested) on daily basis
- Try to complete PR reviews within 1 working day
- If not possible to complete PR review within 1 working day, follow the above “Requesting Code Reviews” guide to reassign the PR
- When reviewing a PR and requesting changes, be mindful that the PR author won't always have the right background to understand what are you requesting. Make your comments meaningful, and record a Loom if needed.
- [The right balance](https://docs.gitlab.com/ee/development/code_review.html#the-right-balance)

## Reviewer

- Prefix each comment with a label. The labels are not points and will not be summed up or similar.
    - -2 there is a fundamental design issue
    e.g. change will crash, high impact performance, high impact on maintainability
    - -1 please fix this
    e.g. naming of variable is misleading, coupling of components can be reduced, code is hard to understand
    - +1 I would do it differently
      - inconsequential enough to not need another review
      - some suggestion for the authors consideration, e.g. better variable name, alternative split of components
      - refactoring of existing code, e.g. While you're in here, could you fix xyz?
    - +2 kudos
    e.g. nice work here, I learnt something, good find
- Final review is "Approve" if there are no negative comments, otherwise "Request changes"
    - Changes requested? Move the issue associated with the PR to the self-review column.
    - Approved? The PR can be merged by either the author or a maintainer

## Metrics Representative

- Metrics Representative ensures any analytics related changes work well with downstream data services
- This role is currently filled by the [data group](/.github/reviewers.yml)

## Author

- Answer or resolve each comment
    - resolve if you followed the suggestion
    - reply if you didn't
- If you need to clarify parts of the code, check if it can be done by adding comments or improve naming of variables/functions/classes
- When you replied or resolved all comments, re-request review so the PR shows up in the review requested search
