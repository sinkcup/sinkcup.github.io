---
layout: post
title:  "Bug: Google Translation API missing zh-CN"
date:   2018-03-11 22:30:00 +0800
categories: bug, google, gcloud
---
Google Translation API has a bug: Discovering Supported Languages contains "zh" but missing "zh-CN".

But "Detecting Languages" result is "zh-CN" not "zh".

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

We need hack it until Google fix it.

PHP:

```
use Google\Cloud\Translate\TranslateClient;

$targetLanguage = 'en'; // Print the names of the languages in which language?

$translate = new TranslateClient();
$result = $translate->localizedLanguages([
    'target' => $targetLanguage,
]);
$langs = [];
foreach ($result as $lang) {
    if ($lang['code'] == 'zh') {
	$langs[] = [
	    'code' => 'zh-CN',
	    'name' => $lang['name'],
	];
    } else {
	$langs[] = $lang;
    }
}
var_dump($langs);
```

## References

- [Discovering Supported Languages](https://cloud.google.com/translate/docs/discovering-supported-languages)
- [Detecting Languages](https://cloud.google.com/translate/docs/detecting-language)
