import boto3
import json
import logging
import decimal
import os
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
    ct = datetime.now()
    ts = decimal.Decimal(ct.timestamp())

    try:
        c = 1
        if (user_id=='Loader'): c = 0
        response = colors_table.update_item(
            Key={'color': score},
            UpdateExpression='SET last_user_id=:i, ttl_flag=:t ADD score :c',
            ExpressionAttributeValues={
                    ':i': user_id,
                    ':t': ts + 3600,
                    ':c': c
            },
            ReturnValues="UPDATED_NEW"
            )

    except ClientError as e:
        logger.error(e.response['Error']['Message'])
        raise e
    else:
        logger.info(response)
        return response

def read_from_db(event, context):
    logger.info('Received event: ' + json.dumps(event))
    colors = {}
    try:
        response = colors_table.scan(
            ProjectionExpression = 'color, score'
        )
        for item in response.get('Items', []):
            colors[item['color']] = int(item['score'])
    except ClientError as e:
        logger.error(e.response['Error']['Message'])
        raise e
    else:
        colors = dict(colors)
        return colors
