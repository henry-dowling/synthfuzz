from lib2.wave_shaper import WaveShaper
import numpy as np

class Exponent(WaveShaper):
    def __init__(self, input_name, output_name, exponent):
        super().__init__(input_name, output_name, lambda x: x ** exponent)

