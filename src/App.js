import React, { Component } from 'react';
import Board from "react-chess";
import logo from './logo.svg';

const engine = require("chess.js");




class App extends Component {
  constructor(){
    super();

    const hash = window.location.hash.slice(1);
    const fen = (hash!='')? window.atob(hash) : undefined;
    
    this.chess = new engine(fen);
    this.fields = () => {
      return this.chess.SQUARES
        .map( k => [k, this.chess.get(k)])
        .filter( ([k, v]) => v)
        .map( ([k, {type, color}]) => [k, `${(color=='w')? type.toUpperCase() : type}`])
        //.reduce( (a, b) => ({...a, ...b}), {})
    }

    this.pieces = () => this.fields().map( ([k, v]) => `${v}@${k}`);
    
    this.state = {
      pieces: this.pieces(),
      player: 0
    };
  }

  shouldComponentUpdate(){ console.log('blub'); return true; }

  renderState() {
    const check = this.chess.in_check(); 
    const gameOver = this.chess.game_over(); 
    const turn = this.chess.turn() =="w"? "white's turn" : "black's turn";

    if (check) {
      return <div>
        <div> {turn} - you are in Check! </div>
      </div>
    }

    if (gameOver) {
      return <div> {this.chess.turn()=="w"? "Black Won" : "White Won"}  </div>
    }

    return <div> {turn} </div>
  }

  render() {
    return (
      <div className="App" style={{
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "stretch",
        alignItems: "center",
      }}>
        <div style={{textAlign:"center"}}> serverless chess </div>
        {this.renderState()}
        <div style={{
          display:"flex",
          justifyContent: "stretch",
          alignItems: "stretch",
          flexDirection: "row",
          flex: 1,
          background:"red",
          minWidth: "300px",
          minHeight:"300px",
          height: "90vh",
          width: "90vh",
          maxHeight: "90vh",
          maxWidth: "90vh"
        }}>
        <Board 
          pieces={this.state.pieces}
          onMovePiece={ (piece, from, to) => {
            const m = this.chess.move(`${piece.name}${from}-${to}`,  {sloppy: true});
            if (!m) this.setState({pieces:[]});
            setTimeout(() => this.setState({pieces:this.pieces()}));
            window.location.hash = window.btoa(this.chess.fen());
          }}

          onDragStart={ (piece, from) => {
            return (piece.name.toUpperCase() == piece.name) == (this.chess.turn() == 'w');
          }}
        />
      </div>
    </div>
    );
  }
}

export default App;
