from common.geometry import placed_box


def build(document, group, module):
    width = float(module["widthMm"])
    height = float(module["heightMm"])
    depth = float(module["depthMm"])
    return [placed_box(document, group, module, "Repisa", width, depth, height, -width / 2, -depth / 2, 0)]
