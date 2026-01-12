/**
 * Helper: Get Lichess games from IDs using the Lichess API
 * @param ids
 * @return gameResults
 */
function fetchLichessGames(ids: string[]): GameResultObject {
  if (ids.length === 0) { return {} }

  const url = 'https://lichess.org/api/games/export/_ids?'
    + 'moves=false&pgnInJson=true&tags=false'

  const params: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'post',
    headers: {'content-type': 'text/plain', Accept: 'application/json'},
    payload: ids.join()
  }

  const response = UrlFetchApp.fetch(url, params).getContentText()

  const gameResults = response.split(/\n/).reduce((acc, line) =>{
    if (!line) { return acc }

    let json = JSON.parse(line) as LichessAPIGame;
    
    
    acc[json.id] = {
      gameID: json.id,
      whiteName: json.players.white.user.name,
      blackName: json.players.black.user.name,
      whiteScore: {white: 1, black: 0, draw: 0.5}
        [json.winner ?? 'draw'] as ChessScore,
      blackScore: {white: 0, black: 1, draw: 0.5}
        [json.winner ?? 'draw'] as ChessScore,
      result: json.winner ?? 'draw',
    } satisfies GameResult;

    return acc;
  }, {} as GameResultObject);

  return gameResults
}


/**
 * Helper: Extract Lichess ID from url
 * @param link
 * @return Extracted game ID or null
 */
function extractGameID(link: string): string | GameResultError {
  if (link.trim() === '') { return GameResultError.EMPTY_GAME_LINK; }
 
  const linkRegex = /^https:\/\/lichess\.org\/(\w{8})(?:\w{4})?(?:\/(?:white|black))?\/?$/;

  const match = link.match(linkRegex)

  if (!match || !match[1]) {
    console.warn(`Invalid game link: ${link}. Returning GameResultError.INVALID_GAME_LINK`)
    return GameResultError.INVALID_GAME_LINK;
  }

  return match[1];
}

