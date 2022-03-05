/**
 * @jest-environment jsdom
 */

const Grid = require( '../game' );
let grid = undefined;

beforeEach( () => {
	// Prevent our tests from being bound to one another
	document.body.innerHTML += `
		<canvas id="gameCanvas" width="480" height="480"></canvas>
		<div class="controls">
			<p><span id="alerts">Resets the current game</span></p>
			<button id="reset">Start Over</button>
		</div>`;
	
	grid = new Grid();
	grid.init();
} );

describe( 'Testing Setup', () => {
	test( 'grid is instantiated', () => {
		expect( grid.cellsWide ).toBe( 3 );
	} );
	
	test( 'canvas is initialized', () => {
		expect( grid.canvas.width ).toBe( 480 );
	} );
} );

describe( 'Game Procedures', () => {
	test( 'moves register correctly', () => {		
		let event = { clientX: 300, clientY: 0 };
		document.getElementById( 'gameCanvas' ).dispatchEvent(
			new MouseEvent( 'click', { ...event, bubbles: true } )
		);
		expect( grid.xMoves[0] ).toEqual( 2 );
	} );

	test( 'players take turns', () => {
		let event = { clientX: 300, clientY: 0 };
		document.getElementById( 'gameCanvas' ).dispatchEvent(
			new MouseEvent( 'click', { ...event, bubbles: true } )
		);

		event = { clientX: 300, clientY: 300 };
		document.getElementById( 'gameCanvas' ).dispatchEvent(
			new MouseEvent( 'click', { ...event, bubbles: true } )
		);
		expect( grid.xMoves.length ).toEqual( 1 );
		expect( grid.oMoves.length ).toEqual( 1 );
	} );

	test( 'cell only claimable once', () => {
		let event = { clientX: 300, clientY: 0 };
		document.getElementById( 'gameCanvas' ).dispatchEvent(
			new MouseEvent( 'click', { ...event, bubbles: true } )
		);

		document.getElementById( 'gameCanvas' ).dispatchEvent(
			new MouseEvent( 'click', { ...event, bubbles: true } )
		);
		expect( grid.xMoves.length ).toEqual( 1 );
		expect( grid.oMoves.length ).toEqual( 0 );
	} );
} );

describe( 'Game Outcomes', () => {
	test( 'game can end', () => {		
		grid.xMoves = [ 1, 2, 5, 8, 7 ];
		grid.oMoves = [ 3, 4, 6, 9 ];
		expect( grid.isGameOver ).toEqual( false );
		grid.checkGameEnd();
		expect( grid.isGameOver ).toEqual( true );
	} );

	test( 'game can end in a draw', () => {		
		grid.xMoves = [ 1, 2, 5, 8, 7 ];
		grid.oMoves = [ 3, 4, 6, 9 ];
		grid.checkGameEnd();
		expect( grid.isGameOver ).toEqual( true );
		const el = document.getElementById( 'alerts' );
		expect( el.innerText ).toEqual( 'The game ended in a draw...' );
	} );

	test( 'X can win', () => {
		grid.xMoves = [ 1, 2, 3 ];
		grid.oMoves = [ 4, 7 ];
		grid.checkGameEnd();
		const el = document.getElementById( 'alerts' );
		expect( el.innerText ).toEqual( 'Player X is the winner!' );
	} );

	test( 'O can win', () => {
		grid.xMoves = [ 4, 6, 9 ];
		grid.oMoves = [ 1, 2, 3 ];
		grid.checkGameEnd();
		const el = document.getElementById( 'alerts' );
		expect( el.innerText ).toEqual( 'Player O is the winner!' );
	} );

	test( 'game stops after win or draw', () => {
		grid.xMoves = [ 1, 2, 3 ];
		grid.oMoves = [ 4, 7 ];
		grid.checkGameEnd();
		let event = { clientX: 300, clientY: 0 };
		document.getElementById( 'gameCanvas' ).dispatchEvent(
			new MouseEvent( 'click', { ...event, bubbles: true } )
		);
		const el = document.getElementById( 'alerts' );
		expect( el.innerText ).toEqual( 'Game is over!' );
	} );
} );
