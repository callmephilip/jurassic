#! ./.jurassic/env/bin/python

import argparse, subprocess

def parse_args():
    parser = argparse.ArgumentParser(description='Clean Jupyter notebooks')
    parser.add_argument(
        'nbspath',
        type=str,
        help='Path to the notebooks dir'
    )
    return parser.parse_args()


if __name__ == "__main__":
    subprocess.run(["./.jurassic/env/bin/nbdev_clean", "--fname", parse_args().nbspath]) 
