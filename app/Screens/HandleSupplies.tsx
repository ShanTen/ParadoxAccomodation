/////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////// Import Modules and Libraries /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
import { StyleSheet, ScrollView, Alert, BackHandler } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { save, getValueFor } from "../../ExpoStoreUtils";
import {Link} from 'expo-router';

import axios from 'axios';
import apiRoute from '../../apiRoute';

import ProfileBar from '../CommonComponents/ProfileBar';
import {ButtonAnimatedWithLabel} from '../CommonComponents/ButtonAnimated';
import SupplyDisplay from '../CommonComponents/SelectableButtonArray';
import Title from '../CommonComponents/PageTitle';

/////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////// Custom Types  Supplies Page ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
//static -- Only GET
type StudentProfile = {
    id: number;
    profileName: string;
    profilePicture: string;
    uniqueID: string;
}

//static -- Only GET
type SupplyItem = {
    itemName: string;
    isProvided: boolean;
    isReturned: boolean;
}

//static -- Only GET
type SuppliesObject = {
    items: SupplyItem[];
}
//static -- Only GET
type AccommodationInfo = {
    hostelName: string;
    hostelRoomNumber: number;
    messName: string;
    messFloor: number;
    messCaterer: string;
}

//dynamic -- GET and POST/UPDATE (Hint: Look at the nullable values)
type CheckInCheckOutInfo = {
    checkInStatus: boolean;
    checkInTime: number | null; //epoch time in milliseconds
    checkOutStatus: boolean;
    checkOutTime: number | null;
}
/////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////// Helper Functions and Components ////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

function getTimeWithoutSeconds(timeStr : string){
    //remove seconds out of time string
    return timeStr.split(":").slice(0, 2).join(":");
}

function getCurrentEpochTimeMS() {
    //get current epoch time up to milliseconds
    return new Date().getTime();
}

function epochToHuman(epochTime: number) {
    //get epoch time and out in the format => Ex: 11:30 AM, 12th September 
    //remove seconds out of epoch time
    let date = new Date(epochTime).toLocaleDateString("en-IN");
    let buf_time = new Date(epochTime).toLocaleTimeString("en-IN");
    let time = getTimeWithoutSeconds(buf_time);
    let AM_OR_PM = buf_time.split(" ")[1];
    let timeWithoutAMPM = time.split(" ")[0];
    return `${timeWithoutAMPM} ${AM_OR_PM}, ${date}`;
    
}

function HostelInfo({ Name, RoomNum }: { Name: string, RoomNum: number }) {
    return (
        <View style={Styles.paragraphDisplayContainer}>
            <Text style={Styles.paragraphDisplayTitle}>Hostel Info</Text>
            <Text style={Styles.paragraphDisplayText}>Name: {Name}</Text>
            <Text style={Styles.paragraphDisplayText}>Room Number: {RoomNum}</Text>
        </View>
    )
}

/////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////// Main Exported Component ///////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

