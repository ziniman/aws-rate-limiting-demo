import boto3
import json
import logging
import decimal
import os
import rds_config
import pymysql
from botocore.exceptions import ClientError
from datetime import datetime

region_name=os.environ['AWS_REGION']

logger = logging.getLogger()
logger.setLevel(logging.INFO)

#rds settings
rds_host  = rds_config.rds_host
name = rds_config.db_username
password = rds_config.db_password
db_name = rds_config.db_name

try:
    conn = pymysql.connect(host=rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
except pymysql.MySQLError as e:
    logger.error("ERROR: Unexpected error: Could not connect to MySQL instance.")
    logger.error(e)

    raise SystemExit

logger.info("SUCCESS: Connection to RDS MySQL instance succeeded")

def write_into_db(event, context):
    logger.info('Received event: ' + json.dumps(event))
    body = json.loads(event["body"])

    user_id = body['user_id']
    score = body['score']
    ct = datetime.now()
    ts = decimal.Decimal(ct.timestamp())

    item_count = 0

    with conn.cursor() as cur:
        cur.execute('insert into votes (user_id, timestamp, color) values ("%s", %f, "%s")' % (user_id, ts, score))
        conn.commit()
        cur.execute("SELECT color, count(user_id) FROM votes group by color;")
        for row in cur:
            item_count += 1
            logger.info(row)
            #print(row)
    conn.commit()

    return "Added %d items from RDS MySQL table" %(item_count)
    try:
        response = colors_table.update_item(
            Key={'color': score},
            UpdateExpression='SET last_user_id=:i, ttl_flag=:t ADD score :c',
            ExpressionAttributeValues={
                    ':i': user_id,
                    ':t': ts + 3600,
                    ':c': 1
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
    colors = []
    try:
        response = colors_table.scan(
            ProjectionExpression = 'color, score'
        )
        colors.extend(response.get('Items', []))
    except ClientError as e:
        logger.error(e.response['Error']['Message'])
        raise e
    else:
        return colors
