from lib2.sound_processor import SoundProcessor


class RunningSum(SoundProcessor):
    def __init__(self, input_name, output_name, window):

        input_streams = {'input': input_name}
        output_assignments = {'output': output_name}
        super().__init__(input_streams, output_assignments)
        self.window = window
        self.sum = 0

    def process(self, processes):

        input_stream = processes[self['input']]
        total_duration = len(input_stream)

        self.sum = self.sum + input_stream[-1]

        if total_duration > self.window:
            self.sum = self.sum - input_stream[-self.window - 1]

        processes[self['output']].append(self.sum)


    


            

        