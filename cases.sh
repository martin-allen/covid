#
# These scrapers run at noon every day.
# Since this is the last scrape of the day,
# it also updates the repo.
#

# scrapers
./ontario.py
./london.py

# git
git add .
git commit -m 'Data update'
git push