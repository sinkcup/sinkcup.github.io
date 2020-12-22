---
layout: post
title:  "macOS 11 brew PHP 8"
date:   2020-12-22 18:00:00 +0800
categories: macOS, PHP
---

right:

```shell
mac$ brew update-reset
mac$ brew upgrade php
  Updating Homebrew...
  ==> Upgrading 1 outdated package:
  php 7.4.4 -> 8.0.0_1
mac$ php -v
PHP 8.0.0 (cli) (built: Nov 30 2020 13:51:52) ( NTS )
mac$ sw_vers
ProductName:	macOS
ProductVersion:	11.1
BuildVersion:	20C69
```

wrong:

```shell
mac$ brew upgrade
  /usr/local/Homebrew/Library/Homebrew/version.rb:368:in `initialize': 
  Version value must be a string; got a NilClass () (TypeError)
```