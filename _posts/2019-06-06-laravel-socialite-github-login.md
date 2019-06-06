---
layout: post
title:  "Laravel 5.8 GitHub Login(using scaffold, no coding required)"
date:   2019-06-06 12:33:00 +0800
categories: Laravel, Socialite, GitHub, composer
---

When you search “Laravel GitHub Login” on Google, there are many articles telling you to install [Socialite](https://laravel.com/docs/socialite), then write controllers, views, and routes, it’s too tedious.

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
    'github' => [
        'client_id' => env('GITHUB_CLIENT_ID'),
        'client_secret' => env('GITHUB_CLIENT_SECRET'),
        'redirect' => env('GITHUB_CALLBACK_URL'),
    ],
```

create an app on [GitHub Developers OAuth Apps](https://github.com/settings/developers), then change `.env`

```
AUTH_SOCIAL_LOGIN_PROVIDERS=GitHub,Facebook

# GitHub allows localhost, it's very friendly to developers
GITHUB_CLIENT_ID=foo
GITHUB_CLIENT_SECRET=bar
GITHUB_CALLBACK_URL=http://localhost/login/github/callback
```

visiting the Login page in a browser, you can see everything is OK:

![Laravel Social Login demo page](https://user-images.githubusercontent.com/4971414/59020731-2a17c080-887d-11e9-8cc7-c8c46f97dd1b.png)

![GitHub OAuth Login Authorize page](https://user-images.githubusercontent.com/4971414/59006611-764f0a80-8855-11e9-9ac9-0f4de8ff6e77.png)

![Laravel profile page](https://user-images.githubusercontent.com/4971414/59006670-c332e100-8855-11e9-8fca-eefc275b57d0.png)

![Laravel social accounts database](https://user-images.githubusercontent.com/4971414/59006844-8f0bf000-8856-11e9-9249-07eac114b1b4.png)

feel free to edit the pages:
 
 - `resources/views/auth/login.blade.php`
 - `resources/views/user/profile_edit.blade.php`

If you have any question, create an issue in the repo: [github.com/sinkcup/laravel-make-auth-socialite](https://github.com/sinkcup/laravel-make-auth-socialite)