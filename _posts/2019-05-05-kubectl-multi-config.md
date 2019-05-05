---
layout: post
title:  "kubectl 多集群本地管理方案（含阿里云）"
date:   2019-05-05 20:38:00 +0800
categories: k8s, kubectl, docker, aliyun
---

kubectl 管理一个 k8s 集群很方便，本机（Linux/macOS）创建一个 `$HOME/.kube/config`，执行命令即可，比如：

```
kubectl get deployments
kubectl edit deployments/hello-world
```

而实际情况往往是多个集群，比如常见的 dev 和 prod：

* dev：config 发给所有工程师，都可以上去折腾学习积累技术，免得“一人请假，无人会上线”。
* prod：config 发给开发组长等少数几位高级工程师，负责上线。

那怎么切换环境呢？手动是这样：

```
cd ~/.kube
cp config.dev config
kubectl get pods

cp config.prod config
kubectl get hpa
```

写成 shell 是这样：

```
#!/bin/bash

cp ~/.kube/config.dev ~/.kube/config
```

然后每次切环境需要两步：

```
~/kube_config_dev.sh
kubectl get pods
```

能不能优化成1步？

有办法！用 Docker，比如更新勤快的 [dtzar/helm-kubectl](https://hub.docker.com/r/dtzar/helm-kubectl/)。

```
docker run -v "$HOME/.kube/config.dev:/root/.kube/config" \
    -it dtzar/helm-kubectl \
    env LANG=C.UTF-8 \
    bash
```

## 阿里云

如果是阿里云的话，官方有 [kubectl 镜像](https://cr.console.aliyun.com/images/cn-shanghai/aliacs-app-catalog/kubectl/detail)，版本比较旧，但正适合阿里云的 k8s。

```
docker run -v "$HOME/.kube/config.dev:/root/.kube/config" \
    -it registry.cn-shanghai.aliyuncs.com/aliacs-app-catalog/kubectl:1.1.4 \
    env LANG=C.UTF-8 \
    bash
 
kubectl edit deployments/hello-world
```

报错缺少 vi：

> error: unable to launch the editor "vi"

看来要基于这个镜像再安装 vi，那就需要做个新 Docker 了。正好也可以把 Vim 配置缩进为2个空格。


```
FROM registry.cn-shanghai.aliyuncs.com/aliacs-app-catalog/kubectl:1.1.4

RUN apt-get update \
    && apt-get install -y vim

COPY .vimrc /root/
```

完整代码请看：[github.com/sinkcup/docker-kubectl-vim-for-alibaba-cloud](https://github.com/sinkcup/docker-kubectl-vim-for-alibaba-cloud)

已公开发布到阿里云镜像仓库，登录即可查看：[aliyun.com/.../sinkcup/kubectl-vim](https://cr.console.aliyun.com/images/cn-shanghai/sinkcup/kubectl-vim-for-aliyun/detail)

使用步骤：

```
wget https://raw.githubusercontent.com/sinkcup/docker-kubectl-vim-for-alibaba-cloud/master/kubectl_example.sh
cp kubectl_example.sh kubectl_dev.sh
sed -i 's/example/dev/' kubectl_dev.sh
```

这样切环境只需要1步了：

```
~/kubectl_dev.sh
```
