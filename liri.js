require("dotenv").config();

var keys = require("./keys.js");
var request = require("request");
var fs = require("fs");
var Twitter = require('twitter');
var client = new Twitter(keys.twitter);
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);
var params = {count: 20}; //parameter for the last 20 tweets
var liriCommand = process.argv[2]; //command for Liri inputted by user
var userInput = process.argv.slice(3).join("+"); //input from user for selection

function liriFunction (liriCommand, userInput) {
    logEntry(liriCommand); //append command to log.txt

    switch (liriCommand) { //switch statement for commands

        case "my-tweets": 
            // node liri.js my-tweets
            displayTweets();
            break;
    
        case "spotify-this-song":
            // node liri.js spotify-this-song '<song name here>'
            displaySongInfo(userInput);
            break;
    
        case "movie-this":
            // node liri.js movie-this '<movie name here>'
            displayMovieInfo(userInput);
            break;
        case "do-what-it-says":
            fs.readFile("random.txt", "utf8", function(error, data) {
                if (error) {
                    return console.log(error);
                }
                
                var dataArr = data.split(",");

                liriFunction(dataArr[0], dataArr[1]);
                
    
            });
            break;
        default:
            console.log("Enter one of the Liri commands: my-tweets, spotify-this-song '<song name here>', movie-this '<movie name here>' or do-what-it-says");
    }
}


function displayTweets() {
    client.get('statuses/user_timeline', params, function(error, tweets) {
        if(error) throw error;

        for (var i = 0; i < tweets.length; i++) {
            // stored output into a var to be used as arguments for console.log & logEntry()
            var resOutput = "----------" + '\n' +
                tweets[i].created_at + '\n' + //when tweet was created
                tweets[i].text + '\n' + // tweet text
                "----------"; 

            console.log(resOutput);
            logEntry(resOutput);
        }
    });
};

function displaySongInfo(song) {
    var songQuery;
    if (song != "") {
        songQuery = song;
    } else {
        songQuery = "The Sign";
    }
    
    console.log(songQuery);

    spotify.search({ type: 'track', query: `"${songQuery}"`, limit: 1 }, function(err, data) {
        var songData = data.tracks.items[0];

        if (err) {
        return console.log('Error occurred: ' + err);
        } 
    
        // console.log(JSON.stringify(data, null, 2));

        var resOutput = "----------" + '\n' +
            "Song Artist: " + songData.artists[0].name + '\n' + //artist
            "Song name: " + songData.name + '\n' + //song name 
            "Song preview: " + songData.external_urls.spotify + '\n' + //song preview
            "Album name: " + songData.album.name + '\n' + //album name
            "----------";

            console.log(resOutput);
            logEntry(resOutput);
    });
};

function displayMovieInfo(movie) {
    var movieQuery;
        
    if (movie != "") {
        movieQuery = movie;
    } else {
        movieQuery = "Mr. Nobody";
    }
    
    var queryUrl = "http://www.omdbapi.com/?t=" + movieQuery + "&y=&plot=short&apikey=trilogy";

    request(queryUrl, function(error, response, body) {

        if (!error && response.statusCode === 200) {
            var bodyObj = JSON.parse(body);

            var resOutput = "----------" + '\n' +
                bodyObj.Title + '\n' +
                "The movie's release year is: " + bodyObj.Year + '\n' +
                "IMDB Rating: " + bodyObj.imdbRating + '\n' +
                "Rotten Tomatoes Rating: " + bodyObj.Ratings[1].Value + '\n' +
                "Produced in: " + bodyObj.Country + '\n' +
                "Language: " + bodyObj.Language + '\n' +
                "Plot: " + bodyObj.Plot + '\n' +
                "Actors: " + bodyObj.Actors + '\n' +
                "----------";

            console.log(resOutput);
            logEntry(resOutput);
        }
    });
};

function logEntry(data) {
    fs.appendFile("log.txt", data, function(err) {
        if (err) {
            console.log(err);
        } 
    });
};


liriFunction(liriCommand, userInput);