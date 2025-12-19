# iidxapi - beatmania IIDX API

This repository provides beatmania IIDX related data via GitHub Pages. Data is automatically scraped and updated using GitHub Actions.

## API

### INFINITAS Music List

Get the list of songs available in beatmania IIDX INFINITAS.

https://dqn.github.io/iidxapi/infinitas/music.json

```json
[
  {
    "title": "Song Title",
    "artist": "Artist Name"
  }
]
```

### Difficulty Tables

Get the SP☆11/12 difficulty tables for Normal and Hard clear.

```json
[
  {
    "title": "Song Title",
    "tier": "地力S"
  }
]
```

#### SP☆11

Normal:

https://dqn.github.io/iidxapi/sp11/normal.json

Hard:

https://dqn.github.io/iidxapi/sp11/hard.json

#### SP☆12

Normal:

https://dqn.github.io/iidxapi/sp12/normal.json

Hard:

https://dqn.github.io/iidxapi/sp12/hard.json

## Update Frequency

- INFINITAS Music List: Every hour at :00
- SP☆11/12 Difficulty Tables: Every hour at :30

## Data Sources

- https://p.eagate.573.jp/game/infinitas/2/music/index.html
- https://w.atwiki.jp/bemani2sp11/pages/22.html
- https://w.atwiki.jp/bemani2sp11/pages/21.html
- https://w.atwiki.jp/bemani2sp11/pages/19.html
- https://w.atwiki.jp/bemani2sp11/pages/18.html

## License

ISC
