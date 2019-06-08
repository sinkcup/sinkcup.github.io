---
layout: post
title:  "微信登录UnionID终极方案——所有方式汇总"
date:   2019-06-08 22:05:00 +0800
categories: WeChat, OAuth
---

微信登录有多种方式：

登录方式            | 管理后台        | 管理帐号 | 是否符合OAuth标准
-------------------|----------------|--------|--------
App（Android/iOS） | 开放平台-移动应用 | 帐号1   | 符合OAuth
网站扫码            | 开放平台-网站    | 帐号1   | 符合OAuth
微信App内嵌打开链接  | 公众平台-服务号   | 帐号2   | 符合OAuth
小程序              | 公众平台-小程序  | 帐号3   | 不符合OAuth

- 微信开放平台（[https://open.weixin.qq.com/](https://open.weixin.qq.com/)）
  - 移动应用
  - 网站
- 微信公众平台（[https://mp.weixin.qq.com/](https://mp.weixin.qq.com/)）  
  - 服务号（Service Account）
  - 订阅号（Subscription Account）
  - 小程序（Mini Program）

![微信开放平台 - 网站应用](https://user-images.githubusercontent.com/4971414/56465561-18e03500-6432-11e9-86a7-ea1b12e5e7ea.png)

从开发者的用户体验角度来说，一个公司只有一个开发者平台，一个管理员帐号即可，比如[GitHub](https://developer.github.com/)、[Google](https://developers.google.com/)、[FB](https://developers.facebook.com/)的开发者平台都是如此，里面可以开通各个产品线的API权限，多人协作靠组织权限管理。

而腾讯竟然有多个开放平台面向开发者提供服务，每个都要单独注册，尤其是微信公众平台之内的3个服务：服务号、订阅号、小程序 竟然要注册3个管理员账号……腾讯不是最擅长用户体验吗，开放平台为什么做的这么差？

那是因为腾讯只擅长“2C”的用户体验，而面向开发者的用户体验属于“ToB”，需要技术架构、权限管理，腾讯很不擅长，毕竟腾讯的技术已经全面落后了。参考腾讯老员工的深度分析：[腾讯的技术建设是否处于落后同体量公司的状态？ - 知乎](https://www.zhihu.com/question/278473776/answer/498725441)

## 微信网站和服务号使用 UnionID 打通

场景：网站使用了“微信扫码登录”，而分享到微信后内嵌打开，如果继续展示“微信扫码登录”，那只能长按识别二维码，是不允许的，会登录失败。

解决办法：开通“服务号”授权登录。

然后遇到了新问题：“网站扫码登录”和“服务号授权登录”拿到的用户ID竟然不一样，那就创建了两个用户。

从上面的后台可以看出，“网站”是在“微信开放平台”申请的，而“服务号”是在“微信公众平台”申请的，所以两边的用户登录数据是不通的，很坑！按照正常的技术水平，应该在一个地方申请，就像“App”和“网站”就是通的。

解决办法：把“服务号”绑定到“微信开放平台”，都使用UnionID来创建用户，而不要再用OpenID。请看腾讯公告：

>   　　微信公众平台更新，为开发者提供UnionID机制
>
>   　　经开发者反馈，由于同一公司下多个公众号之间需要用户帐号互通，微信开放平台提供了UnionID机制，来解决此问题。
>
>   　　通过获取用户基本信息接口，开发者可通过OpenID来获取用户基本信息，而如果开发者拥有多个公众号，可使用以下办法通过UnionID机制来在多公众号之间进行用户帐号互通。
>
>   　　1. 将多个公众号绑定到同一个微信开放平台（open.weixin.qq.com）帐号下，即同一个Union下
>
>   　　2. 通过获取用户基本信息接口中的UnionID来区分用户的唯一性，不过需要注意的是：公众号只有在被绑定到微信开放平台帐号下后，才会获取UnionID。只要是同一个微信开放平台帐号下的公众号，用户的UnionID是唯一的。换句话说， 同一用户，对同一个微信开放平台帐号下的不同应用，UnionID是相同的。
>
>   　　微信团队
>
>   　　2014年06月27日

![微信开放平台 - 绑定公众号](https://user-images.githubusercontent.com/4971414/56465491-d702bf00-6430-11e9-931e-283b7fcf01c8.png)

绑定之后，服务号登录获得的用户数据如下：

```
{
   "city" : "嘉定",
   "nickname" : "sink",
   "country" : "中国",
   "sex" : 1,
   "privilege" : [],
   "headimgurl" : "http://thirdwx.qlogo.cn/mmopen/vi_32/xxx",
   "unionid" : "o8kXM0YPa8C_Qnih9cCwGpe1sABQ",
   "openid" : "oZg120nIyCJzEAyXKD5LJR8HhKCk",
   "language" : "zh_CN",
   "province" : "上海"
}
```

对比网站登录的数据：

```
{
   "language" : "zh_CN",
   "privilege" : [],
   "sex" : 1,
   "unionid" : "o8kXM0YPa8C_Qnih9cCwGpe1sABQ",
   "country" : "中国",
   "city" : "嘉定",
   "headimgurl" : "http://thirdwx.qlogo.cn/mmopen/vi_32/xxx",
   "province" : "上海",
   "openid" : "o0Xnp5liQw-fxkm8OLrbbPvljr48",
   "nickname" : "sink"
}
```

可以看到 unionid 相同，而 openid 不同。

还可以看出腾讯招了一些英语四级忘光的马大哈程序员，代码非常不规范，unionid 既不是驼峰也是下划线风格，导致 IDE 警告。

还可以看出腾讯的程序员在头像链接里使用了下划线，违反了 domain slug 规范，会导致一些问题（[微博截图](https://weibo.com/3969284293/D5L6E8SMr)）。

还可以看出腾讯的头像链接竟然没有使用 HTTPS……手动改成 HTTPS 是能打开的，看来腾讯经过当初公众号文章被劫持插广告好几年之后，服务器普遍部署了 HTTPS，但由于技术管理不善，老接口没人敢动，一直还在用 HTTP。

### 代码

[PHP Laravel](https://sinkcup.github.io/laravel-socialite-wechat-login)


## 微信小程序登录使用 UnionID

微信小程序的登录更诡异，竟然不采用 OAuth 标准（[隐式授权(Implicit)](https://oauth.net/2/grant-types/implicit/) 或 [Browser-Based](https://oauth.net/2/browser-based-apps/)），自己发明轮子造了一堆乱糟糟的接口。可以说小程序是腾讯技术最差时的产品，连京东都看不下去了……Look：[《小程序开发效率提升神兽：京东Taro诞生记》](https://mp.weixin.qq.com/s?__biz=MzU1MzE2NzIzMg==&mid=2247485313&idx=1&sn=c5e0cffa9e2d914d5b93546d2c466732)

阅读官方文档[《小程序登录》](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html)和[《小程序 UnionID 机制说明》](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/union-id.html)，可以看出小程序免授权登录时无法获得 UnionID，也就是说：访客打开小程序，就能获取 OpenID，如果这时后端就创建一个 user，那就坏了，之后用户授权拿到 UnionID，发现 网站/App 已经用它创建了 user，就会面临两个 user 无法合并的问题。

所以，正确的做法是：访客打开小程序，算作 session，而不是 user。就像电商网站不登录也可以加购物车一样。

小程序是JS应用，调远程接口，主流是用 HTTP Header token，无法像网站那样把 session ID 放在 Cookie 或 Query String 里，怎么办呢？

有两种办法：

1. 造轮子，在 API 里模仿 session 生成 ID，当做 token 返回。
2. 使用标准 session，这样 API 里可以使用各种成熟的 session 中间件。

显然是第2种好。开启 session use query string，调用接口时加上参数即可：

```
curl -i 'http://demo.localhost/php.php?PHPSESSID=npvh65dsqshgk24qj4a1nitmoc'
```

但这样和 token 机制不一致，而且不安全，不推荐：

> ; This option forces PHP to fetch and use a cookie for storing and maintaining
>
> ; the session id. We encourage this operation as it's very helpful in combating
>
> ; session hijacking when not specifying and managing your own session id. It is
>
> ; not the be-all and end-all of session hijacking defense, but it's a good start.
>
> ; http://php.net/session.use-only-cookies

经过试验发现，最优雅的方案是：使用 token，在 HTTP server 层面转成 Cookie: session ID，详细步骤请看：[Apache change Cookie](https://sinkcup.github.io/apache-change-cookie)

apache config `/etc/apache2/sites-enabled/000-default.conf`

```
<VirtualHost *:80>
    SetEnvIf Authorization "^Session\ (.*)$" session=$1
    RequestHeader set Cookie "PHPSESSID=%{session}e" env=session
</VirtualHost>
```

php `/var/www/html/php.php`

```
<?php
session_start();
var_dump(session_id());
var_dump($_COOKIE);
```

shell result

```
curl -i 'http://demo.localhost/php.php' -H 'Authorization: Session npvh65dsqshgk24qj4a1nitmoc'
HTTP/1.1 200 OK
Date: Sun, 21 Apr 2019 08:54:59 GMT
Server: Apache/2.4.34 (Ubuntu)
Expires: Thu, 19 Nov 1981 08:52:00 GMT
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
Vary: Accept-Encoding
Content-Length: 113
Content-Type: text/html; charset=UTF-8

string(26) "npvh65dsqshgk24qj4a1nitmoc"
array(1) {
  ["PHPSESSID"]=>
  string(26) "npvh65dsqshgk24qj4a1nitmoc"
}
```

后续工作：

1. 把从微信接口取的 session_key 存在 session 里，生成 session id 给前端。
2. 当微信授权时，获得 UnionID，后端创建 user，把之前的 session_key 存起来，生成 token 给前端。

当然也是要把“微信公众平台”的“小程序”绑定到“微信开放平台”，才能获得 UnionID。

![微信开放平台 - 绑定小程序](https://user-images.githubusercontent.com/4971414/56465549-e2a2b580-6431-11e9-82f6-adb92579392a.png)

### 代码

TODO

## 参考资料
1. [腾讯的技术建设是否处于落后同体量公司的状态？ - 知乎](https://www.zhihu.com/question/278473776/answer/498725441)
2. [微信开放平台 - OAuth - 获取用户个人信息（UnionID机制）](https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&id=open1419317853&token=&lang=zh_CN)
3. [微信公众平台 - 不是OAuth - 小程序UnionID 机制说明](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/union-id.html)
4. [如何看待腾讯 2018 年的架构调整？为什么要将 OMG 等部门做整合？ - 知乎](https://www.zhihu.com/question/296599929/answer/501336241)
5. [Laravel 微信登录——一键安装，5分钟搞定 - sink](https://sinkcup.github.io/laravel-socialite-wechat-login)
