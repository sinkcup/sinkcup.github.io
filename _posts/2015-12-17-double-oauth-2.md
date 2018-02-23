---
layout: post
title:  "双重OAuth 2.0架构"
date:   2015-12-17 12:17:49 +0800
---
OAuth 2.0支持几种grant type，由于安全性不同，所以适用范围也不同。背景知识：[《理解OAuth 2.0》](http://www.ruanyifeng.com/blog/2014/05/oauth_2_0.html)、[《OAuth 2 Simplified》](https://aaronparecki.com/articles/2012/07/29/1/oauth2-simplified)。

grant type | 是否需要secret | 是否出现授权界面
-----------|----------------|-----------------
授权码模式（Authorization Code） | 是 | 是
隐藏模式（Implicit）   | 否 | 是
密码模式（Password）   | 否 | 否
客户端证书模式（Client credentials） | 是 | 否

secret需要保密，而常见的使用场景能否保密呢？如下：

使用场景 | 能否保密
---------|---------
web server site | 能
web server api  | 能
web app(为避免混乱，下面称为js app) | 不能
native app(Android, iOS等) | 不能

可以看到app（js，Android, iOS等）无法保密，所以需要无secret的模式才行，也就是隐藏模式（Implicit）或密码模式（Password）。从安全性和可维护性角度考虑，Password模式是让用户直接输入密码，所以只提供给厂商自己app使用。第三方app只有隐藏模式（Implicit）可用，各家服务商的安全警告如下：

* Google : Installed apps are distributed to individual machines, and it is assumed that these apps cannot keep secrets. [原文链接](https://developers.google.com/identity/protocols/OAuth2InstalledApp)
* Facebook : This app secret should never be included in client-side code or in binaries that could be decompiled. [原文链接](https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow)

现在来看看常用的账号体系服务商支持的grant type。

账号体系 | web支持Authorization Code | web支持Implicit | mobile sdk支持Implicit
---------|---------------------------|-----------------|-----------------------
Google | [支持](https://developers.google.com/identity/protocols/OAuth2WebServer) | [支持](https://developers.google.com/identity/protocols/OAuth2UserAgent)、[js sdk支持](https://developers.google.com/identity/sign-in/web/) | [支持](https://developers.google.com/identity/sign-in/android/)
Facebook | [支持](https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow) | [js sdk支持](https://developers.facebook.com/docs/facebook-login/web) | [支持](https://developers.facebook.com/docs/facebook-login/android)
Github | [支持](https://developer.github.com/v3/oauth/) | 否 | 否，无sdk
QQ | [支持](http://wiki.connect.qq.com/%E5%BC%80%E5%8F%91%E6%94%BB%E7%95%A5_server-side#Step2.EF.BC.9A.E8.8E.B7.E5.8F.96AuthorizationCode) | [支持](http://wiki.connect.qq.com/%E5%BC%80%E5%8F%91%E6%94%BB%E7%95%A5_client-side#Step2.EF.BC.9A.E8.8E.B7.E5.8F.96AccessToken) | [支持](http://wiki.connect.qq.com/%E4%BD%BF%E7%94%A8sdk%E5%AE%9E%E7%8E%B0qq%E7%9A%84%E7%99%BB%E5%BD%95%E5%92%8C%E6%B3%A8%E9%94%80_android_sdk)
微信 | [支持](https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&id=open1419316505&token=&lang=zh_CN) | 否 | [支持](https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&id=1417751808&token=&lang=zh_CN)，[但文档错误](https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&id=open1419317851&token=&lang=zh_CN)
微博 | [支持](http://open.weibo.com/wiki/%E6%8E%88%E6%9D%83%E6%9C%BA%E5%88%B6) | [支持，但文档没说，混乱](http://open.weibo.com/connect) | [支持，但文档没说，混乱](http://open.weibo.com/development/mobile)

可以看到Github只支持授权码模式，只能在web server上用，不支持app，请谨慎使用。不过由于github是生产力工具，使用github登录的第三方网站也都是生产力工具，比如[gitbook.com](http://gitbook.com)、[travis-ci.org](https://travis-ci.org/)，只在web上用，也是可以理解的。

而微信不支持web Implicit，所以只支持web server，不支持js app，在纯API架构下，会带来混乱。

纯API架构是只开发一套api，同时支持各种app（js、Android、iOS），而没有了web server site。架构如图（[https://www.processon.com/view/link/567220ace4b0f79964befccd](https://www.processon.com/view/link/567220ace4b0f79964befccd)）：

![](/assets/pure-api-arch.svg)

如果再使用OAuth Client即第三方登录，那它的纯API架构如下（[https://www.processon.com/view/link/566fe5d1e4b0554d8cfaa6e2](https://www.processon.com/view/link/566fe5d1e4b0554d8cfaa6e2)）：

![](/assets/pure-api-arch-using-oauth-client-implicit.svg)

可以看到大部分公司做API仅供自家app使用，也就是私有API，用这种架构就可以了。多亏了API的HTTP server是自家的，所以也能把授权码模式加进去，用来支持github/微信，即自家js app可以和api共用app key和secret，api替它用code换token。架构如下（[https://www.processon.com/view/link/56723463e4b0f79964c05229](https://www.processon.com/view/link/56723463e4b0f79964c05229)）：

![](/assets/pure-api-arch-using-oauth-client.svg)

而如果API本身需要开放，假设叫做api.example.com，那将变成双重OAuth架构，自家app调用流程：[https://www.processon.com/view/link/5672343ee4b02f55904265bf](https://www.processon.com/view/link/5672343ee4b02f55904265bf)，第三方app调用流程：[https://www.processon.com/view/link/567a4b76e4b06915fbfc5ff6](https://www.processon.com/view/link/567a4b76e4b06915fbfc5ff6)，截图：

![](/assets/pure-api-arch-using-double-oauth-offical-app.svg)
![](/assets/pure-api-arch-using-double-oauth-third-party-app.svg)

可以看到：

自家app使用Password模式，集成多家sdk，直接显示多家登录按钮，体验很好。如果在api里加入支持github/微信，可以做，但会把Password模式打乱，难以维护，最佳方案是：js app有自己的简单后端，自己去github换token。

第三方app使用隐藏模式，集成example家的一个sdk，跳转到example的登录页或唤起example的Android/iOS app，然后看到多家的登录按钮（google/facebook/qq/微信/github），再跳转或唤起它们……有点奇怪，但也能使用。想支持github/微信却很简单，example的授权页可以帮它换。
