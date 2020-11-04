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
      data:[],
      d_votes:3,
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
      }), this.drawMap());
    });
  }
  drawMap() {
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
      if (parseFloat(this.state.data[area].d) > 0) {
        this.setState((state, props) => ({
          d_votes:parseInt(state.d_votes + parseInt(this.state.data[area].votes) * parseFloat(this.state.data[area].d))
        }));
      }
      if (parseFloat(this.state.data[area].r) > 0) {
        this.setState((state, props) => ({
          r_votes:parseInt(state.r_votes + parseInt(this.state.data[area].votes) * parseFloat(this.state.data[area].r))
        }));
      }
      if (parseFloat(this.state.data[area].d) > parseFloat(this.state.data[area].r)) {
        return 'rgba(105, 141, 197, ' + parseFloat(this.state.data[area].d) + ')';
      }
      else if (parseFloat(this.state.data[area].r) > 0) {
        return 'rgba(240, 119, 99, ' + parseFloat(this.state.data[area].r) + ')';
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
        <div className={style.meta_container}>
          <div><label className={style.democratics}></label><span className={style.value}>Biden {this.state.d_votes}</span><label className={style.republicans}></label><span className={style.value}>Trump {this.state.r_votes}</span></div>
          <div><label>Source</label><span className={style.value}>DPA</span> <label>Updated</label><span className={style.value}>7:48 GMT</span></div>
        </div>
      </div>
    );
  }
}
export default App;