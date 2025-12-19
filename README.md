# iidxapi - beatmania IIDX API

This repository provides beatmania IIDX related data via GitHub Pages. Data is automatically scraped and updated using GitHub Actions.

## API

### INFINITAS Music List

Get the list of songs available in beatmania IIDX INFINITAS.

```
https://dqn.github.io/iidxapi/infinitas/music.json
```

```json
[
  {
    "title": "Song Title",
    "artist": "Artist Name"
  }
]
```

### SP☆11 Difficulty Tables

Get the SP☆11 difficulty tables for Normal and Hard clear.

#### Normal Clear Difficulty Table

```
https://dqn.github.io/iidxapi/sp11/normal.json
```

#### Hard Clear Difficulty Table

```
https://dqn.github.io/iidxapi/sp11/hard.json
```

```json
[
  {
    "title": "Song Title",
    "tier": "地力S"
  }
]
```

#### Tier Types

- 地力S+, 地力S, 地力A, 地力B, 地力C, 地力D, 地力E, 地力F
- 個人差S+, 個人差S, 個人差A, 個人差B, 個人差C, 個人差D, 個人差E
- 超個人差
- 未定

## Update Frequency

- INFINITAS Music List: Every hour at :00
- SP☆11 Difficulty Tables: Every hour at :30

## Data Sources

- INFINITAS Music List: [KONAMI Official Website](https://p.eagate.573.jp/game/infinitas/2/music/index.html)
- SP☆11 Difficulty Tables: [SP☆11 Difficulty Table Wiki](https://w.atwiki.jp/bemani2sp11/)

## License

ISC
