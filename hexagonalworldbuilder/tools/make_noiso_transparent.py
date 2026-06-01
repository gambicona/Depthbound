from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "assets" / "bottomtiles" / "noiso"
OUTPUT_DIR = ROOT / "assets" / "bottomtiles" / "noiso_fitted"
BLACK_THRESHOLD = 18
OVERHANG_BLACK_THRESHOLD = 48
CLEAR_ALL_BLACK_TILES = {"forest_normal", "mountain"}


def is_edge_black(pixel, threshold=BLACK_THRESHOLD):
    r, g, b, a = pixel
    return a == 0 or (a > 0 and r <= threshold and g <= threshold and b <= threshold)


def clear_connected_edge_black(image):
    pixels = image.load()
    width, height = image.size
    seen = bytearray(width * height)
    queue = deque()

    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        if x < 0 or y < 0 or x >= width or y >= height:
            continue
        index = y * width + x
        if seen[index]:
            continue
        seen[index] = 1
        if not is_edge_black(pixels[x, y]):
            continue

        r, g, b, _ = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)
        queue.append((x + 1, y))
        queue.append((x - 1, y))
        queue.append((x, y + 1))
        queue.append((x, y - 1))


def clear_all_near_black(image):
    pixels = image.load()
    width, height = image.size
    for y in range(height):
        for x in range(width):
            if is_edge_black(pixels[x, y], OVERHANG_BLACK_THRESHOLD):
                r, g, b, _ = pixels[x, y]
                pixels[x, y] = (r, g, b, 0)


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for source_path in sorted(SOURCE_DIR.glob("*.png")):
        image = Image.open(source_path).convert("RGBA")
        clear_connected_edge_black(image)
        if source_path.stem in CLEAR_ALL_BLACK_TILES:
            clear_all_near_black(image)
        image.save(OUTPUT_DIR / source_path.name)
        print(f"wrote {OUTPUT_DIR / source_path.name}")


if __name__ == "__main__":
    main()
