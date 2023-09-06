from fastapi import FastAPI, Request, Depends, HTTPException
from functools import wraps, lru_cache
import uvicorn
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import requests as req
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

import sys
sys.path.append("..")
sys.path.append(".")

import config as config
import app.gpt_utils as gpt_utils

#Load environment variables
load_dotenv()
openai.api_key = config.OPENAI_KEY

# Initialize Firebase Admin SDK
cred = firebase_admin.credentials.Certificate('app/firebaseServiceAccountKey.json')  # TODO: Replace with the path to your Firebase service account key
firebase_admin.initialize_app(cred)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name='us-west-2')
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

#Cache OpenAI client
@app.get('/')
def dummy(request: Request):
    return 'hello world'

@app.get('/prompt')
def prompt_general(request: Request, text_prompt: str):
    #returns HTML of prompt completion
    return openai.Completion.create(model="text-davinci-003", prompt=text_prompt)

@app.get('/generate')
def prompt_general(request: Request, subject: str, text: str):
    #returns HTML of prompt completion
    gpt_response = gpt_utils.GPTUtils(config.OPENAI_KEY).call_gpt(subject, text)
    return JSONResponse(content=jsonable_encoder({"content": gpt_response}))

# returns a list of {'word': 'word', 'sentence': 'sentence'}
@app.get('/prompt_vocab')
def prompt_vocab(request: Request, subject: str, text: str):
    gpt_response = gpt_utils.GPTUtils(config.OPENAI_KEY).call_gpt_vocab(subject, text)
    print(gpt_response)
    return JSONResponse(content=jsonable_encoder({"content": gpt_response}))

from fastapi.responses import StreamingResponse
import io

@app.get('/generate_streaming')
async def prompt_general_streaming(request: Request, subject: str, text: str):
    #returns HTML of prompt completion
    gpt_response = gpt_utils.GPTUtils(config.OPENAI_KEY).call_gpt_streaming(subject, text)
    return StreamingResponse(gpt_response, media_type="text/event-stream")

@app.get('/generate_streaming_vocab')
async def prompt_vocab_streaming(request: Request, subject: str, text: str):
    gpt_response = gpt_utils.GPTUtils(config.OPENAI_KEY).call_gpt_streaming_vocab(subject, text)
    return StreamingResponse(gpt_response, media_type="text/event-stream")

@app.post('/sentence')
async def add_sentence(user_id: str, word: str, sentence: str, is_favorite: bool):
    table.put_item(
        Item={
            'userId': user_id,
            'word': word,
            'sentence': sentence,
            'isFavorite': is_favorite
        }
    )

@app.delete('/sentence/{sentence_id}')
async def delete_sentence(sentence_id: str):
    table.delete_item(
        Key={
            'sentenceId': sentence_id
        }
    )

@app.put('/sentence/{sentence_id}')
async def toggle_favorite(sentence_id: str, is_favorite: bool):
    table.update_item(
        Key={
            'sentenceId': sentence_id
        },
        UpdateExpression="set isFavorite = :f",
        ExpressionAttributeValues={
            ':f': is_favorite
        },
        ReturnValues="UPDATED_NEW"
    )