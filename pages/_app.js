import React from 'react'
import { SpotifyApiContext } from 'react-spotify-api'
import Cookies from 'js-cookie'

import { SpotifyAuth, Scopes } from 'react-spotify-auth'
import 'react-spotify-auth/dist/index.css'
import '../styles/globals.css'

function App({ Component, pageProps }) {
  const [token, setToken] = React.useState(Cookies.get("spotifyAuthToken"))

  if (!token) return (
    <SpotifyAuth
      redirectUri='http://localhost:3000/'
      clientID='503b77ce295049eab18d1b340e59f005'
      scopes={[Scopes.userReadPrivate, Scopes.playlistReadPrivate, Scopes.userLibraryRead]}
      onAccessToken={(token) => setToken(token)}
    />
  );

  return (
    <div className='app'>
      <SpotifyApiContext.Provider value={token}>
        {/* Your Spotify Code here */}
        <p>You are authorized with token: {token}</p>
        <Component {...pageProps} authToken={token}/>
      </SpotifyApiContext.Provider>
    </div>
  )
}

export default App
