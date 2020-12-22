// main imports
import React from 'react';
import RecordRTC, { StereoAudioRecorder } from 'recordrtc';
import LineChart from './LineChart.js'

// utils
import SocketClient from '../utils/socketClient.js'

// images
import mic_on from './../images/mic_on.png'
import mic_off from './../images/mic_off.png'

// Recording component, records audio and streams to speech-to-text service
class VoiceSentimentVisualiser extends React.Component {

    // ---------------------------------------------------------------------------
    // Init and config
    // ---------------------------------------------------------------------------
    // Constructor
    constructor(props) {
        super(props);
        // init state with streaming stopped
        this.state = {
            recording: false,
            microphone: null,
            partial: '',
            text: '',
            sentiment: {
                polarity: [],
                subjectivity: []
            }
        };

        // init handlers
        this.startRecord = this.startRecord.bind(this);
        this.stopRecord = this.stopRecord.bind(this);
        this.handleSpeechToTextResponse = this.handleSpeechToTextResponse.bind(this);
        this.handleSentimentAssessmentResponse = this.handleSentimentAssessmentResponse.bind(this);

        // init STT and SA server connections
        this.sttSocketClient = new SocketClient(process.env.REACT_APP_STT_SERVER_URL, this.handleSpeechToTextResponse);
        this.saSocketClient = new SocketClient(process.env.REACT_APP_SA_SERVER_URL, this.handleSentimentAssessmentResponse);
    }

    // after-mount init
    componentDidMount() {
        // check if browser supports streaming
        if (!(navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia)) {
            // seems like not supported
            alert("Your browser cannot stream from your webcam. Please switch to Chrome or Firefox.");
            return;
        }
    }

    // before un-mount clean-up
    componentWillUmount() {
        // stop recodring if running
        this.stopRecord();
    }

    // ---------------------------------------------------------------------------
    // Connection with STT and SA servers
    // ---------------------------------------------------------------------------
    // handles response from STT server, which is expected to be a transcribed version of an audio chunk
    handleSpeechToTextResponse(data) {
        // parse received response
        const json = JSON.parse(data);
        console.log(json);

        // check response structure and extract partial or full transcribe
        if (json.partial) {
            // run sentiment assessment for the partial text
            this.saSocketClient.sendRequest(JSON.stringify({ 'text': json.partial }));

            // update state with additonal partially transcribed text
            const updatedPartial = ' ' + json.partial + ' ';
            this.setState({ partial: updatedPartial });
        }
        else if (json.text) {
            // run sentiment assessment for the full text
            this.saSocketClient.sendRequest(JSON.stringify({ 'text': json.text }));

            // take current timestamp
            const now = new Date();
            const newTextLine = now.toISOString() + ' > ' + json.text + '\n';

            // update full text in state, and reset partial text
            const updatedText = this.state.text.concat(newTextLine);
            this.setState({ text: updatedText, partial: null });
        }
    }

    // handles response from SA server, which is expected to be a set of sentiment scores for a transcribed text
    handleSentimentAssessmentResponse(data) {
        const json = JSON.parse(data);
        console.log(json);

        // update state with addtional polarity /subjectivity scores
        const updatedSentiment = this.state.sentiment;
        // check if there is a new sentiment score set available
        if (json.sentiment) {
            // take current timestamp
            const timestamp = new Date();

            // add a new timestamp/score pair to polarity history
            updatedSentiment.polarity.push({ timestamp: timestamp, value: json.sentiment.polarity });
            // add a new timestamp/score pair to subjectivity history
            updatedSentiment.subjectivity.push({ timestamp: timestamp, value: json.sentiment.subjectivity });
        }
        // update entiment history in state
        this.setState({ sentiment: updatedSentiment });
    }

    // ---------------------------------------------------------------------------
    // Audio recording
    // ---------------------------------------------------------------------------
    // Returns configuration of audio recording
    getAudioConfig() {
        return {
            // we need only audio
            type: 'audio',
            // set to wav
            mimeType: 'audio/wav',
            // set to StereoAudioRecorder for wav
            recorderType: StereoAudioRecorder,
            // set to a single channel
            numberOfAudioChannels: 1,
            // duration of audio chunks
            timeSlice: 250,
            // set to 16khz
            desiredSampRate: 16000,
            // set chunk handler
            ondataavailable: (blob) => {
                this.handleRecordedChunk(blob)
            }
        }
    }

