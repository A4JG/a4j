#!/bin/bash

echo "ic2 bus:"
i2cdetect -y 1

# modprobe aml_i2c
modprobe i2c-bcm2708 
modprobe i2c-dev
modprobe bmp085-i2c
modprobe si1132
modprobe si702x

echo bmp085 0x77 > /sys/class/i2c-adapter/i2c-1/new_device
echo si1132 0x60 > /sys/class/i2c-adapter/i2c-1/new_device
echo si702x 0x40 > /sys/class/i2c-adapter/i2c-1/new_device

i2cdetect -y 1

gpsd /dev/ttyAMA0
