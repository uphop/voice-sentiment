
cp .example-env .env
pip3 install -r requirements.txt

# Overview

This is a simple sentiment analysis application, transcribing audio input from microphone into text, running a sentiment analysis on that text and visualising (sentiment scores)[https://www.quora.com/What-is-polarity-and-subjectivity-in-sentiment-analysis] - polarity (i.e. emotions expressed in a sentence) and subjectivity (which expresses some personal feelings, views, or beliefs).

The app consists of of the following modules:
* voice-sentiment-app: a React application, which captures audio stream from a microphone, streams audio chunks via a websocket to speech-to-text-server for transcribing, and then the transcribed text to sentiment-assessment-server to get sentiment scores.
* speech-to-text-server: a Python-based server, which gets audio chunks from voice-sentiment-app via a websocket, and runs a STT (Speech-to-Text) transcription.
* 

converts audio chunks from the input into text (calling Speech-to-Text server), gets sentiment scores


The following are key components and frameworks used:
* RecordRTC - used in voice-sentiment-app to capture audio input
* Vosk - used in speech-to-text-server for voice-to-text transcription
* d3 - used for sentiment score visualisation
* TextBlob - used for text sentiment analysis in `sentiment-assessment-server`