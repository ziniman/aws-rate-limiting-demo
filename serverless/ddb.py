import boto3
import json
import logging
import decimal
import os
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError
from datetime import datetime

region_name=os.environ['AWS_REGION']

dynamodb = boto3.resource('dynamodb', region_name)
colors_table = dynamodb.Table('rate-limiting-demo-prod')

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def write_into_db(event, context):
    logger.info('Received event: ' + json.dumps(event))
    body = json.loads(event["body"])

    user_id = body['user_id']
    score = body['score']
    time_stamp = datetime.utcnow()
    time_stamp = time_stamp.strftime("%Y-%m-%d %H:%M:%S")

    ct = datetime.now()
    ts = decimal.Decimal(ct.timestamp())

    try:
        response = colors_table.put_item(
            Item={
                    'user_id': user_id,
                    'score': score,
                    'time_stamp': ts,
                    'ttl': ts + 600
                    }
            )

    except ClientError as e:
        logger.error(e.response['Error']['Message'])
        raise e
    else:
        logger.info('PutItem succeeded:' + json.dumps(response))
        return response
