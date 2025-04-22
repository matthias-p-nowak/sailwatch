#!/usr/bin/python3
import math
import subprocess
import sys
import wave
import os

ratios=[
    [2.0,3.0], 
    [3.0,4.0],
    [4.0,5.0],
    [5.0,6.0],
    [1.0,1.0],
    [6.0,5.0],
    [5.0,4.0],
    [4.0,3.0],
    [3.0,2.0],
    ]

audioDataInt=[]
baseFreq = 660.0
phase=0.0

volume=1

def appSound(freq1: float, freq2: float,  duration: int):
    global phase
    """adds data to audioDataInt    """
    print('freq: ',freq1,'->',freq2)
    l=duration*44.1
    hz=2*math.pi/44100
    for i in range(int(l)):
        freq=(i*freq2+(l-i)*freq1)/l
        phase += hz*freq
        a=math.sin(phase)
        audioDataInt.append(int(a*volume+128))
    return phase - 2*math.pi*int(phase/(2*math.pi))


def appSilence(duration):
    l=duration*44.1
    for i in range(int(l)):
        audioDataInt.append(int(128))

def appPhrase(s:int, n:int, duration:int):
    freq1=baseFreq*ratios[s-1][0]/ratios[s-1][1]
    freq2=freq1 *ratios[n-1][0]/ratios[n-1][1]
    appSound(freq1,freq2,duration)


# for i in range(5):
#     appPhrase(2,6,75)
#     appSilence(925)
# # appPhrase(7,5,200)

# for i in range(5):
#     for j in range(2):
#         appPhrase(3,6,75)
#     appSilence(850)

# for i in range(5):
#     for j in range(3):
#         appPhrase(4,6,75)
#     appSilence(775)
# appPhrase(5,5,300)

appPhrase(1,1,10)

audioData=bytes(audioDataInt)
sf='sound.wav'
with wave.open(sf,'wb') as wf:
    wf.setnchannels(1)
    wf.setsampwidth(1)
    wf.setframerate(44100)
    wf.writeframes(audioData)
# subprocess.run(['mpv','--really-quiet',sf])


