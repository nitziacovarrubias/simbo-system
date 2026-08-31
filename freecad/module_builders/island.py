from common.geometry import add_carcass


def build(document, group, module):
    return add_carcass(document, group, module, include_shelf=True, include_front=True)
