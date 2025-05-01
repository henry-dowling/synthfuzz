import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import cumulative_trapezoid as cumtrapz
from functools import partial
from joblib import Memory
from tqdm import tqdm
import copy
from lib.utils import *

memory = Memory("./cache_dir", verbose=0)  # Cache directory

def old_triangle_wave_maker(audio, window):

    deriv_audio = derivative(audio)
    root_mean_squared = apply_sliding_window_efficient(audio, window, rms)
    mean_pos = apply_sliding_window_efficient(audio, window, mean_positive, zero_fill=True)
    mean_neg = apply_sliding_window_efficient(audio, window, mean_negative, zero_fill=True)

    # init_slope = apply_sliding_window_efficient(deriv_audio, window, abs_mean)
    # mean_slope = apply_sliding_window_efficient(deriv_audio, window, np.mean)

    crossovers = []
    total_crossovers = 1

    
    new_audio = [0]
    direction = 1
    sign = np.sign(deriv_audio)

    for i in range(1, len(audio)):
        displacement = audio[i-1] - new_audio[i-1]
        coinciding = direction * deriv_audio[i-1] > 0
        wrong_way = displacement * direction <= 0

        if (not coinciding) and wrong_way:
            direction *= -1
            crossovers.append(1)
            total_crossovers += 1
        else:
            crossovers.append(0)

        if len(crossovers) > window:
            total_crossovers -= crossovers.pop(0)

        # slope = mean_pos[i] if direction == 1 else mean_neg[i]
        slope = root_mean_squared[i] * 2 * (3**.5) * total_crossovers / min(window, i)
        
        new_audio.append(new_audio[-1] + (direction * slope))
    
    new_audio = np.array(new_audio)
    new_audio_rms = apply_sliding_window_efficient(new_audio, window, rms)
    scale = (root_mean_squared / (new_audio_rms + 1e-9))
    scale = np.clip(scale, 0, 10)
    new_audio = new_audio * scale
    return new_audio




def triangle_wave_maker(audio, window):

    deriv_audio = derivative(audio)
    root_mean_squared = apply_sliding_window_efficient(audio, window, rms)

    crossovers = []
    total_crossovers = 1

    
    new_audio = [0]
    direction = 1
    sign = np.sign(deriv_audio)

    for i in tqdm(range(1, len(audio))):
        coinciding = direction * deriv_audio[i-1] > 0

        if not coinciding:
            crossovers.append(1)
            total_crossovers += 1
        else:
            crossovers.append(0)

        if len(crossovers) > window:
            total_crossovers -= crossovers.pop(0)

        direction = np.sign(deriv_audio[i-1])

        slope = root_mean_squared[i] * 2 * (3**.5) * total_crossovers / min(window, i)

        new_audio.append(new_audio[-1] + (direction * slope))

    new_audio = highpass_dc_block(new_audio)
    new_audio = np.array(new_audio)
    new_audio_rms = apply_sliding_window_efficient(new_audio, window, rms)
    scale = (root_mean_squared / (new_audio_rms + 1e-9))
    scale = np.clip(scale, 0, 10)
    new_audio = new_audio * scale
    return new_audio

