import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import cumulative_trapezoid as cumtrapz
from functools import partial
from joblib import Memory
from tqdm import tqdm
import copy
from lib.utils import *

memory = Memory("./cache_dir", verbose=0)  # Cache directory


def square_wave_maker(audio, window):
    
    sign = np.sign(audio)
    root_mean_squared = apply_sliding_window_efficient(audio, window, rms)

    return sign * root_mean_squared


