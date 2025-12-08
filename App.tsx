import { useEffect, useState } from 'react';
import { styles } from './styles';
import { View } from 'react-native';
import {
  requestForegroundPermissionsAsync, //Solicitar permissão para recuperar a localização
  getCurrentPositionAsync, //Obter a localização do usuário
  LocationObject
} from 'expo-location'
import MapView, { Marker } from 'react-native-maps';

export default function App() {
  const [location, setLocation] = useState<LocationObject | null>(null)
  const [loading, setLoading] = useState(true)
  
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

  return (
    <View style={styles.container}>
      {
        location &&
          <MapView
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
          </MapView>
      }
    </View>
  );
}


