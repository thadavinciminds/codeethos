// Week 5 lesson content: Introduction to Graphics with Python Arcade.
// Step types: concept | predict | challenge | quiz
// Python code uses the `py` tag (String.raw + trim) so backslashes stay intact.

const py = (s, ...v) => String.raw(s, ...v).replace(/^\n/, '').replace(/\s+$/, '') + '\n';

export const week5 = {
  id: 5,
  title: 'Graphics with Arcade',
  lessons: [
    // ─────────────────────────────── 5.1
    {
      id: '5.1',
      title: 'Arcade Initialization & Coordinates',
      emoji: '🎨',
      minutes: 10,
      steps: [
        {
          type: 'concept',
          title: 'The Cartesian Coordinate System in Arcade',
          body: `<p>In most 2D graphics frameworks (and unlike standard web DOM layout), <b>Python Arcade</b> uses the traditional mathematical Cartesian coordinate system:</p>
<ul>
<li>The origin <code>(0, 0)</code> is at the <b>bottom-left corner</b> of the window.</li>
<li><b>X increases to the right</b> (<code>x = 0</code> to <code>width</code>).</li>
<li><b>Y increases upward</b> (<code>y = 0</code> to <code>height</code>).</li>
</ul>
<p>Subclass <code>arcade.Window</code> to create your game canvas and override <code>on_draw(self)</code> to draw each frame.</p>`,
          code: py`
import arcade

class MyGame(arcade.Window):
    def __init__(self, width=800, height=600, title="My Arcade Window"):
        super().__init__(width, height, title)
        arcade.set_background_color(arcade.color.AMAZON)

    def on_draw(self):
        arcade.start_render()
        # Draw a circle in the center of the window (400, 300)
        arcade.draw_circle_filled(400, 300, 50, arcade.color.WHITE)
        arcade.finish_render()

game = MyGame()
game.on_draw()
print(f"Window: {game.width}x{game.height}, title: '{game.title}'")
`,
        },
        {
          type: 'predict',
          title: 'Predict the output: Coordinate Placement',
          code: py`
# Screen dimensions: 800 width, 600 height
center_x = 800 // 2
center_y = 600 // 2
top_right_x = 800
top_right_y = 600
print(f"Center: ({center_x}, {center_y}) | Top-Right: ({top_right_x}, {top_right_y})")
`,
          question: 'Where is coordinate (400, 300) located on an 800x600 Arcade screen?',
          options: [
            'Top-left corner',
            'Exact center of the screen',
            'Bottom-right corner',
            'Off-screen',
          ],
          answer: 1,
          explain: 'Because <code>width = 800</code> and <code>height = 600</code>, coordinates <code>(800//2, 600//2) = (400, 300)</code> pinpoint the exact geometric center.',
        },
        {
          type: 'concept',
          title: 'Drawing Primitives',
          body: `<p>Arcade provides high-performance drawing primitives:</p>
<ul>
<li><code>arcade.draw_circle_filled(center_x, center_y, radius, color)</code></li>
<li><code>arcade.draw_rectangle_filled(center_x, center_y, width, height, color)</code></li>
<li><code>arcade.draw_line(start_x, start_y, end_x, end_y, color, line_width)</code></li>
<li><code>arcade.draw_text(text, start_x, start_y, color, font_size)</code></li>
</ul>`,
          code: py`
import arcade

arcade.start_render()
# Ground
arcade.draw_rectangle_filled(400, 50, 800, 100, arcade.color.GREEN)
# Sun
arcade.draw_circle_filled(700, 500, 40, arcade.color.YELLOW)
# Ray
arcade.draw_line(700, 500, 620, 460, arcade.color.YELLOW, 3)
arcade.finish_render()

print("Primitives rendered successfully!")
`,
        },
        {
          type: 'challenge',
          title: 'Challenge: Game Canvas Scaffold',
          body: `<p>Create a custom <code>GameCanvas</code> window class inheriting from <code>arcade.Window</code>:</p>
<ol>
<li><code>__init__(self, width=800, height=600, title="Python Arcade")</code>:
  <ul>
    <li>Call <code>super().__init__(width, height, title)</code>.</li>
    <li>Set background color using <code>arcade.set_background_color(arcade.color.BLACK)</code>.</li>
    <li>Store <code>self.score = 0</code>.</li>
  </ul>
</li>
<li><code>on_draw(self)</code>:
  <ul>
    <li>Call <code>arcade.start_render()</code>.</li>
    <li>Draw a centered circle with radius <code>30</code> in <code>arcade.color.CYAN</code> at <code>(self.width // 2, self.height // 2)</code>.</li>
    <li>Draw a score line at the bottom: <code>arcade.draw_line(0, 50, self.width, 50, arcade.color.WHITE, 2)</code>.</li>
    <li>Call <code>arcade.finish_render()</code>.</li>
  </ul>
</li>
</ol>`,
          starter: py`
import arcade

class GameCanvas(arcade.Window):
    def __init__(self, width=800, height=600, title="Python Arcade"):
        # TODO: call super() and initialize attributes
        pass

    def on_draw(self):
        # TODO: start_render, draw circle & line, finish_render
        pass
`,
          tests: [
            {
              name: 'Window initializes with proper dimensions and score attribute',
              check: py`
win = GameCanvas(1024, 768, "TestGame")
assert isinstance(win, arcade.Window)
assert win.width == 1024
assert win.height == 768
assert win.title == "TestGame"
assert win.score == 0
`,
            },
            {
              name: 'on_draw calls start_render and primitives',
              check: py`
win = GameCanvas(800, 600)
win.on_draw()
# Verify draw commands recorded in arcade shim
commands = arcade._draw_commands
assert any(c["type"] == "circle_filled" and c["x"] == 400 and c["y"] == 300 and c["radius"] == 30 for c in commands), "Expected centered cyan circle with radius 30"
assert any(c["type"] == "line" and c["y1"] == 50 and c["y2"] == 50 for c in commands), "Expected score boundary line at y=50"
`,
            },
          ],
          hints: [
            'In <code>__init__</code>: call <code>super().__init__(width, height, title)</code>, <code>arcade.set_background_color(arcade.color.BLACK)</code>, and set <code>self.score = 0</code>.',
            'In <code>on_draw</code>: begin with <code>arcade.start_render()</code>.',
            'Draw the circle with <code>arcade.draw_circle_filled(self.width // 2, self.height // 2, 30, arcade.color.CYAN)</code>.',
            'Draw the line with <code>arcade.draw_line(0, 50, self.width, 50, arcade.color.WHITE, 2)</code> and end with <code>arcade.finish_render()</code>.',
          ],
          solution: py`
import arcade

class GameCanvas(arcade.Window):
    def __init__(self, width=800, height=600, title="Python Arcade"):
        super().__init__(width, height, title)
        arcade.set_background_color(arcade.color.BLACK)
        self.score = 0

    def on_draw(self):
        arcade.start_render()
        center_x = self.width // 2
        center_y = self.height // 2
        arcade.draw_circle_filled(center_x, center_y, 30, arcade.color.CYAN)
        arcade.draw_line(0, 50, self.width, 50, arcade.color.WHITE, 2)
        arcade.finish_render()

# Demonstration
canvas = GameCanvas(800, 600)
canvas.on_draw()
print(f"Rendered canvas: {canvas.width}x{canvas.height}")
`,
        },
      ],
    },

    // ─────────────────────────────── 5.2
    {
      id: '5.2',
      title: 'Drawing & Movement',
      emoji: '🕹️',
      minutes: 12,
      steps: [
        {
          type: 'concept',
          title: 'The Game Loop: on_update & on_key_press',
          body: `<p>A game loop repeats continuously 60 times per second (60 FPS):</p>
<ol>
<li><b>Process Input</b>: <code>on_key_press(symbol, modifiers)</code> captures key presses.</li>
<li><b>Update State</b>: <code>on_update(delta_time)</code> moves positions based on velocity (<code>change_x</code>, <code>change_y</code>).</li>
<li><b>Render Frame</b>: <code>on_draw()</code> repaints the new visual state.</li>
</ol>`,
          code: py`
import arcade

class PlayerBall(arcade.Window):
    def __init__(self):
        super().__init__(800, 600, "Moving Ball")
        self.ball_x = 400
        self.ball_y = 300
        self.speed = 5

    def on_key_press(self, symbol, modifiers):
        if symbol == arcade.key.LEFT:
            self.ball_x -= self.speed
        elif symbol == arcade.key.RIGHT:
            self.ball_x += self.speed

    def on_draw(self):
        arcade.start_render()
        arcade.draw_circle_filled(self.ball_x, self.ball_y, 20, arcade.color.YELLOW)
        arcade.finish_render()

player = PlayerBall()
player.on_key_press(arcade.key.RIGHT, 0)
print("Ball moved to x:", player.ball_x)
`,
        },
        {
          type: 'predict',
          title: 'Predict the output: Delta Time & Velocity',
          code: py`
x = 100.0
velocity_x = 60.0  # pixels per second
delta_time = 1 / 60  # 60 FPS frame time (approx 0.01667)

x += velocity_x * delta_time
print(round(x, 1))
`,
          question: 'What is the updated position <code>x</code> after 1 frame?',
          options: ['160.0', '101.0', '100.0', '106.0'],
          answer: 1,
          explain: '<code>velocity_x * delta_time = 60.0 * (1/60) = 1.0</code>. <code>100.0 + 1.0 = 101.0</code>. Multiplying by <code>delta_time</code> ensures frame-rate-independent physics.',
        },
        {
          type: 'quiz',
          title: 'Quiz: Arcade Graphics & Input',
          passScore: 4,
          questions: [
            {
              q: 'Where is coordinate (0, 0) in the Python Arcade window coordinate system?',
              options: [
                'Top-left corner',
                'Center of the screen',
                'Bottom-left corner',
                'Bottom-right corner',
              ],
              answer: 2,
              explain: 'Python Arcade uses a standard Cartesian plane where (0, 0) is situated at the bottom-left corner.',
            },
            {
              q: 'Which method should contain drawing primitives such as <code>draw_circle_filled</code>?',
              options: ['__init__', 'on_draw', 'on_update', 'on_key_press'],
              answer: 1,
              explain: 'All rendering and drawing instructions must reside inside <code>on_draw()</code>.',
            },
            {
              q: 'What is the purpose of passing <code>delta_time</code> to <code>on_update</code>?',
              options: [
                'To measure system temperature',
                'To make movement speed independent of framerate fluctuations',
                'To determine screen resolution',
                'To calculate player score',
              ],
              answer: 1,
              explain: 'Multiplying velocities by <code>delta_time</code> (the fraction of a second since last frame) guarantees identical movement speeds regardless of whether a machine runs at 30, 60, or 144 FPS.',
            },
            {
              q: 'What function is called at the very beginning of <code>on_draw()</code> to wipe the previous frame?',
              options: ['arcade.clear()', 'arcade.start_render()', 'arcade.reset()', 'arcade.flush()'],
              answer: 1,
              explain: '<code>arcade.start_render()</code> clears the window surface using the configured background color to prepare for drawing the new frame.',
            },
            {
              q: 'Which function starts the main Arcade game loop?',
              options: ['arcade.start()', 'arcade.run()', 'arcade.loop()', 'arcade.main()'],
              answer: 1,
              explain: '<code>arcade.run()</code> hands control over to the underlying event loop to handle windows, inputs, updates, and rendering.',
            },
          ],
        },
        {
          type: 'challenge',
          title: 'Challenge: 4-Directional Player Controller',
          body: `<p>Build a <code>ControllablePlayer</code> window class that handles 4-directional motion and boundaries:</p>
<ol>
<li><code>__init__(self, width=800, height=600)</code>:
  <ul>
    <li>Call <code>super().__init__(width, height, "Player Controller")</code>.</li>
    <li>Initialize <code>self.player_x = width // 2</code> and <code>self.player_y = height // 2</code>.</li>
    <li>Initialize velocity: <code>self.change_x = 0</code>, <code>self.change_y = 0</code>.</li>
    <li>Set <code>self.speed = 5</code>.</li>
  </ul>
</li>
<li><code>on_key_press(self, symbol, modifiers)</code>:
  <ul>
    <li><code>arcade.key.LEFT</code>: <code>self.change_x = -self.speed</code></li>
    <li><code>arcade.key.RIGHT</code>: <code>self.change_x = self.speed</code></li>
    <li><code>arcade.key.UP</code>: <code>self.change_y = self.speed</code></li>
    <li><code>arcade.key.DOWN</code>: <code>self.change_y = -self.speed</code></li>
  </ul>
</li>
<li><code>on_key_release(self, symbol, modifiers)</code>:
  <ul>
    <li>If released key is LEFT or RIGHT: reset <code>self.change_x = 0</code>.</li>
    <li>If released key is UP or DOWN: reset <code>self.change_y = 0</code>.</li>
  </ul>
</li>
<li><code>on_update(self, delta_time)</code>:
  <ul>
    <li>Apply motion: <code>self.player_x += self.change_x</code>, <code>self.player_y += self.change_y</code>.</li>
    <li>Clamp to window bounds: keep <code>self.player_x</code> between <code>0</code> and <code>self.width</code>, and <code>self.player_y</code> between <code>0</code> and <code>self.height</code>.</li>
  </ul>
</li>
</ol>`,
          starter: py`
import arcade

class ControllablePlayer(arcade.Window):
    def __init__(self, width=800, height=600):
        # TODO: call super() and initialize coordinates and velocities
        pass

    def on_key_press(self, symbol, modifiers):
        # TODO: set change_x or change_y based on directional keys
        pass

    def on_key_release(self, symbol, modifiers):
        # TODO: stop motion when directional keys are released
        pass

    def on_update(self, delta_time):
        # TODO: update player position and clamp within window bounds
        pass
`,
          tests: [
            {
              name: 'Arrow keys update velocity and position',
              check: py`
game = ControllablePlayer(800, 600)
assert game.player_x == 400
assert game.player_y == 300

# Press RIGHT
game.on_key_press(arcade.key.RIGHT, 0)
assert game.change_x == 5
game.on_update(1/60)
assert game.player_x == 405

# Release RIGHT
game.on_key_release(arcade.key.RIGHT, 0)
assert game.change_x == 0

# Press UP
game.on_key_press(arcade.key.UP, 0)
assert game.change_y == 5
game.on_update(1/60)
assert game.player_y == 305
`,
            },
            {
              name: 'Player is clamped to window boundaries',
              check: py`
game = ControllablePlayer(800, 600)
game.player_x = 798
game.change_x = 10
game.on_update(1/60)
assert game.player_x == 800, f"Expected clamped position 800, got {game.player_x}"

game.player_y = 2
game.change_y = -10
game.on_update(1/60)
assert game.player_y == 0, f"Expected clamped position 0, got {game.player_y}"
`,
            },
          ],
          hints: [
            'Use <code>max(0, min(self.width, self.player_x))</code> to clamp <code>player_x</code> cleanly.',
            'In <code>on_key_release</code>, check <code>if symbol in (arcade.key.LEFT, arcade.key.RIGHT): self.change_x = 0</code>.',
          ],
          solution: py`
import arcade

class ControllablePlayer(arcade.Window):
    def __init__(self, width=800, height=600):
        super().__init__(width, height, "Player Controller")
        self.player_x = width // 2
        self.player_y = height // 2
        self.change_x = 0
        self.change_y = 0
        self.speed = 5

    def on_key_press(self, symbol, modifiers):
        if symbol == arcade.key.LEFT:
            self.change_x = -self.speed
        elif symbol == arcade.key.RIGHT:
            self.change_x = self.speed
        elif symbol == arcade.key.UP:
            self.change_y = self.speed
        elif symbol == arcade.key.DOWN:
            self.change_y = -self.speed

    def on_key_release(self, symbol, modifiers):
        if symbol in (arcade.key.LEFT, arcade.key.RIGHT):
            self.change_x = 0
        elif symbol in (arcade.key.UP, arcade.key.DOWN):
            self.change_y = 0

    def on_update(self, delta_time):
        self.player_x += self.change_x
        self.player_y += self.change_y
        self.player_x = max(0, min(self.width, self.player_x))
        self.player_y = max(0, min(self.height, self.player_y))

game = ControllablePlayer(800, 600)
game.on_key_press(arcade.key.RIGHT, 0)
game.on_update(1/60)
print(f"Player at: ({game.player_x}, {game.player_y})")
`,
        },
      ],
    },

    // ─────────────────────────────── 5.3
    {
      id: '5.3',
      title: 'Project: Generative Screensaver Art',
      emoji: '🌀',
      minutes: 15,
      steps: [
        {
          type: 'concept',
          title: 'Algorithmic Art with Trigonometry',
          body: `<p>Generative art uses mathematical formulas to produce intricate patterns.</p>
<p>By computing polar-to-Cartesian coordinates using sine and cosine:</p>
<pre class="md-code"><code>x = center_x + radius * math.cos(angle)
y = center_y + radius * math.sin(angle)</code></pre>
<p>Connecting multiple rotating vertices or drawing radial petals creates captivating spiral rosettes and harmonic Lissajous curves.</p>`,
          code: py`
import math
import arcade

center_x, center_y = 400, 300
radius = 150
points = []

# Generate a 12-point star pattern
for i in range(12):
    angle = (2 * math.pi / 12) * i
    px = center_x + radius * math.cos(angle)
    py = center_y + radius * math.sin(angle)
    points.append((round(px, 1), round(py, 1)))

print("First 3 vertices:", points[:3])
`,
        },
        {
          type: 'challenge',
          title: 'Project: Generative Spiral Screensaver',
          body: `<p>Build the <code>GenerativeArt</code> engine implementing a dynamic multi-petal rosette screensaver:</p>
<ol>
<li><code>compute_vertex(center_x, center_y, radius, angle_radians)</code>:
  <ul>
    <li>Returns tuple <code>(x, y)</code> calculated with:
      <code>x = center_x + radius * math.cos(angle_radians)</code>,
      <code>y = center_y + radius * math.sin(angle_radians)</code>.</li>
  </ul>
</li>
<li><code>generate_rosette(num_petals, base_radius, center_x=400, center_y=300)</code>:
  <ul>
    <li>Computes <code>num_petals</code> vertices evenly spaced around a full circle (<code>2 * math.pi</code>).</li>
    <li>Returns a list of <code>(x, y)</code> tuples.</li>
  </ul>
</li>
<li><code>GenerativeArtWindow</code> class (subclass of <code>arcade.Window</code>):
  <ul>
    <li><code>__init__(self, width=800, height=600, num_petals=16)</code>: calls <code>super()</code>, sets <code>self.num_petals = num_petals</code>, <code>self.rotation = 0.0</code>, and <code>self.radius = 120.0</code>.</li>
    <li><code>on_update(self, delta_time)</code>: increments <code>self.rotation += 0.5 * delta_time</code>.</li>
    <li><code>on_draw(self)</code>:
      <ul>
        <li>Calls <code>arcade.start_render()</code>.</li>
        <li>Generates the vertices with rotation offset: for <code>i in range(self.num_petals)</code>, <code>angle = (2 * math.pi / self.num_petals) * i + self.rotation</code>.</li>
        <li>Draws lines from center <code>(self.width // 2, self.height // 2)</code> to each computed vertex in <code>arcade.color.CYAN</code>.</li>
        <li>Calls <code>arcade.finish_render()</code>.</li>
      </ul>
    </li>
  </ul>
</li>
</ol>`,
          starter: py`
import math
import arcade

def compute_vertex(center_x, center_y, radius, angle_radians):
    # TODO: return (x, y) using math.cos and math.sin
    return (0.0, 0.0)

def generate_rosette(num_petals, base_radius, center_x=400, center_y=300):
    # TODO: return list of (x, y) tuples evenly distributed
    return []

class GenerativeArtWindow(arcade.Window):
    def __init__(self, width=800, height=600, num_petals=16):
        # TODO: initialize attributes
        pass

    def on_update(self, delta_time):
        # TODO: advance rotation
        pass

    def on_draw(self):
        # TODO: start_render, draw radial lines to vertices, finish_render
        pass
`,
          tests: [
            {
              name: 'compute_vertex trigonometric accuracy',
              check: py`
import math
p0 = compute_vertex(400, 300, 100, 0)
assert round(p0[0], 2) == 500.0 and round(p0[1], 2) == 300.0

p_half_pi = compute_vertex(400, 300, 100, math.pi / 2)
assert round(p_half_pi[0], 2) == 400.0 and round(p_half_pi[1], 2) == 400.0
`,
            },
            {
              name: 'generate_rosette generates exact petal count',
              check: py`
verts = generate_rosette(8, 100, 400, 300)
assert len(verts) == 8, f"Expected 8 vertices, got {len(verts)}"
assert all(isinstance(v, tuple) and len(v) == 2 for v in verts)
`,
            },
            {
              name: 'GenerativeArtWindow update and render calls',
              check: py`
win = GenerativeArtWindow(800, 600, 12)
assert win.rotation == 0.0
win.on_update(1.0)
assert win.rotation == 0.5, f"Expected rotation 0.5, got {win.rotation}"

win.on_draw()
commands = arcade._draw_commands
lines = [c for c in commands if c["type"] == "line"]
assert len(lines) == 12, f"Expected 12 rendered radial lines, got {len(lines)}"
`,
            },
          ],
          hints: [
            'In <code>compute_vertex</code>: return <code>(center_x + radius * math.cos(angle_radians), center_y + radius * math.sin(angle_radians))</code>.',
            'In <code>generate_rosette</code>: use list comprehension <code>[compute_vertex(center_x, center_y, base_radius, (2 * math.pi / num_petals) * i) for i in range(num_petals)]</code>.',
            'In <code>GenerativeArtWindow.on_draw</code>: begin with <code>arcade.start_render()</code>, draw each line from center to vertex using <code>arcade.draw_line(cx, cy, vx, vy, arcade.color.CYAN, 2)</code>, and end with <code>arcade.finish_render()</code>.',
          ],
          solution: py`
import math
import arcade

def compute_vertex(center_x, center_y, radius, angle_radians):
    x = center_x + radius * math.cos(angle_radians)
    y = center_y + radius * math.sin(angle_radians)
    return (x, y)

def generate_rosette(num_petals, base_radius, center_x=400, center_y=300):
    vertices = []
    step = (2 * math.pi) / num_petals
    for i in range(num_petals):
        vertices.append(compute_vertex(center_x, center_y, base_radius, step * i))
    return vertices

class GenerativeArtWindow(arcade.Window):
    def __init__(self, width=800, height=600, num_petals=16):
        super().__init__(width, height, "Generative Art")
        self.num_petals = num_petals
        self.rotation = 0.0
        self.radius = 120.0

    def on_update(self, delta_time):
        self.rotation += 0.5 * delta_time

    def on_draw(self):
        arcade.start_render()
        cx = self.width // 2
        cy = self.height // 2
        step = (2 * math.pi) / self.num_petals
        for i in range(self.num_petals):
            angle = step * i + self.rotation
            vx, vy = compute_vertex(cx, cy, self.radius, angle)
            arcade.draw_line(cx, cy, vx, vy, arcade.color.CYAN, 2)
        arcade.finish_render()

# Demonstration
art = GenerativeArtWindow(800, 600, 12)
art.on_update(1/60)
art.on_draw()
print("Generative screensaver frame rendered!")
`,
        },
      ],
    },
  ],
};
