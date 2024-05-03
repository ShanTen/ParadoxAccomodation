import { StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Image } from 'expo-image';
import {useState, useEffect} from 'react';
import {Link, useNavigation } from 'expo-router';
import { getValueFor } from '../../ExpoStoreUtils';

function Title(){
  return (
    <Text style={styles.title}>Upcoming Students</Text>
  )
}

// https://ui-avatars.com/api/?name=Student+1&?background=000000&color=0D8ABC

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
    }, []);

  return (
    <View style={styles.container}>
      <Title />
      <Link href="/(tabs)" />
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <ScrollView style={styles.studentsDisplayContainer}>
        {Array.from(Array(30).keys()).map((i) => (
          <UpcomingStudent key={i} id={i.toString()} name={`Student ${i}`} />
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

  
});
