from lib2.sound_processor import SoundProcessor
import numpy as np

class FixedWindowGeneric(SoundProcessor):
    def __init__(self, input_name, output_name, function, window):

        input_streams = {'input': input_name}
        output_assignments = {'output': output_name}
        super().__init__(input_streams, output_assignments)
        self.function = function
        self.window = window

    def process(self, processes):

        input_stream = processes[self['input']]
        if self.window == 1:
            new_output = self.function(input_stream[-1])
        else:
            functional_window = min(self.window, len(input_stream))
            new_output = self.function(np.array(input_stream[-functional_window:]))
        processes[self['output']].append(new_output)

        