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
		this.cellsWide = cellsWide ? cellsWide : 5;
		this.cellsTall = cellsTall ? cellsTall : 5;
		this.winLength = winLength ? winLength : 5;
	}

	/**
	 * Initialize a new game
	 */
	init() {
		// Set our config variables
		this.canvas              = document.getElementById( 'gameCanvas' );
		this.tileSize            = Math.round( this.canvas.width / this.cellsWide ) * window.devicePixelRatio;
		this.canvas.width        = this.tileSize * this.cellsWide;
		this.canvas.height       = this.tileSize * this.cellsTall;
		this.canvas.style.width  = '480px';
		this.canvas.style.height = '480px';

		this.ctx                       = this.canvas.getContext( '2d' );
		this.ctx.imageSmoothingEnabled = false;
		this.ctx.lineWidth             = 10;
		
		// Register the onclick event
		this.canvas.onclick = ( e ) => this.onClick( e );

		this.createGrid();

		this.isGameOver    = false;
		this.winConditions = new Array(
			[ 1, 2, 3 ],
			[ 4, 5, 6 ],
			[ 7, 8, 9 ],
			[ 1, 4, 7 ],
			[ 2, 5, 8 ],
			[ 3, 6, 9 ],
			[ 1, 5, 9 ],
			[ 3, 5, 7 ],	
		);
		this.xMoves = new Array();
		this.oMoves = new Array();
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
			this.ctx.moveTo( 0, this.tileSize * x );
			this.ctx.lineTo( width, this.tileSize * x );
		}

		// Draw vertical lines
		for ( let y=1; y<this.cellsTall; y++ ) {
			this.ctx.moveTo( this.tileSize * y, 0 );
			this.ctx.lineTo( this.tileSize * y, height );
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
		const midX = ( cellX * this.tileSize ) + ( this.tileSize / 2 );
		const midY = ( cellY * this.tileSize ) + ( this.tileSize / 2 );
		const radius = this.tileSize / 2.5;
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
		const x = cellX * this.tileSize;
		const y = cellY * this.tileSize;
		const offset = this.tileSize / 10;
		this.ctx.beginPath();
		this.ctx.moveTo( x + offset, y + offset );
		this.ctx.lineTo( x + this.tileSize - offset, y + this.tileSize - offset );
		this.ctx.moveTo( x + offset, y + this.tileSize - offset );
		this.ctx.lineTo( x + this.tileSize - offset, y + offset );
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
	 * Retrieves coordinates and ID for selected cell
	 * 
	 * @param {obj} event
	 * @returns object
	 */
	getCellData( event ) {
		const cursor = this.getCursorCoords( event );
		const cellX  = Math.floor( cursor.x / this.tileSize );
		const cellY  = Math.floor( cursor.y / this.tileSize );
		const cellId = ( cellY * 3 ) + cellX + 1;

		return { 'posX': cellX, 'posY': cellY, 'id': cellId };
	}

	/**
	 * Retrieves information for the player that last moved
	 *
	 * @returns object
	 */
	getPlayerByLastMove() {
		const player = {
			moves: new Array(),
			letter: '',
		};
		if ( this.xMoves.length > this.oMoves.length ) {
			player.moves = this.xMoves;
			player.letter = 'X';
		} else {
			player.moves = this.oMoves;
			player.letter = 'O';
		}
		return player;
	}

	/**
	 * Checks if the cell is empty or contains
	 *
	 * @param {num} cellId
	 * @returns boolean
	 */
	isCellEmpty( cellId ) {
		return ! this.xMoves.includes( cellId ) && ! this.oMoves.includes( cellId );
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

		// Which cell was clicked on?
		const cellData = this.getCellData( event );

		// Check if this position is already taken
		if ( ! this.isCellEmpty( cellData.id ) ) {
			return;
		}
		
		// Determine turn be previous turn and make a move
		if ( this.xMoves.length <= this.oMoves.length ) {
			this.drawX( cellData.posX, cellData.posY );
			this.xMoves.push( cellData.id );
		} else {
			this.drawO( cellData.posX, cellData.posY );
			this.oMoves.push( cellData.id );
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
		if ( ( this.xMoves.length + this.oMoves.length ) < ( this.winLength * 2 ) - 1 ) {
			return;
		} else if ( ( this.xMoves.length + this.oMoves.length ) >= this.cellsWide * this.cellsWide ) {
			// draw game
			this.isGameOver = true;
			const el = document.getElementById( 'alerts' );
			el.classList.add( 'info' );
			el.innerText = 'The game ended in a draw...';
			return;
		}

		const player = this.getPlayerByLastMove();

		for ( let i=0; i<this.winConditions.length; i++ ) {
			this.isGameOver = this.winConditions[ i ].every( v => player.moves.includes( v ) );
			if ( this.isGameOver ) {
				break;
			}
		}
		// How does this class know where to put the alerts? Should be in config?
		if (  this.isGameOver ) {
			// This can probably be abstracted to a boolean method since it's used in several places
			// can also abstract to different method
			const el = document.getElementById( 'alerts' );
			el.classList.add( 'success' );
			el.innerText = 'Player ' + player.letter + ' is the winner!';
		}
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
