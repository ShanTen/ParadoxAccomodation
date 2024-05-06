import { StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Image } from 'expo-image';
import {useState, useEffect} from 'react';
import {Link, useNavigation } from 'expo-router';
import { getValueFor } from '../../ExpoStoreUtils';
import {Picker} from '@react-native-picker/picker';
import axios from 'axios'
import apiRoute from '../../apiRoute'
import Title from '../CommonComponents/PageTitle';

function StudentProfilePicture({url} : {url: string}){
  return (
    <Image 
    source={{uri: url}} 
    style={{width: 40, height: 40, borderRadius: 40/2}} 
    />
  )
}

function UpcomingStudent({ id, name } : {id: string, name: string}) {
  const [opacity] = useState(new Animated.Value(1));
  const [roomNumber, setRoomNumber] = useState(Math.floor(Math.random()* 1000));

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
        <Text style={{...styles.studentText, marginLeft: 'auto'}}>
          {roomNumber}
        </Text>
      </Animated.View>
    </Pressable>
  );
}


export default function TabOneScreen() {
    const navigation = useNavigation();
    const [token, setToken] = useState("");
    const [upcomingStudents, setUpcomingStudents] = useState([]);
    const [selectedHostelID, setSelectedHostelID] = useState(null);
    const [selectedHostelName, setSelectedHostelName] = useState("");
    const [authorizedHostelsObject, setAuthorizedHostelsObject] = useState({});

    useEffect(() => { 
        navigation.addListener('beforeRemove', (e) => {
            e.preventDefault();
            console.log('onback');
            // Do your stuff here
            getValueFor('logout').then((value : any) => {
                if (value === 'yes') {
                    navigation.dispatch(e.data.action);
                }
            }).catch((err : any) => {
                console.log(err);
                console.log("Ignore the above error, someone tried going back when they shouldn't have.")
            });
        });

        getValueFor('token').then((_token : any) => {
            let headers = {Authorization : `Bearer ${_token}`}
            setToken(_token);
            axios.get(`${apiRoute}/accommodation/volunteer/profile/`, {headers}).then(
                response => {
                    let {hostels} = response.data;
                    console.log(hostels)
                    let initialID = hostels[0].id;
                    setSelectedHostelID(initialID);
                    setAuthorizedHostelsObject(hostels);
                }
            ).catch((err : any) => {console.log(err)}); 

            
        // axios.get(`${apiRoute}/accommodation/hostel/upcoming/${hostelID}`, {headers: headers}).then((res : any) => {
        //     console.log(`All students in hostel ${hostelID}`)
        //     console.log(res.data);
        //     setUpcomingStudents(res.data);
        //   })
        
        }).catch((err : any) => {
        console.log("Error while fetching token from store...")
        console.log(err);
      })

    }, []);

    useEffect(()=>{}, [selectedHostelID])

  return (
    <View style={styles.container}>
      <Title value='Upcoming Students'/>
      <Link href="/(tabs)" />
      <ScrollView style={styles.studentsDisplayContainer}>
        {/* {Array.from(Array(30).keys()).map((i) => (
          <UpcomingStudent key={i} id={i.toString()} name={`Student ${i}`} />
        ))} */}
        <View style = {styles.pickerContainer}>
          <Picker
            style = {styles.pickerStyle}
            selectedValue={selectedHostelName}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedHostelID(Number(itemValue))
            }>
            <Picker.Item label="Saraswati" value="1" />
            <Picker.Item label="Ganga" value="2" />
          </Picker>
        </View>
        {upcomingStudents.map((v : any, i) => (
          <UpcomingStudent 
            key={i} 
            id={v["email"].split("@")[0]} 
            name={v["name"]} 
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
