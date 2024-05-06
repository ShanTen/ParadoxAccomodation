// Profile Bar Display

/*
Parts:  
    - Heading with "PROFILE" (bold)
    - Profile Picture
    - Profile Name
    - Unique ID
*/

import { StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Image } from 'expo-image';

export default function ProfileBar({profilePicture, profileName, uniqueID} : {profilePicture: string, profileName: string, uniqueID: string}) {
    return <View style={Styles.container}>
        <Image 
            source={{uri: profilePicture}} 
            style={Styles.profilePicture} 
        />
        <Text style={Styles.profileName}>{profileName}</Text>
        <Text style={Styles.uniqueID}>{uniqueID}</Text>
    </View>
}

const Styles = StyleSheet.create({
    container: {
        flex: 0,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        width: '90%',
        backgroundColor: '#1E1E1E',
        borderRadius: 10,
    },
    title: {
        fontSize: 20,
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
    profilePicture: {
        width: 80,
        height: 80,
        borderRadius: 80/2
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#E3E3E3',
    },
    uniqueID: {
        fontSize: 15,
        color: '#E3E3E3',
    }
});