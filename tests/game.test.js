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
	
	grid = new Grid( 3, 3, 3 );
	grid.init();
} );

describe( 'Testing Setup', () => {
	test( 'grid is instantiated', () => {
		expect( grid.cellsWide ).toBeDefined();
	} );
	
	test( 'canvas is initialized', () => {
		expect( grid.canvas.width ).toBeDefined();
	} );
} );

describe( 'Game Procedures', () => {
	test( 'moves register correctly', () => {
		const event = { clientX: 300, clientY: 0 };
		document.getElementById( 'gameCanvas' ).dispatchEvent(
			new MouseEvent( 'click', { ...event, bubbles: true } )
		);
		expect( grid.latestMove ).toEqual( { x: 1, y: 0, letter: 'x' } );
		expect( grid.boardState[ 0 ][ 1 ] ).toBe( 'x' );
	} );

	test( 'players take turns', () => {
		grid.latestMove = { x: 1, y: 0, letter: 'x' };
		const event = { clientX: 300, clientY: 300 };
		document.getElementById( 'gameCanvas' ).dispatchEvent(
			new MouseEvent( 'click', { ...event, bubbles: true } )
		);
		expect( grid.latestMove ).toEqual( { x: 1, y: 1, letter: 'o' } );
	} );

	test( 'cell only claimable once', () => {
		let event = { clientX: 300, clientY: 0 };
		document.getElementById( 'gameCanvas' ).dispatchEvent(
			new MouseEvent( 'click', { ...event, bubbles: true } )
		);
		document.getElementById( 'gameCanvas' ).dispatchEvent(
			new MouseEvent( 'click', { ...event, bubbles: true } )
		);
		expect( grid.latestMove ).toEqual( { x: 1, y: 0, letter: 'x' } );
	} );
} );

describe( 'Game Outcomes', () => {
	test( 'game can end in a draw', () => {
		grid.boardState = new Array(
			[ 'x', 'x', 'o' ],
			[ 'o', 'x', 'x' ],
			[ 'x', 'o', 'o' ]
		);
		grid.totalMoves = 9;
		grid.latestMove = { 'x': 0, 'y': 2, 'letter': 'x' };
		grid.checkGameEnd();
		expect( grid.isGameOver ).toBe( true );
		const el = document.getElementById( 'alerts' );
		expect( el.innerText ).toBe( 'The game ended in a draw...' );
	} );

	test( 'X can win', () => {
		grid.boardState = new Array(
			[ 'x', 'o' ],
			[ 'x', 'o' ],
			[ 'x' ]
		);
		grid.totalMoves = 5;
		grid.latestMove = { 'x': 0, 'y': 2, 'letter': 'x' };
		expect( grid.isGameOver ).toBe( false );
		grid.checkGameEnd();
		expect( grid.isGameOver ).toBe( true );
		const el = document.getElementById( 'alerts' );
		expect( el.innerText ).toBe( 'Player X is the winner!' );
	} );

	test( 'O can win', () => {
		grid.boardState = new Array(
			[ 'x', 'o', 'x' ],
			[ 'x', 'o', 'x' ],
			[ 'o', 'o' ]
		);
		grid.totalMoves = 8;
		grid.latestMove = { 'x': 1, 'y': 2, 'letter': 'o' };
		expect( grid.isGameOver ).toBe( false );
		grid.checkGameEnd();
		expect( grid.isGameOver ).toBe( true );
		const el = document.getElementById( 'alerts' );
		expect( el.innerText ).toBe( 'Player O is the winner!' );
	} );

	test( 'game stops after win or draw', () => {
		grid.boardState = new Array(
			[ 'x', 'x', 'o' ],
			[ 'o', 'x', 'x' ],
			[ 'x', 'o', 'o' ]
		);
		grid.totalMoves = 9;
		grid.latestMove = { 'x': 0, 'y': 2, 'letter': 'x' };
		grid.checkGameEnd();
		expect( grid.isGameOver ).toBe( true );
		let event = { clientX: 300, clientY: 0 };
		document.getElementById( 'gameCanvas' ).dispatchEvent(
			new MouseEvent( 'click', { ...event, bubbles: true } )
		);
		const el = document.getElementById( 'alerts' );
		expect( el.innerText ).toBe( 'Game is over!' );
	} );
} );
