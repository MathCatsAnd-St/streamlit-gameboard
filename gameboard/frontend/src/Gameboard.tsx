import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib"
import React, { ReactNode } from "react"
import { stringify } from "querystring"

var circle:any= <svg viewBox="-50 -50 100 100" width="100" style={{display: "block", margin: "0px auto", width: "100%"}}><circle r="50"></circle></svg>

interface SquareState {
  player: number
  piece: number
  turn: number
  enabled: boolean
  isFocused: boolean
}

class BoardState extends Array<Array<SquareState>> {
  constructor (rows:number, cols:number) {
    super();
    var board_state : SquareState[][]
    board_state = [[]]
    for (var row: number = 0; row < rows; row++) {
       board_state[row] = []
      for (var col: number = 0; col < cols; col++) {
          const dict: SquareState = { player:0, piece:0, turn:0, enabled:true, isFocused:false}
          board_state[row][col] = dict
      }
    }
    return board_state
  }
}

interface State {
  activePlayer: number
  action: number
  board: BoardState
  turn: number
}

function Piece(props:any) {
  const stroke:string = props.stroke
  const fill:string = props.fill
  return (
    <svg viewBox="0 0 100 100" width="100" style={{display: "block", margin: "0px auto", width: "100%"}} stroke={stroke} fill={fill}>
      {circle}
    </svg>
  )
}

function Square(props:any) {
  const row_num:any = props.row_num
  const col_num:any = props.col_num
  const players:any = props.players
  const board_color:string = props.board_color
  const func:any = props.func
  const square_state:SquareState = props.board_state[row_num][col_num]

  const player:number = square_state["player"]
  const stroke:string = players[player]["stroke"]
  const fill:string = players[player]["fill"]

  if (!square_state.enabled) {
    return (
      <div style={{display: "inline-block", backgroundColor: board_color, height: "50px", width: "50px"}}>
        <div style={{padding:"10%"}}>
          <Piece stroke={stroke} fill={fill}></Piece>
        </div>
      </div>
  )
  }
  return (
      <div onClick={()=>func(row_num,col_num)} style={{display: "inline-block", backgroundColor: board_color, height: "50px", width: "50px"}}>
        <div style={{padding:"10%"}}>
          <Piece stroke={stroke} fill={fill} key={String(row_num)+','+stringify(col_num)}></Piece>
        </div>
      </div>
  );
}

function Row(props:any) {
  const row_num:number = props.row_num
  const cols:number = props.cols
  const players:any = props.players
  const board_color:any = props.board_color
  const func:any = props.func
  const board_state:string = props.board_state

  let RowOfSquares = []
  for (let col_num = 0; col_num < cols; col_num++) {
    RowOfSquares.push(<Square row_num={row_num} col_num={col_num} players={players} board_color={board_color[row_num][col_num]} func={func} board_state={board_state} key={col_num}/>)
  }

  return (
    <div style={{fontSize: "0"}}>
      {RowOfSquares}
    </div>
  );
}

function Stack(props:any) {
  const rows:number = props.rows
  const cols:number = props.cols
  const players:any = props.players
  const board_color:any = props.board_color
  const func:any = props.func
  const board_state:string = props.board_state

  let StackOfRows = []
    for (let row_num = 0; row_num < rows; row_num++) {
      StackOfRows.push(<Row row_num={row_num} cols={cols} players={players} board_color={board_color} func={func} board_state={board_state} key={row_num}></Row>)
    }

  return (
    <div>
      {StackOfRows}
    </div>
  );

}

/**
 * This is a React-based component template. The `render()` function is called
 * automatically when your component should be re-rendered.
 */
class Gameboard extends StreamlitComponentBase<State> {
  
  public state = {activePlayer: 1,
                  action: 1,
                  board_state: new BoardState(this.props.args["rows"],this.props.args["cols"]),
                  turn: 0}

  public render = (): ReactNode => {
    // Arguments passed to the plugin from Python
    
    const rows = this.props.args["rows"]
    const cols = this.props.args["cols"]
    const players: Array<any> = this.props.args["players"]
    const board_color = this.props.args["board_color"]
    const board_state_ss = this.props.args["board_state"]
    const key = this.props.args["key"]
    
    // Check if board_state is being passed back to accomodate manual modification
    if (board_state_ss != null) {
      this.state.board_state = board_state_ss
    }

    // Check if board has been resized
    if (this.state.board_state.length != rows || this.state.board_state[0].length != cols) {
      this.state.board_state = new BoardState(rows,cols)
    }

    // Theme object from Streamlit
    const { theme } = this.props
    const style: React.CSSProperties = {}

    // Maintain compatibility with older versions of Streamlit that don't send
    // a theme object.
    // if (theme) {
    //   // Use the theme object to style our button border. Alternatively, the
    //   // theme style is defined in CSS vars.
    //   const borderStyling = `1px solid ${
    //     this.state.isFocused ? theme.primaryColor : "gray"
    //   }`
    //   style.border = borderStyling
    //   style.outline = borderStyling
    // }

    const width = this.props.width
    // Show the component
    return (
      // <div onClick={this.onClicked}>
      <div>
        <p> The game board is {rows} by {cols}.</p>
        <p style={{color: "red"}}> It is {players[this.state.activePlayer]['name']}'s turn.</p>
          <Stack rows={rows} cols={cols} players={players} board_color={board_color} func={this.onClicked} board_state={this.state.board_state}/>
      </div>

      // <span>
      //   Hello, {name}! &nbsp;
      //   <button
      //     style={style}
      //     onClick={this.onClicked}
      //     disabled={this.props.disabled}
      //     onFocus={this._onFocus}
      //     onBlur={this._onBlur}
      //   >
      //     Click Me!
      //   </button>
      // </span>
    )
  }

  /** Click handler for our "Click Me!" button. */
  private onClicked = (row_num:number=-1,col_num:number=-1): void => {
    // console.log('Clicked')
    // console.log({row_num})
    // console.log({col_num})
    // console.log(this.state.board_state[row_num][col_num])

    const num_players = Object.keys(this.props.args["players"]).length - 1
    const dict: SquareState = { player:this.state.activePlayer, piece:0, turn:this.state.turn, enabled:false, isFocused:false}

    // console.log({num_players})
    // console.log({dict})

    this.state.board_state[row_num].splice(col_num,1,dict)

    this.setState(
      prevState => ({ turn: prevState.turn + 1 , 
                      activePlayer: (prevState.activePlayer % num_players) + 1}),
      () => Streamlit.setComponentValue(this.state.board_state)
    )
  }


  // /** Focus handler for our "Click Me!" button. */
  // private _onFocus = (): void => {
  //   this.setState({ isFocused: true })
  // }

  // /** Blur handler for our "Click Me!" button. */
  // private _onBlur = (): void => {
  //   this.setState({ isFocused: false })
  // }
}

// "withStreamlitConnection" is a wrapper function. It bootstraps the
// connection between your component and the Streamlit app, and handles
// passing arguments from Python -> Component.
//
// You don't need to edit withStreamlitConnection (but you're welcome to!).
export default withStreamlitConnection(Gameboard)
