from lib2.module_applier import ModuleApplier
from lib2.derivative import Derivative
from lib2.discretizor import Discretizor
from lib2.flat_counter import FlatCounter


class TriangleWave(ModuleApplier):
    def __init__(self, input_name, output_name, window):

        intermediate_name = '_' + self.__class__.__name__ + '_' + input_name + '_' + str(window) + '_'

        modules = [
            Derivative(input_name, intermediate_name + 'derivative'),
            Discretizor(intermediate_name + 'derivative', intermediate_name + 'discretized'),
            FlatCounter(intermediate_name + 'discretized', intermediate_name + 'flat_counter', window),
        ]

        super().__init__(modules)
