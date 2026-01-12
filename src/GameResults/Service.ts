interface GetLichessGameResultsAs2dArrayParams {
  /** The username of the first player */
  player1: string;
  /** The username of the second player */
  player2: string;
  /** Array of Lichess game URLs */
  gameLinks: string[];
  /** Optional flag if the match ended in a forfeit */
  isForfeit?: { forP1: boolean, forP2: boolean };
  /** Total games played before moving to tiebreaks */
  gamesBeforeTiebreaks?: number;
}

/**
 * Gets the results of a series of Lichess games between two players. Returns a
 * range of cells formatted as such:
 * 
 * | Player 1 | P1 Game 1 | P1 Game 2 | ... | P1 Tiebreaks | Total |
 * 
 * | Player 2 | P2 Game 1 | P2 Game 2 | ... | P2 Tiebreaks | Total |
 *
 * @param  player1 The name of the first player.
 * @param  player2 The name of the second player.
 * @param gameLinks A list of Lichess game links.
 * @param  gamesBeforeTiebreaks The number of games before tiebreaks start. Default is 4.
 * @default 4
 * @returns
 * @customfunction
 */
function getLichessGameResultsAs2dArray({
  player1,
  player2,
  gameLinks,
  isForfeit = { forP1: false, forP2: false },
  gamesBeforeTiebreaks = 4
}: GetLichessGameResultsAs2dArrayParams): string[][] {
  if (isForfeit.forP1 && isForfeit.forP2) {
    throw new Error("Both players cannot be forfeited");
  }

  if (isForfeit.forP1 || isForfeit.forP2) {
    const forfeitedResults = [
      Array(gamesBeforeTiebreaks + 1).fill('') as string[],
      Array(gamesBeforeTiebreaks + 1).fill('') as string[]
    ]
    
    const scoreOfWinner = `${gamesBeforeTiebreaks / 2 + 0.5}X`;
    
    const forfeitedTotal = isForfeit.forP1 ?
      ['0F', scoreOfWinner] : [scoreOfWinner, '0F'] as [string, string];

    return [
      [player1, ...forfeitedResults[0], forfeitedTotal[0]],
      [player2, ...forfeitedResults[1], forfeitedTotal[1]]
    ]
  }

  const gameResults = getLichessGameResults(gameLinks)
  const gameResultsBeforeTB = gameResults.slice(0, gamesBeforeTiebreaks)
  const tiebreakResults = gameResults.slice(gamesBeforeTiebreaks)

  const resultsOutput = [
    [player1, player2] as [string, string],
    ...convertGameResultsToScoreRange(player1, player2, gameResultsBeforeTB),
    convertGameResultsToScoreSum(player1, player2, tiebreakResults),
    convertGameResultsToScoreSum(player1, player2, gameResults)
  ]

  return resultsOutput[0].map((_val, colIndex) =>
    resultsOutput.map(row => row[colIndex])
  )
}


/**
 * Get the result of a batch of games using the `gameLinks` param and return a Map.
 * 
 * @param gameLinks
 * @returns Map of game results. If a game link is invalid, the corresponding value will be null.
 * @default true
 * @returns
*/
function getLichessGameResults(gameLinks: string[]): (GameResult | GameResultError)[] {
  const gameIDs = gameLinks.map((link) => extractGameID(link));
  const validGameIDs = gameIDs.filter(
    gameID => gameID !== GameResultError.INVALID_GAME_LINK
  ) as string[];
  
  const storedGameResults: GameResultObject =
    documentCache.getAll(validGameIDs) as GameResultObject;
  const storedGameIDs = Object.keys(storedGameResults);

  if (storedGameIDs.length === validGameIDs.length) {
    return generateGameResultMapFromObject(
      gameIDs, storedGameResults
    );
  };

  const unstoredGameIDs =
    validGameIDs.filter((gameID) => !storedGameIDs.includes(gameID));
  const unstoredGameResults = fetchLichessGames(unstoredGameIDs);

  const gameResults = generateGameResultMapFromObject(
    gameIDs, {...storedGameResults, ...unstoredGameResults}
  );

  documentCache.putAll(unstoredGameResults, CACHE_TTL_SECONDS);

  return gameResults
}


/**
 * Helper: Generate a game results map from a game result object in same order as gameIDs
 * @param gameIDs
 * @param gameResultLists
 * @return Game results map
 */
function generateGameResultMapFromObject(
  gameIDs: (string | GameResultError)[],
  gameResultObject: GameResultObject,
): (GameResult | GameResultError)[] {
  return gameIDs.map((gameID) => {
    if (isGameResultError(gameID)) {
      return gameID
    }

    if (!gameResultObject[gameID]) {
      console.warn(`Game ID ${gameID} not found in fetched results. Returning GameResultError.MISSING_GAME_RESULT`);
      return GameResultError.MISSING_GAME_RESULT;
    }

    return gameResultObject[gameID]
  });
};

