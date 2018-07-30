import argparse
from datetime import datetime
import re
import os
import pytz
from pymongo import MongoClient
from ftplib import FTP
import requests

def create_station_dict():

    req = requests.get('http://www.ncdc.noaa.gov/homr/file/emshr_lite.txt')

    station_dict = {}

    lines = req.text.split('\n')
            
    for line in lines:

        coop = line[27:33].strip() #coop station ID
        station_name = line[86:186].strip()
        country_name = line[190:225].strip()
        utc_offset = line[268:271].strip()
        lat = line[272:281].strip()
        lon = line[282:292].strip()

        station_dict[coop] = {'lat':lat, 'lon':lon, 'station_name': station_name
                                , 'country_name': country_name, 'utc_offset': utc_offset}

    return station_dict

def pull_precip_data(precip_file, station_dict):

    with open(precip_file, 'r') as f:
        text = f.read()
        dat = []
        for line in text.split('\n'):

            if not line:
                continue
        
            coop = line[3:9]
            year = line[17:21]
            month = line[21:23]
            day = line[23:27]

            station_dat = station_dict[coop]

            hourly_vals = re.findall(r'-?\d+\.?\d*', ' '.join(line.split()[2:]))
            hourly_vals_dict = dict(hourly_vals[i:i+2] for i in range(0, len(hourly_vals), 2))

            total_precip = hourly_vals_dict['2500']

            frmt = '%Y%m%d %H:%M %z'
            for hr in range(1, 25):

                # hour for getting precip amt from dict
                hr_str = str(hr) + '00'
                hr_str = hr_str.zfill(4)

                # hour for entry into db (data gives end hour, e.g. '24' for total 11 PM precip)
                hr_entry = str(hr - 1).zfill(2)

                # format UTC offset
                utc_offset = station_dat['utc_offset'].zfill(3) + '00' if int(station_dat['utc_offset']) < 0 else '+' + station_dat['utc_offset'].zfill(2) + '00' 

                precip_amt = float(hourly_vals_dict.get(hr_str, 0))/100

                datetime_str = year + month + day[2:] + ' ' + hr_entry  + ':00 ' + utc_offset 
                
                datetime_local = datetime.strptime(datetime_str, frmt)
                datetime_utc = datetime_local.astimezone(pytz.utc)

                # mongodb converts everything to UTC so no use putting datetime_local in :-(
                dat.append({
                    'coop': coop
                    , 'station_name': station_dat['station_name']
                    , 'country_name': station_dat['country_name']
                    , 'utc_offset': utc_offset
                    , 'datetime_utc': datetime_utc
                    , 'lat': station_dat['lat']
                    , 'lon': station_dat['lon']
                    , 'precip_amt': precip_amt
                    })

    return dat



def main():

    station_dict = create_station_dict()
    print('dict created')

    # what year of data (2011 - 2014) do we want?
    parser = argparse.ArgumentParser(description='what year of data do we want to get?')
    parser.add_argument('year', metavar='yyyy', type=str, nargs=1,
                                help='year of precip data to pull & load')
    year_arg = parser.parse_args().year[0]
    print('pull %s data off FTP site' % year_arg)

    ftp = FTP('ftp.ncdc.noaa.gov')
    ftp.login()
    ftp.cwd('pub/data/hourly_precip-3240/by_month' + year_arg)
    filenames = ftp.nlst()

    client = MongoClient(
                os.environ['DB_PORT_27017_TCP_ADDR'],
                    27017)
    db = client['hourly_precip']
    coll = db['posts']

    for f in filenames:
        print('pulling %s' % f)
        with open(f, 'wb') as write_f:
            ftp.retrbinary('RETR ' + f , lambda data: write_f.write(data))

        print('formatting...')
        precip_dat = pull_precip_data( f , station_dict)

        # no longer need file we pulled with FTP
        os.remove(f)

        print('ready to load')
        coll.insert_many(precip_dat)



if __name__ == "__main__":
    main()

