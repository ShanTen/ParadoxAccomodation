/////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////// Import Modules and Libraries /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
import { StyleSheet , Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useState, useEffect } from 'react';
import { OtpInput } from "react-native-otp-entry";
import axios from 'axios';
import apiRoute from '../../apiRoute';
import { getValueFor } from '../../ExpoStoreUtils';
import { ButtonAnimatedWithLabel } from '../CommonComponents/ButtonAnimated';

/////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////// API Calls for Supplies Page ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

//send OTP
//POST /api/v1/otp/send


/////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// Main OTP Screen  /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

function renderItems( {items}: {items: string[]} ) {
    // Code for rendering items
    return (
        <View style={{borderWidth: 1, borderColor: 'white', borderRadius: 10, padding: 10, marginBottom: 10}}>
            {items.map((item, i) => {
                return (
                    <Text key={i} style={styles.item}>{item}</Text>
                )
            })}
        </View>
    )
}

export default function OTPSupply({ route, navigation }: { route: any, navigation: any }) {
    const [OTP, setOTP] = useState<number | null>(null);
    const [checkStatus, setCheckStatus] = useState<number | null>(null); //gets set on inital useEffect render
    const [checkStatusText, setCheckStatusText] = useState<string | null>(null);

    const [items, setItems] = useState<string[]>([]);

    //checkIn => 0 
    //checkOut => 1
    

    useEffect(() => {
        getValueFor('token')
            .then((token) => {
                let headers = {
                    Authorization: `Bearer ${token}`
                }

                //GET /api/v1/otp/supplies
                axios.get(`${apiRoute}/accommodation/supply/all`, { headers })
                    .then(response => {
                        let itemsObjArr = response.data;
                        let itemsArr = itemsObjArr.map((itemObj: any) => itemObj["Item Name"]);
                        console.log(itemsArr)
                        let checkStatus = 0
                        setItems(itemsArr);
                        setCheckStatus(checkStatus);
                    })
                    .catch(error => {

                    });
            })
            .catch(error => {

            });
        
    }, []);

    useEffect(() => {
        if (checkStatus !== null) {
            const textOptions = ["Enter the OTP after you provide the following items", "Enter the OTP after you receive the following items"];
            setCheckStatusText(textOptions[checkStatus]);
        }
    }, [checkStatus]);



    /*
        ToDo:
            Pass items from previous page to get OTPs for from route.params or
            the equivalent to that in expo navigation
    */

    return (
        <View style={styles.container}>
            <Text style={styles.title}>OTP Supplies</Text>


            <View style={{marginBottom: 10 }}>
                <Text style={styles.checkStatus}>{checkStatusText}</Text>
                {renderItems({items})}
            </View>

            

            <OtpInput
                numberOfDigits={6}
                focusColor="green"
                focusStickBlinkingDuration={500}
                onTextChange={(text) => console.log(text)}
                onFilled={(text) => console.log(`OTP is ${text}`)}
                textInputProps={{
                    accessibilityLabel: "One-Time Password",
                }}
                theme={{
                    containerStyle: styles.OTPcontainer,
                    pinCodeContainerStyle: styles.pinCodeContainer,
                    pinCodeTextStyle: styles.pinCodeText,
                    focusStickStyle: styles.focusStick,
                    focusedPinCodeContainerStyle: styles.activePinCodeContainer,
                }}
            />

            <ButtonAnimatedWithLabel
                label="Submit"
                onPress={() => {
                    //API call to verify OTP
                    //POST /api/v1/otp/verify
                    //body: {otp: OTP}
                    //if successful
                    //navigate to next page
                    //else
                    //show error message
                    console.log("OTP: ", OTP)
                    Alert.alert("OTP Submitted", "You have successfully submitted the OTP", [
                        {
                            text: "OK",
                            onPress: () => navigation.navigate('Home'),
                        }
                    ]);
                }}
                style={styles.button}
                animatedViewStyle={{backgroundColor: '#069a8e'}}
            />

            {
                //need a resend OTP button here
            }
            

        </View>
    );
}

/////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// Styles //////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    title: {
        marginTop: 50,
        fontSize: 20,
        fontWeight: 'bold',
    },
    text: {
        fontSize: 16,
        margin: 10,
    },
    item:{
        fontSize: 13,
    },
    checkStatus: {
        fontSize: 16,
        margin: 20,
        textAlign: 'center',
    },
    button: {
        margin: 10,
    },
    OTPcontainer: {
        flexDirection: "row",
        width: 300,
    },
    pinCodeContainer: {
        flexDirection: "row",
    },
    pinCodeText: {
        fontSize: 24,
        color: "white",
        fontWeight: "bold",
    },
    focusStick: {
        backgroundColor: "green",
        height: 2,
    },
    activePinCodeContainer: {
        borderColor: "green",
    },
    errorText: {
        color: 'red',
    }
});
