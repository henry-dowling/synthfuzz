import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import cumulative_trapezoid as cumtrapz
from functools import partial
from joblib import Memory
from tqdm import tqdm
import copy
import librosa
import soundfile as sf
from typing import Tuple, Union
import os

memory = Memory("./cache_dir", verbose=0)  # Cache directory


def derivative(array):
    if len(array) == 1:
        return np.array([0])
    return np.gradient(array)

def integral(array):
    x = np.linspace(0, 1, len(array))  # Define x values
    return np.array(cumtrapz(array, x, initial=0)) * len(array) # Integration

def bad_integral(array):

    cumsum = np.cumsum(array)
    return cumsum - cumsum[0]

def apply_sliding_window_efficient(arr, window_size, func, zero_fill=False):
    n = len(arr)
    result = np.empty(n, dtype=np.float64)  # Output array of same length

    # Handle growing windows at the start
    if zero_fill:
        arr = np.concatenate([np.zeros(window_size - 1), arr])
    else:
        for i in range(min(window_size - 1, n)):  # Up to window_size-1 elements
            result[i] = func(arr[:i+1])  # Compute function on progressively larger windows

    # Use stride_tricks for the main section
    if n >= window_size:
        windows = np.lib.stride_tricks.sliding_window_view(arr, window_size)

        if zero_fill:
            result[:len(result)] = np.apply_along_axis(func, 1, windows)
        else:
            result[window_size - 1:] = np.apply_along_axis(func, 1, windows)

    return result

def rms(audio):
    return np.sqrt(np.mean(audio**2))

def abs_mean(audio):
    return np.mean(np.abs(audio))

def mean_positive(audio):
    mask = (audio > 0).astype( np.float32)
    pos_elements = audio * mask
    return np.sign(np.sum(mask)) * (np.sum(pos_elements)/(np.sum(mask) + 1e-5))
    
def mean_negative(audio):
    mask = (audio < 0).astype( np.float32)
    pos_elements = audio * mask
    return np.sign(np.sum(mask)) * (np.sum(pos_elements)/(np.sum(mask) + 1e-5))



def highpass_dc_block(signal, alpha=0.995):
    y = np.zeros_like(signal)
    prev_y, prev_x = 0, 0
    for i, x in enumerate(signal):
        y[i] = x - prev_x + alpha * prev_y
        prev_x = x
        prev_y = y[i]
    return y

def mean_crossovers(audio):

    deriv_audio = derivative(audio)
    sign_audio = np.sign(deriv_audio)

    crossovers = ((sign_audio[1:] * sign_audio[:-1]) < 0).astype(np.float32) * (sign_audio[1:] != 0).astype(np.float32)

    return np.mean(crossovers)

def load_audio_file(file_path: str, target_sr: int = 44100) -> Tuple[np.ndarray, int]:
    """
    Load an audio file and convert it to a numpy array.
    
    Args:
        file_path (str): Path to the audio file
        target_sr (int): Target sampling rate (default: 44100)
        
    Returns:
        Tuple[np.ndarray, int]: (audio signal, sample rate)
        
    Supported formats:
        - WAV
        - MP3
        - OGG
        - FLAC
    """
    try:
        # Try loading with librosa first (supports more formats)
        signal, sr = librosa.load(file_path, sr=target_sr, mono=True)
        print('we take the try path in librosa')
        return signal, sr
    except Exception as e:
        # Fallback to soundfile for WAV files
        try:
            signal, sr = sf.read(file_path)
            if len(signal.shape) > 1:  # If stereo, convert to mono
                signal = np.mean(signal, axis=1)
            if sr != target_sr:
                signal = librosa.resample(signal, orig_sr=sr, target_sr=target_sr)
                sr = target_sr
            return signal, sr
        except Exception as e:
            raise ValueError(f"Could not load audio file: {str(e)}")

def save_audio_file(signal: np.ndarray, sample_rate: int, file_path: str) -> None:
    """
    Save a numpy array as an audio file.
    
    Args:
        signal (np.ndarray): Audio signal to save
        sample_rate (int): Sample rate of the signal
        file_path (str): Path where to save the file
        
    Supported formats:
        - WAV
        - FLAC
        - OGG
    """
    try:
        # Normalize signal to prevent clipping
        signal = librosa.util.normalize(signal)
        # Use soundfile to save the audio
        sf.write(file_path, signal, sample_rate)
    except Exception as e:
        raise ValueError(f"Could not save audio file: {str(e)}")


