
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
    const [email, setEmail] = useState<string | undefined>(undefined);
    const [token, setToken] = useState<string | undefined>(undefined);

    const handleRollNumberSubmit = async () => {
        console.log(`Roll Number ${email}`)
        // make API call to validate roll number here
        // Validation of QR is another pain, handle it later today 
        // if valid, navigate to HandleSupplies screen and set the parameter to value returned (QRid) 
        // navigation.navigate('HandleSupplies', { rollNumber });
        try{
            let QRid = (await (axios.get(`${apiRoute}/accommodation/student/${email}/`, {headers: {Authorization: `Bearer ${token}`}}))).data;
            navigation.navigate('HandleSupplies', { QRid : QRid.code });
        }
        catch(err){
            console.log(err);
            alert("Email invalid, please check and try again.");
            return;
        }
    }

    useEffect(() => {

        getValueFor('token').then((_token) => {
            setToken(_token);
        }).catch((err) => {
            console.log("Error while fetching token from store...")
            console.log(err);
        })

    }, []);

    return <View style={styles.container}>
        <Text style={styles.headerText}>Enter Student Email</Text>
        <TextInput
            style={styles.input}
            onChangeText={text => setEmail(text)}
            value={email}
            placeholder="Ex: 20f3000001@ds.study.iitm.ac.in"
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