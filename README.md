# How to collaborate

1. Install Jupytext with pip install jupytext
2. Add *.ipynb to your local .gitignore file
3. When you've pulled the latest version of the .py notebook from Github, open the file as a notebook in Jupyer (right-click in Jupyter Lab)
4. Once you're done editing the notebook, the updated SynthFuzz2.py file should be automatically updated to match the edits made to the .ipynb file. 
5. To add the notebook to version control, push the .ipynb file.
6. Do not edit the .py notebook, instead think of it as a transpiled version of the .ipynb that's more friendly for us to send to version control.
7. Before you commit, run sync command ```jupytext --sync SynthFuzz2.ipynb```


#How to build

# How to use the wave transformation tester

The `main()` function in `SynthFuzz2.py` provides a flexible way to test different wave transformations on audio signals.

## Basic Usage

```python
from SynthFuzz2 import main
import numpy as np

# Create a test signal
duration = 10
sample_rate = 44100
time = np.linspace(0, duration, duration * sample_rate)
test_signal = np.sin(2*np.pi*100*time)  # Simple sine wave at 100 Hz

# Define transformations to apply
transformations = [
    {
        'type': 'iterative',
        'function': square_wave_maker,
        'iterations': 1
    },
    {
        'type': 'combo',
        'functions': [square_wave_maker, triangle_wave_maker]
    }
]

# Run the transformations
main(test_signal, transformations=transformations)
```

## Parameters

- `input_signal`: Your input audio signal (numpy array)
- `sample_rate`: Sampling rate in Hz (default: 44100)
- `window_size`: Window size for transformations (default: 10000)
- `plot_length`: Number of samples to plot (default: 1000)
- `plot_offset`: Sample offset for plotting (default: 0)
- `transformations`: List of transformation configurations

## Transformation Types

### Iterative Transformation
Applies a single wave maker function multiple times:
```python
{
    'type': 'iterative',
    'function': square_wave_maker,  # or triangle_wave_maker
    'iterations': 1  # number of times to apply
}
```

### Combo Transformation
Applies multiple wave maker functions in sequence:
```python
{
    'type': 'combo',
    'functions': [square_wave_maker, triangle_wave_maker]
}
```

## Output
The function produces two plots:
1. Original signal vs. transformed signals
2. Residuals (difference between original and transformed signals)

It also returns the time array and list of transformed signals for further analysis.