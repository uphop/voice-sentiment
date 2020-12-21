#!/usr/bin/env python3

import json
import os
import sys
import asyncio
import pathlib
import websockets
import concurrent.futures
import logging
from vosk import Model, KaldiRecognizer
from dotenv import load_dotenv

'''
Init and configuration
'''
# Enable loging
logging.root.handlers = []
logging.basicConfig(
    encoding='utf-8',
    format="%(asctime)s [%(threadName)-12.12s] [%(levelname)-5.5s]  %(message)s",
    level=logging.INFO,
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger('speech-to-text-server')

# Get config
load_dotenv(verbose=True)
vosk_interface = os.environ.get('VOSK_SERVER_INTERFACE', '0.0.0.0')
vosk_port = int(os.environ.get('VOSK_SERVER_PORT', 2700))
vosk_model_path = os.environ.get('VOSK_MODEL_PATH', 'model')
vosk_sample_rate = float(os.environ.get('VOSK_SAMPLE_RATE', 16000))

# Init Vosk model
model = Model(vosk_model_path)

# Init asyncio
pool = concurrent.futures.ThreadPoolExecutor((os.cpu_count() or 1))
loop = asyncio.get_event_loop()

'''
Handler for audio chunk, which should be transcribed
'''
def process_chunk(rec, message):
    # check for end of recording stream message
    if message == '{"eof" : 1}':
        # if recording stream is closed by the client, return final transcribe result
        return rec.FinalResult(), True
    elif rec.AcceptWaveform(message):
        # process a recorgnized full audio chunk
        return rec.Result(), False
    else:
        # attempt to process a partial audio chunk
        return rec.PartialResult(), False

'''
Main handler for incoming client socket connections
'''
async def recognize(websocket, path):
    logger.info('Incoming client connection...')

    rec = None
    while True:
        # retrieve request
        message = await websocket.recv()

        # create recognizer
        if not rec:
            rec = KaldiRecognizer(model, vosk_sample_rate)

        # run recognition in a thread
        response, stop = await loop.run_in_executor(pool, process_chunk, rec, message)

        # send back response
        await websocket.send(response)

        # stop processing if signalled so by the client
        if stop:
            break

'''
Init and start socket server
'''
logger.info("Starting server on host " + vosk_interface + ", port " + str(vosk_port))
start_server = websockets.serve(
    recognize, vosk_interface, vosk_port)
loop.run_until_complete(start_server)
loop.run_forever()

