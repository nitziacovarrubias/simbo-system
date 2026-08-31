import FreeCAD as App
import Part


def color_from_hex(value):
    try:
        value = value.lstrip("#")
        return tuple(int(value[index:index + 2], 16) / 255.0 for index in (0, 2, 4))
    except Exception:
        return (0.75, 0.75, 0.75)


def create_feature(document, group, label, shape, module, fabricable=True):
    feature = document.addObject("Part::Feature", label)
    feature.Label = label
    feature.Shape = shape
    feature.addProperty("App::PropertyString", "SimboModuleId", "SIMBO")
    feature.SimboModuleId = module["id"]
    feature.addProperty("App::PropertyString", "SimboModuleType", "SIMBO")
    feature.SimboModuleType = module["type"]
    feature.addProperty("App::PropertyBool", "IsFabricable", "SIMBO")
    feature.IsFabricable = fabricable
    try:
        feature.ViewObject.ShapeColor = color_from_hex(module["material"]["colorHex"])
    except Exception:
        pass
    group.addObject(feature)
    return feature


def placed_box(document, group, module, label, size_x, size_y, size_z, x, y, z, fabricable=True):
    shape = Part.makeBox(size_x, size_y, size_z, App.Vector(x, y, z))
    feature = create_feature(document, group, label, shape, module, fabricable=fabricable)
    feature.Placement = App.Placement(
        App.Vector(module["positionX"], module["positionZ"], module["positionY"]),
        App.Rotation(App.Vector(0, 0, 1), module["rotationY"]),
    )
    return feature


def add_carcass(document, group, module, include_shelf=True, include_front=True):
    width = float(module["widthMm"])
    height = float(module["heightMm"])
    depth = float(module["depthMm"])
    thickness = min(float(module["material"]["thicknessMm"]), width / 4, height / 4, depth / 4)
    left = -width / 2
    back = -depth / 2
    inner_width = max(width - 2 * thickness, thickness)
    parts = []

    parts.append(placed_box(document, group, module, "Lateral_izquierdo", thickness, depth, height, left, back, 0))
    parts.append(placed_box(document, group, module, "Lateral_derecho", thickness, depth, height, width / 2 - thickness, back, 0))
    parts.append(placed_box(document, group, module, "Base", inner_width, depth, thickness, left + thickness, back, 0))
    parts.append(placed_box(document, group, module, "Tapa", inner_width, depth, thickness, left + thickness, back, height - thickness))

    if include_shelf and height > thickness * 4:
        parts.append(
            placed_box(
                document,
                group,
                module,
                "Repisa_principal",
                inner_width,
                max(depth - thickness, thickness),
                thickness,
                left + thickness,
                back,
                height * 0.5 - thickness * 0.5,
            )
        )

    if include_front:
        door_gap = min(3.0, width * 0.01)
        door_width = max(width / 2 - door_gap, thickness)
        front_depth = max(min(thickness, depth), 1.0)
        front_height = max(height - 2 * thickness, thickness)
        parts.append(
            placed_box(document, group, module, "Frente_izquierdo", door_width, front_depth, front_height, -width / 2, depth / 2 - front_depth, thickness)
        )
        parts.append(
            placed_box(document, group, module, "Frente_derecho", door_width, front_depth, front_height, door_gap, depth / 2 - front_depth, thickness)
        )

    return parts
