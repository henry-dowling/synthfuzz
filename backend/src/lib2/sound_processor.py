
# Base class for sound processing modules
class SoundProcessor:
    def __init__(self, input_streams, output_assignments, feedback_inputs=None):
        # Store input stream names and output assignments
        self.input_streams = input_streams
        self.output_assignments = output_assignments

        self.outputs_inserted = False
        if feedback_inputs is not None:
            self.feedback_inputs = feedback_inputs
        else:
            self.feedback_inputs = {}

        


    def process(self, processes):
        # Override this method in child classes to implement processing logic
        pass

    def insert_outputs(self, processes):
        for output in self.output_assignments:
            if self[output] not in processes:
                processes[self[output]] = []
        self.outputs_inserted = True

    def __getitem__(self, key):
        # Allow dictionary-style access to input/output stream names
        if key in self.input_streams:
            return self.input_streams[key]
        elif key in self.output_assignments:
            return self.output_assignments[key]
        elif key in self.feedback_inputs:
            return self.feedback_inputs[key]
        else:
            raise KeyError(f"Key {key} not found in input_streams or output_assignments")
        
    def ready(self, processes):

        if not self.outputs_inserted:
            self.insert_outputs(processes)

        if len(self.input_streams) == 0:
            return True
        # Check if all input streams have same length and outputs are one sample behind
        input_stream_length = -1
        # Check all input streams have same length
        for input_stream in self.input_streams:
            if len(processes[self[input_stream]]) != input_stream_length and input_stream_length != -1:
                return False
            input_stream_length = len(processes[self[input_stream]])
        # Check all output streams are one sample behind inputs
        for output_stream in self.output_assignments:
            if len(processes[self[output_stream]]) != input_stream_length - 1 and input_stream_length != -1:
                return False
            
        for feedback_inputs in self.feedback_inputs:
            if len(processes[self[feedback_inputs]]) != input_stream_length - 1 and input_stream_length != -1:
                return False
            
        return True
