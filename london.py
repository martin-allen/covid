import pandas as pd
from london_scrape import scrape
from thumbs import make_thumbnail
from tweet import send_tweet

'''
Wraps all processes that run from MLHU's
daily updates..
'''

# today's data
data = scrape()

updates only if data is new
if data:
    print('Data is new.')
    print('Making thumbnail...')
    make_thumbnail()
    print('Sending tweet...')
    send_tweet()
else:
    print('Data is same.')