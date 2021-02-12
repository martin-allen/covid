import tweepy as tw
import pandas as pd
import json

def data():
    # data
    df = pd.read_csv('./data/output/vaccine.csv')
    
    # getting date and new cases
    today = pd.to_datetime(df.iloc[-1].date).strftime('%b %d')
    total_vaccd = int(df.iloc[-1].vaccinated)
    new_vaccd = total_vaccd - int(df.iloc[-2].vaccinated)
    total_doses = int(df.iloc[-1].total)
    new_doses = int(df.iloc[-1].new)
    
    print('Data collected.')
    return today, total_vaccd, new_vaccd, total_doses, new_doses
    

def send_tweet():
    
    # data
    today, total_vaccd, new_vaccd, total_doses, new_doses = data()
    
    # keys
    with open('./data/viz/files/keys.json') as file:
        paths = json.load(file)
        api = paths['api']
        api_secret = paths['api_secret']
        access = paths['access']
        access_secret = paths['access_secret']


    # authenticating
    auth = tw.OAuthHandler(
        api,
        api_secret
    )
    auth.set_access_token(
        access,
        access_secret
    )

    # api object
    api = tw.API(auth)
        
    # creating media object
    media = api.media_upload('./data/viz/vacc_chart.png')
    message = f'''
        ONTARIO VACCINATIONS ON {today.upper()}: 
        \n\n \U0001F4C8 {new_vaccd:,} more people vaccinated
        \n \U0001F4C8 {total_vaccd:,} total people have been vaccinated so far
        \n\n #COVID19Ontario #onpoli
    '''

    # tweet command
    api.update_status(status = message,
                    media_ids = [media.media_id])
    print('Tweeted.')
    
if __name__ == "__main__":
    send_tweet()