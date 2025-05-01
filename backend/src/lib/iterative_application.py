import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import cumulative_trapezoid as cumtrapz
from functools import partial
from joblib import Memory
from tqdm import tqdm
import copy
from lib.utils import *


memory = Memory("./cache_dir", verbose=0)  # Cache directory


def iterative_shape_applier(function, audio, iterations, *args, **kwargs):
    total_signal = np.zeros(len(audio))
    for i in range(iterations):
        new_signal = function(audio, *args, **kwargs)
        total_signal += new_signal
        audio = audio - new_signal
    return total_signal


def combo_shape_applier(functions, audio, *args, **kwargs):
    total_signal = np.zeros(len(audio))
    for i, function in enumerate(functions):
        new_signal = function(audio, *args, **kwargs)
        total_signal += new_signal
        audio = audio - new_signal
    return total_signal


