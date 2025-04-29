from lib2.sound_processor import SoundProcessor


class Aggregator(SoundProcessor):
    def __init__(self, input_names, output_name, function):
        input_streams = {input_names[i]: input_names[i] for i in range(len(input_names))}
        output_assignments = {'output': output_name}
        super().__init__(input_streams, output_assignments)
        self.function = function

        
    def process(self, processes):

        inputs = [processes[self[input]][-1] for input in self.input_streams]
        output = self.function(inputs)
        processes[self.output_assignments['output']].append(output) 

        

