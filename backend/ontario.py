#!/usr/bin/env python3

import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

'''
- runs daily just after 12pm
- pulls daily case data released by OpenData Ontario
- gets % of cases in London of each demo, as of each day
- gets daily case numbers, plus 7-day average, for London
    + its six peer units
'''

def get_data():
    '''
    Pulls and cleans daily csv.
    '''
    
    # downloading CSV
    url = 'https://data.ontario.ca/dataset/f4112442-bdc8-45d2-be3c-12efae72fb27/resource/455fd63b-603d-4608-8216-7d8647f43350/download/conposcovidloc.csv'
    req = requests.get(url)
    url_content = req.content
    
    # saving unedited file as backup
    filename = '../data/ontario_raw.csv'
    csv_file = open(filename, 'wb')
    csv_file.write(url_content)
    csv_file.close()
    print(f'Downloaded data; stored raw at {filename}')
    
    # cleaning file
    df = pd.read_csv('../data/ontario_raw.csv')
    df = df.drop(['Row_ID', 'Reporting_PHU_City',
                'Reporting_PHU_Address',
                'Reporting_PHU_Postal_Code', 
                'Reporting_PHU_Website',
                'Reporting_PHU_Latitude',
                'Reporting_PHU_Longitude',
                'Outbreak_Related',
                'Accurate_Episode_Date',
                'Test_Reported_Date',
                'Case_AcquisitionInfo',
                'Client_Gender',
                'Specimen_Date',
                'Outcome1'], axis=1)
    df = df.rename(columns={"Case_Reported_Date": "reported",
                            "Age_Group": "age",
                            'Reporting_PHU': 'unit'})
    df = df.set_index(['unit'])
    df = df.sort_values(by=['unit','reported'],
                        ascending=[True,False])
    
    # saving cleaned file
    filename = '../data/ontario_data.csv'
    df.to_csv(filename)
    print(f'Stored clean data at {filename}.')
    
    # renaming units to match StatsCan convention
    file = pd.read_csv('../data/unit_names.csv')
    names = {x:y for x,y in zip(file['original'],file['rename'])}
    df = df.rename(index=names)
    
    return df

def total(df):
    '''
    Gets total case counts as of today in tracked units.
    '''
    
    # units tracked, with statscan names
    units_canada = ['Middlesex-London Health Unit','Durham Regional Health Unit',
         'Halton Regional Health Unit','City of Hamilton Health Unit',
        'City of Ottawa Health Unit','Waterloo Health Unit',
        'Windsor-Essex County Health Unit']
    ind = ['London','Durham','Halton','Hamilton',
           'Ottawa','Waterloo','Windsor']
    
    # getting total counts for each unit
    filename = '../data/output/ontario_total.csv'
    old_total = pd.read_csv(filename).set_index('date')
    total_counts = []
    for i,unit in enumerate(units_canada):
        d = {}
        unit_grp = df.groupby('unit').get_group(unit)
        cases_today = len(unit_grp[unit_grp.reported == today])
        cases_so_far = old_total[ind[i]][0]
        d['total'] = cases_so_far + cases_today
        total_counts.append(d)
        
    # today's total counts
    total_df = pd.DataFrame(total_counts, index=ind)
    
    # adding total to record
    new_total_row = pd.DataFrame(total_df.total).T
    new_total_row.index = [today]
    new_total = pd.concat([new_total_row, old_total])
    new_total.index.name = 'date'
    new_total.to_csv('../data/output/ontario_total.csv')
    
    print(f'Wrote total case record to {filename}.')
    return new_total

