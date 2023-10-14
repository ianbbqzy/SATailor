FROM python:3.10-slim

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./app /code/app

# for some reason, nginx can't access this env variable
# ENV PORT 8080
EXPOSE 8080

CMD exec uvicorn app.main:app --host=0.0.0.0 --port=8080