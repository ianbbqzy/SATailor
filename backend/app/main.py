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

import sys
sys.path.append("..")
sys.path.append(".")

import config as config
import app.gpt_utils as gpt_utils

#Load environment variables
load_dotenv()
openai.api_key = config.OPENAI_KEY


#Load app
app = FastAPI()


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

from fastapi.responses import StreamingResponse
import io

@app.get('/generate_streaming')
async def prompt_general_streaming(request: Request, subject: str, text: str):
    #returns HTML of prompt completion
    gpt_response = gpt_utils.GPTUtils(config.OPENAI_KEY).call_gpt_streaming(subject, text)
    return StreamingResponse(gpt_response, media_type="text/event-stream")
