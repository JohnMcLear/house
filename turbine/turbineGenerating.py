#!/usr/bin/env python3
# read abelectronics Delta Sigma board inputs and return exit code 0 if the turbine is generating IE if 5v exists on channel 0
# # Requries Python 2.7
# Requires SMBus 
# I2C API depends on I2C support in the kernel

# Version 1.0  - 29/04/2013
# Version History:
# 1.0 - Initial Release

#
# Usage: changechannel(address, hexvalue) to change to new channel on adc chips
# Usage: getadcreading(address, hexvalue) to return value in volts from selected channel.
#
# address = adc_address1 or adc_address2 - Hex address of I2C chips as configured by board header pins.

from smbus import SMBus
import re, sys

adc_address1 = 0x68
adc_address2 = 0x69

# create byte array and fill with initial values to define size
adcreading = bytearray()

adcreading.append(0x00)
adcreading.append(0x00)
adcreading.append(0x00)
adcreading.append(0x00)

varDivisior = 64 # from pdf sheet on adc addresses and config

# detect i2C port number and assign to i2c_bus
for line in open('/proc/cpuinfo').readlines():
    m = re.match('(.*?)\s*:\s*(.*)', line)
    if m:
        (name, value) = (m.group(1), m.group(2))
        if name == "Revision":
            if value [-4:] in ('0002', '0003'):
                i2c_bus = 0
            else:
                i2c_bus = 1
            break
               

bus = SMBus(i2c_bus)
 
def changechannel(address, adcConfig):
	tmp= bus.write_byte(address, adcConfig)

def getadcreading(address, adcConfig):
	adcreading = bus.read_i2c_block_data(address,adcConfig)
	h = adcreading[0]
	m = adcreading[1]
	l = adcreading[2]
	s = adcreading[3]
	# wait for new data
	while (s & 128):
		adcreading = bus.read_i2c_block_data(address,adcConfig)
		h = adcreading[0]
		m = adcreading[1]
		l = adcreading[2]
		s = adcreading[3]
	
	# shift bits to product result
	t = ((h & 0b00000001) << 16) | (m << 8) | l
	# check if positive or negative number and invert if needed
	if (h > 128):
		t = ~(0x020000 - t)
	return (t/varDivisior)

	
while True:
	changechannel(adc_address1, 0x9C)
	output = getadcreading(adc_address1,0x9C);
	if output > 100:
		print("Generating");
		sys.exit(0);
	else:
		print (output);
		print ("Channel 1: %02f" % getadcreading(adc_address1,0x9C))
		sys.exit(1);
