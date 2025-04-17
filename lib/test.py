import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import cumulative_trapezoid as cumtrapz
from functools import partial
from joblib import Memory
from tqdm import tqdm
import copy
from lib.utils import *
from lib.square import square_wave_maker
from lib.triangle import triangle_wave_maker
from lib.iterative_application import iterative_shape_applier, combo_shape_applier


memory = Memory("./cache_dir", verbose=0)  # Cache directory


duration = 10
dasr = 44100
time = np.linspace(0,duration, duration*dasr)

hz100 = np.sin(2*np.pi*100*time)
hz200 = np.sin(2*np.pi*200*time)
hz300 = np.sin(2*np.pi*300*time)

wave = 2 * hz100 + 3 * hz200 + 4 * hz300

# plt.plot(time[:12000], wave[:12000])
# plt.show()
##COMMENT 

def plot_stuff(sw1, sw2, sw3, sw4):
    length = 1000
    beg = (duration-1) * dasr
    
    end = length + beg
    halfway_beg = int((beg + end)/2)
    
    plt.show()
    
    plt.plot(time[0:length], wave[0:length])
    plt.plot(time[0:length], sw1[0:length])
    
    
    plt.show()
    
    plt.plot(time[beg:end], wave[beg:end])
    plt.plot(time[beg:end], sw1[beg:end])
    plt.plot(time[halfway_beg:end], wave[halfway_beg:end] - sw1[halfway_beg:end])
    
    
    plt.show()
    
    plt.plot(time[beg:end], wave[beg:end])
    plt.plot(time[beg:end], sw2[beg:end])
    
    plt.show()
    
    plt.plot(time[beg:end], wave[beg:end])
    plt.plot(time[beg:end], sw3[beg:end])
    
    plt.show()
    
    
    plt.plot(time[beg:end], wave[beg:end])
    plt.plot(time[beg:end], sw4[beg:end])
    
    plt.show()
    
    plt.plot(time[beg:end], wave[beg:end])
    plt.plot(time[beg:end], sw1[beg:end])
    plt.plot(time[beg:end], sw2[beg:end])
    plt.plot(time[beg:end], sw3[beg:end])
    plt.plot(time[beg:end], sw4[beg:end])
    plt.show()
    
    length = len(time)
    beg = 0
    
    end = length + beg
    
    plt.plot(time[beg:end], sw1[beg:end])
    plt.plot(time[beg:end], wave[beg:end])
    plt.show()
    
    plt.plot(time[beg:end], sw2[beg:end])
    plt.show()
    
    plt.plot(time[beg:end], sw3[beg:end])
    plt.show()
    
    plt.plot(time[beg:end], sw4[beg:end])
    plt.show()
    
def small_plot_stuff(sw1):
    length = 1000
    beg = (duration-1) * dasr
    
    end = length + beg
    halfway_beg = int((beg + end)/2)
    
    plt.show()
    
    plt.plot(time[0:length], wave[0:length])
    plt.plot(time[0:length], sw1[0:length])
    
    
    plt.show()
    
    plt.plot(time[beg:end], wave[beg:end])
    plt.plot(time[beg:end], sw1[beg:end])
    plt.plot(time[halfway_beg:end], wave[halfway_beg:end] - sw1[halfway_beg:end])
    
    
    length = len(time)
    beg = 0
    
    end = length + beg
    
    plt.plot(time[beg:end], sw1[beg:end])
    plt.plot(time[beg:end], wave[beg:end])
    plt.show()
    
 
window = 10000

sw1 = iterative_shape_applier(square_wave_maker, wave, 1, window)
sw2 = iterative_shape_applier(square_wave_maker, wave, 2, window)
sw3 = iterative_shape_applier(square_wave_maker, wave, 3, window)
sw4 = iterative_shape_applier(square_wave_maker, wave, 4, window)

plot_stuff(sw1, sw2, sw3, sw4)
