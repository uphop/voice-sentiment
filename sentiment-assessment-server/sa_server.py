#!/usr/bin/env python3

import json
import os
import sys
import asyncio
import pathlib
import websockets
import concurrent.futures
import logging
from textblob import TextBlob
from textblob.sentiments import NaiveBayesAnalyzer
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
logger = logging.getLogger('sentiment-assessment-server')

# Get config
load_dotenv(verbose=True)
server_interface = os.environ.get('SA_SERVER_INTERFACE', '0.0.0.0')
server_port = int(os.environ.get('SA_SERVER_PORT', 2701))

# Init asyncio
pool = concurrent.futures.ThreadPoolExecutor((os.cpu_count() or 1))
loop = asyncio.get_event_loop()

'''
Handler for incoming transcribed text, for which to assess sentiment scores
'''
def process_chunk(message):
    # initial result with sentiment details
    result_json = {
        'sentiment': {}
    }

    # check if got string
    if isinstance(message, str):
        # get transcirbed results and parse as JSON
        try:
            message_json = json.loads(message)
            
            # check if text is passed
            if 'text' in message_json:
                # assess sentiment
                sentiment_scores = get_sentiment_scores(message_json['text'])

                # enrich result with sentiment details
                result_json['sentiment'] = {
                    'polarity': sentiment_scores.polarity,
                    'subjectivity': sentiment_scores.subjectivity
                }
        # handle JSON parse errors      
        except ValueError:
            logger.error('Failed to parse incoming message: ' + message)

    # convert to JSON string and return
    return json.dumps(result_json)

'''
Analyzes sentiment of transcribed text
'''
def get_sentiment_scores(text):
    text_blob = TextBlob(text)
    return text_blob.sentiment

'''
Main handler for incoming client socket connections
'''
async def recognize(websocket, path):
    logger.info('Incoming client connection...')

    while True:
        # retrieve request
        message = await websocket.recv()
        logger.info('Request: ' + message)

        # run recognition in a thread
        response = await loop.run_in_executor(pool, process_chunk, message)

        # send back response
        logger.info('Response: ' + response)
        await websocket.send(response)

''' 
Init and start socket server
'''
logger.info("Starting server on host " +
            server_interface + ", port " + str(server_port))
start_server = websockets.serve(
    recognize, server_interface, server_port)
loop.run_until_complete(start_server)
loop.run_forever()
