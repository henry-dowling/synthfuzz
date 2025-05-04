import numpy as np
import matplotlib
matplotlib.use('Agg')  # Set the backend before importing pyplot
import matplotlib.pyplot as plt
from lib.square import square_wave_maker
from lib.triangle import triangle_wave_maker
from lib.iterative_application import iterative_shape_applier, combo_shape_applier
import io

def main(input_signal, sample_rate=44100, window_size=10000, plot_length=None, plot_offset=0, transformations=None):
    print('running main!')
    print('input signal is', input_signal)
    
    """
    Test different wave transformations on an input signal.
    
    Parameters:
        input_signal (np.ndarray): Input audio signal
        sample_rate (int): Sampling rate of the signal (default: 44100)
        window_size (int): Window size for transformations (default: 10000)
        plot_length (int, optional): Number of samples to plot. If None, plots entire signal
        plot_offset (int): Offset in samples for where to start plotting (default: 0)
        transformations (list): List of transformation configurations, where each config is a dict with:
            - 'type': 'iterative' or 'combo'
            - 'function': function to apply (for iterative type)
            - 'functions': list of functions (for combo type)
            - 'iterations': number of iterations (for iterative type)
    
    Returns:
        tuple: (time array, list of transformed signals, full_plot_bytes, zoomed_plot_bytes)
    """
    if transformations is None:
        transformations = [
            {
                'type': 'iterative',
                'function': square_wave_maker,
                'iterations': 4
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

    # Function to create plots
    def create_plots(start_idx, end_idx, figsize=(15, 12)):
        fig = plt.figure(figsize=figsize)
        
        # Plot original signal
        plt.subplot(211)
        plt.title('Original vs Transformed')
        plt.plot(time[start_idx:end_idx], input_signal[start_idx:end_idx], label='Original', alpha=0.7)
        
        # Plot all transformations
        for i, signal in enumerate(transformed_signals):
            plt.plot(time[start_idx:end_idx], signal[start_idx:end_idx], 
                    label=f'Transform {i+1}', alpha=0.7)
        
        plt.legend()
        plt.grid(True)
        plt.margins(x=0)
        
        # Plot residuals
        plt.subplot(212)
        plt.title('Residuals')
        for i, signal in enumerate(transformed_signals):
            residual = input_signal - signal
            plt.plot(time[start_idx:end_idx], residual[start_idx:end_idx], 
                    label=f'Residual {i+1}', alpha=0.7)
        
        plt.legend()
        plt.grid(True)
        plt.margins(x=0)
        plt.tight_layout(pad=3.0)
        
        # Save plot to bytes buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=300, bbox_inches='tight')
        buf.seek(0)
        plot_bytes = buf.getvalue()
        plt.close(fig)
        
        return plot_bytes

    # Create full plot
    if plot_length is None:
        plot_length = len(input_signal)
    end_idx = min(plot_offset + plot_length, len(input_signal))
    full_plot_bytes = create_plots(plot_offset, end_idx)

    # Create zoomed plot (25ms window at middle of signal)
    samples_per_ms = sample_rate // 1000
    zoom_window_ms = 50  # Changed from 100ms to 25ms
    zoom_samples = samples_per_ms * zoom_window_ms
    mid_point = len(input_signal) // 2
    zoom_start = mid_point - (zoom_samples // 2)
    zoom_end = mid_point + (zoom_samples // 2)
    zoomed_plot_bytes = create_plots(zoom_start, zoom_end)
    
    return time, transformed_signals, full_plot_bytes, zoomed_plot_bytes