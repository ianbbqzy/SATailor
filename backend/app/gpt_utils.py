import json
import openai

class GPTUtils:
    def __init__(self, openai_api_key):
        openai.api_key = openai_api_key

    def call_gpt_streaming(self, text, subject):
        prompt = f'Create menumonic devices for "{text}" on the subject: {subject}'  # Updated to handle long format language names
        messages=[
            {"role": "system", "content": """
            You are great at creating two types of mneumonic devices, words and sentences.
            For example, if users want to remember the colors of the rainbow, a word mneumonic
            device might be ROYGBIV. A sentence mneumonic device might be 
            "Richard Of York Gave Battle In Vain". Feel free to use real famous person names or places.
            Return 2 words mneumonic devices and 2 sentence mneumonic devices.

            You can also create menumonic devices based on a topic. For example, if the user
            is interested in lord of the rings, one of the sentences you return could be "Rings of your
            great big imagination vanished"
            """},
            {"role": "user", "content": prompt}
        ]
        stream = openai.ChatCompletion.create(
            model="gpt-4",
            messages=messages,
            temperature=0.2,
            stream=True,
        )

        for message in stream:
            print(message)
            yield message['choices'][0]['delta'].get("content", "")

    def call_gpt(self, text, subject):
        prompt = f'Create menumonic devices for "{text}" on the subject: {subject}'  # Updated to handle long format language names
        messages=[
            {"role": "system", "content": """
            You are great at creating sentences for practicing SAT vocabulary words.
            For example, if users want to remember the word "abate", a sentence might be 
            "The rain will abate by noon". 
            Return sentences for each vocabulary word provided.
            You can also create sentences based on a topic. For example, if the user
            is interested in lord of the rings, one of the sentences you return could be "The power of the ring did not abate over time"
            
            """},
            {"role": "user", "content": prompt}
        ]
        completion = openai.ChatCompletion.create(
            model="gpt-3.5-turbo-0613",
            messages=messages,
            temperature=0.2,
        )

        print(completion.choices[0]['message'])
        return completion.choices[0]['message']['content']

    def call_gpt_streaming_vocab(self, text, subject):
        prompt = f'Create sentences for practicing SAT vocabulary words "{text}" on the subject: {subject}'
        messages=[
            {"role": "system", "content": """
            You are great at creating sentences for practicing SAT vocabulary words.
            For example, if users want to remember the word "abate", a sentence might be 
            "The rain will abate by noon". 
            Return sentences for each vocabulary word provided.
            You can also create sentences based on a topic. For example, if the user
            is interested in lord of the rings, one of the sentences you return could be "The power of the ring did not abate over time".
            Use real or ficitional famous persons or places as much as possible when appropriate.
            """},
            {"role": "user", "content": prompt}
        ]
        stream = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0.2,
            stream=True,
        )

        for message in stream:
            yield message['choices'][0]['delta'].get("content", "")

    def call_gpt_vocab(self, text, subject):
        prompt = f'Create sentences for practicing SAT vocabulary words "{text}" on the subject: {subject}'
        messages=[
            {"role": "system", "content": """
            You are great at creating sentences for practicing SAT vocabulary words.
            For example, if users want to remember the word "abate", a sentence might be 
            "The rain will abate by noon". 
            Return sentences for each vocabulary word provided.
            You can also create sentences based on a topic. For example, if the user
            is interested in lord of the rings, one of the sentences you return could be "The power of the ring did not abate over time".
            Use real or ficitional famous persons or places as much as possible when appropriate. Return the sentences in order of relevance.
            """},
            {"role": "user", "content": prompt}
        ]
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo-0613",
            messages=messages,
            functions=[
                {
                    "name": "order_words",
                    "description": "A function to reorder the list of words based on their relevance",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "results": {
                                "type": "array",
                                "description": "a list of pairings of word and their sentences",
                                "items": {
                                    "type": "array",
                                    "description": "a tuple of word and its sentence",
                                    "items": {
                                        "type": "string",
                                        "description": "a word and its sentence",
                                    }
                                }
                            },
                        },
                        "required": ["results"],
                    },
                }
            ],
            function_call={"name": "order_words"},
        )

        message = response["choices"][0]["message"]
        if message.get("function_call"):
            # function_name = message["function_call"]["name"]
            function_args = json.loads(remove_trailing_commas(message["function_call"]["arguments"]))
            print(function_args['results'])
            return list(map(lambda x: {'word': x[0], 'sentence': x[1]}, function_args["results"]))
        
import re

# GPT leaving occasional trailing commas (getting mixed up with JS objects maybe?) such as in:
# {results: [[], [],]} instead of {results: [[], []]}
def remove_trailing_commas(json_like_str):
    return re.sub(r',\s*]', ']', json_like_str)