export default function HandleSuppliesPage({ route, navigation }: { route: any, navigation: any }) {

    const [QRid, setQRid] = useState<string | null>(null);
    const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
    const [accommodationInfo, setAccommodationInfo] = useState<AccommodationInfo | null>(null);
    const [checkInCheckOutInfo, setCheckInCheckOutInfo] = useState<CheckInCheckOutInfo | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const [showCheckIn, setShowCheckIn] = useState<boolean>(false);
    const [showCheckOut, setShowCheckOut] = useState<boolean>(false);

    const [showCheckInSuppliesButton, setShowCheckInSuppliesButton] = useState<boolean>(false);
    const [showCheckOutSuppliesButton, setShowCheckOutSuppliesButton] = useState<boolean>(false);

    const [allSupplies, setAllSuppliesSupplies] = useState<any>([]);
    const [checkInSupplies, setCheckInSupplies] = useState<any>([]);
    const [checkOutSupplies, setCheckOutSupplies] = useState<any>([]);

    const [OTPTransferObject, setOTPTransferObject] = useState<any>(null);
    
    function getProvidedItems(supplies : any){
        //if provided items are none, it returns an empty array

        let providedItems = supplies.filter((item : any) => {
            return item["isProvided"]
        })

        // console.log("Provided Items are: ")
        // console.log(providedItems)

        return providedItems;
    }

    function getNonProvidedItems(supplies : any){
        //if provided items are none, it returns an empty array

        let nonProvidedItems = supplies.filter((item : any) => {
            return !item["isProvided"]
        })

        return nonProvidedItems;
    }

    async function getAllInfo(QRid : string){
        let _token = await getValueFor('token');
        let headers ={Authorization : `Bearer ${_token}`}    
        try{
            let profile_buffer = (await axios.get(`${apiRoute}/accommodation/qr/${QRid}`, {headers})).data;
            let checkInCheckOutStatus = (await axios.get(`${apiRoute}/accommodation/student/${profile_buffer.id}/checkin/status`, {headers})).data;
            let supplies = (await axios.get(`${apiRoute}/accommodation/student/${profile_buffer.id}/supply/status`, {headers})).data
            let hostelInfoClump = (await axios.get(`${apiRoute}/accommodation/student/id/${profile_buffer.id}`, {headers})).data;
            let checkoutStatus = (await axios.get(`${apiRoute}/accommodation/student/${profile_buffer.id}/cancheckout/`, {headers})).data;
            
            //console.log("checkInCheckOutStatus is")
            //console.log(checkInCheckOutStatus)


            let AccommodationInfo = {
                hostelName: hostelInfoClump["Hostel Info"]["Name"],
                hostelRoomNumber: hostelInfoClump["Hostel Info"]["Room Number"],
                messName: hostelInfoClump["Mess Info"]["Name"],
                messFloor: hostelInfoClump["Mess Info"]["Floor"],
                messCaterer: hostelInfoClump["Mess Info"]["Caterer"],
            }

            let Profile = {
                id: profile_buffer.id,
                profileName: profile_buffer.name,
                profilePicture: `https://ui-avatars.com/api/?name=${profile_buffer.name.split(" ").join("+")}&?background=000000&color=0D8ABC&?format=svg?size=256`,
                uniqueID: profile_buffer["email"].split('@')[0],
            }

            let CheckInCheckOutInfo = {
                checkInStatus: checkInCheckOutStatus["CheckIn"],
                checkInTime: parseInt(checkInCheckOutStatus["CheckIn Time"]),
                checkOutStatus: checkInCheckOutStatus["CheckOut"],
                checkOutTime: parseInt(checkInCheckOutStatus["CheckOut Time"]),
            }

            let supplyData = supplies.map((item : any) => {
                return {
                    id: item["Item ID"],
                    txt: item["Item Name"],
                    isProvided: item["isProvided"],
                    isReturned: item["isReturned"],

                    //UI States 
                    isChecked: false,
                    isDisabled: false,
                }
            })

            // console.log(supplyData)

            //show these supplies in the check in supplies section
            let _checkInSupplies = supplyData;
            let _checkOutSupplies = supplyData;

            //NOTE: Disabling a checkbox only happens on page load
            //disable and check all the provided items 
            _checkInSupplies = _checkInSupplies.map((item : any) => {
                if(item["isProvided"]){
                    // console.log("Apparently, this item is provided")
                    // console.log(item)
                    return {...item, isChecked: true, isDisabled: true}
                }
                    
                else
                    return item;
            })

            // disable + check = all items that are provided and returned
            // disable = all items that are not provided and not returned
            _checkOutSupplies = _checkOutSupplies.map((item : any) => {
                if(item["isProvided"] && item["isReturned"]){
                    // console.log("Below item has been provided and returned")
                    // console.log(item)
                    return {...item, isChecked: true, isDisabled: true}
                }
                else if(!item["isProvided"]){
                    // console.log("Below item has been provided only")
                    return {...item, isDisabled: true}
                }
                return item;
            });

            //disable all items when user is checked out
            if(CheckInCheckOutInfo.checkOutStatus){
                console.log("INESFOISNDFKLSDNFKSDJNFKSDJNFPSKJDNFKSDJNV FSKDJ FKSDJ")

                _checkInSupplies = _checkInSupplies.map((item : any) => {
                    return {...item, isDisabled: true}
                });
                _checkOutSupplies = _checkOutSupplies.map((item : any) => {
                    return {...item, isDisabled: true}
                });
            }

            setToken(_token);
            setStudentProfile(Profile);
            setAccommodationInfo(AccommodationInfo);
            setCheckInCheckOutInfo(CheckInCheckOutInfo);

            setAllSuppliesSupplies(supplyData);
            setCheckInSupplies(_checkInSupplies);
            setCheckOutSupplies(_checkOutSupplies);

            if(!CheckInCheckOutInfo.checkInStatus && !CheckInCheckOutInfo.checkOutStatus)
                setShowCheckIn(true);

            if(CheckInCheckOutInfo.checkInStatus && !CheckInCheckOutInfo.checkOutStatus){
                setShowCheckInSuppliesButton(true);
            }

            if(checkoutStatus["canCheckOut"]){
                setShowCheckOut(true);
            }
        }
        catch(err){
            console.log(err)
            throw new Error("Error in fetching all information");
        }
    }

    // Run on Page Load
    useEffect(() => {        
        setQRid(route.params.QRid);
    }, []); 

    useEffect(() => {
        if(QRid != null){
            getAllInfo(QRid).then(() => {
                console.log("All Info Fetched")
            }).catch((err) => {
                console.log(err)
            })
        }
    }, [QRid]);         

    useEffect(() => {

        if(!checkInCheckOutInfo){
            return
        }
        //show the checkIn Supplies Button if the student has checked in and not checked out
        if(checkInCheckOutInfo.checkInStatus && !checkInCheckOutInfo.checkOutStatus){
            setShowCheckInSuppliesButton(true);
            setShowCheckIn(false);
        }


    }, [checkInCheckOutInfo])

    //For all changes to transferObject
    useEffect(()=>{
        if(!checkInSupplies)
            return
        let buffer = {
            'QRid' : QRid,
            'token' :token,
            'studentProfile' : studentProfile,
            'supplies' : checkInSupplies,
        }
        setOTPTransferObject(buffer)
    }, [checkInSupplies])

    useEffect(()=>{
        if(!checkOutSupplies)
            return
        let buffer = {
            'QRid' : QRid,
            'token' :token,
            'studentProfile' : studentProfile,
            'supplies' : checkOutSupplies,
        }
        setOTPTransferObject(buffer)
        
        checkOutSupplies.filter((item : any) => {
            if(item["isProvided"] && !item["isReturned"]){
                setShowCheckOutSuppliesButton(true);
                return;
            }
        })


    }, [checkOutSupplies])

    useEffect(()=>{
        if(!OTPTransferObject)
            return
        console.log("Saving OTP Transfer Object")
        save('OTP_TRANSFER_OBJ', JSON.stringify(OTPTransferObject)).then(
            () => console.log("OTP Transfer Object Saved")
        )
    }, [OTPTransferObject])

    const handleCheckInSuppliesChange = (id : number) => {
        let temp = checkInSupplies.map(((supply : any) => {
            if(id === supply.id){
                return {...supply, isChecked: !supply.isChecked}
            }
            return supply;
        }))
        setCheckInSupplies(temp);
    }

    const handleCheckOutSuppliesChange = (id : number) => {
        let temp = checkOutSupplies.map(((supply : any) => {
            if(id === supply.id){
                return {...supply, isChecked: !supply.isChecked}
            }
            return supply;
        }))
        setCheckOutSupplies(temp);
    }

    const makeCheckInRequest = async () => {

        if(studentProfile && token){
            let headers ={
                Authorization : `Bearer ${token}`
              }

            let body = {}
            let id = studentProfile.id;
            
            try{                            
                await axios.put(`${apiRoute}/accommodation/student/${id}/checkin/`, {} ,{ headers });
                setCheckInCheckOutInfo({...checkInCheckOutInfo, checkInStatus: true, checkInTime: getCurrentEpochTimeMS(), checkOutStatus: false, checkOutTime: null});
            }
            catch(err){
                console.log(err);
                Alert.alert("Error", "Check In Failed")
            }
        }        
    }

    return (<View style={Styles.container} >
        <Title value="Handle Supplies" />
        <ScrollView contentContainerStyle={Styles.ScrollContainer}>

        {studentProfile && <ProfileBar profilePicture={studentProfile.profilePicture} profileName={studentProfile.profileName} uniqueID={studentProfile.uniqueID} />}

        {accommodationInfo && <HostelInfo Name={accommodationInfo.hostelName} RoomNum={accommodationInfo.hostelRoomNumber} />}

        {checkInCheckOutInfo && <View style={Styles.paragraphDisplayContainer}>
                    <Text style={Styles.paragraphDisplayTitle}>Check In/Check Out</Text>
                    <Text style={Styles.paragraphDisplayText}>Check In Status: {checkInCheckOutInfo.checkInStatus ? "Checked In" : "Not Checked In"}</Text>
                    <Text style={Styles.paragraphDisplayText}>Check In Time: {checkInCheckOutInfo.checkInTime ? epochToHuman(checkInCheckOutInfo.checkInTime) : "Not Checked In"}</Text>
                    <Text style={Styles.paragraphDisplayText}>Check Out Status: {checkInCheckOutInfo.checkOutStatus ? "Checked Out" : "Not Checked Out"}</Text>
                    <Text style={Styles.paragraphDisplayText}>Check Out Time: {checkInCheckOutInfo.checkOutTime ? epochToHuman(checkInCheckOutInfo.checkOutTime) : "Not Checked Out"}</Text>
        </View>}

        {accommodationInfo && <View style={Styles.paragraphDisplayContainer}>
            <Text style={Styles.paragraphDisplayTitle}>Mess Info</Text>
            <Text style={Styles.paragraphDisplayText}>Name: {accommodationInfo.messName}</Text>
            <Text style={Styles.paragraphDisplayText}>Floor: {accommodationInfo.messFloor}</Text>
            <Text style={Styles.paragraphDisplayText}>Caterer: {accommodationInfo.messCaterer}</Text>
        </View>}

        {/* Conditionally rendered CheckIN Button */}
        {(showCheckIn) && <ButtonAnimatedWithLabel 
                label={"Check In"} 
                animatedViewStyle={{}} 
                style={{}} 
                onPress={() => {
                    Alert.alert("Check In", "Are you sure you want to check in the lodger?", [
                        {
                            text: "Yes",
                            onPress: async () => {
                                await makeCheckInRequest();
                            }
                        },
                        {
                            text: "No",
                            onPress: () => {
                                console.log("Check In Cancelled")
                            }
                        }
                    ])
                }} 
            />}

        {/* Conditionally rendered CheckIN Supplies Checkbox Array*/}
        {((checkInSupplies.length) > 0) && <View style={Styles.splitParagraphContainer}>
            <Text style={Styles.splitParagraphTitle}>Check In Supplies</Text>

            <SupplyDisplay supplies={checkInSupplies} handleChange={handleCheckInSuppliesChange} /> 

            {(showCheckInSuppliesButton) && < ButtonAnimatedWithLabel label={"Request OTP"}
            onPress={() => {
                Alert.alert("Confirmation", "Are you sure you want to request the OTP?", [{
                    "text": "Yes",
                    onPress: async () => {

                        try
                        {
                            if(OTPTransferObject) {
                                await save('mode', "give");
                                navigation.navigate('OTPSupply');
                                }
                            else 
                                Alert.alert("Error", "Student Profile not found")
                        }
                        catch(err)
                        {
                            console.log("Error in saving OTP object")
                            console.log(err);
                        }
                    }
                }, 
                {
                    "text": "No",
                    style: "cancel",
                    onPress: () => {
                        console.log("OTP Cancelled")
                    }
                }])
            }}
            style={{}}
            animatedViewStyle={{ backgroundColor: '#069a8e' }}
            //disabled when all items are returned
            isDisabled={
                getNonProvidedItems(checkInSupplies).length === 0 && (checkInCheckOutInfo?.checkInStatus === true) && (checkInCheckOutInfo?.checkOutStatus === false)
            }
        />}
        </View>}

        {/* Conditionally rendered CheckOut Supplies Checkbox Array*/}
        {((checkOutSupplies.length) > 0) && <View style={Styles.splitParagraphContainer}>
            <Text style={Styles.splitParagraphTitle}>Check Out Supplies</Text>
            <SupplyDisplay supplies={checkOutSupplies} handleChange={handleCheckOutSuppliesChange} />
            {(checkInCheckOutInfo?.checkOutStatus === false) && (getProvidedItems(checkInSupplies).length !== 0) && < ButtonAnimatedWithLabel label={"Request OTP"}
            onPress={async () => {
                
                Alert.alert("Confirmation", "Are you sure you want to request the OTP?", [{
                    "text": "Yes",
                    onPress: async () => {

                        try
                        {
                            if(OTPTransferObject) {
                                await save('mode', "return");
                                navigation.navigate('OTPSupply');
                                }
                            else 
                                Alert.alert("Error", "Student Profile not found")
                        }
                        catch(err)
                        {
                            console.log("Error in saving OTP object")
                            console.log(err);
                        }
                    }
                }, 
                {
                    "text": "No",
                    style: "cancel",
                    onPress: () => {
                        console.log("OTP Cancelled")
                    }
                }])

                
            }}
            style={{}}
            animatedViewStyle={{ backgroundColor: '#fa8b05' }}
            /*disabled when no items are checkedIN or all items are checkedOut*/
            isDisabled={!showCheckOutSuppliesButton}
        />}
        </View>}

        {(showCheckOut && (checkInCheckOutInfo?.checkOutStatus === false)) && <ButtonAnimatedWithLabel
            animatedViewStyle={{backgroundColor: "#9a0612"}} 
            style={{marginTop: 10}} 
            label={"Check Out"}
            onPress={() => {
                Alert.alert("Check Out", "Are you sure you want to check out the lodger?", [
                    {
                        text: "Yes",
                        onPress: async () => {
                            console.log("Checking Out...")
                            if(studentProfile && token){
                                let id = studentProfile?.id;
                                let headers = {Authorization : `Bearer ${token}`}
                                try{
                                    let response = (await axios.put(`${apiRoute}/accommodation/student/${id}/checkout/`, {}, {headers})).data;
                                    console.log("Log out response is")
                                    console.log(response)
                                    navigation.navigate('Home');
                                }
                                catch(err){
                                    console.log(err);
                                    Alert.alert("Error", "Check Out Failed")
                                }
                            }
                        }
                    },
                    {
                        text: "No",
                        onPress: () => {
                            console.log("Check Out Cancelled")
                        }
                    }
                ])
            }}
        >
        </ButtonAnimatedWithLabel>}

        {
            (checkInCheckOutInfo?.checkOutStatus === true) && <Text
                style={{marginTop: 10, color: 'red', fontSize: 16, fontWeight: 'bold'}}
            >
                Lodger has already been checked out
                </Text>
        }

        </ScrollView>
    </View>)
}

/////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////// Styles for the Page ///////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
const screenWidth = Dimensions.get('window').width;

const Styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
    },
    ScrollContainer: {
        flex: 0,
        alignItems: 'center',
        alignContent: 'center',
        width: Math.floor(screenWidth),
        paddingVertical: 10,
    },
    title: {
        marginTop: 60,
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 1,
        marginBottom: 20,
        height: 1,
        width: '80%',
    },
    paragraphDisplayContainer: {
        flex: 0,
        width: '90%',
        marginTop: 20,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#1E1E1E',

        // margin: 20,
        // borderWidth: 2,
        // borderColor: 'black',
        // alignContent: 'center',
    },
    paragraphDisplayTitle: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
    },
    paragraphDisplayText: {
        textAlign: 'left',
        fontSize: 16,
    },
    splitParagraphContainer: {
        flex: 0,
        width: '90%',
        marginTop: 20,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: 10,
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
    splitParagraphContentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        margin: 2,
        alignContent: 'center',

        backgroundColor: '#1E1E1E',

    },
    splitParagraphContent_Key: {
        fontSize: 16,
    },
    splitParagraphContent_Value: {
        fontSize: 16,
        fontWeight: 'bold',
    },
})