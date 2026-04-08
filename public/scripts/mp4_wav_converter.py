import subprocess
import sys
from pathlib import Path


def convert_mp4_to_wav(input_file: str, output_file: str | None = None) -> None:
    input_path = Path(input_file)

    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")

    if input_path.suffix.lower() != ".mp4":
        raise ValueError("Input file must be an .mp4 file")

    output_path = Path(output_file) if output_file else input_path.with_suffix(".wav")

    command = [
        "ffmpeg",
        "-y",
        "-i",
        str(input_path),
        "-vn",
        "-acodec",
        "pcm_s16le",
        "-ar",
        "44100",
        "-ac",
        "2",
        str(output_path),
    ]

    subprocess.run(command, check=True)
    print(f"Done: {output_path}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python mp4_to_wav_converter.py input.mp4 [output.wav]")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    convert_mp4_to_wav(input_file, output_file)