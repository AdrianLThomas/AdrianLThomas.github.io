---
title: Running curl in BusyBox
date: "2021-12-24"
description: curl doesn't exist in BusyBox by default, but there is a way to do it - and it's simpler than you may think!
---

curl doesn't exist in BusyBox by default, but there is a way to do it - and it's simpler than you may think!

BusyBox is an executable that typically gets used in low powered devices like routers, it gives you basic commands like `cd` or `ls` but if you want to `curl` something from the internet (e.g. HTTP POST): you can't. There's no package manager, and it's very awkward to do manually with netcat / raw TCP.

You do have wget, so you can HTTP GET... a pre-built curl binary!

First, find out what CPU architecture you're on:
```bash
$ arch
x86_64
```

Here we're running 64bit x86, but you may be running ARM or some other architecture. Head to [curl.se](https://curl.se/download.html) and pick the *binary* for your flavour. It'll take you to the GitHub page to download it: copy the URL for your binary.

Then simply wget the url! don't forget to make it executable
```bash
wget https://github.com/moparisthebest/static-curl/releases/download/v7.80.0/curl-amd64
chmod +x ./curl-amd64
./curl-amd64 -X POST --insecure https://ptsv2.com/t/57y8r-1640280329/post
```

Note: As CA certificates aren't installed either, I needed to pass the `--insecure` flag. Ideally you should [make them available](https://stackoverflow.com/questions/45388934/how-do-i-make-an-https-call-in-a-busybox-docker-container-running-go) to BusyBox.