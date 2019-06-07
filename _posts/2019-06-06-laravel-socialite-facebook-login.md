---
layout: post
title:  "Laravel 5.8 Facebook Login(using scaffold, no coding required)"
date:   2019-06-06 11:33:00 +0800
categories: Laravel, Socialite, Facebook, composer
---

When you search “Laravel Facebook Login” on Google, there are many articles telling you to install [Socialite](https://laravel.com/docs/socialite), then write controllers, views, and routes, it’s too tedious.

Following “DRY”, the same code should only be written once by one person, then share it as a package, others just install it, no coding required.

Nobody has done it, so I do it.

Do you know Laravel official command to make the login page? it's

```
php artisan make:auth
```

I write a similar command to make the socialite login page:

```
composer require sinkcup/laravel-make-auth-socialite
php artisan make:auth-socialite
php artisan migrate
```

change `config/services.php`

```
    'facebook' => [
        'client_id' => env('FACEBOOK_APP_ID'),
        'client_secret' => env('FACEBOOK_APP_SECRET'),
        'redirect' => env('FACEBOOK_VALID_OAUTH_REDIRECT_URI'),
    ],
```

create an app on [Facebook Developers](https://developers.facebook.com/apps/), then change `.env`

```
AUTH_SOCIAL_LOGIN_PROVIDERS=GitHub,Facebook

# Facebook allows localhost, it's very friendly to developers
FACEBOOK_APP_ID=123456
FACEBOOK_APP_SECRET=secret
FACEBOOK_VALID_OAUTH_REDIRECT_URI="http://localhost/login/facebook/callback"
```

visiting the Login page in a browser, you can see everything is OK:

![Laravel Social Login demo page: Facebook](https://user-images.githubusercontent.com/4971414/59002113-ed7ba300-8843-11e9-87a9-b754dcdea5bf.png)

![Facebook OAuth Login dialog](https://user-images.githubusercontent.com/4971414/59005039-96c79680-884e-11e9-8967-0ca90261ff06.png)

![Laravel profile page when login with Facebook](https://user-images.githubusercontent.com/4971414/59098916-489cbb00-8954-11e9-97a4-20649582ae98.png)

feel free to edit the pages:

 - `resources/views/auth/login.blade.php`
 - `resources/views/user/profile_edit.blade.php`

If you have any question, create an issue in the repo: [github.com/sinkcup/laravel-make-auth-socialite](https://github.com/sinkcup/laravel-make-auth-socialite)