import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { PlaylistTracks } from 'react-spotify-api'
import { Playlist } from 'react-spotify-api'
import { Page, Text, View, Document, PDFDownloadLink, StyleSheet } from '@react-pdf/renderer';

// Create styles
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4'
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  }
});

const PDFDocument = ({lyrics}) => (
  <Document>
    <Page size="A4" style={pdfStyles.page} wrap>
      <View style={pdfStyles.section}>
        {
          lyrics.map((lyric) => <Text break>{lyric}</Text>)
        }
      </View>
      <Text render={({ pageNumber, totalPages }) => (
        `${pageNumber} / ${totalPages}`
      )} fixed />
    </Page>
  </Document>
);

const fetcher = async (url, options = {}) => {
  const res = await fetch(url, options)
  const data = await res.json()

  if (res.status !== 200) {
    throw new Error(data.message)
  }
  return data
}

const Track = ({track, checked, handleChange}) => (
  <li key={track.track.id}><input type="checkbox" onChange={handleChange} key={track.track.id} name={track.track.id} id={track.track.id} checked={checked}/>{track.track.name}</li>
)

const PlaylistPage = () => {
  const router = useRouter()
  const { id } = router.query
  const [loadedTracks, setLoadedTracks] = useState({});
  const [lyrics, setLyrics] = useState([]);
  const [state, setState] = useState({
    tracksChecked: {},
  })

  useEffect(() => {
    console.log("useEffect: ", { state });
  }, [state])

  const handleChange = (e) => {
   const { name, checked } = e.target;
    console.log('Click: =======> ', { name, checked });
    setState((prevState) => ({
      ...prevState,
      tracksChecked: {
        ...prevState.tracksChecked,
        [name]: !prevState.tracksChecked[name],
      },
    }))
  }

  const toggleAll = () => {
    setState({ tracksChecked: Object.keys(loadedTracks).reduce((m, id) => {
      m[id] = true;
      return m;
    }, {})})
  }

  const generateLyrics = () => {
    console.log('[Generating lyrics] =======================> Checking...')

    if (loadedTracks && Object.values(loadedTracks).length) {
      const tracks = Object.values(loadedTracks).map(({track}) => {
        return { name: track.name, artist: track.artists[0].name }
      });
      console.log('[Generating lyrics] =======================> ', { tracks })

      fetcher('/api/lyrics', {
        method: "POST",
        body: JSON.stringify({tracks}),
        headers: {"Content-type": "application/json; charset=UTF-8"}
      }).then(({ lyrics }) => {
        console.log('Fetched: =========> ', lyrics);
        setLyrics(lyrics)
      })
    }
  }

  console.log({loadedTracks});
  console.log({state});

  return (
    <>
      <Playlist id={id}>
        {(playlist, loading, error) => (
            playlist ?  <p>Playlist: {playlist?.data?.name}</p> : null
        )}
      </Playlist>
    <div>
      Check all: <input type="checkbox" onClick={toggleAll} />
    </div>
    <div>
      Generate Lyrics: <input type="button" onClick={generateLyrics} value="Generate Lyrics" />
    </div>

      <PlaylistTracks id={id}>
        {(tracks, loading, error) => {
            console.log({tracks, loading, error})
            if (loading) return (<p>Loading...</p>);
            if (error) return (<p>Error: {error}</p>);
            if (!tracks) return (<p>No tracks</p>);
            
            if (!loadedTracks || (loadedTracks && !Object.keys(loadedTracks).length)) {
              setLoadedTracks(tracks?.data?.items.reduce((memo, item) => {
                memo[item.track.id] = item;
                return memo;
              }, {}));
            }

            return tracks?.data?.items?.map((track, index) => <Track track={track} checked={!!state.tracksChecked[track.track.id]} handleChange={handleChange} />) || <p>No tracks</p>
          }
        }
      </PlaylistTracks>
    { lyrics && !!lyrics.length && (
      <PDFDownloadLink document={<PDFDocument lyrics={lyrics} />} filename="lyrics.pdf">
      {({ blob, url, loading, error }) =>
        loading ? 'Loading document...' : 'Download'
      }
      </PDFDownloadLink>) }
    </>
  )
}

export default PlaylistPage
