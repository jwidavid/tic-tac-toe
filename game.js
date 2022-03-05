let grid;

class Grid {

	/**
	 * Game grid constructor with game setting arguments
	 *
	 * @param {num} cellsWide
	 * @param {num} cellsTall
	 * @param {num} winLength
	 */
	constructor( cellsWide, cellsTall, winLength ) {
		this.cellsWide = cellsWide ? cellsWide : 3;
		this.cellsTall = cellsTall ? cellsTall : 3;
		this.winLength = winLength ? winLength : 3;
	}

	/**
	 * Initialize a new game
	 */
	init() {
		// Set our config variables
		this.canvas              = document.getElementById( 'gameCanvas' );
		this.cellSize            = Math.round( this.canvas.width / this.cellsWide ) * window.devicePixelRatio;
		this.canvas.width        = this.cellSize * this.cellsWide;
		this.canvas.height       = this.cellSize * this.cellsTall;
		this.canvas.style.width  = '480px';
		this.canvas.style.height = '480px';

		this.ctx                       = this.canvas.getContext( '2d' );
		this.ctx.imageSmoothingEnabled = false;
		this.ctx.lineWidth             = 10;
		
		// Register the onclick event
		this.canvas.onclick = ( e ) => this.onClick( e );

		this.createGrid();

		/**
		 * boardState[ yPos ] = [ xPos ] = letter
		 */
		this.boardState = new Array();
		this.isGameOver = false;
		this.latestMove = undefined;
		this.totalMoves = 0;
	}

	/**
	 * Draw the game grid onto the canvas
	 */
	createGrid() {
		// our end points
		const width  = this.canvas.width;
		const height = this.canvas.height;

		// set our styles
		this.ctx.save();
		this.ctx.strokeStyle = 'black'; // line colors
		this.ctx.fillStyle = 'black'; // text color
		this.ctx.font = '14px Monospace';
		this.ctx.lineWidth = 1;
		this.ctx.beginPath();

		// Draw horizontal lines
		for ( let x=1; x<this.cellsWide; x++ ) {
			this.ctx.moveTo( 0, this.cellSize * x );
			this.ctx.lineTo( width, this.cellSize * x );
		}

		// Draw vertical lines
		for ( let y=1; y<this.cellsTall; y++ ) {
			this.ctx.moveTo( this.cellSize * y, 0 );
			this.ctx.lineTo( this.cellSize * y, height );
		}

		this.ctx.stroke();
		// restore the styles from before this function was called
		this.ctx.restore();
	}

	/**
	 * Draws an O on the grid at the provided coords
	 *
	 * @param {*} cellX
	 * @param {*} cellY
	 */
	drawO( cellX, cellY ) {
		const midX = ( cellX * this.cellSize ) + ( this.cellSize / 2 );
		const midY = ( cellY * this.cellSize ) + ( this.cellSize / 2 );
		const radius = this.cellSize / 2.5;
		this.ctx.beginPath();
		this.ctx.arc( midX, midY, radius, 0, 2 * Math.PI, false );
		this.ctx.stroke();
	}

	/**
	 * Draws an X on the grid at the provided coords
	 *
	 * @param {num} cellX
	 * @param {num} cellY
	 */
	drawX( cellX, cellY ) {
		const x = cellX * this.cellSize;
		const y = cellY * this.cellSize;
		const offset = this.cellSize / 10;
		this.ctx.beginPath();
		this.ctx.moveTo( x + offset, y + offset );
		this.ctx.lineTo( x + this.cellSize - offset, y + this.cellSize - offset );
		this.ctx.moveTo( x + offset, y + this.cellSize - offset );
		this.ctx.lineTo( x + this.cellSize - offset, y + offset );
		this.ctx.stroke();
	}

	/**
	 * Retrieves coordinates of click
	 * 
	 * @param {obj} event
	 * @returns object
	 */
	getCursorCoords( event ) {
		const rect = this.canvas.getBoundingClientRect();
		const cursorX = ( event.clientX - rect.left ) * window.devicePixelRatio;
		const cursorY = ( event.clientY - rect.top ) * window.devicePixelRatio;

		return { x: cursorX, y: cursorY };
	}

	/**
	 * Retrieves coordinates for selected cell
	 * 
	 * @param {obj} event
	 * @returns object
	 */
	getCellCoords( event ) {
		const cursor = this.getCursorCoords( event );
		const posX = Math.floor( cursor.x / this.cellSize );
		const posY = Math.floor( cursor.y / this.cellSize );

		return { x: posX, y: posY };
	}

	/**
	 * Checks if the cell is empty or contains
	 *
	 * @param {num} xPos 
	 * @param {num} yPos 
	 * @returns boolean
	 */
	isCellEmpty( xPos, yPos ) {
		return !! this.boardState[ yPos ] && this.boardState[ yPos ][ xPos ];
	}

	/**
	 * Records the move to the boardState
	 * 
	 * @param {num} xPos
	 * @param {num} yPos
	 * @param {num} letter
	 */
	registerMove( xPos, yPos, letter ) {
		if ( undefined === this.boardState[ yPos ] ) {
			this.boardState[ yPos ] = new Array();
		}
		this.boardState[ yPos ][ xPos ] = letter;
		this.latestMove = { 'x': xPos, 'y': yPos, 'letter': letter };
		this.totalMoves++;
	}

