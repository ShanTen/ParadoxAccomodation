/////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////// Import Modules and Libraries /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
import { StyleSheet , Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useState, useEffect } from 'react';
import { OtpInput } from "react-native-otp-entry";

import { getValueFor } from '../../ExpoStoreUtils';
import { ButtonAnimatedWithLabel } from '../CommonComponents/ButtonAnimated';
import Title from '../CommonComponents/PageTitle';

import axios from 'axios';
import apiRoute from '../../apiRoute';

/////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////// API Calls for Supplies Page ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

//send OTP
//POST /api/v1/otp/send

function ShowStaticConfirmation( {items}: {items: any[]} ) {
    
    let scTitle = "Please confirm the following supplies";
    if(items.length === 1)
        scTitle = "Please confirm the following supply";
    if(items.length === 0)
        scTitle = "Confirm that no supplies are being transferred.";

    return (
        <View style={{borderWidth: 1, borderColor: 'white', borderRadius: 10, padding: 10, marginBottom: 10, width: '90%'}}>
            <Text style={styles.text}>{scTitle}</Text>
            {items.map((item, i) => {
                return (
                    <Text key={i} style={styles.item}>∙ {item.txt}</Text>
                )
            })}
        </View>
    )
}

function SendOTPRequestForConfirmedItems(token: string, studentProfile: any, confirmedItems: any, giveOrReturn: string, onConfirmed: any) {
    let headers = {
        Authorization: `Bearer ${token}`,
    };

    let _itemIDs : number[] = [];
    confirmedItems.forEach((item : any) => {
        _itemIDs.push(item.id);
    });

    let data = {"Item IDs": _itemIDs};
    console.log("Data to send is")
    console.log(data)

    let reqPath = `${apiRoute}/accommodation/otp/request/${giveOrReturn}/${studentProfile.id}/`

    axios.post(reqPath, data, { headers }).then(
        (response) => {
            onConfirmed(response.data);
        }
    )
    .catch((error) => {
        console.log("An error occurred while sending OTP")
        console.log(error)
        return null;
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// Main OTP Screen  /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////



export default function OTPSupply({  navigation }: { navigation: any }) {
    const [studentProfile, setStudentProfile] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [OTP, setOTP] = useState<number | null>(null);
    const [supplies, setSupplies] = useState<any[]>([]);
    const [QRid, setQRid] = useState<string | null>(null);
    const [enableSubmitOTP, setEnableSubmitOTP] = useState<boolean>(false);
    const [mode, setMode] = useState<string | null>(null);

    const [sendOTP, setSendOTP] = useState<boolean>(false);
    
    useEffect(() => {    
        getValueFor('OTP_TRANSFER_OBJ').then(async (value : any) => {
            console.log("called the OTP transfer object setter function");

            let parsedValue = JSON.parse(value);
            let toAllow : any[] = []

            for(let x of parsedValue["supplies"]){
                if(x.isChecked && x.isDisabled === false){
                    toAllow.push(x)
                }
            }

            let mode = await getValueFor('mode'); //returns a string that says "give" or "return"
            setMode(mode);
            setToken(parsedValue["token"]);
            setStudentProfile(parsedValue["studentProfile"]);
            setSupplies(toAllow);
            setQRid(parsedValue["QRid"]);

            setSendOTP(true);

        }).catch((err) => {
            console.log("An error occurred while fetching OTP_TRANSFER_OBJ")
            console.log(err)
        })
    }, []);

    useEffect(()=>{
        if(sendOTP){
            if(studentProfile && token && supplies && QRid && mode!=null){
                let suppliesToPass = []

                if(mode == "give"){
                    //get All supplies which have been checked and not provided
                    suppliesToPass = supplies.filter((item : any) => {
                        return item.isChecked && !item.isDisabled
                    })
                }

                if(mode == "return"){
                    //get All supplies which have have been checked and not returned
                    suppliesToPass = supplies.filter((item : any) => {
                        return item.isChecked && !item.isDisabled
                    })
                }

                console.log("Supplies to pass are")
                console.log(suppliesToPass)

                let onOTPConfirm = (data : any) => {
                    console.log("Response from server is ")
                    console.log(data)
                }

                SendOTPRequestForConfirmedItems(token, studentProfile, supplies, mode, onOTPConfirm);
                setSendOTP(false);
            }
            else{
                console.log("Some values are null")
                console.log(`------------------------------`)
                console.log("Student Profile: ")
                console.log(studentProfile)
                console.log("Token: ")
                console.log(token)
                console.log("Supplies: ")
                console.log(supplies)
                console.log("QRid: ")
                console.log(QRid)
                console.log("Mode: ")
                console.log(mode)
                console.log(`------------------------------`)
                return ;
            }
    }
    else
        console.log("Send OTP is false")
    },[sendOTP]);
    

    useEffect(() => {
        if(OTP && OTP !== null)
            setEnableSubmitOTP(true);
    }, [OTP]);

    return (
        <View style={styles.container}>
            <Title value='OTP Verification'/>
            <ShowStaticConfirmation items={supplies}></ShowStaticConfirmation>

            <OtpInput
                numberOfDigits={6}
                focusColor="green"
                focusStickBlinkingDuration={500}
                disabled={enableSubmitOTP}
                onFilled={
                        (code) => {
                        let digitsOnly = code.replace(/\D/g, '');
                        if(digitsOnly.length === 6)
                            setOTP(parseInt(code));
                        else
                            {
                                setOTP(null);
                                setEnableSubmitOTP(false);
                                Alert.alert("Invalid OTP", "Please enter a valid OTP")
                            }
                        }
                }
                textInputProps={{
                    accessibilityLabel: "One-Time Password",
                    keyboardType: "number-pad",
                }}
                theme={{
                    containerStyle: styles.OTPcontainer,
                    pinCodeContainerStyle: styles.pinCodeContainer,
                    pinCodeTextStyle: styles.pinCodeText,
                    focusStickStyle: styles.focusStick,
                    focusedPinCodeContainerStyle: styles.activePinCodeContainer,
                }}
            />
        
            <View style={styles.bottomButtonRowsContainer}>

            <ButtonAnimatedWithLabel
                label="Submit"
                onPress={async () => {
                    console.log("OTP being sent is: ", OTP)
                    try{
                        let headers = {Authorization: `Bearer ${token}`,};
                        let body = {"otp": OTP}
                        let reqPath = `${apiRoute}/accommodation/otp/verify/${mode}/${studentProfile.id}/`
                        let response = (await axios.post(reqPath, body, { headers })).data;
                        console.log(`Response from server is [${response}]`, response.message);
                        Alert.alert("OTP Submitted", "You have successfully submitted the OTP", [
                            {
                                text: "OK",
                                onPress: () => navigation.navigate('Home'),
                            },
                        ]);
                    } //end of try block
                    catch(err){
                        console.log("An error occurred while verifying OTP") 
                        console.log(err)
                        navigation.navigate('Home');
                    } //end of catch block
                }}
                style={styles.button}
                animatedViewStyle={{backgroundColor: '#069a8e'}}
                isDisabled={!enableSubmitOTP}
            />

            <ButtonAnimatedWithLabel
                label="Cancel"
                onPress={() => {navigation.navigate('Home', {QRid})}}
                style={styles.button}
                animatedViewStyle={{backgroundColor: '#9a0612'}}
            />    

            </View>        

        </View>
    );
}

/////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// Styles //////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
    bottomButtonRowsContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    splitParagraphContainer: {
        flex: 0,
        width: '90%',
        marginTop: 20,
        alignItems: 'flex-start',
        justifyContent: 'space-evenly',
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#1E1E1E',

    },
    splitParagraphTitle: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
    },
    splitParagraphText: {
        fontSize: 16,
        margin: 5,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
    title: {
        marginTop: 50,
        fontSize: 20,
        fontWeight: 'bold',
    },
    text: {
        fontSize: 16,
        margin: 10,
        alignContent: 'center',
        textAlign: 'center',
    },
    item:{
        fontSize: 16,
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
