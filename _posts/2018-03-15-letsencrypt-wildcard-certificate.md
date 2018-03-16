---
layout: post
title:  "Tutorials: Create Let's Encrypt Wildcard Certificate"
date:   2018-03-15 10:15:00 +0800
categories: https, letsencrypt
---
March 13, 2018, Let's Encrypt Wildcard certificate support is live.

How to use it? Follow me.

```
git clone git@github.com:certbot/certbot.git
git checkout v0.22.0
./certbot-auto certonly --manual -d *.example.com --agree-tos --manual-public-ip-logging-ok --preferred-challenges dns-01 --server https://acme-v02.api.letsencrypt.org/directory

echo "add TXT to your domain DNS record"
echo "press Enter"

echo "Done!"
sudo ls -l /etc/letsencrypt/live/example.com/


echo "test on localhost"

echo "edit local web server config, see the apache2 config below"
sudo service apache2 restart
echo "127.0.0.1 www.example.com" | sudo tee -a /etc/hosts

curl -v "https://www.example.com/"
```

## Screenshots

![image](https://user-images.githubusercontent.com/4971414/37441047-663cd11c-283a-11e8-8326-3c721928bc1a.png)

![image](https://user-images.githubusercontent.com/4971414/37441837-3218c662-283e-11e8-869f-4aa9d7409630.png)

![image](https://user-images.githubusercontent.com/4971414/37441781-fd5f0b5c-283d-11e8-8c5b-a1d9c0751d99.png)

![image](https://user-images.githubusercontent.com/4971414/37441625-5714fbc6-283d-11e8-8443-a38154f36b52.png)

![image](https://user-images.githubusercontent.com/4971414/37441652-81072468-283d-11e8-9853-a130e3362b1f.png)

## apache2 SSL config

```
<VirtualHost *:80>
    ServerName example.com
    ServerAlias *.example.com
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>

<VirtualHost *:443>
    ServerName example.com
    ServerAlias *.example.com
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html
    SSLEngine on
    SSLCertificateFile "/etc/letsencrypt/live/example.com/fullchain.pem"
    SSLCertificateKeyFile "/etc/letsencrypt/live/example.com/privkey.pem"
</VirtualHost>
```

## References

- [ACME v2 and Wildcard Certificate Support is Live](https://community.letsencrypt.org/t/acme-v2-and-wildcard-certificate-support-is-live/55579)
- [ACME v2 Compatible Clients](https://letsencrypt.org/docs/client-options/#acme-v2-compatible-clients)
