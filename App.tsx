import { useEffect, useRef, useState } from 'react';
import { styles } from './styles';
import { View } from 'react-native';
import {
  requestForegroundPermissionsAsync, //Solicitar permissão para recuperar a localização
  getCurrentPositionAsync, //Obter a localização do usuário
  LocationObject,
  watchPositionAsync,
  LocationAccuracy
} from 'expo-location'
import MapView, { Marker, Polyline } from 'react-native-maps';
import haversine from "haversine-distance";


export default function App() {
  const [location, setLocation] = useState<LocationObject | null>(null)
  const [loading, setLoading] = useState(true)
  const mapRef = useRef<MapView>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const carroLocation = {
    latitude: -29.892661,
    longitude: -50.268781
  } 
  
  async function requestLocationPermissions(){
    const { granted } = await requestForegroundPermissionsAsync()

    if(granted){
      const currentPosition = await getCurrentPositionAsync()
      setLocation(currentPosition)
      console.log("Localização", currentPosition)
    }
  }

  useEffect(() => {
    requestLocationPermissions()
  },[])

  useEffect(() => {
    watchPositionAsync({
      accuracy: LocationAccuracy.Highest, // nivel de precisão da localização
      timeInterval: 1000, // tempo entre as atualizações de localização
      distanceInterval: 1 // distância mínima (em metros) que deve ser percorrida para gerar uma nova atualização
    }, (response) => {
      mapRef.current?.animateToRegion({
        latitude: response.coords.latitude,
        longitude: response.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);

      const usuario = {
        latitude: response.coords.latitude,
        longitude: response.coords.longitude,
      };
      const distanciaMetros = haversine(usuario, carroLocation);
      setDistance(distanciaMetros);
    })
  },[])

  return (
    <View style={styles.container}>
      {
        location &&
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
            />

            <Marker
              coordinate={carroLocation}
              pinColor="blue"
              title="Carro"
            />

            <Polyline
              coordinates={[
                {
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                },
                carroLocation,
              ]}
              strokeWidth={3}
            />
            
          </MapView>
      }
    </View>
  );
}


