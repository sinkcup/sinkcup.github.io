---
layout: post
title:  "Jenkins git diff files when merge request"
date:   2020-07-03 17:18:00 +0800
categories: Jenkins, git
---

I need Jenkins to lint files changed in a merge request, so I run this command:

```
git diff --diff-filter=ACM --name-only master... | xargs npx remark -f
```

but error:

> fatal: ambiguous argument 'master...': unknown revision or path not in the working tree.

That's because Jenkins only checkout the code by commit id, don't checkout master or any branch.

I find there are 2 ways from Google search, but not very good:

- https://stackoverflow.com/questions/57893389/jenkins-file-diffs-with-declarative-pipeline-and-multibranch
- https://www.covermymeds.com/main/insights/articles/jenkins-test-files-changed-git-commit/

Finally, I invented a new method:

<script src="https://gist.github.com/sinkcup/7df2614b09bb89450721ccb67a9cfe2f.js"></script>
