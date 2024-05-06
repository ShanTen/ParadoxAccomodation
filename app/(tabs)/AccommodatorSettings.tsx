import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useState, useEffect } from 'react';
import {router} from 'expo-router';
import { ButtonAnimatedWithChild } from '../CommonComponents/ButtonAnimated';
import ProfileBar from '../CommonComponents/ProfileBar';
import Title from '../CommonComponents/PageTitle';
import axios from 'axios';
import apiRoute from '../../apiRoute';
import { save, getValueFor } from '../../ExpoStoreUtils';
import ToastManager, { Toast } from 'toastify-react-native'

function HostelDetails({names, totalStudents, studentsCheckedIn} : {names: string[], totalStudents: number, studentsCheckedIn: number}){
  return (
    <View style={Styles.hostelStatsContainer}>
      <Text style={Styles.hostelStatsTitle}>Hostels Covered</Text>
        {names.map((name, idx) => <Text key={idx} style={Styles.hostelStatsText}>• {name}</Text>)}
        <Text style={Styles.hostelStatsTitle}>Accommodation Stats</Text>
      <Text style={Styles.hostelStatsText}>Total Students: {totalStudents}</Text>
      <Text style={Styles.hostelStatsText}>Students Checked In: {studentsCheckedIn}</Text>
      <Text style={Styles.hostelStatsText}>Students Not Checked In: {totalStudents-studentsCheckedIn}</Text>
    </View>
  )
}

export default function AccommodatorScreen() {

  const [volunteerDetails, setVolunteerDetails] = useState({
    profileName: "Ashok Kumar",
    profilePicture: "https://ui-avatars.com/api/?name=Ashok+Kumar&?background=000000&color=0D8ABC&?format=svg?size=256",
    uniqueID: "20f1000001",
  });

  const [hostelDetails, setHostelDetails] = useState({
    names: ["Saraswati Hostel"],
    totalStudents: 0,
    studentsCheckedIn: 0,
  });

  useEffect(() => {

    getValueFor('token').then((token) => {
      
      let headers ={
        Authorization : `Bearer ${token}`
      }

      axios.get(`${apiRoute}/accommodation/volunteer/profile/`, {headers}).then(
        response => {
          console.log(response.data);
          let {name, email, hostels} = response.data;
          let uniqueID = email.split('@')[0];



          setVolunteerDetails({
            // profileName: name,
            profileName: "Shantanu Kumar",
            profilePicture: `https://ui-avatars.com/api/?name=${name.split(' ').join('+')}&?background=000000&color=0D8ABC&?format=svg?size=256`,
            uniqueID,
          });

          setHostelDetails({
            names: hostels,
            totalStudents: 0,
            studentsCheckedIn: 0,
          });
          
        }
      )
    })

  }, [])
  
  const logout = async () => {
    try{
      // Toast.info('Logging Out...', 'Top');
      await save('logout', 'yes');
      router.navigate('/');
    }
    catch(e){
      console.log(e);
      Toast.error('An error occurred while logging out', 'Top');
    }

  }

  return (
    <View style={Styles.container}>
      <View>
        <Title value="Volunteer Details" />
      </View>

      <ProfileBar
        profilePicture={volunteerDetails.profilePicture}
        profileName={volunteerDetails.profileName}
        uniqueID={volunteerDetails.uniqueID}>
      </ProfileBar>

      <HostelDetails
        names={hostelDetails.names}
        totalStudents={hostelDetails.totalStudents}
        studentsCheckedIn={hostelDetails.studentsCheckedIn}
      >
      </HostelDetails>

      <View style={Styles.logOutButtonContainer}>
        <ButtonAnimatedWithChild 
          child={<Text style={{color: 'white'}}>Log out</Text>}
          onPress={logout}
          style={null}
          animatedViewStyle={{backgroundColor: '#9a0612'}}
        />  
      </View>
  </View>
  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
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
  hostelStatsContainer: {
    flex: 0,
    width: '90%',
    marginTop: 20,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',

    // backgroundColor: '#1E1E1E',
  },
  hostelStatsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E3E3E3',
  },
  hostelStatsText: {
    fontSize: 15,
    padding: 4,
    color: '#E3E3E3',
  },
  logOutButtonContainer : {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  }
});
