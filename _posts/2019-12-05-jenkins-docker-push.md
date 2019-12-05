---
layout: post
title:  "Jenkins 保存 Docker 镜像实现极速构建"
date:   2019-12-05 17:58:00 +0800
categories: Jenkins, docker
---

上一篇文章[《如何在Jenkins中跑多个Docker（MySQL、Redis等）？》](https://sinkcup.github.io/jenkins-docker-background)讲解了用 `Dockerfile` 跑 Jenkins，解决了“CircleCI 的 Dockerfile 和 config.yml 重复，违反 DRY”的问题。

但也面临一个新问题：

- Jenkins 每次跑测试都要先进行 docker build，很慢。

解决办法很简单：把 Jenkins 构建的 Docker 镜像存起来，下次直接拉取。

## 检查 Docker image 是否存在远端镜像服务器

```
$ DOCKER_CLI_EXPERIMENTAL=enabled docker manifest inspect sinkcup/laravel-demo:asdf
no such manifest: docker.io/sinkcup/laravel-demo:asdf
$ echo $?
1
```

## 把 Jenkins 构建的 Docker 镜像存起来

```
sh "docker login -u $DOCKER_USER -p $DOCKER_PASSWORD $DOCKER_SERVER"
md5 = sh(script: "md5sum Dockerfile | awk '{print \$1}'", returnStdout: true).trim()
imageAndTag = "${DOCKER_SERVER}${DOCKER_PATH_PREFIX}laravel-demo:dev-${md5}"
dockerNotExists = sh(script: "DOCKER_CLI_EXPERIMENTAL=enabled docker manifest inspect $imageAndTag > /dev/null", returnStatus: true)
def testImage = null
if (dockerNotExists) {
    testImage = docker.build("$imageAndTag", "--build-arg APP_ENV=testing --build-arg SPEED=$SPEED ./")
    sh "docker push $imageAndTag"
} else {
    testImage = docker.image(imageAndTag)
}
testImage.inside("--net bridge1 -v \"${codePath}:/var/www/laravel\" -e 'APP_ENV=testing'") {
    stage('prepare') {
        echo 'preparing...'
        sh 'composer install'
        echo 'prepare done.'
    }
    stage('test') {
        echo 'testing...
        sh './lint.sh'
        sh './phpunit.sh'
        junit 'junit.xml'
        echo 'test done.'
    }
}
```
完整代码请看：[GitHub](https://github.com/sinkcup/laravel-demo/blob/6.x/Jenkinsfile)、[CODING](https://codes-farm.coding.net/p/laravel-demo/d/laravel-demo/git/blob/6.x/Jenkinsfile)

当然需要先获得 Docker 镜像仓库的密码，有这些服务商：

- 国外的 [hub.docker.com](https://hub.docker.com/r/sinkcup/laravel-demo)：1个免费私有额度，7美元/月含5个私有额度，建议搭配国外的持续集成使用；
- 国内的 [coding.net - 制品库](https://coding.net/products/artifact?cps_source=PIevZ6Jr)：免费，搭配 [CODING CI（Jenkins 云服务）](https://coding.net/products/ci?cps_source=PIevZ6Jr) 使用；
- 国内的 [腾讯云 - 镜像仓库](https://cloud.tencent.com/act/cps/redirect?redirect=10058&cps_key=16b83d1aa2e322d67b11fa1daaa4ab6b)：免费；
- 国内的 [阿里云-容器镜像服务](https://www.aliyun.com/product/eci)：默认版免费，企业版公测价格未定；

![docker hub 价格](https://user-images.githubusercontent.com/4971414/70224077-979e9e00-1787-11ea-8a4f-a88ef5f958d6.png)

经过试验，[同一个项目](https://github.com/sinkcup/laravel-demo)在不同平台的持续集成速度如下：

- Jenkins 第一次运行：7分钟
- Jenkins 第二次运行：1分钟24秒
- CircleCI：2分钟-4分47秒

![CODING CI（Jenkins 云服务）](https://user-images.githubusercontent.com/4971414/70224596-81451200-1788-11ea-8898-a76b53dc3777.png)
![CircleCI](https://user-images.githubusercontent.com/4971414/70224609-886c2000-1788-11ea-9366-4dad4c562b29.png)
