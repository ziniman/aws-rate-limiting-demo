import json
import logging
import decimal
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError
from ddb import write_into_db

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
    try:
        response = write_into_db (event, context)
    except Error as e:
        return {
            'statusCode': 500,
            'headers': { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            'body': '{ \"message\": \"Could not write to DB\" }'
        }
        raise SystemExit
    else:
        return {
            'statusCode': 200,
            'headers': { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            'body': '{ \"message\": \"Vote saved.\" }'
        }
