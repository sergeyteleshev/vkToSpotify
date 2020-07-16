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

        this.getSpotifySongId.bind(this);
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

    convertPlsToArray()
    {
        // 3 8 12
        let songs = []
        let plsText = document.getElementById("textFrom").value;

        var regexp = /[\w\А-Яа-я-.?!)(,:].* - [\wа-яА-Я-.?!)(,:].*/gi;
        var unclear_songs = plsText.match(regexp);

        for(let i = 0; i < unclear_songs.length; i++)
        {
            songs.push(unclear_songs[i].split("=")[1]);
        }

        return songs;
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
        const minAmountOfTracksToSend = 49;
        let amountOfSmallArrays = Math.ceil(idArray.length / minAmountOfTracksToSend);
        let currentIndex = 0;

        for(let i = 0; i < amountOfSmallArrays; i++)
        {
          let response = null;
          let arrayToSend = [];

          if(currentIndex + minAmountOfTracksToSend >= idArray.length)
            arrayToSend = idArray.slice(currentIndex, idArray.length + 1);
          else
            arrayToSend = idArray.slice(currentIndex, currentIndex + minAmountOfTracksToSend + 1);

          console.log(arrayToSend);
          console.log(currentIndex,currentIndex+minAmountOfTracksToSend, idArray.length);

          await spotifyApi.addToMySavedTracks(arrayToSend).then(
              data => {
                  response = data;
              },
              err => {
                  console.error(err);
              }
          );

          console.log(response);
          currentIndex += minAmountOfTracksToSend;
        }
    }

    parseTxt()
    {
        let text = document.getElementById("textFrom").value;
        let spitedText = text.split(",");
        let songs = spitedText.filter((element, index, array) => {
          if(index === 1)
              return element;

          if (index >= 3 && ((index - 2) % 2 !== 0))
              return array[index - 3];
        });

        return songs;
    }

    async getSpotifySongId(text)
    {
        let songs = [];
        await spotifyApi.searchTracks(text).then(
            function (data) {
              let spotifyItems = data.tracks.items;

              if(spotifyItems.length !== 0)
              {
                  for(let i = 0; i < 1; i++)
                  {
                      let splittedSongUri = spotifyItems[i].uri.split(":");
                      let songId = splittedSongUri[splittedSongUri.length - 1];

                      songs.push(
                          {
                              fullSongText: spotifyItems[i].artists[0].name + " - " + spotifyItems[i].name,
                              id: songId,
                          }
                      );
                  }
              }
            },
            function (err) {
              console.error(err);
            }
        );

        console.log(songs);
        if(songs.length > 0 && songs[0].id && songs[0].id.length > 0)
            return songs[0].id;
        else
            return null
    }

    async convertSongsArrayToSpotifyLibrary()
    {
        const songs = this.convertPlsToArray();
        let nullCount = 0;

        let songsIds = [];

        for(let i = 0; i < songs.length; i++)
        {
            let songId = await this.getSpotifySongId(songs[i]);
            if (songId === null)
            {
                nullCount++;
                continue;
            }

            songsIds.push(songId);
        }

        alert(nullCount);

        await this.addSongToLibrary(songsIds);
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
            <input type={"button"} value={"addToLibaryById"} onClick={() => this.addSongToLibrary(["5RSvxUfrp8Nod1e1DDlHqS"])}/>
        </div>
          <div>
              From
              <textarea id={"textFrom"}/>
          </div>
          <div>
              <input type={"submit"} value={"parse text"} onClick={() => this.convertPlsToArray()}/>
          </div>
          <div>
              <input type={"submit"} value={"All songs list to Spotify"} onClick={() => this.convertSongsArrayToSpotifyLibrary()}/>
          </div>
      </div>
    );
  }
}

export default App;
