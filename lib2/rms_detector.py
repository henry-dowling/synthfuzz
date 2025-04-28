import numpy as np
from lib2.module_applier import ModuleApplier
from lib2.sound_processor import SoundProcessor
from lib2.exponent import Exponent
from lib2.mean import Mean

class OldRmsDetector(SoundProcessor):
    def __init__(self, input_name, output_name, window):

        input_streams = {'input': input_name}
        output_assignments = {'output': output_name}
        # Initialize parent class and set initial values
        super().__init__(input_streams, output_assignments)
        self.window = window  # Size of sliding window
        self.ms = 0          # Mean square value
        self.rms = 0         # Root mean square value


    def process(self, processes):
        # Get input stream from processes dict
        input_stream = processes[self['input']]
        total_duration = len(input_stream)

        # For first sample, MS is just the square
        if total_duration == 1:
            self.ms = input_stream[0]**2

        # For samples less than window size, use weighted average
        elif total_duration <= self.window:
            # Weight previous RMS by (n-1)/n and add new sample weighted by 1/n
            self.ms = self.ms * (total_duration - 1)/total_duration
            self.ms += input_stream[-1]**2/total_duration

        # For normal operation, slide window
        else:
            # Add newest sample and remove oldest sample from window, normalized by window size
            self.ms = self.ms + (input_stream[-1]**2 - input_stream[-self.window - 1]**2)/self.window

        

        # Calculate RMS as square root of mean square
        self.rms = np.sqrt(self.ms)

        # Store result in processes dict
        # processes[self['output']].append(self.rms)
        processes[self['output']].append(self.rms)

class RmsDetector(ModuleApplier):
    def __init__(self, input_name, output_name, window):

        intermediate_name = '_' + self.__class__.__name__ + '_' + input_name + '_' + str(window) + '_'

        modules = [
            Exponent(input_name, intermediate_name + 'exponent', 2),
            Mean(intermediate_name + 'exponent', intermediate_name + 'mean', window),
            Exponent(intermediate_name + 'mean', output_name, 0.5)
            ]

        super().__init__(modules)






