from __future__ import print_function

import boto3
import json
import logging
import os
import decimal
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError

from datetime import datetime

# Helper class to convert a DynamoDB item to JSON.
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

region_name=os.environ['AWS_REGION']

dynamodb = boto3.resource('dynamodb', region_name)
colors_table = dynamodb.Table('rate-limiting-demo-prod')

def get_colors(event, context):
    logger.info('Received event: ' + json.dumps(event))

    session_id = event['queryStringParameters']['id']

    try:
        response = sessions_table.query(
            KeyConditionExpression=Key('session_id').eq(session_id)
        )

    except ClientError as e:
        logger.error(e.response['Error']['Message'])
        #return event
        raise SystemExit
    else:
        if (int(json.dumps(response[u'Count']))>0):
            items = json.dumps(response[u'Items'], cls=DecimalEncoder)
            print (items)

            return {
                'statusCode': 200,
                'headers': { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                'body': items
            }
        else:
            return {
                'statusCode': 404,
                'headers': { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            }

def write_feedback(event, context):
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
                    'time_stamp': ts
                    }
            )

    except ClientError as e:
        logger.error(e.response['Error']['Message'])
        return {
            'statusCode': 500,
            'headers': { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            'body': '{ \"message\": \"Could not write to DB\" }'
        }
        raise SystemExit
    else:
        print("PutItem succeeded:")
        print(json.dumps(response))

        return {
            'statusCode': 200,
            'headers': { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            'body': '{ \"message\": \"Vote saved.\" }'
        }
