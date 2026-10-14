// Week 6 lesson content: Game Development Capstone.
// Step types: concept | predict | challenge | quiz
// Python code uses the `py` tag (String.raw + trim) so backslashes stay intact.

const py = (s, ...v) => String.raw(s, ...v).replace(/^\n/, '').replace(/\s+$/, '') + '\n';

export const week6 = {
  id: 6,
  title: 'Game Dev Capstone',
  lessons: [
    // ─────────────────────────────── 6.1
    {
      id: '6.1',
      title: 'Sprites & SpriteLists',
      emoji: '👾',
      minutes: 10,
      steps: [
        {
          type: 'concept',
          title: 'Batch Rendering with Sprites',
          body: `<p>In real 2D games, rendering hundreds of objects individually is slow. Arcade provides <b><code>arcade.Sprite</code></b> and <b><code>arcade.SpriteList</code></b> for hardware-accelerated batch rendering.</p>
<ul>
<li><code>Sprite</code>: An object with <code>center_x</code>, <code>center_y</code>, <code>change_x</code>, <code>change_y</code>, and collision bounds.</li>
<li><code>SpriteList</code>: A container that updates and draws all contained sprites in a single GPU draw call.</li>
</ul>`,
          code: py`
import arcade

player = arcade.Sprite(scale=1.0, center_x=100, center_y=150)
player.change_x = 2.0

coins = arcade.SpriteList()
for i in range(5):
    coin = arcade.Sprite(scale=0.5, center_x=200 + i * 50, center_y=150)
    coins.append(coin)

print("Coins in list:", len(coins))
player.update()
print(f"Player advanced to ({player.center_x}, {player.center_y})")
`,
        },
        {
          type: 'predict',
          title: 'Predict the output: Axis-Aligned Bounding Box (AABB)',
          code: py`
import arcade

s1 = arcade.Sprite(scale=1.0, center_x=100, center_y=100)
s1.width, s1.height = 32, 32

s2 = arcade.Sprite(scale=1.0, center_x=120, center_y=100)
s2.width, s2.height = 32, 32

# Distance between centers is 20. Sum of half-widths is 16 + 16 = 32.
collides = arcade.check_for_collision(s1, s2)
print("Collision:", collides)
`,
          question: 'Do <code>s1</code> and <code>s2</code> collide?',
          options: ['True', 'False', 'None', 'TypeError'],
          answer: 0,
          explain: 'Because the distance between centers (<code>20</code>) is strictly less than the combined half-widths (<code>32</code>) and Y is aligned, their bounding boxes overlap (<b>True</b>).',
        },
        {
          type: 'challenge',
          title: 'Challenge: Coin Collection Manager',
          body: `<p>Build the coin collection mechanic for our game:</p>
<ol>
<li><code>spawn_coin_row(start_x, y, count, spacing=40)</code>:
  <ul>
    <li>Creates and returns an <code>arcade.SpriteList()</code>.</li>
    <li>Appends <code>count</code> coins placed at <code>x = start_x + (i * spacing)</code> and <code>center_y = y</code> with <code>scale=0.5</code>.</li>
  </ul>
</li>
<li><code>collect_coins(player_sprite, coin_list)</code>:
  <ul>
    <li>Finds all coins colliding with <code>player_sprite</code> using <code>arcade.check_for_collision_with_list(player_sprite, coin_list)</code>.</li>
    <li>Removes each collected coin from <code>coin_list</code>.</li>
    <li>Returns the number of coins collected.</li>
  </ul>
</li>
</ol>`,
          starter: py`
import arcade

def spawn_coin_row(start_x, y, count, spacing=40):
    # TODO: populate and return an arcade.SpriteList of coins
    return arcade.SpriteList()

def collect_coins(player_sprite, coin_list):
    # TODO: detect collisions, remove collected coins, return count
    return 0
`,
          tests: [
            {
              name: 'spawn_coin_row creates exact count at spaced positions',
              check: py`
coins = spawn_coin_row(100, 200, 4, spacing=50)
assert isinstance(coins, arcade.SpriteList)
assert len(coins) == 4
assert [c.center_x for c in coins] == [100.0, 150.0, 200.0, 250.0]
assert all(c.center_y == 200.0 for c in coins)
`,
            },
            {
              name: 'collect_coins removes touched coins and returns count',
              check: py`
coins = spawn_coin_row(100, 100, 3, spacing=40)
player = arcade.Sprite(scale=1.0, center_x=105, center_y=100)

collected = collect_coins(player, coins)
assert collected == 1, f"Expected 1 coin collected, got {collected}"
assert len(coins) == 2, f"Expected 2 remaining coins, got {len(coins)}"
assert coins[0].center_x == 140.0
`,
            },
          ],
          hints: [
            'In <code>spawn_coin_row</code>: loop <code>for i in range(count): coin = arcade.Sprite(scale=0.5, center_x=start_x + i * spacing, center_y=y); coin_list.append(coin)</code>.',
            'In <code>collect_coins</code>: call <code>hits = arcade.check_for_collision_with_list(player_sprite, coin_list)</code>. Loop <code>for c in hits: coin_list.remove(c)</code> and return <code>len(hits)</code>.',
          ],
          solution: py`
import arcade

def spawn_coin_row(start_x, y, count, spacing=40):
    coin_list = arcade.SpriteList()
    for i in range(count):
        coin = arcade.Sprite(scale=0.5, center_x=start_x + (i * spacing), center_y=y)
        coin_list.append(coin)
    return coin_list

def collect_coins(player_sprite, coin_list):
    hit_list = arcade.check_for_collision_with_list(player_sprite, coin_list)
    for coin in hit_list:
        coin_list.remove(coin)
    return len(hit_list)

# Demo run
coins = spawn_coin_row(100, 100, 5)
player = arcade.Sprite(scale=1.0, center_x=100, center_y=100)
count = collect_coins(player, coins)
print(f"Collected: {count}, Remaining: {len(coins)}")
`,
        },
      ],
    },

    // ─────────────────────────────── 6.2
    {
      id: '6.2',
      title: 'Physics & Collision Engine',
      emoji: '🧱',
      minutes: 12,
      steps: [
        {
          type: 'concept',
          title: 'PhysicsEngineSimple & Wall Collision',
          body: `<p>In platformers, players should stand on floors and bump into walls instead of passing right through them.</p>
<p>Arcade's <code>PhysicsEngineSimple(player, walls)</code> automatically prevents the player sprite from penetrating walls.</p>`,
          code: py`
import arcade

player = arcade.Sprite(scale=1.0, center_x=100, center_y=100)
walls = arcade.SpriteList()

# Ground platform at (100, 68) with height 32
floor = arcade.Sprite(scale=1.0, center_x=100, center_y=68)
walls.append(floor)

physics = arcade.PhysicsEngineSimple(player, walls)
player.change_y = -5.0  # gravity pull
physics.update()
print("Player settled at y:", player.center_y)
`,
        },
        {
          type: 'predict',
          title: 'Predict the output: Jump Impulse & Gravity',
          code: py`
vy = 12.0      # Jump impulse
gravity = 1.0  # Downward pull per frame

# Simulate 3 frames of flight
for frame in range(3):
    vy -= gravity

print("Velocity after 3 frames:", vy)
`,
          question: 'What is the value of <code>vy</code> after 3 frames?',
          options: ['12.0', '15.0', '9.0', '0.0'],
          answer: 2,
          explain: 'Starting at <code>12.0</code>, gravity subtracts <code>1.0</code> per frame: <code>12 - 1 - 1 - 1 = 9.0</code>.',
        },
        {
          type: 'quiz',
          title: 'Quiz: 2D Game Mechanics & Physics',
          passScore: 4,
          questions: [
            {
              q: 'What does AABB stand for in game collision detection?',
              options: [
                'Axis-Aligned Bounding Box',
                'Advanced Arcade Binary Buffer',
                'Asynchronous Audio Base Band',
                'Array Allocated Bit Block',
              ],
              answer: 0,
              explain: 'AABB stands for Axis-Aligned Bounding Box — a fast rectangular collision test where rectangle edges align with screen coordinate axes.',
            },
            {
              q: 'Why are sprites grouped into a <code>SpriteList</code> rather than a standard Python list?',
              options: [
                'To encrypt game graphics',
                'To enable batch drawing on the GPU with minimal draw calls',
                'Because standard Python lists cannot hold objects',
                'To automatically sort sprites alphabetically',
              ],
              answer: 1,
              explain: '<code>SpriteList</code> batches sprite textures and vertex coordinates into vertex buffers for high-speed GPU rendering.',
            },
            {
              q: 'How is a jump typically triggered in platformer games?',
              options: [
                'By decreasing the player height attribute',
                'By giving the player an instantaneous positive vertical velocity (change_y)',
                'By reloading the level map',
                'By changing the background color to white',
              ],
              answer: 1,
              explain: 'Jumping applies an upward vertical impulse: <code>self.player.change_y = JUMP_SPEED</code>.',
            },
            {
              q: 'What role does <code>arcade.PhysicsEngineSimple</code> fulfill?',
              options: [
                'It generates 3D lighting shaders',
                'It stops player sprites from walking through solid walls and platforms',
                'It downloads sprite assets from the internet',
                'It plays background music files',
              ],
              answer: 1,
              explain: 'It handles discrete collision resolution between the player and obstacles, clamping penetration to keep the player on top of surfaces.',
            },
            {
              q: 'What should happen to coin sprites when collected by a player?',
              options: [
                'They should multiply by two',
                'They should be removed from the active coin SpriteList to stop rendering and collisions',
                'The window should close immediately',
                'They should reverse player direction',
              ],
              answer: 1,
              explain: 'Calling <code>coin_list.remove(coin)</code> or <code>coin.kill()</code> removes it from rendering and collision evaluation.',
            },
          ],
        },
        {
          type: 'challenge',
          title: 'Challenge: Platformer Jump Physics Controller',
          body: `<p>Implement a platformer gravity controller class <code>PlatformController</code>:</p>
<ol>
<li><code>__init__(self, jump_speed=12.0, gravity=0.8)</code>:
  <ul>
    <li>Stores float <code>self.jump_speed</code> and <code>self.gravity</code>.</li>
    <li>Initializes <code>self.can_jump = True</code>.</li>
  </ul>
</li>
<li><code>jump(self, player_sprite)</code>:
  <ul>
    <li>If <code>self.can_jump</code> is True: set <code>player_sprite.change_y = self.jump_speed</code>, set <code>self.can_jump = False</code>, and return <code>True</code>.</li>
    <li>Otherwise, return <code>False</code>.</li>
  </ul>
</li>
<li><code>apply_gravity(self, player_sprite, floor_y=100.0)</code>:
  <ul>
    <li>Subtract <code>self.gravity</code> from <code>player_sprite.change_y</code>.</li>
    <li>Update position: <code>player_sprite.center_y += player_sprite.change_y</code>.</li>
    <li>If <code>player_sprite.center_y &lt;= floor_y</code>: clamp <code>player_sprite.center_y = floor_y</code>, set <code>player_sprite.change_y = 0.0</code>, and restore <code>self.can_jump = True</code>.</li>
  </ul>
</li>
</ol>`,
          starter: py`
import arcade

class PlatformController:
    def __init__(self, jump_speed=12.0, gravity=0.8):
        # TODO: initialize attributes
        pass

    def jump(self, player_sprite):
        # TODO: apply jump if can_jump
        return False

    def apply_gravity(self, player_sprite, floor_y=100.0):
        # TODO: apply gravity, update pos, clamp on floor, reset can_jump
        pass
`,
          tests: [
            {
              name: 'Jump triggers and prevents mid-air double jump',
              check: py`
player = arcade.Sprite(scale=1.0, center_x=100, center_y=100)
ctrl = PlatformController(jump_speed=10.0, gravity=1.0)

ok1 = ctrl.jump(player)
assert ok1 is True
assert player.change_y == 10.0
assert ctrl.can_jump is False

# Double jump attempt while in air
ok2 = ctrl.jump(player)
assert ok2 is False
assert player.change_y == 10.0
`,
            },
            {
              name: 'Gravity decreases velocity and lands smoothly on floor',
              check: py`
player = arcade.Sprite(scale=1.0, center_x=100, center_y=100)
ctrl = PlatformController(jump_speed=10.0, gravity=2.0)
ctrl.jump(player)

# Frame 1: change_y = 10 - 2 = 8, pos = 100 + 8 = 108
ctrl.apply_gravity(player, floor_y=100.0)
assert player.change_y == 8.0
assert player.center_y == 108.0

# Multiple frames until landing
for _ in range(10):
    ctrl.apply_gravity(player, floor_y=100.0)

assert player.center_y == 100.0
assert player.change_y == 0.0
assert ctrl.can_jump is True
`,
            },
          ],
          hints: [
            'In <code>jump</code>: check <code>if self.can_jump: player_sprite.change_y = self.jump_speed; self.can_jump = False; return True</code>.',
            'In <code>apply_gravity</code>: <code>player_sprite.change_y -= self.gravity</code>, add to <code>player_sprite.center_y</code>, and if below floor, clamp and set <code>self.can_jump = True</code>.',
          ],
          solution: py`
import arcade

class PlatformController:
    def __init__(self, jump_speed=12.0, gravity=0.8):
        self.jump_speed = float(jump_speed)
        self.gravity = float(gravity)
        self.can_jump = True

    def jump(self, player_sprite):
        if self.can_jump:
            player_sprite.change_y = self.jump_speed
            self.can_jump = False
            return True
        return False

    def apply_gravity(self, player_sprite, floor_y=100.0):
        player_sprite.change_y -= self.gravity
        player_sprite.center_y += player_sprite.change_y
        if player_sprite.center_y <= floor_y:
            player_sprite.center_y = floor_y
            player_sprite.change_y = 0.0
            self.can_jump = True

# Demo run
p = arcade.Sprite(center_x=100, center_y=100)
ctrl = PlatformController()
ctrl.jump(p)
ctrl.apply_gravity(p)
print(f"Airborne: center_y={p.center_y}, change_y={p.change_y}")
`,
        },
      ],
    },

    // ─────────────────────────────── 6.3
    {
      id: '6.3',
      title: 'Project: 2D Platformer Capstone',
      emoji: '🏆',
      minutes: 15,
      steps: [
        {
          type: 'concept',
          title: 'Full Game Loop Architecture',
          body: `<p>A complete 2D platformer coordinates multiple systems:</p>
<ol>
<li><b>Game State</b>: <code>score</code>, <code>lives</code>, <code>game_over</code>, <code>won</code>.</li>
<li><b>Sprite Management</b>: <code>player</code>, <code>walls</code>, <code>coins</code>, <code>enemies</code>.</li>
<li><b>Collision Resolution</b>: Collecting coins updates score; touching hazards costs lives.</li>
<li><b>Win Condition</b>: When all coins in the level are gathered!</li>
</ol>`,
          code: py`
# Architecture preview:
# PlatformerGame:
# - setup(): initialize lists, player, platforms, coins
# - on_update(): physics update, coin collection, hazard check
# - on_key_press(): jump and horizontal movement
`,
        },
        {
          type: 'challenge',
          title: 'Project: The Platformer Engine',
          body: `<p>Build the full engine for our <b>2D Platformer Capstone</b>:</p>
<ol>
<li><code>PlatformerEngine</code> class (subclass of <code>arcade.Window</code>):
  <ul>
    <li><code>__init__(self, width=800, height=600)</code>:
      <ul>
        <li>Calls <code>super().__init__(width, height, "Platformer Capstone")</code>.</li>
        <li>Initializes <code>self.score = 0</code>, <code>self.lives = 3</code>, <code>self.game_over = False</code>, <code>self.won = False</code>.</li>
        <li>Calls <code>self.setup()</code>.</li>
      </ul>
    </li>
    <li><code>setup(self)</code>:
      <ul>
        <li>Initializes <code>self.player = arcade.Sprite(scale=1.0, center_x=100, center_y=150)</code>.</li>
        <li>Initializes <code>self.walls = arcade.SpriteList()</code> and appends a floor platform at <code>(400, 50)</code> with <code>width=800</code>, <code>height=100</code>.</li>
        <li>Initializes <code>self.coins = arcade.SpriteList()</code>.</li>
        <li>Initializes <code>self.enemies = arcade.SpriteList()</code>.</li>
        <li>Initializes <code>self.physics_engine = arcade.PhysicsEngineSimple(self.player, self.walls)</code>.</li>
      </ul>
    </li>
    <li><code>add_coin(self, x, y)</code>: appends an <code>arcade.Sprite(scale=0.5, center_x=x, center_y=y)</code> to <code>self.coins</code>.</li>
    <li><code>add_enemy(self, x, y)</code>: appends an <code>arcade.Sprite(scale=1.0, center_x=x, center_y=y)</code> to <code>self.enemies</code>.</li>
    <li><code>update_game(self)</code>:
      <ul>
        <li>If <code>self.game_over</code> or <code>self.won</code>, do nothing.</li>
        <li>Update <code>self.physics_engine.update()</code>.</li>
        <li>Check coin collisions with <code>arcade.check_for_collision_with_list(self.player, self.coins)</code>. For each hit coin: remove from <code>self.coins</code> and increment <code>self.score += 10</code>.</li>
        <li>If <code>len(self.coins) == 0</code> and <code>self.score &gt; 0</code>: set <code>self.won = True</code>.</li>
        <li>Check enemy collisions with <code>arcade.check_for_collision_with_list(self.player, self.enemies)</code>. If touched: decrement <code>self.lives -= 1</code>, and if <code>self.lives &lt;= 0</code>, set <code>self.game_over = True</code>.</li>
      </ul>
    </li>
  </ul>
</li>
</ol>`,
          starter: py`
import arcade

class PlatformerEngine(arcade.Window):
    def __init__(self, width=800, height=600):
        # TODO: call super, set initial state, and call setup()
        pass

    def setup(self):
        # TODO: initialize player, walls, coins, enemies, physics_engine
        pass

    def add_coin(self, x, y):
        # TODO: append coin to self.coins
        pass

    def add_enemy(self, x, y):
        # TODO: append enemy to self.enemies
        pass

    def update_game(self):
        # TODO: update physics, collect coins, check enemies, handle win/lose
        pass
`,
          tests: [
            {
              name: 'Engine initializes player, platforms, and default state',
              check: py`
game = PlatformerEngine(800, 600)
assert game.score == 0
assert game.lives == 3
assert game.game_over is False
assert game.won is False
assert isinstance(game.player, arcade.Sprite)
assert isinstance(game.walls, arcade.SpriteList)
assert len(game.walls) == 1
`,
            },
            {
              name: 'Collecting all coins updates score and triggers win state',
              check: py`
game = PlatformerEngine(800, 600)
game.add_coin(100, 150)
game.add_coin(100, 150)
assert len(game.coins) == 2

game.update_game()
assert len(game.coins) == 0, "Coins touching player should be removed"
assert game.score == 20, f"Expected score 20, got {game.score}"
assert game.won is True, "Game should be won after collecting all coins"
`,
            },
            {
              name: 'Enemy collision reduces lives and triggers game over',
              check: py`
game = PlatformerEngine(800, 600)
game.add_coin(500, 500)  # Uncollected coin
game.add_enemy(100, 150) # Colliding with player

game.update_game()
assert game.lives == 2
assert game.game_over is False

# Two more hits trigger game over
game.update_game()
game.update_game()
assert game.lives == 0
assert game.game_over is True
`,
            },
          ],
          hints: [
            'In <code>setup</code>: assign <code>self.player = arcade.Sprite(scale=1.0, center_x=100, center_y=150)</code> and ground block in <code>self.walls</code>.',
            'In <code>update_game</code>: check <code>hit_coins = arcade.check_for_collision_with_list(self.player, self.coins)</code>. Remove each and add 10 to score.',
            'If <code>len(self.coins) == 0 and self.score > 0: self.won = True</code>.',
            'Check enemies with <code>hit_enemies = arcade.check_for_collision_with_list(self.player, self.enemies)</code>; if hit, decrement <code>self.lives -= 1</code> and set <code>game_over = True</code> if <code>self.lives <= 0</code>.',
          ],
          solution: py`
import arcade

class PlatformerEngine(arcade.Window):
    def __init__(self, width=800, height=600):
        super().__init__(width, height, "Platformer Capstone")
        self.score = 0
        self.lives = 3
        self.game_over = False
        self.won = False
        self.setup()

    def setup(self):
        self.player = arcade.Sprite(scale=1.0, center_x=100, center_y=150)
        self.walls = arcade.SpriteList()
        floor = arcade.Sprite(scale=1.0, center_x=400, center_y=50)
        floor.width = 800
        floor.height = 100
        self.walls.append(floor)

        self.coins = arcade.SpriteList()
        self.enemies = arcade.SpriteList()
        self.physics_engine = arcade.PhysicsEngineSimple(self.player, self.walls)

    def add_coin(self, x, y):
        coin = arcade.Sprite(scale=0.5, center_x=float(x), center_y=float(y))
        self.coins.append(coin)

    def add_enemy(self, x, y):
        enemy = arcade.Sprite(scale=1.0, center_x=float(x), center_y=float(y))
        self.enemies.append(enemy)

    def update_game(self):
        if self.game_over or self.won:
            return

        self.physics_engine.update()

        # Coin collection
        hit_coins = arcade.check_for_collision_with_list(self.player, self.coins)
        for coin in hit_coins:
            self.coins.remove(coin)
            self.score += 10

        if len(self.coins) == 0 and self.score > 0:
            self.won = True

        # Hazard check
        hit_enemies = arcade.check_for_collision_with_list(self.player, self.enemies)
        if hit_enemies:
            self.lives -= 1
            if self.lives <= 0:
                self.game_over = True

# Demo execution
game = PlatformerEngine(800, 600)
game.add_coin(100, 150)
game.update_game()
print(f"Game State -> Score: {game.score}, Lives: {game.lives}, Won: {game.won}")
`,
        },
      ],
    },
  ],
};
