---
layout: post
title:  "Bug: Google Translation API missing zh-CN"
date:   2018-03-11 22:30:00 +0800
categories: bug, google, gcloud
---
Google Translation API "Discovering Supported Languages" contains "zh" but missing "zh-CN".

But "Detecting Languages" mostly return "zh-CN", if we search it in this list above, find nothing, it will crash.

[Docs](https://cloud.google.com/translate/docs/languages) say:

> Simplified Chinese may be specified either by zh-CN or zh.

![image](https://user-images.githubusercontent.com/4971414/37254648-828f97e4-257b-11e8-9381-df4043e08faa.png)

## Steps to reproduce

```
curl -H "Authorization: Bearer "$(gcloud auth print-access-token) \
    "https://translation.googleapis.com/language/translate/v2/languages"

curl -X POST \
     -H "Authorization: Bearer "$(gcloud auth print-access-token) \
     -H "Content-Type: application/json; charset=utf-8" \
     --data "{
  'q': '你好世界',
}" "https://translation.googleapis.com/language/translate/v2/detect"
```

## Solution

We need hack this bug until Google fix it.

PHP:

<script src="https://gist.github.com/sinkcup/94afd1917656fc420299fa102c8d4959.js"></script>

## References

- [Discovering Supported Languages](https://cloud.google.com/translate/docs/discovering-supported-languages)
- [Detecting Languages](https://cloud.google.com/translate/docs/detecting-language)
