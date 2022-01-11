# Code review policy

The goal is to help reviewers to make their intentions clear to the author and for the author to know exactly what is expected of to pass the next review round.
Review progress is tracked in the [Sprint Board](https://github.com/orgs/ParabolInc/projects/1)

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
    - refactor? ie. the author's doing things in a part of the code that could be improved (for example changing from fragment containers to relay hooks). Then it’s the author’s responsibility to make a decision to either fix it (if it’s simple enough like 10 min work, or create a separate task from a given comment)
- Final review is approval if there are no negative comments, otherwise change requested
    - Changes requested? Move ticket to self-review
    - Approved? Move to maintainer-review
    - Approved by the maintainer
      - lowest score +1? the PR goes back to self-review
      - lowest score +2? the PR gets merged

## Author

- Answer or resolve each comment
    - resolve if you followed the suggestion
    - reply if you didn't
- If you need to clarify parts of the code, check if it can be done by adding comments or improve naming of variables/functions/classes
- When you replied or resolved all comments, move ticket back to reviewer- or maintainer-review
