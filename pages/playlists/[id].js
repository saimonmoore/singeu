import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { PlaylistTracks } from 'react-spotify-api'
import { Playlist } from 'react-spotify-api'
import { Page, Text, View, Document, PDFDownloadLink, StyleSheet } from '@react-pdf/renderer';

// Create styles
const pdfStyles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
    backgroundColor: 'white'
  },
  header: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: 'grey',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 12,
    top: 35,
    right: 50,
    textAlign: 'center',
    color: 'grey',
  }
});

const PDFDocument = ({ data }) => (
  <Document>
    <Page size="A4" style={pdfStyles.body} wrap>
      {
        data.map((song) => (
          <View break>
            <View style={pdfStyles.header}>
              <Text>{song.name} by {song.artist}</Text>
            </View>
            <View style={pdfStyles.section}>
              <Text>{song.lyrics}</Text>
            </View>
          </View>
        ))
      }
      <Text style={pdfStyles.pageNumber} render={({ pageNumber, totalPages }) => (
        `${pageNumber} / ${totalPages}`
      )} fixed />
    </Page>
  </Document>
);

const fetcher = async (url, options = {}) => {
  const res = await fetch(url, options)
  const data = await res.json()

  if (res.status !== 200) {
    console.log('Booom =============> ', { status: res.status, message: data.message })
    throw new Error(data.message)
  }
  return data
}

const Track = ({ track, checked, handleChange }) => (
  <li key={track.track.id}><input type="checkbox" onChange={handleChange} key={track.track.id} name={track.track.id} id={track.track.id} checked={checked} /><label for={track.track.id}>{track.track.name} by {track.track.artists[0].name}</label></li>
)

const PlaylistPage = () => {
  const router = useRouter()
  const { id } = router.query
  const [loadedTracks, setLoadedTracks] = useState({});
  const [data, setData] = useState([]);
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
    setState({
      tracksChecked: Object.keys(loadedTracks).reduce((m, id) => {
        m[id] = true;
        return m;
      }, {})
    })
  }

  const generateLyrics = () => {
    console.log('[Generating lyrics] =======================> Checking...')

    const { tracksChecked } = state;

    if (tracksChecked && Object.keys(tracksChecked).length) {
      const tracks = Object.keys(tracksChecked).map(id => {
        const track = loadedTracks[id];
        return { name: track.track.name, artist: track.track.artists[0].name }
      });

      console.log('[Generating lyrics] =======================> ', { tracks })

      fetcher('/api/lyrics', {
        method: "POST",
        body: JSON.stringify({ tracks }),
        headers: { "Content-type": "application/json; charset=UTF-8" }
      }).then(({ data }) => {
        console.log('Fetched: =========> ', data);
        setData(data)
      }).catch((error) => {
        console.log('Fetch error: =========> ', error);
      })
    }
  }

  console.log({ loadedTracks });
  console.log({ state });

  return (
    <>
      <Link href={`/`}><a>Back</a></Link>
      <Playlist id={id}>
        {(playlist, loading, error) => (
          playlist ? <p>Playlist: {playlist?.data?.name}</p> : (<p>{loading ? loading : error}</p>)
        )}
      </Playlist>
      {data && !!data.length && (
        <PDFDownloadLink document={<PDFDocument data={data} />} filename="lyrics.pdf">
          {({ blob, url, loading, error }) =>
            loading ? 'Loading document...' : 'Download'
          }
        </PDFDownloadLink>)}
      <div>
        Check all: <input type="checkbox" onClick={toggleAll} />
      </div>
      <div>
        Generate Lyrics: <input type="button" onClick={generateLyrics} value="Generate Lyrics" />
      </div>

      <PlaylistTracks id={id}>
        {(tracks, loading, error) => {
          console.log({ tracks, loading, error })
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
    </>
  )
}

export default PlaylistPage
