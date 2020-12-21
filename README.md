# Overview

This is a simple sentiment analysis application, transcribing audio input from microphone into text, running a sentiment analysis on that text and visualising [sentiment scores](https://www.quora.com/What-is-polarity-and-subjectivity-in-sentiment-analysis) - polarity (i.e. emotions expressed in a sentence) and subjectivity (which expresses some personal feelings, views, or beliefs).

The project consists of of the following modules:
* `voice-sentiment-app`: a React application, which captures audio stream from a microphone, streams audio chunks via a websocket to `speech-to-text-server` for transcribing, and then the transcribed text to `sentiment-assessment-server` to get sentiment scores.
* `speech-to-text-server`: a Python-based server, which gets audio chunks from `voice-sentiment-app` via a websocket, and runs a STT (Speech-to-Text) transcription.
* `speech-to-text-server`: a Python-based server, which gets transcribed text from `voice-sentiment-app` via a websocket, and runs a sentiment analysis.

The following are key components and frameworks used:
* [RecordRTC](https://recordrtc.org/) - used in `voice-sentiment-app` to capture audio input
* [Vosk](https://alphacephei.com/vosk/) - used in `speech-to-text-server` for voice-to-text transcription
* [TextBlob](https://textblob.readthedocs.io/en/dev/) - used for text sentiment analysis in `sentiment-assessment-server`
* [d3](https://d3js.org/) - used in `voice-sentiment-app` for sentiment score visualisation

# Setting-up
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
```

Install dependencies and prepare configuration for `sentiment-assessment-server`:
```
cd sentiment-assessment-server
pip3 install -r requrements.txt
cp .example-env .env
```

Install dependencies and prepare configuration for `speech-to-text-server`:
```
cd speech-to-text-server
pip3 install -r requrements.txt
cp .example-env .env
```

Download language model for `speech-to-text-server` from [here](https://alphacephei.com/vosk/models):
```
wget https://alphacephei.com/vosk/models/vosk-model-en-us-aspire-0.2.zip
unzip https://alphacephei.com/vosk/models/vosk-model-en-us-aspire-0.2.zip
mv vosk-model-en-us-aspire-0.2 model
rm vosk-model-en-us-aspire-0.2.zip
```

# Usage

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

