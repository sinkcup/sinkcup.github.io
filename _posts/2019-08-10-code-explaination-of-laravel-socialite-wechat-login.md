---
layout: post
title:  "源码讲解：如何优雅的让 Laravel 微信登录支持 UnionId 和 snsapi_base"
date:   2019-08-10 20:46:00 +0800
categories: Laravel, WeChat, Socialite
---

Laravel 通过官方扩展包——[Socialite](https://laravel.com/docs/socialite) 来做 OAuth 登录，官方支持 Facebook、 Twitter、 LinkedIn、 Google、GitHub 和 Bitbucket，其他登录渠道依靠开源项目——[Socialite Providers](https://socialiteproviders.netlify.com/)，有人提交了微信登录和微信服务号登录，试了下，发现有问题：

```
    protected function mapUserToObject(array $user)
    {
        return (new User())->setRaw($user)->map([
            'id'     => Arr::get($user, 'openid'),
            'unionid' => Arr::get($user, 'unionid'),
```

1. user.id 写死了 openid, 把 [unionid](https://github.com/SocialiteProviders/Providers/blob/a26a1b4f7020d972b3a12217c5adcc06c65f1836/src/Weixin-Web/Provider.php#L102) 单做了一个字段，不符合`Laravel\Socialite\AbstractUser`格式，导致登录以后里还要额外处理。
2. 不方便切换 snsapi_base（服务号免授权登录） 和 snsapi_userinfo
3. 代码不规范：出现了[注释掉的代码](https://github.com/SocialiteProviders/Providers/blob/a26a1b4f7020d972b3a12217c5adcc06c65f1836/src/Weixin-Web/Provider.php#L41)、英文错误（包名叫做 weixin-web，中英文混合，IDE 警告，而微信官方的英文名是 WeChat。由于这个包已被广泛使用，无法改名。）

所以我重写了两个：WeChatWeb（[GitHub](https://github.com/SocialiteProviders/Providers/tree/master/src/WeChatWeb)、[文档](https://socialiteproviders.netlify.com/providers/wechat-web.html)、[Packagist](https://packagist.org/packages/socialiteproviders/wechat-web)） 和 WeChatServiceAccount（[GitHub](https://github.com/SocialiteProviders/Providers/tree/master/src/WeChatServiceAccount)、[文档](https://socialiteproviders.netlify.com/providers/wechat-service-account.html)、[Packagist](https://packagist.org/packages/socialiteproviders/wechat-service-account)）。

[增加新渠道的步骤](https://socialiteproviders.netlify.com/contribute.html)：

1. fork [Providers](https://github.com/SocialiteProviders/Providers)，用 [Generators](https://github.com/SocialiteProviders/Generators) 一键生成代码，也就3个文件，记得还要修改`Providers/build/split.sh`
2. fork [Documentation](https://github.com/SocialiteProviders/Documentation)，写一份文档。
3. 等待项目管理员操作：合并 PR，手动执行 split.sh，手动打 tag，手动提交 package 到 [packagist.org](https://packagist.org/packages/socialiteproviders/)……[我等了1个月](https://github.com/SocialiteProviders/Providers/issues/304)

生成的代码是按照 OAuth2 标准，而微信登录并不标准，所以需要 HACK。

## 如何自由切换 openId 和 unionId

“用 openId 还是 unionId ？”是开发者根据不同业务来决定的，所以不能写死任何一种，应该可配置。查看[文档](https://laravel.com/docs/5.8/socialite#optional-parameters)和[代码](https://github.com/laravel/socialite/blob/ab5974b13b775e14d11f220064a110d60743eee0/src/Two/AbstractProvider.php#L181)：

```php
<?php
namespace Laravel\Socialite\Two;

use Laravel\Socialite\Contracts\Provider as ProviderContract;

abstract class AbstractProvider implements ProviderContract
{
    protected function getCodeFields($state = null)
    {
        $fields = [
            'client_id' => $this->clientId,
            'redirect_uri' => $this->redirectUrl,
            'scope' => $this->formatScopes($this->getScopes(), $this->scopeSeparator),
            'response_type' => 'code',
        ];
        // ...
    }

    public function with(array $parameters)
    {
        $this->parameters = $parameters;
        return $this;
    }
}
```

可以发现 Socialite 只有 with 和 scopes 可配置，根据语义，unionId 属于一个权限，所以应该放在 scopes 里：

```php
'github' => [
    'client_id' => env('GITHUB_CLIENT_ID'),
    'client_secret' => env('GITHUB_CLIENT_SECRET'),
    'redirect' => 'http://your-callback-url',
    'scopes' => ['read:user', 'public_repo'],
],
'wechat_web' => [
    'client_id' => env('WECHAT_WEB_APP_ID'),
    'client_secret' => env('WECHAT_WEB_APP_SECRET'),
    'redirect' => env('WECHAT_WEB_CALLBACK_URL'),
    'with' => ['foo' => 'bar', hd' => 'example.com'],
    'scopes' => ['unionId'],
],
```

unionId 作为一个假权限，不能带在请求里，在代码里要 HACK 掉：

```php
<?php
namespace SocialiteProviders\WeChatWeb;

use SocialiteProviders\Manager\OAuth2\AbstractProvider;
use SocialiteProviders\Manager\OAuth2\User;

class Provider extends AbstractProvider
{
    protected function mapUserToObject(array $user)
    {
        return (new User())->setRaw($user)->map([
            // HACK: use unionid as user id
            'id'       => in_array('unionid', $this->getScopes()) ? $user['unionid'] : $user['openid'],
             // HACK: Tencent scope snsapi_base only return openid
            'nickname' => isset($user['nickname']) ? $user['nickname'] : null,
            'name'     => null,
            'email'    => null,
            'avatar'   => isset($user['headimgurl']) ? $user['headimgurl'] : null,
        ]);
    }

    protected function formatScopes(array $scopes, $scopeSeparator)
    {
        // HACK: unionid is a faker scope for user id
        if (in_array('unionid', $scopes)) {
            unset($scopes[array_search('unionid', $scopes)]);
        }
        return implode($scopeSeparator, $scopes);
    }
}
```

## 如何自由切换 snsapi_base 和 snsapi_userinfo

微信服务号登录支持两种授权：

* snsapi_base （不弹出授权页面，直接跳转，只能获取用户openid）
* snsapi_userinfo （弹出授权页面，可通过openid拿到昵称、性别、所在地。并且， 即使在未关注的情况下，只要用户授权，也能获取其信息 ）

按照标准修改 scopes：

```
'wechat_web' => [
  'client_id' => env('WECHAT_WEB_APP_ID'),
  'client_secret' => env('WECHAT_WEB_APP_SECRET'),
  'redirect' => env('WECHAT_WEB_CALLBACK_URL'),
  'scopes' => ['snsapi_base'],
],`
```

但腾讯的接口不符合 OAuth2 标准，scope 为 snsapi_base 时，竟然在第2步“获取 token”时返回了用户信息（openid），而不是标准规定的下一步“获取用户信息”。所以需要 HACK：

```php
<?php

namespace SocialiteProviders\WeChatServiceAccount;

use SocialiteProviders\Manager\OAuth2\AbstractProvider;

class Provider extends AbstractProvider
{
    protected function getUserByToken($token)
    {
        // HACK: Tencent return id when grant token, and can not get user by this token
        if (in_array('snsapi_base', $this->getScopes())) {
            return ['openid' => $this->credentialsResponseBody['openid']];
        }
        $response = $this->getHttpClient()->get('https://api.weixin.qq.com/sns/userinfo', [
            'query' => [
                'access_token' => $token, // HACK: Tencent use token in Query String, not in Header Authorization
                'openid'       => $this->credentialsResponseBody['openid'],
                'lang'         => 'zh_CN',
            ],
        ]);
        return json_decode($response->getBody(), true);
    }

    protected function formatScopes(array $scopes, $scopeSeparator)
    {
        // HACK: unionid is a faker scope for user id
        if (in_array('unionid', $scopes)) {
            unset($scopes[array_search('unionid', $scopes)]);
        }
        // HACK: use scopes() instead of setScopes()
        // docs: https://laravel.com/docs/socialite#access-scopes
        if (in_array('snsapi_base', $scopes)) {
            unset($scopes[array_search('snsapi_userinfo', $scopes)]);
        }
        return implode($scopeSeparator, $scopes);
    }
}
```

渠道包代码到此结束，然后 Laravel route 按照通用写法即可：

```php
Route::get('login/{provider}', 'Auth\LoginController@redirectToProvider');
Route::get('login/{provider}/callback', 'Auth\LoginController@handleProviderCallback');
```

Socialite 只管调用 API 获取 token 和 用户资料，然后 Laravel 项目里的 LoginController 进行创建/更新用户到数据库，那如何判断 unionId 呢？比如先进行了微信网页登录，再用手机进行了服务号登录，这两个渠道需要识别为一个用户，所以需要额外处理。怎么处理呢？有2个办法：

1. 判断渠道名称，对微信进行 HACK
2. 新增一个配置，做成通用的

第2种才是优雅的，如下：

```php
    'wechat_web' => [
        'client_id' => env('WECHAT_WEB_APP_ID'),
        'client_secret' => env('WECHAT_WEB_APP_SECRET'),
        'redirect' => env('WECHAT_WEB_CALLBACK_URL'),
        'union_id_with' => 'wechat_service_account,wechat_mini_program',
    ],

    'wechat_service_account' => [
        'client_id' => env('WECHAT_SERVICE_ACCOUNT_APP_ID'),
        'client_secret' => env('WECHAT_SERVICE_ACCOUNT_APP_SECRET'),
        'redirect' => env('WECHAT_SERVICE_ACCOUNT_CALLBACK_URL'),
        'union_id_with' => 'wechat_web,wechat_mini_program',
    ],
```

```php
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Socialite;

class LoginController extends Controller
{
    /**
     * Convert provider slug to service name which is using in config/services.php
     * @param string $providerSlug e.g., paypal-sandbox
     * @return string e.g., paypal_sandbox
     */
    public static function convertProviderSlugToServiceName($providerSlug)
    {
        return str_replace('-', '_', strtolower($providerSlug));
    }

    public function redirectToProvider($providerSlug)
    {
        $provider = self::convertProviderSlugToServiceName($providerSlug);
        return Socialite::driver($provider)
            ->scopes(config("services.{$provider}.scopes"))
            ->redirect();
    }

    public function handleProviderCallback($providerSlug)
    {
        $provider = self::convertProviderSlugToServiceName($providerSlug);
        $remote_user = Socialite::driver($provider)
            ->scopes(config("services.{$provider}.scopes"))
            ->user();

        // if logged in, should link multiple auth providers to an account
        $user_id = auth()->user()->id ?? null;
        // if you have defined "union_id_with" in config, it will be load at here
        // some providers use one union id, e.g., WeChat Web, WeChat Service Account
        if (!empty($union_id_with_providers = config("services.{$provider}.union_id_with"))) {
            $user_id = SocialAccount::whereIn('provider', array_diff($union_id_with_providers, [$provider]))
                ->where('provider_user_id', $remote_user->getId())
                ->whereNotNull('user_id')
                ->value('user_id');
        }
        $social_account = SocialAccount::firstOrNew([
            'provider' => $provider,
            'provider_user_id' => $remote_user->getId(),
        ], ['user_id' => $user_id]);
        $name = $remote_user->getName() ?: $remote_user->getNickname();
        if (!empty($social_account->user)) {
            $user = $social_account->user;
        } else {
            $user_model = config('auth.providers.users.model');
            $email = $remote_user->getEmail() ?: $provider. '.' . $remote_user->getId() . '@example.com'; // faker for email unique in db
            $user = $user_model::where('email', $email)->first();
            if (empty($user)) {
                $user = $user_model::create([
                    'email' => $email,
                    'name' => $name ?: $provider . ' user',
                ]);
            }
            $social_account->user()->associate($user);
        }
        $social_account->nickname = $remote_user->getNickname();
        // ...
        $social_account->save();
        $user->save();
        auth()->login($user);
        return redirect()->intended($this->redirectPath());
    }
}
```

注意：

* 链接要符合 [Domain/URL Slug](https://en.wikipedia.org/wiki/Clean_URL#Slug) 规则，即“全小写，连字符”，比如微信网页登录的链接是 “https://example.com/login/wechat-web”
* `config/services.php` 里面的渠道名称要符合 PHP 数组规则，即“全小写，下划线”，比如微信网页登录是 “wechat_web”

所以上面代码里进行了转换。由于 route、controller、登录页是各个项目通用的，所以我把它们也做成了一个开源项目：[sinkcup/laravel-make-auth-socialite](https://github.com/sinkcup/laravel-make-auth-socialite/blob/master/src/Http/Controllers/SocialiteLoginController.php)。

使用教程请看：[《Laravel 微信登录——一键安装，支持 UnionId》](./laravel-socialite-wechat-login)