	/**
	 * Handles click event on canvas normally representing a player turn
	 *
	 * @param {obj} event
	 * @returns void
	 */
	onClick( event ) {
		if ( this.isGameOver ) {
			const el = document.getElementById( 'alerts' );
			el.classList.add( 'danger' );
			el.innerText = 'Game is over!';
			return;
		}

		// Which square was clicked on?
		const coords = this.getCellCoords( event );

		// Check if this position is already taken
		if ( this.isCellEmpty( coords.x, coords.y ) ) {
			return;
		}

		// Determine turn be previous turn and make a move
		if ( undefined === this.latestMove || 'o' === this.latestMove.letter ) {
			this.drawX( coords.x, coords.y );
			this.registerMove( coords.x, coords.y, 'x' );
		} else {
			this.drawO( coords.x, coords.y );
			this.registerMove( coords.x, coords.y, 'o' );
		}

		// Check if 'end game' conditions have been met
		this.checkGameEnd();
	}

	/**
	 * Handles game ending conditions
	 *
	 * @returns void
	 */
	checkGameEnd() {
		// Don't waste time checking for endgame if too few moves have occurred
		if ( this.totalMoves < ( this.winLength * 2 ) - 1 ) {
			return;
		} else if ( this.totalMoves >= this.cellsWide * this.cellsTall ) {
			// draw game
			this.isGameOver = true;
			const el = document.getElementById( 'alerts' );
			el.classList.add( 'info' );
			el.innerText = 'The game ended in a draw...';
			return;
		}

		// I am starting with a check all the way from the left and moving toward the latest move...
		// if I began moving outward from the latestMove instead, then this would be more efficient
		this.isGameOver = this.checkHorizontal();
		if ( ! this.isGameOver ) this.isGameOver = this.checkVertical();
		if ( ! this.isGameOver ) this.isGameOver = this.checkDiagonal();

		// How does this class know where to put the alerts? Should be in config?
		if ( this.isGameOver ) {
			// This can probably be abstracted to a boolean method since it's used in several places
			// can also abstract to different method
			const el = document.getElementById( 'alerts' );
			el.classList.add( 'success' );
			el.innerText = 'Player ' + this.latestMove.letter.toUpperCase() + ' is the winner!';
		}
	}

	/**
	 * Checks for horizontal win condition on latest move
	 *
	 * @returns boolean
	 */
	checkHorizontal() {
		let hCount  = 0;
		const start = this.latestMove.x - ( this.winLength - 1 );
		const stop  = this.latestMove.x + ( this.winLength - 1 );
		for ( let i=start; i<stop; i++ ) {
			if (
				undefined !== this.boardState[ this.latestMove.y ]
				&& undefined !== this.boardState[ this.latestMove.y ][ i ]
				&& this.latestMove.letter === this.boardState[ this.latestMove.y ][ i ]
			) {
				hCount++;
			} else {
				hCount = 0;
			}
			if ( hCount >= this.winLength ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Checks for vertical win condition on latest move
	 *
	 * @returns boolean
	 */
	checkVertical() {
		let vCount   = 0;
		const start = this.latestMove.y - ( this.winLength - 1 );
		const stop  = this.latestMove.y + ( this.winLength - 1 );
		for ( let i=start; i<stop; i++ ) {
			if (
				undefined !== this.boardState[ i ]
				&& undefined !== this.boardState[ i ][ this.latestMove.x ]
				&& this.latestMove.letter === this.boardState[ i ][ this.latestMove.x ]
			) {
				vCount++;
			} else {
				vCount = 0;
			}
			if ( vCount >= this.winLength ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Checks for diagonal win condition on latest move
	 *
	 * @returns boolean
	 */
	checkDiagonal() {
		let start      = this.latestMove.x - ( this.winLength - 1 );
		let stop       = this.latestMove.x + ( this.winLength - 1 );
		let yDownCount = 0;
		let yUpCount   = 0;
		let yDown      = this.latestMove.y - ( this.winLength - 1 );
		let yUp        = this.latestMove.y + ( this.winLength - 1 );
		for ( let x=start; x<stop+1; x++ ) {
			if (
				undefined !== this.boardState[ yDown ]
				&& undefined !== this.boardState[ yDown ][ x ]
				&& this.latestMove.letter === this.boardState[ yDown ][ x ]
			) {
				yDownCount++;
			} else {
				yDownCount = 0;
			}

			if (
				undefined !== this.boardState[ yUp ]
				&& undefined !== this.boardState[ yUp ][ x ]
				&& this.latestMove.letter === this.boardState[ yUp ][ x ]
			) {
				yUpCount++;
			} else {
				yUpCount = 0;
			}

			if ( yDownCount >= this.winLength || yUpCount >= this.winLength ) {
				return true;
			}
			yDown++;
			yUp--;
		}
		return false;
	}
}

document.addEventListener( 'DOMContentLoaded', () => {
	grid = new Grid();
	grid.init();

	// Register the controlls onclick event
	document.getElementById( 'reset' ).onclick = () => {
		const el = document.getElementById( 'alerts' );
		el.classList.remove( 'success', 'info', 'danger' );
		el.innerText = 'Resets the current game';
		grid.init();
	};
} );

if ( typeof module !== 'undefined' ) {
	module.exports = Grid;
}
