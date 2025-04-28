import numpy as np
from lib2.constants import sample_rate as dasr


def sample_wave_1(duration = 10):
    time = np.linspace(0,duration, duration*dasr)
    hz100 = np.sin(2*np.pi*100*time)
    hz200 = np.sin(2*np.pi*200*time)
    hz300 = np.sin(2*np.pi*300*time)
    wave = 2 * hz100 + 3 * hz200 + 4 * hz300
    return wave
