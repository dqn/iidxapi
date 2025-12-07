# infapi - beatmania IIDX INFINITAS Music List API

This repository automatically scrapes the [official website](https://p.eagate.573.jp/game/infinitas/2/music/index.html) every hour and publishes the data to GitHub Pages.

## API Usage

The music list is available at the following URL:


https://dqn.github.io/infapi/music.json

### Data Format

```json
[
  {
    "title": "Song Title",
    "artist": "Artist Name"
  },
  // ...
]
```

- **Update Frequency**: Hourly

## License

ISC
