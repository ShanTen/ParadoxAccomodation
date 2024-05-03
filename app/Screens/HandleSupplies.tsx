/////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////// Import Modules and Libraries /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { save, getValueFor } from "../../ExpoStoreUtils";

import axios from 'axios';
import apiRoute from '../../apiRoute';

import ProfileBar from '../CommonComponents/ProfileBar';
import {ButtonAnimatedWithLabel} from '../CommonComponents/ButtonAnimated';

/////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////// Custom Types  Supplies Page ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

//static -- Only GET
type StudentProfile = {
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

//Simulates bad redux code which is basically just regular redux code 
const initialCheckingValue: CheckInCheckOutInfo = {
    checkInStatus: false,
    checkInTime: null,
    checkOutStatus: false,
    checkOutTime: null
}

var Global = {
    QRid: "1N33D2P155",
    Profile: {
        profileName: "Ajay Bala",
        profilePicture: "https://ui-avatars.com/api/?name=Ajay+Bala&?background=000000&color=0D8ABC&?format=svg?size=256",
        uniqueID: "20f1000069",
    },
    SuppliesObject: {
        items: [
            { itemName: "Bedding", isProvided: false, isReturned: false },
            { itemName: "Toiletries", isProvided: false, isReturned: false },
            { itemName: "Stationery", isProvided: false, isReturned: false },
            { itemName: "Clothes", isProvided: false, isReturned: false },
            { itemName: "Books", isProvided: false, isReturned: false },
            { itemName: "Medicines", isProvided: false, isReturned: false },
        ]
    },
    AccommodationInfo: {
        hostelName: "Saraswati Hostel",
        hostelRoomNumber: 69,
        messName: "Saraswati Mess",
        messFloor: 1,
        messCaterer: "Ramesh"
    },
    CheckingInfo: initialCheckingValue
}

/////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////// API Calls for Supplies Page ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

/*
    Required fake API Calls
        - Get Student Profile (QRid from qr-code)
            - Name
            - Profile Picture
            - ID
        - Get Supplies (studentID)
            - Items Array (Item Name, isProvided, isReturned)
        
        - Get Accommodation Info (studentID)
            - Hostel Info: Name
            - Hostel Info: Room Number
            - Mess Info: Name
            - Mess Info: Room Number
        
        - Get CheckInCheckOutStatus (studentID)
            - CheckIn Status
            - CheckIn Time [date-time or null]
            - CheckOut Status
            - CheckOut Time [date-time or null]
*/

async function getStudentProfile(QRid: string | null) {
    //throw error saying "Null value for QRid"
    if (QRid == null)
        throw new Error("QRid is NULL")

    console.log(`Fetching Student Profile for id [${QRid}]`)
    return Global.Profile;
}

async function getSupplies(studentID: string) {
    console.log(`Fetching Supplies for Student ID [${studentID}]`)

    let _token = await getValueFor('ACCESS_TOKEN');
    console.log(_token)
    

    let headers = {
        Authorization: `Bearer ${_token}`
    }

    try {
        const response = await axios.get(`${apiRoute}/accommodation/supply/all`, {headers})
        console.log(response.data)
    }
    catch (error) {
        console.error(error);
    }
    
    return Global.SuppliesObject;
}

async function getAccommodationInfo(studentID: string) {
    console.log(`Fetching Accommodation Info for Student ID [${studentID}]`)
    return Global.AccommodationInfo;
}

async function getCheckInCheckOutStatus(studentID: string) {
    console.log(`Fetching CheckInCheckOut Status for Student ID [${studentID}]`)
    return Global.CheckingInfo;
}

async function updateCheckInCheckOutStatus(studentID: string, checkInStatus: boolean, checkOutStatus: boolean) {
    console.log(`Updating Checking Status for Student ID [${studentID}]`)
    console.log(`Setting CheckIn Status to [${checkInStatus}] and CheckOut Status to [${checkOutStatus}]`)

    if (checkInStatus)
        Global.CheckingInfo.checkInTime = getCurrentEpochTimeMS();
    if (checkOutStatus)
        Global.CheckingInfo.checkOutTime = getCurrentEpochTimeMS();

    return Global.CheckingInfo;
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
    return `${time}, ${date}`;
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
    const [listOfSupplies, setListOfSupplies] = useState<SuppliesObject | null>(null);
    const [accommodationInfo, setAccommodationInfo] = useState<AccommodationInfo | null>(null);
    const [checkInCheckOutInfo, setCheckInCheckOutInfo] = useState<CheckInCheckOutInfo | null>(null);

    const [checkInCheckOutButtonText, setCheckInCheckOutButtonText] = useState<string>("Check In");

    // Update QRid when route.params.QRid changes
    useEffect(() => {
        console.log(`In Handle Supplies, QRid: ${route.params.QRid}`)
        setQRid(route.params.QRid);
    }, [route.params.QRid]); 

    useEffect(() => {
        if (QRid != null) {
            getStudentProfile(QRid).then((data) => {
                setStudentProfile(data);
            }).catch((err) => {
                console.log(err)
            })
        }
    }, [QRid]); // Fetch Student Profile when QRid changes

    // Fetch Supplies, Accommodation Info and CheckInCheckOut Status when Student Profile is fetched
    useEffect(() => {
        if (studentProfile != null) {
            getSupplies(studentProfile.uniqueID).then((data) => {
                setListOfSupplies(data);
            }).catch((err) => {
                console.log(err)
            })

            getAccommodationInfo(studentProfile.uniqueID).then((data) => {
                setAccommodationInfo(data);
            }).catch((err) => {
                console.log(err)
            })

            getCheckInCheckOutStatus(studentProfile.uniqueID).then((data) => {
                setCheckInCheckOutInfo(data);
            }).catch((err) => {
                console.log(err)
            })
        }
    }, [studentProfile]);

    return (<View style={Styles.container} >
        <Text style={Styles.title}>Handle Supplies</Text>
        <View style={Styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
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

        {listOfSupplies && <View style={Styles.splitParagraphContainer}>
            <Text style={Styles.splitParagraphTitle}>Supplies</Text>
            {listOfSupplies.items.map((item, index) => {
                return (
                    <View key={index} style={Styles.splitParagraphContentContainer}>
                        <Text style={Styles.splitParagraphContent_Key}>{item.itemName}</Text>
                        <Text style={Styles.splitParagraphContent_Value}>
                            {item.isProvided ? (item.isReturned ? "Returned" : "Provided") : "Not Provided"}
                        </Text>
                    </View>
                )
            })}
        </View>}

        {accommodationInfo && <View style={Styles.paragraphDisplayContainer}>
            <Text style={Styles.paragraphDisplayTitle}>Mess Info</Text>
            <Text style={Styles.paragraphDisplayText}>Name: {accommodationInfo.messName}</Text>
            <Text style={Styles.paragraphDisplayText}>Floor: {accommodationInfo.messFloor}</Text>
            <Text style={Styles.paragraphDisplayText}>Caterer: {accommodationInfo.messCaterer}</Text>
        </View>}

        <ButtonAnimatedWithLabel label="Check In"
            onPress={() => {
                if(studentProfile) 
                {
                    //Change this to expo router navigator?
                    navigation.navigate('OTPSupply', {QRid: studentProfile.uniqueID});
                    //setCheckInCheckOutInfo({...checkInCheckOutInfo, checkInStatus: true, checkInTime: getCurrentEpochTimeMS(), checkOutStatus: false, checkOutTime: null});
                    //Have to update server before state change
                }
                else{
                    Alert.alert("Error", "Student Profile not found")
                }
                   
            }}
            style={{  margin: 20 }}
            animatedViewStyle={{ backgroundColor: '#069a8e' }}
        />

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