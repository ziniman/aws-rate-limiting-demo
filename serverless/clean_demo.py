import boto3
import json
import logging
import decimal
import os
import rds_config
import pymysql
from botocore.exceptions import ClientError
from datetime import datetime
import time

region_name='us-east-1'

#rds settings
rds_host  = rds_config.rds_host
name = rds_config.db_username
password = rds_config.db_password
db_name = rds_config.db_name


try:
    conn = pymysql.connect(host=rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
    response = "RDS CLEANED"
except BaseException as e:
    raise Exception(e.args[1])

try:
    with conn.cursor() as cur:
        cur.execute('delete from votes where user_id<>""')
        conn.commit()
except BaseException as e:
    raise Exception(e.args[1])
else:
    print ("RDS CLEANED")

dynamodb = boto3.resource('dynamodb', region_name)
colors_table = dynamodb.Table('rate-limiting-demo-prod')
colors = ['Red', 'Gray', 'Yellow', 'Blue', 'Green']

user_id = 0
ct = datetime.now()
ts = decimal.Decimal(ct.timestamp())

try:
    c = 0
    for color in colors:
        response = colors_table.update_item(
            Key={'color': color},
            UpdateExpression='SET last_user_id=:i, ttl_flag=:t, score=:c',
            ExpressionAttributeValues={
                    ':i': user_id,
                    ':t': ts + 3600,
                    ':c': c
            },
            ReturnValues="UPDATED_NEW"
            )
except ClientError as e:
    raise e
else:
    print("DDB CLEANED")
