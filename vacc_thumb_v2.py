import pandas as pd
import altair as alt

def rows(df):
    
    print(f'Making rows for {today}...')
    
    # new dots/line
    new_dots = alt.Chart(df).mark_circle(
        color = '#336634',
        size = 50
    ).encode(
        alt.X('date:T',
             axis = alt.Axis(title=None)),
        alt.Y('new:Q',
            axis = alt.Axis(
                title='New Doses',
                titleColor = '#336634',
                orient = 'right'
                ))
    )
    new_line = alt.Chart(df).mark_line(
        color = '#336634'
    ).encode(
        alt.X('date:T',
             axis = alt.Axis(title=None)),
        alt.Y('new:Q',
             axis = alt.Axis(
                 orient = 'right'
             ))
    )
    new = alt.layer(
        new_line, new_dots
    ).properties(
        width = 600,
        height = 200
    )
    
    # total area chart
    total = alt.Chart(df).mark_area(
        line = {'color': '#336634'},
        color = '#9DC49E',
        opacity = 0.5
    ).encode(
        alt.X('date:T',
             axis = alt.Axis(
                 title=None,
                 labelOpacity = 0
             )),
        alt.Y('total:Q',
            axis = alt.Axis(
                title='Total Doses',
                titleColor = '#8FB38F',
                orient = 'right'
                ))
    ).properties(
        width = 600,
        height = 200
    )
    
    # vaccinations bar chart
    vaccd = alt.Chart(df).mark_bar(
        color = '#66334B'
    ).encode(
        alt.X('date:O',
              axis = alt.Axis(
                  labelOpacity = 0,
                  labelFontSize = 1,
                  title = None,
                  grid = False
                )
        ),
        alt.Y('vaccinated:Q', 
              axis = alt.Axis(
                  title = 'Total People (two doses)',
                  titleColor = '#66334B',
                  orient = 'right'
                ))
    ).properties(
        width = 600,
        height = 150,
    )
    
    return new, total, vaccd

def plot(new, total, vaccd):
    
    print('Combining into thumbnail...')
    
    thumb = alt.VConcatChart(
        vconcat = [new, total, vaccd]
    ).configure_view(
        strokeWidth = 0
    ).configure_axis(
        grid = False
    ).properties(
            title = {
                'text': [
                    'Ontario Vaccinations',
                    f'{today}: {doses:,d} new doses'
                ],
                'subtitle': [
                    'new doses; total doses; total vaccinated people',
                    '@OntVaccine by @__martinallen__'
                ]
            }
    ).configure_title(
            fontSize = 30,
            color = '#336634'
    )
    
    return thumb
    
if __name__ == "__main__":
    df = pd.read_csv('./data/output/vaccine.csv')
    today = pd.to_datetime(df.iloc[-1].date).strftime('%b %d')
    doses = int(df.iloc[-1].new)
    
    new, total, vaccd = rows(df)
    thumb = plot(new, total, vaccd)
    
    thumb.save('./data/viz/vacc_chart.png', scale_factor=2.0)
    print('Thumbnail saved to ./data/viz/vacc_chart.png!')    