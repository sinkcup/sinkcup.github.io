---
layout: post
title:  "视频解码：Android/iOS对H.265/VP9的支持"
date:   2016-11-03 20:43 +0800
categories: Laravel, WeChat, Socialite
---

以前压片玩，用的x264和AAC，到射手网找翻译的比较好的srt/ssa字幕，矫正时间线，转成UTF-16，封装成mkv，分享很方便。后来HTML5 video出现了，又去折腾MP4/WebM/Ogg，播放很方便，但没有字幕。今天一查，才发现有了\<track\>元素可以做字幕，射手网也关闭了，真是时光飞逝。H.265和VP9出现了，又可以折腾了。

## 背景知识：

 * .mp4/.mov/.webm/.ogg/.mkv 是文件后缀名，Windows系统需要这个，Linux和macOS不太需要。
 * MP4/WebM/Ogg/mkv 是容器，里面含有视频轨道和音频轨道，甚至mkv还可以包含字幕和章节索引。每个轨道都是一个单独的文件，最后打包变成一个文件，所以还可以解包变回多个文件。
 * 容器里的视频和音频是单独制作的，可以使用多种编码。MP4里的视频常用的是H.264编码，现在有了新一代的H.265编码；MP4里的音频常用的是AAC-LC、HE-AAC等编码。WebM里的视频以前是VP8编码，现在有了新一代的VP9编码，音频是从Vorbis进化到了Opus。就算是同一种编码，也有不同厂商在做，比如H.264的编码器有开源的x264、苹果的Quicktime、Nero Digital等等。编码需要耗费CPU和显卡的性能和时间，而解码轻松多了，如果显卡可以“硬解”，那么CPU占用率很低，否则就是“软解”，会占用很多CPU，在插电设备（比如电脑）上可行（有的同学为了追求画质而故意软解），而在手机上要综合考虑，因为会耗电发热。在图片编码领域，已经发生了类似的问题：新一代图片编码只有Google在做，推出了WebP，Android支持，CPU占用率低，而iOS不支持，iPhone4的CPU占用率略高，但性能随着摩尔定律提升，目前已经不是问题了。参考：[《WebP 探寻之路- 腾讯ISUX - 社交用户体验设计》](https://isux.tencent.com/introduction-of-webp.html)。

### 为什么有这么多编码和容器？如果只有一个，就不用选了，多简单。

因为市场是开放的，竞争带来进步，商业上一家独大可能会影响创新和消费者利益，请看滴滴和Uber合并之后发生的事……目前看来，MP4和WebM会持续竞争下去。

## 音频视频解码技术的发展

视频音频编码以前是3个阵营：

 * MP4（H.264 + HE-AAC）
 * WebM（VP8 + Vorbis）
 * Ogg（Theora + Vorbis）

现在新一代是2家：

 * MP4（H.265 + xHE-AAC）
 * WebM（VP9 + Opus）

新一代的技术进步很大，相同画质时，H.265比H.264小50%，VP9也比VP8小了50%，节约了空间和流量。如图（H.265又称为HEVC，H.264又称为AVC。图片来自[中关村在线](http://tv.zol.com.cn/485/4853491_all.html)）：

![相同画质时，H.265比H.264小50%，节约流量](https://user-images.githubusercontent.com/4971414/63648942-cc06c500-c769-11e9-8c4e-169e1fad6a41.png)

![五代音频编解码：mp3、AAC、HE-AAC、AAC-ELD、xHE-AAC](https://user-images.githubusercontent.com/4971414/63648949-e6d93980-c769-11e9-8774-4518592dbdef.png)

![xHE-AAC是MPEG AAC家族系列编解码器中的最新成员](https://user-images.githubusercontent.com/4971414/63648978-49cad080-c76a-11e9-9d54-fe464447766a.png)

## 技术选型思路

新技术优势巨大，在电脑上可以很快的用上，因为开发软件/Web网站可以方便的集成库/插件，节约了带宽，让网站打开快一点，用户体验更好，但不用的话也问题不大，主要是节约厂商的服务器带宽费用，很有意义（淘宝把图片切换成自适应webp很多年了，而国内别的网站几乎没有跟进的……）；喜欢下载视频的话，可以节约硬盘空间。

在手机上，大部分用户都很需要这种新技术，因为流量很宝贵总是不够用，而且蜂窝网络环境不稳定（比如地铁时常在地下、商场内），体积小加载速度快会让用户体验更好（在蜂窝网络很差时，只有微信能收到消息，而别的APP私信聊天都失败……）。

作为开发者，选型时要考虑多方面：

### 按耗电量选型

 * 插电设备（电脑、家用Pad、广告屏）：毫不犹豫的使用最新技术，只要CPU不满载，能流畅播放即可，不用考虑费电问题。
 * 移动设备（手机、外勤Pad【比如招商银行信用卡外勤OA】）：在最新技术省流量 和 费电 之间进行评估。集成解码库，观察CPU占用率和帧数，如果卡顿，则说明目前还不能使用。

### 按软件形态选型

 * 电脑软件和PC Web：只使用最新技术，如不支持，则集成库/插件。
 * Mobile Web：同时使用最新技术和老技术，同一视频提供多个编码，浏览器会自动降级。注意：APP一般都需要分享，所以都会有Mobile Web。
 * APP：因为可以集成库，所以优先使用新技术，结合其他策略进行选型。

### 按产品策略选型

 * 大视频APP（不可下载）：一般不允许用户保存视频到系统相册（版权问题），可缓存到APP的私有数据，可分享播放页面（Web）给他人，而不会直接传大文件给他人。所以优先使用最新技术。
 * 大视频APP（可下载）：如果允许用户保存视频到系统相册，则要按照各个操作系统版本提供不同的格式，比如Android 4.4及以上才可以播放VP9。由于大文件直接分享较困难，所以可假设用户下载是为了自己看，不用考虑VP9视频发送给iOS的好友如何播放。
 * 小视频APP（可下载）：看产品策略，如果是像表情包一样，希望用户广泛传播，则需要保存小视频到系统相册，然后微信聊天时直接发给他人，则要考虑Android和iOS都能播放的格式。

常用电脑和Android的同学已经习惯了浏览器里看到的任何东西都可以保存，比如图片/PDF/压缩包，而iOS不是这样，几乎什么都不能下载……所以需要注意的坑是：iOS浏览器或APP能否保存视频到系统相册？请看下面的调研。

## Android 和 iOS 对音频视频的支持情况

### 测试环境

 * Android 6.0.1（锤子手机M1L）
  * 系统相册
  * Chrome浏览器（AppleWebKit/537.36 Chrome/54.0.2840.68）
  * 微信 6.3.28 内置浏览器——扫一扫和朋友圈内嵌打开网页使用的浏览器（AppleWebKit/537.36 Chrome/37.0.0.0）

 * iOS 10.1.1（iPhone 7 Plus）
  * 系统相册
  * 系统自带Safari浏览器（AppleWebKit/602.2.14）
  * 微信 6.3.29 内置浏览器（AppleWebKit/602.2.14）

### 测试结果

软件\\功能 | 保存图片到系统相册 | 保存视频到系统相册
--------------|--------------|-------------
Android Chrome | 支持 | 支持
Android 微信浏览器 | 支持，还能“发送给朋友” | 支持，弹出安装QQ浏览器，跳转到QQ浏览器里下载
Android 微信聊天 | 支持 | 支持，长按可“保存视频”
iOS Safari | 支持 | 不支持
iOS 微信浏览器 | 支持，还能“发送给朋友” | 不支持
iOS 微信聊天 | 支持 | 不支持，长按可“转发”和“收藏”
iOS 微云/有道云 | 支持 | **支持**

![iOS 微云里可以下载视频到系统相册](https://user-images.githubusercontent.com/4971414/63649159-cc548f80-c76c-11e9-8d74-be48b7addf67.jpg)

![iOS 系统相册里看到了下载的视频](https://user-images.githubusercontent.com/4971414/63649170-ea21f480-c76c-11e9-8749-374c323de37e.jpg)

![iOS 系统相册可播放视频](https://user-images.githubusercontent.com/4971414/63649176-04f46900-c76d-11e9-9f92-e7175cdd3fcb.jpg)

软件\\\\功能 | 发送本地视频给朋友
--------------|-----------------------------
Android 微信聊天 | 支持，只能发送原始视频，对方是iOS的话，有的编码可以播放，有的无法播放但可以显示一个画面预览
iOS 微信聊天 | 支持，提示进行了自动压缩，发送给Android好友，对方可以播放

![Android微信可以发送各种编码的视频](https://user-images.githubusercontent.com/4971414/63649202-556bc680-c76d-11e9-8511-14dceb6bcf3c.jpg)

![从微云里下载的2.09M的视频被微信压缩为1.39M](https://user-images.githubusercontent.com/4971414/63649217-8ea43680-c76d-11e9-9fac-72047820d4b9.jpg)

![Android微信收到了iOS发来的视频](https://user-images.githubusercontent.com/4971414/63649236-c612e300-c76d-11e9-9fce-62ece741355b.jpg)

![Android微信可内嵌播放iOS发来的视频，注意顶部通知栏和右下角微信的“更多”按钮](https://user-images.githubusercontent.com/4971414/63649122-36b90000-c76c-11e9-87d6-80ab1c95b10a.jpg)

软件\\\\功能 | 视频播放情况
--------------|-----------------------------
Android 微信聊天 | 收到的视频会全屏内嵌播放（无论来自Android还是iOS，无论编码）。自己发出的视频，会弹出选择播放器。
iOS 微信聊天 | 点击播放会直接全屏，检测编码，如果微信支持则自动内嵌播放，如果不支持，则一直停在0秒的预览画面。

![Android微信自己发出的视频，会弹出选择播放器](https://user-images.githubusercontent.com/4971414/63649255-f5c1eb00-c76d-11e9-9972-921765e48509.jpg)

![iOS微信收到Android发来的各种视频，都有一张图片预览](https://user-images.githubusercontent.com/4971414/63649315-ae882a00-c76e-11e9-931c-163fa48abbbf.jpg)

![iOS微信不能播放VP9视频，所以停在0秒预览画面](https://user-images.githubusercontent.com/4971414/63649143-96afa680-c76c-11e9-907a-2ac29a87ca00.jpg)

软件\\功能 | 发送本地视频到朋友圈
--------------|-----------------------------
Android 微信朋友圈 | 不支持，只支持“图片”和微信私有的“小视频”
iOS 微信聊天 | 不支持，同上

小结：非常庆幸的是iOS可以保存视频到系统相册，但由于Safari/微信不支持保存视频，只能通过APP实现。所以如果产品上希望用户保存，则APP里开发这个功能即可，当用户看到别人分享的页面里的视频有意思，想下载时，需要告诉TA只能通过APP下载。

Android用户看到别人分享的页面里的视频有意思，可以直接下载，然后在微信聊天时发出去，对方可能是iOS，所以视频一定要按照Android微信和iOS微信都能播放的编码来制作。**这对“小视频APP”的视频技术选型产生了巨大的影响。**

iOS用户微信聊天时收到有意思的视频无法保存，只能收藏和转发，而Android用户可以保存，这可能将导致两个系统的用户爱好的视频不一样，Android用户更便于传播表情包性质的搞笑小视频。

### Android 和 iOS 对音频视频解码的支持情况

软件\\视频解码 | [H.265](http://video.h265files.com/embed-h265-video.php) | [H.264](http://justinwhitney.com/HTML5Example/) | [VP9](http://base-n.de/webm/VP9%20Sample.html) | [VP8](http://base-n.de/webm/VP9%20Sample.html) | [Theora](http://justinwhitney.com/HTML5Example/)
-------------------|----------|--------|-------|-------|----------
Android Chrome | 不 | 支持 | 支持 | 支持 | 不
Android 微信浏览器 | 不 | 支持 | 支持 | 支持 | **支持**
Android 微信聊天 | **支持** | 支持 | 支持 | 支持 | 不
Android 系统相册 | 支持 | 支持 | 支持 | 支持 | 不
Android（应与相册一致） | 5.0+ | 3.0+ | 4.4+ | 4.3+ | 不
iOS Safari | 不 | 支持 | 不 | 不 | 不
iOS 微信浏览器 | 不 | 支持 | 不 | 不 | 不
iOS 微信聊天 | 不 | 支持 | 不 | 不 | 不
iOS Facetime编码解码 | iPhone 6+ |  |  |  |
iOS 系统相册 | 不 | 支持 | 不 | 不 | 不
iOS 微云播放器 | **支持** | 支持 | 支持 | 支持 | 不

软件\\音频解码 | xHE-AAC| [HE-AAC](https://www2.iis.fraunhofer.de/AAC/multichannel.html) | AAC-LC | MP3 | Opus | Vorbis |
-------------------|----------|--------|-------|-------|----------
Android Chrome | todo | 支持 | 支持 | 支持 | 支持 | 支持
Android 微信浏览器 | todo | 支持 | 支持 | 支持 | **不** | 支持
Android | todo | 支持 | 支持 | 支持 | 不 | 不
iOS Safari | todo | 支持 | 支持 | 支持 | 不 | 不
iOS 微信浏览器 | todo | 支持 | 支持 | 支持 | 不 | 不
iOS | todo | 4+ | 支持 | 支持 | 不 | 不

可以看到H.264 + AAC最通用，浏览器和系统相册都能播放。iOS微信自动压缩后的视频，在Android和iOS的微信和系统相册里都可以播放，那必然是H.264 + AAC了。下载 [MPEG-4-mp42--AVC-Main-L3-avc1--AAC-LC-40.mp4](http://oeqi22aiw.bkt.clouddn.com/MPEG-4-mp42--AVC-Main-L3-avc1--AAC-LC-40.mp4)，用 [mediainfo](https://mediaarea.net/) 分析一下就知：

```
$ mediainfo Videos/MPEG-4-mp42--AVC-Main-L3-avc1--AAC-LC-40.mp4
General
Complete name                            : Videos/MPEG-4-mp42--AVC-Main-L3-avc1--AAC-LC-40.mp4
Format                                   : MPEG-4
Format profile                           : Base Media / Version 2
Codec ID                                 : mp42 (mp41/mp42/isom)
File size                                : 1.39 MiB
Duration                                 : 14s 850ms
Overall bit rate mode                    : Variable
Overall bit rate                         : 785 Kbps
Encoded date                             : UTC 2016-11-04 04:29:35
Tagged date                              : UTC 2016-11-04 04:29:35

Video
ID                                       : 2
Format                                   : AVC
Format/Info                              : Advanced Video Codec
Format profile                           : Main@L3
Format settings, CABAC                   : Yes
Format settings, ReFrames                : 2 frames
Format settings, GOP                     : M=1, N=15
Codec ID                                 : avc1
Codec ID/Info                            : Advanced Video Coding
Duration                                 : 14s 850ms
Bit rate                                 : 716 Kbps
Width                                    : 480 pixels
Height                                   : 480 pixels
Display aspect ratio                     : 1.000
Frame rate mode                          : Variable
Frame rate                               : 18.047 fps
Minimum frame rate                       : 6.667 fps
Maximum frame rate                       : 20.000 fps
Color space                              : YUV
Chroma subsampling                       : 4:2:0
Bit depth                                : 8 bits
Scan type                                : Progressive
Bits/(Pixel*Frame)                       : 0.172
Stream size                              : 1.27 MiB (91%)
Title                                    : Core Media Video
Encoded date                             : UTC 2016-11-04 04:29:35
Tagged date                              : UTC 2016-11-04 04:29:35
Color range                              : Limited
Color primaries                          : BT.601 NTSC
Transfer characteristics                 : BT.709
Matrix coefficients                      : BT.601

Audio
ID                                       : 1
Format                                   : AAC
Format/Info                              : Advanced Audio Codec
Format profile                           : LC
Codec ID                                 : 40
Duration                                 : 14s 790ms
Source duration                          : 14s 838ms
Bit rate mode                            : Variable
Bit rate                                 : 64.2 Kbps
Maximum bit rate                         : 76.1 Kbps
Channel(s)                               : 2 channels
Channel(s)_Original                      : 1 channel
Channel positions                        : Front: C
Sampling rate                            : 44.1 KHz
Frame rate                               : 43.066 fps (1024 spf)
Compression mode                         : Lossy
Stream size                              : 116 KiB (8%)
Source stream size                       : 116 KiB (8%)
Title                                    : Core Media Audio
Encoded date                             : UTC 2016-11-04 04:29:35
Tagged date                              : UTC 2016-11-04 04:29:35
```

但有些H.264 + AAC的视频在Android和iOS的浏览器和系统相册都能播放，在Android微信里可以发出去，对方无论是Android还是iOS都无法播放，比如 [MPEG-4-JVT-avc1--AVC-Main-L3.1-avc1--HE-AAC-40--ChID-BLITS-EBU.mp4](http://oeqi22aiw.bkt.clouddn.com/MPEG-4-JVT-avc1--AVC-Main-L3.1-avc1--HE-AAC-40--ChID-BLITS-EBU.mp4)，用 mediainfo 分析结果如下：

```
$ mediainfo Videos/MPEG-4-JVT-avc1--AVC-Main-L3.1-avc1--HE-AAC-40--ChID-BLITS-EBU.mp4
General
Complete name                            : Videos/MPEG-4-JVT-avc1--AVC-Main-L3.1-avc1--HE-AAC-40--ChID-BLITS-EBU.mp4
Format                                   : MPEG-4
Format profile                           : JVT
Codec ID                                 : avc1 (isom/avc1)
Overall bit rate mode                    : Variable
Overall bit rate                         : 189 Kbps

Video
ID                                       : 1
Format                                   : AVC
Format/Info                              : Advanced Video Codec
Format profile                           : Main@L3.1
Format settings, CABAC                   : Yes
Format settings, ReFrames                : 4 frames
Codec ID                                 : avc1
Codec ID/Info                            : Advanced Video Coding

Audio
ID                                       : 2
Format                                   : AAC
Format/Info                              : Advanced Audio Codec
Format profile                           : HE-AAC / LC
Codec ID                                 : 40
Bit rate mode                            : Variable
Bit rate                                 : 160 Kbps
Channel(s)                               : 2 channels
Channel(s)_Original                      : 6 channels
Channel positions                        : Front: L C R, Side: L R, LFE
```

对比如下：

软件\\功能 | 微信聊天能播放的视频 | 微信聊天不能播放的视频
--------------|--------------------------------|---------------------------------
General Format | MPEG-4 | MPEG-4
General Format profile | Base Media / Version 2 | JVT
General Codec ID | mp42 | avc1
Video Format | AVC | AVC
Video Format profile | Main@L3 | Main@L3.1
Video Codec ID | avc1 | avc1
Audio Format | AAC | AAC
Audio Format profile | LC | HE-AAC / LC
Audio Codec ID | 40 | 40

不同的地方太多，需要逐个排除。难道是微信聊天不支持HE-AAC？那把音频删除试试：[no-audio.mp4](http://oeqi22aiw.bkt.clouddn.com/no-audio.mp4)。

```
$ ffmpeg -i Videos/MPEG-4-JVT-avc1--AVC-Main-L3.1-avc1--HE-AAC-40--ChID-BLITS-EBU.mp4 -vcodec copy -an no-audio.mp4
$ mediainfo no-audio.mp4
General
Complete name                            : no-audio.mp4
Format                                   : MPEG-4
Format profile                           : Base Media
Codec ID                                 : isom (isom/iso2/avc1/mp41)
File size                                : 157 KiB

Video
ID                                       : 1
Format                                   : AVC
Format/Info                              : Advanced Video Codec
Format profile                           : Main@L3.1
Format settings, CABAC                   : Yes
Format settings, ReFrames                : 4 frames
Codec ID                                 : avc1
```

测试结果：iOS微信聊天可以播放了，但 General Codec ID 也变了，所以无法断定是哪个问题。那再做个 isom + HE-AAC 的视频试试：[isom.mp4](http://oeqi22aiw.bkt.clouddn.com/isom.mp4)。

```
ffmpeg -i Videos/MPEG-4-JVT-avc1--AVC-Main-L3.1-avc1--HE-AAC-40--ChID-BLITS-EBU.mp4 -vcodec copy -acodec copy isom.mp4
```

测试结果：iOS微信聊天无法播放。再做个 isom + AAC 的视频试试：[aac.mp4](http://oeqi22aiw.bkt.clouddn.com/aac.mp4)。

```
ffmpeg -i Videos/MPEG-4-JVT-avc1--AVC-Main-L3.1-avc1--HE-AAC-40--ChID-BLITS-EBU.mp4 -vcodec copy -acodec aac -strict -2 aac.mp4
```

测试结果：Android和iOS的微信聊天都可以播放。

## 技术选型结论

微信聊天时播放视频不支持HE-AAC音频，只支持AAC-LC。所以“小视频APP（可下载）”的技术选型也就确定了：只能用 H.264 + AAC-LC。

AAC-LC 和 HE-AAC 的使用场景，请参考 [Apple文档](https://developer.apple.com/library/content/technotes/tn2236/_index.html)：

 * HE-AAC v2 for lower bitrates between 16 - 40 kb/s.
 * HE-AAC v1 for bitrates between 32 - 80 kb/s.
 * AAC-LC for bitrates higher than 80 kb/s.

## 测试素材

 * [H.265 下载](https://x265.com/hevc-video-files/)
 * [H.265](http://video.h265files.com/embed-h265-video.php)
 * [H.264、Theora 和 VP8](http://justinwhitney.com/HTML5Example/)
 * [H.264、Theora 和 VP8](http://www.quirksmode.org/html5/tests/video.html)
 * [VP9 和 VP8](http://base-n.de/webm/VP9%20Sample.html)
 * [HE-AAC v2](http://storage.googleapis.com/chcunningham-chrome-shared/534301/aac_test.html)
 * [HE-AAC in MP4](https://www2.iis.fraunhofer.de/AAC/multichannel.html)

## 参考资料

 * xHE-AAC和H.265將成為下一代的主流編解碼技術 [read01.com](https://read01.com/mz7jgd.html)
 * iTunes 9.2 and iOS 4 include full decoding of HE-AAC v2 parametric stereo streams. [en.wikipedia.org](https://en.wikipedia.org/wiki/High-Efficiency_Advanced_Audio_Coding)
 * Android Supported Media Formats [android.com](https://developer.android.com/guide/appendix/media-formats.html)
 * 再見，AVC；你好，HEVC——VCB-Studio關於全面轉型HEVC的決定 [vcb-s.com](http://vcb-s.com/archives/2947)
 * 手机游戏音频压缩 [gad.qq.com](http://gad.qq.com/article/detail/7160092)
 * xHE-AAC是HE-AAC v2的升级版本，是MPEG AAC家族系列编解码器中的最新成员，适用于数字广播和低比特率流媒体应用。 [fraunhofer.de](http://www.iis.fraunhofer.de/zh/ff/amm/prod/digirundfunk/digirundf/xheaac.html)
 * iPhone 6支持H.265 将强化蜂窝FaceTime [feng.com](http://www.feng.com/iPhone/news/2014-09-14/iPhone_6_will_strengthen_cellular_FaceTime_supports_H.265_595048.shtml)
 * BBC實測：H.265的確比H.264節省了50%的碼率 [read01.com](https://read01.com/yO8D44.html)
 * WebP 探寻之路- 腾讯ISUX - 社交用户体验设计 [isux.tencent.com](https://isux.tencent.com/introduction-of-webp.html)
 * AAC规格（LC，HE，HEv2）及性能对比 [blog.csdn.net](http://blog.csdn.net/leixiaohua1020/article/details/11971419)
 * AAC \(Main only, **not** AAC-LC, AAC-SSR, HE-AAC\) [chromium.org](https://www.chromium.org/audio-video)
 * Supported Media for Google Cast [developers.google.com](https://developers.google.com/cast/docs/media)
