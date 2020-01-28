let
    _ = require('underscore'),
    DBus = require('dbus');


let bus = DBus.getBus('session');
let spotify = {
    service: 'org.mpris.MediaPlayer2.spotify',
    objectPath: '/org/mpris/MediaPlayer2',
    interfaces: [
        'org.mpris.MediaPlayer2.Player',
        'org.freedesktop.DBus.Properties'
    ]
};
let player = {
    nextTrack: null,
    prevTrack: null,
    playPause: null,
    stopTrack: null,
    currentTrack: null
}

let ifaceCallbackWrapper = (iface, method, callback) => {

    iface[method]((err) => {
        callback(err, player.currentTrack);
    });
};

// TODO: Find elegant way to solve this callback hell
// TODO: player.currentTrack actually shows to before-last one
let buildManager = (callback) => {

    bus.getInterface(spotify.service, spotify.objectPath, spotify.interfaces[0], (err, iface) => {

        if (err)
            callback(err, null);
        else {

            player.nextTrack = (_callback) => { ifaceCallbackWrapper(iface, 'Next', _callback) };
            player.prevTrack = (_callback) => { ifaceCallbackWrapper(iface, 'Previous', _callback) };
            player.playPause = (_callback) => { ifaceCallbackWrapper(iface, 'PlayPause', _callback) };
            player.stopTrack = (_callback) => { ifaceCallbackWrapper(iface, 'Stop', _callback) };

            bus.getInterface(spotify.service, spotify.objectPath, spotify.interfaces[1], (err, _iface) => {

                if (err) {
                    callback(err, null);
                } else {

                    _iface.on('PropertiesChanged', (str, obj, arr) => {

                        let newState = {
                            artist: obj.Metadata['xesam:artist'][0],
                            music: obj.Metadata['xesam:title'],
                            album: obj.Metadata['xesam:album'],
                            isPlaying: obj.PlaybackStatus === 'Playing'
                        };

                        if (!_.isEqual(player.currentTrack, newState))
                            player.currentTrack = newState;
                    });

                    callback(null, player);
                }
            });
        }
    });
};

module.exports = {
    buildManager
}