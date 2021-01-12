import pandas as pd
import gspread

scope = ["https://spreadsheets.google.com/feeds","https://www.googleapis.com/auth/sprea...,", "https://www.googleapis.com/auth/drive...", "https://www.googleapis.com/auth/drive"]
creds_filename = 'creds.json'
gc = gspread.service_account(filename=creds_filename)

sh = gc.open_by_key('1on3iVzNfiCFpCAEJfH4xGW8NRZgvXH5iex6PEqOD5X8')

def sheet_update(sheet_name, filename):
    df = pd.read_csv(filename)
    wks = sh.worksheet(sheet_name)
    wks.update([(df.columns.values.tolist())] 
            + df.values.tolist())

ontario_new_file = '/home/user/documents/code/cronjobs/trackers/data/output/ontario_new.csv'
ontario_change_file = '/home/user/documents/code/cronjobs/trackers/data/output/ontario_change.csv'
ml_general_file = '/home/user/documents/code/cronjobs/trackers/data/output/ml_general.csv'
ml_summary_file = '/home/user/documents/code/cronjobs/trackers/data/output/ml_summary.csv'
ml_demo_pcts_file = '/home/user/documents/code/cronjobs/trackers/data/output/london_ages_pct.csv'

if __name__ == "__main__":
    sheet_update('ontario_new', ontario_new_file)
    # sheet_update('ontario_change', ontario_change_file)
    # sheet_update('ml_general', ml_general_file)
    # sheet_update('ml_fact', ml_summary_file)
    # sheet_update('ml_demo_pcts', ml_demo_pcts_file)