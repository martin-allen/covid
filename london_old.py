import json
import time
import pandas as pd
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def setup():
    """
    Clicks into webpage; returns parent of all elements.
    """
    url = paths['url']
    
    # click into main BI page
    driver.get(url)
    time.sleep(15)
    link = WebDriverWait(driver, 15).until(
        EC.element_to_be_clickable((By.XPATH, paths['link']))
    )
    link.click()
    
    # getting parent element
    driver.switch_to.window(driver.window_handles[-1])    
    parent = WebDriverWait(driver, 15).until(
        EC.visibility_of_element_located((By.XPATH, paths['parent']))
    )
    return parent

def general(parent):
    '''
    Basic London-wide stats for all demographics.
    '''
    get_stat = lambda x: int(parent.find_element_by_xpath(x).text)
    time.sleep(15)
    
    # selecting stats
    new_cases = get_stat(paths['general']['new_cases'])
    total_cases = get_stat(paths['general']['total'])
    total_deaths = get_stat(paths['general']['total_deaths'])
    recovered = get_stat(paths['general']['total_recovered'])
    active = total_cases - (total_deaths + recovered)
    
    print('General data collected.')
    
    # writing out summary for editors
    office_summary = pd.DataFrame([new_cases, total_cases,
                                   total_deaths, recovered, active],
                                  index=['new cases','total cases',
                                         'total deaths', 'recovered',
                                         'active'],
                                  columns=[today]).T
    old_summary = pd.read_csv('./data/output/ml_summary.csv').set_index('date')
    final_summary = pd.concat([office_summary,old_summary])
    final_summary.index.name = 'date'
    final_summary.to_csv('./data/output/ml_summary.csv')
    
    '''
    Removing death tracking from this version. Can re-add using these paths:
    '''
    # new_deaths = get_stat(paths['general']['new_deaths'])
    # total_deaths = get_stat(paths['general']['total_deaths'])
    
    # calculating daily rolling average from past stats
    filename = './data/output/ml_general.csv'
    old_data = pd.read_csv(filename).set_index('date')
    week = old_data.new[:7]
    avg = week.rolling(window=7).mean()[-1]
    
    # writing out stats for new daily cases graph
    new_data = pd.DataFrame([total_cases, new_cases, avg],
                    columns=[today],
                    index = ['total','new','avg']).T
    final_data = new_data.append(old_data)
    final_data.index.name = 'date'
    final_data.to_csv(filename)
    
    return final_data

def students(parent):
    '''
    Selects both demographics and combines their stats.
    '''
    
    def hospital():
        '''
        Gets hospitalization rates of student demo. 
        This total is used to calculate overall student cases.
        '''
        
        def extract_hospital_data():
            '''
            Returns data from DOM once a rect is clicked.
            '''
            graph = parent.find_element_by_xpath(paths['hospital']['parent'])
            svg = graph.find_elements_by_tag_name('svg')[1]
            t = svg.find_elements_by_tag_name('text')
            not_hospital = int(t[3].text)
            hospital = int(t[4].text)
            icu = int(t[5].text) 
            return pd.Series([not_hospital, hospital, icu],
                            index = ['n','y','icu'],
                            name = today)
        
        # clicks rectangle, gets data for both demos
        time.sleep(10)
        hospital_data = []
        for demo in ['under_20', 'over_20']:
            if demo == 'under_20':
                rects[1].click()
                print('Clicked on under_20 rectangle.')
            elif demo == 'over_20':
                rects[2].click()
                print('Clicked on under_20 rectangle.')
            time.sleep(10)
            demo_data = extract_hospital_data()
            hospital_data.append(demo_data)
            print(f'Hospital rates of {demo} collected.')    
        
        # combining demos into student demo
        new_hospital_rates = sum(hospital_data)
        
        # writing to file
        new_hospital_rates.index.name = 'date'
        filename = './data/output/student_hospital.csv'
        hospital_rates = pd.read_csv(filename).set_index('date')
        hospital_rates = hospital_rates.append(new_hospital_rates)
        hospital_rates.to_csv(filename)
        
        return new_hospital_rates
            
    
    # finding graph element to click on demo data for hospital()
    graph = parent.find_element_by_xpath(paths['student']['parent'])
    rects = graph.find_elements_by_tag_name('rect')
    
    # getting hospital rates of student demo with hospital()
    new_hospital_rates = hospital()
    
    # getting student total from hospital rates
    new_student_total = pd.Series([sum(new_hospital_rates), -1],
                              name = today,
                              index = ['total','new'])
    
    # calculating new student cases from yesterday's total
    filename = './data/output/student_total.csv'
    student_total = pd.read_csv(filename).set_index('date')
    yesterday_total = student_total.total.loc[yesterday]
    today_total = yesterday_total - new_student_total.total
    new_student_total['new'] = today_total
        
    # writing out student total
    new_student_total.index.name = 'date'
    student_total = student_total.append(new_student_total)
    student_total.to_csv(filename)
    
    return new_hospital_rates, new_student_total

if __name__ == "__main__":
    
    # datetime for storage
    today = datetime.today()
    yesterday = today - timedelta(days = 1)
    # week_ago = today - timedelta(days = 6)
    today = today.strftime('%Y-%m-%d')
    yesterday = yesterday.strftime('%m-%d')
    
    # paths file for XPATH selection
    with open('./data/paths.json') as file:
        paths = json.load(file)
    driver_path = 'chromedriver'
    driver = webdriver.Chrome(executable_path=driver_path)
    
    parent = setup()
    data = general(parent)