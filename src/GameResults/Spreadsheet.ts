function getGameLinksTableFromRange(
  gameLinksRange: GoogleAppsScript.Spreadsheet.Range
): GameLinksTableRow[] {
  const tableValues = gameLinksRange.getValues()
    .map(rows => rows.map(String))

  const headers = tableValues[0]
  const cells = tableValues.slice(1)

  const tableMap = cells.map((row) =>
    Object.fromEntries(row.map((cell, i) => 
      [headers[i], cell]
    ))
  )

  if (!(tableMap.every(isGameLinksTableRow))) {
    throw new Error('Incorrect table format')
  }

  return tableMap
}


function parseMatchId(matchId: string): { bracket: BracketOptions, matchNum: string } {
  const regex = /^(?:Final|Match (W|L)(\d+))$/
  const regexMatch = matchId.match(regex)

  if (!regexMatch) { throw new Error('Match ID is in an incorrect format') }
  
  if (matchId === 'Final') { return {bracket: 'Upper', matchNum: 'Final'} }

  const [ bracket, matchNum ] = [ regexMatch[1], regexMatch[2] ]

  switch (bracket) {
    case 'W':
      return {bracket: 'Upper', matchNum: matchNum}
    case 'L':
      return {bracket: 'Lower', matchNum: matchNum}
    default:
      throw new Error('Unexpected error')
  }
}
