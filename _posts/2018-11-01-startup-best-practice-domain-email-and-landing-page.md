---
layout: post
title:  "互联网创业最佳实践——域名、邮箱和官网"
date:   2018-11-01 10:24:00 +0800
categories: best-practice, startup
---

## 域名

域名有2种：公司（组织）和项目。比如：

公司名 | 公司域名 | 项目域名 | 邮箱
---------|---------------|-------------|---------------
[深圳市腾讯计算机系统有限公司](https://www.tianyancha.com/company/9519792) | tencent.com | QQ（qq.com）、微信（wechat.com）| hr@tencent.com
[字节跳动有限公司](https://www.qichacha.com/firm_ce211dbdab20dce66a9472847133d1be.html) | bytedance.com | 今日头条（toutiao.com）、抖音（douyin.com） | hr@bytedance.com

最佳实践：买个公司域名开通企业邮箱，而不要用项目域名做邮箱，因为创业公司可能试错多个产品才找到一个可行的方向。公司域名不一定要.com的，长度长一些也不要紧，因为很少有人访问，只是用来做公司介绍（比如招聘介绍里面会写）。

常犯的错误：用第一个项目域名做了邮箱，结果这个项目不火关掉了，做第二个项目还用老邮箱多尴尬！而且还有技术风险：根域名的CNAME和MX冲突。比如Cloudflare、AWS服务器的负载均衡不提供IP，而是提供一个域名（xxx.elb.amazonaws.com），大部分DNS按照规范只能设置为CNAME，如果又有域名邮箱MX记录，就会冲突报错。如果使用AWS Route 53，支持ALIAS记录，才解决了这个问题。但想用Cloudflare时，也要把域名解析转过来，那就不能用AWS Route 53了。

## 买域名

知名的域名经销商有：[甘地Gandi.net](https://www.gandi.net/)、[Google Domains](https://domains.google/)、[阿里云-万网](https://wanwang.aliyun.com/domain/)。

最佳实践：按最短时间购买（1年），节约现金流，因为明年可能就不用这个域名了（比如买到了更好的域名 或者 项目关掉了）。

## 域名邮箱服务商的选型

技术型公司首选Gmail（当然需要网络加速，如果CTO做不到，那也就不是技术公司了，那就别用Gmail了），第二选择是腾讯企业邮箱（以前乱码，现在好了，而且是国内唯一一家支持HTTPS的），不要用网易（不支持HTTPS）。

![8102年，网易企业邮箱还不支持HTTPS](https://user-images.githubusercontent.com/4971414/47829609-4cb39980-ddc3-11e8-840d-22aca75f84fe.png)

参考资料：[《2017年03月27日——腾讯企业邮箱支持自定义域名的HTTPS加密访问》](https://service.exmail.qq.com/cgi-bin/help?subtype=1&id=36&no=1001483)

## 邮箱用全名还是缩写？

应该用全名。千万不要给创始人、早期员工分配特殊的邮箱，比如 x@example.com，这样会让别的员工产生等级压力。而科技公司“不称总”而采用“扁平化管理”，在自由平等的氛围里，思维才能活跃起来，才能创新。

如果预计公司是小而美的，以后也不超过26个人，a-z的邮箱每人一个，也不是个好主意，因为不好辨认，增加了沟通成本。

## 邮箱用英文名还是中文拼音？

邮箱很可能用于对外联络（不只是商务岗位，比如产品技术人员可能会对外留邮箱进行招聘），所以一定要注意专业得体。最佳方案是公司统一分配，使用每个人的真实姓名，中国员工使用身份证姓名的拼音，外籍员工使用护照英文名，这样很得体。注意：“吕秀才”的拼音名为“LYU Xiucai”，“黄略”为“Huang Lue”。参考：[《出入境证件中拼音字母“ü”的转换规则 - 国家移民管理局》](http://www.mps.gov.cn/n2254996/n2255033/c3840435/content.html)

如果公司的业务面向英语国家、外籍员工和海归多，甚至办公用英语交流，则让每个人自由选择，想用英文邮箱的就把自己的英文名提供给公司。但不少人乱起的英文名，一旦用于对外联络，会贻笑大方，影响公司形象（比如顺丰王卫的英文名是Dick）。所以公司需要找英文很好的人来检查大家的英文名，这个办法成本高，不推荐。最佳实践：使用英文取名服务，比如 [最好英文名](https://www.bestenglishname.com/)。参考：

> [@MY英文名-本酷英文名网站](https://weibo.com/bestenglishname2014) 微博 [2017-12-14 19:00](https://weibo.com/6135565664/FzDurs27r)
> 美国《华盛顿邮报》曾发表文章称，中国和东亚其他地方的人取非常规的英文名一直让外国人觉得有趣和好笑。一般来说，最好避免取与食物有关的名字。比如Candy（糖果），Lolly（棒棒糖）或者Sugar（糖）这类名字经常被认为是“弱智女孩”的名字或者“脱衣舞女”的名字。

> [@云财经](https://weibo.com/yunvscom) 微博 [2017-2-24 10:33](https://weibo.com/1680685707/EwZpA0zE2)
> 顺丰上市，老板王卫给员工发红包，金额从1888到15000不等
![Dick寄语：顺丰今天上市了](https://user-images.githubusercontent.com/4971414/47829635-68b73b00-ddc3-11e8-8c20-4e4597c6a544.png)

![维基词典：Dick](https://user-images.githubusercontent.com/4971414/47829649-779ded80-ddc3-11e8-8fbc-cdb3e2c0ce6d.png)

## 中文拼音用户名应该“姓在前”还是“名在前”？

应按照当地规范：姓在前。参考：

- [《中国人名汉语拼音字母拼写规则 - 国家标准 GB/T 28039-2011》](http://www.moe.edu.cn/s78/A19/yxs_left/moe_810/s230/201001/t20100115_75609.html)
- [中国人的英文名应该姓在前吗？ - 知乎](https://www.zhihu.com/question/26071649/answer/366415162)

不过这个标准在有些情况下会歧义，比如“吴兴恩”和“吴新根”的护照拼音名都是“WU XINGEN”，谁也猜不到怎么读。

## 用户名里能不能用下划线和点？

最佳实践：首选全用字母，其次是用“点号”分隔（Gmail允许，比如zhang.san@example.com），千万不要用下划线（Gmail已强制移除了带下划线的用户名）。

## 官网的搭建和上线

如果只是公司介绍，不发布文章，那就是最简单的静态网站。如果有技术人员，建议使用[Github Pages](https://pages.github.com/)，Google里搜“landing page template”，挑一个模板（免费或收费的都有，比如 [startbootstrap.com](https://startbootstrap.com/template-categories/landing-pages/)、[getbootstrap.com](https://themes.getbootstrap.com/)），部署上去即可。如果没有技术人员，则使用可视化建站服务。

如果官网会持续发布一些PR文章，则需要一个CMS，那就选择CMS云服务，而不要买服务器自己搭建。

建站服务商 | 特点 | HTTPS | 价格
----------------|-------|-----------|---------------
[Github Pages](https://pages.github.com/) | 技术范 | 支持 | 免费
[Wordpress.com](https://zh-cn.wordpress.com/) | CMS | 支持 | ￥400/年
[SiteGround.com](https://www.siteground.com/web-hosting.htm) | CMS | 支持 | $3.95/月
[上线了](https://www.sxl.cn/) | 可视化 | 不支持 | ￥500/年
