import lyricsSearcher from "lyrics-searcher";

const DELAY = 1500;

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { tracks } = req.body;

    let tasks = [];
    for (let i = 0; i < tracks.length; i++) {
      const delay = DELAY * i;

      tasks.push(new Promise(async function(resolve) {
        const track = tracks[i];
        const { name, artist } = track;

        console.log(`Now waiting to execute lyrics search for ${name} by ${artist} with delay: ${delay} ms`);
        await new Promise(res => setTimeout(res, delay));

        console.log(`Now executing lyrics search for ${name} by ${artist}`);
        const lyrics = await lyricsSearcher(name, artist);

        resolve({name, artist, lyrics});
      }));
    }

    return Promise.all(tasks).then(data => {
      res.status(200).json({ data })
    }).catch((error) => {
      console.log(error)
      res.status(500).json({ error })
    })
  } else {
    res.status(404).json({ message: 'Unsupported method' })
  }
}
