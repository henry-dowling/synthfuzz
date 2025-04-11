# ---
# jupyter:
#   jupytext:
#     formats: ipynb,py:percent
#     text_representation:
#       extension: .py
#       format_name: percent
#       format_version: '1.3'
#       jupytext_version: 1.17.0
#   kernelspec:
#     display_name: Python 3 (ipykernel)
#     language: python
#     name: python3
# ---

# %%

# %%
import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import cumulative_trapezoid as cumtrapz
from functools import partial
from joblib import Memory
from tqdm import tqdm
import copy

memory = Memory("./cache_dir", verbose=0)  # Cache directory


# %% [markdown]
#

# %%
# Run this in a notebook cell
import nbformat
notebook = nbformat.read("SynthFuzz2.ipynb", as_version=4)
print("Metadata contents:", notebook.metadata)

# %%
duration = 10
dasr = 44100
time = np.linspace(0,duration, duration*dasr)

hz100 = np.sin(2*np.pi*100*time)
hz200 = np.sin(2*np.pi*200*time)
hz300 = np.sin(2*np.pi*300*time)

wave = 2 * hz100 + 3 * hz200 + 4 * hz300

plt.plot(time[:12000], wave[:12000])
plt.show()

# %%

import numpy as np
from scipy.signal import firwin, lfilter

import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import firwin, lfilter, freqz

print('this is a new edit'
)

print('im debugging')
print('still debugging')
print('just tried manually removing the .py version')

def highpass_filter_30hz(signal, sample_rate=dasr, max_kernel_length=0.0001):
    """
    Applies a high-pass FIR filter with a hard cutoff at 30 Hz.

    Parameters:
        signal (np.ndarray): The input signal array.
        sample_rate (float): The sampling rate in Hz.
        max_kernel_length (float): Maximum kernel length in seconds (default: 0.1s).

    Returns:
        np.ndarray: The filtered signal.
    """
    nyquist = sample_rate / 2
    cutoff_freq = 30  # Hard cutoff at 30 Hz

    # Determine the filter length based on max kernel length, ensuring it's an ODD number
    max_taps = int(max_kernel_length * sample_rate)
    num_taps = max(3, min(101, max_taps))  # Limit taps for efficiency
    if num_taps % 2 == 0:
        num_taps += 1  # Ensure odd number of taps

    # Design the high-pass FIR filter
    taps = firwin(num_taps, cutoff_freq / nyquist, pass_zero=False, window='hamming')
    plt.plot(taps)
    plt.show()

    # Apply the filter with low latency (causal filtering)
    filtered_signal = lfilter(taps, [1.0], signal)

    return filtered_signal


def derivative(array):
    return np.gradient(array)

def integral(array):
    x = np.linspace(0, 1, len(array))  # Define x values
    return np.array(cumtrapz(array, x, initial=0)) * len(array) # Integration

def bad_integral(array):

    cumsum = np.cumsum(array)
    return cumsum - cumsum[0]

@memory.cache
def apply_sliding_window_efficient(arr, window_size, func):
    n = len(arr)
    result = np.empty(n, dtype=np.float64)  # Output array of same length

    # Handle growing windows at the start
    for i in range(min(window_size - 1, n)):  # Up to window_size-1 elements
        result[i] = func(arr[:i+1])  # Compute function on progressively larger windows

    # Use stride_tricks for the main section
    if n >= window_size:
        windows = np.lib.stride_tricks.sliding_window_view(arr, window_size)
        result[window_size - 1:] = np.apply_along_axis(func, 1, windows)

    return result

def rms(audio):
    return np.sqrt(np.mean(audio**2))

def abs_mean(audio):
    return np.mean(np.abs(audio))


# def num_crossovers(audio):
#     return np.sum(np.cast((audio[:-1] * audio[1:]) < 0, np.float32)) + np.sum(np.cast((audio==0), np.float32))






# this is chris's implementation
def square_wave_maker(audio, window):
    
    sign = np.sign(audio)
    root_mean_squared = apply_sliding_window_efficient(audio, window, rms)

    return sign * root_mean_squared

# def fake_triangle_wave_maker(audio, window):
#     root_mean_squared = apply_sliding_window_efficient(audio, window, rms)

#     deriv_audio = derivative(audio)
#     sign = np.sign(deriv_audio)
#     new_audio = integral(sign)
#     new_audio = highpass_filter_30hz(new_audio)
    
