/*Expo Go's QR Scanner Screen Implementation for Accommodator App

    ToDo:
    - Overhaul their state object and create my own state implementations -- done
    - Can also remove all platform unifying code (ios being a bitch code basically), -- done 
        because target users are only android  
    - Add a stack navigator for this page only => StackNavSupplyHandle --done
        Parts:
          - QR Scanner (Home)
          - HandleSupplies (Home -> OTP Supplies)
          - OTPSupplies (OTP Supplies -> Home)

  Note:
    Fails on expo Camera version >= 15.x
    Works on expo Camera version ~ 14
*/

///////////////////////////////////////////////////////////////////////////////
///////////////////////// Imported Modules  ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
import * as BarCodeScanner from 'expo-barcode-scanner';
import { BlurView } from 'expo-blur';
import { FlashMode } from 'expo-camera';
import { throttle } from 'lodash';
import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, Text, View, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import apiRoute from '../../apiRoute';
import { getValueFor } from '../../ExpoStoreUtils';
import axios from 'axios';

import { Camera } from '../CommonComponents/Camera';
import QRFooterButton from '../CommonComponents/QRFooterButton';
import QRIndicator from '../CommonComponents/QRIndicator';

/* Navigation Handler For Post QR Scan */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HandleSupplies from '../Screens/HandleSupplies';
import OTPSupply from '../Screens/OTPSupply';
import HandleBypassQR from '../Screens/HandleBypassQR';

///////////////////////////////////////////////////////////////////////////////
///////////////////// Navigation Handler For Post QR Scan /////////////////////
///////////////////////////////////////////////////////////////////////////////

const StackNavSupplyHandle = createNativeStackNavigator();

///////////////////////////////////////////////////////////////////////////////
///////////////////////// Page Specific Components  ///////////////////////////
///////////////////////////////////////////////////////////////////////////////

function CurrentPayloadDisplay({payload}: {payload: string | null}){
  return (<View style={Styles.CurrentPayloadDisplay}>
    <Text style={Styles.CurrentPayloadDisplayText}>Current Payload: [{payload || "No Payload Set"}]</Text>
  </View>)
}

function Hint({ children }: { children: string }) {
  return (
    <BlurView style={Styles.hint} intensity={100} tint="dark">
      <Text style={Styles.headerText}>{children}</Text>
    </BlurView>
  );
}

///////////////////////////////////////////////////////////////////////////////
//////////////////////// Main Export Method ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

// const initialState: State = { isVisible: Platform.OS === 'ios', url: null };
// defaults to {isVisible: false, url: null} on Android

function BarCodeScreen({ navigation }: { navigation: any }) {
  const [isVisible , setIsVisible] = React.useState(false)
  const [QRid , setQRid] = React.useState<string | null>(null)
  const [mountKey, setMountKey] = React.useState(0); //camera hack to force remount
  const [isLit, setLit] = React.useState(false);
  // set camera permissions

  const permissionFunction = async () => {
    // here is how you can get the camera permission
    const cameraPermission = await Camera.requestCameraPermissionsAsync();
    setIsVisible(cameraPermission.status === 'granted');
    if (cameraPermission.status !== 'granted') 
      alert('Permission for camera access needed.');
  };

  useEffect(() => {
    permissionFunction();
  }, []);

  //Subsequent focus renders
  useFocusEffect(React.useCallback(() => {
    setMountKey(mountKey + 1);
  }, []));

  React.useEffect(() => {
    if (!isVisible && QRid) {
      console.log("QR Code Scanned")
      //sending to server 
      getValueFor('token').then((token) => {

        let headers ={
          Authorization : `Bearer ${token}`
        }

        axios.get(`${apiRoute}/accommodation/qr/${QRid}`, {headers})
          .then(
            response => {
              navigation.navigate('HandleSupplies', { QRid });
            }
          )
          .catch((err) => {
            console.log("An error occurred while sending QRid to server")
            console.log(err)
            const isLikeQR = (id: string) => {
              const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
              return uuidPattern.test(id);
            }

            if(!isLikeQR(QRid)){
              Alert.alert("Invalid QR code", "Please scan a valid QR code")
              return;
            }

            Alert.alert("Error", "An error occurred while sending QRid to server. Please try again.")    
          })
      })      
    }
  }, [isVisible, QRid]);

  // InstanceOf : [state]
  const _handleBarCodeScanned = throttle(({ data: _url }) => {
    console.log("Scanned URL: ", _url)
    setQRid(_url);
    setIsVisible(false);
  }, 1000);

  // InstanceOf : [props.navigation]
  const onCancel = React.useCallback(() => {
    console.log("Action Cancelled")
    //clear all states
    setQRid(null);
    setIsVisible(true);
    //unmount camera
    setMountKey((key) => key + 1);
  }, []);

  const onFlashToggle = React.useCallback(() => {
    setLit((isLit) => !isLit);
  }, []);

  const onManualEntry = React.useCallback(() => {
    console.log("Bypassing QR...")
    //NAV :: Move to Manual Entry Screen
    navigation.navigate('HandleBypassQR');
    //navigation.navigate('HandleSupplies');
  }, []);

  const { top, bottom } = useSafeAreaInsets();

  return (
    <View style={Styles.container}>
      {/* // InstanceOf : [state] */}
      {isVisible ? (
        <Camera
          key={mountKey}
          barCodeScannerSettings={{
            barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
          }}
          onBarCodeScanned={_handleBarCodeScanned}
          style={StyleSheet.absoluteFill}
          flashMode={isLit ? FlashMode.torch : FlashMode.off}
        />
      ) : null}

      <View style={[Styles.header, { top: 40 + top }]}>
        <Hint>Hit refresh button if camera doesn't load</Hint>
      </View>
      <QRIndicator />
      {/* <CurrentPayloadDisplay payload={url}/> */}
      <View style={[Styles.footer, { bottom: 30 + bottom }]}>
        <QRFooterButton onPress={onFlashToggle} isActive={isLit} iconName="flashlight" />
        <QRFooterButton onPress={onManualEntry} iconName="create-outline" />
        <QRFooterButton onPress={onCancel} iconName="refresh-outline" iconSize={48} />
      </View>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
    </View>
  );
}

export default function SupplyHandlerScreen() {
  return <StackNavSupplyHandle.Navigator>
        <StackNavSupplyHandle.Screen name="Home" component={BarCodeScreen} options={{headerShown: false}}/>
        <StackNavSupplyHandle.Screen name="HandleSupplies" component={HandleSupplies} options={{headerShown: false}}/>
        <StackNavSupplyHandle.Screen name="OTPSupply" component={OTPSupply} options={{headerShown: false}}/>
        <StackNavSupplyHandle.Screen name="HandleBypassQR" component={HandleBypassQR} options={{headerShown: false}}/>
      </StackNavSupplyHandle.Navigator>
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////// Stylesheet  /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hint: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    backgroundColor: 'transparent',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: '10%',
  },
  CurrentPayloadDisplay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 100,
    padding: 20,
    borderRadius: 16,
    color: '#fff',
    backgroundColor: 'transparent',
  },
  CurrentPayloadDisplayText:{
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  }
});