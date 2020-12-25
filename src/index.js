import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button className={'square ' + (props.highlight ? 'square-highlight' : '')}
                onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square key={i}
                    value={this.props.squares[i]}
                    highlight={this.props.winLine && this.props.winLine.includes(i)}
                    onClick={() => this.props.onClick(i)}/>
        );
    }

    render() {
        const size = 3;
        let rows = [];
        for (let i = 0; i < size; i++) {
            let columns = [];
            for (let j = 0; j < size; j++) {
                columns.push(this.renderSquare(j + i * size));
            }
            rows.push(
                <div key={i} className="board-row">
                    {columns}
                </div>
            );
        }

        return (
            <div>{rows}</div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                location: null
            }],
            stepNumber: 0,
            xIsNext: true,
            isSortAsc: true
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (squares[i] || calculateResult(squares)) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        const row = Math.floor(i / 3) + 1;
        const col = i % 3 + 1;
        this.setState({
            history: history.concat([{
                squares: squares,
                location: '(' + row + ', ' + col + ')'
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    toggleSort() {
        this.setState({
            isSortAsc: !this.state.isSortAsc
        });
    }

    render() {
        const history = this.state.history;
        const moves = history.map((step, move) => {
            const desc = move ?
                'Go to move #' + move + ' - ' + step.location :
                'Go to game start';
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}
                            className={move === this.state.stepNumber ? 'item-selected' : ''}>
                        {desc}
                    </button>
                </li>
            );
        });

        const current = history[this.state.stepNumber];
        const result = calculateResult(current.squares);
        let status;
        if (result) {
            if (result.winner) {
                status = 'Winner: ' + result.winner;
            } else {
                status = 'Game Draw';
            }
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board squares={current.squares}
                           winLine={result && result.winner && result.line}
                           onClick={(i) => this.handleClick(i)}/>
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <button className="btn-sort"
                            onClick={() => this.toggleSort()}>
                        Sort {this.state.isSortAsc ?
                        <span>&uarr;</span> : <span>&darr;</span>}
                    </button>
                    <ol reversed={!this.state.isSortAsc}>
                        {this.state.isSortAsc ? moves : moves.reverse()}
                    </ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);

function calculateResult(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {
                winner: squares[a],
                line: lines[i]
            };
        }
    }
    if (squares.every(value => value !== null)) {
        return 'Draw';
    }
    return null;
}