#     new_audio_rms = apply_sliding_window_efficient(new_audio, window, rms)
#     scale = (root_mean_squared / (new_audio_rms + 1e-9))
#     scale = np.clip(scale, 0, 10)
#     new_audio = new_audio * scale

#     return new_audio

#
def triangle_wave_maker(audio, window, slew_mode = False):

    deriv_audio = derivative(audio)
    root_mean_squared = apply_sliding_window_efficient(audio, window, rms)
    new_crossovers = []
    total_new_crossovers = 1
    old_crossovers = []
    total_old_crossovers = 1
    new_audio = [0]
    direction = 1
    sign = np.sign(deriv_audio)
    init_slope = apply_sliding_window_efficient(deriv_audio, window, abs_mean)
    mean_slope = apply_sliding_window_efficient(deriv_audio, window, np.mean)

    for i in range(1, len(audio)):
        displacement = audio[i-1] - new_audio[i-1]
        coinciding = direction * deriv_audio[i-1] > 0
        wrong_way = displacement * direction <= 0

        if not slew_mode:
            goahead = (not coinciding) and wrong_way
        else:
            goahead = wrong_way
        if goahead:
            direction *= -1
            old_crossovers.append(1)
            total_old_crossovers += 1
        else:
            old_crossovers.append(0)
        if len(old_crossovers) > window:
            total_old_crossovers -= old_crossovers.pop(0)

        

        if sign[i] != sign[i-1] and sign[i] + sign[i-1] != -1:
            new_crossovers.append(1)
            total_new_crossovers += 1
        else:
            new_crossovers.append(0)
        if len(new_crossovers) > window:
            total_new_crossovers -= new_crossovers.pop(0)

        
        slope = root_mean_squared[i] * 2 * (3**.5) * min(total_old_crossovers, total_new_crossovers) / min(window, i)
        # slope = np.abs(init_slope[i] - (direction * mean_slope))

        if slew_mode:
            slope = slope/5

        
        new_audio.append(new_audio[-1] + (direction * slope))
    
    new_audio = np.array(new_audio)
    new_audio_rms = apply_sliding_window_efficient(new_audio, window, rms)
    scale = (root_mean_squared / (new_audio_rms + 1e-9))
    scale = np.clip(scale, 0, 10)
    new_audio = new_audio * scale
    return new_audio

#doesnt work
def wobbly_wave_maker(audio, window):
    root_mean_squared = apply_sliding_window_efficient(audio, window, rms)
    deriv_audio = derivative(audio)
    double_deriv_audio = derivative(deriv_audio)
    sign = np.sign(double_deriv_audio)
    new_audio = integral(integral(sign))
    new_audio_rms = apply_sliding_window_efficient(new_audio, window, rms)
    scale = (root_mean_squared / (new_audio_rms + 1e-9))
    scale = np.clip(scale, 0, 10)
    new_audio = new_audio * scale

    return new_audio


    # new_crossovers = []
    # total_new_crossovers = 1
    # old_crossovers = []
    # total_old_crossovers = 1
    # new_audio = [0]
    # direction = 1
    # sign = np.sign(deriv_audio)

    # for i in range(1, len(audio)):
    #     displacement = deriv_audio[i-1] - new_audio[i-1]
    #     coinciding = direction * double_deriv_audio[i-1] > 0
    #     wrong_way = displacement * direction <= 0
    #     if (not coinciding) and wrong_way:
    #         direction *= -1
    #         old_crossovers.append(1)
    #         total_old_crossovers += 1
    #     else:
    #         old_crossovers.append(0)
    #     if len(old_crossovers) > window:
    #         total_old_crossovers -= old_crossovers.pop(0)

    #     if sign[i] != sign[i-1] and sign[i] + sign[i-1] != -1:
    #         new_crossovers.append(1)
    #         total_new_crossovers += 1
    #     else:
    #         new_crossovers.append(0)

    #     if len(new_crossovers) > window:
    #         total_new_crossovers -= new_crossovers.pop(0)

        
    #     slope = root_mean_squared[i] * 2 * (3**.5) * min(total_old_crossovers, total_new_crossovers) / min(window, i)

        
    #     new_audio.append(new_audio[-1] + (direction * slope))
    
    # new_audio = np.array(new_audio)
    # new_audio = integral(new_audio)
    # new_audio_rms = apply_sliding_window_efficient(new_audio, window, rms)
    # scale = (root_mean_squared / (new_audio_rms + 1e-9))
    # scale = np.clip(scale, 0, 10)
    # new_audio = new_audio * scale
    # return new_audio


