
/*
    Alternate Screen if the user wants to enter
    the student's roll number instead of scanning the QR 
*/

import { StyleSheet , TextInput } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useState, useEffect } from 'react';
import axios from 'axios';
import apiRoute from '../../apiRoute';
import { getValueFor } from '../../ExpoStoreUtils';
import { ButtonAnimatedWithLabel } from '../CommonComponents/ButtonAnimated';

export default function ScreenBypassQR({ route, navigation }: { route: any, navigation: any }){

    //Words cannot describe how  much this code wants to make me gouge my eyes out 
    const [rollNumber, setRollNumber] = useState<string | undefined>(undefined);

    const handleRollNumberSubmit = () => {
        console.log(`Roll Number ${rollNumber}`)
        // make API call to validate roll number here
        // Validation of QR is another pain, handle it later today 
        // if valid, navigate to HandleSupplies screen and set the parameter to value returned (QRid) 
        // navigation.navigate('HandleSupplies', { rollNumber });
        navigation.navigate('HandleSupplies', { QRid: "1NEED2P1$$"});
    }

    return <View style={styles.container}>
        <Text style={styles.headerText}>Enter Roll Number</Text>
        <TextInput
            style={styles.input}
            onChangeText={text => setRollNumber(text)}
            value={rollNumber}
            placeholder="Example: 20f3000001"
            placeholderTextColor="grey"
        />
        <ButtonAnimatedWithLabel
            onPress={handleRollNumberSubmit}
            label="Submit"
            style={styles.button}
            animatedViewStyle={{ backgroundColor: 'green' }}
        />
    </View>
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        margin: 10,
    },
    input: {
        width: 320,
        height: 40,
        borderColor: 'white',
        color: 'white',
        borderWidth: 1,
        margin: 5,
        padding: 5,
        fontSize: 16,
        borderRadius: 5,
        marginBottom: 15,
    },
    button: {
        margin: 10,
    },
});