from lib2.sound_processor import SoundProcessor
import numpy as np


class Derivative(SoundProcessor):
    def __init__(self, input_name, output_name, time_name='time'):
        input_streams = {'input': input_name, 'time': time_name}
        output_assignments = {'output': output_name}
        super().__init__(input_streams, output_assignments)
        


    def process(self, processes):
        input_stream = processes[self['input']]
        
        if len(input_stream) == 1:
            processes[self['output']].append(0)
            return
        

        time_stream = processes[self['time']]

        output = (input_stream[-1] - input_stream[-2]) / (time_stream[-1] - time_stream[-2])

        processes[self['output']].append(output)

