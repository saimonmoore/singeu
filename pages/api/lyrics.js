import lyricsSearcher from "lyrics-searcher";

export default function handler(req, res) {
  if (req.method === 'POST') {

    const { tracks } = req.body;
    console.log("[/api/lyrics] ==================> ", { tracks });

    return Promise.all(tracks.map(({name, artist}) => lyricsSearcher(name, artist))).then((lyrics) => {
      console.log('[Generated lyrics] =======================> ', { lyrics })
      const data = tracks.reduce((m, {name, artist}, index) => {
        m.push({ name, artist, lyrics: lyrics[index]})
        return m;
      }, []);
      res.status(200).json({ data })
    }).catch((error) => {
      console.log(error)
      res.status(500).json({ error })
    })
  } else {
    res.status(404).json({ name: 'John Doe' })
  }
}
