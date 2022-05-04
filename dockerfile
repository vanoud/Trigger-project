FROM python:3.8.9

WORKDIR /app

COPY . .

RUN  pip install --upgrade pip 

RUN pip install -v https://github.com/pallets/werkzeug/archive/refs/tags/2.0.1.tar.gz

RUN pip install -r requirements.txt

RUN pip install boto3 

CMD ["flask","run","--host=0.0.0.0"]

EXPOSE 5000