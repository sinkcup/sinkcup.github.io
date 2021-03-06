---
layout: post
title:  "编程项目起名最佳实践"
date:   2018-10-11 14:30:00 +0800
categories: best-practice, github
---

编程项目起名最佳实践：

 * Domain/URL Slug 规范：全小写、连字符，禁止使用下划线。适用于所有会出现在链接中的名字（用户名、组织名、项目名、branch、tag）。原因：下划线会与浏览器默认样式重合，导致看起来像空格。而全小写便于用户手动输入。
 * 项目起名和域名无关。原因：买到更好的域名时，域名就换了。
 * 语义化，看名字就知道是什么项目。

反面教材：浦发银行群发短信使用了下划线，看起来和空格一样，无法分辨。如图：

![浦发银行群发短信使用了下划线](https://user-images.githubusercontent.com/4971414/64077596-836c8000-cd04-11e9-95c9-dc3815c1359b.png)

你绝对不可能买到/看到带下划线的域名，除了腾讯当年不顾 DNS 警告，创建了 dl_dir.qq.com 二级域名，贻笑大方：

![腾讯域名错误很多年 dl_dir.qq.com](https://user-images.githubusercontent.com/4971414/64077701-713f1180-cd05-11e9-834f-f358ab941362.png)

GitHub 推荐项目命名使用全小写、连字符。如图：

![GitHub suggest Repository name](https://user-images.githubusercontent.com/4971414/46784614-68e28e80-cd61-11e8-95b0-1302bd65a12d.png)


比如做一个电子书项目，域名还没想好，命名如下：

* 产品线 ebook
* 接口 ebook-api
* JS的网站 ebook-web-app
* 微信小程序 ebook-wechat-mini-program
* 安卓APP ebook-android-app
* 苹果APP ebook-ios-app
* 管理员后台网站（假如是 PHP/Python 等前后端混合的） ebook-admin-web
* 管理员后台JS网站（假如是 JS 前后端分离的） ebook-admin-web-app
* 管理员后台接口（假如是 JS 前后端分离的） ebook-admin-api

## 参考资料

[Clean URL - Wikipedia](https://en.wikipedia.org/wiki/Clean_URL)