def daily():
    '''
    Calculates new cases today in each tracked unit
    using total_df.
    '''
    
    # reading in total cases
    df = pd.read_csv('../data/output/ontario_total.csv').set_index('date')
    
    # getting today's total, versus yesterday's
    data = pd.concat([df.xs(today), df.xs(yesterday)], axis=1).T
    
    # calculating new counts for each unit
    unit_names = df.columns.tolist()
    get_unit_cases = lambda n: data[n].diff(periods = -1)[0]
    cases_today = pd.DataFrame([get_unit_cases(name) for name in unit_names],
                    index = unit_names, columns = [today]).T
    
    # calculating 7-day averages
    # assembling past seven days of new case counts
    yesterday_df = pd.read_csv('../data/output/ontario_new.csv').set_index('date')
    new_df = pd.concat([cases_today, yesterday_df[unit_names]])
    
    # getting average from that df
    avgs = {}
    for unit in unit_names:
        s = new_df[unit][::-1]
        avgs[unit + '_7'] = s.rolling(window=7).mean()[::-1][0]
    avg_today = pd.DataFrame(avgs, index=[today])
    
    # getting all avgs and adding on today's
    avg_names = [n + '_7' for n in unit_names]
    avg_df = pd.concat([avg_today, yesterday_df[avg_names]])
    
    # assembling new cases & 7-day average into final df
    daily_df = pd.concat([new_df, avg_df], axis=1)
    daily_df = daily_df[['London', 'London_7',
              'Durham','Durham_7',
              'Halton','Halton_7',
              'Hamilton','Hamilton_7',
              'Ottawa','Ottawa_7',
              'Waterloo','Waterloo_7',
              'Windsor','Windsor_7']]
    daily_df.index.name = 'date'
    
    # saving to file
    filename = '../data/output/ontario_new.csv'
    daily_df.to_csv(filename)
    print(f'Wrote daily/avg case record to {filename}')
    
    return daily_df

def fourteen():
    '''
    Calculates daily, rolling 14-day change in daily
    new cases in London + its peers.
    '''
    
    # daily cases
    df = pd.read_csv('../data/output/ontario_new.csv').set_index('date')
    
    # calculating change for each unit
    unit_names = ['London','Durham','Halton',
                  'Hamilton','Ottawa','Waterloo',
                  'Windsor']
    
    changes = {}
    for unit in unit_names:
        # getting 14-day section
        s = df[unit][::-1]
        t = s[len(s)-14:]
        # getting total of each 7-day half
        p, q = t[:7], t[7:]
        first = sum(q)
        second = sum(p)
        # calculating changes
        c = (first / second * 100) - 100
        changes[unit] = c
    
    # adding new data to record
    filename = '../data/output/ontario_change.csv'
    changes_today = pd.DataFrame(changes, index=[today])
    changes_before = pd.read_csv(filename).set_index('date')
    change_df = pd.concat([changes_today, changes_before])
    change_df.index.name = 'date'
    change_df.to_csv(filename)   
    
    print(f'Wrote 14-day change record to file at {filename}.')
    return change_df

def demo():
    '''
    Calculates percentages of each demo among total cases
    in London, as of today.
    '''
    
    # getting today's cases in London for all demos
    df = pd.read_csv('./data/ontario_data.csv').set_index('unit')
    london = df.groupby('unit').get_group('Middlesex-London Health Unit')
    london = london.sort_values(by=['reported'])
    timespan = [x.strftime('%Y-%m-%d') for x in pd.date_range(start = '2020-01-24', end = today)]
    london = london[london.reported.isin(timespan)]
    new_london_ages = pd.DataFrame(london.age.value_counts()).T
    new_london_ages.index = [today]
    
    # saving total age data
    filename = './data/output/london_ages.csv'
    london_ages = pd.read_csv(filename).set_index('date')
    final_london_ages = pd.concat([london_ages, new_london_ages])
    final_london_ages.index.name = 'date'
    final_london_ages.to_csv(filename)
    
    # getting age proportions
    total = new_london_ages.T.sum()[0]
    age_categories = ['<20','20s','30s','40s','50s','60s','70s','80s','90+']
    age_data = pd.Series(new_london_ages[age_categories].T[today]).tolist()
    d = [x / total for x in age_data]
    new_demo_pcts = pd.DataFrame(d).T
    new_demo_pcts.index = [today]
    new_demo_pcts.columns =  age_categories
    
    # saving age proportions
    filename = './data/output/london_ages_pct.csv'
    demo_pcts = pd.read_csv(filename).set_index('date')
    final_demo_pcts = demo_pcts.append(new_demo_pcts)
    final_demo_pcts.index.name = 'date'
    final_demo_pcts.to_csv(filename)
    

if __name__ == "__main__":
    
    # datetime for storage
    today = datetime.today() - timedelta(days = 1)
    yesterday = today - timedelta(days = 2)
    today = today.strftime('%Y-%m-%d')
    yesterday = yesterday.strftime('%Y-%m-%d')
    
    df = get_data()
    total_data = total(df)
    daily_data = daily()
    fteen = fourteen()
