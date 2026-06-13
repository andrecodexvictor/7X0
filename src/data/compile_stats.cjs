const fs = require('fs');
const path = require('path');

function compile() {
  const mdPath = path.join(__dirname, 'f1_driver_season_stats_full.md');
  const jsonOutputPath = path.join(__dirname, 'f1_driver_season_stats_full.json');

  if (!fs.existsSync(mdPath)) {
    console.error("Markdown file f1_driver_season_stats_full.md not found!");
    return;
  }

  const content = fs.readFileSync(mdPath, 'utf-8');
  const lines = content.split('\n');

  const parsedDrivers = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Match line pattern: | Year | Driver Name | Code | Team Name | Races | Wins | Podiums | Points | Pos | Rating | Rank |
    if (trimmed.startsWith('|') && !trimmed.includes('Year') && !trimmed.includes('---')) {
      const parts = trimmed.split('|').map(p => p.trim());
      if (parts.length >= 12) {
        const year = parseInt(parts[1], 10);
        const name = parts[2];
        const code = parts[3] === '\\N' ? '' : parts[3];
        const teamName = parts[4];
        const races = parseInt(parts[5], 10) || 0;
        const wins = parseInt(parts[6], 10) || 0;
        const podiums = parseInt(parts[7], 10) || 0;
        const points = parseFloat(parts[8]) || 0;
        const pos = parts[9];
        const rating_geral = parseInt(parts[10], 10) || 75;
        const rank = parts[11];

        if (year && name && teamName) {
          parsedDrivers.push({
            year,
            name,
            code,
            teamName,
            races,
            wins,
            podiums,
            points,
            pos,
            rating_geral,
            rank
          });
        }
      }
    }
  }

  console.log(`Parsed ${parsedDrivers.length} historical driver rows.`);
  fs.writeFileSync(jsonOutputPath, JSON.stringify(parsedDrivers, null, 2), 'utf-8');
  console.log(`Successfully compiled to ${jsonOutputPath}`);
}

compile();
