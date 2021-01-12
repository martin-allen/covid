import tweepy as tw
import pandas as pd
import math

def data():
    # data
    ldn = pd.read_csv('./data/output/ml_general.csv')[::-1][35:]
    
    # getting date and new cases
    today = pd.to_datetime(ldn.iloc[-1].date).strftime('%b %d')
    cases = int(ldn.iloc[-1].new)
    avg = round(ldn.iloc[-1].avg, 1)
    
    print('Data collected.')
    
    return today, cases, avg

def tweet(today, cases, avg):
    
    # keys
    api = 'DD9yBJNYCsSaExt2A0k0tpP28'
    api_secret = 'aI37ZbnzndmmwBXPBRByh52XXRi209A7uY1W4fMt0qtdidYMnc'
    access = '1346571526536097794-Of2fvZRvJe83KknSvrHcwOope07TsP'
    access_secret = 'xpED1ynLSawepPXt4mUC67xwr7u80nPLEG0IrrOJBcE7G'


    # authenticating
    auth = tw.OAuthHandler(
        api,
        api_secret
    )
    auth.set_access_token(
        access,
        access_secret
    )
    print('Authenticated.')

    # api object
    api = tw.API(auth)
        
    # creating media object
    media = api.media_upload('./data/viz/chart.png')
    message = f'''
        {today.upper()} IN LONDON: 
        \n\n \U0001F4C8 {cases} new cases
        \n \U0001F4C8 average of {avg} over 7 days
    '''

    # tweet command
    api.update_status(status = message,
                    media_ids = [media.media_id])
    print('Tweeted.')
    
def send_tweet():
    today, cases, avg = data()
    tweet(today, cases, avg)
    