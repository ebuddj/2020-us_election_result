import React, {Component} from 'react'
import style from './../styles/styles.less';

// https://github.com/topojson/topojson
import * as topojson from 'topojson-client';

// https://d3js.org/
import * as d3 from 'd3';

let interval, g, path;
// https://observablehq.com/@d3/u-s-map
const projection = d3.geoAlbersUsa().scale(1500).translate([645, 400]);

const areaCenters = {"Alabama":{"Lat":32.7794, "Long":-86.8287},"Alaska":{"Lat":64.0685, "Long":-152.2782},"Arizona":{"Lat":34.2744, "Long":-111.6602},"Arkansas":{"Lat":34.8938, "Long":-92.4426},"California":{"Lat":37.1841, "Long":-119.4696},"Colorado":{"Lat":38.9972, "Long":-105.5478},"Connecticut":{"Lat":41.6219, "Long":-72.7273},"Delaware":{"Lat":38.9896, "Long":-75.505},"District of Columbia":{"Lat":38.9101, "Long":-77.0147},"Florida":{"Lat":28.6305, "Long":-82.4497},"Georgia":{"Lat":32.6415, "Long":-83.4426},"Hawaii":{"Lat":20.2927, "Long":-156.3737},"Idaho":{"Lat":44.3509, "Long":-114.613},"Illinois":{"Lat":40.0417, "Long":-89.1965},"Indiana":{"Lat":39.8942, "Long":-86.2816},"Iowa":{"Lat":42.0751, "Long":-93.496},"Kansas":{"Lat":38.4937, "Long":-98.3804},"Kentucky":{"Lat":37.5347, "Long":-85.3021},"Louisiana":{"Lat":31.0689, "Long":-91.9968},"Maine":{"Lat":45.3695, "Long":-69.2428},"Maine 1st":{"Lat":45.3695, "Long":-68},"Maine 2nd":{"Lat":44.75, "Long":-68.25},"Maryland":{"Lat":39.055, "Long":-76.7909},"Massachusetts":{"Lat":42.2596, "Long":-71.8083},"Michigan":{"Lat":44.3467, "Long":-85.4102},"Minnesota":{"Lat":46.2807, "Long":-94.3053},"Mississippi":{"Lat":32.7364, "Long":-89.6678},"Missouri":{"Lat":38.3566, "Long":-92.458},"Montana":{"Lat":47.0527, "Long":-109.6333},"Nebraska":{"Lat":41.5378, "Long":-99.7951},"Nebraska 1st":{"Lat":41.75, "Long":-98.5},"Nebraska 2nd":{"Lat":41.75, "Long":-97.5},"Nebraska 3rd":{"Lat":41.1, "Long":-98.5},"Nevada":{"Lat":39.3289, "Long":-116.6312},"New Hampshire":{"Lat":43.6805, "Long":-71.5811},"New Jersey":{"Lat":40.1907, "Long":-74.6728},"New Mexico":{"Lat":34.4071, "Long":-106.1126},"New York":{"Lat":42.9538, "Long":-75.5268},"North Carolina":{"Lat":35.5557, "Long":-79.3877},"North Dakota":{"Lat":47.4501, "Long":-100.4659},"Ohio":{"Lat":40.2862, "Long":-82.7937},"Oklahoma":{"Lat":35.5889, "Long":-97.4943},"Oregon":{"Lat":43.9336, "Long":-120.5583},"Pennsylvania":{"Lat":40.8781, "Long":-77.7996},"Rhode Island":{"Lat":41.6762, "Long":-71.5562},"South Carolina":{"Lat":33.9169, "Long":-80.8964},"South Dakota":{"Lat":44.4443, "Long":-100.2263},"Tennessee":{"Lat":35.858, "Long":-86.3505},"Texas":{"Lat":31.4757, "Long":-99.3312},"Utah":{"Lat":39.3055, "Long":-111.6703},"Vermont":{"Lat":44.0687, "Long":-72.6658},"Virginia":{"Lat":37.5215, "Long":-78.8537},"Washington":{"Lat":47.3826, "Long":-120.4472},"Washington D.C.":{"Lat":38.9072, "Long":-77.0369},"West Virginia":{"Lat":38.6409, "Long":-80.6227},"Wisconsin":{"Lat":44.6243, "Long":-89.9941},"Wyoming":{"Lat":42.9957, "Long":-107.5512}};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data:[],
      d_votes:0,
      r_votes:0
    }
  }
  componentDidMount() {
    // https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_US.csv
    d3.csv('./data/data.csv').then((response) => {
      let elems = {};
      for (let i = 0; i < response.length; i++) {
        elems[response[i].state] = response[i];
      }
      this.setState((state, props) => ({
        data:elems
      }), this.drawMap(response));
    });
  }
  drawMap(data) {
    let width = 1200;
    let height = 800;
    let svg = d3.select('.' + style.map_container).append('svg').attr('width', width).attr('height', height);
    path = d3.geoPath().projection(projection);
    g = svg.append('g');
    d3.json('./data/states-10m.json').then((topology) => {
      g.selectAll('path').data(topojson.feature(topology, topology.objects.states).features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('class', style.path)
        .attr('fill', (d, i) => {
          return 'rgba(239, 240, 244, 1)';
        });

      g.selectAll('circle').data(data)
        .enter()
        .append('circle')
        .attr('cx', (d, i) => {
          return projection([areaCenters[d.state].Long, areaCenters[d.state].Lat])[0];
        })
        .attr('cy', (d, i) => {
          return projection([areaCenters[d.state].Long, areaCenters[d.state].Lat])[1];
        })
        .attr('r', (d, i) => {
          if (parseInt(d.votes) === 1) {
            return 6;
          }

          return Math.max(Math.sqrt(parseInt(d.votes)) * 7, 12);
        })
        .attr('stroke', (d,i) => {
          if (parseFloat(d.d) > 0 || parseFloat(d.r) > 0) {
            return 'transparent'
          }
          else {
            return '#000';
          }
        })
        .attr('class', style.circle)
        .style('fill', (d, i) => {
          if (parseFloat(d.d) > parseFloat(d.r)) {
            return 'rgba(48, 111, 185, ' + parseFloat(d.d) + ')';
          }
          else if (parseFloat(d.r) > 0) {
            return 'rgba(227, 75, 91, ' + parseFloat(d.r) + ')';
          }
          else {
            return 'rgba(239, 240, 244, 1)';
          }
        });

      g.selectAll('text').data(data)
        .enter()
        .append('text')
        .style('fill', (d, i) => {
          if (parseFloat(d.d) > 0 || parseFloat(d.r) > 0) {
            return '#fff'
          }
          else {
            return '#000';
          }
        })
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'central')
        .attr('class', style.number)
        .attr('x', (d, i) => {
          return projection([areaCenters[d.state].Long, areaCenters[d.state].Lat])[0];
        })
        .attr('y', (d, i) => {
          return projection([areaCenters[d.state].Long, areaCenters[d.state].Lat])[1];
        })
        .style('font-size', (d, i) => {
          return Math.max(Math.sqrt(parseInt(d.votes)) * 7, 12) + 'px';
        })
        .html((d, i) => {
          this.countVotes(d.state);
          return d.abbr;
        });
    });
  }
  changeAreaAttributes() {
  }
  countVotes(area) {
    if (this.state.data[area]) {
      if (parseFloat(this.state.data[area].d) > 0) {
        this.setState((state, props) => ({
          d_votes:parseInt(state.d_votes + parseInt(this.state.data[area].votes))
        }));
      }
      else if (parseFloat(this.state.data[area].r) > 0) {
        this.setState((state, props) => ({
          r_votes:parseInt(state.r_votes + parseInt(this.state.data[area].votes))
        }));
      }
      else {

      }
    }
  }
  componentDidUpdate(prevProps, prevState, snapshot) {

  }
  componentWillUnMount() {

  }
  // shouldComponentUpdate(nextProps, nextState) {}
  // static getDerivedStateFromProps(props, state) {}
  // getSnapshotBeforeUpdate(prevProps, prevState) {}
  // static getDerivedStateFromError(error) {}
  // componentDidCatch() {}
  render() {
    return (
      <div className={style.plus}>
        <div>
          <div className={style.map_container}></div>
        </div>
        <div className={style.meta_container}>
          <div><label className={style.democratics}></label><span className={style.value}>Biden {this.state.d_votes}</span><label className={style.republicans}></label><span className={style.value}>Trump {this.state.r_votes}</span></div>
          <div><label>Source</label><span className={style.value}>DPA</span> <label>Updated</label><span className={style.value}>4.11.2020 18:11 GMT</span></div>
        </div>
      </div>
    );
  }
}
export default App;