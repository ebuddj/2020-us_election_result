import React, {Component} from 'react'
import style from './../styles/styles.less';

// https://github.com/topojson/topojson
import * as topojson from 'topojson-client';

// https://d3js.org/
import * as d3 from 'd3';

let interval, g, path;
// https://observablehq.com/@d3/u-s-map
const projection = d3.geoAlbersUsa().scale(1500).translate([645, 400]);

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data:[]
    }
  }
  componentDidMount() {
    // https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_US.csv
    d3.csv('./data/data.csv').then((response) => {
      let elems = {};
      for (var i = 0; i < response.length; i++) {
        elems[response[i].state] = response[i]
      }
      this.setState((state, props) => ({
        data:elems
      }), this.drawMap());
    });
  }
  drawMap() {
    let width = 1200;
    let height = 800;
    console.log(this.state.data)
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
          return this.getAreaColor(d.properties.name);
        });
    });
  }
  changeAreaAttributes() {
    // Change fill color.
    g.selectAll('path')
      .attr('fill', (d, i) => {
        return this.getAreaColor(d.properties.name);
      });
  }
  getAreaColor(area) {
    if (this.state.data[area]) {
      if (this.state.data[area].d === '1') {
        return 'rgba(105, 141, 197, 1)'
      }
      else if (this.state.data[area].r === '1') {
        return 'rgba(240, 119, 99, 1)'
      }
    }
    return '#e5e5e5';
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
      </div>
    );
  }
}
export default App;