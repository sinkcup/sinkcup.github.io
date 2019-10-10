---
layout: post
title:  "Go语言框架对比"
date:   2019-10-10 20:27:00 +0800
categories: GitHub, composer
---

参考Go框架流行度排序：[https://github.com/mingrammer/go-web-framework-stars](https://github.com/mingrammer/go-web-framework-stars)

| Name | Stars | Test coverage | 主要作者地区 | Issues | Weight class |
| --- | --- | --- | --- | --- | --- |
| [gin](https://github.com/gin-gonic/gin) | 32k| 98% | [西班牙](https://github.com/manucorporat)、[大陆](https://github.com/thinkerou)、[台湾](https://github.com/appleboy) | 174/1067 | 轻量级 |
| [beego](https://github.com/astaxie/beego) | 22k| 0? | [上海](https://github.com/astaxie)、[北京](https://github.com/JessonChan) | 692/1888| 重量级 |
| [iris](https://github.com/kataras/iris) | 16k| 0? | [希腊](https://github.com/kataras)、[荷兰](https://github.com/hiveminded) | 8/728 | 重量级 |
| [echo](https://github.com/labstack/echo) | 15k| 84% | [美国](https://github.com/vishr) | 29/874| TODO |
| [kit](https://github.com/go-kit/kit) | 15k| 79% | [德国](https://github.com/peterbourgon)、[挪威](https://github.com/basvanbeek)、[美国](https://github.com/briankassouf) | 50/369| TODO |

很久不维护的框架：[revel](https://github.com/revel/revel)

实测：

- gin
  - 缺点：没有MVC、ORM
  - 缺点：文档还在推Govender，而不是官方的gomod
- beego
  - 缺点：按[官方文档](https://beego.me/quickstart)安装bee[失败](https://github.com/beego/bee/issues/591)
  - 缺点：有test，但没有计算，不知道测试覆盖率是多少。
  - 优点：有MVC、ORM
- iris
  - 缺点：有test，但没有计算，不知道测试覆盖率是多少。
