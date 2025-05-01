from lib2.sound_processor import SoundProcessor


class FunctionalWindowLength(SoundProcessor):
    def __init__(self, input_name, output_name, window):

        input_streams = {'input': input_name}
        output_assignments = {'output': output_name}
        super().__init__(input_streams, output_assignments)
        self.window = window

    def process(self, processes):
        input_stream = processes[self['input']]
        total_duration = len(input_stream)
        if total_duration < self.window:
            processes[self['output']].append(total_duration)
        else:
            processes[self['output']].append(self.window)
        
        
        
        
        