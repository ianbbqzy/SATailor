import time
import logging
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
from starlette.status import HTTP_403_FORBIDDEN, HTTP_500_INTERNAL_SERVER_ERROR
import boto3
from boto3.dynamodb.conditions import Key
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
import sys

import app.config as config
from app.gpt_utils import parse_csv_to_dict
from app.gpt_utils import GPTUtils
class Sentence(BaseModel):
    userId: str
    sentenceId: str
    word: str
    topic: str
    sentence: str
    isFavorite: bool

class EssayResponseRequestBody(BaseModel):
    college: str
    promptId: str
    response: str

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
usersTable = dynamodb.Table('Users')
essayResponsesTable = dynamodb.Table('EssayResponses')
essayResponseVersionsTable = dynamodb.Table('EssayResponseVersions')

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

@app.get('/suggestion')
async def get_suggestion(request: Request, question: str, notes: str):
    try:
        userId = request.state.decoded_token['uid']
        response = usersTable.get_item(Key={'UserId': userId})
        resume = response['Item']['Resume']
    except Exception as e:
        logging.error("Error occurred while fetching user's resume data")
        return JSONResponse(content="Error occurred while processing your request", status_code=HTTP_500_INTERNAL_SERVER_ERROR)

    gpt_response = GPTUtils(config.OPENAI_KEY).get_suggestion(question, notes, resume)
    return StreamingResponse(gpt_response, media_type="text/event-stream")

@app.get('/prompt_vocab')
def prompt_vocab(request: Request, topic: str, text: str):
    gpt_response = GPTUtils(config.OPENAI_KEY).call_gpt_vocab(text, topic)
    print(gpt_response)
    return JSONResponse(content=jsonable_encoder({"content": gpt_response}))

@app.get('/feedback')
async def get_feedback(request: Request, question: str, answer: str):
    gpt_response = GPTUtils(config.OPENAI_KEY).get_feedback(question, answer)
    return StreamingResponse(gpt_response, media_type="text/event-stream")

@app.get('/essay_prompts')
async def get_essay_prompts(request: Request):
    prompts_dict = parse_csv_to_dict('./app/essay_prompts.csv')
    return JSONResponse(content=jsonable_encoder({"content": prompts_dict}))

@app.get('/formatted_feedback')
async def get_formatted_feedback(request: Request, question: str, answer: str):
    gpt_response = GPTUtils(config.OPENAI_KEY).call_feedback_with_functions(question, answer)
    return JSONResponse(content=jsonable_encoder({"content": gpt_response}))

@app.get('/generate_streaming_vocab')
async def prompt_vocab_streaming(request: Request, topic: str, text: str):
    gpt_response = GPTUtils(config.OPENAI_KEY).call_gpt_streaming_vocab(text, topic)
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

class ResumeRequestBody(BaseModel):
    resume: str

@app.post('/resume')
async def save_resume(request: Request, requestBody: ResumeRequestBody):
    userId = request.state.decoded_token['uid']
    usersTable.put_item(
        Item={
            'UserId': userId,
            'Resume': requestBody.resume
        }
    )

@app.get('/resume')
async def get_resume(request: Request):
    userId = request.state.decoded_token['uid']
    response = usersTable.get_item(
        Key={
            'UserId': userId
        }
    )
    # Check if a resume exists for the user
    if 'Item' in response:
        return JSONResponse(content=jsonable_encoder({"resume": response['Item']['Resume']}))
    else:
        return JSONResponse(content=jsonable_encoder({"resume": "No resume uploaded yet"}))

@app.post('/essay_responses')
async def save_essay_response(request: Request, requestBody: EssayResponseRequestBody):
    userId = request.state.decoded_token['uid']
    promptId = f"{requestBody.college}{requestBody.promptId}"
    timestamp = dt.now().isoformat()
    essayResponsesTable.put_item(
        Item={
            'UserId': userId,
            'PromptId': promptId,
            'Response': requestBody.response,
            'Timestamp': timestamp
        }
    )
    essayResponseVersionsTable.put_item(
        Item={
            'PromptId': promptId,
            'Timestamp': timestamp,
            'Response': requestBody.response
        }
    )

@app.get('/essay_responses/{college}')
async def get_essay_responses(request: Request, college: str):
    userId = request.state.decoded_token['uid']
    response = essayResponsesTable.query(
        KeyConditionExpression=Key('UserId').eq(userId) & Key('PromptId').begins_with(college)
    )
    items = response['Items']
    for item in items:
        item['userId'] = item.pop('UserId')
        item['promptId'] = item.pop('PromptId')
        item['response'] = item.pop('Response')
        item['timestamp'] = item.pop('Timestamp')
    return JSONResponse(content=jsonable_encoder({"content": items}))