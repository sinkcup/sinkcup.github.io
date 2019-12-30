---
layout: post
title:  "中国速度：getcomposer 下载加速"
date:   2019-12-30 17:15:00 +0800
categories: China-Speed, composer, mirrors, Jenkins
---

由于 composer 官网在国外，国际出口带宽有限，导致中国内地开发者下载很慢甚至超时。composer install 加速已经有云计算大厂提供了，比如 [阿里云](https://developer.aliyun.com/composer)、[腾讯云](https://mirrors.cloud.tencent.com/help/composer.html)。而 getcomposer 没有好的加速方式，本地开发和 docker build 在第一步就卡住了，本文将介绍一种好办法。

![内地 getcomposer 下载失败](https://upload-images.jianshu.io/upload_images/52469-19508b0c9f8f9cf0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 结论

很简单，在官方域名后面加上 .mirrors.china-speed.org.cn（中国速度） 即可。

国外官方：

```
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
```

中国速度：

```
curl -sS http://getcomposer.org.mirrors.china-speed.org.cn/installer | php -- --install-dir=/usr/local/bin --filename=composer
```

## 技术细节

分析 `installer` 源码可以发现：安装时会请求 `getcomposer.org/versions`，获得最新版下载地址：

```
{
    "stable": [{"path": "/download/1.9.1/composer.phar", "version": "1.9.1", "min-php": 50300}],
    "preview": [{"path": "/download/1.9.1/composer.phar", "version": "1.9.1", "min-php": 50300}],
    "snapshot": [{"path": "/composer.phar", "version": "f05e78aa9ee48a317142543da8b9c02613951273", "min-php": 50300}]
}
```

然后根据里面的地址下载 `composer.phar`，最后还会请求 `composer.phar.sig` 进行文件校验。

### 方案

第1步：云存储回源 getcomposer.org，配置：经常删除 `versions`（即可回源最新版），其他文件无需刷新（比如 `download/`）；
第2步：给云存储套上 CDN，配置：`/versions` 和 `/installer` 经常过期刷新，配置 HTTPS；
第3步：[持续集成](https://coding.net/products/ci?cps_source=PIevZ6Jr)定时抓取最新版 `https://getcomposer.org/installer`，把里面的域名改成国内 CDN，放到云存储；

阿里云和腾讯云都做了 packagist.org 的镜像，而没做 getcomposer.org 的镜像，阿里云手动挑了几个文件供大家下载，一旦 `versions` 更新将导致安装失败。

![大厂没做 getcomposer 镜像](https://upload-images.jianshu.io/upload_images/52469-8e03372ecfb5bc9b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

大厂没提供，所以只能自己做。

### 实战

第1步：创建一个云存储，配置回源，本文以[腾讯云存储](https://cloud.tencent.com/act/cps/redirect?redirect=10042&cps_key=16b83d1aa2e322d67b11fa1daaa4ab6b)为例。

![腾讯云存储免费6个月](https://upload-images.jianshu.io/upload_images/52469-511375084329dabb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![腾讯云存储回源设置](https://upload-images.jianshu.io/upload_images/52469-20212adc5a6bab57.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后我们通过云存储赠送的子域名试一下，第一次请求返回302回源，第二次是200直接返回。

![第一次302回源，第二次200](https://upload-images.jianshu.io/upload_images/52469-7e53e3aa45cfb49d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![腾讯云存储生命周期规则](https://upload-images.jianshu.io/upload_images/52469-6ae6741adb740f69.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

第2步：给云存储套上 CDN；

![腾讯云存储-自定义加速域名](https://upload-images.jianshu.io/upload_images/52469-646399a93bfd54db.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![腾讯云-CDN 缓存配置](https://upload-images.jianshu.io/upload_images/52469-04b0c804fe8471cd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![腾讯云-CDN 配置 HTTPS](https://upload-images.jianshu.io/upload_images/52469-f368b9bf7e1ea0a6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

第3步：在 [CODING 持续集成（免费的 Jenkins 云服务）](https://coding.net/products/ci?cps_source=PIevZ6Jr) 中创建一个构建任务，定时抓取 `https://getcomposer.org/installer`。

![CODING Jenkins 云服务](https://upload-images.jianshu.io/upload_images/52469-4ce64e98aaa68f9a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![CODING Jenkins 定时触发](https://upload-images.jianshu.io/upload_images/52469-dc33c46d575482e6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

`Jenkinsfile` 代码如下：

```
pipeline {
  agent any
  stages {
    stage('检出') {
      steps {
        checkout(
          [$class: 'GitSCM', branches: [[name: env.GIT_BUILD_REF]], 
          userRemoteConfigs: [[url: env.GIT_REPO_URL, credentialsId: env.CREDENTIALS_ID]]]
        )
      }
    }
    stage('构建') {
      steps {
        echo '构建中...'
        sh 'wget https://getcomposer.org/installer -O web/installer'
        sh 'sed -i "s|getcomposer.org\'|getcomposer.org.mirrors.china-speed.org.cn\'|g" web/installer'
        sh 'git diff'
        echo '构建完成.'
      }
    }
    stage('测试') {
      steps {
        echo '测试中...'
        sh 'php web/installer --install-dir=./ --filename=composer'
        sh './composer --version'
        echo '测试完成.'
      }
    }
    stage('部署') {
      steps {
        echo '部署中...'
        sh 'apt-get update && apt-get install -y python3-pip'
        sh 'pip3 install coscmd'
        sh "coscmd config -a $TENCENT_SECRET_ID -s $TENCENT_SECRET_KEY -b $TENCENT_BUCKET -r $TENCENT_REGION"
        sh 'coscmd upload web/installer /'
        echo '部署完成'
      }
    }
  }
}
```

## 鸣谢

感谢 [腾讯云（免费6个月）](https://cloud.tencent.com/act/cps/redirect?redirect=10042&cps_key=16b83d1aa2e322d67b11fa1daaa4ab6b)、[七牛云（每月免费 10GB）](https://portal.qiniu.com/signup?code=1h6w1ounb13yp) 提供云存储和国内 CDN。

感谢 [CODING 持续集成](https://coding.net/products/ci?cps_source=PIevZ6Jr) 提供免费的 Jenkins 云服务。

通过上述邀请链接注册，本站将获得流量奖励，供大家下载使用。