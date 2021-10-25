import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import CountyCard from './card/CountyCard';
import StateCard from './card/StateCard';
import { MapService } from './services/MapServices';
import { MapUtils } from '../utils/MapUtils';

const CardLocator = ({ children }) => children;

class Map extends Component {
  static defaultProps = {
    center: {
      lat: 42,
      lng: -74
    },
    zoom: 11
  };
  
  state = {
      zoom: 11,
      boundary: {},
      points: {},
  }

  render() {
    console.log(this.state)
    return (
      // Important! Always set the container height explicitly
      <div style={{ height: '100vh', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: "AIzaSyAzLxHQX3ij-pTYQQGjsjC26IW29pVnqkw" }}
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({map, maps})=> {
              //1. call backend api to get covid data
              MapService.getUSCovidData()
              .then((response)=> {
                  //2. data handling
                  const coviddataPoints = MapUtils.getUSCovidPoints(response.data);
                  //console.log(coviddataPoints);
                  //3. setState
                  this.setState({
                      points: coviddataPoints,
                  })
              })
              .catch(error => console.error(error));
          }}
          onChange={(changeObject)=>{
              this.setState({
                  zoom: changeObject.zoom,
                  boundary: changeObject.bounds,
              })
          }
        }
        >
        {this.renderCard()}
        </GoogleMapReact>
      </div>
    );
  }

  renderCard() {
      const results = [];
      const points = this.state.points[this.state.zoom];

      if (!points) {
          return [];
      }
      if (Array.isArray(points)) {
          //points is array - county level data
          //console.log(points)
          for (const county of points) {
            //console.log(county.coordinates, 'cooridnates')
            if (MapUtils.isInBoundary(this.state.boundary, county.coordinates)) {
//                console.log(this.state.boundary, county.coordinates)
                results.push(
                    <CardLocator
                    lat={county.coordinates.latitude}
                    lng={county.coordinates.longitude}
                    //thisSetMap = {this.setState}
                >
                    <CountyCard 
                      county={county.county}
                      confirmed={county.stats.confirmed}
                      deaths={county.stats.deaths}
                      recovered={county.stats.recovered}
                    />

                </CardLocator>
                )
            }
          }
      }
      if (points.type === "states") {
          for (const nation in points) {
              for (const state in points[nation]) { // state is a string key; we should use points[nation][state]
                if (MapUtils.isInBoundary(this.state.boundary, points[nation][state].coordinates)) {
                    results.push(
                        <CardLocator
                        key={state + "-key"}
                        lat={points[nation][state].coordinates.latitude}
                        lng={points[nation][state].coordinates.longitude}
                    >
                        <StateCard 
                          state={state}
                          {...points[nation][state]}
                        />
    
                    </CardLocator>
                    )                 
              }
          }
      }
    }
    return results
}
}

export default Map;