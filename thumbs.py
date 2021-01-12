import pandas as pd
import altair as alt

# DAILY CASE CHART
def daily():

    # data
    ldn = pd.read_csv('./data/output/ml_general.csv')[::-1][35:]
    ldn = ldn.rename(columns={'London': 'new', 'London_7': 'avg'})
    
    # getting date and new cases
    today = pd.to_datetime(ldn.iloc[-1].date).strftime('%b %d')
    cases = int(ldn.iloc[-1].new)
    
    # avg line
    avg = alt.Chart(
        ldn
    ).mark_line(
        strokeWidth=2.5,
        color='#27516B'
    ).encode(
        x='date:T',
        y='avg:Q'
    )

    # daily feather
    new = alt.Chart(
        ldn
    ).mark_line(
        opacity=0.35,
        strokeDash=[1,1]
    ).encode(
        x = 'date:T',
        y = alt.Y(
            'new:Q',
            scale = alt.Scale(
                domain=[0,int(ldn.new.max())]
            )
        )
    )

    # final datum dot
    dot = alt.Chart(
        ldn
    ).mark_circle(
        size = 5,
        opacity = 0.8
    ).encode(
        x = 'date:T',
        y = alt.Y(
            'new:Q',
            scale = alt.Scale(
                domain=[0,int(ldn.new.max())]
            )
        )
    )

    # combined
    d = alt.LayerChart(
        layer=[new,avg,dot]
    ).properties(
        width=375,
        height=375
        # title = {
        #     'text': '15 new cases',
        #     'subtitle': 'new cases with 7-day average'
        # }
    )

    return d, today, cases

# JOYPLOT
def joy():
    
    # data
    new = pd.read_csv('./data/output/ontario_new.csv', 
                    usecols = ['London_7', 'Durham_7',
                            'Halton_7', 'Hamilton_7',
                            'Ottawa_7', 'Waterloo_7',
                            'Windsor_7', 'date']).set_index('date')[::-1][34:]
    new.columns = ['Middlesex-London Health Unit', 'Durham Regional Health Unit',
                'Halton Regional Health Unit', 'City of Hamilton Health Unit',
                'City of Ottawa Health Unit', 'Waterloo Health Unit',
                'Windsor-Essex County Health Unit']
    # importing population data for adjustment
    pops = pd.read_csv('./data/pops.csv', usecols = ['unit', '2018']).set_index('unit')
    # formatting as required for this viz
    n = pd.DataFrame(new.unstack())
    n = n.reset_index()
    n.columns = ['region', 'date', 'value']
    n.sort_values(by=['region', 'date'], inplace = True)

    pdf = n
    regions = pdf.region.drop_duplicates().tolist()
    dfs = []
    for reg in regions:
        d = pdf.groupby('region').get_group(reg)
        p = pops.loc[reg][0]
        p_values = d.value / p
        fdf = pd.DataFrame([d.date, p_values]).T
        dfs.append(fdf)
    pdf = pd.concat(dfs, keys = regions)
    pdf = pdf.reset_index()
    pdf = pdf.drop('level_1', axis=1)
    pdf.columns = ['region', 'ont_date', 'ont_value']

    dct = {'City of Hamilton Health Unit': 'Hamilton',
        'City of Ottawa Health Unit': 'Ottawa',
        'Durham Regional Health Unit': 'Durham',
        'Halton Regional Health Unit': 'Halton',
        'Middlesex-London Health Unit': 'London',
        'Waterloo Health Unit': 'Waterloo',
        'Windsor-Essex County Health Unit': 'Windsor'}
    pdf.replace({'region': dct}, inplace = True)

    # plot
    step = 54
    overlap = 0.8
    units = ['Ottawa', 'Windsor', 'Halton', 'Durham', 'Hamilton', 'Waterloo', 'London']
    range_ = ['#7BA2BA' for u in units]
    range_[-1] = '#27516B'

    j = alt.Chart(
        pdf, height = step
    ).mark_area(
        interpolate = 'monotone',
        fillOpacity = 0.9,
        stroke = 'black',
        strokeWidth = 0.5
    ).encode(
        alt.X('ont_date:T'),
        alt.Y(
            'ont_value:Q',
            scale=alt.Scale(range = (step, -step * overlap * 2)),
            axis=None
        ),
        color = alt.Color(
            'region',
            type = 'nominal',
            legend = None,
            scale = alt.Scale(
                domain = units,
                range = range_
            )
        )
    ).facet(
        row = alt.Row(
            'region:N',
            title = None,
            header = alt.Header(
                labelAngle = 0,
                labelAlign = 'left'
            ),
            sort = units
        )
    ).properties(
        bounds = 'flush'
    )

    return j

def plot(d,j,today,cases):

    thumb = alt.ConcatChart(
        concat = [d, j]
    ).configure_axis(
        grid = False,
        title=None
    ).configure_view(
        strokeWidth = 0
    ).configure_facet(
        spacing = 0
    ).configure_title(
        fontSize = 25,
        subtitleFontSize = 12,
        align = 'left',
        anchor = 'start',
        color = '#27516B'
    ).properties(
        title = {
            'text': ['London, Ont.',
                    f'{today}: {cases} new cases'],
            'subtitle': ['new cases with 7-day average; average per 10K in peers',
                         '@CovidOnt']
        }
    )

    return thumb

def make_thumbnail():
    d, today, cases = daily()
    j = joy()
    p = plot(d,j,today,cases)

    p.save('./data/viz/chart.png', scale_factor=2.0)
    print('Thumbnail saved.')