#apply square wave 10x
def iterative_shape_applier(function, audio, iterations, *args, **kwargs):
    total_signal = np.zeros(len(audio))
    for i in range(iterations):
        new_signal = function(audio, *args, **kwargs)
        total_signal += new_signal
        audio = audio - new_signal
    return total_signal


#lets you compose 
def combo_shape_applier(functions, audio, *args, **kwargs):
    total_signal = np.zeros(len(audio))
    for i, function in enumerate(functions):
        new_signal = function(audio, *args, **kwargs)
        total_signal += new_signal
        audio = audio - new_signal
    return total_signal




# %%
#plot first 4 waves generate by iterated shape applier
def plot_stuff(sw1, sw2, sw3, sw4):
    length = 1000
    beg = (duration-1) * dasr
    
    end = length + beg
    halfway_beg = int((beg + end)/2)
    
    # plt.plot(time[dasr:dasr+length], sw1[dasr:dasr+length])
    # plt.plot(time[dasr:dasr+length], wave[dasr:dasr+length])
    
    plt.show()
    
    plt.plot(time[beg:end], wave[beg:end])
    plt.plot(time[beg:end], sw1[beg:end])
    plt.plot(time[halfway_beg:end], wave[halfway_beg:end] - sw1[halfway_beg:end])
    
    
    plt.show()
    
    plt.plot(time[beg:end], wave[beg:end])
    plt.plot(time[beg:end], sw2[beg:end])
    # plt.plot(time[halfway_beg:end], wave[halfway_beg:end] - sw2[halfway_beg:end])
    
    plt.show()
    
    plt.plot(time[beg:end], wave[beg:end])
    plt.plot(time[beg:end], sw3[beg:end])
    # plt.plot(time[halfway_beg:end], wave[halfway_beg:end] - sw3[halfway_beg:end])
    
    plt.show()
    
    
    plt.plot(time[beg:end], wave[beg:end])
    plt.plot(time[beg:end], sw4[beg:end])
    # plt.plot(time[halfway_beg:end], wave[halfway_beg:end] - sw4[halfway_beg:end])
    
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
    
    # plt.plot(time[dasr:dasr+length], sw1[dasr:dasr+length])
    # plt.plot(time[dasr:dasr+length], wave[dasr:dasr+length])
    
    
    # plt.plot(time[beg:end], wave[beg:end])
    plt.plot(time[beg:end], sw1[beg:end])
    plt.show()
    
    plt.plot(time[beg:end], sw2[beg:end])
    plt.show()
    
    plt.plot(time[beg:end], sw3[beg:end])
    plt.show()
    
    plt.plot(time[beg:end], sw4[beg:end])
    plt.show()
    
    
    # plt.plot(time[beg:end], wave[beg:end] - sw1[beg:end])
    # plt.plot(time[beg:end], sw2[beg:end] - sw1[beg:end])
    
    # plt.show()
    
    # plt.plot(time[beg:end], wave[beg:end] - sw2[beg:end])
    # plt.plot(time[beg:end], sw3[beg:end] - sw2[beg:end])
    
    # plt.show()
    
    
    # plt.plot(time[beg:end], wave[beg:end] - sw3[beg:end])
    # plt.plot(time[beg:end], sw4[beg:end] - sw3[beg:end])
    
    # plt.show()
    
    
    # plt.plot(time[beg:end], wave[beg:end] - sw4[beg:end])
    # plt.show()


# %%
window = 10000

sw1 = iterative_shape_applier(square_wave_maker, wave, 1, window)
sw2 = iterative_shape_applier(square_wave_maker, wave, 2, window)
sw3 = iterative_shape_applier(square_wave_maker, wave, 3, window)
sw4 = iterative_shape_applier(square_wave_maker, wave, 4, window)


# %%
plot_stuff(sw1, sw2, sw3, sw4)

# %%
# length = 1000
# beg = (duration-1) * dasr

# end = length + beg
# halfway_beg = int((beg + end)/2)

# # plt.plot(time[dasr:dasr+length], sw1[dasr:dasr+length])
# # plt.plot(time[dasr:dasr+length], wave[dasr:dasr+length])

