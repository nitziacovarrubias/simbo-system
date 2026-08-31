import argparse
import json
import os
import sys
from datetime import datetime, timezone

import FreeCAD as App
import Mesh
import Part

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

def parse_args():
    input_path = os.environ.get("SIMBO_FREECAD_INPUT")
    output_dir = os.environ.get("SIMBO_FREECAD_OUTPUT_DIR")

    if input_path and output_dir:
        return argparse.Namespace(
            input_path=input_path,
            output_dir=output_dir,
        )

    parser = argparse.ArgumentParser(
        description="Genera artefactos CAD de SIMBO con FreeCADCmd."
    )
    parser.add_argument("--input", required=True, dest="input_path")
    parser.add_argument("--output-dir", required=True, dest="output_dir")
    args, _unknown = parser.parse_known_args()
    return args

def write_output(output_path, payload):
    with open(output_path, "w", encoding="utf-8") as output_file:
        json.dump(payload, output_file, ensure_ascii=False, indent=2)


def main():
    args = parse_args()
    input_path = os.path.abspath(args.input_path)
    output_dir = os.path.abspath(args.output_dir)
    os.makedirs(output_dir, exist_ok=True)
    output_json_path = os.path.join(output_dir, "output.json")
    document = None

    try:
        from common.validation import validate_input
        from module_builders import appliance_placeholder
        from module_builders import base_cabinet
        from module_builders import island
        from module_builders import shelf
        from module_builders import tall_cabinet
        from module_builders import wall_cabinet

        builders = {
            "BASE_CABINET": base_cabinet.build,
            "WALL_CABINET": wall_cabinet.build,
            "TALL_CABINET": tall_cabinet.build,
            "SHELF": shelf.build,
            "ISLAND": island.build,
            "APPLIANCE_PLACEHOLDER": appliance_placeholder.build,
        }

        with open(input_path, "r", encoding="utf-8") as input_file:
            data = validate_input(json.load(input_file))

        document = App.newDocument("SIMBO_Model")
        export_objects = []
        warnings = []

        if data["room"]["layoutType"] == "CUSTOM":
            warnings.append("El layout CUSTOM usa las dimensiones generales del espacio; no se reconstruyó un polígono personalizado.")

        for module in data["modules"]:
            group = document.addObject("App::Part", f"Module_{module['id']}")
            group.Label = module["name"]
            builder = builders[module["type"]]
            features = builder(document, group, module)
            export_objects.extend(features)
            if module["type"] == "APPLIANCE_PLACEHOLDER":
                warnings.append(f"{module['name']} se exportó como volumen de referencia no fabricable.")

        document.recompute()
        fcstd_path = os.path.join(output_dir, "model.FCStd")
        step_path = os.path.join(output_dir, "model.step")
        stl_path = os.path.join(output_dir, "model.stl")

        document.saveAs(fcstd_path)
        Part.export(export_objects, step_path)
        Mesh.export(export_objects, stl_path)

        for generated_path in (fcstd_path, step_path, stl_path):
            if not os.path.isfile(generated_path) or os.path.getsize(generated_path) <= 0:
                raise RuntimeError(f"FreeCAD no produjo correctamente {generated_path}.")

        payload = {
            "success": True,
            "files": {
                "fcstd": os.path.abspath(fcstd_path),
                "step": os.path.abspath(step_path),
                "stl": os.path.abspath(stl_path),
                "obj": None,
            },
            "warnings": warnings,
            "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        }
        write_output(output_json_path, payload)
        print(json.dumps(payload, ensure_ascii=False))
        return 0
    except Exception as error:
        failure = {
            "success": False,
            "error": str(error),
            "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        }
        try:
            write_output(output_json_path, failure)
        except Exception:
            pass
        print(f"SIMBO FreeCAD generation failed: {error}", file=sys.stderr)
        return 2
    finally:
        if document is not None:
            try:
                App.closeDocument(document.Name)
            except Exception:
                pass


if __name__ == "__main__" or os.environ.get("SIMBO_FREECAD_AUTORUN") == "1":
    exit_code = main()

    if exit_code != 0:
        raise RuntimeError(
            f"SIMBO FreeCAD generation failed with code {exit_code}"
        )