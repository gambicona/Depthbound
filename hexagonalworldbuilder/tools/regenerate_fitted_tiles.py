from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "assets" / "bottomtiles"
OUT_DIR = ROOT / "assets" / "fittedtiles"
TARGET_SIZE = (1379, 1379)
TARGET_BOUNDS = (124, 206, 1132, 1235)
ALPHA_THRESHOLD = 18


ALLOW_TOP_OVERHANG = {
    "arctic",
    "forest",
    "forest_dark",
    "jungle",
    "mountain",
}
SURFACE_BOTTOM_RATIO = 0.68
SOURCE_INSET_X = 0.08
SOURCE_INSET_TOP = 0.03


def alpha_bounds(image):
    alpha = np.asarray(image.convert("RGBA"))[:, :, 3]
    ys, xs = np.where(alpha > ALPHA_THRESHOLD)
    if len(xs) == 0:
        return (0, 0, image.width, image.height)
    return (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)


def symmetric_hex_points(bounds):
    left, top, right, bottom = bounds
    width = right - left
    height = bottom - top
    mid_x = left + width * 0.5
    return [
        (mid_x, top),
        (right, top + height * 0.25),
        (right, top + height * 0.75),
        (mid_x, bottom),
        (left, top + height * 0.75),
        (left, top + height * 0.25),
    ]


def symmetric_hex_mask():
    mask = Image.new("L", TARGET_SIZE, 0)
    draw = ImageDraw.Draw(mask)
    draw.polygon(symmetric_hex_points(TARGET_BOUNDS), fill=255)
    return mask


def fit_to_hex(source_path, mask):
    source = Image.open(source_path).convert("RGBA")
    source_bounds = alpha_bounds(source)
    left, top, right, bottom = TARGET_BOUNDS
    target_width = right - left
    target_height = bottom - top
    source_left, source_top, source_right, source_bottom = source_bounds
    source_bottom = round(source_top + (source_bottom - source_top) * SURFACE_BOTTOM_RATIO)
    source_width = source_right - source_left
    source_height = source_bottom - source_top
    source_left = round(source_left + source_width * SOURCE_INSET_X)
    source_right = round(source_right - source_width * SOURCE_INSET_X)
    source_top = round(source_top + source_height * SOURCE_INSET_TOP)
    source_bounds = (source_left, source_top, source_right, source_bottom)

    texture = source.crop(source_bounds).resize((target_width, target_height), Image.Resampling.LANCZOS)
    output = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
    output.alpha_composite(texture, (left, top))

    if source_path.stem in ALLOW_TOP_OVERHANG:
        # Keep high silhouettes above the fitted hex, but only above the target top.
        source_left, source_top, source_right, source_bottom = source_bounds
        scale_x = target_width / (source_right - source_left)
        scale_y = target_height / (source_bottom - source_top)
        scaled = source.resize(
            (round(source.width * scale_x), round(source.height * scale_y)),
            Image.Resampling.LANCZOS,
        )
        paste_x = round(left - source_left * scale_x)
        paste_y = round(top - source_top * scale_y)
        overhang_layer = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
        overhang_layer.alpha_composite(scaled, (paste_x, paste_y))

        output_data = np.asarray(output).copy()
        overhang_data = np.asarray(overhang_layer)
        source_alpha = overhang_data[:, :, 3]
        y_coords = np.indices(source_alpha.shape)[0]
        overhang = (source_alpha > ALPHA_THRESHOLD) & (y_coords < top)
        output_data[overhang] = overhang_data[overhang]
        output = Image.fromarray(output_data, "RGBA")

    output_data = np.asarray(output).copy()
    mask_alpha = np.asarray(mask)
    if source_path.stem in ALLOW_TOP_OVERHANG:
        current_alpha = output_data[:, :, 3]
        y_coords = np.indices(current_alpha.shape)[0]
        final_alpha = np.where(y_coords < top, current_alpha, np.minimum(current_alpha, mask_alpha))
    else:
        final_alpha = np.minimum(output_data[:, :, 3], mask_alpha)
    output_data[:, :, 3] = final_alpha.astype(np.uint8)
    return Image.fromarray(output_data, "RGBA")


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    mask = symmetric_hex_mask()
    for source_path in RAW_DIR.glob("*.png"):
        fit_to_hex(source_path, mask).save(OUT_DIR / source_path.name)


if __name__ == "__main__":
    main()
