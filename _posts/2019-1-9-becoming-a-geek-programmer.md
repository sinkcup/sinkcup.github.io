---
layout: post
title:  "极客程序员入门指南"
date:   2019-01-09 11:22:00 +0800
categories: geek, course
---

以下大部分内容希望你大学时已经学会，如果没有，尽快补一补。

## 起个英文名

起一个符合英语国家社会风俗的英文名，而不是“Candy（糖果），Lolly（棒棒糖）或者Sugar（糖）这类名字经常被认为是“弱智女孩”的名字或者“脱衣舞女”的名字”。文档：[《互联网创业最佳实践——域名、邮箱和官网》](https://sinkcup.github.io/startup-best-practice-domain-email-and-landing-page)

用这个英文名去注册GitHub、Gmail（如果你上的去的话）、QQ邮箱，如果被占用，可考虑加上“姓”或“大学的英文后缀（以大学的英文官网为准）”，注意：GitHub 用户名不允许用点号，要用驼峰或连字符，而 Gmail 允许用点号。比如：

- 华东师范大学的李同学，她挑选了英文名 [Larissa](https://www.yingwenming.com/name/larissa)，注册不上，那就加上华师大的英文代号 [ecnu](http://english.ecnu.edu.cn/)，即可注册 github.com/larissa-ecnu 和 larissa.ecnu@gmail.com。
- 深圳大学的马同学，他挑选了英文名 Pony，加上姓，即可注册 github.com/PonyMa 和 PonyMa@gmail.com。

## 语义化

HTML语义化：[https://www.zhihu.com/question/20455165](https://www.zhihu.com/question/20455165)

语义化版本：[http://semver.org/lang/zh-CN/](http://semver.org/lang/zh-CN/)

## 学会用Git

Git 命令：用 Linux/Mac 命令操作，而不是图形界面。

代码仓库用于追踪文本变化，使用基本原则：

- 禁止提交编译/构建后的结果，因为无法对比变化，占地方影响速度。比如 C++ 编译出几百兆的 exe、压缩后的 CSS、JS、HTML。
- 图片尽量不要提交，占地方，而是传到某个地方用链接。用 GitHub 的话，在 issue 里评论贴图，就会得到URL。
- 禁止提交注释掉的代码，用不到的代码应该立即删除。
- 禁止提交安装的依赖，比如 PHP `vendor`、npm `node_modules`。如果需要修改依赖的代码，做 patch 先用，然后贡献到开源项目。
- 禁止提交开源静态代码，应使用公共CDN，比如 [jsDelivr（被墙过）](https://www.jsdelivr.com/)、[Google Hosted Libraries（一直被墙）](https://developers.google.com/speed/libraries/)、[BootCDN（挂过，总体可靠）](https://www.bootcdn.cn/)、[Staticfile](https://www.staticfile.org/)。

## 学会用Github

Github Flow: [https://www.ruanyifeng.com/blog/2015/12/git-workflow.html](https://www.ruanyifeng.com/blog/2015/12/git-workflow.html)

Closing issues using keywords: [https://help.github.com/articles/closing-issues-via-commit-messages/](https://help.github.com/articles/closing-issues-via-commit-messages/)

GitHub Pages: [https://pages.github.com/](https://pages.github.com/)

## 自动化代码检查（Lint）

TODO

## 自动化测试

TODO

## 自动化部署

TODO

## 实践

在 GitHub 上创建个人博客项目，掌握 Git 命令、英文 commit 的写法、域名的购买和DNS设置、HTTPS配置。

在 GitHub 上创建个人项目，掌握 自动化测试、自动化部署。

参加 GitHub 开源项目，掌握“开源项目开发流程”。

参加 GitHub 公司私有项目，掌握“私有项目开发流程”。

## 暗中观察

`git push`要不要输密码，表明查资料读文档的能力。

`git commit`写的英文是否正确，表明英语四级是不是忘完了。

是否知道把数据库搬到内存中，用来加速测试，表明对电脑的熟练程度。
