import time
from fastapi import FastAPI, Request, HTTPException
from functools import wraps, lru_cache
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime as dt
import openai
import os
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
import firebase_admin
from firebase_admin import auth
from starlette.status import HTTP_403_FORBIDDEN
import boto3
from boto3.dynamodb.conditions import Key
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
import sys

import config as config
import app.gpt_utils as gpt_utils

class Sentence(BaseModel):
    userId: str
    sentenceId: str
    word: str
    topic: str
    sentence: str
    isFavorite: bool

sys.path.append("..")
sys.path.append(".")

#Load environment variables
load_dotenv()
openai.api_key = config.OPENAI_KEY

# Initialize Firebase Admin SDK
cred = firebase_admin.credentials.Certificate('app/firebaseServiceAccountKey.json')  # TODO: Replace with the path to your Firebase service account key
firebase_admin.initialize_app(cred)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name='us-west-2', aws_access_key_id=config.AWS_ACCESS_KEY, aws_secret_access_key=config.AWS_SECRET_KEY)
table = dynamodb.Table('Sentences')

#Load app
app = FastAPI()

# Firebase Authentication middleware
@app.middleware("http")
async def check_auth(request: Request, call_next):
    auth_header = request.headers.get('Authorization')
    if auth_header:
        id_token = auth_header.split(' ')[1]
        try:
            time.sleep(1)  # Adjust the delay as needed
            decoded_token = auth.verify_id_token(id_token)
            request.state.decoded_token = decoded_token
        except Exception as e:
            print(f"Exception occurred: {e}")
            return JSONResponse(content="Invalid authentication credentials", status_code=HTTP_403_FORBIDDEN)
    else:
        print("No Authorization header")  # Debugging line
        return JSONResponse(content="Invalid authentication credentials", status_code=HTTP_403_FORBIDDEN)

    response = await call_next(request)
    return response

#CORS setup (cross-origin thingies)
origins = [
    "http://localhost:5000",
    "http://localhost:54957",
    '*'
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# returns a list of {'word': 'word', 'sentence': 'sentence'}
@app.get('/prompt_vocab')
def prompt_vocab(request: Request, topic: str, text: str):
    gpt_response = gpt_utils.GPTUtils(config.OPENAI_KEY).call_gpt_vocab(text, topic)
    print(gpt_response)
    return JSONResponse(content=jsonable_encoder({"content": gpt_response}))

@app.get('/feedback')
async def get_feedback(request: Request, question: str, answer: str):
    gpt_response = gpt_utils.GPTUtils(config.OPENAI_KEY).get_feedback(question, answer)
    return StreamingResponse(gpt_response, media_type="text/event-stream")

@app.get('/generate_streaming_vocab')
async def prompt_vocab_streaming(request: Request, topic: str, text: str):
    gpt_response = gpt_utils.GPTUtils(config.OPENAI_KEY).call_gpt_streaming_vocab(text, topic)
    return StreamingResponse(gpt_response, media_type="text/event-stream")

@app.post('/sentence')
async def add_sentence(sentence: Sentence):
    try:
        table.put_item(
            Item={
                'UserId': sentence.userId,
                'SentenceId': sentence.sentenceId,
                'Word': sentence.word,
                'Topic': sentence.topic,
                'Sentence': sentence.sentence,
                'IsFavorite': sentence.isFavorite
            }
        )
    except Exception as e:
        print(f"Error occurred: {e}")
        raise HTTPException(status_code=400, detail="Error in adding sentence")

@app.delete('/sentence/{userId}/{sentenceId}')
async def delete_sentence(userId: str, sentenceId: str):
    table.delete_item(
        Key={
            'UserId': userId,
            'SentenceId': sentenceId
        }
    )

@app.put('/sentence/{userId}/{sentenceId}')
async def toggle_favorite(userId: str, sentenceId: str, isFavorite: bool):
    table.update_item(
        Key={
            'UserId': userId,
            'SentenceId': sentenceId
        },
        UpdateExpression="set IsFavorite = :f",
        ExpressionAttributeValues={
            ':f': isFavorite
        },
        ReturnValues="UPDATED_NEW"
    )

@app.get('/sentences')
async def get_sentences(request: Request, word: str = None, topic: str = None, isFavorite: bool = None):
    userId = request.state.decoded_token['uid']
    filter_expression = Key('UserId').eq(userId)
    if word:
        filter_expression = filter_expression & Key('Word').eq(word)
    if topic:
        filter_expression = filter_expression & Key('Topic').eq(topic)
    if isFavorite is not None:
        if isFavorite:
            filter_expression = filter_expression & Key('IsFavorite').eq(isFavorite)
    response = table.scan(FilterExpression=filter_expression)
    items = response['Items']
    for item in items:
        item['userId'] = item.pop('UserId')
        item['sentenceId'] = item.pop('SentenceId')
        item['word'] = item.pop('Word')
        item['topic'] = item.pop('Topic')
        item['sentence'] = item.pop('Sentence')
        item['isFavorite'] = item.pop('IsFavorite')
    return JSONResponse(content=jsonable_encoder({"content": items}))

