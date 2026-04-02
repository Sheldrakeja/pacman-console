import os
from flask import Flask, render_template, jsonify, request
import json
from objects.game_box import GameBox
from objects.character import Character
from objects.character_progression import CharacterProgression
from objects.color import Color

app = Flask(__name__, template_folder='templates', static_folder='static')

game_state = {
    'map_matrix': [],
    'pacman_pos': [0, 0],
    'ghosts': [],
    'food_count': 0,
    'score': 0,
    'lives': 3,
    'game_over': False,
    'won': False
}

chars = {
    'wall': '#',
    'space': ' ',
    'door': '=',
    'food': '.',
    'pacman': 'C',
    'ghost': 'G'
}

colors = {
    'wall': 1,
    'space': 2,
    'door': 3,
    'food': 4,
    'pacman': 5,
    'ghost': 6
}

def load_map():
    map_file = 'maps/map.txt'
    map_matrix = []
    with open(map_file) as f:
        for line in f:
            map_matrix.append(list(line.rstrip('\n')))
    return map_matrix

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/game/state')
def get_game_state():
    map_matrix = load_map()
    return jsonify({
        'map': map_matrix,
        'pacman': game_state['pacman_pos'],
        'ghosts': game_state['ghosts'],
        'food_count': game_state['food_count'],
        'score': game_state['score'],
        'lives': game_state['lives'],
        'game_over': game_state['game_over'],
        'won': game_state['won']
    })

@app.route('/api/game/move', methods=['POST'])
def move_pacman():
    data = request.json
    direction = data.get('direction')

    game_state['score'] += 10

    return jsonify({'success': True, 'state': game_state})

@app.route('/api/game/reset', methods=['POST'])
def reset_game():
    game_state['pacman_pos'] = [1, 1]
    game_state['score'] = 0
    game_state['lives'] = 3
    game_state['game_over'] = False
    game_state['won'] = False
    game_state['ghosts'] = [[5, 5], [6, 6], [7, 7]]

    return jsonify({'success': True})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
