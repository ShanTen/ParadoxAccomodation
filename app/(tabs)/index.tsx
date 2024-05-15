import { StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Image } from 'expo-image';
import { useState, useEffect } from 'react';
import { Link, useNavigation } from 'expo-router';
import { getValueFor } from '../../ExpoStoreUtils';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios'
import apiRoute from '../../apiRoute'
import Title from '../CommonComponents/PageTitle';

function StudentProfilePicture({ url }: { url: string }) {
  return (
    <Image
      source={{ uri: url }}
      style={{ width: 40, height: 40, borderRadius: 40 / 2 }}
    />
  )
}

function UpcomingStudent({ id, name, roomNumber }: { id: string, name: string, roomNumber: number | undefined }) {
  const [opacity] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.timing(opacity, {
      toValue: 0.5,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
    console.log(`Student ${id} clicked`);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ ...styles.upcomingStudentPressable }}>
      <Animated.View style={{ ...styles.studentContainer, opacity }}>
        <StudentProfilePicture url={`https://ui-avatars.com/api/?name=${name}&background=1a1a00&color=ffffff`} />
        <Text id={id.toString()} style={styles.studentText}>
          {name}
        </Text>

        {(roomNumber) && <Text style={{ ...styles.studentText, marginLeft: 'auto' }}>
          {roomNumber}
        </Text>}
      </Animated.View>
    </Pressable>
  );
}


export default function TabOneScreen() {
  const navigation = useNavigation();

  const [token, setToken] = useState<string | null>(null);
  const [upcomingStudents, setUpcomingStudents] = useState<any[]>();
  const [assignedHostels, setAssignedHostels] = useState<any>();

  const [selectedHostelID, setSelectedHostelID] = useState<number | null>(null);
  const [selectedHostelName, setSelectedHostelName] = useState<string | null>(null);

  useEffect(() => {
    navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      console.log('onback');
      // Do your stuff here
      getValueFor('logout').then((value: any) => {
        if (value === 'yes') {
          navigation.dispatch(e.data.action);
        }
      }).catch((err: any) => {
        console.log(err);
        console.log("Ignore the above error, someone tried going back when they shouldn't have.")
      });
    });

    getValueFor('token').then((_token: any) => {
      let headers = { Authorization: `Bearer ${_token}` }
      setToken(_token);
      axios.get(`${apiRoute}/accommodation/volunteer/profile/`, { headers }).then(
        response => {
          let { hostels } = response.data;
          let initialID = hostels[0].id;
          setSelectedHostelID(initialID);
          setAssignedHostels(hostels); //array of objects
        }
      ).catch((err: any) => {
        console.log("Error while fetching profile details...");
        console.log(err)
      }
      );


    }).catch((err: any) => {
      console.log("Error while fetching token from store...")
      console.log(err);
    })

  }, []);

  //make request here to get upcoming students
  useEffect(() => {
    if (!token || !selectedHostelID || !assignedHostels) {
      return;
    }

    let headers = { Authorization: `Bearer ${token}` };
    axios.get(`${apiRoute}/accommodation/hostel/upcoming/${selectedHostelID}`, { headers }).then(
      response => {
        setUpcomingStudents(response.data);
      }
    ).catch((err: any) => {
      console.log("Error while fetching upcoming students...");
      console.log(err);
    });


  }, [selectedHostelID])

  return (
    <View style={styles.container}>
      <Title value='Upcoming Students' />
      <ScrollView style={styles.studentsDisplayContainer}>
        {/* {Array.from(Array(30).keys()).map((i) => (
          <UpcomingStudent key={i} id={i.toString()} name={`Student ${i}`} />
        ))} */}
        {/* <View style = {styles.pickerContainer}>

          <Picker
            style = {styles.pickerStyle}

            selectedValue={selectedHostelName}
            onValueChange={(itemValue) => setSelectedHostelID(itemValue)}>

            {assignedHostels && assignedHostels.map((v : any, i : number) => (
              <Picker.Item key={i} label={v["name"]} value={v["id"]} />
            ))}
          </Picker>

        </View> */}

        {(assignedHostels) && <View style={{
          margin: 10,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
          borderWidth: 5,
          borderColor: '#1E1E1E',
          borderRadius: 5
        }}>
          <Picker style={{ width: '100%', backgroundColor: '#1E1E1E', color: 'white' }}
            selectedValue={selectedHostelID}
            onValueChange={(itemIndex) => setSelectedHostelID(itemIndex)}
            dropdownIconColor='white'
          >
            {(assignedHostels) && assignedHostels.map((hostel: any) => {
              return <Picker.Item label={hostel.name} value={hostel.id} key={hostel.id} />
            })}
          </Picker>
        </View>}


        {upcomingStudents && upcomingStudents.map((v: any, i) => (
          <UpcomingStudent
            key={i}
            id={v["email"].split("@")[0]}
            name={v["name"]}
            roomNumber={v["roomNumber"] || undefined}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    height: 1,
    width: '80%',
  },
  studentText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 10,
  },
  studentContainer: {
    marginVertical: 5,
    backgroundColor: 'lightgrey',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    borderBlockColor: 'black',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentsDisplayContainer: {
    width: '90%',
  },
  upcomingStudentPressable: {
    width: '100%',
  },
  pickerStyle: {
    width: '100%',
    backgroundColor: 'lightgrey',
  },
  pickerContainer: {
    width: '90%',
    backgroundColor: 'lightgrey',
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 10,
  }


});
