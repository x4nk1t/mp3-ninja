import ytdl from "ytdl-core";

function dehash(string){
    const rawData =  Buffer.from(string, "base64").toString("ascii");

    try {
        const parse =  JSON.parse(rawData);
        return parse;
    } catch {
        return {songName: null, url: null};
    }
}

export function GET(request, response) {
    const { trackId } = response.params;
    const headerResponse = new Headers(response.headers);

    const details = dehash(trackId);

    if (details.songName == null || details.url == null) {
        return Response.json({ error: 1, message: "Invalid data!" });
    }

    const songName = details.songName;
    const url = details.url;
    headerResponse.set("Content-Disposition", "attachment; filename=\"" + songName + ".mp3\"");

    const data = ytdl(url, {
        filter: 'audioonly'
    });

    return new Response(data, {
        headers: headerResponse
    });
}