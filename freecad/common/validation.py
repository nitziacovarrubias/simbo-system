SUPPORTED_MODULE_TYPES = {
    "BASE_CABINET",
    "WALL_CABINET",
    "TALL_CABINET",
    "SHELF",
    "ISLAND",
    "APPLIANCE_PLACEHOLDER",
}
SUPPORTED_LAYOUT_TYPES = {"RECTANGULAR", "L_SHAPE", "U_SHAPE", "CUSTOM"}


def _require_dict(value, label):
    if not isinstance(value, dict):
        raise ValueError(f"{label} debe ser un objeto JSON.")
    return value


def _require_string(value, label):
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{label} debe ser texto no vacío.")
    return value.strip()


def _require_number(value, label, positive=False):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{label} debe ser numérico.")
    number = float(value)
    if positive and number <= 0:
        raise ValueError(f"{label} debe ser mayor que cero.")
    if abs(number) > 100000:
        raise ValueError(f"{label} está fuera del rango permitido.")
    return number


def validate_input(data):
    root = _require_dict(data, "La entrada")
    project = _require_dict(root.get("project"), "project")
    room = _require_dict(root.get("room"), "room")
    modules = root.get("modules")
    if not isinstance(modules, list) or not modules:
        raise ValueError("modules debe contener al menos un módulo.")

    _require_string(project.get("id"), "project.id")
    _require_string(project.get("name"), "project.name")
    if project.get("units") != "mm":
        raise ValueError("project.units debe ser mm.")

    layout_type = _require_string(room.get("layoutType"), "room.layoutType")
    if layout_type not in SUPPORTED_LAYOUT_TYPES:
        raise ValueError("room.layoutType no es compatible.")
    for field in ("widthMm", "depthMm", "heightMm"):
        _require_number(room.get(field), f"room.{field}", positive=True)

    for index, module in enumerate(modules):
        item = _require_dict(module, f"modules[{index}]")
        _require_string(item.get("id"), f"modules[{index}].id")
        module_type = _require_string(item.get("type"), f"modules[{index}].type")
        if module_type not in SUPPORTED_MODULE_TYPES:
            raise ValueError(f"modules[{index}].type no es compatible.")
        _require_string(item.get("name"), f"modules[{index}].name")
        for field in ("widthMm", "heightMm", "depthMm"):
            _require_number(item.get(field), f"modules[{index}].{field}", positive=True)
        for field in ("positionX", "positionY", "positionZ", "rotationY"):
            _require_number(item.get(field), f"modules[{index}].{field}")
        material = _require_dict(item.get("material"), f"modules[{index}].material")
        _require_string(material.get("name"), f"modules[{index}].material.name")
        _require_number(material.get("thicknessMm"), f"modules[{index}].material.thicknessMm", positive=True)
        color = _require_string(material.get("colorHex"), f"modules[{index}].material.colorHex")
        if len(color) != 7 or not color.startswith("#"):
            raise ValueError(f"modules[{index}].material.colorHex debe usar #RRGGBB.")

    return root
