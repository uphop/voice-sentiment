
class SocketClient {
  constructor(serverUrl, responseHandler) {
    // save config and handler
    this.serverUrl = serverUrl;
    this.responseHandler = responseHandler;
  }

  // ---------------------------------------------------------------------------
  // Connection with sentiment assessment server
  // ---------------------------------------------------------------------------
  // Opens socket connection wuth SA server
  openSocket() {
    // init socket
    this.ws = new WebSocket(this.serverUrl);

    // wire intent server events
    this.ws.onopen = () => {
      console.log("Socket connection with server opened: " + this.serverUrl)
    }
    this.ws.onmessage = (evt) => {
      // pass response for processing
      this.handleResponse(evt.data);
    }
  }

  // sends data to opened server socket
  sendRequest(data) {
    // send audio chunk to Vosk server
    this.ws.send(data);
  }

  // handles response from server
  handleResponse(data) {
    // bubble up response
    this.responseHandler(data);
  }

  // Signals EOF to server
  eofSocket(eofMessage) {
    // set socket closure handler
    this.ws.onclose = () => {
      console.log("Socket connection with server closed: " + this.serverUrl)
    }
    // 
    if (eofMessage) {
      // signal end of processing to server
      this.ws.send(eofMessage);
    }
  }

  // Closes socket connection with server
  closeSocket() {
    // set socket closure handler
    this.ws.onclose = () => {
      console.log("Socket connection with server closed: " + this.serverUrl)
    }
    this.ws.close();
  }
}

export default SocketClient;