---
layout: post
title:  "Laravel 5.8 Social Login with multiple providers(using scaffold, no coding required)"
date:   2019-06-07 18:40:00 +0800
categories: Laravel, Socialite, composer
---

Laravel supplies [Socialite](https://laravel.com/docs/socialite) for OAuth Login, but there is no migration to storage the social account details, even less link multiple providers to a user.

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

This package has these features:

- Automatically generate database, pages, and routes for Laravel Socialite.
- Login with multiple providers using the same email will be determined as one user.
- When logged in, you can link all providers to the current user, and login with them next time.

Let's experiment to verify it.

## prepare

- a Google mail
- a GitHub account registered by this email
- a Facebook account registered by mobile number or another email.

## steps

1. Login with Google, then logout.
2. Login with GitHub
3. Link Facebook, then logout.
4. Login with Facebook

## expect

there should be 1 user in the users table.

## config

change `config/services.php`

```
    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],
    'github' => [
        'client_id' => env('GITHUB_CLIENT_ID'),
        'client_secret' => env('GITHUB_CLIENT_SECRET'),
        'redirect' => env('GITHUB_CALLBACK_URL'),
    ],
    'facebook' => [ 
        'client_id' => env('FACEBOOK_APP_ID'),
        'client_secret' => env('FACEBOOK_APP_SECRET'),
        'redirect' => env('FACEBOOK_VALID_OAUTH_REDIRECT_URI'),
    ],
```

change `.env`

```
AUTH_SOCIAL_LOGIN_PROVIDERS=Google,GitHub,Facebook

# GitHub allows localhost(need to submit in the Google APIs console)
GOOGLE_CLIENT_ID=123-asdf.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=secret
GOOGLE_REDIRECT_URI=http://localhost/login/google/callback

# GitHub allows localhost(need to submit in the Developer settings)
GITHUB_CLIENT_ID=foo
GITHUB_CLIENT_SECRET=bar
GITHUB_CALLBACK_URL=http://localhost/login/github/callback

# Facebook allows localhost(no need to submit), it's very friendly to developers
FACEBOOK_APP_ID=123456
FACEBOOK_APP_SECRET=secret
FACEBOOK_VALID_OAUTH_REDIRECT_URI=http://localhost/login/facebook/callback
```

visiting the Login page in a browser, you can see everything is OK:

![Laravel Social Login demo page](https://user-images.githubusercontent.com/4971414/59027368-618d6980-888b-11e9-8aa0-53ee7fb3893a.png)

![Sign in with Google - Choose an account](https://user-images.githubusercontent.com/4971414/59096451-7e8a7100-894d-11e9-8a54-f7cbaf309270.png)

![Laravel profile page when login with Google](https://user-images.githubusercontent.com/4971414/59092998-7595a180-8945-11e9-88aa-498e85fd4025.png)

![Laravel database after logged in with Google](https://user-images.githubusercontent.com/4971414/59085482-512fca00-8931-11e9-92c7-cbfdb2c38c49.png)

![GitHub OAuth Login Authorize page](https://user-images.githubusercontent.com/4971414/59006611-764f0a80-8855-11e9-9ac9-0f4de8ff6e77.png)

![Laravel profile page when login with GitHub](https://user-images.githubusercontent.com/4971414/59092834-120b7400-8945-11e9-8b1d-ae50c862e6a8.png)

![Laravel database after logged in with GitHub](https://user-images.githubusercontent.com/4971414/59086178-876e4900-8933-11e9-8dad-e2a449a5689e.png)

![Facebook OAuth Login dialog](https://user-images.githubusercontent.com/4971414/59005039-96c79680-884e-11e9-8967-0ca90261ff06.png)

![Laravel profile page when login with Facebook](https://user-images.githubusercontent.com/4971414/59094045-e342cd00-8947-11e9-9ae1-f39affd74d2e.png)

![Laravel database after logged in with Facebook](https://user-images.githubusercontent.com/4971414/59094455-c0fd7f00-8948-11e9-8666-29b9203af0ea.png)

If you have any question, create an issue in the repo: [github.com/sinkcup/laravel-make-auth-socialite](https://github.com/sinkcup/laravel-make-auth-socialite)
