/**
 * Helper: Parse match scores using regex `/^(\d+(?:\.\d+)?)(?:F|X)?$/`
 * @param {[string, string]} scores
 * @return {[number, number]} parsedScores
 */
function parseScores(scores: [string, string]): [number, number] {
  const [p1Score, p2Score] = scores

  if (!p1Score || !p2Score) { throw new Error('Scores cannot be empty') }

  const resultRegex = /^(\d+(?:\.\d+)?)(?:F|X)?$/
  const p1Match = String(p1Score).match(resultRegex)
  const p2Match = String(p2Score).match(resultRegex)

  if (!p1Match || !p2Match) {
    throw new TypeError('Invalid result format')
  }

  return [Number(p1Match[1]), Number(p2Match[1])]
}
