---
layout: post
title:  "Install Android Command line tools"
date:   2020-05-27 15:03:00 +0800
categories: Android
---

## macOS(via Homebrew)

```shell
sw_vers
# ProductName: Mac OS X
# ProductVersion: 10.15.4
brew tap caskroom/cask
brew cask install homebrew/cask-versions/adoptopenjdk8
export JAVA_HOME=`/usr/libexec/java_home -v 1.8`
brew cask install android-sdk
sdkmanager --list | awk '/Installed/{flag=1; next} /Available/{flag=0} flag'
```

### Error: NoClassDefFoundError

```shell
sdkmanager --list
# Exception in thread "main" java.lang.NoClassDefFoundError: javax/xml/bind/annotation/XmlSchema
```

Fix:

```shell
brew cask install homebrew/cask-versions/adoptopenjdk8
export JAVA_HOME=`/usr/libexec/java_home -v 1.8`
```

## macOS(manual way)

1. download [Android Command line tools](https://developer.android.com/studio#command-tools)

```shell
mkdir -p ~/code/android_sdk/cmdline-tools && cd "$_"
unzip ~/Downloads/commandlinetools-mac-6200805_latest.zip
```

2. set env

```shell
export ANDROID_SDK_ROOT="$HOME/code/android_sdk"
export PATH="$PATH:$ANDROID_SDK_ROOT/tools/bin:$ANDROID_SDK_ROOT/tools/lib:$ANDROID_SDK_ROOT/platform-tools"
```

3. install tools

```shell
./tools/bin/sdkmanager --sdk_root=$ANDROID_SDK_ROOT --install tools
```

4. install Java 1.8

```
brew cask install homebrew/cask-versions/adoptopenjdk8
export JAVA_HOME=`/usr/libexec/java_home -v 1.8`
sdkmanager --list
```

### Warning: Could not create settings

```shell
android_sdk/tools/bin/sdkmanager --list   
# Warning: Could not create settings
# java.lang.IllegalArgumentException
#	at com.android.sdklib.tool.sdkmanager.SdkManagerCliSettings.<init>(SdkManagerCliSettings.java:428)
```

Fix:

```shell
mkdir -p cmdline-tools
mv android_sdk/tools android_sdk/cmdline-tools/
android_sdk/cmdline-tools/tools/bin/sdkmanager --sdk_root=$ANDROID_SDK_ROOT --install tools
ls -l android_sdk/tools/bin/sdkmanager
```

### Warning: Observed package in inconsistent location

```shell
android_sdk/cmdline-tools/tools/bin/sdkmanager --sdk_root=../ --list
# Warning: Observed package id 'tools' in inconsistent location '../cmdline-tools/latest' (Expected '../tools')
```

Fix:

```
android_sdk/cmdline-tools/tools/bin/sdkmanager --sdk_root=$ANDROID_SDK_ROOT --install tools
android_sdk/tools/bin/sdkmanager --list
```