# plt.show()

# plt.plot(time[beg:end], wave[beg:end])
# plt.plot(time[beg:end], sw1[beg:end])
# plt.plot(time[halfway_beg:end], wave[halfway_beg:end] - sw1[halfway_beg:end])


# plt.show()

# plt.plot(time[beg:end], wave[beg:end])
# plt.plot(time[beg:end], sw2[beg:end])
# # plt.plot(time[halfway_beg:end], wave[halfway_beg:end] - sw2[halfway_beg:end])

# plt.show()

# plt.plot(time[beg:end], wave[beg:end])
# plt.plot(time[beg:end], sw3[beg:end])
# # plt.plot(time[halfway_beg:end], wave[halfway_beg:end] - sw3[halfway_beg:end])

# plt.show()


# plt.plot(time[beg:end], wave[beg:end])
# plt.plot(time[beg:end], sw4[beg:end])
# # plt.plot(time[halfway_beg:end], wave[halfway_beg:end] - sw4[halfway_beg:end])

# plt.show()

# plt.plot(time[beg:end], wave[beg:end])
# plt.plot(time[beg:end], sw1[beg:end])
# plt.plot(time[beg:end], sw2[beg:end])
# plt.plot(time[beg:end], sw3[beg:end])
# plt.plot(time[beg:end], sw4[beg:end])
# plt.show()

# # length = len(time)
# # beg = 0

# # end = length + beg

# # plt.plot(time[dasr:dasr+length], sw1[dasr:dasr+length])
# # plt.plot(time[dasr:dasr+length], wave[dasr:dasr+length])

# plt.show()

# plt.plot(time[beg:end], wave[beg:end])
# plt.plot(time[beg:end], sw1[beg:end])


# plt.show()

# plt.plot(time[beg:end], wave[beg:end] - sw1[beg:end])
# plt.plot(time[beg:end], sw2[beg:end] - sw1[beg:end])

# plt.show()

# plt.plot(time[beg:end], wave[beg:end] - sw2[beg:end])
# plt.plot(time[beg:end], sw3[beg:end] - sw2[beg:end])

# plt.show()


# plt.plot(time[beg:end], wave[beg:end] - sw3[beg:end])
# plt.plot(time[beg:end], sw4[beg:end] - sw3[beg:end])

# plt.show()


# plt.plot(time[beg:end], wave[beg:end] - sw4[beg:end])
# plt.show()


# %%
window = 10000

sw1 = iterative_shape_applier(triangle_wave_maker, wave, 1, window, slew_mode=False)
sw2 = iterative_shape_applier(triangle_wave_maker, wave, 2, window, slew_mode=False)
sw3 = iterative_shape_applier(triangle_wave_maker, wave, 3, window, slew_mode=False)
sw4 = iterative_shape_applier(triangle_wave_maker, wave, 4, window, slew_mode=False)


# sw1 = iterative_shape_applier(fake_triangle_wave_maker, wave, 1, window, )
# sw2 = iterative_shape_applier(fake_triangle_wave_maker, wave, 2, window, )
# sw3 = iterative_shape_applier(fake_triangle_wave_maker, wave, 3, window, )
# sw4 = iterative_shape_applier(fake_triangle_wave_maker, wave, 4, window, )


# %%
plot_stuff(sw1, sw2, sw3, sw4)

# %%

# %%
# print(rms(wave))
# print(rms(sw1))
# print(rms(wave-sw1))
# print(rms(sw2))
# print(rms(wave-sw2))
# print(rms(sw3))
# print(rms(wave-sw3))
# print(rms(sw4))

# %%
window = 10000

sw1 = iterative_shape_applier(wobbly_wave_maker, wave, 1, window)
# sw2 = iterative_shape_applier(wobbly_wave_maker, wave, 2, window)
# sw3 = iterative_shape_applier(wobbly_wave_maker, wave, 3, window)
# sw4 = iterative_shape_applier(wobbly_wave_maker, wave, 4, window)


# %%
length = 500
beg = int(2.5 * dasr)
end = length + beg
halfway_beg = int((beg + end)/2)

plt.show()

plt.plot(time[beg:end], wave[beg:end])
plt.plot(time[beg:end], (sw1[beg:end] - np.mean(sw1[beg:end])) * rms(wave[beg:end])/rms((sw1[beg:end] - np.mean(sw1[beg:end]))))
# plt.plot(time[halfway_beg:end], wave[halfway_beg:end] - sw1[halfway_beg:end])


