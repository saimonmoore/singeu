import lyricsSearcher from "lyrics-searcher";

export default function handler(req, res) {
  if (req.method === 'POST') {

    const { tracks } = req.body;
    console.log("[/api/lyrics] ==================> ", { tracks });

    return Promise.all(tracks.map(({name, artist}) => lyricsSearcher(name, artist))).then((lyrics) => {
      console.log('[Generated lyrics] =======================> ', { lyrics })
      res.status(200).json({ lyrics})
    }).catch((error) => {
      console.log(error)
      res.status(500).json({ error })
    })
  } else {
    res.status(404).json({ name: 'John Doe' })
  }
}
