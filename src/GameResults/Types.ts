/// <reference path="../../node_modules/@types/google-apps-script/google-apps-script.spreadsheet.d.ts"/>

type ChessScore = 0 | 0.5 | 1;

enum GameResultError {
  INVALID_GAME_LINK = 1,
  EMPTY_GAME_LINK,
  MISSING_GAME_RESULT
}

function isGameResultError (value: any): value is GameResultError {
  return typeof value === 'number' && value in GameResultError;
}

type LichessAPIGame = {
  id: string
  players: {
    white: { user: { name: string } }
    black: { user: { name: string } }
  }
  winner?: 'white' | 'black'
};

type GameResult = {
  gameID: string,
  whiteName: string,
  blackName: string,
  whiteScore: ChessScore,
  blackScore: ChessScore,
  result: 'white' | 'black' | 'draw';
}

type GameResultObject = { [key: string]: GameResult };



const BRACKETS = ['Upper', 'Lower'] as const;
const FORFEIT_OPTIONS = ['No', 'For P1', 'For P2'] as const;

type BracketOptions = (typeof BRACKETS)[number];
type ForfeitOptions = (typeof FORFEIT_OPTIONS)[number];


type GameLinksTableRow = {
  'Bracket': BracketOptions,
  'Match #': string,
  'Player 1': string,
  'Player 2': string,
  'Forfeit?': ForfeitOptions,
  'Gamelink 1': string,
  'Tiebreak 1': string
}

function isGameLinksTableRow(value: any): value is GameLinksTableRow {
  return (
    typeof value === 'object' &&
    value !== null &&
    BRACKETS.includes(value['Bracket']) &&
    typeof value['Match #'] === 'string' &&
    typeof value['Player 1'] === 'string' &&
    typeof value['Player 2'] === 'string' &&
    FORFEIT_OPTIONS.includes(value['Forfeit?']) &&
    typeof value['Gamelink 1'] === 'string' &&
    typeof value['Tiebreak 1'] === 'string'
  );
}


const INVALID_PLAYERS_ERROR = '#VALUE! Players do not match game link';
const INVALID_GAME_LINK_ERROR = '#VALUE! Invalid game link';
const MISSING_GAME_RESULT_ERROR = '#N/A Game result not found';
