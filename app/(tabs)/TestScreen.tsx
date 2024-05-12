import { StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useState, useEffect } from 'react';
import { Link, useNavigation } from 'expo-router';
import { getValueFor } from '../../ExpoStoreUtils';
import { ButtonAnimatedWithChild } from '../CommonComponents/ButtonAnimated';
import SupplyDisplay from '../CommonComponents/SelectableButtonArray';

import { Picker } from '@react-native-picker/picker';

import axios from 'axios';
import apiRoute from '../../apiRoute';
import Checkbox from 'expo-checkbox';

function Title() {
    return (
        <Text style={Styles.title}>Test Screen</Text>
    )
}

const initialState = [
    { id: 1, txt: 'first check', isChecked: false },
    { id: 2, txt: 'second check', isChecked: false },
    { id: 3, txt: 'third check', isChecked: false },
    { id: 4, txt: 'fourth check', isChecked: false },
    { id: 5, txt: 'fifth check', isChecked: false },
    { id: 6, txt: 'sixth check', isChecked: false },
    { id: 7, txt: 'seventh check', isChecked: false },
]


const supplyState = [
    {
        "Item Name": "pillow",
        "Item ID": 1,
        "isProvided": false,
        "isReturned": false
    },
    {
        "Item Name": "mattress",
        "Item ID": 2,
        "isProvided": false,
        "isReturned": false
    }
]

function SupplyEntry({ item, handleChange }: { item: { id: number, txt: string, isChecked: boolean }, handleChange: any }) {
    return <View
        style={{
            flexDirection: 'row',
            flex: 1,
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 10,
            marginVertical: 2,
            marginLeft: 10,
            marginRight: 10,
            marginTop: 5,
            backgroundColor: '#1E1E1E',
        }}>
        <Checkbox
            style={{
                width: 30,
                height: 30,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 4,
                borderWidth: 2,
                borderColor: 'coral',
                backgroundColor: 'transparent',
            }}
            value={item.isChecked}
            onValueChange={() => handleChange(item.id)}
        />
        <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'left',

        }}>
            {item.txt}
        </Text>
    </View>
}

function SupplyEntryDisplay({ supplies, handleChange }: { supplies: any, handleChange: any }) {
    return <ScrollView
        style={
            {
                width: '90%',
                backgroundColor: '#1E1E1E',
                borderRadius: 10,
                paddingVertical: 10,
            }} //end of style
    >
        {
            supplies.map((item: any) => {
                return (<SupplyEntry key={item.id} item={item} handleChange={handleChange} />)
            }) //end of map
        }
    </ScrollView>

}

export default function TestScreen() {
    const [supplies, setSupplies] = useState<any>([]);
    const [selectedLanguage, setSelectedLanguage] = useState('java');

    useEffect(() => {
        getValueFor('token').then(async (token) => {
            let headers = {
                "Authorization": `Bearer ${token}`
            }

            let studentID = 2

            try {
                let response = await axios.get(`${apiRoute}/accommodation/student/${studentID}/supply/status`, { headers: headers })
                let data = response.data;
                let supplyData = data.map((item: any) => {
                    return {
                        id: item["Item ID"],
                        txt: item["Item Name"],
                        isChecked: false,
                    }
                })
                setSupplies(supplyData);

            } catch (error) {
                console.log("An error occurred while fetching supplies")
                console.log(error)

            }
        });
    }, [])


    useEffect(() => {
        if (supplies.length === 0) {
            return;
        }
        let selected = supplies.filter((supplies: any) => supplies.isChecked)
        console.log(selected)
    },
        [supplies])

    const handleChange = (id: number) => {
        console.log(`ID ${id} was smashed`)
        let temp = supplies.map(((supply: any) => {
            if (id === supply.id) {
                return { ...supply, isChecked: !supply.isChecked }
            }
            return supply;
        }))
        setSupplies(temp);
    }

    return (
        <View style={Styles.container}>
            <Title />
            <Link href="/(tabs)/TestScreen" />
            <SupplyDisplay supplies={supplies} handleChange={handleChange} />
            <Text>
                The selected items are {'['}{supplies.filter((supply: any) => supply.isChecked).map((supply: any) => supply.txt).join(', ')}{']'}
            </Text>
            <View style = {
                {
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#FAF9F6',
                    borderWidth: 2, 
                    borderColor: '#FAF9F6', 
                    borderRadius: 4 
                }
            }>
            <Picker
                style={
                    {
                        width: '50%',
                        backgroundColor: '#FAF9F6',
                        margin: 2
                    }
                }

                selectedValue={selectedLanguage}
                onValueChange={(itemValue, itemIndex) =>
                    setSelectedLanguage(itemValue)
                }>
                <Picker.Item label="Java" value="java" />
                <Picker.Item label="JavaScript" value="js" />
            </Picker>
            </View>

            <Text>
                The selected language is {selectedLanguage}
            </Text>

        </View>
    );
}

const Styles = StyleSheet.create({
    container: {
        flex: 0,
        alignItems: 'center',
        flexDirection: 'column',
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
        backgroundColor: 'grey',
    },
    Text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
        marginLeft: 10,
    },
});