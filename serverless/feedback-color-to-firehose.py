import os
import json
import boto3

from boto3.dynamodb.conditions import Key, Attr


firehose_client = boto3.client('firehose', region_name=os.environ['AWS_REGION'])
FIREHOSE_STREAM = 'rate-limiting-demo'

dynamodb = boto3.resource('dynamodb')
colors_table = dynamodb.Table('rate-limiting-demo-prod')

def lambda_handler(event, context):

    print (json.dumps(event))

    try:
        for rec in event["Records"]:
            if(rec["eventName"] == "INSERT" or rec["eventName"] == "MODIFY"):

                score_data = {}

                score_data['time_stamp'] =  rec["dynamodb"]["NewImage"]["time_stamp"]["S"]
                score_data['user_id'] =  rec["dynamodb"]["NewImage"]["user_id"]["S"]
                score_data['color'] =  rec["dynamodb"]["NewImage"]["score"]["S"]

                response = firehose_client.put_record(DeliveryStreamName=FIREHOSE_STREAM,
                                Record={ 'Data': json.dumps(score_data) + "\n" } )
    except Exception as e:
        print( e )

    return ''
