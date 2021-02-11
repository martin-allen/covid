import pandas as pd
import altair as alt

def rows(df):
    
    today = pd.to_datetime(df.iloc[-1].date).strftime('%b %d')    
    print(f'Making rows for {today}...')
    
    # total area chart
    total = alt.Chart(df).mark_area(
        line = {'color': '#336634'},
        color = '#9DC49E'
    ).encode(
        alt.X('date:T',
             axis = alt.Axis(
                 title=None,
                 labelOpacity = 1
             )),
        alt.Y('total:Q',
            axis = alt.Axis(
                title='Total Doses',
                titleColor = '#8FB38F',
                orient = 'right',
                grid=False
                ))
    ).properties(
        width = 600,
        height = 400
    )
    
    # vaccination bars
    vaccd = alt.Chart(df).mark_area(
        line = {'color': '#66334B'},
        color = '#783C58'
    ).encode(
        alt.X('date:T',
              axis = alt.Axis(
                  labelOpacity = 0,
                  title = None,
                  grid = False
                )
        ),
        alt.Y('vaccinated:Q', 
              axis = alt.Axis(
                  title = 'Total People (Two Doses)',
                  titleColor = '#66334B',
                  orient = 'right'
                ))
    ).properties(
        width = 600,
        height = 400,
    )
    
    main = alt.layer(
        total, vaccd
    ).properties(
        width = 600,
        height = 400
    )
    
    new_doses = alt.Chart(df).mark_bar(
        color = '#6F956F'
    ).encode(
        alt.X('date:O',
             axis = alt.Axis(
                 title=None,
                 grid=False,
                 labelOpacity=0
             )),
        alt.Y('new:Q',
             axis = alt.Axis(
                 titleColor = '#336634',
                 orient = 'right',
                 grid=False
             ))
    ).properties(
        width = 600,
        height = 200
    )
    
    new_vaccs = alt.Chart(df).mark_bar(
        color = '#66334B'
    ).encode(
        alt.X('date:O',
             axis = alt.Axis(
                 title=None,
                 grid=False,
                 labelOpacity=0,
                 labelFontSize = 1
             )),
        alt.Y('new_vaccinated:Q',
             axis = alt.Axis(
                 title = 'New doses/vaccinations',
                 titleColor = '#336634',
                 orient = 'right',
                 grid=False
             ))
    ).properties(
        width = 600,
        height = 200
    )
    
    new = alt.layer(
        new_doses, new_vaccs
    ).properties(
        width = 600,
        height = 200
    )
    
    return main, new

def plot(df, main, new):
    
    print('Combining into thumbnail...')
    today = pd.to_datetime(df.iloc[-1].date).strftime('%b %d')
    nv = int(df.iloc[-1].new_vaccinated)
    v = int(df.iloc[-1].vaccinated)
    
    thumb = alt.VConcatChart(
        vconcat = [main, new]
    ).configure_view(
        strokeWidth = 0
    ).properties(
                title = {
                    'text': [
                        'Ontario Vaccinations',
                        f'{today}: {nv:,d} new, {v:,d} total'
                    ],
                    'subtitle': [
                        'doses vs vaccinations: total and daily',
                        '@OntVaccine by @__martinallen__'
                    ]
                }
        ).configure_title(
                fontSize = 30,
                color = '#336634'
        )
    
    return thumb
    
def make_chart():
    df = pd.read_csv('./data/output/vaccine.csv')
    
    main, new = rows(df)
    thumb = plot(df, main, new)
    
    thumb.save('./data/viz/vacc_chart.png', scale_factor=2.0)
    print('Thumbnail saved to ./data/viz/vacc_chart.png!')    