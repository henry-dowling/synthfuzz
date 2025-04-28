from lib2.module_applier import ModuleApplier
from lib2.running_sum import RunningSum
from lib2.functional_window_length import FunctionalWindowLength
from lib2.multiplier import Multiplier
from lib2.exponent import Exponent
import numpy as np

# class Mean(SoundProcessor):
#     def __init__(self, input_name, output_name, window):

#         input_streams = {'input': input_name}
#         output_assignments = {'output': output_name}
#         # Initialize parent class and set initial values
#         super().__init__(input_streams, output_assignments)
#         self.window = window  # Size of sliding window
#         self.mean = 0


#     def process(self, processes):

#         input_stream = processes[self['input']]
#         total_duration = len(input_stream)

#         # For first sample, MS is just the square
#         if total_duration == 1:
#             self.mean = input_stream[0]

#         # For samples less than window size, use weighted average
#         elif total_duration <= self.window:
#             # Weight previous RMS by (n-1)/n and add new sample weighted by 1/n
#             self.mean = self.mean * (total_duration - 1)/total_duration
#             self.mean += input_stream[-1]/total_duration

#         # For normal operation, slide window
#         else:
#             # Add newest sample and remove oldest sample from window, normalized by window size
#             self.mean = self.mean + (input_stream[-1] - input_stream[-self.window - 1])/self.window

#         processes[self['output']].append(self.mean)

class Mean(ModuleApplier):

    def __init__(self, input_name, output_name, window):

        intermediate_name = '_' + self.__class__.__name__ + '_' + input_name + '_' + str(window) + '_'

        modules = [
            RunningSum(input_name, intermediate_name + 'running_sum', window),
            FunctionalWindowLength(input_name, intermediate_name + 'functional_window_length', window),
            Exponent(intermediate_name + 'functional_window_length', intermediate_name + 'exponent', -1),
            Multiplier([intermediate_name + 'running_sum', intermediate_name + 'exponent'], output_name),
        ]

        super().__init__(modules)


    
