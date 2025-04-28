import numpy as np
from lib2.sound_processor import SoundProcessor

class InputFeeder(SoundProcessor):
    def __init__(self, input_arrays):

        input_streams = {}
        output_assignments = {}

        for name, array in input_arrays.items():
            output_assignments[name] = name

        super().__init__(input_streams, output_assignments)
        self.input_arrays = input_arrays
        self.index = 0
    
    def process(self, processes):

        for output in self.output_assignments:
            processes[self[output]].append(self.input_arrays[output][self.index])

        self.index += 1


