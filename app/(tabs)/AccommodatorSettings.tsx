/*
  I dont know why I didnt just name this file "VolunteerDetails.tsx" 
  instead of "AccommodatorSettings.tsx"

  Dont program when you're tired kids.
*/

import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { ButtonAnimatedWithChild } from '../CommonComponents/ButtonAnimated';
import ProfileBar from '../CommonComponents/ProfileBar';
import Title from '../CommonComponents/PageTitle';
import axios from 'axios';
import apiRoute from '../../apiRoute';
import { save, getValueFor } from '../../ExpoStoreUtils';
import { Toast } from 'toastify-react-native'
import { Picker } from '@react-native-picker/picker';


type HostelDetailsType = {
  id: number,
  name: string,
  studentsCheckedIn: number,
  studentsCheckedOut: number,
  pending: number
}

function HostelDetails({ name, studentsCheckedIn, studentsCheckedOut, pending }: HostelDetailsType) {
  return (
    <View style={Styles.hostelStatsContainer}>
      <Text style={Styles.hostelStatsTitle}>Stats For {name}</Text>
      <Text style={Styles.hostelStatsText}>Students checked in: {studentsCheckedIn}</Text>
      <Text style={Styles.hostelStatsText}>Students checked out: {studentsCheckedOut}</Text>
      <Text style={Styles.hostelStatsText}>Pending: {pending}</Text>
    </View>
  )
}

const turnArrayOfKVintoObject = (array: { name: string, id: any }[]) => {
  let returnObj: any = {};
  for (let i = 0; i < array.length; i++) {
    returnObj[array[i].id] = array[i].name;
  }
  return returnObj;
}

const getUniqueID = (email: string): string => {
  return email.split('@')[0];
}

const getProfilePicture = (name: string): string => {
  return `https://ui-avatars.com/api/?name=${name.split(' ').join('+')}&?background=000000&color=0D8ABC&?format=svg?size=256`
}

export default function AccommodatorScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [allHostels, setAllHostels] = useState<any>();
  const [volunteerDetails, setVolunteerDetails] = useState({
    name: "Ashok Kumar",
    email: "20f1000001 @ds.study.iitm.ac.in",
    assignedHostels: [],
  });
  //state of currently selected hostel 
  const [hostelDetails, setHostelDetails] = useState<HostelDetailsType | null>(null);
  const [selectedHostelID, setSelectedHostelID] = useState<number | null>(0);

  /*
    What is volunteer details?
      x - id (not to be confused with uniqueID) [Dont even have the value in API end point lol]
      - Volunteer's name
      -email
      - Consists of what hostels the volunteer is assigned to => Hostel ID Array => assignedHostels
      x - Volunteer's profile picture [removed because it is derived property]
      x - Unique ID of the volunteer (Unique ID is the email ID without the domain name) --> make this email only
      
    => Volunteer details are fetched once at page init

    What is hostel details? > It is The drop down selected hostel
      - id (hostelID)
      - name
      - totalStudents
      - studentsCheckedIn
      X - studentsNotCheckedIn [derived property]
  */

  //request to get hostel details for some <id> and <name> .. why name? => because its convenient and I dont have to search another object again bro come on pleaselet me write less code by employing bad practices this once, Ive done it all my life 
  const getAndSetHostelDetails = async (hostelID: number, hostelName: string) => {

    let headers  = { Authorization: `Bearer ${token}` }
    let data = (await axios.get(`${apiRoute}/accommodation/hostel/stats/${hostelID}`, {headers})).data; //might need trailing slash
    let studentsCheckedIn = data["checked_in"].length;
    let studentsCheckedOut = data["checked_out"].length;
    let pending = data["pending"].length;
    let totalStudents = studentsCheckedIn + studentsCheckedOut + pending; //-- unused

    setHostelDetails({
      id: hostelID,
      name: hostelName,
      pending,
      studentsCheckedIn,
      studentsCheckedOut,
    });

  }

  useEffect(() => {
    //change hostel details when selectedHostelID changes
    if (token && selectedHostelID && allHostels)
      getAndSetHostelDetails(selectedHostelID, allHostels[selectedHostelID])
  }, [selectedHostelID])

  useEffect(() => {
    getValueFor('token').then(async (token) => {
      setToken(token);

      try {
        let headers = { Authorization: `Bearer ${token}` }
        let volunteerDetails_response = (await axios.get(`${apiRoute}/accommodation/volunteer/profile/`, { headers })).data;

        let volunteerAssignedHostels = volunteerDetails_response["hostels"]

        let bufferVolunteerDetails = {
          name: volunteerDetails_response["name"],
          email: volunteerDetails_response["email"],
          assignedHostels: volunteerAssignedHostels,
          profilePicture: getProfilePicture(volunteerDetails_response["name"]),
          uniqueID: getUniqueID(volunteerDetails_response["email"]),
        } 

        setVolunteerDetails(bufferVolunteerDetails);

        let allHostels_response = (await axios.get(`${apiRoute}/accommodation/hostel/all`, { headers })).data;
        setAllHostels(turnArrayOfKVintoObject(allHostels_response));

        //first index of assigned hostels is selected by default
        let hostelDetails_response = (await axios.get(`${apiRoute}/accommodation/hostel/stats/${volunteerAssignedHostels[0].id}`, { headers })).data;

        setHostelDetails({
          id: volunteerAssignedHostels[0].id,
          name: volunteerAssignedHostels[0].name,
          pending: hostelDetails_response["pending"].length,
          studentsCheckedIn: hostelDetails_response["checked_in"].length,
          studentsCheckedOut: hostelDetails_response["checked_out"].length,
        });

        setSelectedHostelID(volunteerAssignedHostels[0].id);

      }
      catch (e) {
        console.log(e);
        Toast.error('An error occurred while fetching volunteer details', 'Top');
      }


    })
  }, []) // end of useEffect for []


  const logout = async () => {
    try {
      await save('logout', 'yes');
      router.navigate('/');
    }
    catch (e) {
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
        profileName={volunteerDetails.name}
        profilePicture={getProfilePicture(volunteerDetails.name)}
        uniqueID={getUniqueID(volunteerDetails.email)}>
      </ProfileBar>

      {(volunteerDetails) && <View style = {{
                    margin: 10,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    borderWidth: 5, 
                    borderColor: '#1E1E1E', 
                    borderRadius: 5 
                }}>
        <Picker style={{width: '95%',backgroundColor: '#1E1E1E', color: 'white'}}
        selectedValue = {selectedHostelID}
        onValueChange = {(itemIndex) => setSelectedHostelID(itemIndex)}
        dropdownIconColor = 'white'
        >
          {(volunteerDetails.assignedHostels) && volunteerDetails.assignedHostels.map((hostel: any) => {
              return <Picker.Item label={hostel.name} value={hostel.id} key={hostel.id} />
            })}
        </Picker>
      </View>}


      {hostelDetails && <HostelDetails
        id={hostelDetails.id}
        name={hostelDetails.name}
        pending={hostelDetails.pending}
        studentsCheckedOut={hostelDetails.studentsCheckedOut}
        studentsCheckedIn={hostelDetails.studentsCheckedIn}
      >
      </HostelDetails>}

      <View style={Styles.logOutButtonContainer}>
        <ButtonAnimatedWithChild
          child={<Text style={{ color: 'white' }}>Log out</Text>}
          onPress={logout}
          style={null}
          animatedViewStyle={{ backgroundColor: '#9a0612' }}
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
  logOutButtonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  }
});
