import React, { Component } from 'react';
import Board from "react-chess";

import engine from "chess.js";

class App extends Component {

  movesFromHash(hash) {
    try{
    return window.atob(hash.slice(1))
      .split('|')
        .filter(x=>x!='');
    } catch (e) {
      return [];
    }
  }

  getEngine(moves) {
    const chess = new engine();
    for (const move of moves) {
      chess.move(move);
    }
    return chess;
  }

  fields(chess) {
    return chess.SQUARES
      .map( k => [k, chess.get(k)])
      .filter( ([k, v]) => v)
      .map( ([k, {type, color}]) => [k, `${(color=='w')? type.toUpperCase() : type}`])
  }

  pieces(chess) {
    return this.fields(chess).map( ([k, v]) => `${v}@${k}`);
  }

  history() {
    return this.state.history.slice(0, this.state.history.length-this.state.undo);
  }


  constructor(props) {
    super(props);

    const chess = this.getEngine(
      this.movesFromHash(props.state)
    );

    this.state = {
      history: chess.history(),
      undo: 0 
    };
  }

  componentWillMount() {
    this.listener = window.addEventListener('popstate', () => {
      console.log(window.location.hash);
      const moves = this.movesFromHash(window.location.hash);
      if (moves.every( (m, i) => this.state.history[i] == m )) {
        this.setState({undo: this.state.history.length - moves.length});
      } else {
        this.setState({history: moves, undo:0});
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener(this.listener);
  }

  renderState(chess) {
    const check = chess.in_check(); 
    const gameOver = chess.game_over(); 
    const turn = chess.turn() =="w"? "white's turn" : "black's turn";

    if (gameOver) {
      return <div> {chess.turn()=="w"? "Black Won" : "White Won"}  </div>
    }

    if (check) {
      return <div>
        <div> {turn} - you are in Check! </div>
      </div>
    }

    return <div> {turn} </div>
  }

  render() {
    const chess = this.getEngine(this.history());

    return (
      <div className="App" style={{
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "stretch",
        alignItems: "center",
      }}>
        <div style={{textAlign:"center"}}> serverless chess </div>
        {this.renderState(chess)}
        <div style={{
          display:"flex",
          justifyContent: "stretch",
          alignItems: "stretch",
          flexDirection: "row",
          flex: 1,
          minWidth: "300px",
          minHeight:"300px",
          height: "90vh",
          width: "90vh",
          maxHeight: "90vh",
          maxWidth: "90vh"
        }}>

        <Board 
          pieces={this.state.error? [] : this.pieces(chess)}
          onMovePiece={ (piece, from, to) => {
            const chess = this.getEngine(this.history());
            const move = `${piece.name}${from}-${to}`;
            const m = chess.move(move,  {sloppy: true});

            if (!m) this.setState({error: true});

            setTimeout(() => this.setState({
              history: chess.history(),
              undo: 0,
              error: false
            }));

            window.location.hash = window.btoa(chess.history().join('|'));
          }}

          onDragStart={ (piece, from) => {
            return (piece.name.toUpperCase() == piece.name) == (chess.turn() == 'w');
          }}/>

        <div style={{height:"100%"}}>
          <h2> History </h2> 
          <ol style={{overflow:"auto", height:"80%"}}>
            {this.state.history.map((move, i) =>
            <li key={i} 
              style={ 
                (this.state.history.length-i-1 == this.state.undo)
                ? {color:'green'} 
                : {}
              }
              onMouseEnter={()=>{
                this.setState({undo: this.state.history.length-i-1})
                setTimeout(()=>window.location.hash = window.btoa(this.history(chess).join('|')));
              }}>
                {move} 
              </li>
            )}
          </ol>
        </div>
      </div>
    </div>
    );
  }
}

export default App;
