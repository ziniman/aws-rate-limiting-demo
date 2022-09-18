import requests
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

url_list = [
    "https://x50azj33kc.execute-api.us-east-1.amazonaws.com/info/store_feedback"
]
colors = ['Red', 'Gray', 'Yellow', 'Blue', 'Green']


def call_url(url, color):
    html = requests.post(url, json=json.loads('{\"user_id\": \"Loader\", \"score\": \"%s\"}' % color))
    return html.content

start = time.time()

processes = []
with ThreadPoolExecutor(max_workers=200) as executor:
    for i in range(3000):
        for url in url_list:
            for color in colors:
                future = executor.submit(call_url, url, color)
                #time.sleep(0.1)
                #print (future.result())

print(f'Time taken: {time.time() - start}')
