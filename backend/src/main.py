import numpy as np
import matplotlib.pyplot as plt
from lib.square import square_wave_maker
from lib.triangle import triangle_wave_maker
from lib.iterative_application import iterative_shape_applier, combo_shape_applier

def main(input_signal, sample_rate=44100, window_size=10000, plot_length=1000, plot_offset=0, transformations=None):
    """
    Test different wave transformations on an input signal.
    
    Parameters:
        input_signal (np.ndarray): Input audio signal
        sample_rate (int): Sampling rate of the signal (default: 44100)
        window_size (int): Window size for transformations (default: 10000)
        plot_length (int): Number of samples to plot (default: 1000)
        plot_offset (int): Offset in samples for where to start plotting (default: 0)
        transformations (list): List of transformation configurations, where each config is a dict with:
            - 'type': 'iterative' or 'combo'
            - 'functions': list of functions to apply
            - 'iterations': number of iterations (for iterative type)
    
    Returns:
        tuple: (time array, list of transformed signals)
    """
    if transformations is None:
        transformations = [
            {
                'type': 'iterative',
                'function': square_wave_maker,
                'iterations': 1
            }
        ]
    
    # Create time array for plotting
    duration = len(input_signal) / sample_rate
    time = np.linspace(0, duration, len(input_signal))
    
    # Store all transformed signals
    transformed_signals = []
    
    # Apply each transformation
    for transform in transformations:
        if transform['type'] == 'iterative':
            signal = iterative_shape_applier(
                transform['function'],
                input_signal,
                transform['iterations'],
                window_size
            )
        elif transform['type'] == 'combo':
            signal = combo_shape_applier(
                transform['functions'],
                input_signal,
                window_size
            )
        transformed_signals.append(signal)
    
    # Plot results
    end_idx = min(plot_offset + plot_length, len(input_signal))
    plt.figure(figsize=(15, 5))
    
    # Plot original signal
    plt.subplot(121)
    plt.title('Original vs Transformed')
    plt.plot(time[plot_offset:end_idx], input_signal[plot_offset:end_idx], label='Original', alpha=0.7)
    
    # Plot all transformations
    for i, signal in enumerate(transformed_signals):
        plt.plot(time[plot_offset:end_idx], signal[plot_offset:end_idx], 
                label=f'Transform {i+1}', alpha=0.7)
    
    plt.legend()
    plt.grid(True)
    
    # Plot residuals
    plt.subplot(122)
    plt.title('Residuals')
    for i, signal in enumerate(transformed_signals):
        residual = input_signal - signal
        plt.plot(time[plot_offset:end_idx], residual[plot_offset:end_idx], 
                label=f'Residual {i+1}', alpha=0.7)
    
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.show()
    
    return time, transformed_signals