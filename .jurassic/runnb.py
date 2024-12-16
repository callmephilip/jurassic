#! ./.jurassic/env/bin/python

import sys, nbformat, argparse
from pathlib import Path
from nbclient import NotebookClient


def parse_args():
    parser = argparse.ArgumentParser(description='Execute Jupyter notebook')
    parser.add_argument(
        'notebook',
        type=str,
        help='Path to the notebook to run'
    )
    parser.add_argument(
        '--nbs_path',
        type=str,
        required=True,
        help='Path to where notebooks are stored'
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    print(f"Using Python from: {sys.executable}")
    print(f"With sys.path: {sys.path[0]}")
    
    nb = nbformat.read(args.notebook, as_version=4)
    NotebookClient(nb, timeout=600, kernel_name='deno', resources={'metadata': {'path': args.nbs_path}}).execute()
    nbformat.write(nb, args.notebook)
