---
layout: post
title:  "如何开发大型 composer package（像 Google Cloud SDK 那样）"
date:   2019-09-01 12:05:00 +0800
categories: GitHub, composer
---

使用 [Google Cloud PHP SDK](https://packagist.org/packages/google/cloud) 时可以发现 replaces 字段有很多小包可以单独安装，为什么这么做，怎么实现的呢？

![image](https://user-images.githubusercontent.com/4971414/64072995-8ba7c980-ccca-11e9-8b24-f69327f453f3.png)

点开这些小包可以看到它们都有独立的代码仓库和版本号：
 
 用途 | github.com | packagist.org
 ----|------------|-----------------------
 主包 | [googleapis/google-cloud-php](https://github.com/googleapis/google-cloud-php) | [google/cloud](https://packagist.org/packages/google/cloud)
 子包 | [googleapis/google-cloud-php-asset](https://github.com/googleapis/google-cloud-php-asset) | [google/cloud-asset](https://packagist.org/packages/google/cloud-asset)
 子包 | [googleapis/google-cloud-php-bigtable](https://github.com/googleapis/google-cloud-php-bigtable) | [google/cloud-bigtable](https://packagist.org/packages/google/cloud-bigtable)
 子包 | [googleapis/google-cloud-php-storage](https://github.com/googleapis/google-cloud-php-storage) | [google/cloud-storage](https://packagist.org/packages/google/cloud-storage)

其实这是“开发大型 composer package 的最佳实践”：

大型 library 包含多个平级模块，在一个仓库里开发，发布一个大包 composer package，并且通过脚本拆分成多个子仓库，发布多个小型子包（sub package）。

好处很明显：

- 大包：开发方便，重度用户可一次安装所有功能。
- 子包：按需安装，体积小速度快。

怎么实现呢？首选把步骤理顺，看看每一步能否通过程序自动化：

1. 在 GitHub 创建主包仓库：网页操作，只发生一次，无需自动化；
2. 把主包 submit 到 packagist.org：网页操作，只发生一次，无需自动化；
3. 主包一个功能开发完毕，代码合并到 master，创建 git tag（触发 packagist.org 发布新版本）：命令操作，发生几次，可考虑自动化；
4. 把主包按目录拆分成子包，创建多个仓库，推代码，创建 git tag：命令操作，发生多次，应该自动化；
5. 把每个子包 submit 到 packagist.org：网页操作，发生多次，应该自动化，但难以实现；

技术方案如下：

- 拆分 Git 仓库：用 [Git SubSplit](https://github.com/dflydev/git-subsplit)。
- 创建 Git 仓库：当然不能通过 git 命令（它们都是用来操作已存在的仓库），需要用 GitHub 官方 cli：[hub](https://hub.github.com/)。怎么认证呢？可以用密码或 TOKEN（[文档](https://hub.github.com/hub.1.html#github-oauth-authentication)）。当然不能泄露密码，而应该在 GitHub 创建一个 Personal access token。
- 创建 Git tag：一个包时，往往手动创建 tag，并不麻烦。而几十个子包这么做会累死，需要把版本号放在代码里，程序提取用来打 tag。放在哪里才符合标准呢？查看 [composer 官方文档](https://getcomposer.org/doc/04-schema.md#version)，发现 `composer.json` 可用 version 字段，当然这就需要再写代码解析 json，而不标准但省事的办法是像 Google 那样用单独的 [VERSION 文件](https://github.com/googleapis/google-cloud-php/blob/master/Bigtable/VERSION)。
- 自动化：当然是用 持续集成（CI），GitHub 生态圈的 [CircleCI](https://circleci.com/)、[Travis-CI](https://travis-ci.com/) 都非常成熟，本文以 CircleCI 为例，把上面的步骤跑起来。 如果 CI 使用开发者的名义进行自动提交，会导致 git history 混乱，不利于排查问题。所以可以考虑创建一个机器人账号，[GitHub 文档](https://help.github.com/en/articles/types-of-github-accounts#personal-user-accounts)支持这种用法：

> User accounts are intended for humans, but you can give one to a robot, such as a continuous integration bot, if necessary.

代码讲解：

拆分 Git 仓库：[split-packages.sh](https://github.com/laravel-socialite-providers/socialite-providers/blob/master/split-packages.sh)

```
#!/bin/bash
set -e

# 在主包目录里进行拆分
rm -rf .subsplit
git subsplit init "$(git config --get remote.origin.url)"
git subsplit update
# 查找所有子包的 composer.json，比如 Bigtable/composer.json
find -- */composer.json | while IFS='' read -r file; do
  # target: googleapis/google-cloud-php-bigtable.git
  target="$(php get-value-from-json-file.php "$file" extra.component.target)"
  # repo_uri: googleapis/google-cloud-php-bigtable
  repo_uri=$(echo "$target" | cut -d "." -f1)
  # desc: Cloud Bigtable Client for PHP
  desc=$(php get-value-from-json-file.php "$file" description)
  # dir_name: Bigtable
  dir_name=$(dirname "$file")
  # 创建子包仓库
  hub create -d "$desc" "$repo_uri"
  # 推子包代码
  git subsplit publish \
    "$dir_name":git@github.com:"$target" \
    --heads=master \
    --no-tags

  # create tag
  echo -e "\ncreate tag"
  version=$(php get-value-from-json-file.php "$file" version)
  repo_name=$(echo "$repo_uri" | cut -d "/" -f2)
  rm -rf /tmp/"$repo_name"
  pushd /tmp/
  git clone git@github.com:"$target"
  pushd /tmp/"$repo_name"
  tag_exists=$(git ls-remote origin refs/tags/"$version")
  if [ -z "$tag_exists" ]; then
    git tag -a "$version" -m 'new version'
    git push --tags
  fi
  pushd +2
  dirs -c
  dirs -v
done
```

CircleCI 配置：[config.yml](https://github.com/laravel-socialite-providers/socialite-providers/blob/master/.circleci/config.yml)

![image](https://user-images.githubusercontent.com/4971414/64076834-79468380-ccfc-11e9-9df5-b6fa77e4bf5c.png)

```yaml
version: 2 # use CircleCI 2.0

jobs: # a collection of steps
  build: # runs not using Workflows must have a `build` job as entry point
    docker: # run the steps with Docker 
      - image: circleci/php:7.2-node-browsers # ...with this image as the primary container; this is where all `steps` will run
    working_directory: ~/laravel # directory where steps will run
    steps: # a set of executable commands
      - checkout # special step to check out source code to working directory
      - run:
          name: Avoid hosts unknown for github # HACK circleci bug. https://discuss.circleci.com/t/git-clone-fails-in-circle-2-0/15211/11
          command: mkdir -p ~/.ssh/ && echo -e "Host github.com\n\tStrictHostKeyChecking no\n" > ~/.ssh/config
      - run: if [ "$CIRCLE_BRANCH" != "master" ]; then git fetch --force origin master:master; fi # fuck circleci bug. https://support.circleci.com/hc/en-us/articles/115015659247-How-do-I-modify-the-checkout-step-
      - run:
          command: |
              sudo -E docker-php-ext-enable opcache
              sudo composer self-update
      - run:
          command: |
              sudo apt install -y python-pip
              sudo -H pip install mkdocs
      - restore_cache: # special step to restore the dependency cache if `composer.json` does not change
          keys:
            - composer-v1-{{ checksum "composer.json" }}
            # fallback to using the latest cache if no exact match is found (See https://circleci.com/docs/2.0/caching/)
            - composer-v1-
      - run: composer install -n --prefer-dist
      - save_cache: # special step to save the dependency cache with the `composer.json` cache key template
          key: composer-v1-{{ checksum "composer.json" }}
          paths:
            - vendor
      - run:
          command: |
            ./build-docs.sh
      - save_cache:
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/laravel

  deploy:
    docker:
      - image: circleci/php:7.2-node-browsers
    working_directory: ~/laravel
    steps:
      - restore_cache:
          keys:
            - v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: Avoid hosts unknown for github
          command: mkdir -p ~/.ssh/ && echo -e "Host github.com\n\tStrictHostKeyChecking no\n" > ~/.ssh/config
      - run:
          name: Install and configure dependencies
          command: |
            sudo npm install -g --silent gh-pages
            sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
            git config --global user.email "sinkcup+cyborg@gmail.com"
            git config --global user.name "Cyborg Girl"
      - add_ssh_keys:
          fingerprints:
            - "8d:4d:a0:2f:19:d2:d9:8c:ed:83:2c:20:bc:aa:32:f0"
      - run:
          name: Install subsplit and hub
          command: |
              sudo wget -O "$(git --exec-path)"/git-subsplit https://raw.githubusercontent.com/dflydev/git-subsplit/master/git-subsplit.sh
              sudo chmod +x "$(git --exec-path)"/git-subsplit
              wget -O /tmp/hub.tgz https://github.com/github/hub/releases/download/v2.11.2/hub-linux-amd64-2.11.2.tgz
              mkdir -p ~/hub
              tar -C ~/hub -zxvf /tmp/hub.tgz --strip-components=1
              sudo ln -s `realpath ~/hub/bin/hub` /usr/local/bin/
      - run:
          name: auto split packages, push code and tag to new repo. but need submit to packagist.org manually, because it have no API to submit.
          command: ./split-packages.sh
      - run:
          name: create a tag from the version of composer.json, then packagist.org will release a new version automatically.
          command: ./create-tag-from-composer-version.sh
      - run:
          name: Deploy docs to gh-pages branch
          command: gh-pages --dotfiles --message "[skip ci] Updates" --dist site

workflows:
  version: 2
  build-deploy:
    jobs:
      - build
      - deploy:
          requires:
            - build
          filters:
            branches:
              only: master
```

完整代码请看：[socialite-providers](https://github.com/laravel-socialite-providers/socialite-providers)，这是我做的 Laravel 微信登录包，不止实现了自动拆分，还实现了自动生成文档发布到 GitHub Pages，可自行了解，本文不再细说。

![image](https://user-images.githubusercontent.com/4971414/64076875-012c8d80-ccfd-11e9-9f23-e63267ed5059.png)

下面我们来看一下各家云计算厂商的 composer package：

![image](https://user-images.githubusercontent.com/4971414/64077082-17d3e400-ccff-11e9-9d73-6cab9528570d.png)

![image](https://user-images.githubusercontent.com/4971414/64077119-a2b4de80-ccff-11e9-8bf5-cf0c13a7fda6.png)

![image](https://user-images.githubusercontent.com/4971414/64077128-d263e680-ccff-11e9-890c-71aba397ca02.png)

可以看出各家的开源技术水平：

云计算厂商 | packagist.org | 开源技术水平 | 技术细节
---------|---------------|---------|-------
Google Cloud | [google/cloud](https://packagist.org/packages/google/cloud) | ★★★★★ | 子包自动发布
阿里云 | [alibabacloud/sdk](https://packagist.org/packages/alibabacloud/sdk) | ★★☆☆☆ | 子包手动发布，有个严重错误：没整明白版本号，强行让子包和主包版本号一致，导致不匹配
腾讯云 | [tencentcloud/tencentcloud-sdk-php](https://packagist.org/packages/tencentcloud/tencentcloud-sdk-php) | ★☆☆☆☆ | 不会用子包，名字太长冗余了
    金山云 | [kscsdk/ksyun_sdk](https://packagist.org/packages/kscsdk/ksyun_sdk) | ☆☆☆☆☆ | 不会用子包，名字还起错了（不符合 Domain/URL Slug 规范）

……中国的公有云计算厂商都还有很大的进步空间:)

参考资料：

- [《编程项目起名最佳实践
》](https://sinkcup.github.io/programming-project-name-best-practice)
- [《源码讲解：如何优雅的让 Laravel 微信登录支持 UnionId 和 snsapi_base》](https://sinkcup.github.io/code-explaination-of-laravel-socialite-wechat-login)
