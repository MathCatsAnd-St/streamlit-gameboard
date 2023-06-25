import os
import streamlit.components.v1 as components
import numpy as np
import streamlit as st
import re
import time

_RELEASE = True

if not _RELEASE:
    _gameboard = components.declare_component(
        "gameboard",
        url="http://localhost:3001",
    )
else:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend/build")
    _gameboard = components.declare_component("gameboard", path=build_dir)

def validate_color(color):
    if re.match("^#(?:[A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$", color):
        return True
    else:
        return False

def validate_players(player_dict):
    try:
        players = list(player_dict.keys())
        colors = list(player_dict.values())
    except:
        raise ValueError("Unable to unpack player dictionary. "\
            "Unable to extract keys (players) and/or values (colors).")
    if len(players) < 1:
        raise ValueError("Player dictionary is empty. There needs to be at least one player.")
    formatted_dict = dict()
    for i in range(len(players)):
        color = colors[i]
        if type(color) == str and validate_color(color):
            formatted_dict[i+1]={'name':str(players[i]),'stroke':color,'fill':color}
        elif len(color) == 2 and \
            type(color[0]) == str and validate_color(color[0]) and \
            type(color[1]) == str and validate_color(color[1]):
            formatted_dict[i+1]={'name':str(players[i]),'stroke':color[0],'fill':color[1]}
        else:
            raise ValueError("Color needs to be a hex string or list of two hex " \
                "strings for each player. e.g. '#3A5683' or '#73956F'")
    formatted_dict[0] = {'name':'','stroke':'#00000000', 'fill':'#00000000'}
    return formatted_dict

def validate_board_color(board_color, rows, cols):
    if board_color == None:
        board_color = np.full((rows,cols),'#FFFFFF00')
    elif type(board_color) == str and validate_color(board_color):
        board_color = np.full((rows,cols), board_color)
    elif type(board_color) == list:
        if len(board_color) == 2 and \
            type(board_color[0]) == str and validate_color(board_color[0]) and \
            type(board_color[1]) == str and validate_color(board_color[1]):
            solid = np.full((rows,cols),board_color[0])
            for index, values in np.ndenumerate(solid):
                if sum(index)%2 == 1:
                    solid[index] = board_color[1]
            board_color = solid
        else:
            st.write(len(board_color))
            st.write(type(board_color[0]))
            st.write(validate_color(board_color[0]))
            st.write(type(board_color[1]))
            st.write(validate_color(board_color[1]))
            raise ValueError("Invalid board color list. %s" % board_color)
    elif type(board_color) == np.array and board_color.shape == (rows,cols):
        for color in board_color:
            if not validate_color(color):
                raise ValueError(f"There is an invalid color specified in the "\
                    "board_color array: {color}")
    return board_color.tolist()

def DEFAULT(rows, cols):
    default = []
    for row in range(rows):
        row_list = []
        for col in range(cols):
            row_list.append({"player":0,"piece":0,"turn":0,"enabled":True,"isFocused":False})
        default.append(row_list)
    return default

PLAYERS = {'Player 1':"#3A5683",'Player 2':"#73956F"}
BOARD_COLOR = ['#FFFFFF','#000000']

def gameboard(rows:int, cols:int, players:dict=PLAYERS, board_color=BOARD_COLOR, board_state=None, key=None):
    """Create a new instance of "gameboard".

    Parameters
    ----------
    rows: int
        The number of rows on the gameboard.
    cols: int
        The number of columns on the gameboard.
    key: str or None
        An optional key that uniquely identifies this component. If this is
        None, and the component's arguments are changed, the component will
        be re-mounted in the Streamlit frontend and lose its current state.

    Returns
    -------
    np.array
        An array representing the current gameboard state.

    """

    players=validate_players(players)
    board_color=validate_board_color(board_color,rows,cols)

    component_value = _gameboard(rows=rows, cols=cols, players=players, 
                                 board_color=board_color, board_state = board_state, key=key, 
                                 default=board_state)        

    return component_value


# Test code for during development
if not _RELEASE:
    import streamlit as st

    st.subheader("Component with constant args")
    my_board = gameboard(3,3, key='tictactoe')

    st.markdown("---")

    st.subheader("Component with variable args")

    with st.expander('Board Parameters'):
        columns = st.columns(3)
        with columns[0]:
            rows = st.slider('Rows',1,10,3,key='rows')
            cols = st.slider('Columns',1,10,3,key='cols')
        with columns[1]:
            colorA = st.color_picker('First Color', "#FFFFFF")
            alphaA = st.slider("First Alpha", 0, 255, 255)
        with columns[2]:
            colorB = st.color_picker('Second Color', "#000000")
            alphaB = st.slider("Second Alpha", 0, 255, 255)
    
    with st.expander('Player Parameters'):
        columns = st.columns(3)
        with columns[0]:
            player1 = st.text_input('Player 1', value='Player 1')
            player2 = st.text_input('Player 2', value='Player 2')
        with columns[1]:
            color1 = st.color_picker('Player 1 Color', "#3A5683")
            alpha1 = st.slider("Player 1 Alpha", 0, 255, 255)
        with columns[2]:
            color2 = st.color_picker('Player 2 Color', "#73956F")
            alpha2 = st.slider("Player 2 Alpha", 0, 255, 255)


    board_color = [colorA+f'{alphaA:02x}', colorB+f'{alphaB:02x}']
    board_color = [color.upper() for color in board_color]

    color1 = color1+f'{alpha1:02x}'
    color1 = color1.upper()

    color2 = color2+f'{alpha2:02x}'
    color2 = color2.upper()

    players = {player1:color1,player2:color2}

    def clear(row,col):
        st.session_state.abstract[row][col]=({"player":0,"piece":0,"turn":0,"enabled":True,"isFocused":False})

    if 'abstract' not in st.session_state:
        st.session_state.abstract = DEFAULT(rows,cols)
    with st.expander('Session State'):
        st.session_state.abstract
    my_board = gameboard(rows, cols, players=players, board_color=board_color,board_state=st.session_state.abstract, key="abstract")
    columns = st.columns(3)
    row_clear = columns[0].number_input('Row',1,rows)
    col_clear = columns[1].number_input('Column',1,cols)
    columns[2].button('Clear', on_click=clear, args=(row_clear-1,col_clear-1))
    with st.expander('Session State'):
        st.session_state.abstract
