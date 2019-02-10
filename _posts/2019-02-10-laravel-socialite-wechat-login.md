---
layout: post
title:  "Laravel 微信登录——一键安装，5分钟搞定"
date:   2019-02-10 23:26:00 +0800
categories: Laravel, WeChat, Socialite
---

最近做的 Laravel 网站项目需要微信登录功能，看了下官方文档（[英文](https://laravel.com/docs/5.7/socialite)、[中文](https://learnku.com/index.php/docs/laravel/5.7/socialite/2310)）， Laravel 通过官方扩展包——Socialite 来做 OAuth 登录，官方支持 Facebook、 Twitter、 LinkedIn、 Google、GitHub 和 Bitbucket，其他社交网站通过开源项目——[Socialite Providers](https://socialiteproviders.netlify.com/) 提供支持，看了下，有两个微信：Weixin 和 Weixin-Web……怎么回事？

![image](https://user-images.githubusercontent.com/4971414/52533757-8fe2b880-2d73-11e9-9ce6-dac7bef5f401.png)

## 微信登录到底有几种？

其实微信登录有3种：

- 微信扫码登录网站：符合 OAuth 2.0 标准。在“[微信开放平台](https://open.weixin.qq.com/)”创建“网站应用”，获得 AppId 和 AppSecret。
- 微信App内嵌打开网页授权登录：符合 OAuth 2.0 标准。在“[微信公众平台](https://mp.weixin.qq.com/)”注册“服务号”（需提供公司营业执照），获得 AppId 和 AppSecret。参考官方文档：[《微信网页授权》](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842)、[《（企业）注册公众平台步骤》](https://kf.qq.com/faq/120911VrYVrA151013MfYvYV.html)
- 微信小程序授权登录：不符合 OAuth 2.0 标准。

![image](https://user-images.githubusercontent.com/4971414/52533914-8e19f480-2d75-11e9-8d52-28b1025ae84b.png)

![image](https://user-images.githubusercontent.com/4971414/52534579-59f70180-2d7e-11e9-8949-ab76e89e4764.png)

![image](https://user-images.githubusercontent.com/4971414/52534670-7f383f80-2d7f-11e9-8805-62a9fd5aacce.png)

![image](https://user-images.githubusercontent.com/4971414/52534829-53b65480-2d81-11e9-9532-8a239d8b4363.png)

## 一键安装 Laravel 微信网站和内嵌登录

查看 Socialite Providers 的代码可知：Socialite Providers 里的 “Weixin-Web” 是指“微信网站登录”，“Weixin” 是指“微信App内嵌网页登录”。

Google 一下，会看到很多 “Laravel Facebook Login”、“Laravel 微信登录”的教程，都要手动创建 migration、route、controller、view，这很不符合“DRY原则”，而且都只能绑定一个第三方，不支持一个账号同时绑定Facebook、微信、QQ。最佳方案是：代码只写一遍，有人写过了，那大家一键安装就可以，就像 Laravel 官方的一键生成注册登录的命令：`php artisan make:auth`，多方便！所以我做了一个开源项目：[Laravel Make Auth Socialite](https://github.com/sinkcup/laravel-make-auth-socialite)，5分钟完成微信登录功能！而且支持同时绑定多个第三方。

### 使用说明

```
php artisan make:auth
composer require socialiteproviders/weixin-web
composer require socialiteproviders/weixin
composer require sinkcup/laravel-make-auth-socialite
php artisan make:auth-socialite --force
php artisan migrate
```

修改 `config/services.php`：

```
    'github' => [
        'client_id' => env('GITHUB_CLIENT_ID'),
        'client_secret' => env('GITHUB_CLIENT_SECRET'),
        'redirect' => env('GITHUB_CALLBACK_URL'),
    ],

    'weixinweb' => [
        'client_id' => env('WECHAT_WEB_APP_ID'),
        'client_secret' => env('WECHAT_WEB_APP_SECRET'),
        'redirect' => env('WECHAT_WEB_CALLBACK_URL'),
    ],

    'weixin' => [
        'client_id' => env('WECHAT_SERVICE_ACCOUNT_APP_ID'),
        'client_secret' => env('WECHAT_SERVICE_ACCOUNT_APP_SECRET'),
        'redirect' => env('WECHAT_SERVICE_ACCOUNT_CALLBACK_URL'),
    ],
```

修改 ENV：

```
# 如果没有服务号，那就只保留 WeixinWeb 即可
AUTH_SOCIAL_LOGIN_PROVIDERS=GitHub,WeixinWeb,Weixin

# GitHub 开放平台允许使用 localhost，最适合开发人员学习 OAuth
GITHUB_CLIENT_ID=1234
GITHUB_CLIENT_SECRET=qwer
GITHUB_CALLBACK_URL=http://laravel-demo.localhost/login/github/callback

# 微信登录要求网站备案，很麻烦
WECHAT_WEB_APP_ID=wx213
WECHAT_WEB_APP_SECRET=asdf
WECHAT_WEB_CALLBACK_URL="http://example.com/login/weixinweb/callback"

# 如果没有服务号，那就不要填
WECHAT_SERVICE_ACCOUNT_APP_ID=wx222
WECHAT_SERVICE_ACCOUNT_APP_SECRET=zxcv
WECHAT_SERVICE_ACCOUNT_CALLBACK_URL="http://example.com/login/weixin/callback"
```

打开 Laravel login 页，即可看到效果：

![image](https://user-images.githubusercontent.com/4971414/52535483-ece96900-2d89-11e9-896d-5c4c63c3d2df.png)