plt.show()

# # plt.plot(time[beg:end], wave[beg:end])
# plt.plot(time[beg:end], sw2[beg:end])
# # plt.plot(time[halfway_beg:end], wave[halfway_beg:end] - sw2[halfway_beg:end])

# plt.show()

# # plt.plot(time[beg:end], wave[beg:end])
# plt.plot(time[beg:end], sw3[beg:end])
# # plt.plot(time[halfway_beg:end], wave[halfway_beg:end] - sw3[halfway_beg:end])

# plt.show()


# # plt.plot(time[beg:end], wave[beg:end])
# plt.plot(time[beg:end], sw4[beg:end])
# # plt.plot(time[halfway_beg:end], wave[halfway_beg:end] - sw4[halfway_beg:end])

# plt.show()

# plt.plot(time[beg:end], wave[beg:end])
# plt.plot(time[beg:end], sw1[beg:end])
# plt.plot(time[beg:end], sw2[beg:end])
# plt.plot(time[beg:end], sw3[beg:end])
# plt.plot(time[beg:end], sw4[beg:end])
# plt.show()

# %%
def list_maker(options, lengths):
    listss = [[[_] for _ in options]]
    for i in range(lengths - 1):
        new_era = []
        for list_ in listss[-1]:
            for option in options:
                new_era.append(copy.deepcopy(list_) + [option])
        listss.append(new_era)
    big_list = []
    for list_ in listss:
        big_list = big_list + list_
    return big_list


stuff = list_maker([square_wave_maker, triangle_wave_maker], 4)


# %%
for sequence in stuff:
    print(sequence)
    new_audio = combo_shape_applier(sequence, wave, window)
    
    
    length = 1000
    beg = (duration-1) * dasr
    end = length + beg
    halfway_beg = int((beg + end)/2)

# plt.plot(time[dasr:dasr+length], sw1[dasr:dasr+length])
# plt.plot(time[dasr:dasr+length], wave[dasr:dasr+length])
    plt.plot(time[beg:end], new_audio[beg:end])

    plt.show()

    plt.plot(time[beg:end], new_audio[beg:end])
    plt.plot(time[beg:end], wave[beg:end])
    plt.plot(time[halfway_beg:end], wave[halfway_beg:end] - new_audio[halfway_beg:end])

    plt.show()



# %%
# length = 1000
# beg = (1) * dasr

# end = length + beg
# halfway_beg = int((beg + end)/2)

# # plt.plot(time[dasr:dasr+length], sw1[dasr:dasr+length])
# # plt.plot(time[dasr:dasr+length], wave[dasr:dasr+length])

# plt.show()

# plt.plot(time[beg:end], wave[beg:end])
# plt.plot(time[beg:end], sw1[beg:end])
# plt.plot(time[halfway_beg:end], wave[halfway_beg:end] - sw1[halfway_beg:end])


# plt.show()

# plt.plot(time[beg:end], wave[beg:end])
# plt.plot(time[beg:end], sw2[beg:end])
# plt.plot(time[halfway_beg:end], wave[halfway_beg:end] - sw2[halfway_beg:end])

# plt.show()

# plt.plot(time[beg:end], wave[beg:end])
# plt.plot(time[beg:end], sw3[beg:end])
# plt.plot(time[halfway_beg:end], wave[halfway_beg:end] - sw3[halfway_beg:end])

# plt.show()


# plt.plot(time[beg:end], wave[beg:end])
# plt.plot(time[beg:end], sw4[beg:end])
# plt.plot(time[halfway_beg:end], wave[halfway_beg:end] - sw4[halfway_beg:end])

# plt.show()

# plt.plot(time[beg:end], wave[beg:end])
# plt.plot(time[beg:end], sw1[beg:end])
# plt.plot(time[beg:end], sw2[beg:end])
# plt.plot(time[beg:end], sw3[beg:end])
# plt.plot(time[beg:end], sw4[beg:end])
# plt.show()


# %%

# # for i in range(1000):

# #   length = 164000
# #   plt.plot(time, sw1)
# #   plt.show()

# length = 500
# offset = 4 * 1000/length
# linear_offset = 1 * dasr

