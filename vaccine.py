import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def get_data():
    
    # downloading CSV
    url = 'https://data.ontario.ca/dataset/752ce2b7-c15a-4965-a3dc-397bf405e7cc/resource/8a89caa9-511c-4568-af89-7f2174b4378c/download/vaccine_doses.csv'
    req = requests.get(url)
    url_content = req.content
    
    # saving raw file
    filename = './data/vaccine_raw.csv'
    csv_file = open(filename, 'wb')
    csv_file.write(url_content)
    csv_file.close()
    print(f'Downloaded data; stored raw at {filename}')
    
    # formatting
    df = pd.read_csv(filename)
    df.rename(columns={
        'report_date': 'date',
        'previous_day_doses_administered': 'new',
        'total_doses_administered': 'total',
        'total_vaccinations_completed': 'vaccinated' 
        }, inplace = True)
    df.set_index('date', inplace = True)
    df.index.name = 'date'
    df = df[['new', 'total', 'vaccinated']][1:]
    
    # fixing ints
    commas = lambda s: df[s].str.replace(',', '')
    df.new = commas('new')
    df.total = commas('total')
    df.vaccinated = commas('vaccinated')
    df.vaccinated = df.vaccinated.replace(np.nan, 0)
    
    filename = './data/output/vaccine.csv'
    df.to_csv(filename)
    print(f'Stored clean data at {filename}.')
    
    return df

if __name__ == "__main__":
    df = get_data() 