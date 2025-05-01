from lib2.module_applier import ModuleApplier
from lib2.discretizor import Discretizor
from lib2.rms_detector import RmsDetector as RmsDetector
from lib2.multiplier import Multiplier


class SquareWave(ModuleApplier):
    def __init__(self, input_name, output_name, window, bias=0):

        intermediate_name = '_' + self.__class__.__name__ + '_' + input_name + '_' + str(window) + '_'
        
        modules = [
            Discretizor(input_name, intermediate_name + 'discretizor', bias=bias),
            RmsDetector(input_name, intermediate_name + 'rms', window),
            Multiplier([intermediate_name + 'rms',  intermediate_name + 'discretizor'], output_name)
            ]
        
        super().__init__(modules)



