from numpy.lib.index_tricks import nd_grid
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
                title='TOTAL doses/vaccinations',
                titleFontSize = 15,
                titleColor = '#66334B',
                orient = 'left',
                grid=False
                ))
    ).properties(
        width = 700,
        height = 250
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
                  orient = 'left'
                ))
    ).properties(
        width = 700,
        height = 250,
    )
    
    main = alt.layer(
        total, vaccd
    ).properties(
        width = 700,
        height = 250
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
                 titleColor = '#66334B',
                 orient = 'left',
                 grid=False
             ))
    ).properties(
        width = 700,
        height = 250
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
                 title = 'NEW doses/vaccinations',
                 titleColor = '#66334B',
                 titleFontSize = 15,
                 orient = 'left',
                 grid=False
             ))
    ).properties(
        width = 700,
        height = 250
    )
    
    new = alt.layer(
        new_doses, new_vaccs
    ).properties(
        width = 700,
        height = 250
    )
    
    return main, new

def plot(df, main, new):
    
    print('Combining into thumbnail...')
    today = pd.to_datetime(df.iloc[-1].date).strftime('%b %d')
    nv = int(df.iloc[-1].new_vaccinated)
    v = int(df.iloc[-1].vaccinated)
    nd = int(df.iloc[-1].new)
    d = int(df.iloc[-1].total)
    
    thumb = alt.VConcatChart(
        vconcat = [main, new]
    ).configure_view(
        strokeWidth = 0
    ).properties(
                title = {
                    'text': [
                        'Ontario Doses and Vaccinations',
                        f'{today}: {v:,d} people vaccinated so far'
                    ],
                    'subtitle': [
                        f'Total doses: {d:,}; total vaccinations: {v:,},',
                        f'New doses: {nd:,}; new vaccinations: {nv:,},',
                        '@OntVaccine by @__martinallen__'
                    ]
                }
        ).configure_title(
                fontSize = 30,
                color = '#66334B'
        )
    
    return thumb
    
def make_chart():
    df = pd.read_csv('./data/output/vaccine.csv')
    
    main, new = rows(df)
    thumb = plot(df, main, new)
    
    thumb.save('./data/viz/vacc_chart.png', scale_factor=2.0)
    print('Thumbnail saved to ./data/viz/files/vacc_chart.png!')    