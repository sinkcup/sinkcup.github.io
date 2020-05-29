---
layout: post
title:  "静态网站架构的演进和最佳实践"
date:   2020-05-29 17:26:00 +0800
categories: Arch
---

新冠肺炎期间，[约翰霍普金斯大学开发的疫情地图网站单日 PV 达 10 亿次](https://xw.qq.com/cmsid/20200415A0G9BM00)，查看源代码可以看出它是一个单页应用（single-page application，缩写 SPA），JS 调用后端 API 返回动态数据。

那么，部署一个 10 亿 PV 的静态网站需要购买几台服务器？

答案是：0 台——在云计算时代，静态网站已不再需要服务器，部署到云存储，开启 CDN 即可全球高速访问。

![约翰霍普金斯大学 arcgis 疫情地图](https://user-images.githubusercontent.com/4971414/83229629-e703db00-a1ba-11ea-8a56-60990eed2739.png)

## 静态网站架构发展史

1991 年，万维网诞生，包括 3 项关键技术：统一资源标志符（URI）、HTML、HTTP。

初期的网站架构很简单，手写 HTML 或者用程序生成 HTML，然后通过 FTP/SCP 等方式上传到服务器。

HTML 文件并不需要运算，不消耗性能，一台服务器可以支撑很多个网站，而自行购买一台服务器只部署一个网站，成本高昂。所以网页托管服务（Web hosting service）应运而生，价格低廉甚至免费（通过嵌入广告盈利）。

1993 年，CGI 诞生，Web 服务器收到浏览器请求，执行对应的 CGI 程序，动态输出 HTML，这就是前后端混合的模式。在此之后的很多年里，前后端是一个项目，一起部署到服务器。

1999 年，Ajax 诞生。

2004 年，Gmail 大规模使用符合标准的跨浏览器 Ajax，前后端分离逐渐流行起来。

2006 年，AWS 发布了云存储，宣告了云计算时代的诞生。HTML/CSS/JS 作为简单的小文件，无需特殊对待，部署到云存储上即可，配合 CDN，有如下优点：

- 成本低：云存储/CDN 比服务器便宜很多（比如「[腾讯云 对象存储 COS](https://url.cn/53ljQjJ)」约 0.1 元/GB/月、[腾讯云 CDN 每月赠送 10GB 流量](https://buy.cloud.tencent.com/price/cdn)）；
- 访问快：CDN 能在全国甚至全球快速访问，比服务器更快。

2010 年起，AngularJS、Vue.js 、React 等框架陆续诞生，开发的单页应用（SPA）使用 Ajax 技术实现了彻底的前后端分离，也意味着前后端单独部署。

目前，静态网站有 2 种：

- 无内容的单页应用：VUE/React SPA；
- 有内容的 HTML：手写或「程序生成 HTML」；

**警告**：VUE/React 生成的 HTML 不带内容，难以被搜索引擎收录，不适合作为公司官网、博客。推荐使用 [MkDocs](https://www.mkdocs.org/)、[Hexo](https://hexo.io/zh-cn/)、[VUE Nuxt](https://zh.nuxtjs.org/)、[React Next](https://nextjs.org/)。

## 实战：静态网站自动部署到云存储

通过「持续集成」生成 HTML，并自动部署到「云存储」，变成静态网站。

1. 在「腾讯云 对象存储 COS」中创建一个「公有读私有写」的「存储桶」，并在设置中开启「静态网站」，即可获得分配的二级域名「访问链接」。
![腾讯云存储 COS 创建存储桶](https://user-images.githubusercontent.com/4971414/83237611-c2623000-a1c7-11ea-9ab4-67c8c33587bc.png)
![腾讯云存储 COS 开启静态网站](https://user-images.githubusercontent.com/4971414/83237837-1c62f580-a1c8-11ea-8750-1a50d85a8dab.png)

2. 把项目代码推送到「[CODING 代码仓库](https://coding.net/products/repo?cps_source=PIevZ6Jr)」，在「[CODING 持续集成](https://coding.net/products/ci?cps_source=PIevZ6Jr)」中创建一个构建计划，选择「构建并上传到腾讯云 COS」模板，填入「腾讯云 COS 访问密钥」等信息，根据自己的代码框架修改编译命令。创建后会自动触发构建，等待构建成功，访问[分配的链接](https://devops-host-1257110097.cos.ap-nanjing.myqcloud.com/index.html)即可看到网站。下次推送代码即可自动部署。
![CODING 持续集成 模板列表](https://user-images.githubusercontent.com/4971414/83238886-a8c1e800-a1c9-11ea-82ab-aab4d702f7b7.png)
![CODING 持续集成 模板填写参数](https://user-images.githubusercontent.com/4971414/83239641-d0fe1680-a1ca-11ea-8b4f-cf9b025de135.png)
![CODING 持续集成 构建成功](https://user-images.githubusercontent.com/4971414/83240752-69e16180-a1cc-11ea-9d45-7bfa6a107d7e.png)

4. 如果你的域名已备案，则可在「腾讯云 对象存储」的设置中绑定「自定义加速域名」，会提示开通「内容分发网络 CDN」，小型网站推荐选择「按使用流量计费」（[每月赠送 10GB](https://buy.cloud.tencent.com/price/cdn)，一般用不完），将会获得一个 CNAME。
![腾讯云存储 COS 自定义加速域名](https://user-images.githubusercontent.com/4971414/83241781-e88ace80-a1cd-11ea-9e75-387c368f32b9.png)

5. 在「DNS 解析」中设置 www 和 根域名，确保两者皆可访问，并且二选一进行跳转避免影响 SEO，推荐 2 种方案：
  - 此域名无邮箱：根域名 CNAME 到 CDN，www 显性 URL 跳转到根域名；
  - 此域名有邮箱：www CNAME 到 CDN，根域名显性 URL 跳转到 www；

下图采用 no-www 方案：把 [www.devops.host](http://www.devops.host) 跳转到了 [devops.host](https://devops.host)。
![DNS 解析 no-www](https://user-images.githubusercontent.com/4971414/83242946-c8f4a580-a1cf-11ea-92bd-644c762b0059.png)

6. 在「内容分发网络 CDN」——「域名管理」——某个域名——「高级设置」——「HTTPS 配置」中，申请免费的 HTTPS 证书，并开启「HTTPS回源」、「强制跳转 HTTPS」和「HTTP 2.0」。
![腾讯云 内容分发网络 开启 HTTPS](https://help-assets.codehub.cn/enterprise/20200227181247.png)

7. 开通「[腾讯云 云函数 SCF](https://url.cn/5pbRzdO)」，按照文档「[使用 SCF 自动刷新被 CDN 缓存的 COS 资源](https://cloud.tencent.com/document/product/436/30434)」上传代码。
![腾讯云 SCF 自动刷新 CDN COS](https://help-assets.codehub.cn/enterprise/20200306134243.png)

**提醒**：

- 如果网站面向中国境内用户，需要进行域名备案，然后才能绑定到境内的云存储/CDN。本文以腾讯云为例，其他云计算厂商的流程也类似。
- 如果网站面向中国境外用户，可直接使用境外云存储/CDN 搭建静态网站。

### Jenkinsfile

浏览[完整代码](https://coding-public.coding.net/p/html-cos-demo/d/html-cos-demo/git)。

```groovy
pipeline {
  agent any
  stages {
    stage('检出') {
      steps {
        checkout([$class: 'GitSCM',
        branches: [[name: env.GIT_BUILD_REF]],
        userRemoteConfigs: [[
          url: env.GIT_REPO_URL,
          credentialsId: env.CREDENTIALS_ID
        ]]])
      }
    }
    stage('安装依赖') {
      steps {
        sh 'npm i -g lint-md-cli && pip install mkdocs'
      }
    }
    stage('单元测试') {
      steps {
        sh 'lint-md docs/'
      }
    }
    stage('编译') {
      steps {
        sh 'mkdocs build && mv site build'
      }
    }
    stage('上传到 COS Bucket') {
      steps {
        sh "coscmd config -a ${env.COS_SECRET_ID} -s ${env.COS_SECRET_KEY} -b ${env.COS_BUCKET_NAME} -r ${env.COS_BUCKET_REGION}"
        sh 'coscmd upload -r ./build/ /'
        echo "上传成功，访问 https://${env.COS_BUCKET_NAME}.cos.${env.COS_BUCKET_REGION}.myqcloud.com/index.html 预览效果"
      }
    }
  }
}
```

### 持续集成环境变量

变量名              | 含义             | 参考值
-------------------|------------------|---------
COS_SECRET_ID  | 腾讯云访问密钥 ID  | 3Rerpwya4CEUT3xavlNbdgib4ppWv3I69Hxa
COS_SECRET_KEY | 腾讯云访问密钥 KEY | 9MPySpAWocYYRI7B5Dp5Ww592HXs4u4Q
COS_BUCKET_NAME | 腾讯云对象存储桶   | devops-host-1257110097
COS_BUCKET_REGION | 腾讯云对象存储区域  | ap-nanjing
