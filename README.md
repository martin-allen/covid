# Martin Allen's COVID Repository

This repo is a combination of scrapers, data and visualizations for COVID-19 in Ontario, particularly London. It updates daily at 12:05 p.m. EST.

## Backend

- `ontario.py` pulls Ontario-wide case from the province's open data API
- `vaccine.py` pulls from the same API, but for daily vaccination rates
    - it also wraps an Altair script to create a thumbnail visualization of the data, which it tweets via `tweet.py` to @OntVaccine
- `london.py` runs a headless browser via Selenium to pick out data from London's only data source: a closed-source PowerBI dashboard with no data download

## Frontend

- this repo has a [project page](martin-allen.github.io/covid) 
- several D3 scripts pull from the data from the scrapers to visualize various stats about London and related health units around Ontario
