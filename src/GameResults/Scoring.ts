function convertGameResultsToScoreRange(
  player1: string,
  player2: string,
  gameResults: (GameResult | GameResultError)[]
): [string, string][] {
  const scores: [string, string][] = gameResults.map((result) => {
    if (result === GameResultError.EMPTY_GAME_LINK) {
      return ['', ''];
    }

    if (result === GameResultError.INVALID_GAME_LINK) {
      return [INVALID_GAME_LINK_ERROR, INVALID_GAME_LINK_ERROR];
    }
    
    if (result === GameResultError.MISSING_GAME_RESULT) {
      return [MISSING_GAME_RESULT_ERROR, MISSING_GAME_RESULT_ERROR];
    }

    if (!hasPlayers(result, player1, player2)) {
      return [INVALID_PLAYERS_ERROR, INVALID_PLAYERS_ERROR];
    }

    const p1Score =
      result.whiteName === player1 ? result.whiteScore : result.blackScore
    const p2Score =
      result.blackName === player2 ? result.blackScore : result.whiteScore

    const p1ScoreString = scoreToString(p1Score)
    const p2ScoreString = scoreToString(p2Score)

    return [p1ScoreString, p2ScoreString]
  })

  return scores
}


function convertGameResultsToScoreSum(
  player1: string,
  player2: string,
  gameResults: (GameResult | GameResultError)[]
): [string, string] {
  const nonEmptyResults =
    gameResults.filter((result => result !== GameResultError.EMPTY_GAME_LINK));

  if (nonEmptyResults.length === 0) { return ['', '']; }

  const firstError = nonEmptyResults.find(isGameResultError);
  if (firstError) {
    switch (firstError) {
      case GameResultError.INVALID_GAME_LINK:
        return [INVALID_GAME_LINK_ERROR, INVALID_GAME_LINK_ERROR];
      case GameResultError.MISSING_GAME_RESULT:
        return [MISSING_GAME_RESULT_ERROR, MISSING_GAME_RESULT_ERROR];
    }
  }

  if (
    (nonEmptyResults as GameResult[])
      .some(result => !hasPlayers(result, player1, player2))
  ) {
    return [INVALID_PLAYERS_ERROR, INVALID_PLAYERS_ERROR]
  }

  const validGameResults = nonEmptyResults as GameResult[]

  const scores: [number, number] = validGameResults.reduce((acc, result) => {
    const p1Score =
      result.whiteName === player1 ? result.whiteScore : result.blackScore;
    const p2Score =
      result.whiteName === player2 ? result.whiteScore : result.blackScore;

    return [acc[0] + p1Score, acc[1] + p2Score];
  }, [0, 0] as [number, number])

  const stringifiedScores = scores.map(scoreToString) as [string, string];

  return stringifiedScores;
};



function hasPlayers(result: GameResult, p1: string, p2: string): boolean {
  return (
    (result.whiteName === p1 && result.blackName === p2) ||
    (result.whiteName === p2 && result.blackName === p1)
  )
}


function scoreToString(score: number): string {
  if (score % 1 === 0) {
    return score.toString();
  } else if (score === 0.5) {
    return '½';
  } else {
    return Math.floor(score).toString() + '½';
  }
}


