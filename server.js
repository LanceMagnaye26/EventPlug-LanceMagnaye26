const express = require('express');
const request = require('request');
const hbs = require('hbs');
const fs = require('fs');
const port = process.env.PORT || 8080;
const bodyParser = require('body-parser');
const todo = require('./todo.js');

var key = '88668b813557eb90cd2054ce6cd4c990';
var key2 = "4nuZkjXqOYPvMAIEtqyRhyaivjgtB76R"
var app = express();

// var a_user = '';
// var a_pass = '';

var accounts = {};

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) 


hbs.registerPartials(__dirname + '/views/partials');

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/views'));

hbs.registerHelper('getCurrentYear', () => {
	return new Date().getFullYear();
})

app.get('/', (request, response) => {
	todo.logoutCheck(accounts);
	response.render('login.hbs', {
		title: 'Login page'
	})
});

app.post('/', (request, response) => {
	// a_user = request.body.userLogin;
	// a_pass = request.body.passLogin;
	if ( todo.loginCheck(accounts, request.body.userLogin, request.body.passLogin) == 1) {
		response.render('mainpage.hbs', {
			title: 'Main page'
		})
	}else {
		response.render('login.hbs', {
			title:'Login page'
		});
	}
});

app.get('/displayPlaylist', (request, response) => {
	response.render('playlist.hbs', {
		title: 'My Playlist'
	})
})

// app.get('/concert', (request,response) => {
// 	response.render('concert.hbs', {
// 		title: 'Concerts near me'
// 	})
// })

app.get('/signup', (request, response) => {
	response.render('signup.hbs', {
		title: 'Sign up'
	})
});

// app.get('/mytracks', (request, response) => {
// 	response.render('mytracks.hbs', {
// 		title: 'My tracks'
// 	})
// });

app.get('/mainpage', (request, response) => {
	response.render('mainpage.hbs', {
		title: 'Track added!'
	})
});

app.post('/mainpage', (request, response) => {
	todo.getTracks(request.body.track, key).then((result) => {
		var trackList = {};
		if(result.length == 1) {
			response.render('mainpage.hbs', result[songTitle0])
		} else{
			for (var i in Object.keys(result)) {
				trackList[`songTitle${i}`] = Object.values(result)[i].songTitle
				trackList[`artist${i}`] = Object.keys(result)[i]
				trackList[`img${i}`] = Object.values(result)[i].img
			}
			// trackList['addToList'] = '<input type="submit" value="Add to playlist"/>'
			// console.log(trackList);
			response.render('mytracks.hbs', trackList)
		}
	}).catch((error) => {
		console.log('There was an error: ', error);
	});
	// todo.addPlaylist(accounts, request.body.track);
})

// app.get('/mainpage', (request,response) => {
// 	console.log(request.body.track)
// 	todo.addPlaylist(accounts, request.body.track)
// })

app.post('/tracks', (request, response) => {
	todo.addPlaylist(accounts, request.body.songName)
})


// app.post('/mainpage', (request, response) => {
// 	todo.getTracks(request.body.track, key).then((result) => {
// 		if (result['opensearch:totalResults'] != 0) {
// 			response.render('mainpage.hbs', {
// 				songTitle: result.trackmatches.track.trackMatches[0].name,
// 				img: result.trackmatches.track.trackMatches[0].image[2]['#text']
// 			});
// 		}else {
// 			response.render('mainpage.hbs', {
// 				songTitle: 'Could not find'
// 			});
// 		}
// 	}).catch((error) => {
// 		console.log('There was an error', error);
// 	})
// })

app.post('/signup', (request, response) => {
	if(todo.passCheck(request.body.password1, request.body.password2)==1) {
		todo.addUser(accounts, request.body.emailAddr, request.body.password1);
		response.render('congratulations.hbs', {
			title: 'Congratulations'
		});
	}else {
		response.render('signup.hbs', {
			title: 'Signup page'
		});
	}
});

app.listen(port, () => {
	console.log('Server is up on the port 8080');
});