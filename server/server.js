const express = require("express");
const fs = require("fs");
const ytdl = require("ytdl-core");
const crypto = require("crypto");

const sqlite = require("sqlite3").verbose();

const db = new sqlite.Database("./tracks.db", (err) => {
    if (err) {
        return console.error(err);
    }

    console.log("Connected to sqlite db");
});

const app = express();
const port = process.env.PORT || 8080;

const baseUrl = "https://youtube.com/watch?v=";

app.listen(port, () => {
    console.log("Server listening on port: " + port);
});

app.get("/", (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.status(400).json({ error: 1, message: "Bad request!" });
});

app.get("/details/:youtubelink", (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    const youtubeId = req.params.youtubelink;
    const link = baseUrl + youtubeId;

    ytdl.getBasicInfo(link).then(videoInfo => {
        const songName = videoInfo.videoDetails.title.replace("/", "");

        const trackId = createHash(youtubeId);
        const fileToWrite = fs.createWriteStream("./downloaded/" + songName + ".mp3");

        setSongNameToTrack(trackId, songName);

        ytdl(link, {
            filter: 'audioonly'
        }).pipe(fileToWrite);

        const details = videoInfo.videoDetails;

        details.trackId = createHash(youtubeId);

        res.status(200).json(details);
    }).catch(error => {
        res.status(404).json({ error: 1, message: error.message });
    });
});

app.get("/download/:trackid", async (req, res) => {

    const trackId = req.params.trackid;

    var fileName = await getSongNameFromTrack(trackId);

    if (fileName == null) {
        res.status(404).json({ error: 1, message: "File not found!" });
        return;
    }

    const exist = fs.existsSync("./downloaded/" + fileName + ".mp3");

    if (exist) {
        res.set("content-disposition", "attachment; filename="+ fileName +".mp3");
        fs.createReadStream('./downloaded/' + fileName + '.mp3').pipe(res);
    } else {
        res.status(404).json({ error: 1, message: "File not found!" });
    }
});

function createHash(string) {
    return crypto.createHash('md5').update(string).digest('hex');
}

function getSongNameFromTrack(trackId) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM tracks WHERE id=?", [trackId], (err, row) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(row.name);
        });
    });

}

function setSongNameToTrack(trackId, songName) {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO tracks(id, name) VALUES (?, ?)", [trackId, songName], (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve({ error: 0 });
        });
    });
}