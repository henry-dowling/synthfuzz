
from lib2.sound_processor import SoundProcessor


class HighpassDcBlock(SoundProcessor):
    def __init__(self, input_name, output_name, alpha=0.995):

        input_streams = {'input': input_name}
        output_assignments = {'output': output_name}
        super().__init__(input_streams, output_assignments)
        self.alpha = alpha
        self.prev_y = 0
        self.prev_x = 0

    def process(self, processes):
        input_stream = processes[self['input']]

        new_output = input_stream[-1] - self.prev_x + self.alpha * self.prev_y
        self.prev_x = input_stream[-1]
        self.prev_y = new_output

        processes[self['output']].append(new_output)