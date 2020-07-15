import React, { Component } from 'react';
import './App.css';

import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();

class App extends Component {
  constructor()
  {
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

  getHashParams()
  {
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

  async getNowPlaying()
  {
    await spotifyApi.getMyCurrentPlaybackState()
      .then((response) => {
        this.setState({
          nowPlaying: { 
              name: response.item.name, 
              albumArt: response.item.album.images[0].url
            }
        });
      })
  }

  async getTrack(id)
  {
      let track = null;
      await spotifyApi.getTrack(id).then(
          data => {
              track = data;
          },
          err => {

          }
      );

      return track;
  }

  async addSongToLibrary(idArray)
  {
      let response = null;
      spotifyApi.addToMySavedTracks(idArray).then(
          data => {
              response = data;
          },
          err => {
              console.error(err);
          }
      );

      return response
  }

  async searchSong(text)
  {
      let songs = [];

      await spotifyApi.searchTracks(text).then(
          function (data) {
              let spotifyItems = data.tracks.items;
              
              for(let i = 0; i < spotifyItems.length; i++)
              {
                  let splittedSongUri = spotifyItems[i].uri.split(":");
                  let songId = splittedSongUri[splittedSongUri.length - 1];

                  songs.push(
                      {
                          fullSongText: spotifyItems[i].artists[0].name + " - " + spotifyItems[i].name,
                          id: songId,
                      });
              }
          },
          function (err) {
              console.error(err);
          }
      );

      return songs;
  }

  render()
  {
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
            <input type={"button"} value={"addToLibaryById"} onClick={() => this.addSongToLibrary(["5RSvxUfrp8Nod1e1DDlHqS"])}/>
        </div>
      </div>
    );
  }
}

export default App;
