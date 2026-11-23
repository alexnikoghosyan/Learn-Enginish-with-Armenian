# §21. Քարը իջնում է չափագլանի մեջ. ջրի մակարդակը բարձրանում է ընկղմված ծավալի չափով։
# Գործարկում.  blender -b --python physics-src/blender/cylinder-displacement.py -- physics-src/renders/cylinder-displacement
# Արդյունք՝ f00.png … f23.png (300×400, թափանցիկ ֆոն). հաջորդ քայլը՝ python physics-media.py
# Ուշադրություն. ելքի թղթապանակը տալ ԱԲՍՈԼՅՈՒՏ ուղիով (Blender-ը հարաբերական ուղին կարող է լուծել իր թղթապանակից)։
import math
import os
import sys

import bpy

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else os.path.abspath('renders')
FRAMES = 24
R, H = 0.9, 3.4          # չափագլանի շառավիղը և բարձրությունը
STONE = 0.5              # քարի շառավիղը
LEVEL0 = 1.4             # ջրի սկզբնական մակարդակը
INNER = R * 0.96

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
for engine in ('BLENDER_EEVEE', 'BLENDER_EEVEE_NEXT', 'BLENDER_WORKBENCH'):
    try:
        scene.render.engine = engine
        break
    except TypeError:
        continue
scene.render.resolution_x, scene.render.resolution_y = 300, 400
scene.view_settings.view_transform = 'Standard'
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
if hasattr(scene, 'eevee'):
    scene.eevee.taa_render_samples = 24

world = bpy.data.worlds.new('world')
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (1, 1, 1, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.4
scene.world = world


def material(name, color, alpha=1.0, roughness=0.7):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    node = mat.node_tree.nodes['Principled BSDF']
    node.inputs['Base Color'].default_value = color
    node.inputs['Roughness'].default_value = roughness
    node.inputs['Alpha'].default_value = alpha
    if alpha < 1:
        for attr, value in (('surface_render_method', 'BLENDED'), ('blend_method', 'BLEND')):
            if hasattr(mat, attr):
                try:
                    setattr(mat, attr, value)
                except (TypeError, AttributeError):
                    pass
    mat.diffuse_color = color
    return mat


def shade(obj, mat, smooth=True):
    obj.data.materials.append(mat)
    if smooth:
        for poly in obj.data.polygons:
            poly.use_smooth = True


glass = material('glass', (0.8, 0.92, 1.0, 1), 0.14, 0.1)
water_mat = material('water', (0.05, 0.5, 1.0, 1), 0.55, 0.15)
stone_mat = material('stone', (0.3, 0.3, 0.34, 1), 1.0, 0.9)

bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=R, depth=H, end_fill_type='NOTHING', location=(0, 0, H / 2))
tube = bpy.context.object
tube.modifiers.new('wall', 'SOLIDIFY').thickness = 0.05
shade(tube, glass)
bpy.ops.mesh.primitive_circle_add(vertices=64, radius=R, fill_type='NGON', location=(0, 0, 0))
shade(bpy.context.object, glass, False)

bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=INNER, depth=1, location=(0, 0, 0.5))
water = bpy.context.object
shade(water, water_mat)

bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=STONE, location=(0, 0, H + 1))
stone = bpy.context.object
shade(stone, stone_mat, False)

bpy.ops.object.light_add(type='SUN', location=(4, -5, 8))
sun = bpy.context.object
sun.rotation_euler = (math.radians(50), math.radians(10), math.radians(30))
sun.data.energy = 1.6

bpy.ops.object.empty_add(location=(0, 0, 2.3))
target = bpy.context.object
bpy.ops.object.camera_add(location=(3.0, -7.0, 3.6))
camera = bpy.context.object
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 5.2
track = camera.constraints.new('TRACK_TO')
track.target = target
track.track_axis = 'TRACK_NEGATIVE_Z'
track.up_axis = 'UP_Y'
scene.camera = camera


def cap_volume(depth, radius):
    depth = max(0.0, min(2 * radius, depth))
    return math.pi * depth * depth * (3 * radius - depth) / 3


def level_for(center_z):
    level = LEVEL0
    for _ in range(40):
        level = LEVEL0 + cap_volume(level - (center_z - STONE), STONE) / (math.pi * INNER ** 2)
    return level


os.makedirs(OUT, exist_ok=True)
start, end = H + 0.8, STONE + 0.05
for index in range(FRAMES):
    t = index / (FRAMES - 1)
    eased = t * t * (3 - 2 * t)
    stone.location.z = start + (end - start) * eased
    level = level_for(stone.location.z)
    water.scale.z = level
    water.location.z = level / 2
    scene.render.filepath = os.path.join(OUT, 'f%02d.png' % index)
    bpy.ops.render.render(write_still=True)
print('rendered', FRAMES, 'frames ->', OUT)
