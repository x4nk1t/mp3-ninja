import { useState } from 'react';
import './App.css';
import Footer from './components/footer';
import { useRef } from 'react';

export default function App() {
  const [popup, setPopup] = useState([]);
  const [message, setMessage] = useState("");
  const linkRef = useRef(null);

  const apiUrl = "http://localhost:8080/details/";
  const downloadUrlBase = "http://localhost:8080/download/";

  const closePopup = () => {
    setPopup("");
  }

  const openPopup = (data) => {
    if (data.error != null) {
      setMessage("Invalid video link");
      return;
    }

    const videoTitle = data.title;
    const trackId = data.trackId;
    const thumbnails = data.thumbnails;
    const imageUrl = thumbnails[thumbnails.length - 1].url;

    const popup = <div className='popup'>
      <div className='popup-container'>
        <div className='x-button' onClick={closePopup}>X</div>
        <img src={imageUrl} height={200} width={340} alt={videoTitle}/>
        <p>{videoTitle}</p>
        <a href={downloadUrlBase + trackId}>Download (mp3)</a>
      </div>
    </div>;

    setPopup(popup);
  };

  const validateLink = (url) => {
    if (url !== undefined || url !== '') {
      var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\?v=)([^#&?]*).*/;
      var match = url.match(regExp);
      if (match && match[2].length === 11) {
        return true;
      } else {
        return false;
      }
    }
  }

  const handleClick = event => {
    event.preventDefault();

    const youtubeLink = linkRef.current.value;

    if (youtubeLink === "" || youtubeLink === null) {
      setMessage("Please enter youtube link");
      return;
    }

    const valid = validateLink(youtubeLink);

    if (!valid) {
      setMessage("Please enter valid youtube link");
      return;
    }

    const videoId = youtubeLink.split("?v=")[1];
    setMessage("Fetching details...");

    fetch(apiUrl + videoId)
      .then(response => response.json())
      .then(data => {
        openPopup(data);
        setMessage("");
        return;
      });
  };

  return (
    <div className="App">
      <div className='content'>
        <h1 className='logo'>MP3<span className='ninja'>Ninja</span></h1>
        <h4>Download MP3 from YouTube</h4>
        <div className='space'></div>

        <div className='paste-box'>
          <input type='text' className='link-input' ref={linkRef} placeholder='Paste YouTube link here'></input>
          <button className='download-button' onClick={handleClick}>Download</button>
        </div>

        <div className='space'></div>
        <h4 className='error-message'>{message}</h4>
      </div>
      {popup}

      <Footer />
    </div>
  );
}