# # plt.plot(time[int(offset * length):int((offset+1) *length)], sw1[int(offset * length):int((offset+1) *length)])
# # plt.plot(time[int(offset * length):int((offset+1) *length)], wave[int(offset * length):int((offset+1) *length)])
# # # plt.plot(time[dasr:dasr+length], -sw1[dasr:dasr+length] + wave[dasr:dasr+length])

# plt.plot(time[linear_offset:linear_offset+length], sw1[linear_offset:linear_offset+length])
# # plt.plot(time[dasr:dasr+length], wave[dasr:dasr+length])

# plt.show()


# plt.plot(time[linear_offset:linear_offset+length], sw1[linear_offset:linear_offset+length])
# plt.plot(time[linear_offset:linear_offset+length], wave[linear_offset:linear_offset+length])
# plt.plot(time[linear_offset:linear_offset+length], -sw1[linear_offset:linear_offset+length] + wave[linear_offset:linear_offset+length])


# plt.show()

# # plt.plot(time[linear_offset:linear_offset+length], sw2[linear_offset:linear_offset+length])
# # plt.plot(time[linear_offset:linear_offset+length], wave[linear_offset:linear_offset+length])
# # plt.plot(time[linear_offset:linear_offset+length], -sw2[linear_offset:linear_offset+length] + wave[linear_offset:linear_offset+length])


# # plt.show()


# # plt.plot(time[linear_offset:linear_offset+length], sw3[linear_offset:linear_offset+length])
# # plt.plot(time[linear_offset:linear_offset+length], wave[linear_offset:linear_offset+length])
# # plt.plot(time[linear_offset:linear_offset+length], -sw3[linear_offset:linear_offset+length] + wave[linear_offset:linear_offset+length])



# # plt.show()

# # plt.plot(time[linear_offset:linear_offset+length], sw4[linear_offset:linear_offset+length])
# # plt.plot(time[linear_offset:linear_offset+length], wave[linear_offset:linear_offset+length])
# # plt.plot(time[linear_offset:linear_offset+length], -sw4[linear_offset:linear_offset+length] + wave[linear_offset:linear_offset+length])


# # plt.show()



# # plt.plot(time[linear_offset:linear_offset+length], wave[linear_offset:linear_offset+length])
# # plt.plot(time[linear_offset:linear_offset+length], sw1[linear_offset:linear_offset+length])
# # plt.plot(time[linear_offset:linear_offset+length], sw2[linear_offset:linear_offset+length])
# # plt.plot(time[linear_offset:linear_offset+length], sw3[linear_offset:linear_offset+length])
# # plt.plot(time[linear_offset:linear_offset+length], sw4[linear_offset:linear_offset+length])
# # plt.show()



# length = len(time)
# linear_offset = 0

# # # plt.plot(time[int(offset * length):int((offset+1) *length)], sw1[int(offset * length):int((offset+1) *length)])
# # # plt.plot(time[int(offset * length):int((offset+1) *length)], wave[int(offset * length):int((offset+1) *length)])
# # # # plt.plot(time[dasr:dasr+length], -sw1[dasr:dasr+length] + wave[dasr:dasr+length])

# plt.plot(time[linear_offset:linear_offset+length], wave[linear_offset:linear_offset+length])
# # plt.plot(time[dasr:dasr+length], wave[dasr:dasr+length])

# plt.show()


# plt.plot(time[linear_offset:linear_offset+length], sw1[linear_offset:linear_offset+length])
# # # plt.plot(time[dasr:dasr+length], wave[dasr:dasr+length])

# # plt.show()

# # plt.plot(time[linear_offset:linear_offset+length], sw2[linear_offset:linear_offset+length])
# # # plt.plot(time[dasr:dasr+length], wave[dasr:dasr+length])

# # plt.show()


# # plt.plot(time[linear_offset:linear_offset+length], sw3[linear_offset:linear_offset+length])
# # # plt.plot(time[dasr:dasr+length], wave[dasr:dasr+length])

# # plt.show()


# # plt.plot(time[linear_offset:linear_offset+length], sw4[linear_offset:linear_offset+length])
# # # plt.plot(time[dasr:dasr+length], wave[dasr:dasr+length])

# # plt.show()

# %%

# %%
print(time[linear_offset:linear_offset+length])

# %%
print(linear_offset)
print(linear_offset+length)

# %%
print(len(time))

# %%
