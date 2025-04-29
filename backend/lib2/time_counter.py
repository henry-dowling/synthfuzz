from lib2.sound_processor import SoundProcessor
from lib2.constants import sample_rate

class TimeCounter(SoundProcessor):
    def __init__(self, name = 'time', sample_rate=sample_rate):
        input_streams = {}
        output_assignments = {'time': name}
        super().__init__(input_streams, output_assignments)
        self.time = 0
        self.interval = 1/sample_rate

    def process(self, processes):

        processes[self['time']].append(self.time)
        self.time += self.interval

