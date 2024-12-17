import venv, argparse, subprocess, sys
from pathlib import Path

def create_python_env(env_path: str, requirements: list[str]) -> None:
    """Create a Python virtual environment and optionally install packages."""
    try:
        # Create venv
        venv.create(env_path, with_pip=True)
        pip_path = Path(env_path) / "Scripts" / "pip" if sys.platform == "win32" else Path(env_path) / "bin" / "pip"
        subprocess.run([str(pip_path), "install"] + requirements, check=True)            
    except Exception as e:
        print(f"Error creating environment: {e}")
        raise


def parse_args():
    parser = argparse.ArgumentParser(description='Setup env for Jupyter notebook runner')
    parser.add_argument(
        '--env_path',
        type=str,
        required=True,
        help='Path to Python virtual environment'
    )
    return parser.parse_args()

# Usage example
if __name__ == "__main__":
    env_path = parse_args().env_path
    if not Path(env_path).is_dir():
        create_python_env(
            env_path=env_path,
            # re: https://github.com/jupyter/nbclient/issues/321
            requirements=["nbformat", "nbdev", "retry", "git+https://github.com/callmephilip/nbclient.git@fix/transient-set-to-none"]
        )
