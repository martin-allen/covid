import pandas as pd
import altair as alt

'''
FOR % PEOPLE HIGHLIGHTING,
SEE ARTICLE ON CONDITIONAL COLOURING HERE:
https://www.geeksforgeeks.org/highlight-a-bar-in-bar-chart-using-altair-in-python/
'''

def doses(df):

    base = alt.Chart(df).encode(
        alt.X('date:T', axis=alt.Axis(title=None))
    )

    total = base.mark_area(
        line = {'color': '#8FB38F'},
        color = '#9DC49E',
        opacity = 0.5
    ).encode(
        alt.Y('total:Q',
            axis = alt.Axis(
                title='Total Doses',
                titleColor = '#8FB38F',
                grid = True
                ))
    )

    new_dots = base.mark_circle(
        color = '#336634'
    ).encode(
        alt.Y('new:Q',
            axis = alt.Axis(
                title='New Doses',
                titleColor = '#336634',
                grid = True
                ))
    )

    new_line = base.mark_line(
        color = '#336634',
        # strokeDash = [1,1]
    ).encode(
        y = alt.Y('new:Q',
                axis = alt.Axis(
                        labelOpacity = 0,
                        tickOpacity = 0,
                        titleOpacity = 0,
                        grid = True
                    ))
    )

    plot = alt.layer(
        total, new_dots, new_line
    ).resolve_scale(
        y = 'independent'
    ).properties(
        width = 600,
        height = 500
    )

    return plot

def vacc(df):
    plot = alt.Chart(df).mark_bar(
        color = '#66334B'
    ).encode(
        alt.X('date:O',
            #   axis = alt.Axis(
            #       labelOpacity = 0,
            #       tickOpacity = 0,
            #       titleOpacity = 0,
            #       title = None,
            #       grid = False
            #     )
            axis = None
        ),
        alt.Y('vaccinated:Q', 
              axis = alt.Axis(
                  title = 'Vaccinated People',
                  titleColor = '#66334B',
                  orient = 'right'
                ))
    ).properties(
        width = 600,
        height = 150,

    )
    
    return plot

def plot(df, dosed, vaccd):
    
    today = pd.to_datetime(df.iloc[-1].date).strftime('%b %d')
    doses = int(df.iloc[-1].new)
    
    plot = alt.VConcatChart(
        vconcat = [dosed, vaccd]
    ).configure_view(
        strokeWidth = 0
    ).configure_axis(
        gridOpacity = 0.2,
        titleFontSize = 15
    ).properties(
        title = {
            'text': [
                'Ontario Vaccinations',
                f'{today}: {doses:,d} new doses'
            ],
            'subtitle': [
                'new doses and total doses; total vaccinated people',
                '@OntVaccine by @__martinallen__'
            ]
        }
    ).configure_title(
        fontSize = 30,
        dy = -10,
        color = '#336634'
    )
    
    return plot

if __name__ == "__main__":
    df = pd.read_csv('./data/output/vaccine.csv')
    dosed = doses(df)
    vaccd = vacc(df)
    chart = plot(df, dosed, vaccd)
    
    chart.save('./data/viz/vacc_chart.png', scale_factor=2.0)
    
