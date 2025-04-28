from lib2.derivative import Derivative
from lib2.discretizor import Discretizor
from lib2.wave_shaper import WaveShaper
from lib2.running_sum import RunningSum
from lib2.multiplier import Multiplier
from lib2.module_applier import ModuleApplier

class FlatCounter(ModuleApplier):
    def __init__(self, input_name, output_name, window):

        intermediate_name = '_' + self.__class__.__name__ + '_' + input_name + '_' + str(window) + '_'

        modules = [
            Derivative(input_name, intermediate_name + 'derivative'),
            Discretizor(intermediate_name + 'derivative', intermediate_name + 'discretized'),
            Derivative(intermediate_name + 'discretized', intermediate_name + 'derivative_2'),
            WaveShaper(intermediate_name + 'derivative_2', intermediate_name + 'wave_shaper', lambda x: (x != 0).astype(int)),
            WaveShaper(intermediate_name + 'discretized', intermediate_name + 'wave_shaper_2', lambda x: (x != 0).astype(int)),
            Multiplier([intermediate_name + 'wave_shaper', intermediate_name + 'wave_shaper_2'], intermediate_name + 'multiplier'),
            RunningSum(intermediate_name + 'multiplier', output_name, window)
        ]

        super().__init__(modules)



