---
layout: post
title:  "Apache change Cookie (Request and Response)"
date:   2019-04-21 11:39:00 +0800
categories: apache, cookie, header
---

## Apache change Request Cookie

```
    SetEnvIf Authorization "^Session\ (.*)$" session=$1
    RequestHeader set Cookie "PHPSESSID=%{session}e" env=session
    #bad # RequestHeader set Cookie "laravel_session=${1}e" "expr=%{HTTP:Authorization} =~ /^Session\ (.*)$/i"
```

## Apache change Response Cookie

```

    RewriteCond %{HTTP:Authorization} ^Session\ (.*)$ [NC]
    RewriteRule ^ - [CO=PHPSESSID:%1:.%{HTTP_HOST}:1440:/]
```

## detail for Request Cookie

apache config `/etc/apache2/sites-enabled/000-default.conf`

```
<VirtualHost *:80>
    #ServerName demo.localhost

    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html

    LogLevel alert rewrite:trace6

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined

    RewriteEngine On

    SetEnvIf Authorization "^Session\ (.*)$" session=$1
    RequestHeader set Cookie "PHPSESSID=%{session}e" env=session
</VirtualHost>
```

php `/var/www/html/php.php`

```
<?php
//session_start();
//var_dump(session_id());
var_dump($_COOKIE);
```

shell result

```
sudo a2enmod headers
sudo service apache2 restart
curl -i 'http://demo.localhost/php.php' -H 'Authorization: Session npvh65dsqshgk24qj4a1nitmoc'
    HTTP/1.1 200 OK
    Date: Sun, 21 Apr 2019 03:26:44 GMT
    Server: Apache/2.4.34 (Ubuntu)
    Vary: Accept-Encoding
    Content-Length: 73
    Content-Type: text/html; charset=UTF-8

    array(1) {
      ["PHPSESSID"]=>
      string(26) "npvh65dsqshgk24qj4a1nitmoc"
    }
```

## References

1. [RequestHeader Directive - mod_headers - Apache HTTP Server Version 2.4](https://httpd.apache.org/docs/2.4/mod/mod_headers.html#requestheader)
2. [CO|cookie - RewriteRule Flags - Apache HTTP Server Version 2.4](https://httpd.apache.org/docs/current/rewrite/flags.html#flag_co)
3. [Copy cookie to request header in Apache HTTPD - Server Fault](https://serverfault.com/questions/801106/copy-cookie-to-request-header-in-apache-httpd)