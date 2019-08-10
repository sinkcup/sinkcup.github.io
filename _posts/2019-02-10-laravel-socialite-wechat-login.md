---
layout: post
title:  "Laravel 微信登录——一键安装，支持 UnionId"
date:   2019-06-05 18:10:00 +0800
categories: Laravel, WeChat, Socialite
---

最近做的 Laravel 网站项目需要微信登录功能，看了下[官方文档](https://laravel.com/docs/socialite)， Laravel 通过官方扩展包——[Socialite](https://github.com/laravel/socialite) 来做 OAuth 登录，官方支持 Facebook、 Twitter、 LinkedIn、 Google、GitHub 和 Bitbucket，其他登录渠道依靠开源项目——[Socialite Providers](https://socialiteproviders.netlify.com/)，但里面的微信登录有问题，所以我重做了一个开源项目 [Laravel Socialite Providers](https://github.com/laravel-socialite-providers/socialite-providers)。

## 微信登录到底有几种？

用于网站的微信登录有2种：

- 微信扫码登录网站：符合 OAuth 2.0 标准。在“[微信开放平台](https://open.weixin.qq.com/)”创建“网站应用”，获得 AppId 和 AppSecret。
- 微信App内嵌打开网页授权登录：符合 OAuth 2.0 标准。在“[微信公众平台](https://mp.weixin.qq.com/)”注册“服务号”（需提供公司营业执照），获得 AppId 和 AppSecret。参考官方文档：[《微信网页授权》](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842)、[《（企业）注册公众平台步骤》](https://kf.qq.com/faq/120911VrYVrA151013MfYvYV.html)

![微信开放平台 网站 微信登录 授权回调域](https://user-images.githubusercontent.com/4971414/52533914-8e19f480-2d75-11e9-8d52-28b1025ae84b.png)

![微信公众平台 服务号 接口权限 网页授权](https://user-images.githubusercontent.com/4971414/52534579-59f70180-2d7e-11e9-8949-ab76e89e4764.png)

## 一键安装 Laravel 微信登录

```
composer require laravel-socialite-providers/socialite-providers
composer require sinkcup/laravel-make-auth-socialite
php artisan make:auth
php artisan make:auth-socialite --force
php artisan migrate
```

按照[文档](https://laravel-socialite-providers.github.io/socialite-providers/wechat-web/)进行下列操作：

修改 `config\app.php`

```
'providers' => [
    // 如果有则删除 'Laravel\Socialite\SocialiteServiceProvider',
    \SocialiteProviders\Manager\ServiceProvider::class, // 新增
];
```

修改 `app/Providers/EventServiceProvider.php`

```
    protected $listen = [
        \SocialiteProviders\Manager\SocialiteWasCalled::class => [ // 新增
            'LaravelSocialiteProviders\\WeChatWeb\\WeChatWebExtendSocialite@handle', // 新增
            'LaravelSocialiteProviders\\WeChatServiceAccount\\WeChatServiceAccountExtendSocialite@handle', // 新增
        ],
    ];
```

修改 `config/services.php`

```
    'wechat_web' => [
        'client_id' => env('WECHAT_WEB_APP_ID'),
        'client_secret' => env('WECHAT_WEB_APP_SECRET'),
        'redirect' => env('WECHAT_WEB_CALLBACK_URL'),
        'scopes' => preg_split('/,/', env('WECHAT_WEB_SCOPES'), null, PREG_SPLIT_NO_EMPTY),
        'union_id_with' => preg_split('/,/', env('WECHAT_WEB_UNION_ID_WITH'), null, PREG_SPLIT_NO_EMPTY),
    ],

    'wechat_service_account' => [
        'client_id' => env('WECHAT_SERVICE_ACCOUNT_APP_ID'),
        'client_secret' => env('WECHAT_SERVICE_ACCOUNT_APP_SECRET'),
        'redirect' => env('WECHAT_SERVICE_ACCOUNT_CALLBACK_URL'),
        'scopes' => preg_split('/,/', env('WECHAT_SERVICE_ACCOUNT_SCOPES'), null, PREG_SPLIT_NO_EMPTY),
        'union_id_with' => preg_split('/,/', env('WECHAT_SERVICE_ACCOUNT_UNION_ID_WITH'), null, PREG_SPLIT_NO_EMPTY),
    ],
```

修改 ENV（如果是本地开发，则修改`.env`文件）：

```
# 如果没有服务号，那只保留 wechat_web 即可
AUTH_SOCIAL_LOGIN_PROVIDERS=wechat_web,wechat_service_account

WECHAT_WEB_APP_ID=wx213
WECHAT_WEB_APP_SECRET=asdf
WECHAT_WEB_CALLBACK_URL="http://example.com/login/wechat-web/callback"
# 默认使用 openid，如果需要把 网站、服务号、小程序 打通，则加上这两行，使用 unionid
WECHAT_WEB_SCOPES=unionid
WECHAT_WEB_UNION_ID_WITH=wechat_service_account,wechat_mini_program

WECHAT_SERVICE_ACCOUNT_APP_ID=wx222
WECHAT_SERVICE_ACCOUNT_APP_SECRET=zxcv
WECHAT_SERVICE_ACCOUNT_CALLBACK_URL="http://example.com/login/wechat-service-account/callback"
WECHAT_SERVICE_ACCOUNT_SCOPES=unionid
WECHAT_SERVICE_ACCOUNT_UNION_ID_WITH=wechat_web,wechat_mini_program
```

服务号需绑定 微信开放平台，才可使用 unionid，参考[《微信登录UnionID终极方案》](https://sinkcup.github.io/wechat-login-union-id)。

服务号还支持“免授权登录”（只能获取 openid），修改 scopes 即可：

```
WECHAT_SERVICE_ACCOUNT_SCOPES=snsapi_base
```

微信登录不支持 localhost 开发，要求验证真实域名，所以只能先验证通过，然后本机配 hosts 开发，比如：

```
127.0.0.1 example.com
```

用浏览器和“微信开发者工具”访问登录页，即可看到效果：

![Laravel 微信网页登录](https://user-images.githubusercontent.com/4971414/52535483-ece96900-2d89-11e9-896d-5c4c63c3d2df.png)

![Laravel 微信开发者工具 服务号登录](https://user-images.githubusercontent.com/4971414/58941337-236e4800-87ae-11e9-98df-b0a85d6fd168.png)

查询数据库可发现 users 表创建了1条记录，而 social_accounts 表创建了2条记录（unionId 相同，而 openId 不同）：

```
mysql> select * from users\G;
*************************** 1. row ***************************
               id: 1
             name: sink
            email: wechat_web.o8kXM0YPa8C_Qnih9cCwGpe1sABQ@example.com
email_verified_at: NULL
         password: NULL
   remember_token: NULL
       created_at: 2019-02-10 12:56:33
       updated_at: 2019-02-10 12:56:33
           avatar: http://thirdwx.qlogo.cn/mmopen/vi_32/xxx/132
1 row in set (0.00 sec)


mysql> select social_accounts\G;
*************************** 1. row ***************************
              id: 1
         user_id: 1
        provider: wechat_web
provider_user_id: o8kXM0YPa8C_Qnih9cCwGpe1sABQ
    access_token: 22_tW4oW6k18xpeuOtiRrv87ArZd9cCLHQ2ECJSiAevgybrBEQIP8ywupvlGfv2A1byfJzVjmXpoBuQDkBdrAV0DBy0ZcCUHjDulvVJsAloZMY
   refresh_token: 22_MOLTh04Jk9xiMaYYTmZmefEGYkdGTH3NOt66zDxUuuVNps1Kt4QoQGE9n2vE6MKhfz8bqtmGFQT6Ijr93rwVdQzjQp6R5TDe5RH9SB0m0OY
      expires_in: 7200
      created_at: 2019-02-10 12:56:33
      updated_at: 2019-02-10 12:56:33
        nickname: sink
            name: NULL
           email: NULL
          avatar: http://thirdwx.qlogo.cn/mmopen/vi_32/xxx/132
             raw: {"openid":"o0Xnp5liQw-fxkm8OLrbbPvljr48","nickname":"sink","sex":1,"language":"zh_CN","city":"\u5609\u5b9a","province":"\u4e0a\u6d77","country":"\u4e2d\u56fd","headimgurl":"http:\/\/thirdwx.qlogo.cn\/mmopen\/vi_32\/xxx\/132","privilege":[],"unionid":"o8kXM0YPa8C_Qnih9cCwGpe1sABQ"}
*************************** 2. row ***************************
              id: 2
         user_id: 1
        provider: wechat_service_account
provider_user_id: o8kXM0YPa8C_Qnih9cCwGpe1sABQ
    access_token: 22_EMoMkkiUVgXVRmwLeX0mdweJYxeMOhsiaqwnGKHXMi8yCzsu5o66Vu3QVbq4RiKwiF1SJr7RW5YYdRAPQDYNOZ1z13PqD2Qe8DcTDRniDtx
   refresh_token: 22_2uIwoMVG2Hv3cnOBJ25E2rEz2DpkQfGHRaCP9St6edIO94sDLHncf1xF7LQE96DkskkZGjAnrBatyP3q9ONFit2v3MPmRfL75GSs3nHmf8A
      expires_in: 7200
      created_at: 2019-02-10 12:58:37
      updated_at: 2019-02-10 12:58:37
        nickname: sink
            name: NULL
           email: NULL
          avatar: http://thirdwx.qlogo.cn/mmopen/vi_32/xxx/132
             raw: {"openid":"oZg120nIyCJzEAyXKD5LJR8HhKCk","nickname":"sink","sex":1,"language":"zh_CN","city":"","province":"","country":"","headimgurl":"http://thirdwx.qlogo.cn/mmopen/vi_32/xxx/132","privilege":[],"unionid":"o8kXM0YPa8C_Qnih9cCwGpe1sABQ"}
```