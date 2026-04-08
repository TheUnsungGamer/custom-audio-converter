import subprocess
import sys
from pathlib import Path

def convert_mp4_to_wav(input_file, output_file=None):
    input_path = Path(input_file)

    if not input_path.exists():
        raise FileNotFoundError(f"File not found: {input_path}")

    output_path = Path(output_file) if output_file else input_path.with_suffix(".wav")

    command = [
        "ffmpeg",
        "-y",
        "-i", str(input_path),
        "-vn",
        "-acodec", "pcm_s16le",
        "-ar", "44100",
        "-ac", "2",
        str(output_path)
    ]

    subprocess.run(command, check=True)
    print(f"Done: {output_path}")

if __name__ == "__main__":
    convert_mp4_to_wav(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)