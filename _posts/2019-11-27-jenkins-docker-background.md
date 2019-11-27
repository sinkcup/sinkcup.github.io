---
layout: post
title:  "如何在Jenkins中跑多个Docker（MySQL、Redis等）？"
date:   2019-11-27 14:11:00 +0800
categories: Jenkins, docker
---

在写测试代码时，我们会 mock 各种外部服务（比如测转账，显然不能真的调用银行转账接口），但不会 mock 基础设施，比如 MySQL、Redis、[Elasticsearch](https://www.elastic.co/cn/cloud/)。

而且跑测试用的 MySQL 等服务都是一次性的，跑完就清空数据不再需要了，所以买台服务器长期开着是不划算的。最佳实践是：测试时启动多个 Docker 后台服务。

在 CircleCI 中，[启动多个 Docker image 很方便](https://circleci.com/docs/2.0/postgres-config/#example-mysql-project)，但不支持 Dockerfile，导致 [Dockerfile](https://github.com/sinkcup/laravel-demo/blob/6.x/Dockerfile#L6) 和 [config.yml](https://github.com/sinkcup/laravel-demo/blob/6.x/.circleci/config.yml#L17) 重复，违反 DRY。

在 Jenkins 中也可以实现，而且更强大（支持 Dockerfile）。

查看 [Jenkins 官方文档](https://jenkins.io/zh/doc/book/pipeline/docker/#%E8%BF%90%E8%A1%8C-sidecar-%E5%AE%B9%E5%99%A8)，发现 sidecar 嵌套支持2个 Docker，如果更多会导致嵌套太深难以维护（比如 MySQL、Redis 作为服务，debian 跑 tests）；而且用了 [link](https://docs.docker.com/engine/userguide/networking/default_network/dockerlinks/)，已被 Docker 官方淘汰：

> Warning: The --link flag is a legacy feature of Docker. It may eventually be removed. Unless you absolutely need to continue using it, we recommend that you use user-defined networks to facilitate communication between two containers instead of using --link.

按照 Docker 官方推荐，创建一个 network 即可。关键在于等待启动成功，代码如下（[完整代码](https://codes-farm.coding.net/p/laravel-demo/d/laravel-demo/git/blob/6.x-coding/Jenkinsfile)）：

<script src="https://gist.github.com/sinkcup/30288ca2252f9463b79c30306fedc649.js"></script>

已在 [coding.net 持续集成](https://coding.net/products/ci?cps_source=PIevZ6Jr)（免费的 Jenkins 云服务）中运行成功，截图：

![CODING 持续集成](https://user-images.githubusercontent.com/4971414/69701055-fbd9b600-1126-11ea-9028-1330a091150a.png)
