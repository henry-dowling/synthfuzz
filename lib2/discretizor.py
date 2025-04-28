import numpy as np
from lib2.wave_shaper import WaveShaper


class Discretizor(WaveShaper):
    def __init__(self, input_name, output_name, bias=0):
        function = lambda x: np.sign(x + bias)
        super().__init__(input_name, output_name, function)



        