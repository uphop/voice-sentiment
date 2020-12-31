# Real-time voice sentiment assessment with RecordRTC, Vosk and TextBlob

## Overview

This is a simple sentiment analysis application, transcribing a real-time audio input from microphone into text using [Vosk](https://alphacephei.com/vosk/), and then running a sentiment analysis on that text with [TextBlob](https://textblob.readthedocs.io/en/dev/) and visualising [sentiment scores](https://www.quora.com/What-is-polarity-and-subjectivity-in-sentiment-analysis) - polarity (i.e. emotions expressed in a sentence) and subjectivity (which expresses some personal feelings, views, or beliefs).

The project consists of the following modules:
* `voice-sentiment-app`: a React application, which captures audio stream from a microphone, streams audio chunks via a websocket to `speech-to-text-server` for transcribing, and then the transcribed text to `sentiment-assessment-server` to get sentiment scores.
* `speech-to-text-server`: a Python-based server, which gets audio chunks from `voice-sentiment-app` via a websocket, and runs a STT (Speech-to-Text) transcription.
* `speech-to-text-server`: a Python-based server, which gets transcribed text from `voice-sentiment-app` via a websocket, and runs a sentiment analysis.

The following are key 3rd party components used:
* [RecordRTC](https://recordrtc.org/) - used in `voice-sentiment-app` to capture audio input
* [Vosk](https://alphacephei.com/vosk/) - used in `speech-to-text-server` for voice-to-text transcription
* [TextBlob](https://textblob.readthedocs.io/en/dev/) - used for text sentiment analysis in `sentiment-assessment-server`
* [d3](https://d3js.org/) - used in `voice-sentiment-app` for sentiment score visualisation

## Setting-up
Clone full project:
```
git clone git@github.com:uphop/voice-sentiment.git
cd voice-sentiment
```

Install dependencies and prepare configuration for `voice-sentiment-app`:
```
cd voice-sentiment-app
yarn install
cp .env.sample .env
cd ..
```

Install dependencies and prepare configuration for `sentiment-assessment-server`:
```
cd sentiment-assessment-server
pip3 install -r requirements.txt
cp .example-env .env
cd..
```

Install dependencies and prepare configuration for `speech-to-text-server`:
```
cd speech-to-text-server
pip3 install -r requirements.txt
cp .example-env .env
cd ..
```

Download language model for `speech-to-text-server` from [here](https://alphacephei.com/vosk/models):
```
cd speech-to-text-server
wget https://alphacephei.com/vosk/models/vosk-model-en-us-aspire-0.2.zip
unzip https://alphacephei.com/vosk/models/vosk-model-en-us-aspire-0.2.zip
mv vosk-model-en-us-aspire-0.2 model
rm vosk-model-en-us-aspire-0.2.zip
cd ..
```

## Starting-up

Start `sentiment-assessment-server`:
```
cd sentiment-assessment-server
./run.sh
```

Start `speech-to-text-server`:
```
cd speech-to-text-server
./run.sh
```

Start `voice-sentiment-app`:
```
cd voice-sentiment-app
yarn start
```

## Usage

Press recording button, and start speaking into the microphone - the app will be capturing your speech, attempting to transcribe / assess sentiment scores, and visualise those as polartiy / subjectivity charts.

The text will be appended to the text area at the bottom of the page as soon as that is transcribed. Also, sentiment scores will be updated and visualised as soon as calculated based on the latest transcribed phrase.

Here is an example of what you should see as the result:
![Screenshot](https://user-images.githubusercontent.com/74451637/102792387-1c6b5280-43b1-11eb-8dab-590c59007117.png)

And here is a recorded example of transcribing / sentiment score assessment while streaming [this sample YoutTube video](https://youtu.be/FfhZFRvmaVY) with an English practice lesson:

[![Recorded_sample](http://img.youtube.com/vi/4XegsEG1NUU/0.jpg)](http://www.youtube.com/watch?v=4XegsEG1NUU "Voice Sentiment example")



