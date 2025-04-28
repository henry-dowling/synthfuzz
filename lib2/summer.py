from lib2.aggregator import Aggregator
import numpy as np

class Summer(Aggregator):
    def __init__(self, input_names, output_name, constant=1):

        if type(input_names) == str:
            input_names = [input_names]

        function = lambda x: np.sum(x) + constant
        super().__init__(input_names, output_name, function)

