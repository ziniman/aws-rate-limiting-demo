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

logger.info("SUCCESS: Connection to RDS MySQL instance succeeded")

def write_into_db(event, context):
    logger.info('Received event: ' + json.dumps(event))
    body = json.loads(event["body"])

    try:
        conn = pymysql.connect(host=rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
    except BaseException as e:
        logger.error(e.args[1])
        raise Exception(e.args[1])

    user_id = body['user_id']
    score = body['score']
    ct = datetime.now()
    ts = decimal.Decimal(ct.timestamp())

    item_count = 0

    try:
        with conn.cursor() as cur:
            cur.execute('insert into votes (user_id, timestamp, color) values ("%s", %f, "%s")' % (user_id, ts, score))
            if user_id != 'Loader': conn.commit()
            #time.sleep(1)
            return True
    except BaseException as e:
        logger.error(e.args[1])
        raise Exception(e.args[1])


def read_from_db(event, context):
    logger.info('Received event: ' + json.dumps(event))
    colors = {}

    try:
        conn = pymysql.connect(host=rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
    except BaseException as e:
        logger.error(e.args[1])
        raise Exception(e.args[1])

    item_count = 0

    try:
        with conn.cursor() as cur:
            cur.execute("SELECT color, count(user_id) FROM votes group by color;")
            for row in cur:
                item_count += 1
                colors[row[0]] = row[1]
        return colors
    except BaseException as e:
        logger.error(e.args[1])
        raise Exception(e.args[1])
