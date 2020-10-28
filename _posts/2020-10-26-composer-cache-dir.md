---
layout: post
title:  "Composer cache-dir changed"
date:   2020-10-26 18:00:00 +0800
categories: Composer
---

Composer `cache-dir` has changed on Linux:

-   before: `~/.composer/cache`
-   now: `~/.cache/composer`

but not changed on macOS.

```shell
ubuntu@vm:~$ composer --version
Composer 1.6.3 2018-01-31 16:28:17
ubuntu@vm:~$ composer config -g -l | grep cache-dir
[cache-dir] /home/ubuntu/.composer/cache
[data-dir] /home/ubuntu/.composer
[cache-files-dir] {$cache-dir}/files (/home/ubuntu/.composer/cache/files)

ubuntu@vm:~$ rm -rf ~/.composer
ubuntu@vm:~$ composer --version
Composer version 2.0.2 2020-10-25 23:03:59
ubuntu@vm:~$ composer config -g -l | grep cache-dir
[cache-dir] /home/ubuntu/.cache/composer
[data-dir] /home/ubuntu/.composer
[cache-files-dir] {$cache-dir}/files (/home/ubuntu/.cache/composer/files)
```

```shell
sink@mac$ composer --version
Composer version 1.10.9 2020-07-16 12:57:00
sink@mac$ composer config -g -l | grep cache-dir
[cache-dir] /Users/sinkcup/.composer/cache
[data-dir] /Users/sinkcup/.composer
[cache-files-dir] {$cache-dir}/files (/Users/sinkcup/.composer/cache/files)

sink@mac$ rm -rf ~/.composer
ubuntu@vm:~$ composer --version
Composer version 2.0.2 2020-10-25 23:03:59
sink@mac$ composer config -g -l | grep cache-dir
[cache-dir] /Users/sinkcup/.composer/cache
[data-dir] /Users/sinkcup/.composer
```