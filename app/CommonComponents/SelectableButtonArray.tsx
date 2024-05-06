import { ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import Checkbox from 'expo-checkbox';


function SupplyEntry({item , handleChange} : {item: {id: number, txt: string, isChecked: boolean, isDisabled?: boolean}, handleChange: any}){
    return <View
        style={{
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap:10,
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
            disabled={item.isDisabled || false}
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

function SupplyEntryDisplay({supplies, handleChange} : {supplies: any, handleChange: any}){
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
            supplies.map((item : any) => {
                return (<SupplyEntry key={item.id} item={item} handleChange={handleChange}/>)
            }) //end of map
        }
    </ScrollView>

}

export default SupplyEntryDisplay;