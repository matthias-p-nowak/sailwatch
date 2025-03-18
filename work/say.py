#!/usr/bin/python3
import math
import subprocess
import sys
import wave
import os

ratios={
    0: [6.0,5.0],
    1: [5.0,6.0],
    2: [5.0,4.0],
    3: [4.0,5.0],
    4: [4.0,3.0],
    5: [3.0,4.0],
    6: [3.0,2.0],
    7: [2.0,3.0],
}

alphabet='abcdefghijklmnopqrstuvwxyz0123456789:/_?.,;^'

audioDataInt=[]
baseFreq=660.0

def appSound(freq1, freq2,  duration, phase):
    print('freq: ',freq1,'->',freq2)
    l=duration*44.1
    hz=2*math.pi/44100
    for i in range(int(l)):
        freq=(i*freq2+(l-i)*freq1)/l
        phase+= hz*freq
        a=math.sin(phase)
        audioDataInt.append(int(a*100+128))
    return phase - 2*math.pi*int(phase/(2*math.pi))

def appSilence(duration):
    l=duration*44.1
    for i in range(int(l)):
        audioDataInt.append(int(128))

def addLetter(l,duration,phase):
    i = alphabet.find(l)
    r1 = int(i % 8)
    r2 = int(i / 8)
    freq1= baseFreq * ratios[r1][0] / ratios[r1][1]
    freq2= freq1 * ratios[r2][0] / ratios[r2][1]
    return appSound(freq1,freq2,duration,phase)

duration=100
for arg in sys.argv[1:]:
    phase=0
    for l in arg:
        phase=addLetter(l,duration,phase)
    appSilence(duration)

audioData=bytes(audioDataInt)
ht=os.path.expanduser('~/tmp')
if not os.path.exists(ht):
   os.makedirs(ht)
sf=ht+'/sound2.wav'
with wave.open(sf,'wb') as wf:
    wf.setnchannels(1)
    wf.setsampwidth(1)
    wf.setframerate(44100)
    wf.writeframes(audioData)
subprocess.run(['mpv','--really-quiet',sf])
