import { Text, View } from '@/components/Themed';

type TitleProps = {
  value: string,
  TextStyle?: any,
  LineStyle?: any, //Put bottom margin here
}

export default function Title({value, TextStyle, LineStyle}: TitleProps){
  return (
    <>
      <Text style={{
        marginTop: 50,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        ...TextStyle
      }}
      >
        {value}
      </Text>
      <View style={{
        marginVertical: 1,
        height: 1,
        width: '80%',
        backgroundColor: 'grey',
        ...LineStyle
        }}
      />
    </>
  )
}