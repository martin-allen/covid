import json
import time
import smtplib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

def load():
    
    # setting to headless
    options = Options()
    options.headless = True
    
    # starting browser
    driver_path = 'chromedriver'
    driver = webdriver.Chrome(executable_path=driver_path,
                              chrome_options=options)
    
    # going to page
    url = paths['url']
    driver.get(url)
    
    # selecting container with all data
    parent = driver.find_element_by_xpath(paths['parent'])
    
    return parent

def general(parent):
    
    # function to pull numbers from given xpath
    get_stat = lambda x: int(parent.find_element_by_xpath(x).text.replace(',',''))
    time.sleep(10)
    
    # selecting stats
    new_cases = get_stat(paths['general']['new_cases'])
    total_cases = get_stat(paths['general']['total'])
    total_deaths = get_stat(paths['general']['total_deaths'])
    recovered = get_stat(paths['general']['total_recovered'])
    active = total_cases - (total_deaths + recovered)
    
    print('Data collected.')
    
    # loading in past data for update
    filename = './data/output/ml_general.csv'
    old_data = pd.read_csv(filename).set_index('date')
    yesterday_data = old_data.iloc[0]
    
    # new data from today
    avg = np.NaN
    new_data = pd.DataFrame([total_cases, new_cases, avg],
               columns=[today],
               index = ['total','new','avg']).T
    
    # checking if data is updated
    if (new_data.new[0] == yesterday_data.new and new_data.total[0] == yesterday_data.total):
        return False
    
    # combining with yesterday's record
    final_data = new_data.append(old_data)
    final_data.index.name = 'date'
    
    # calculating new 7day avg
    week = final_data.new[:7]
    avg = week.rolling(window=7).mean()[-1]
    final_data.avg[0] = avg
    
    # saving to file
    final_data.to_csv(filename)
    return True
    

def scrape():
    
    print(f'Collecting data for {today}...')
    
    parent = load()
    data = general(parent)
    
    return data

# urls and XPATHs
with open('./data/paths.json') as file:
    paths = json.load(file)

today = datetime.today()
yesterday = today - timedelta(days = 1)
today = today.strftime('%Y-%m-%d')
yesterday = yesterday.strftime('%m-%d')