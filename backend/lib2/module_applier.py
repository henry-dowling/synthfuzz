from lib2.sound_processor import SoundProcessor
from lib2.utils import hash_instance


class ModuleApplier(SoundProcessor):
    def __init__(self, modules):
        self.check_validity(modules)

        input_streams, output_assignments = self.build_in_out_streams(modules)
        super().__init__(input_streams, output_assignments)
        self.modules = modules


    def build_in_out_streams(self, modules):
        input_streams = {}
        output_assignments = {}

        for module in modules:
            for output in module.output_assignments:
                output_assignments[module.output_assignments[output]] = module.output_assignments[output]

        for module in modules:
            for input in module.input_streams:
                if module.input_streams[input] not in output_assignments:
                    input_streams[module.input_streams[input]] = module.input_streams[input]

        return input_streams, output_assignments
    
    def check_validity(self, modules):
        outputs = [list(module.output_assignments.values()) for module in modules]

        full_outputs = []
        for output in outputs:
            full_outputs = full_outputs + output

        if len(set(full_outputs)) != len(full_outputs):
            print(full_outputs)
            raise Exception("Modules have duplicate outputs")

    def check_first_sample(self, processes):

        return len(processes[self.output_assignments[list(self.output_assignments)[0]]]) == 0


    def process(self, processes):

        if self.check_first_sample(processes):
            self.get_order(processes)
        else:
            self.apply_modules(processes)


    def get_order(self, processes):
        self.ordered_modules = []

        done_array = [False for _ in range(len(self.modules))]
        for i in range(len(self.modules)):
            for i, module in enumerate(self.modules):
                if module.ready(processes) and not done_array[i]:
                    self.ordered_modules.append(module)
                    module.process(processes)
                    done_array[i] = True
                if len(self.ordered_modules) == len(self.modules):
                    break
        
        if len(self.ordered_modules) != len(self.modules):
            raise Exception("Modules are not ready")
        
    def apply_modules(self, processes):
        for module in self.ordered_modules:
            module.process(processes)

        
            


