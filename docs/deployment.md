# Deployment

- Releases are handled by [release-please](https://github.com/googleapis/release-please).

- When a commit is pushed to a branch named `master` or `hotfix*`, our [release-please action](../.github/workflows/release-please.yml) creates a new PR that increments the version number and creates a changelog based on the commit messages.

- The default commit message for that PR is `chore(release): release vX.Y.Z`

- When the release-please PR gets merged, our [GitHub Build Action](../.github/workflows/build.yml) determines that it is a release, dockerizes the build and pushes it to our docker registry.
