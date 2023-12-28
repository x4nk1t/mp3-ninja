'use server'

import ytdl from 'ytdl-core'

const baseUrl = "https://youtube.com/watch?v=";

function createHash(object) {
    return Buffer.from(JSON.stringify(object)).toString("base64");
}

function getData(youtubeId){
    return new Promise((resolve, reject) => {
        const youtubeLink = baseUrl + youtubeId;

        ytdl.getBasicInfo(youtubeLink).then(videoInfo => {
            const songName = videoInfo.videoDetails.title.replace("/", "");

            const trackId = createHash({url: youtubeLink, songName: songName});
            const details = videoInfo.videoDetails;

            details.trackId = trackId;
            
            return resolve(details);
        }).catch(error => {
            return resolve({ error: 1, message: error.message });
        });
    });
}

export async function GET(request, { params }) {
    const { youtubeId } = params;
    
    const data = await getData(youtubeId);
    
    return Response.json(data);
}