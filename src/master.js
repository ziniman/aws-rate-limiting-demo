import React from 'react';
import ReactApexChart from 'react-apexcharts';

const API_ENDPOINT = process.env.REACT_APP_BACKEND_API;

function get_data(){

}

class Master extends React.Component {
    constructor(props) {
    super(props);

    this.state = {
      series: [0, 0, 0, 0],
      options: {
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
          enabled: true
        },
        plotOptions: {
          pie: {
            startAngle: -90,
            endAngle: 270
          }
        },
        fill: {
          colors: ['#dc3545', '#6c757d', '#ffc107', '#007bff', '#28a745']
        },
        title: {
          text: 'Gradient Donut with custom Start-angle'
        },
        markers: {
           colors: ['#F44336', '#E91E63', '#9C27B0']
        },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              show: false
            }
          }
        }],
        legend: {
          position: 'right',
          offsetY: 0,
          height: 230,
        }
      },
    };
  }

  call_url() {
    var data;

    fetch(API_ENDPOINT + '/info/get_colors', {
      method: 'GET',
      headers : {'Content-Type': 'application/json'}
    })
    .then(async res => {
      const data = await res.json();
      console.log(data);
      this.setState({
        series: [data['Gray'], data['Blue'], data['Yellow'], data['Red'], data['Green']]
      })

    });
  }

  componentDidMount() {
    this.interval = setInterval(() => this.call_url(), 3000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <div className="container">
        <div className="chart-wrap">
          <div id="chart">
            <ReactApexChart options={this.state.options} series={this.state.series} labels={this.state.labels} type="donut" />
          </div>
        </div>
      </div>
    );
  }

}



export default Master;
