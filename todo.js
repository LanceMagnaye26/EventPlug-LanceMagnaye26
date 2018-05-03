const fs = require('fs');
const request = require('request');

var loadFile = () => {
	try {
		return JSON.parse(fs.readFileSync('accounts.json'));
	}
	catch (exception) {
		if(exception.code === 'ENOENT') {
			fs.writeFileSync('accounts.json', '{}');
			return JSON.parse(fs.readFileSync('accounts.json'));
		}
	}
};


var duplicateUsers = (usersArr, username) => {
	usersArr = loadFile();
	for (var i = 0; i < usersArr.length; i++) {
		if(username == usersArr[i].user) {
			return 0
		}else {
			return 1
		}
	}
};

var loginCheck = (usersArr, username, password) => {
	usersArr = loadFile();
	if(username in usersArr) {
		if(password == usersArr[username].pass) {
			usersArr[username].loggedin = 'yes'
			writeFile(usersArr);
			return 1
		}else {
			return 0
		}
	}else {
		return 0
	}
}

var passCheck = (pass1, pass2) => {
	if(pass1 == pass2) {
		return 1
	}else {
		return 0
	}
};

var writeFile = (usersArr) => {
	fs.writeFileSync('accounts.json', JSON.stringify(usersArr));
};


var addUser = (usersArr, username, password) => {
	usersArr = loadFile();
	// var account = {
	// 	user: username,
	// 	pass: password
	// };

	// usersArr.push(account);
	usersArr[username] = {
		pass: password,
		playlist: [],
		loggedin: 'no'
	}
	writeFile(usersArr);
};

var getArtistID = (artist, apiKey) => {
    return new Promise((resolve,reject) => {
        request({
            url: `http://api.songkick.com/api/3.0/search/artists.json?apikey=${apiKey}&query=${encodeURIComponent(artist)}`,
            json: true
        }, (error, response, body) => {
            if (error) {
                reject('Cannot connect to Songkick API');
                console.log(error);
            }else if (body.resultsPage.totalEntries == 0) {
                resolve({
                    error : 'Artist Not Found'
                });
            }else {
                resolve({
                    uri: body.resultsPage.results.artist[0]['uri'],
                    id: body.resultsPage.results.artist[0]['id']
                });
            }
        });
    });
};

var getConcerts = (id, apiKey) => {
    return new Promise((resolve,reject) => {
        request({
            url: `http://api.songkick.com/api/3.0/artists/${id}/calendar.json?apikey=${apiKey}`,
            json: true
        }, (error, response, body) => {
            if (error) {
                reject('Cannot connect to Songkick API');
                console.log(error);
            }else if (body.resultsPage.totalEntries == 0) {
                resolve({
                    error : 'Concert not Found'
                });
            }else {
                var concertlist = [];
                var concertThing = {};
                var innerConcert = {};
                for (var i = 0; i < body.resultsPage.results.event.length; i++) {
                    concertThing['event' + i] = {
                        name: body.resultsPage.results.event[i].venue.displayName,
                        date: body.resultsPage.results.event[i].start.date,
                        city: body.resultsPage.results.event[i].location.city,
                        lat: body.resultsPage.results.event[i].location.lat,
                        lng: body.resultsPage.results.event[i].location.lng
                    };
                }
                resolve(concertThing);
                // resolve({
                //     uri: body.resultsPage.results.artist[0]['uri'],
                //     id: body.resultsPage.results.artist[0]['id']
                // });
            }
        });
    });
};

var getTracks = (trackName, key) => {
  return new Promise((resolve,reject) => {
    request({
      url: `http://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(trackName)}&api_key=${key}&format=json&limit=10`,
      json: true
    }, (error, response, body) => {
      if (error) {
      	reject('Cannot connect to LastFM API');
      	console.log(error);
      }else if (body.results['opensearch:totalResults'] == 0) {
      	resolve({
      		'Could not find song': 'Could not find song'
      	});
      }else {
      	var trackObject = {};
      	for (var i = 0; i < body.results.trackmatches.track.length; i++) {
      		trackObject[body.results.trackmatches.track[i].artist] = {
      			songTitle: body.results.trackmatches.track[i].name,
      			img: body.results.trackmatches.track[i].image[2]['#text']
      		}
      	}
        resolve(trackObject);
      } 
    });
  });
};

var logoutCheck = (usersArr) => {
	usersArr = loadFile();
	for (var user in Object.keys(usersArr)) {
		if(Object.values(usersArr)[user].loggedin == "yes") {
			Object.values(usersArr)[user].loggedin = "no";
		}
	}
	writeFile(usersArr);
}

// var loginCheck = (usersArr, username, password) => {
// 	var check = 0;
// 	usersArr = loadFile();
// 	for (var i = 0; i < usersArr.length; i++) {
// 		if(username == usersArr[i].user && password == usersArr[i].pass) {
// 			check = 1
// 			break;
// 		}
// 	}
// 	return check
// };

// var logoutCheck = (usersArr, username) => {
// 	usersArr = loadFile();
// 	for (var user in Object.keys(usersArr)) {
// 		if(Object.keys(usersArr)[user] == username) {
// 			if(Object.values(usersArr)[user].loggedin == "yes") {
// 				console.log(Object.values(usersArr)[user].loggedin)
// 				Object.values(usersArr)[user].loggedin = "no";
// 				console.log(Object.values(usersArr)[user].loggedin)
// 			}
// 		}
// 	}
// 	writeFile(usersArr);
// }

var addPlaylist = (usersArr, song) => {
	usersArr = loadFile();
	for (var user in Object.keys(usersArr)) {
		if(Object.values(usersArr)[user].loggedin == "yes") {
			if (song in Object.values(usersArr)[user].playlist) {
				console.log('Song already existed')
			}else {
				Object.values(usersArr)[user].playlist.push(song);
			}
		}
	}
	writeFile(usersArr);
}

// var showPlaylist = ();

module.exports = {
	loadFile, writeFile, addUser, passCheck, duplicateUsers, loginCheck, getTracks, logoutCheck, addPlaylist, getTracks, getConcerts, getArtistID
};