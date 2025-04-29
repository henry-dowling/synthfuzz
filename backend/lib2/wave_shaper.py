from lib2.fixed_window_generic import FixedWindowGeneric
import numpy as np

class WaveShaper(FixedWindowGeneric):
    def __init__(self, input_name, output_name, function):
        super().__init__(input_name, output_name, function, 1)
