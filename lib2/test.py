from lib2.input_feeder import InputFeeder
from lib2.discretizor import Discretizor
from lib2.derivative import Derivative
from lib2.rms_detector import RmsDetector, OldRmsDetector
from lib2.module_applier import ModuleApplier
from lib2.time_counter import TimeCounter
from lib2.square_wave import SquareWave
from lib2.sample_waves import *

import numpy as np
import matplotlib.pyplot as plt


time_counter = TimeCounter()

wave = sample_wave_1()
input_arrays = {'input': wave}
input_feeder = InputFeeder(input_arrays)

square_wave = SquareWave('input', 'square_wave', 1500)

module_applier = ModuleApplier([time_counter, 
                                input_feeder,
                                square_wave
                                ])




processes = {}
module_applier.ready(processes)
for i in range(len(input_arrays['input'])):
    module_applier.process(processes)



start = dasr * 5
end = int(dasr * 5.02)

print(end-start)

for key in processes:
    if key[0] != '_' and key != 'time':
        print(key)
        plt.plot(processes['time'][start:end], processes[key][start:end])
        plt.show()

