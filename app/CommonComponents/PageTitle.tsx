import { Text, View } from '@/components/Themed';

export default function Title({value}: {value: string}){
  return (
    <>
      <Text style={{
        marginTop: 60,
        fontSize: 20,
        fontWeight: 'bold',}}
      >
        {value}
      </Text>
      <View style={{
        marginVertical: 1,
        height: 1,
        width: '80%',
        }} 
        lightColor="#eee" 
        darkColor="rgba(255,255,255,0.1)" 
      />
    </>
  )
}