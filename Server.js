let
    spManager = require('./SpotifyManager'),
    bodyParser = require('body-parser'),
    express = require('express'),
    app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


let player;


app.get('/', (req, res) => {

    // let extra = res.playerData ? ``
    // `
    //     <p>CURRENT TRACK: ${JSON.stringify(player.currentTrack)}</p>
    //     <img src='${player.currentTrack.albumArt}'></img>
    // `
    // ``: '';

    res.send(
        `
        <html>
            <head><title>Test</title></head>
            <ul>
                <li><a href='/prev'>previous track</a></li>
                <li><a href='/next'>next track</a></li>
                <li><a href='/play_pause'>play/pause</a></li>
                <li><a href='/stop'>stop</a></li>
            </ul>
            <p>CURRENT TRACK: ${JSON.stringify(player.currentTrack)}</p>
        </html>
        `
    );
})

app.get('/prev', (req, res) => {
    player.prevTrack((err, t) => {
        if (!err) {
            res.playerData = player.currentTrack;
            res.redirect('/');
        }
    });
})

app.get('/next', (req, res) => {
    player.nextTrack((err, t) => {
        if (!err) {
            res.playerData = player.currentTrack;
            res.redirect('/');
        }
    });
})

app.get('/play_pause', (req, res) => {
    player.playPause((err, t) => {
        if (!err) {
            res.playerData = player.currentTrack;
            res.redirect('/');
        }
    });
})

app.get('/stop', (req, res) => {
    player.stopTrack((err, t) => {
        if (!err) {
            res.playerData = player.currentTrack;
            res.redirect('/');
        }
    });
})

spManager.buildManager((err, _player) => {

    if (err) {
        console.log(err);
        process.exit(1);
    } else {
        player = _player;
        app.listen(3000, () => { console.log('Server is running on port 3000'); });
    }
});