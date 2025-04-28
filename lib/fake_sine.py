import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import cumulative_trapezoid as cumtrapz
from functools import partial
from joblib import Memory
from tqdm import tqdm
import copy
from lib.utils import *


memory = Memory("./cache_dir", verbose=0)  # Cache directory


#NOTHING GOOD YET LOL

def fake_sine_wave_maker(audio, window):
    deriv_audio = derivative(audio)
    double_deriv_audio = derivative(deriv_audio)

    