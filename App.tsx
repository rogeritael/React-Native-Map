import { useEffect, useState } from 'react';
import { styles } from './styles';
import { View } from 'react-native';
import {
  requestForegroundPermissionsAsync, //Solicitar permissão para recuperar a localização
  getCurrentPositionAsync, //Obter a localização do usuário
  LocationObject
} from 'expo-location'

export default function App() {
  const [location, setLocation] = useState<LocationObject | null>(null)
  const [loading, setLoading] = useState(true)
  
  async function requestLocationPermissions(){
    const { granted } = await requestForegroundPermissionsAsync()

    if(granted){
      const currentPosition = await getCurrentPositionAsync()
      setLocation(location)
      console.log("Localização", currentPosition)
      console.log("Localização", location)
    }
  }

  useEffect(() => {
    requestLocationPermissions()
  },[])

  return (
    <View style={styles.container}>

    </View>
  );
}