    // Starts audio recording
    startRecord() {
        // check if not already recording
        if (!this.state.recording) {
            console.log("Recording started.")

            // init audio media
            navigator.getUserMedia({
                audio: true
            }, (stream) => {
                // open audio stream
                const microphone = RecordRTC(stream, this.getAudioConfig());

                // init socket connection with STT and SA servers
                this.sttSocketClient.openSocket();
                this.saSocketClient.openSocket();

                // start recording
                microphone.startRecording();
                // update microphone
                this.setState({ microphone: microphone, recording: true });
            }, (error) => {
                console.error(JSON.stringify(error));
            });
        }
    }

    // Handler for an audio data chunk
    handleRecordedChunk(blob) {
        // open blob stream reader
        const reader = blob.stream().getReader();
        reader.read().then(function processChunk({ done, value }) {
            // check if stream processing is completed
            if (done) {
                // if so, let's stop here
                return;
            }
            // send audio chunk to STT server
            this.sttSocketClient.sendRequest(value);
            // Read some more, and call this function again
            return reader.read().then(processChunk.bind(this));
        }.bind(this));
    }

    // Stops audio recording
    stopRecord() {
        console.log("Recording stopped.")

        // check if already recording
        if (this.state.recording) {
            // stop recording
            this.state.microphone.stopRecording(() => {
                // close socket with SA server
                this.saSocketClient.closeSocket();
                // signal EOF to STT server
                this.sttSocketClient.sendRequest('{"eof" : 1}');
                // reset microphone
                if (this.state.microphone) this.state.microphone.destroy();
                // update state
                this.setState({ microphone: null, recording: false });
            });
        }
    }

    // Changes recording status (starting <> stopping)
    handleRecordingButtonClick() {
        // start / stop recording based on the new switched state
        if (this.state.recording) {
            this.stopRecord();
        } else {
            this.startRecord();
        }
    }

    // ---------------------------------------------------------------------------
    // Rendering
    // ---------------------------------------------------------------------------
    // Renders transcribed text
    renderTranscribedText() {
        const fullText = (this.state.partial) ? this.state.text.concat(this.state.partial) : this.state.text;
        const st = '#0000a0';
        return (
            <textarea id='ta' value={fullText} readOnly />
            //<p><span style={{color: st}}>{fullText}</span> </p>
        );
    }

    // Renders start / stop button
    renderButton() {
        const imageFile = (this.state.recording) ? mic_off : mic_on;
        return (
            <div>

                <button
                    onClick={() => this.handleRecordingButtonClick()}>
                    <img src={imageFile} width="48" height="48" alt="start_stop_button" />
                </button>
            </div>
        );
    }

    // Renders recording status text
    renderStatusText() {
        const statusText = (this.state.recording) ? 'Now recording...': 'Press to start recording.';
        const statusClass = (this.state.recording) ? 'tab blink' : '';
        return (
            <p className={statusClass}>{statusText}</p>
        );
    }

    // Renders chart
    renderChart(sentimentScoreHistory, maxDataPoints) {
        // init dataset
        const data = [];
        const slicedHistory = sentimentScoreHistory.slice(Math.max(sentimentScoreHistory.length - maxDataPoints, 0));
        slicedHistory.forEach(element => {
            data.push({
                a: element.timestamp,
                b: element.value * 100
            });
        });

        // render chart
        const width = 500, height = 350, margin = 20
        return (
            <LineChart data={data} width={width} height={height} margin={margin} />
        );
    }

    // Main rendering function
    render() {
        return (
            <div>
                <table>
                    <tbody>
                        <tr>
                            <td>Polarity</td>
                            <td>Subjectivity</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>
                                {this.renderChart(this.state.sentiment.polarity, 100)}
                            </td>
                            <td>
                                {this.renderChart(this.state.sentiment.subjectivity, 100)}
                            </td>
                            <td>
                                {this.renderStatusText()}
                                {this.renderButton()}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="2"> {this.renderTranscribedText()}</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

export default VoiceSentimentVisualiser;