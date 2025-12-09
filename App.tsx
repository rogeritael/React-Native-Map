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
import axios from 'axios';


export default function App() {
  const [location, setLocation] = useState<LocationObject | null>(null)
  const [loading, setLoading] = useState(true)
  const mapRef = useRef<MapView>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const carroLocation = {
    latitude: -29.892661,
    longitude: -50.268781
  } 
  const [distance, setDistance] = useState<number | null>(null);
  
  async function requestLocationPermissions(){
    const { granted } = await requestForegroundPermissionsAsync()

    if(granted){
      const currentPosition = await getCurrentPositionAsync()
      setLocation(currentPosition)
      console.log("Localização", currentPosition)

      // Calcula a primeira rota ao abrir o app
      await getRoute({
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
      });
    }
  }

   async function getRoute(usuario: { latitude: number; longitude: number }) {
    const url = `https://router.project-osrm.org/route/v1/driving/${usuario.longitude},${usuario.latitude};${carroLocation.longitude},${carroLocation.latitude}?overview=full&geometries=geojson&alternatives=false&steps=false`;
    try {
      const response = await axios.get(url);

      const route = response.data.routes[0].geometry.coordinates;

      // Converter [lng, lat] -> { latitude, longitude }
      const converted = route.map(([lng, lat]: any) => ({
        latitude: lat,
        longitude: lng,
      }));

      setRouteCoordinates(converted);

      // Distância total da rota
      setDistance(response.data.routes[0].distance);
    } catch (error) {
      console.log("Erro ao buscar rota:", error);
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
    })
  },[])

  useEffect(() => {
    watchPositionAsync(
      {
        accuracy: LocationAccuracy.Highest,
        timeInterval: 4000,
        distanceInterval: 4,
      },
      async (response) => {
        const usuarioAtual = {
          latitude: response.coords.latitude,
          longitude: response.coords.longitude,
        };

        setLocation(response);

        // Recalcula rota conforme o usuário se move
        await getRoute(usuarioAtual);

        // Anima o mapa
        mapRef.current?.animateToRegion(
          {
            latitude: usuarioAtual.latitude,
            longitude: usuarioAtual.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          },
          1000
        );
      }
    );
  }, []);

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
              image={require("./assets/user_pin.png")}
              title="Você"
            />

            <Marker
              coordinate={carroLocation}
              pinColor="blue"
              title="Seu veículo"
              image={require("./assets/car_pin.png")}
            />
            
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeWidth={5}
              />
            )}
          </MapView>
      }
    </View>
  );
}