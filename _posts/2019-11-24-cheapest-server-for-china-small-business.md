---
layout: post
title:  "最便宜的服务器方案：适合外包小网站或Serverless备案"
date:   2019-11-24 17:17:00 +0800
categories: cheapest, arch, aliyun, China
---

朋友有个公司小网站，访问量低，问我：买什么服务器划算？

做惯了正规项目，我觉得那很简单啊：

- 最便宜的云服务器（999元/年，新用户赠送的最低配跑不起来Swarm，至少1核2GB才可以）
- 最便宜的云数据库（405元/年） 
- 云存储（按量计费，或者[七牛-小流量免费](https://portal.qiniu.com/signup?code=1h6w1ounb13yp)）
- 最便宜的负载均衡（352元/年，1台服务器要什么负载均衡？为了安全，不暴露后面的服务器 IP，还能自动配 SSL）
- 云计算自带的 Docker Swarm（免费，最低1台服务器；而 K8s 最低3台，K8s Serverless 无法备案）
- 云计算自带的 CD 自动构建 Docker 上线（免费）
- 云计算自带的代码托管（免费，账号归公司，把外包加进去）

合计：1756元/年。用了一段时间，没问题，然后看到一则通知：

> 阿里云容器服务即将于 2019 年年底停止对 Swarm 的技术支持

![阿里云Swarm](https://user-images.githubusercontent.com/4971414/69491803-246a7180-0ed5-11ea-80ad-c958eee6ea01.png)

Swarm 已经没落，怎么办？

- K8s 虽好，但最低3台，不适合小网站。
- K8s Serverless（[阿里云](https://www.aliyun.com/product/eci?userCode=vt3zcwxg)、[腾讯云](https://cloud.tencent.com/product/cis)） 更好更先进，支持1台，但“无服务器”架构没有固定IP，没法备案。
- 阿里云 Web+ 和 K8s Serverless 类似，为了国产化？

才想起来当年上学时用过的虚拟主机（web hosting），AWS、腾讯云都不做这个，太低端了，而阿里云收购的万网在做，看了下，竟然还在升级，支持 PHP 7.2 和 HTTPS，只要 __206 元/年__，包括了 web server 和 数据库，几乎解决了小网站的所有问题！

最佳实践：

- 小网站：[阿里云-云虚拟主机](https://promotion.aliyun.com/ntms/yunparter/invite.html?userCode=vt3zcwxg) + [七牛云存储-小流量免费](https://portal.qiniu.com/signup?code=1h6w1ounb13yp)；
- Serverless 备案：阿里云-云虚拟主机（当然还是有点浪费，Serverless 时代即将来临，各个云计算厂商将如何解决备案问题，值得持续关注）；

参考各个云计算厂商价格对比：

产品 | 配置 | 价格
--------------|-------|------
阿里云-弹性Web托管 | 128M、PHP 5.5、MySQL 5.5 | 199 元/年
[阿里云-云虚拟主机](https://wanwang.aliyun.com/hosting?userCode=vt3zcwxg) | 1核1GB、PHP 7.2、MySQL 5.7 | __206 元/年__
[阿里云-Web应用托管服务Web+](https://www.aliyun.com/product/webx?userCode=vt3zcwxg) | Serverless，最低1台 | 同服务器
阿里云-云服务器 | 突发5%的2核、0.5GB | 229元/年
阿里云-云服务器 | 突发20%的1核、0.5GB | 304元/年
腾讯云-云服务器 | 1核1GB | 493元/年
阿里云-云服务器 | 1核1GB | 601元/年
腾讯云-云服务器 | 1核2GB | 546元/年
阿里云-云服务器 | 1核2GB | 999元/年

后记：

如何把 Laravel 项目部署到 虚拟主机上（不能配 DocumentRoot 和 `.env`）？敬请期待。
