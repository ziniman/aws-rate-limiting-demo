import React from 'react';
import ReactApexChart from 'react-apexcharts';

const API_ENDPOINT = process.env.REACT_APP_BACKEND_API;
var EVENT_NAME = process.env.REACT_APP_EVENT_NAME;

document.title = EVENT_NAME

if (!EVENT_NAME) {
  EVENT_NAME = 'AWS Events';
}

console.log(EVENT_NAME);
console.log(API_ENDPOINT);

class Master extends React.Component {
    constructor(props) {
    super(props);

    this.state = {
      time: 0,
      series: [0, 0, 0, 0, 0],
      options: {
        labels: ['Blue', 'Gray', 'Green', 'Red', 'Yellow'],
        chart: {
          type: 'donut',
          animations: {
            enabled: true,
            easing: 'linear',
            speed: 600,
            animateGradually: {
                enabled: true,
                delay: 150
            },
            dynamicAnimation: {
                enabled: true,
                speed: 350
            }
          },
          foreColor: '#fff',
        },
        dataLabels: {
          enabled: true,
          style: {
              fontSize: '20px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 'bold',
              colors: ['#fff']
          },
        },
        plotOptions: {
          pie: {
            startAngle: -90,
            endAngle: 270,
            donut: {
              size: '35%'
            },
          },
        },
        fill: {
          colors: ['#007bff', '#6c757d','#28a745', '#dc3545', '#ffc107']
        },
        tooltip: {
          enabled: false,
          fillSeriesColor: true,
        },
        responsive: [{
          breakpoint: 400,
          options: {
            chart: {
              width: 300
            },
            legend: {
              show: false
            }
          }
        }],
        legend: {
          show: false
        }
      },
    };
  }

  call_url() {
    var call_time = Date.now();

    fetch(API_ENDPOINT + '/info/get_colors', {
      method: 'GET',
      headers : {'Content-Type': 'application/json'}
    })
    .then(async res => {
      const data = await res.json();
      console.log(data);

      if (res.status !== 200) {
          this.setState({
              error:
                  {message: data.message},
          });
      }
      else {
        var c
        for (c in this.state.options.labels) {
          if (typeof(data[this.state.options.labels[c]]) == 'undefined') data[this.state.options.labels[c]]=0;
        }
        this.setState({
          series: [data['Blue'], data['Gray'], data['Green'], data['Red'], data['Yellow']],
          time: Date.now() - call_time,
          error: null,
        })
      }
    });
  }

  componentDidMount() {
    this.interval = setInterval(() => this.call_url(), 2000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const {error} = this.state;
    if (error) {
      return (
        <div className="container justify-content-center text-center">
          <div className="row badge block-wrap badge-pill badge-danger m-5 p-2"><h4>Error: {error.message}</h4></div>
        </div>
      );
    } else {
      return (
        <div className="container justify-content-center text-center">
          <div className="chart-wrap">
            <div><h1 className="text-center justify-content-center m-3 p-2">{EVENT_NAME}</h1></div>
            <div id="chart">
              <ReactApexChart options={this.state.options} series={this.state.series} labels={this.state.labels} type="donut" />
            </div>
            <div id="message" className="badge block-wrap badge-primary m-3 p-2"><h5>Call time: {this.state.time}ms</h5></div>
          </div>
        </div>
      );
    }
  }

}

export default Master;
