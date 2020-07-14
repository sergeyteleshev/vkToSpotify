import React, { Component } from 'react';
import './App.css';

import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();

class App extends Component {
  constructor(){
    super();
    const params = this.getHashParams();
    const token = params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    this.state = {
      loggedIn: token ? true : false,
      nowPlaying: { name: 'Not Checked', albumArt: '' },
      foundSongs: [],
    };

    this.searchSong.bind(this);
  }
  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
       e = r.exec(q);
    }
    return hashParams;
  }

  getNowPlaying(){
    spotifyApi.getMyCurrentPlaybackState()
      .then((response) => {
        this.setState({
          nowPlaying: { 
              name: response.item.name, 
              albumArt: response.item.album.images[0].url
            }
        });
      })
  }

  searchSong(text)
  {
      let songs = [];

      spotifyApi.searchTracks(text).then(
          function (data) {
              console.log('Search by ' + text, data);
              let spotifyItems = data.tracks.items;
              console.log("HIY");

              for(let i = 0; i < spotifyItems.length; i++)
              {
                  console.log(spotifyItems[i]);
                  songs.push(spotifyItems[i].name);
              }
              console.log(songs);
          },
          function (err) {
              console.error(err);
          }
      );

      if(songs.length) this.setState({foundSongs: songs});
  }

  render() {
    return (
      <div className="App">
        <a href='http://localhost:8888' > Login to Spotify </a>
        <div>
          Now Playing: { this.state.nowPlaying.name }
        </div>
        <div>
          <img src={this.state.nowPlaying.albumArt} style={{ height: 150 }}/>
        </div>
        { this.state.loggedIn &&
          <button onClick={() => this.getNowPlaying()}>
            Check Now Playing
          </button>
        }
        <div>
            <p>Поиск песен: </p>
            <input type={"text"} onChange={e => this.searchSong(e.target.value)}/>
            {this.state.foundSongs.toString()}
        </div>
      </div>
    );
  }
}

export default App;
