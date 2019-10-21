---
layout: post
title:  "remove mirrors in composer.lock"
date:   2019-10-21 11:37:00 +0800
categories: GitHub, composer, PHP
---

Packagist.org is slow in some countries, so we always use [mirrors](https://packagist.org/mirrors).

But mirrors changes `composer.lock`, such as:

```
        {
            "name": "laravel/framework",
            "version": "v6.3.0",
            "source": {
                "type": "git",
                "url": "https://github.com/laravel/framework.git",
                "reference": "80914c430fb5e49f492812d704ba6aeec03d80a2"
            },
            "dist": {
                "type": "zip",
                "url": "https://api.github.com/repos/laravel/framework/zipball/80914c430fb5e49f492812d704ba6aeec03d80a2",
                "reference": "80914c430fb5e49f492812d704ba6aeec03d80a2",
                "shasum": "",
                "mirrors": [
                    {
                        "url": "https://mirrors.aliyun.com/composer/dists/%package%/%reference%.%type%",
                        "preferred": true
                    }
                ]
            }
        }
```

If we submit this to Git, composer will run slower from other countries, such as CI([circleci.com](https://circleci.com/), [travis-ci.com](https://travis-ci.com/)) and other developers developers around the world.

So we need to remove mirrors in `composer.lock` before submit. I have wrote [remove-composer-mirrors.php](https://gist.github.com/sinkcup/e66a02c2acf78b7e75878dd1f5bfa37c) to do this, just run:

```
php -i remove-composer-mirrors.php
```

<script src="https://gist.github.com/sinkcup/e66a02c2acf78b7e75878dd1f5bfa37c.js"></script>
