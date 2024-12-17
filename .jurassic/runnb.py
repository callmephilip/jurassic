#! ./.jurassic/env/bin/python

import sys, nbformat, argparse
from pathlib import Path
from nbclient import NotebookClient
from retry import retry

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


@retry(tries=3, delay=2)
def run(notebook, nbs_path):
    nb = nbformat.read(notebook, as_version=4)
    NotebookClient(nb, timeout=600, kernel_name='deno', resources={'metadata': {'path': nbs_path}}).execute()
    nbformat.write(nb, notebook)

if __name__ == "__main__":
    args = parse_args()
    print(f"Using Python from: {sys.executable}")
    print(f"With sys.path: {sys.path[0]}")
    run(args.notebook, args.nbs_path)
    
    
