import os
from pymongo import MongoClient


def main():

    client = MongoClient(
                os.environ['DB_PORT_27017_TCP_ADDR'],
                    27017)
    db = client['hourly_precip']
    coll = db['posts']



if __name__ == "__main__":
    main()

