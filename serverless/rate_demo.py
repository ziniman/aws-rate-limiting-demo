import json
import logging
import decimal
from botocore.exceptions import ClientError
from rds import write_into_db, read_from_db

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
    try:
        response = read_from_db (event, context)
    except ClientError as e:
        return {
            'statusCode': 500,
            'headers': { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            'body': '{ \"message\": \"Could not read from DB\" }'
        }
        raise SystemExit
    else:
        return {
            'statusCode': 200,
            'headers': { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            'body': response
        }

def write_feedback(event, context):
    try:
        response = write_into_db (event, context)
    except ClientError as e:
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
