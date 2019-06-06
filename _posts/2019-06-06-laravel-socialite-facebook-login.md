---
layout: post
title:  "Laravel 5.8 Facebook Login(using scaffold, no coding required)"
date:   2019-06-06 11:33:00 +0800
categories: Laravel, Socialite, Facebook, composer
---

When you search "Laravel Facebook Login" in Google, there are many articles telling you to install [Socialite](https://laravel.com/docs/socialite), then write controllers, views and routes, it's too tedious.

Following "DRY", the same code should only be wrote once by one person, then share it as a package, others just install it, no coding required.

Nobody have done it, so I do it.

Do you know Laravel official command to make login page? it's

```
php artisan make:auth
```

I write a similar command to make socialite login page:

```
composer require sinkcup/laravel-make-auth-socialite
php artisan make:auth-socialite
```

change `config/services.php`

```
    'facebook' => [
        'client_id' => env('FACEBOOK_APP_ID'),
        'client_secret' => env('FACEBOOK_APP_SECRET'),
        'redirect' => env('FACEBOOK_OAUTH_REDIRECT_URI'),
    ],
```

create a app on [Facebook Developers](https://developers.facebook.com/apps/), then change `.env`

```
AUTH_SOCIAL_LOGIN_PROVIDERS=GitHub,Facebook

# Facebook allows localhost, it's very friendly to developers
FACEBOOK_APP_ID=123456
FACEBOOK_APP_SECRET=secret
FACEBOOK_CALLBACK_URL="http://localhost/login/facebook/callback"
```

visiting the Login page in browser, you can see everything is OK:

![Laravel Social Login demo page: Facebook](https://user-images.githubusercontent.com/4971414/59002113-ed7ba300-8843-11e9-87a9-b754dcdea5bf.png)

![Facebook OAuth Login dialog](https://user-images.githubusercontent.com/4971414/59005039-96c79680-884e-11e9-8967-0ca90261ff06.png)


If you want to change the Login page, feel free to edit `resources/views/auth/login.blade.php`

If you have any question, create a issue in the repo: [github.com/sinkcup/laravel-make-auth-socialite](https://github.com/sinkcup/laravel-make-auth-socialite)