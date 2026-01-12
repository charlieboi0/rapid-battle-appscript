function GET_LICHESS_GAME_RESULTS_FROM_MATCH_ID(
  matchId: string
): string[][] {
  const gameLinksSheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName('Game Links');

  if (!gameLinksSheet) {
    throw new Error('Couldn\'t find "Game Links" sheet');
  }

  const gameLinksTableRange = gameLinksSheet.getDataRange();
  const gameLinksTable = getGameLinksTableFromRange(gameLinksTableRange)

  const { bracket, matchNum } = parseMatchId(matchId)

  const filteredTableRows = gameLinksTable.filter(row => 
    row['Bracket'] === bracket && row['Match #'] === matchNum
  )

  if (filteredTableRows.length > 1) {
    throw new Error('More than one row with the same Match ID. Check the Game Links table')
  } else if (filteredTableRows.length === 0) {
    // Empty results array as a fallback
    return getLichessGameResultsAs2dArray({
      player1: '', player2: '', gameLinks: []
    })
  }

  const matchData = filteredTableRows[0]

  const gameLinks = Object.entries(matchData)
    .filter(([ key, _val ]) =>
      /^(?:Gamelink|Tiebreak) \d+$/.test(key)
    )
    .map(([ _key, val ]) => val)

  const isForfeit = {
    forP1: matchData['Forfeit?'] === 'For P1' ? true : false,
    forP2: matchData['Forfeit?'] === 'For P2' ? true : false
  }

  return getLichessGameResultsAs2dArray({
    player1: matchData['Player 1'],
    player2: matchData['Player 2'],
    gameLinks: gameLinks,
    isForfeit: isForfeit
  })
}


/**
 * Gets the winner of a match from an entry.
 *
 * @param {[string, string]} players A list of the names of the match participants.
 * @param {[string, string]} scores A list of the results of the match participants, in the same order as the names.
 * @return {string} The name of the winning player. Returns an empty string if the result is a draw or invalid.
 * @customfunction
 */
function GET_WINNER(players: [string, string], scores: [string, string]): string {
  const [p1, p2] = players
  const [p1Score, p2Score] = parseScores(scores)

  if (p1Score > p2Score) {
    return p1
  } else if (p1Score < p2Score) {
    return p2
  }

  return ''
}


/**
 * Gets the loser of a match from an entry
 * 
 * @param {[string, string]} players - A list of the names of the match participants
 * @param {[string, string]} scores - A list of the results of the match participants, in the same order at which the names appear
 * @return {string} loser - The name of the losing player. An empty string is returned if the result is a draw or invalid
 * @customfunction
 */
function GET_LOSER(players: [string, string], scores: [string, string]): string {
  const [p1, p2] = players
  const [p1Score, p2Score] = parseScores(scores)

  if (p1Score > p2Score) {
    return p2
  } else if (p1Score < p2Score) {
    return p1
  }

  return ''
}
