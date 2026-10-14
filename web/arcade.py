"""Lightweight pure-Python shim for the Python Arcade library.
Provides classes and functions for Arcade 2D graphics, Window lifecycles,
drawing primitives, sprites, and physics simulation in headless environments (Pyodide / CI / tests).
"""
import math


class Color(tuple):
    pass


class color:
    WHITE = (255, 255, 255)
    BLACK = (0, 0, 0)
    RED = (255, 0, 0)
    GREEN = (0, 255, 0)
    BLUE = (0, 0, 255)
    YELLOW = (255, 255, 0)
    AMAZON = (59, 122, 87)
    CYAN = (0, 255, 255)
    PURPLE = (128, 0, 128)
    ORANGE = (255, 165, 0)
    SKY_BLUE = (135, 206, 235)


class key:
    LEFT = 65361
    RIGHT = 65363
    UP = 65362
    DOWN = 65364
    SPACE = 32
    ESCAPE = 65307
    A = 97
    D = 100
    W = 119
    S = 115


_draw_commands = []
_bg_color = color.BLACK


def set_background_color(col):
    global _bg_color
    _bg_color = col


def start_render():
    _draw_commands.clear()


def finish_render():
    pass


def draw_circle_filled(center_x, center_y, radius, col):
    _draw_commands.append({"type": "circle_filled", "x": center_x, "y": center_y, "radius": radius, "color": col})


def draw_rectangle_filled(center_x, center_y, width, height, col):
    _draw_commands.append({"type": "rect_filled", "x": center_x, "y": center_y, "width": width, "height": height, "color": col})


def draw_line(start_x, start_y, end_x, end_y, col, line_width=1):
    _draw_commands.append({"type": "line", "x1": start_x, "y1": start_y, "x2": end_x, "y2": end_y, "color": col, "width": line_width})


def draw_text(text, start_x, start_y, col, font_size=12):
    _draw_commands.append({"type": "text", "text": text, "x": start_x, "y": start_y, "color": col, "size": font_size})


class Window:
    def __init__(self, width=800, height=600, title="Arcade Window"):
        self.width = width
        self.height = height
        self.title = title
        self.background_color = color.BLACK

    def set_update_rate(self, rate):
        self.update_rate = rate

    def on_draw(self):
        pass

    def on_update(self, delta_time):
        pass

    def on_key_press(self, symbol, modifiers):
        pass

    def on_key_release(self, symbol, modifiers):
        pass


def run():
    pass


class Sprite:
    def __init__(self, filename=None, scale=1.0, center_x=0.0, center_y=0.0):
        self.filename = filename
        self.scale = scale
        self.center_x = float(center_x)
        self.center_y = float(center_y)
        self.change_x = 0.0
        self.change_y = 0.0
        self.width = 32.0 * scale
        self.height = 32.0 * scale

    def update(self):
        self.center_x += self.change_x
        self.center_y += self.change_y

    def draw(self):
        draw_rectangle_filled(self.center_x, self.center_y, self.width, self.height, color.WHITE)

    def collides_with_sprite(self, other):
        # AABB bounding box collision
        dx = abs(self.center_x - other.center_x)
        dy = abs(self.center_y - other.center_y)
        return dx < ((self.width + other.width) / 2) and dy < ((self.height + other.height) / 2)

    def collides_with_list(self, spritelist):
        return [s for s in spritelist if self.collides_with_sprite(s)]


class SpriteList(list):
    def append(self, sprite):
        super().append(sprite)

    def update(self):
        for s in self:
            s.update()

    def draw(self):
        for s in self:
            s.draw()


def check_for_collision(sprite1, sprite2):
    return sprite1.collides_with_sprite(sprite2)


def check_for_collision_with_list(sprite, sprite_list):
    return [s for s in sprite_list if sprite.collides_with_sprite(s)]


class PhysicsEngineSimple:
    def __init__(self, player_sprite, platforms):
        self.player_sprite = player_sprite
        self.platforms = platforms

    def update(self):
        self.player_sprite.center_x += self.player_sprite.change_x
        hit_list_x = check_for_collision_with_list(self.player_sprite, self.platforms)
        for block in hit_list_x:
            if self.player_sprite.change_x > 0:
                self.player_sprite.center_x = block.center_x - (block.width / 2) - (self.player_sprite.width / 2)
            elif self.player_sprite.change_x < 0:
                self.player_sprite.center_x = block.center_x + (block.width / 2) + (self.player_sprite.width / 2)

        self.player_sprite.center_y += self.player_sprite.change_y
        hit_list_y = check_for_collision_with_list(self.player_sprite, self.platforms)
        for block in hit_list_y:
            if self.player_sprite.change_y > 0:
                self.player_sprite.center_y = block.center_y - (block.height / 2) - (self.player_sprite.height / 2)
            elif self.player_sprite.change_y < 0:
                self.player_sprite.center_y = block.center_y + (block.height / 2) + (self.player_sprite.height / 2)
