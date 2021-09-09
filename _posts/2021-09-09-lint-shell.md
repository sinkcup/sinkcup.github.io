---
layout: post
title:  "DevOps 实战：shell 代码规范"
date:   2021-09-09 15:15:00 +0800
categories: DevOps, shell, lint
---

Code Review 时发现大家的 shell 代码风格各异：

女同学的代码：https://github.com/Coding/coding-download-center/pull/48/files

```shell
for i in `awk '{print $1}' /tmp/index-body.md`
do
  [[ "$i" =~ ^[a-z0-9.-]+$ ]]  || ( echo “$i: Product names shall be all in lower case” && exit 250 )
done
```

男同学的代码：https://github.com/Coding/coding-download-center/pull/47/files

```shell
package_name=$(awk '{print $1}' index-body.md)

for i in $package_name;do
    [[ ! "$i" =~ \.[0-9]+\. ]] || ( echo "[ERROR] $i : package name should not have version!" && exit 2 )
done
```

可以看出有这些问题：

1. for/do 换行：女同学放在两行，男同学放在一行；

![image](https://user-images.githubusercontent.com/4971414/132434304-0a99cd7c-5c5d-462f-9425-1be30e823f53.png)

2. for 数据来源先赋值：女同学放在一行（`for i in 命令`），男同学放在两行（先赋值，然后 `for i in 变量`）；

![image](https://user-images.githubusercontent.com/4971414/132434620-421dd6dc-f180-40a5-ba84-34d4cae8fbc5.png)

3. 子语句标志符：女同学用了 \`，男同学用了 `$`；

![image](https://user-images.githubusercontent.com/4971414/132434678-011261d9-d5cf-46b9-bcb2-0958b947f1ea.png)

4. 行首缩进：女同学用 2 个空格，男同学用 4 个空格；

![image](https://user-images.githubusercontent.com/4971414/132434782-343b8088-c63a-446b-8c65-1bef6a6418b8.png)

5. 行内缩进：女同学的「或」前面用了 2 个空格，应该用 1 个；男同学的 do 前面缺少一个空格。

![image](https://user-images.githubusercontent.com/4971414/132434841-12945d9b-b33a-4c15-96f5-039ec7ba9565.png)

6. 全角引号：女同学的 echo 后面用了全角双引号，应该用半角。

![image](https://user-images.githubusercontent.com/4971414/132434922-57e0a9ad-82fd-4312-84e8-ee420c491035.png)

所以需要寻找统一的代码规范，实现多人协作风格一致。

## 寻找代码规范

![image](https://user-images.githubusercontent.com/4971414/132314649-c12c0a33-dd5d-47cf-9353-ab1e4bd12f9b.png)

搜索「lint shell code style」，找到了两个工具：ShellCheck 和 shfmt，逐个调研，看看能否扫描出来上面的几个问题。其中 ShellCheck 是 [Google 规范推荐](https://google.github.io/styleguide/shellguide.html#s6.1-shellcheck)的，所以先调研。

### ShellCheck

```shell
brew install shellcheck
shellcheck girl.sh
shellcheck boy.sh
```

![image](https://user-images.githubusercontent.com/4971414/132315619-116d8890-65af-4c37-94fd-8c717c7c4e4e.png)
![image](https://user-images.githubusercontent.com/4971414/132317690-ce59b13b-97e4-4431-8733-172027e55c92.png)

可以看出 ShellCheck 的规则：

1. for/do 换行：不管；
2. for 数据来源先赋值：不管；
3. 子语句标志符：管；
4. 行缩进：不管；
5. 行内缩进：不管；
6. 全角引号：管；

ShellCheck 还发现了别的问题：

> SC2002: Useless cat.
> SC2013: To read lines rather than words, pipe/redirect to a 'while read' loop.

所以要继续寻找别的工具，组合使用。

### shfmt

```shell
wget https://github.com/mvdan/sh/releases/download/v3.3.1/shfmt_v3.3.1_linux_amd64
chmod +x shfmt_v3.3.1_linux_amd64
mv shfmt_v3.3.1_linux_amd64 /usr/local/bin/shfmt
shfmt -d girl.sh
shfmt -d boy.sh
```

![image](https://user-images.githubusercontent.com/4971414/132435745-a46bfdb5-8b77-4822-a2f7-7da85c8b850e.png)
![image](https://user-images.githubusercontent.com/4971414/132436300-06d79f42-3500-486c-b5a4-f7d25fbc48e7.png)

可以看出 shfmt 还有些奇怪的规则：

1. 缩进：默认 tab，而不是空格；
2. 重定向后留空格：不允许；

查看帮助，发现规则可以自定义：

```shell
$ shfmt --help
usage: shfmt [flags] [path ...]

Printer options:

  -i uint   indent: 0 for tabs (default), >0 for number of spaces
  -bn       binary ops like && and | may start a line
  -ci       switch cases will be indented
  -sr       redirect operators will be followed by a space
  -kp       keep column alignment paddings
  -fn       function opening braces are placed on a separate line
```

参考其他语言的规范，我选择了 4 个空格、重定向后留空格，即：

```shell
$ shfmt -d -i 4 -sr girl.sh
$ echo $?
0
```

![image](https://user-images.githubusercontent.com/4971414/132445294-8daef9d0-09c2-44d8-bc62-1b0fb38494f5.png)

汇总两个工具的规则：

规则 | ShellCheck | shfmt
----|------------|----------
for/do 换行 | :x: | :white_check_mark:
for 数据来源先赋值 | :x: | :x:
子语句标志符 | :white_check_mark: | :white_check_mark:
行缩进 | :x: | :white_check_mark:
行内缩进 | :x: | :white_check_mark:
全角引号 | :white_check_mark: | :x:
Useless cat | :white_check_mark: | :x:
read lines rather than words | :white_check_mark: | :x:
重定向后留空格 | :x: | :white_check_mark:

结论：两个工具一起使用，可覆盖大部分规则。

## 自动检查

代码规范口头传达难以落地，需要自动强制检查，有 3 个时机：IDE、git pre commit、持续集成。

![image](https://user-images.githubusercontent.com/4971414/132443787-8d5605fc-4b81-4d72-96b5-5a667d19fbe2.png)

### IDE

- JetBrains：无需安装，内置插件支持 ShellCheck、Shfmt、Explainshell
- VSCode：只有 [ShellCheck 插件](https://marketplace.visualstudio.com/items?itemName=timonwong.shellcheck)，其他等待大家贡献开源。

![image](https://user-images.githubusercontent.com/4971414/132444277-21f62283-1aa9-4470-9b3f-534571dceb5d.png)
![image](https://user-images.githubusercontent.com/4971414/132441019-8164ed37-2ef0-4a66-8f4a-31b070086ba0.png)

### git pre commit

git pre commit 和持续集成都需要执行 lint 程序，按照「DRY」原则，应写成一个脚本，到处执行，比如叫做 `lint.sh`：

```shell
#!/bin/sh
set -e

if [ -z "$1" ]; then
    echo "no file"
    exit
fi

shell_files=$(echo "$@" | tr ' ' '\n' | { grep ".sh$" || true; })
if [ -n "$shell_files" ]; then
    echo "lint shell:"
    echo "$shell_files"
    echo "$shell_files" | xargs shellcheck
    echo "$shell_files" | xargs shfmt -d -i 4 -sr
else
    echo "no shell file"
fi
```

`.git/hooks/pre-commit` 增量检查：

```shell
#!/bin/sh

git diff --diff-filter=d --name-only HEAD | xargs ./lint.sh
```

`.git` 目录是无法提交的，所以在代码库中提交 `.git-hooks-pre-commit`，每位开发者在本地手动复制（没有复制也没关系，后面的持续集成会拦住）：

```
cp .git-hooks-pre-commit .git/hooks/pre-commit
```

效果截图：本地修改代码，`git commit` 时，强制检查了代码规范，报错就继续修改，再次 commit。

![image](https://user-images.githubusercontent.com/4971414/132637594-d1bd432a-fd65-4e01-8ac0-682e2431cede.png)

### 持续集成

按照「前端检查为了用户体验，后端检查为了安全可靠」的原则，git pre commit 检查为了及时反馈，持续集成检查为了安全可靠。

如果有开发者未配置 git pre commit，直接提交了代码（比如在 GitHub 网页上修改代码），将执行同样的规范检查。

CODING/Jenkins：

```groovy
      stage('增量检查代码规范') {
        when {
          changeRequest()
        }
        steps {
          // CODING
          sh "git diff --diff-filter=d --name-only origin/${env.MR_TARGET_BRANCH}... | xargs ./lint.sh"
          // Jenkins
          // sh "git diff --diff-filter=d --name-only origin/${env.CHANGE_TARGET}... | xargs ./lint.sh"
        }
      }
```

GitHub Actions：https://github.com/Coding/coding-download-center/blob/main/.github/workflows/ci.yml

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - uses: technote-space/get-diff-action@v5
        if: ${{ github.event_name == 'pull_request' }}

      - name: Lint
        if: env.GIT_DIFF
        run: echo ${{ env.GIT_DIFF }} | xargs ./lint.sh
```

效果截图：有人修改代码，`git push` 并创建了合并请求，强制检查了代码规范，报错就继续修改，再次 push。https://github.com/Coding/coding-download-center/pull/61

![image](https://user-images.githubusercontent.com/4971414/132639829-1e12c5f9-ba53-4494-b6ba-6df860424826.png)
![image](https://user-images.githubusercontent.com/4971414/132639906-713b41b0-746f-4a85-84af-37090443d539.png)
