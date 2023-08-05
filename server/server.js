const express = require("express");
const fs = require("fs");
const ytdl = require("ytdl-core");

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

        const trackId = createHash({url: link, songName: songName});
        const details = videoInfo.videoDetails;

        details.trackId = trackId;

        res.status(200).json(details);
    }).catch(error => {
        res.status(404).json({ error: 1, message: error.message });
    });
});

app.get("/download/:trackid", async (req, res) => {
    const trackId = req.params.trackid;
    
    const details = dehash(trackId);

    if(details.songName == null || details.url == null){
        res.status(400).json({error: 1, message: "Invalid data!"});
        return;
    }

    const songName = details.songName;
    const url = details.url;
    res.setHeader("Content-Disposition", "attachment; filename=\""+ songName +".mp3\"");

    ytdl(url, {
        filter: 'audioonly'
    }).pipe(res);
});

function createHash(object) {
    return Buffer.from(JSON.stringify(object)).toString("base64");
}

function dehash(string){
    const rawData =  Buffer.from(string, "base64").toString("ascii");

    try {
        const parse =  JSON.parse(rawData);
        return parse;
    } catch {
        return {songName: null, url: null};
    }
}