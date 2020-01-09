import React, { useState, useEffect, useContext, useRef } from 'react'; // using React hooks
import ReactMapGL, { Marker, Popup, GeolocateControl } from 'react-map-gl'; // using mapbox api
import Geocoder from 'react-map-gl-geocoder'; // coverts user inputted address into coordinates
import marker from './marker.png'; // image of map pin. Will need to find one with transparent background
import marker2 from './marker2.png';
import { UserContext } from '../../../client/contexts/UserContext.js';
import './map.css';

// hardcoded 2 locations as pins. Will have to replace this with MongoDB Parking data
const mongoParkingSpots = [];
console.log('cookie', document.cookie);
// const user_id = document.cookie.split("\"")[1];


const MapComponent = () => {
  function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }
  // use React hooks to declare a state variable called viewport. This will be the entire map where the center is at [33.987909, -118.470693] in Los Angeles.
  const [viewport, setViewport] = useState({
    latitude: 33.987909,
    longitude: -118.470693,
    width: '100vw',
    height: '100vh',
    zoom: 10
  });

  // selectedPark is a state variable that contains which map pin the user has clicked
  const [selectedPark, setSelectedPark] = useState(null);

  const [markers, setMarkers] = React.useState([]);

  const [markers2, setMarkers2] = React.useState([]);
  // this method will make the map pin popup go away when escape key is pressed
  useEffect(() => {
    const listener = e => {
      if (e.key === 'Escape') {
        setSelectedPark(null);
      }
    };
    window.addEventListener('keydown', listener);
    return () => {
      window.removeEventListener('keydown', listener);
    }
  }, []);



  //to retrieve other pins
  useInterval(() => {
    // setMarkers(markers => [])
    fetch('/api/parking', {
      method: 'GET',
    })
      .then((res) => res.json())
      .then((pinLocations) => {
        console.log(pinLocations)
        setMarkers(markers => [])
        pinLocations.forEach((location) => {
          const latitude = location.spot.coordinate[1];
          const longitude = location.spot.coordinate[0];
          const available_time = location.spot.available_time;
          const username = location.spot.username;
          // const username = location.spot.user_name;
          setMarkers(markers => [...markers, { latitude, longitude, available_time, username }]);
        })
      })
      // setMarkers(markers => [])
  }, 5000)

    //to retrieve other pins
    useInterval(() => {
        fetch('/api/countdown', {
          method: 'GET',
        })
        // .then(console.log('and then'))
          .then(res => res.json())
          .then((pinLocations) => {
            // console.log(pinLocations)
            setMarkers2(markers2 => [])
            pinLocations.forEach((location) => {
              const latitude = location.spot.coordinate[1];
              const longitude = location.spot.coordinate[0];
              const available_time = location.spot.available_time;
              const username = location.spot.username;
              const userId = location.spot.user_id;
              // const username = location.spot.user_name;
              setMarkers2(markers2 => [...markers2, { latitude, longitude, available_time, username, userId }]);
            })

          })
          // setMarkers2(markers2 => [])
    }, 5000)

  // setInterval(() => {

  // }, 2000)

  // mapRef is needed for geocoder
  const mapRef = React.useRef();

  // this would zoom in to the location of the address the user inputted in the geocoder search box
  const handleGeocoderViewportChange = (viewport) => {
    const geocoderDefaultOverrides = { transitionDuration: 1000 };
    return setViewport({
      ...viewport,
      ...geocoderDefaultOverrides
    });
  }

  // markers array is the state variable that will be populated with each individual marker object

  const [shouldAddPin, setShouldAddPin] = React.useState(false);

  const [shouldAddPark, setShouldAddPark] = React.useState(false);

  const { user } = useContext(UserContext);

  const [time, setTime] = React.useState(new Date(Date.now()).toUTCString());

  // when the user clicks on the map, add the coordinates into the markers array
  const handleClick = ({ lngLat: [longitude, latitude], target, feature }) => { // the parameter is the PointerEvent in react-map-gl
    console.log('target.className', target.className);
    if (target.className !== 'mapboxgl-ctrl-geocoder--input' && shouldAddPin) { // as long as the user is not clicking in the search box
      // console.log(`clicked, longitude: ${longitude}, latitude: ${latitude}`);
      setMarkers(markers => [...markers, { latitude, longitude }]); // add a marker at the location
      // console.log('markers: ', markers);
      setShouldAddPin(shouldAddPin => !shouldAddPin);

      let utcDate = new Date(new Date().toUTCString());
      let utcDateAdd10Min = new Date(utcDate.getTime());
      setTime(time => {
        return utcDateAdd10Min.toLocaleTimeString('en-US'); // this will set time to be the current time + 10 minutes, format example: 5:20:08 PM
      });

      // send the coordinates and user id to the backend
      fetch('/api/parking', {
        method: 'POST',
        body: JSON.stringify({
          longitude,
          latitude,
          user_id: user.id
        }),
        headers: { 'content-type': 'application/json', 'Accept': 'application/json' }
      });
    }

    let existingIds = markers2.map(marker => marker.userId)
    const user_id = document.cookie.split("\"")[1];
    if (target.className !== 'mapboxgl-ctrl-geocoder--input' && shouldAddPark && !existingIds.includes(user_id)) { // as long as the user is not clicking in the search box
      // console.log(`clicked, longitude: ${longitude}, latitude: ${latitude}`);
      setMarkers2(markers2 => [...markers2, { latitude, longitude }]); // add a marker at the location
      // markerss = marker2;
      // console.log('markers: ', markers);
      // setShouldAddPin(shouldAddPin => !shouldAddPin);
      setShouldAddPark(shouldAddPark => !shouldAddPark);

      let utcDate = new Date(new Date().toUTCString());
      let utcDateAdd10Min = new Date(utcDate.getTime());
      setTime(time => {
        return utcDateAdd10Min.toLocaleTimeString('en-US'); // this will set time to be the current time + 10 minutes, format example: 5:20:08 PM
      });

      // send the coordinates and user id to the backend
      fetch('/api/countdown', {
        method: 'POST',
        body: JSON.stringify({
          longitude,
          latitude,
          user_id: user.id,
        }),
        headers: { 'content-type': 'application/json', 'Accept': 'application/json' }
      });
    }

    // if the user clicks on the add pin button, toggle the state for shouldAddPin
    if (target.id === 'add_pin') {
      setShouldAddPin(shouldAddPin => !shouldAddPin);
    }
    if (target.id === 'add_park') {
      setShouldAddPark(shouldAddPark => !shouldAddPark);
    }
  };

  const [events, setEvents] = React.useState({});

  const logDragEvent = (name, event) => {
    setEvents(events => { [...events, { [name]: lngLat }] });
  };

  const onMarkerDragStart = ({ lngLat: [lng, lat] }) => {
    logDragEvent('onDragStart', event);
  };

  const onMarkerDrag = ({ lngLat: [lng, lat] }) => {
    logDragEvent('onDrag', event);
  };

  const onMarkerDragEnd = ({ lngLat: [lng, lat] }) => {
    logDragEvent('onDragEnd', event);
    setMarkers(markers => [...markers, { latitude, longitude }]);
  };

  // const newArr = []
  // for (let i = 0; i < markers.length; i++) {
  //   if (markers[i].feature === 'Add Pin') {
  //     newArr.push(<Marker // this JSX element is imported from MapBox that will mark different locations on the map
  //     key={i}
  //     latitude={park.latitude}
  //     longitude={park.longitude}
  //     feature={park.feature}
  //   >
  //     <button className="marker-btn" onClick={(e) => {
  //       e.preventDefault();
  //       console.log('clicked: ', park);
  //       setSelectedPark(park); // when the map pin button is clicked, we will set the state of selectedPark to be the current park the user clicked
  //     }}>
  //       <img src={marker} style={{ backgroundColor: 'transparent' }} width="15" height="20" />
  //     </button>
  //   </Marker>)
  //   } else if (markers[i].feature === 'Add Park') {
  //     newArr.push(<Marker // this JSX element is imported from MapBox that will mark different locations on the map
  //     key={i}
  //     latitude={park.latitude}
  //     longitude={park.longitude}
  //     feature={park.feature}
  //   >
  //     <button className="marker-btn" onClick={(e) => {
  //       e.preventDefault();
  //       console.log('clicked: ', park);
  //       setSelectedPark(park); // when the map pin button is clicked, we will set the state of selectedPark to be the current park the user clicked
  //     }}>
  //       <img src={marker} style={{ backgroundColor: 'transparent' }} width="15" height="20" />
  //     </button>
  //   </Marker>)
  //   }
  // }

  return (
    <div style={{ margin: '-2vw', textAlign: 'left' }}>
      <link href='map.css' type="text/css" rel='stylesheet' />
      <div id="mapbox">
        <ReactMapGL // ReactMapGL is the entire map element
          onClick={handleClick} // add markers upon clicks
          ref={mapRef}
          {...viewport}
          mapboxApiAccessToken="pk.eyJ1IjoieWE4NTA1MDkiLCJhIjoiY2s1MGFwd2h5MGszMzNqbmVhZWZqMmI4MyJ9.1X0GGZVNGDyxCfacWadlgw" // my mapbox account token that allows us to use mapbox api
          mapStyle="mapbox://styles/ya850509/ck51pt5z70dot1cqj6aix253v" // this style is made from my mapbox account
          onViewportChange={viewport => {
            setViewport(viewport);
          }} // this enables users to drag and move the map by setting viewport again whenever there's a change
        >

          <Geocoder // this is the address search box at the bottom left of the map
            mapRef={mapRef}
            onViewportChange={handleGeocoderViewportChange}
            mapboxApiAccessToken="pk.eyJ1IjoieWE4NTA1MDkiLCJhIjoiY2s1MGFwd2h5MGszMzNqbmVhZWZqMmI4MyJ9.1X0GGZVNGDyxCfacWadlgw"
            reverseGeocode={true}
            position={"bottom-left"}
          />

          <GeolocateControl // this asks the user if they allow sharing their location, if they do, the map automatically drops a blue dot at their current location
            positionOptions={{ enableHighAccuracy: true }}
            trackUserLocation={true}
            showUserLocation={true}
          />
          {/* {newArr} */}
          {markers.map((park, i) => ( // map the array of parking spots
            <Marker // this JSX element is imported from MapBox that will mark different locations on the map
              key={i}
              latitude={park.latitude}
              longitude={park.longitude}
              feature={park.feature}
              draggable={true}
            // onDragStart={onMarkerDragStart}
            // onDrag={onMarkerDrag}
              onDragEnd={onMarkerDragEnd}
            >
              <button className="marker-btn" onClick={(e) => {
                e.preventDefault();
                console.log('clicked: ', park);
                setSelectedPark(park); // when the map pin button is clicked, we will set the state of selectedPark to be the current park the user clicked
              }}>
                <img src={marker} style={{ backgroundColor: 'transparent' }} width="15" height="20" />
              </button>
            </Marker>
          ))}

        {markers2.map((park, i) => ( // map the array of parking spots
            <Marker // this JSX element is imported from MapBox that will mark different locations on the map
              key={i}
              latitude={park.latitude}
              longitude={park.longitude}
              feature={park.feature}
              draggable={true}
            // onDragStart={onMarkerDragStart}
            // onDrag={onMarkerDrag}
              onDragEnd={onMarkerDragEnd}
            >
              <button className="marker-btn2" onClick={(e) => {
                e.preventDefault();
                console.log('clicked: ', park);
                setSelectedPark(park); // when the map pin button is clicked, we will set the state of selectedPark to be the current park the user clicked
              }}>
                <img src={marker2} style={{ backgroundColor: 'transparent' }} width="15" height="20" />
              </button>
            </Marker>
          ))}

          {/* {mongoParkingSpots.map(park => ( // map the MongoDB array of parking spots
            <Marker // this JSX element is imported from MapBox that will mark different locations on the map
              key={park.user_ID} // each parking spot should have a unique key of who were in the spot
              latitude={park.latitude}
              longitude={park.longitude}
            >
              <button className="marker-btn" onClick={(e) => {
                e.preventDefault();
                console.log('clicked: ', park);
                setSelectedPark(park); // when the map pin button is clicked, we will set the state of selectedPark to be the current
              }}>
                <img src={marker} style={{ backgroundColor: 'transparent' }} width="15" height="20" />
              </button>
            </Marker>
          ))} */}

          {selectedPark ? ( // ternary operator: if there is a selectedPark, show a popup window
            <Popup
              latitude={selectedPark.latitude}
              longitude={selectedPark.longitude}
              onClose={() => { // when the x on the top right of the pop up is clicked
                setSelectedPark(null); // set the state of selectedPark back to null
              }}
            >
              <div style={{ textAlign: 'left', width: '250px', height: '100px' }}>
                {/* Who parked here: {selectedPark.user_name || user.name}<br >*/}
                {/*Available today at: {time}<br />*/}
                {/*Parking coordinates: {selectedPark.latitude}, {selectedPark.longitude}*/}
                Who parked here: {selectedPark.username || user.name}<br />
                Available today at: {selectedPark.available_time}<br />
                {console.log('selectedPark', selectedPark)}
                Parking coordinates: {selectedPark.latitude}, {selectedPark.longitude}
              </div>
            </Popup>
          ) : null}
          <button id="add_pin" style={{ position: 'absolute', bottom: '15vh', left: '4vw', height: '45px', width: '85px', borderRadius: '2vw', fontSize: '15px', background: '#2B7BF0', color: 'white' }}>
            + Add pin
          </button>

          <button id="add_park" style={{ position: 'absolute', bottom: '20vh', left: '4vw', height: '45px', width: '85px', borderRadius: '2vw', fontSize: '15px', background: '#2B7BF0', color: 'white' }}>
            + Add park
          </button>

        </ReactMapGL>
      </div>
    </div>
  );
};

export default MapComponent;
