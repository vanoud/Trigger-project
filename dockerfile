FROM python:3.8.9

WORKDIR /app

COPY . .

RUN  pip install --upgrade pip 

RUN pip install -r requirements.txt

CMD ["flask","run","--host=0.0.0.0"]

EXPOSE 5000