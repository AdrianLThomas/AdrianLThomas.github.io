---
title: Reading my water meter in Home Assistant
date: "2025-03-17"
description: TODO based on content
---

In the UK the water bills [are going up, again](https://www.bbc.co.uk/news/articles/c5yd9qzx79go), and I thought it would be a nice to keep a closer eye on the household usage by integrating the water meter in to [Home Assistant](https://www.home-assistant.io/).

# What I wanted to do
I wanted the data in Home Assistant so that I could keep an eye on the usage, perhaps set up alerts and generally try to reduce how much water was being used (and identify when/where it gets used the most). 

## Setting up HA (Home Assistant)
I already had Home Assistant setup, but it's simple enough to get started if you're already self hosting things [with Docker](https://www.home-assistant.io/installation/linux#docker-compose) (e.g. homelab, raspberry pi or buy an off the shelf device). There's quite a [few other options available too](https://www.home-assistant.io/installation/).

# The Solution
The solution for you could well differ to mine, there's a ton of [options documented for HA](https://www.home-assistant.io/docs/energy/water/), but in my case I had an Irton EverBlu Cyble water meter that AFAIK is fairly common in the UK. So the first step would be identify what you have so that you can work out how to read it.

I came [across this post on the HA forum](https://community.home-assistant.io/t/reading-itron-everblu-cyble-rf-enhanced-water-meter-with-esp32-esp8266-and-433mhz-cc1101-home-assistant-mqtt-autodiscovery/833180) describing a solution for reading my meter using a 433MHz transceiver (the same way the water company reads the meter from the van outside your house).

TODO picture.

I already had some spare ESP8266's around, so just needed a CC1101 transceiver which only cost a few quid off Amazon.

## ESP.. what?
The ESP8266 is... TODO

cost... cheap...

## CC1.. what?
The CC1101...... TODO

also cheap.

## MQTT.. what?

# Problem 1: How to compile the code?
platformio... TODO

# Problem 2: Compiler errors
Code wasn't compiling TODO

# Problem 3: Finding the right frequency
TODO 

# Problem 4: Setting up MQTT
... setting up container... simple... but creating password etc too. TODO
setup mqtt (out of scope), but I run this image here: https://hub.docker.com/_/eclipse-mosquitto

# Problem 5: Device not being auto discovered in HA
see PR. was bad json schema. TODO

# Result
screenshot of HA. TODO
picture of setup? maybe put this at the start? wires etc

code can be found here: TODO
my pr: https://github.com/genestealer/everblu-meters-esp8266-improved/pull/3

# Side Notes
I did this with WSL on Windows, and to get the serial adapter to work from Windows > WSL I needed to install and use this tool:
found this post to get usb port mapped to wsl: https://askubuntu.com/questions/1461302/i-need-help-connecting-serial-ports-to-ubuntu-in-wsl

out of scope for the blog post maybe...

# Next
3d print a case to tidy it up and tidy up the solution. TODO

My plan for this is: get some examples on thingiverse, copy paste them in to tinkercard, stick it all together, hide it away in the pantry with the water meter.
