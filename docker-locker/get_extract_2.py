import argparse
from pymongo import MongoClient
from datetime import datetime
from datetime import timedelta
import csv
import os

def main(lower_thres, upper_thres):

    client = MongoClient( os.environ['DB_PORT_27017_TCP_ADDR'], 27017)

    db = client['hourly_precip']

    coll = db['posts']

    fields = list(coll.find_one().keys())

    with open('precip_extract_'+day_arg+'.csv', 'w') as f:
        
        writr = csv.writer(f)

        writr.writerow(fields)

        for doc in coll.find({'datetime_utc': { '$gte': lower_thres, '$lt': upper_thres }}):

            row = [doc[field] for field in fields]
        
            writr.writerow(row)


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description='what day do we want to create an extract for?')
    parser.add_argument('day', metavar='yyyy-mm-dd', type=str, nargs=1, help='day of extract')

    day_arg = parser.parse_args().day[0]

    #try:
    lower_thres = datetime.strptime(day_arg, '%Y-%m-%d')
    #except ValueError:
    #throw
    upper_thres = lower_thres + timedelta(1)

    main(lower_thres, upper_thres)


